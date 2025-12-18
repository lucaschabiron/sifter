import { LoginForm } from "@/components/auth/loginForm";
import { login } from "./actions";
import { Header } from "@/components/marketing/header";

export default async function LoginPage() {
  return (
    <div className="flex h-screen bg-gray-950">
      <Header />
      <div className="m-auto w-96 mt-24 md:mt-auto">
        <LoginForm login={login} />
      </div>
    </div>
  );
}
