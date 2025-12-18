import axios from 'axios';
import { load } from 'cheerio';
import RSSParser from 'rss-parser';
import { log } from '../utils/logger';

export interface ValidatedSource {
  url: string;
  type: 'rss' | 'website';
  isValid: boolean;
  feedUrl?: string;
  error?: string;
  domain: string;
}

const rssParser = new RSSParser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Sifter Content Aggregator 1.0'
  }
});

export class SourceValidator {
  private static readonly TIMEOUT = 10000;
  private static readonly USER_AGENT = 'Sifter Content Aggregator 1.0';

  static async validateSources(sources: string[]): Promise<ValidatedSource[]> {
    const results: ValidatedSource[] = [];
    
    for (const source of sources) {
      try {
        const validated = await this.validateSingleSource(source.trim());
        results.push(validated);
      } catch (error) {
        log(`Error validating source ${source}: ${error}`);
        results.push({
          url: source.trim(),
          type: 'website',
          isValid: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          domain: this.extractDomain(source.trim())
        });
      }
    }

    return results;
  }

  private static async validateSingleSource(url: string): Promise<ValidatedSource> {
    const domain = this.extractDomain(url);
    
    try {
      // First, try to check if it's already an RSS feed
      const rssResult = await this.tryAsRSSFeed(url);
      if (rssResult.isValid) {
        return { ...rssResult, domain };
      }

      // If not RSS, try to find RSS feeds on the page
      const websiteResult = await this.findRSSOnWebsite(url);
      return { ...websiteResult, domain };

    } catch (error) {
      return {
        url,
        type: 'website',
        isValid: false,
        error: error instanceof Error ? error.message : 'Validation failed',
        domain
      };
    }
  }

  private static async tryAsRSSFeed(url: string): Promise<Omit<ValidatedSource, 'domain'>> {
    try {
      const feed = await rssParser.parseURL(url);
      return {
        url,
        type: 'rss',
        isValid: true,
        feedUrl: url
      };
    } catch (error) {
      return {
        url,
        type: 'rss',
        isValid: false,
        error: 'Not a valid RSS feed'
      };
    }
  }

  private static async findRSSOnWebsite(url: string): Promise<Omit<ValidatedSource, 'domain'>> {
    try {
      const response = await axios.get(url, {
        timeout: this.TIMEOUT,
        headers: { 'User-Agent': this.USER_AGENT },
        maxRedirects: 5
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}`);
      }

      const $ = load(response.data);
      
      // Look for RSS/Atom feed links in the HTML head
      const feedLinks = this.findFeedLinks($, url);
      
      if (feedLinks.length > 0) {
        // Try to validate the first RSS feed found
        for (const feedUrl of feedLinks) {
          try {
            await rssParser.parseURL(feedUrl);
            return {
              url,
              type: 'rss',
              isValid: true,
              feedUrl
            };
          } catch (error) {
            continue; // Try next feed
          }
        }
      }

      // If no RSS feeds work, check if we can at least access the website
      return {
        url,
        type: 'website',
        isValid: true // Website is accessible for scraping
      };

    } catch (error) {
      throw new Error(`Cannot access website: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static findFeedLinks($: any, baseUrl: string): string[] {
    const feeds: string[] = [];
    
    // Look for RSS/Atom links in <head>
    $('link[type="application/rss+xml"], link[type="application/atom+xml"]').each((_: number, element: any) => {
      const href = $(element).attr('href');
      if (href) {
        feeds.push(this.resolveUrl(href, baseUrl));
      }
    });

    // Common RSS endpoints to try
    const commonEndpoints = ['/rss', '/feed', '/feeds', '/atom.xml', '/rss.xml', '/feed.xml'];
    const baseUrlObj = new URL(baseUrl);
    
    for (const endpoint of commonEndpoints) {
      feeds.push(`${baseUrlObj.origin}${endpoint}`);
    }

    return [...new Set(feeds)]; // Remove duplicates
  }

  private static resolveUrl(href: string, baseUrl: string): string {
    try {
      return new URL(href, baseUrl).toString();
    } catch {
      return href;
    }
  }

  private static extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url.split('/')[0] || url;
    }
  }

  static async testFeedAccess(feedUrl: string): Promise<{ success: boolean; itemCount?: number; error?: string }> {
    try {
      const feed = await rssParser.parseURL(feedUrl);
      return {
        success: true,
        itemCount: feed.items?.length || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}