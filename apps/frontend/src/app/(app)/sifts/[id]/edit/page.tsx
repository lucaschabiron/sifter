import { createClient } from "@/lib/db/server";
import { getSiftById } from "@/lib/db/sifts";
import { EditSiftForm } from "./form";
import { notFound } from "next/navigation";

interface EditSiftPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSiftPage({ params }: EditSiftPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to edit this sift.</div>;
  }

  const sift = await getSiftById(id);

  if (!sift) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col gap-6">
        
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Sift</h1>
          <p className="text-muted-foreground">
            Update your sift settings and preferences
          </p>
        </div>

        <EditSiftForm sift={sift} />
      </div>
    </main>
  );
}