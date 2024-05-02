"use client";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
export function LaunchAppButton() {
  const onClick = () => {
    toast({
      title: "Coming Soon",
    });
  };
  return (
    <Button
      onClick={() => onClick()}
      className="text-gray-100 bg-gray-800/60 border-gray-400 border-2 rounded-lg hover:bg-gray-600/70 blured"
    >
      Launch App
    </Button>
  );
}
