"use server";

import { redirect } from "next/navigation";
import { CreateSiftFormData } from "@/lib/forms/sifts";
import { createClient } from "@/lib/db/server";

export async function createSift(
  formData: CreateSiftFormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "You must be signed in to create a sift." };
  }

  try {
    // Try backend API first if available
    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl) {
      const token = (await supabase.auth.getSession()).data?.session?.access_token;
      const res = await fetch(`${backendUrl}/api/sifts/create`, {
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
          active: formData.active ?? true,
        }),
      });
      
      if (res.ok) {
        redirect("/sifts");
        return {};
      }
    }

    // Fallback to direct Supabase creation
    const { error } = await supabase
      .from('sifts')
      .insert({
        user_id: user.id,
        title: formData.title,
        topic: formData.topic,
        usual_sources: formData.usualSources,
        frequency: formData.frequency,
        content_preference: formData.contentPreference,
        active: formData.active ?? true,
      });

    if (error) {
      return { error: "Failed to create sift." };
    }

    redirect("/sifts");
  } catch {
    return { error: "Failed to create sift." };
  }
}
