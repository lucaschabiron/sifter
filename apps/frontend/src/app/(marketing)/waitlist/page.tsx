import { Header } from "@/components/marketing/header";
import { Waitlist } from "@/components/marketing/waitlist";

export default function waitlistPage() {
  return (
    <div className="flex flex-col h-screen bg-black">
      <Header />
      <div className="flex flex-col items-center justify-center flex-1">
        <Waitlist />
      </div>
    </div>
  );
}
