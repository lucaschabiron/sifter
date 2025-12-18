import { createClient } from "./server";
import type { Database } from "./database.types";

export type Newsletter = Database['public']['Tables']['newsletters']['Row'];
export type NewsletterArticle = Database['public']['Tables']['newsletter_articles']['Row'];

export interface NewsletterWithArticles extends Newsletter {
  articles: NewsletterArticle[];
}

export async function getUserNewsletters(userId?: string): Promise<Newsletter[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('newsletters')
    .select('*')
    .eq('delivery_status', 'sent')
    .order('sent_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data: newsletters, error } = await query;

  if (error) {
    console.error('Error fetching newsletters:', error);
    return [];
  }

  return newsletters || [];
}

export async function getNewsletterById(id: number): Promise<NewsletterWithArticles | null> {
  const supabase = await createClient();
  
  const { data: newsletter, error: newsletterError } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', id)
    .eq('delivery_status', 'sent')
    .single();

  if (newsletterError || !newsletter) {
    console.error('Error fetching newsletter:', newsletterError);
    return null;
  }

  const { data: articles, error: articlesError } = await supabase
    .from('newsletter_articles')
    .select('*')
    .eq('newsletter_id', id)
    .order('virality_score', { ascending: false });

  if (articlesError) {
    console.error('Error fetching newsletter articles:', articlesError);
    return { ...newsletter, articles: [] };
  }

  return { ...newsletter, articles: articles || [] };
}

export async function getNewslettersBySift(siftId: number): Promise<Newsletter[]> {
  const supabase = await createClient();
  
  const { data: newsletters, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('sift_id', siftId)
    .eq('delivery_status', 'sent')
    .order('sent_at', { ascending: false });

  if (error) {
    console.error('Error fetching newsletters by sift:', error);
    return [];
  }

  return newsletters || [];
}

export async function getNewsletterStats(): Promise<{
  total: number;
  thisWeek: number;
  thisMonth: number;
}> {
  const supabase = await createClient();
  
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Total newsletters
  const { count: total } = await supabase
    .from('newsletters')
    .select('*', { count: 'exact', head: true })
    .eq('delivery_status', 'sent');

  // This week
  const { count: thisWeek } = await supabase
    .from('newsletters')
    .select('*', { count: 'exact', head: true })
    .eq('delivery_status', 'sent')
    .gte('sent_at', oneWeekAgo.toISOString());

  // This month
  const { count: thisMonth } = await supabase
    .from('newsletters')
    .select('*', { count: 'exact', head: true })
    .eq('delivery_status', 'sent')
    .gte('sent_at', oneMonthAgo.toISOString());

  return {
    total: total || 0,
    thisWeek: thisWeek || 0,
    thisMonth: thisMonth || 0
  };
}