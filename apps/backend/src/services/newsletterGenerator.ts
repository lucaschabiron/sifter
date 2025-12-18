import OpenAI from 'openai';
import { ScoredArticle, ViralityRanker } from './viralityRanker';
import { ContentAggregator } from './contentAggregator';
import { IntelligentSourceDiscovery } from './intelligentSourceDiscovery';
import { authSupabase } from '../config/supabase';
import { log } from '../utils/logger';

export interface Sift {
  id: number;
  user_id: string;
  title: string;
  topic: string;
  usual_sources: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  content_preference: 'summaries' | 'detailed' | 'mixed';
  created_at: string;
  updated_at: string;
}

export interface GeneratedNewsletter {
  title: string;
  content: string;
  articles: ScoredArticle[];
  sift: Sift;
}

export class NewsletterGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateNewsletter(
    sift: Sift,
    userToken: string,
    sinceDate?: Date
  ): Promise<GeneratedNewsletter> {
    try {
      log(`Generating newsletter for sift: ${sift.title}`);

      // Parse sources from sift
      let sources = sift.usual_sources
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // If no sources provided, discover them automatically
      if (sources.length === 0) {
        log(`No sources found for sift "${sift.title}". Discovering sources for topic: ${sift.topic}`);
        
        const discoveredSources = await IntelligentSourceDiscovery.getQuickSources(sift.topic);
        sources = discoveredSources;
        
        if (sources.length === 0) {
          throw new Error(`No sources could be discovered for topic: ${sift.topic}`);
        }
        
        log(`Discovered ${sources.length} sources for sift ${sift.id}: ${sources.join(', ')}`);
        
        // Optionally save the discovered sources back to the sift
        await this.saveDicoveredSources(sift, sources, userToken);
      }

      // Aggregate content
      const aggregationResult = await ContentAggregator.aggregateContent(
        sources,
        sinceDate,
        20 // Get more articles to have better selection
      );

      if (aggregationResult.articles.length === 0) {
        throw new Error('No new articles found from sources');
      }

      // Rank articles by virality
      const rankedArticles = await ViralityRanker.rankArticles(aggregationResult.articles);
      
      // Select top 5 articles
      const selectedArticles = ViralityRanker.getTopArticles(rankedArticles, 5);

      // Generate newsletter content using AI
      const newsletterContent = await this.generateNewsletterContent(sift, selectedArticles);

      // Create newsletter title
      const title = await this.generateNewsletterTitle(sift, selectedArticles);

      const newsletter: GeneratedNewsletter = {
        title,
        content: newsletterContent,
        articles: selectedArticles,
        sift
      };

      // Save to database
      await this.saveNewsletter(newsletter, userToken);

      log(`Newsletter generated successfully for sift: ${sift.title}`);
      return newsletter;

    } catch (error) {
      log(`Error generating newsletter for sift ${sift.id}: ${error}`);
      throw error;
    }
  }

  private async generateNewsletterContent(
    sift: Sift,
    articles: ScoredArticle[]
  ): Promise<string> {
    const contentStylePrompt = this.getContentStylePrompt(sift.content_preference);
    
    const articlesData = articles.map((article, index) => ({
      index: index + 1,
      title: article.title,
      url: article.url,
      summary: article.summary || 'No summary available',
      domain: article.sourceDomain,
      viralityScore: article.viralityScore
    }));

    const prompt = `You are creating a personalized newsletter about "${sift.topic}" for a user. 

Content Style: ${contentStylePrompt}

Create a well-structured newsletter in Markdown format with the following articles:

${articlesData.map(article => `
**Article ${article.index}: ${article.title}**
- URL: ${article.url}
- Source: ${article.domain}
- Summary: ${article.summary}
- Virality Score: ${article.viralityScore}
`).join('\n')}

Newsletter Requirements:
1. Start with a brief, engaging introduction about the topic and why these articles matter
2. For each article, provide:
   - A catchy headline that relates to the original title
   - A summary tailored to the user's content preference
   - Why this article is significant/viral (based on the virality score)
   - The source link
3. Use proper Markdown formatting (headers, bullet points, links)
4. Keep the tone professional but engaging
5. End with a brief conclusion and call-to-action
6. Total length should be appropriate for the content preference

The user is interested in: ${sift.topic}
Focus on aspects that would interest someone following this topic.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert newsletter curator who creates engaging, well-structured content summaries.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      return completion.choices[0]?.message?.content || 'Error generating newsletter content';
    } catch (error) {
      log(`OpenAI API error: ${error}`);
      // Fallback to basic newsletter generation
      return this.generateBasicNewsletter(sift, articles);
    }
  }

  private async generateNewsletterTitle(
    sift: Sift,
    articles: ScoredArticle[]
  ): Promise<string> {
    const topArticle = articles[0];
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const prompt = `Create a catchy newsletter title for a personalized newsletter about "${sift.topic}".

The newsletter contains ${articles.length} articles, with the top story being: "${topArticle.title}"

The title should be:
- Engaging and clickable
- Relevant to the topic "${sift.topic}"
- Under 60 characters
- Include the date: ${currentDate}

Examples:
- "AI Weekly: Breakthrough Models & Industry Shifts - March 15, 2024"
- "Climate Tech Digest: Clean Energy Wins - March 15, 2024"
- "Startup Spotlight: Funding Rounds & New Launches - March 15, 2024"

Generate one title:`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.8
      });

      const generatedTitle = completion.choices[0]?.message?.content?.trim();
      return generatedTitle || `${sift.title} - ${currentDate}`;
    } catch (error) {
      log(`Error generating title: ${error}`);
      return `${sift.title} - ${currentDate}`;
    }
  }

  private getContentStylePrompt(preference: string): string {
    switch (preference) {
      case 'summaries':
        return 'Provide concise summaries (2-3 sentences per article). Focus on key points and takeaways.';
      case 'detailed':
        return 'Provide detailed analysis and context (1-2 paragraphs per article). Include background information and implications.';
      case 'mixed':
        return 'Mix of summary and detail. Top 2 articles should be detailed, others can be brief summaries.';
      default:
        return 'Balanced approach with clear, informative content.';
    }
  }

  private generateBasicNewsletter(sift: Sift, articles: ScoredArticle[]): string {
    const date = new Date().toLocaleDateString();
    
    let content = `# ${sift.title} Newsletter\n\n`;
    content += `*Generated on ${date}*\n\n`;
    content += `## Latest updates on ${sift.topic}\n\n`;

    articles.forEach((article, index) => {
      content += `### ${index + 1}. ${article.title}\n\n`;
      content += `**Source:** ${article.sourceDomain}\n\n`;
      if (article.summary) {
        content += `${article.summary}\n\n`;
      }
      content += `[Read more](${article.url})\n\n`;
      content += `---\n\n`;
    });

    content += `## About This Newsletter\n\n`;
    content += `This newsletter was automatically generated based on your interest in "${sift.topic}". `;
    content += `Articles were selected and ranked based on relevance and virality.\n\n`;
    content += `*Powered by Sifter*`;

    return content;
  }

  private async saveNewsletter(
    newsletter: GeneratedNewsletter,
    userToken: string
  ): Promise<void> {
    try {
      // Use service role if no user token provided (for cron jobs)
      const supabase = userToken 
        ? authSupabase(userToken)
        : (await import('../config/supabase')).createServiceRoleClient();

      // Insert newsletter
      const { data: newsletterData, error: newsletterError } = await supabase
        .from('newsletters')
        .insert({
          user_id: newsletter.sift.user_id,
          sift_id: newsletter.sift.id,
          title: newsletter.title,
          content_markdown: newsletter.content,
          article_count: newsletter.articles.length,
          delivery_status: 'pending'
        })
        .select()
        .single();

      if (newsletterError) {
        throw new Error(`Failed to save newsletter: ${newsletterError.message}`);
      }

      // Insert articles
      const articleInserts = newsletter.articles.map(article => ({
        newsletter_id: newsletterData.id,
        title: article.title,
        url: article.url,
        summary: article.summary,
        virality_score: article.viralityScore,
        published_at: article.publishedAt.toISOString(),
        source_domain: article.sourceDomain
      }));

      const { error: articlesError } = await supabase
        .from('newsletter_articles')
        .insert(articleInserts);

      if (articlesError) {
        throw new Error(`Failed to save articles: ${articlesError.message}`);
      }

      log(`Newsletter saved to database with ID: ${newsletterData.id}`);
    } catch (error) {
      log(`Error saving newsletter: ${error}`);
      throw error;
    }
  }

  async getLastNewsletterDate(siftId: number, userToken: string): Promise<Date | null> {
    try {
      // Use service role if no user token provided (for cron jobs)
      const supabase = userToken 
        ? authSupabase(userToken)
        : (await import('../config/supabase')).createServiceRoleClient();
      
      const { data, error } = await supabase
        .from('newsletters')
        .select('sent_at')
        .eq('sift_id', siftId)
        .eq('delivery_status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data?.sent_at) {
        return null;
      }

      return new Date(data.sent_at);
    } catch (error) {
      log(`Error getting last newsletter date: ${error}`);
      return null;
    }
  }

  private async saveDicoveredSources(
    sift: Sift, 
    discoveredSources: string[], 
    userToken: string
  ): Promise<void> {
    try {
      // Use service role if no user token provided (for cron jobs)
      const supabase = userToken 
        ? authSupabase(userToken)
        : (await import('../config/supabase')).createServiceRoleClient();
      
      const sourcesString = discoveredSources.join(', ');
      
      const { error } = await supabase
        .from('sifts')
        .update({ usual_sources: sourcesString })
        .eq('id', sift.id);

      if (error) {
        log(`Failed to save discovered sources to sift ${sift.id}: ${error.message}`);
      } else {
        log(`Saved ${discoveredSources.length} discovered sources to sift ${sift.id}`);
      }
    } catch (error) {
      log(`Error saving discovered sources: ${error}`);
    }
  }
}