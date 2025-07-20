import { createClient } from "@/lib/db/server";
import { getNewsletterById } from "@/lib/db/newsletters";
import { NewsletterViewer } from "@/components/dashboard/newsletterViewer";
import { notFound } from "next/navigation";

interface NewsletterDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewsletterDetailPage({
  params,
}: NewsletterDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view this newsletter.</div>;
  }

  const newsletterId = parseInt(id);
  if (isNaN(newsletterId)) {
    notFound();
  }

  const newsletter = await getNewsletterById(newsletterId);

  if (!newsletter || newsletter.user_id !== user.id) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <NewsletterViewer newsletter={newsletter} />
    </main>
  );
}
