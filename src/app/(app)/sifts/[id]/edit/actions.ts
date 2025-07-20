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

  try {
    // Update via backend API if available, otherwise update directly in Supabase
    const backendUrl = process.env.BACKEND_URL;
    
    if (backendUrl) {
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
        return { error: "Failed to update sift." };
      }
    } else {
      // Fallback to direct Supabase update
      const { error } = await supabase
        .from('sifts')
        .update({
          title: formData.title,
          topic: formData.topic,
          usual_sources: formData.usualSources,
          frequency: formData.frequency,
          content_preference: formData.contentPreference,
          active: formData.active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', parseInt(siftId));

      if (error) {
        return { error: "Failed to update sift." };
      }
    }

    redirect(`/sifts/${siftId}`);
  } catch {
    return { error: "Failed to update sift." };
  }
}