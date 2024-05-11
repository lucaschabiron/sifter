import { LoginForm } from "@/components/auth/loginForm";
import { login } from "./actions";

import { createClient } from "@/lib/db/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/marketing/header";

export default async function LoginPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-gray-950">
      <Header />
      <div className="m-auto w-96">
        <LoginForm login={login} />
      </div>
    </div>
  );
}
