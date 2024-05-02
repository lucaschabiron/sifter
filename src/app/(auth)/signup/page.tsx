import { SignupForm } from "@/components/signupForm";
import { signup } from "./actions";
import { createClient } from "@/lib/db/server";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    redirect("/dashboard");
  }
  return (
    <div className="flex h-screen bg-gray-950">
      <div className="m-auto w-96">
        <SignupForm signup={signup} />
      </div>
    </div>
  );
}
