"use client";

import { LoadingButton } from "./loadingButton";
import { Button } from "./ui/button";
import { useState } from "react";

export function SignoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <form
      action="/auth/signout"
      method="post"
      onSubmit={() => setIsLoading(true)}
    >
      {isLoading ? (
        <LoadingButton className="w-36 bg-gray-200 text-black" />
      ) : (
        <Button
          type="submit"
          className="w-36 bg-gray-200 hover:bg-gray-100 text-black"
        >
          Sign out
        </Button>
      )}
    </form>
  );
}
