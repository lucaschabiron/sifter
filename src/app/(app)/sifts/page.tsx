import { SiftsHeader } from "@/components/dashboard/siftsHeader";
import { SiftsTable } from "@/components/dashboard/siftsTable";

export default function SiftsPage() {
  return (
    <div className="flex flex-col px-4">
      <main className="items-start sm:px-4 ">
        <SiftsHeader />
        <SiftsTable />
      </main>
    </div>
  );
}
