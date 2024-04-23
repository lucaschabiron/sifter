import { supabase } from "@/lib/db/supabase";

export async function POST(req: Request) {
  const { email } = await req.json();

  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(email)) {
    return new Response(
      JSON.stringify({ message: "Invalid e-mail address." }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }

  const { data: existingEmail } = await supabase
    .from("waitlist")
    .select("email")
    .eq("email", email);

  if (existingEmail?.length) {
    return new Response(
      JSON.stringify({ message: "E-mail already on the waitlist." }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 409,
      }
    );
  }

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
