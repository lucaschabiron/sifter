import axios from 'axios';
import { Article } from './contentAggregator';
import { log } from '../utils/logger';

export interface ScoredArticle extends Article {
  viralityScore: number;
  scoreBreakdown: {
    recencyScore: number;
    contentScore: number;
    domainScore: number;
    engagementScore: number;
  };
}

export class ViralityRanker {
  private static readonly VIRAL_KEYWORDS = [
    'breaking', 'urgent', 'exclusive', 'revealed', 'shocking', 'amazing', 'incredible',
    'must-read', 'trending', 'viral', 'controversial', 'debate', 'crisis', 'emergency',
    'record', 'historic', 'unprecedented', 'massive', 'huge', 'major', 'significant'
  ];

  private static readonly HIGH_AUTHORITY_DOMAINS = [
    'techcrunch.com', 'theverge.com', 'wired.com', 'arstechnica.com', 'engadget.com',
    'reuters.com', 'bloomberg.com', 'wsj.com', 'nytimes.com', 'washingtonpost.com',
    'bbc.com', 'cnn.com', 'theguardian.com', 'economist.com', 'forbes.com',
    'hackernews.ycombinator.com', 'reddit.com', 'medium.com'
  ];

  static async rankArticles(articles: Article[]): Promise<ScoredArticle[]> {
    const scoredArticles: ScoredArticle[] = [];

    for (const article of articles) {
      try {
        const score = await this.calculateViralityScore(article);
        scoredArticles.push({
          ...article,
          viralityScore: score.total,
          scoreBreakdown: score.breakdown
        });
      } catch (error) {
        log(`Error scoring article ${article.url}: ${error}`);
        // Default score for articles that fail scoring
        scoredArticles.push({
          ...article,
          viralityScore: 50,
          scoreBreakdown: {
            recencyScore: 30,
            contentScore: 20,
            domainScore: 0,
            engagementScore: 0
          }
        });
      }
    }

    // Sort by virality score (highest first)
    return scoredArticles.sort((a, b) => b.viralityScore - a.viralityScore);
  }

  private static async calculateViralityScore(article: Article): Promise<{
    total: number;
    breakdown: {
      recencyScore: number;
      contentScore: number;
      domainScore: number;
      engagementScore: number;
    };
  }> {
    const recencyScore = this.calculateRecencyScore(article.publishedAt);
    const contentScore = this.calculateContentScore(article);
    const domainScore = this.calculateDomainScore(article.sourceDomain);
    const engagementScore = await this.calculateEngagementScore(article);

    // Weighted average
    const total = Math.round(
      recencyScore * 0.3 +
      contentScore * 0.4 +
      domainScore * 0.2 +
      engagementScore * 0.1
    );

    return {
      total: Math.min(100, Math.max(0, total)),
      breakdown: {
        recencyScore,
        contentScore,
        domainScore,
        engagementScore
      }
    };
  }

  private static calculateRecencyScore(publishedAt: Date): number {
    const now = new Date();
    const ageInHours = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);

    // Score based on how recent the article is
    if (ageInHours < 1) return 100;
    if (ageInHours < 6) return 90;
    if (ageInHours < 12) return 80;
    if (ageInHours < 24) return 70;
    if (ageInHours < 48) return 60;
    if (ageInHours < 72) return 50;
    if (ageInHours < 168) return 40; // 1 week
    if (ageInHours < 336) return 30; // 2 weeks
    return 20;
  }

  private static calculateContentScore(article: Article): number {
    let score = 50; // Base score

    const title = article.title.toLowerCase();
    const content = (article.content || article.summary || '').toLowerCase();
    const combinedText = `${title} ${content}`;

    // Check for viral keywords in title (higher weight)
    const titleViralWords = this.VIRAL_KEYWORDS.filter(keyword => 
      title.includes(keyword)
    );
    score += titleViralWords.length * 15;

    // Check for viral keywords in content
    const contentViralWords = this.VIRAL_KEYWORDS.filter(keyword => 
      content.includes(keyword)
    );
    score += contentViralWords.length * 5;

    // Length factor - not too short, not too long
    const contentLength = content.length;
    if (contentLength > 200 && contentLength < 2000) {
      score += 10;
    }

    // Question marks and exclamation points (engagement indicators)
    const punctuationMatches = combinedText.match(/[?!]/g);
    if (punctuationMatches) {
      score += Math.min(punctuationMatches.length * 3, 15);
    }

    // Numbers and statistics (data-driven content often performs well)
    const numberMatches = combinedText.match(/\d+%|\d+\.\d+|\$\d+|\d+[kmb]|\d{4,}/g);
    if (numberMatches) {
      score += Math.min(numberMatches.length * 5, 20);
    }

    // Technology/trending keywords
    const techKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'blockchain', 'crypto',
      'climate', 'sustainability', 'electric', 'renewable', 'innovation',
      'startup', 'ipo', 'merger', 'acquisition', 'investment', 'funding'
    ];
    const techMatches = techKeywords.filter(keyword => 
      combinedText.includes(keyword)
    );
    score += techMatches.length * 8;

    return Math.min(100, Math.max(0, score));
  }

  private static calculateDomainScore(domain: string): number {
    const normalizedDomain = domain.toLowerCase().replace('www.', '');

    // High authority domains get bonus points
    if (this.HIGH_AUTHORITY_DOMAINS.includes(normalizedDomain)) {
      return 85;
    }

    // Medium authority domains (common news sites)
    const mediumAuthorityPatterns = [
      /\.edu$/, /\.gov$/, /\.org$/,
      /news/, /times/, /post/, /journal/, /herald/,
      /tech/, /science/, /research/
    ];

    for (const pattern of mediumAuthorityPatterns) {
      if (pattern.test(normalizedDomain)) {
        return 65;
      }
    }

    // Default score for other domains
    return 40;
  }

  private static async calculateEngagementScore(article: Article): Promise<number> {
    // This is a simplified implementation
    // In a real-world scenario, you'd integrate with social media APIs
    
    try {
      // Try to estimate engagement based on URL patterns and domain
      let score = 30; // Base engagement score

      const domain = article.sourceDomain.toLowerCase();
      
      // Some domains typically have higher engagement
      if (domain.includes('reddit.com')) {
        score = 80;
      } else if (domain.includes('hackernews') || domain.includes('ycombinator')) {
        score = 75;
      } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
        score = 70;
      } else if (this.HIGH_AUTHORITY_DOMAINS.includes(domain.replace('www.', ''))) {
        score = 60;
      }

      // Could add actual social media API calls here in the future
      // For now, add some randomness to simulate varying engagement
      const randomFactor = Math.random() * 20 - 10; // -10 to +10
      score += randomFactor;

      return Math.min(100, Math.max(0, score));
    } catch (error) {
      log(`Error calculating engagement score for ${article.url}: ${error}`);
      return 30; // Default score
    }
  }

  static getTopArticles(scoredArticles: ScoredArticle[], count: number = 5): ScoredArticle[] {
    return scoredArticles
      .sort((a, b) => b.viralityScore - a.viralityScore)
      .slice(0, count);
  }

  static filterByMinScore(scoredArticles: ScoredArticle[], minScore: number = 50): ScoredArticle[] {
    return scoredArticles.filter(article => article.viralityScore >= minScore);
  }
}