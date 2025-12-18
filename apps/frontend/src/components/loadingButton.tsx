import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type LoadingButtonProps = {
  className?: string;
};
export function LoadingButton({ className }: LoadingButtonProps) {
  return (
    <Button disabled className={className}>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Please wait
    </Button>
  );
}
