import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
export function SiftsHeader() {
  return (
    <div className="flex justify-between items-center py-2">
      <Link href="/sifts/create" className="ml-auto">
        <Button variant={"outline"} className="hover:bg-background/40">
          <PlusCircle className="mr-2" />
          Create Sift
        </Button>
      </Link>
    </div>
  );
}
