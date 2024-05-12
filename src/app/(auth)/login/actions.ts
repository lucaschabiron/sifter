"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/server";
import { LoginFormData } from "@/lib/forms/auth";
import { Provider } from "@supabase/supabase-js";

export async function login(formData: LoginFormData) {
  const email = formData.email.trim().toLowerCase();
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: formData.password,
  });
  if (error) {
    return error.message;
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function OAuthSignIn(provider: Provider) {
  return;

  const supabase = createClient();

  const url = process.env.NEXT_PUBLIC_URL || "https://sifter-app.com";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${url}/auth/callback`,
    },
  });

  // if (data.url) {
  //   redirect(data.url);
  // }
}
