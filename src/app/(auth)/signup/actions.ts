"use server";

import { redirect } from "next/navigation";
import { serviceRoleClient } from "@/lib/db/service-role";
import { SignupFormData } from "@/lib/forms/auth";

export async function signup(formData: SignupFormData) {
  const email = formData.email.trim().toLowerCase();
  const supabase = serviceRoleClient();

  const { data: alreadyRegisteredData, error: alreadyRegisteredError } =
    await supabase.from("profiles").select().eq("email", email);

  if (alreadyRegisteredError) {
    return alreadyRegisteredError.message;
  }

  if (alreadyRegisteredData.length > 0) {
    return "You are already registered.";
  }

  const { error: hasBetaError, data: hasBetaAccess } = await supabase
    .from("waitlist")
    .select("beta_access")
    .eq("email", email)
    .maybeSingle();

  if (hasBetaError) {
    return hasBetaError.message;
  }

  // If user is not in waitlist or doesn't have beta access
  if (!hasBetaAccess || !hasBetaAccess.beta_access) {
    return "You need to be on the waitlist with beta access to sign up.";
  }

  const { error } = await supabase.auth.signUp({
    email: email,
    password: formData.password,
  });

  if (error) {
    return error.message;
  }

  redirect(`/auth/confirm-email?email=${encodeURIComponent(email)}`);
}
