import RSSParser from 'rss-parser';
import axios from 'axios';
import { load } from 'cheerio';
import { SourceValidator, ValidatedSource } from './sourceValidator';
import { log } from '../utils/logger';

export interface Article {
  title: string;
  url: string;
  content?: string;
  summary?: string;
  publishedAt: Date;
  sourceDomain: string;
  author?: string;
  rawContent?: string;
}

export interface AggregationResult {
  articles: Article[];
  sources: ValidatedSource[];
  errors: string[];
}

const rssParser = new RSSParser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Sifter Content Aggregator 1.0'
  }
});

export class ContentAggregator {
  private static readonly USER_AGENT = 'Sifter Content Aggregator 1.0';
  private static readonly TIMEOUT = 15000;

  static async aggregateContent(
    sources: string[],
    sinceDate?: Date,
    maxArticlesPerSource: number = 10
  ): Promise<AggregationResult> {
    const result: AggregationResult = {
      articles: [],
      sources: [],
      errors: []
    };

    try {
      // Validate sources first
      log(`Validating ${sources.length} sources`);
      result.sources = await SourceValidator.validateSources(sources);
      
      const validSources = result.sources.filter(s => s.isValid);
      log(`Found ${validSources.length} valid sources out of ${sources.length}`);

      // Aggregate content from each valid source
      for (const source of validSources) {
        try {
          const articles = await this.aggregateFromSource(source, sinceDate, maxArticlesPerSource);
          result.articles.push(...articles);
          log(`Aggregated ${articles.length} articles from ${source.domain}`);
        } catch (error) {
          const errorMsg = `Failed to aggregate from ${source.url}: ${error}`;
          log(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      // Remove duplicates by URL
      result.articles = this.deduplicateArticles(result.articles);
      
      // Sort by publication date (newest first)
      result.articles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

      log(`Content aggregation complete: ${result.articles.length} unique articles`);
      return result;

    } catch (error) {
      const errorMsg = `Content aggregation failed: ${error}`;
      log(errorMsg);
      result.errors.push(errorMsg);
      return result;
    }
  }

  private static async aggregateFromSource(
    source: ValidatedSource,
    sinceDate?: Date,
    maxArticles: number = 10
  ): Promise<Article[]> {
    if (source.type === 'rss' && source.feedUrl) {
      return this.aggregateFromRSS(source.feedUrl, source.domain, sinceDate, maxArticles);
    } else {
      return this.aggregateFromWebsite(source.url, source.domain, sinceDate, maxArticles);
    }
  }

  private static async aggregateFromRSS(
    feedUrl: string,
    domain: string,
    sinceDate?: Date,
    maxArticles: number = 10
  ): Promise<Article[]> {
    try {
      const feed = await rssParser.parseURL(feedUrl);
      const articles: Article[] = [];

      for (const item of feed.items.slice(0, maxArticles)) {
        if (!item.title || !item.link) continue;

        const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
        
        // Skip articles older than sinceDate
        if (sinceDate && publishedAt <= sinceDate) continue;

        // Get full content if available
        let content = item.content || item.contentSnippet || item.summary || '';
        let summary = item.contentSnippet || '';

        // If content is too short, try to fetch full article
        if (content.length < 200 && item.link) {
          try {
            const fullContent = await this.extractFullContent(item.link);
            if (fullContent) {
              content = fullContent;
              summary = this.generateSummary(fullContent);
            }
          } catch (error) {
            log(`Failed to extract full content from ${item.link}: ${error}`);
          }
        }

        articles.push({
          title: item.title,
          url: item.link,
          content,
          summary,
          publishedAt,
          sourceDomain: domain,
          author: item.creator || item['dc:creator'] || undefined,
          rawContent: content
        });
      }

      return articles;
    } catch (error) {
      throw new Error(`RSS parsing failed: ${error}`);
    }
  }

  private static async aggregateFromWebsite(
    url: string,
    domain: string,
    sinceDate?: Date,
    maxArticles: number = 10
  ): Promise<Article[]> {
    try {
      const response = await axios.get(url, {
        timeout: this.TIMEOUT,
        headers: { 'User-Agent': this.USER_AGENT },
        maxRedirects: 5
      });

      const $ = load(response.data);
      const articles: Article[] = [];

      // Extract article links (this is a basic implementation)
      const articleLinks = this.extractArticleLinks($, url);

      for (const link of articleLinks.slice(0, maxArticles)) {
        try {
          const articleContent = await this.extractFullContent(link);
          if (articleContent) {
            const title = this.extractTitleFromContent(articleContent) || 'Untitled';
            const summary = this.generateSummary(articleContent);

            articles.push({
              title,
              url: link,
              content: articleContent,
              summary,
              publishedAt: new Date(), // We can't easily determine publish date from scraping
              sourceDomain: domain,
              rawContent: articleContent
            });
          }
        } catch (error) {
          log(`Failed to extract content from ${link}: ${error}`);
          continue;
        }
      }

      return articles;
    } catch (error) {
      throw new Error(`Website scraping failed: ${error}`);
    }
  }

  private static extractArticleLinks($: any, baseUrl: string): string[] {
    const links: Set<string> = new Set();
    
    // Look for article links in common selectors
    const selectors = [
      'article a[href]',
      '.article a[href]',
      '.post a[href]',
      '.entry a[href]',
      'h1 a[href]',
      'h2 a[href]',
      'h3 a[href]',
      '[class*="title"] a[href]',
      '[class*="headline"] a[href]'
    ];

    for (const selector of selectors) {
      $(selector).each((_: number, element: any) => {
        const href = $(element).attr('href');
        if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
          try {
            const fullUrl = new URL(href, baseUrl).toString();
            links.add(fullUrl);
          } catch {
            // Skip invalid URLs
          }
        }
      });
    }

    return Array.from(links).slice(0, 20); // Limit to prevent too many requests
  }

  private static async extractFullContent(url: string): Promise<string | null> {
    try {
      const response = await axios.get(url, {
        timeout: this.TIMEOUT,
        headers: { 'User-Agent': this.USER_AGENT },
        maxRedirects: 5
      });

      const $ = load(response.data);

      // Remove unwanted elements
      $('script, style, nav, header, footer, aside, .ads, .advertisement').remove();

      // Try to find main content
      let content = '';
      const contentSelectors = [
        'article',
        '.article-content',
        '.post-content',
        '.entry-content',
        '.content',
        'main',
        '[class*="content"]',
        '.story-body'
      ];

      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0 && element.text().trim().length > content.length) {
          content = element.text().trim();
        }
      }

      // Fallback to body if no specific content found
      if (!content || content.length < 100) {
        content = $('body').text().trim();
      }

      // Clean up whitespace
      content = content.replace(/\s+/g, ' ').trim();

      return content.length > 50 ? content : null;
    } catch (error) {
      return null;
    }
  }

  private static extractTitleFromContent(content: string): string {
    // Simple title extraction - take first sentence or up to 100 chars
    const sentences = content.split(/[.!?]+/);
    const firstSentence = sentences[0]?.trim();
    
    if (firstSentence && firstSentence.length <= 100) {
      return firstSentence;
    }
    
    return content.substring(0, 100).trim() + '...';
  }

  private static generateSummary(content: string, maxLength: number = 300): string {
    // Simple summary generation - take first few sentences up to maxLength
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let summary = '';
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (summary.length + trimmed.length + 1 <= maxLength) {
        summary += (summary ? '. ' : '') + trimmed;
      } else {
        break;
      }
    }
    
    return summary + (summary.endsWith('.') ? '' : '.');
  }

  private static deduplicateArticles(articles: Article[]): Article[] {
    const seen = new Set<string>();
    return articles.filter(article => {
      const key = article.url.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}