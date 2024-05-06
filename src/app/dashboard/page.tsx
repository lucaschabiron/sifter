import { CurrentSessionHelper } from "@/components/currentSessionHelper";
import { SignoutButton } from "@/components/auth/signoutButton";
import { createClient } from "@/lib/db/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user === null) {
    redirect("/login");
  }
  return (
    <div className="flex h-screen bg-gray-950">
      <div className="m-auto w-96">
        <h1 className="text-white text-2xl">Dashboard</h1>
      </div>
      <div className="absolute right-4 top-4">
        <SignoutButton />
      </div>
    </div>
  );
}
