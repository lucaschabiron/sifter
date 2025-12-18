"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/server";

export async function deleteSift(id: string) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    throw new Error("Backend is not configured.");
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token) {
    throw new Error("Authentication token missing.");
  }

  const res = await fetch(`${backendUrl}/api/sifts/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    let message = "Failed to delete sift.";
    try {
      const data = await res.json();
      message = data?.error ?? data?.message ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  redirect("/sifts");
}
