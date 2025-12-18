"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteSift } from "@/app/(app)/sifts/[id]/actions";
import { toast } from "@/components/ui/use-toast";

interface DeleteSiftButtonProps {
  siftId: string;
}

export function DeleteSiftButton({ siftId }: DeleteSiftButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this sift?")) {
      return;
    }

    setIsLoading(true);
    startTransition(async () => {
      try {
        await deleteSift(siftId);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete sift.";
        toast({
          title: "Unable to delete sift",
          description: message,
          variant: "destructive",
        });
        setIsLoading(false);
      }
    });
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={isPending || isLoading}
    >
      {isPending || isLoading ? "Deleting..." : "Delete Sift"}
    </Button>
  );
}
