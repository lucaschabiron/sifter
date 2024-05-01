"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/server";
import { LoginFormData } from "@/lib/forms/auth";

export async function login(formData: LoginFormData) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword(formData);
  if (error) {
    redirect("/");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
