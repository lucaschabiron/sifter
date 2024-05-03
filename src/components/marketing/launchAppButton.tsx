"use client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
export function LaunchAppButton() {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.push("/login")}
      className="text-gray-100 bg-gray-800/60 border-gray-400 border-2 rounded-lg hover:bg-gray-600/70 blured"
    >
      Launch App
    </Button>
  );
}
