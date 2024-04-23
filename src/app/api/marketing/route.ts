import { supabase } from "@/lib/db/supabase";

interface WaitlistRequest {
  email: string;
}

export async function POST(req: Request) {
  const { email } = await req.json();

  const { error } = await supabase.from("waitlist").insert({ email: email });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return new Response(
    JSON.stringify({ message: "E-mail added to the waitlist." }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
