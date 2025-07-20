import { createClient } from "./server";
import type { Database } from "./database.types";

export type Sift = Database['public']['Tables']['sifts']['Row'];

export async function getUserSifts(): Promise<Sift[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }
  
  const { data: sifts, error } = await supabase
    .from('sifts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sifts:', error);
    return [];
  }

  return sifts || [];
}

export async function getSiftById(id: string): Promise<Sift | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  const { data: sift, error } = await supabase
    .from('sifts')
    .select('*')
    .eq('id', parseInt(id))
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching sift:', error);
    return null;
  }

  return sift;
}

export async function getSiftStats() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { total: 0, active: 0, thisMonth: 0 };
  }
  
  const { data: sifts, error } = await supabase
    .from('sifts')
    .select('id, created_at, active')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching sift stats:', error);
    return { total: 0, active: 0, thisMonth: 0 };
  }

  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats = {
    total: sifts?.length || 0,
    active: sifts?.filter(sift => sift.active !== false).length || 0,
    thisMonth: sifts?.filter(sift => 
      sift.created_at && new Date(sift.created_at) >= oneMonthAgo
    ).length || 0
  };

  return stats;
}
