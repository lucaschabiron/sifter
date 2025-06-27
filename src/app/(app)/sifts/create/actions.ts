"use server";

import { redirect } from "next/navigation";
import { CreateSiftFormData } from "@/lib/forms/sifts";
import { createClient } from "@/lib/db/server";

export async function createSift(
  formData: CreateSiftFormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const token = (await supabase.auth.getSession()).data?.session?.access_token;
  if (!token) {
    return { error: "You must be signed in to create a sift." };
  }
  const res = await fetch(`${process.env.BACKEND_URL}/api/sifts/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: formData.title,
      topic: formData.topic,
      usualSources: formData.usualSources,
      frequency: formData.frequency,
      contentPreference: formData.contentPreference,
    }),
  });
  return res.ok ? redirect("/sifts") : { error: "Failed to create sift." };
}
