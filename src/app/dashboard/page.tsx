import { SignoutButton } from "@/components/signoutButton";

export default async function DashboardPage() {
  return (
    <div className="flex h-screen bg-gray-950">
      <div className="m-auto w-96">
        <h1 className="text-white text-2xl">Dashboard</h1>
      </div>
      <div className="absolute right-4 top-4">
        <SignoutButton />
      </div>
    </div>
  );
}
