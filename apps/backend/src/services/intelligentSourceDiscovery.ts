import axios from 'axios';
import { load } from 'cheerio';
import { SourceValidator } from './sourceValidator';
import { log } from '../utils/logger';

export interface IntelligentSource {
  url: string;
  title: string;
  type: 'rss' | 'website';
  relevanceScore: number;
  description: string;
  domain: string;
  recentArticles?: {
    title: string;
    url: string;
    excerpt: string;
    publishedAt?: Date;
  }[];
}

export class IntelligentSourceDiscovery {
  private static readonly USER_AGENT = 'Mozilla/5.0 (compatible; SifterBot/1.0)';
  private static readonly TIMEOUT = 15000;

  static async discoverSources(
    topic: string, 
    maxSources: number = 8
  ): Promise<IntelligentSource[]> {
    try {
      log(`Intelligent source discovery for topic: ${topic}`);
      
      const discoveredSources: IntelligentSource[] = [];
      
      // Step 1: Search for actual websites covering this topic
      const searchResults = await this.searchForTopicSources(topic);
      log(`Found ${searchResults.length} potential sources from web search`);
      
      // Step 2: Analyze each source for quality and relevance
      const analyzedSources = await this.analyzeSourcesInBatches(searchResults, topic);
      log(`Analyzed sources, ${analyzedSources.length} passed quality checks`);
      
      // Step 3: Find RSS feeds and verify content freshness
      const enrichedSources = await this.enrichWithRSSAndContent(analyzedSources, topic);
      log(`Enriched sources with RSS feeds and content verification`);
      
      // Step 4: Score and rank sources
      const scoredSources = this.scoreAndRankSources(enrichedSources, topic);
      
      return scoredSources
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxSources);
        
    } catch (error) {
      log(`Error in intelligent source discovery: ${error}`);
      // Fallback to curated sources if web search fails
      return this.getFallbackSources(topic);
    }
  }

  private static async searchForTopicSources(topic: string): Promise<{url: string, title: string, snippet: string}[]> {
    const sources: {url: string, title: string, snippet: string}[] = [];
    
    try {
      // Strategy 1: Search for news and articles about the topic
      const searchQueries = [
        `${topic} news RSS feed`,
        `${topic} latest news`,
        `${topic} blog RSS`,
        `best ${topic} news sources`,
        `${topic} technology news`
      ];
      
      for (const query of searchQueries.slice(0, 3)) {
        const results = await this.performWebSearch(query);
        sources.push(...results);
        
        // Add delay between searches to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Remove duplicates
      const uniqueSources = sources.filter((source, index, self) => 
        index === self.findIndex(s => s.url === source.url)
      );
      
      return uniqueSources.slice(0, 20); // Limit initial results
      
    } catch (error) {
      log(`Error in web search: ${error}`);
      return [];
    }
  }

  private static async performWebSearch(query: string): Promise<{url: string, title: string, snippet: string}[]> {
    // Note: In a production environment, you'd use a proper search API like:
    // - Google Custom Search API
    // - Bing Search API  
    // - SerpAPI
    // - SearchAPI
    
    // For now, we'll simulate search results and use known high-quality domains
    return this.simulateSearchResults(query);
  }

  private static simulateSearchResults(query: string): {url: string, title: string, snippet: string}[] {
    const topic = query.toLowerCase();
    const results: {url: string, title: string, snippet: string}[] = [];
    
    // High-quality news and tech domains that likely have content on any topic
    const qualityDomains = [
      { domain: 'techcrunch.com', type: 'tech' },
      { domain: 'theverge.com', type: 'tech' },
      { domain: 'arstechnica.com', type: 'tech' },
      { domain: 'wired.com', type: 'tech' },
      { domain: 'reuters.com', type: 'news' },
      { domain: 'bbc.com/news/technology', type: 'news' },
      { domain: 'cnn.com/business/tech', type: 'news' },
      { domain: 'bloomberg.com/technology', type: 'business' },
      { domain: 'forbes.com/technology', type: 'business' },
      { domain: 'nature.com', type: 'science' },
      { domain: 'sciencedaily.com', type: 'science' },
      { domain: 'mit.edu/news', type: 'research' },
      { domain: 'stanford.edu/news', type: 'research' },
      { domain: 'venturebeat.com', type: 'tech' },
      { domain: 'techreview.com', type: 'tech' }
    ];
    
    // Add relevant domains based on topic
    if (topic.includes('ai') || topic.includes('artificial intelligence') || topic.includes('machine learning')) {
      results.push(
        { url: 'https://openai.com/blog', title: 'OpenAI Blog - Latest AI Research', snippet: 'Latest developments in artificial intelligence' },
        { url: 'https://blog.google/technology/ai', title: 'Google AI Blog', snippet: 'Google AI research and developments' },
        { url: 'https://blogs.nvidia.com/blog/category/deep-learning', title: 'NVIDIA AI Blog', snippet: 'Deep learning and AI hardware news' },
        { url: 'https://distill.pub', title: 'Distill - Machine Learning Research', snippet: 'Visual explanations of machine learning concepts' },
        { url: 'https://ai.googleblog.com', title: 'Google AI Research Blog', snippet: 'Latest AI research from Google' }
      );
    }
    
    if (topic.includes('crypto') || topic.includes('blockchain') || topic.includes('bitcoin')) {
      results.push(
        { url: 'https://coindesk.com', title: 'CoinDesk - Bitcoin News', snippet: 'Latest cryptocurrency and blockchain news' },
        { url: 'https://cointelegraph.com', title: 'Cointelegraph', snippet: 'Cryptocurrency news and analysis' },
        { url: 'https://decrypt.co', title: 'Decrypt Media', snippet: 'Crypto news and Web3 insights' },
        { url: 'https://theblock.co', title: 'The Block', snippet: 'Blockchain and crypto research' }
      );
    }
    
    if (topic.includes('startup') || topic.includes('business') || topic.includes('entrepreneur')) {
      results.push(
        { url: 'https://news.ycombinator.com', title: 'Hacker News', snippet: 'Startup and technology news community' },
        { url: 'https://techcrunch.com/startups', title: 'TechCrunch Startups', snippet: 'Startup news and funding rounds' },
        { url: 'https://www.crunchbase.com/news', title: 'Crunchbase News', snippet: 'Startup funding and business news' }
      );
    }
    
    // Add general tech/news sites for any topic
    qualityDomains.forEach(site => {
      results.push({
        url: `https://${site.domain}`,
        title: `${site.domain} - ${topic} coverage`,
        snippet: `Quality ${site.type} coverage including ${topic} topics`
      });
    });
    
    return results.slice(0, 15);
  }

  private static async analyzeSourcesInBatches(
    sources: {url: string, title: string, snippet: string}[], 
    topic: string
  ): Promise<IntelligentSource[]> {
    const validSources: IntelligentSource[] = [];
    const batchSize = 3;
    
    for (let i = 0; i < sources.length; i += batchSize) {
      const batch = sources.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (source) => {
        try {
          return await this.analyzeSource(source, topic);
        } catch (error) {
          log(`Error analyzing source ${source.url}: ${error}`);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      const validBatchResults = batchResults.filter(result => result !== null);
      validSources.push(...validBatchResults);
      
      // Rate limiting between batches
      if (i + batchSize < sources.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return validSources;
  }

  private static async analyzeSource(
    source: {url: string, title: string, snippet: string}, 
    topic: string
  ): Promise<IntelligentSource | null> {
    try {
      // Test if the site is accessible
      const response = await axios.get(source.url, {
        timeout: this.TIMEOUT,
        headers: { 'User-Agent': this.USER_AGENT },
        maxRedirects: 3
      });
      
      if (response.status !== 200) {
        return null;
      }
      
      const $ = load(response.data);
      const domain = new URL(source.url).hostname.replace('www.', '');
      
      // Extract site information
      const siteTitle = $('title').text() || source.title;
      const metaDescription = $('meta[name="description"]').attr('content') || source.snippet;
      
      // Check for recent content related to the topic
      const recentArticles = await this.findRecentTopicContent($, source.url, topic);
      
      // Calculate relevance score based on various factors
      let relevanceScore = 30; // Base score
      
      // Check if content is relevant
      const contentText = `${siteTitle} ${metaDescription}`.toLowerCase();
      const topicKeywords = topic.toLowerCase().split(/\s+/);
      const matchingKeywords = topicKeywords.filter(keyword => 
        contentText.includes(keyword) || 
        recentArticles.some(article => 
          article.title.toLowerCase().includes(keyword) ||
          article.excerpt.toLowerCase().includes(keyword)
        )
      );
      
      relevanceScore += matchingKeywords.length * 15;
      
      // Boost score for domains with recent relevant content
      if (recentArticles.length > 0) {
        relevanceScore += 20;
      }
      
      // Domain authority boost
      if (this.isHighAuthorityDomain(domain)) {
        relevanceScore += 25;
      }
      
      // Must have some relevance to be included
      if (relevanceScore < 40 && recentArticles.length === 0) {
        return null;
      }
      
      return {
        url: source.url,
        title: siteTitle,
        type: 'website',
        relevanceScore: Math.min(100, relevanceScore),
        description: metaDescription,
        domain,
        recentArticles: recentArticles.slice(0, 3) // Keep top 3 recent articles
      };
      
    } catch (error) {
      return null;
    }
  }

  private static async findRecentTopicContent(
    $: any, 
    baseUrl: string, 
    topic: string
  ): Promise<{title: string, url: string, excerpt: string, publishedAt?: Date}[]> {
    const articles: {title: string, url: string, excerpt: string, publishedAt?: Date}[] = [];
    const topicKeywords = topic.toLowerCase().split(/\s+/);
    
    // Look for article links that might be relevant
    const selectors = [
      'article h1 a, article h2 a, article h3 a',
      '.article-title a, .post-title a',
      'h1 a, h2 a, h3 a',
      '.headline a, .title a',
      '[class*="article"] a[href*="/"]',
      '[class*="post"] a[href*="/"]'
    ];
    
    for (const selector of selectors) {
      $(selector).each((_: number, element: any) => {
        const $link = $(element);
        const title = $link.text().trim();
        const href = $link.attr('href');
        
        if (!title || !href || title.length < 10) return;
        
        // Check if title contains topic keywords
        const titleLower = title.toLowerCase();
        const hasRelevantKeywords = topicKeywords.some(keyword => 
          titleLower.includes(keyword)
        );
        
        if (hasRelevantKeywords) {
          try {
            const fullUrl = new URL(href, baseUrl).toString();
            
            // Get excerpt from surrounding content
            const $parent = $link.closest('article, .post, .article, div');
            const excerpt = $parent.find('p, .excerpt, .summary').first().text().trim().slice(0, 200);
            
            articles.push({
              title,
              url: fullUrl,
              excerpt: excerpt || title,
              publishedAt: new Date() // Could try to extract actual date
            });
          } catch (error) {
            // Skip invalid URLs
          }
        }
      });
      
      if (articles.length >= 5) break; // Found enough articles
    }
    
    return articles.slice(0, 5);
  }

  private static async enrichWithRSSAndContent(
    sources: IntelligentSource[], 
    topic: string
  ): Promise<IntelligentSource[]> {
    const enrichedSources: IntelligentSource[] = [];
    
    for (const source of sources) {
      try {
        // Try to find RSS feed for this source
        const validationResults = await SourceValidator.validateSources([source.url]);
        const validation = validationResults[0];
        
        if (validation && validation.isValid) {
          const enrichedSource = {
            ...source,
            type: validation.type as 'rss' | 'website',
            url: validation.feedUrl || validation.url
          };
          
          // Boost RSS feeds
          if (validation.type === 'rss') {
            enrichedSource.relevanceScore += 15;
          }
          
          enrichedSources.push(enrichedSource);
        }
      } catch (error) {
        log(`Error enriching source ${source.url}: ${error}`);
        // Keep original source if enrichment fails
        enrichedSources.push(source);
      }
    }
    
    return enrichedSources;
  }

  private static scoreAndRankSources(sources: IntelligentSource[], topic: string): IntelligentSource[] {
    return sources.map(source => {
      let finalScore = source.relevanceScore;
      
      // Additional scoring based on domain patterns
      const domain = source.domain.toLowerCase();
      
      // Boost news and established tech sites
      if (domain.includes('news') || domain.includes('tech') || domain.includes('blog')) {
        finalScore += 10;
      }
      
      // Boost .edu and .org domains for research topics
      if (domain.endsWith('.edu') || domain.endsWith('.org')) {
        finalScore += 15;
      }
      
      // Boost sources with recent relevant articles
      if (source.recentArticles && source.recentArticles.length > 0) {
        finalScore += source.recentArticles.length * 5;
      }
      
      return {
        ...source,
        relevanceScore: Math.min(100, finalScore)
      };
    });
  }

  private static isHighAuthorityDomain(domain: string): boolean {
    const highAuthorityDomains = [
      'techcrunch.com', 'theverge.com', 'wired.com', 'arstechnica.com',
      'reuters.com', 'bbc.com', 'cnn.com', 'bloomberg.com',
      'nature.com', 'sciencedaily.com', 'forbes.com', 'wsj.com',
      'nytimes.com', 'washingtonpost.com', 'economist.com',
      'mit.edu', 'stanford.edu', 'openai.com', 'google.com',
      'coindesk.com', 'cointelegraph.com', 'venturebeat.com'
    ];
    
    return highAuthorityDomains.some(authorityDomain => 
      domain.includes(authorityDomain)
    );
  }

  private static getFallbackSources(topic: string): IntelligentSource[] {
    // Fallback to basic curated sources if web search fails
    const fallbackMap: Record<string, IntelligentSource[]> = {
      'ai': [
        {
          url: 'https://openai.com/blog/rss.xml',
          title: 'OpenAI Blog',
          type: 'rss',
          relevanceScore: 95,
          description: 'Latest AI research and developments from OpenAI',
          domain: 'openai.com'
        }
      ],
      'technology': [
        {
          url: 'https://feeds.feedburner.com/TechCrunch',
          title: 'TechCrunch',
          type: 'rss', 
          relevanceScore: 90,
          description: 'Technology startup and innovation news',
          domain: 'techcrunch.com'
        }
      ]
    };
    
    const topicLower = topic.toLowerCase();
    for (const [key, sources] of Object.entries(fallbackMap)) {
      if (topicLower.includes(key)) {
        return sources;
      }
    }
    
    return [];
  }

  // Quick method for getting just URLs
  static async getQuickSources(topic: string): Promise<string[]> {
    const sources = await this.discoverSources(topic, 5);
    return sources.map(source => source.url);
  }
}