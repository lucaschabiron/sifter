"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { createClient } from "@/lib/db/client";
import Link from "next/link";

export async function AccountDropdown() {
  const getUserData = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error(error);
    }
    return data.user;
  };

  const user = await getUserData();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full"
        >
          <User className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/settings">
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </Link>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action="/auth/signout" method="post">
          <button type="submit" className="w-full">
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
