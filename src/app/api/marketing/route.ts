"use server";
import { serviceRoleClient } from "@/lib/db/service-role";
import { sendWaitlistMail } from "@/lib/mails/waitlist";
export async function POST(req: Request) {
  const { email } = await req.json();
  const supabase = serviceRoleClient();
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

  console.log("email", email);

  console.log("existingEmail", existingEmail);

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

  console.log("error", error);
  if (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 409,
    });
  }

  const mailError = await sendWaitlistMail(email);

  if (mailError) {
    return new Response(
      JSON.stringify({ message: "An error happened sending e-mail" }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 409,
      }
    );
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
