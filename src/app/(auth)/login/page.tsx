import { LoginForm } from "@/components/loginForm";
import { login } from "./actions";

import { createClient } from "@/lib/db/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-gray-950">
      <div className="m-auto w-96">
        <LoginForm login={login} />
      </div>
    </div>
  );
}