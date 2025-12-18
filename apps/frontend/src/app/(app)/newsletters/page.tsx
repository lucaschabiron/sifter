import { createClient } from "@/lib/db/server";
import { getUserNewsletters, getNewsletterStats } from "@/lib/db/newsletters";
import { NewslettersTable } from "@/components/dashboard/newslettersTable";
import { NewsletterStats } from "@/components/dashboard/newsletterStats";

export default async function NewslettersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view your newsletters.</div>;
  }

  const [newsletters, stats] = await Promise.all([
    getUserNewsletters(user.id),
    getNewsletterStats()
  ]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Newsletter History</h1>
          <p className="text-muted-foreground">
            View and manage your generated newsletters
          </p>
        </div>

        <NewsletterStats stats={stats} />
        
        <NewslettersTable newsletters={newsletters} />
      </div>
    </main>
  );
}