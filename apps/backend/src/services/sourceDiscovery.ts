import axios from 'axios';
import { load } from 'cheerio';
import { SourceValidator } from './sourceValidator';
import { log } from '../utils/logger';

export interface DiscoveredSource {
  url: string;
  title: string;
  type: 'rss' | 'website';
  relevanceScore: number;
  description?: string;
}

export class SourceDiscovery {
  private static readonly USER_AGENT = 'Sifter Content Discovery Bot 1.0';
  private static readonly TIMEOUT = 10000;

  // Pre-curated sources by topic
  private static readonly TOPIC_SOURCES: Record<string, string[]> = {
    technology: [
      'https://feeds.feedburner.com/TechCrunch',
      'https://www.theverge.com/rss/index.xml',
      'https://feeds.arstechnica.com/arstechnica/index',
      'https://www.wired.com/feed/rss',
      'https://techcrunch.com',
      'https://www.theverge.com',
      'https://arstechnica.com'
    ],
    ai: [
      'https://feeds.feedburner.com/oreilly/radar',
      'https://blogs.nvidia.com/feed/',
      'https://openai.com/blog/rss.xml',
      'https://www.deeplearning.ai',
      'https://machinelearningmastery.com/feed/',
      'https://towardsdatascience.com/feed'
    ],
    business: [
      'https://feeds.bloomberg.com/technology/news.rss',
      'https://feeds.fortune.com/fortune/technology',
      'https://www.businessinsider.com/rss',
      'https://fortune.com',
      'https://www.bloomberg.com',
      'https://www.forbes.com'
    ],
    news: [
      'https://rss.cnn.com/rss/edition.rss',
      'https://feeds.bbci.co.uk/news/rss.xml',
      'https://www.reuters.com/tools/rss',
      'https://www.bbc.com/news',
      'https://www.reuters.com',
      'https://www.cnn.com'
    ],
    science: [
      'https://feeds.nature.com/nature/rss/current',
      'https://www.sciencedaily.com/rss/all.xml',
      'https://feeds.feedburner.com/spaceflightnow',
      'https://www.nature.com',
      'https://www.sciencedaily.com',
      'https://www.space.com'
    ],
    crypto: [
      'https://cointelegraph.com/rss',
      'https://coindesk.com/arc/outboundfeeds/rss/',
      'https://decrypt.co/feed',
      'https://coindesk.com',
      'https://cointelegraph.com',
      'https://decrypt.co'
    ],
    startups: [
      'https://feeds.feedburner.com/TechCrunch',
      'https://blog.ycombinator.com/feed/',
      'https://news.ycombinator.com',
      'https://www.crunchbase.com',
      'https://angel.co'
    ]
  };

