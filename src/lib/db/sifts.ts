import { createClient } from "./client";
import type { Database } from "./database.types";

export type Sift = Database['public']['Tables']['sifts']['Row'];

export async function getUserSifts(): Promise<Sift[]> {
  const supabase = createClient();
  
  const { data: sifts, error } = await supabase
    .from('sifts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sifts:', error);
    return [];
  }

  return sifts || [];
}
