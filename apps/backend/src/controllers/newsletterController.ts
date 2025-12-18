import { Response, NextFunction } from "express";
import { Request } from "express-jwt";
import { NewsletterGenerator } from "../services/newsletterGenerator";
import { SourceValidator } from "../services/sourceValidator";
import { newsletterScheduler } from "../jobs/cronJobs";
import { z } from "zod";
import { log } from "../utils/logger";
import { authSupabase } from "../config/supabase";

const generateNewsletterSchema = z.object({
  siftId: z.number(),
  sinceDate: z.string().optional()
});

const validateSourcesSchema = z.object({
  sources: z.array(z.string())
});

export const generateNewsletter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.auth?.sub;
    const token = req.headers.authorization?.split(" ")[1] ?? "";
    
    if (!user || !token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { siftId, sinceDate } = generateNewsletterSchema.parse(req.body);

    // Get the sift
    const supabase = authSupabase(token);
    const { data: sift, error } = await supabase
      .from('sifts')
      .select('*')
      .eq('id', siftId)
      .eq('user_id', user)
      .single();

    if (error || !sift) {
      res.status(404).json({ error: "Sift not found" });
      return;
    }

    // Generate newsletter
    const newsletterGenerator = new NewsletterGenerator();
    const newsletter = await newsletterGenerator.generateNewsletter(
      sift,
      token,
      sinceDate ? new Date(sinceDate) : undefined
    );

    log(`Manual newsletter generated for sift ${siftId}: ${newsletter.title}`);
    res.status(201).json({
      message: "Newsletter generated successfully",
      newsletter: {
        title: newsletter.title,
        articleCount: newsletter.articles.length
      }
    });

  } catch (error) {
    log(`Error in generateNewsletter: ${error}`);
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
      return;
    }
    next(error);
  }
};

export const validateSources = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sources } = validateSourcesSchema.parse(req.body);

    if (sources.length === 0) {
      res.status(400).json({ error: "No sources provided" });
      return;
    }

    if (sources.length > 10) {
      res.status(400).json({ error: "Too many sources (max 10)" });
      return;
    }

    const validatedSources = await SourceValidator.validateSources(sources);

    res.json({
      message: "Sources validated",
      sources: validatedSources,
      summary: {
        total: sources.length,
        valid: validatedSources.filter(s => s.isValid).length,
        invalid: validatedSources.filter(s => !s.isValid).length
      }
    });

  } catch (error) {
    log(`Error in validateSources: ${error}`);
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
      return;
    }
    next(error);
  }
};

export const triggerScheduledGeneration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.auth?.sub;
    
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { frequency } = req.body;
    
    if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
      res.status(400).json({ error: "Invalid frequency. Must be daily, weekly, or monthly" });
      return;
    }

    // Trigger manual newsletter generation for testing
    await newsletterScheduler.triggerNewsletterGeneration(frequency);

    log(`Manual trigger for ${frequency} newsletter generation by user ${user}`);
    res.json({
      message: `${frequency} newsletter generation triggered successfully`
    });

  } catch (error) {
    log(`Error in triggerScheduledGeneration: ${error}`);
    next(error);
  }
};

export const getNewsletterStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.auth?.sub;
    const token = req.headers.authorization?.split(" ")[1] ?? "";
    
    if (!user || !token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const supabase = authSupabase(token);

    // Get user's newsletter stats
    const { data: newsletters, error } = await supabase
      .from('newsletters')
      .select('id, sent_at, delivery_status')
      .eq('user_id', user)
      .eq('delivery_status', 'sent');

    if (error) {
      throw new Error(`Failed to fetch newsletters: ${error.message}`);
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      total: newsletters?.length || 0,
      thisWeek: newsletters?.filter(n => 
        n.sent_at && new Date(n.sent_at) >= oneWeekAgo
      ).length || 0,
      thisMonth: newsletters?.filter(n => 
        n.sent_at && new Date(n.sent_at) >= oneMonthAgo
      ).length || 0
    };

    res.json({ stats });

  } catch (error) {
    log(`Error in getNewsletterStats: ${error}`);
    next(error);
  }
};