  static async discoverSources(
    topic: string, 
    maxSources: number = 8
  ): Promise<DiscoveredSource[]> {
    try {
      log(`Discovering sources for topic: ${topic}`);
      
      const discoveredSources: DiscoveredSource[] = [];
      
      // Step 1: Get curated sources for the topic
      const curatedSources = await this.getCuratedSources(topic);
      discoveredSources.push(...curatedSources);
      
      // Step 2: Search for additional sources using multiple strategies
      if (discoveredSources.length < maxSources) {
        const searchedSources = await this.searchForSources(topic, maxSources - discoveredSources.length);
        discoveredSources.push(...searchedSources);
      }
      
      // Step 3: Validate and score all sources
      const validatedSources = await this.validateAndScoreSources(discoveredSources, topic);
      
      // Step 4: Return top sources sorted by relevance
      return validatedSources
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxSources);
        
    } catch (error) {
      log(`Error discovering sources for topic ${topic}: ${error}`);
      return [];
    }
  }

  private static async getCuratedSources(topic: string): Promise<DiscoveredSource[]> {
    const sources: DiscoveredSource[] = [];
    const normalizedTopic = topic.toLowerCase();
    
    // Find matching curated sources
    for (const [key, urls] of Object.entries(this.TOPIC_SOURCES)) {
      if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
        for (const url of urls) {
          sources.push({
            url,
            title: `Curated ${key} source`,
            type: url.includes('/rss') || url.includes('/feed') || url.includes('.xml') ? 'rss' : 'website',
            relevanceScore: 90, // High score for curated sources
            description: `Pre-selected quality source for ${key} content`
          });
        }
      }
    }
    
    return sources;
  }

  private static async searchForSources(topic: string, maxSources: number): Promise<DiscoveredSource[]> {
    const sources: DiscoveredSource[] = [];
    
    try {
      // Strategy 1: Search for RSS feeds using common patterns
      const rssSearchTerms = [
        `${topic} rss feed`,
        `${topic} news feed`,
        `${topic} blog rss`,
        `best ${topic} rss feeds`
      ];
      
      for (const searchTerm of rssSearchTerms.slice(0, 2)) {
        const rssResults = await this.searchRSSFeeds(searchTerm);
        sources.push(...rssResults);
        
        if (sources.length >= maxSources) break;
      }
      
      // Strategy 2: Look for topic-specific websites
      const websiteResults = await this.searchTopicWebsites(topic);
      sources.push(...websiteResults);
      
    } catch (error) {
      log(`Error in searchForSources: ${error}`);
    }
    
    return sources.slice(0, maxSources);
  }

  private static async searchRSSFeeds(searchTerm: string): Promise<DiscoveredSource[]> {
    // This is a simplified implementation
    // In a real-world scenario, you'd integrate with RSS feed directories or search APIs
    
    const commonRSSPatterns = [
      '/rss.xml',
      '/feed.xml',
      '/rss',
      '/feed',
      '/feeds/all.atom.xml',
      '/blog/feed',
      '/news/rss'
    ];
    
    const sources: DiscoveredSource[] = [];
    
    // For now, return some pattern-based suggestions
    // You could integrate with services like Feedly API, RSS directories, etc.
    
    return sources;
  }

  private static async searchTopicWebsites(topic: string): Promise<DiscoveredSource[]> {
    const sources: DiscoveredSource[] = [];
    
    // Generate potential website URLs based on topic
    const topicVariations = [
      topic.toLowerCase().replace(/\s+/g, ''),
      topic.toLowerCase().replace(/\s+/g, '-'),
      topic.toLowerCase().replace(/\s+/g, '_')
    ];
    
    const commonDomains = ['.com', '.org', '.net', '.io'];
    const prefixes = ['', 'the', 'daily', 'tech', 'news'];
    
    for (const variation of topicVariations.slice(0, 2)) {
      for (const domain of commonDomains.slice(0, 2)) {
        for (const prefix of prefixes.slice(0, 2)) {
          const url = `https://${prefix}${variation}${domain}`;
          
          sources.push({
            url,
            title: `${topic} website`,
            type: 'website',
            relevanceScore: 60, // Medium score for generated URLs
            description: `Potential ${topic} website`
          });
        }
      }
    }
    
    return sources.slice(0, 5); // Limit generated URLs
  }

  private static async validateAndScoreSources(
    sources: DiscoveredSource[], 
    topic: string
  ): Promise<DiscoveredSource[]> {
    const validatedSources: DiscoveredSource[] = [];
    
    // Process in batches to avoid overwhelming servers
    const batchSize = 3;
    for (let i = 0; i < sources.length; i += batchSize) {
      const batch = sources.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (source) => {
        try {
          // Validate the source
          const validationResults = await SourceValidator.validateSources([source.url]);
          const validation = validationResults[0];
          
          if (validation && validation.isValid) {
            // Calculate relevance score
            let relevanceScore = source.relevanceScore;
            
            // Boost score for RSS feeds
            if (validation.type === 'rss') {
              relevanceScore += 20;
            }
            
            // Boost score based on domain authority
            if (this.isHighAuthorityDomain(validation.domain)) {
              relevanceScore += 15;
            }
            
            // Check if URL/domain contains topic keywords
            const topicKeywords = topic.toLowerCase().split(/\s+/);
            const urlLower = source.url.toLowerCase();
            const matchingKeywords = topicKeywords.filter(keyword => 
              urlLower.includes(keyword)
            );
            relevanceScore += matchingKeywords.length * 10;
            
            return {
              ...source,
              type: validation.type,
              relevanceScore: Math.min(100, relevanceScore),
              title: validation.feedUrl ? `RSS: ${validation.domain}` : `Website: ${validation.domain}`,
              url: validation.feedUrl || validation.url
            };
          }
        } catch (error) {
          log(`Error validating source ${source.url}: ${error}`);
        }
        
        return null;
      });
      
      const batchResults = await Promise.all(batchPromises);
      const validBatchResults = batchResults.filter(result => result !== null);
      validatedSources.push(...validBatchResults);
      
      // Add small delay between batches
      if (i + batchSize < sources.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return validatedSources;
  }

  private static isHighAuthorityDomain(domain: string): boolean {
    const highAuthorityDomains = [
      'techcrunch.com', 'theverge.com', 'wired.com', 'arstechnica.com',
      'reuters.com', 'bbc.com', 'cnn.com', 'bloomberg.com',
      'nature.com', 'sciencedaily.com', 'forbes.com',
      'coindesk.com', 'cointelegraph.com'
    ];
    
    const normalizedDomain = domain.toLowerCase().replace('www.', '');
    return highAuthorityDomains.includes(normalizedDomain);
  }

  // Helper method to get sources for common topics quickly
  static async getQuickSources(topic: string): Promise<string[]> {
    const discoveredSources = await this.discoverSources(topic, 5);
    return discoveredSources.map(source => source.url);
  }
}