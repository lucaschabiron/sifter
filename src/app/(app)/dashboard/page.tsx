import { createClient } from "@/lib/db/server";
import { getUserSifts, getSiftStats } from "@/lib/db/sifts";
import { getUserNewsletters, getNewsletterStats } from "@/lib/db/newsletters";
import { DashboardOverview } from "@/components/dashboard/dashboardOverview";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view your dashboard.</div>;
  }

  const [sifts, newsletters, siftStats, newsletterStats] = await Promise.all([
    getUserSifts(),
    getUserNewsletters(user.id),
    getSiftStats(),
    getNewsletterStats()
  ]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your sifts and newsletters.
          </p>
        </div>

        <DashboardOverview 
          sifts={sifts}
          newsletters={newsletters}
          siftStats={siftStats}
          newsletterStats={newsletterStats}
        />
      </div>
    </main>
  );
}
