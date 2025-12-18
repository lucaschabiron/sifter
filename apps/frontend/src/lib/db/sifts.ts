import { createClient } from "./server";
import type { Database } from "./database.types";

export type Sift = Database["public"]["Tables"]["sifts"]["Row"];

const BACKEND_URL = process.env.BACKEND_URL;

async function getSessionToken(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

export async function getUserSifts(): Promise<Sift[]> {
  if (!BACKEND_URL) {
    throw new Error("BACKEND_URL is not configured.");
  }

  const token = await getSessionToken();
  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/sifts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Error fetching sifts:", response.statusText);
      return [];
    }

    const data = (await response.json()) as unknown;
    if (Array.isArray(data)) {
      return data as Sift[];
    }

    return [];
  } catch (error) {
    console.error("Error fetching sifts:", error);
    return [];
  }
}

export async function getSiftById(id: string): Promise<Sift | null> {
  if (!BACKEND_URL) {
    throw new Error("BACKEND_URL is not configured.");
  }

  const token = await getSessionToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/sifts/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      console.error("Error fetching sift:", response.statusText);
      return null;
    }

    return (await response.json()) as Sift;
  } catch (error) {
    console.error("Error fetching sift:", error);
    return null;
  }
}

export function calculateSiftStats(sifts: Sift[]) {
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    total: sifts.length,
    active: sifts.filter((sift) => sift.active !== false).length,
    thisMonth: sifts.filter(
      (sift) => sift.created_at && new Date(sift.created_at) >= oneMonthAgo
    ).length,
  };
}
