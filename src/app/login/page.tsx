import { LoginForm } from "@/components/loginForm";
import { login } from "./actions";

export default function LoginPage() {
  return (
    <div className="flex h-screen bg-gray-950">
      <div className="m-auto w-96">
        <LoginForm login={login} />
      </div>
    </div>
  );
}
