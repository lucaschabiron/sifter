"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/server";
import { SignupFormData } from "@/lib/forms/auth";
export async function signup(formData: SignupFormData) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return error.message;
  }

  console.log(data);

  revalidatePath("/", "layout");
  redirect("/");
}
