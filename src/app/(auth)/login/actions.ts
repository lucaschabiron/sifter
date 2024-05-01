"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/server";
import { LoginFormData } from "@/lib/forms/auth";
import { Provider } from "@supabase/supabase-js";

export async function login(formData: LoginFormData) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword(formData);
  if (error) {
    return error.message;
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function OAuthSignIn(provider: Provider) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: "http://localhost:3000/auth/callback",
    },
  });

  if (data.url) {
    redirect(data.url);
  }
}
