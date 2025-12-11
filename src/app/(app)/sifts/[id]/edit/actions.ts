"use server";

import { redirect } from "next/navigation";
import { EditSiftFormData } from "@/lib/forms/sifts";
import { createClient } from "@/lib/db/server";

export async function updateSift(
  siftId: string,
  formData: EditSiftFormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const token = (await supabase.auth.getSession()).data?.session?.access_token;
  
  if (!token) {
    return { error: "You must be signed in to update a sift." };
  }

  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return { error: "Backend is not configured." };
  }

  try {
    const res = await fetch(`${backendUrl}/api/sifts/${siftId}`, {
      method: "PUT",
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
        active: formData.active,
      }),
    });

    if (!res.ok) {
      let errorMessage = "Failed to update sift.";
      try {
        const data = await res.json();
        errorMessage = data?.error ?? data?.message ?? errorMessage;
      } catch {
        // ignore parsing errors
      }
      return { error: errorMessage };
    }

    redirect(`/sifts/${siftId}`);
  } catch (error) {
    console.error("Failed to update sift:", error);
    return { error: "Failed to update sift." };
  }
}
