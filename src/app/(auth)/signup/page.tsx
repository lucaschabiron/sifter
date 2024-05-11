import { SignupForm } from "@/components/auth/signupForm";
import { signup } from "./actions";
import { Header } from "@/components/marketing/header";

export default async function SignupPage() {
  return (
    <div className="flex h-screen bg-gray-950">
      <Header />
      <div className="m-auto w-96 mt-24 md:mt-auto">
        <SignupForm signup={signup} />
      </div>
    </div>
  );
}
