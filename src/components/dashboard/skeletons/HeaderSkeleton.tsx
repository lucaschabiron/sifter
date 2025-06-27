import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Button size="icon" variant="outline" className="sm:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <Skeleton className="w-40 h-6 sm:bg-border" />

      <div className="ml-auto">
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full"
        >
          <User className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
}
