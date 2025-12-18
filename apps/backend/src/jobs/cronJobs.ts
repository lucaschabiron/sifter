import * as cron from 'node-cron';
import { createServiceRoleClient } from '../config/supabase';
import { NewsletterGenerator, Sift } from '../services/newsletterGenerator';
import { EmailService } from '../services/emailService';
import { log } from '../utils/logger';

export class NewsletterScheduler {
  private static instance: NewsletterScheduler;
  private newsletterGenerator: NewsletterGenerator;
  private emailService: EmailService;
  private isRunning = false;

  private constructor() {
    this.newsletterGenerator = new NewsletterGenerator();
    this.emailService = new EmailService();
  }

  static getInstance(): NewsletterScheduler {
    if (!NewsletterScheduler.instance) {
      NewsletterScheduler.instance = new NewsletterScheduler();
    }
    return NewsletterScheduler.instance;
  }

  start(): void {
    if (this.isRunning) {
      log('Newsletter scheduler is already running');
      return;
    }

    log('Starting newsletter scheduler...');

    // Daily newsletters - 8 AM UTC
    cron.schedule('0 8 * * *', async () => {
      log('Running daily newsletter generation...');
      await this.processNewsletters('daily');
    });

    // Weekly newsletters - Monday 8 AM UTC
    cron.schedule('0 8 * * 1', async () => {
      log('Running weekly newsletter generation...');
      await this.processNewsletters('weekly');
    });

    // Monthly newsletters - 1st of month 8 AM UTC
    cron.schedule('0 8 1 * *', async () => {
      log('Running monthly newsletter generation...');
      await this.processNewsletters('monthly');
    });

    // Newsletter delivery job - every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      await this.deliverPendingNewsletters();
    });

    this.isRunning = true;
    log('Newsletter scheduler started successfully');
  }

  stop(): void {
    if (!this.isRunning) {
      log('Newsletter scheduler is not running');
      return;
    }

    // Note: node-cron doesn't have a global destroy method
    // Individual jobs would need to be destroyed separately
    this.isRunning = false;
    log('Newsletter scheduler stopped');
  }

  private async processNewsletters(frequency: 'daily' | 'weekly' | 'monthly'): Promise<void> {
    try {
      const supabase = createServiceRoleClient();
      
      // Get all active sifts with the specified frequency
      const { data: sifts, error } = await supabase
        .from('sifts')
        .select('*')
        .eq('frequency', frequency);

      if (error) {
        log(`Error fetching sifts: ${error.message}`);
        return;
      }

      if (!sifts || sifts.length === 0) {
        log(`No ${frequency} sifts found`);
        return;
      }

      log(`Processing ${sifts.length} ${frequency} sifts`);

      for (const sift of sifts) {
        try {
          await this.processSingleSift(sift);
        } catch (error) {
          log(`Error processing sift ${sift.id}: ${error}`);
          continue;
        }
      }

      log(`Completed processing ${frequency} newsletters`);
    } catch (error) {
      log(`Error in processNewsletters: ${error}`);
    }
  }

  private async processSingleSift(sift: Sift): Promise<void> {
    try {
      // Get user's auth token (in real implementation, you'd need a service account)
      // For now, we'll use the service role client
      const supabase = createServiceRoleClient();
      
      // Check when the last newsletter was sent
      const lastNewsletterDate = await this.newsletterGenerator.getLastNewsletterDate(
        sift.id,
        '' // Service role doesn't need user token
      );

      // Determine since date based on frequency
      const sinceDate = this.calculateSinceDate(sift.frequency, lastNewsletterDate);

      log(`Generating newsletter for sift ${sift.id} (${sift.title}) since ${sinceDate}`);

      // Generate newsletter using service role token
      const newsletter = await this.newsletterGenerator.generateNewsletter(
        sift,
        '', // Service role
        sinceDate
      );

      log(`Newsletter generated for sift ${sift.id}: ${newsletter.title}`);

    } catch (error) {
      log(`Error processing sift ${sift.id}: ${error}`);
      throw error;
    }
  }

  private calculateSinceDate(
    frequency: 'daily' | 'weekly' | 'monthly',
    lastNewsletterDate: Date | null
  ): Date {
    const now = new Date();
    
    if (lastNewsletterDate) {
      return lastNewsletterDate;
    }

    // If no previous newsletter, look back based on frequency
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days
      case 'monthly':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  async deliverPendingNewsletters(): Promise<void> {
    try {
      const supabase = createServiceRoleClient();

      // Get pending newsletters with sifts data
      const { data: newsletters, error } = await supabase
        .from('newsletters')
        .select(`
          *,
          sifts!inner(*)
        `)
        .eq('delivery_status', 'pending')
        .limit(10); // Process in batches

      if (error) {
        log(`Error fetching pending newsletters: ${error.message}`);
        return;
      }

      if (!newsletters || newsletters.length === 0) {
        return; // No pending newsletters
      }

      log(`Delivering ${newsletters.length} pending newsletters`);

      for (const newsletter of newsletters) {
        try {
          await this.deliverNewsletter(newsletter);
        } catch (error) {
          log(`Error delivering newsletter ${newsletter.id}: ${error}`);
          
          // Mark as failed
          await supabase
            .from('newsletters')
            .update({ delivery_status: 'failed' })
            .eq('id', newsletter.id);
        }
      }

    } catch (error) {
      log(`Error in deliverPendingNewsletters: ${error}`);
    }
  }

  private async deliverNewsletter(newsletter: any): Promise<void> {
    try {
      const supabase = createServiceRoleClient();
      
      // Get user email from auth.users table using service role client
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(newsletter.user_id);

      if (userError || !user?.user?.email) {
        throw new Error(`User email not found for user_id: ${newsletter.user_id}`);
      }

      const userEmail = user.user.email;
      const siftTitle = newsletter.sifts.title;

      // Send email
      await this.emailService.sendNewsletter({
        to: userEmail,
        subject: newsletter.title,
        newsletterTitle: newsletter.title,
        content: newsletter.content_markdown,
        siftTitle: siftTitle,
        unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?sift=${newsletter.sift_id}`
      });

      // Mark as sent
      await supabase
        .from('newsletters')
        .update({ 
          delivery_status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', newsletter.id);

      log(`Newsletter delivered successfully: ${newsletter.id}`);

    } catch (error) {
      log(`Error delivering newsletter: ${error}`);
      throw error;
    }
  }

  // Manual trigger for testing
  async triggerNewsletterGeneration(frequency: 'daily' | 'weekly' | 'monthly'): Promise<void> {
    log(`Manually triggering ${frequency} newsletter generation`);
    await this.processNewsletters(frequency);
  }
}

// Initialize and start the scheduler
export const newsletterScheduler = NewsletterScheduler.getInstance();