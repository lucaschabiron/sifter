"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { serviceRoleClient } from "@/lib/db/service-role";
import { SignupFormData } from "@/lib/forms/auth";

export async function signup(formData: SignupFormData) {
  const supabase = serviceRoleClient();

  const { error: hasBetaError, data: hasBetaAccess } = await supabase
    .from("waitlist")
    .select("beta_access")
    .eq("email", formData.email);

  if (hasBetaError) {
    return hasBetaError.message;
  }

  console.log(hasBetaAccess);

  if (!hasBetaAccess[0]!.beta_access) {
    return "You need access to the beta to sign up.";
  }

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
