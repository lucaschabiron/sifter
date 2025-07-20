import { createClient } from "@/lib/db/server";
import { getUserSifts, getSiftStats } from "@/lib/db/sifts";
import { SiftsTable } from "@/components/dashboard/siftsTable";
import { SiftStats } from "@/components/dashboard/siftStats";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function SiftsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view your sifts.</div>;
  }

  const [sifts, stats] = await Promise.all([
    getUserSifts(),
    getSiftStats()
  ]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sifts</h1>
            <p className="text-muted-foreground">
              Create and manage your personalized newsletter sifts
            </p>
          </div>
          <Link href="/sifts/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Sift
            </Button>
          </Link>
        </div>

        <SiftStats stats={stats} />
        
        <SiftsTable sifts={sifts} />
      </div>
    </main>
  );
}
