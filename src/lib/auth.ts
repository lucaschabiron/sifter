import { createClient } from "@/lib/db/server";

export async function getUser() {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  return user;
}
