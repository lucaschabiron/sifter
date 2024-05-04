import { serviceRoleClient } from "@/lib/db/service-role";
import { redirect } from "next/navigation";

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  if (!searchParams.email) {
    redirect("/login");
  }
  const supabase = serviceRoleClient();
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("email", searchParams.email);

  if (error) {
    redirect("/login");
  }

  if (data.length === 0) {
    redirect("/login");
  }

  if (data[0].confirmed_at) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col items-center text-center justify-center h-screen space-y-4 text-gray-200">
      <h1 className="text-4xl font-bold">Confirm your email address</h1>
      <p className="text-lg">
        We&apos;ve sent an email to <strong>{searchParams.email}</strong>.<br />
        If you don&apos;t see it, check your spam folder.
      </p>
    </div>
  );
}
