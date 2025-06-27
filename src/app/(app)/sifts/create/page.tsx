import { CreateSiftForm } from "./form";

export default function CreateSiftPage() {
  return (
    <div>
      <h1 className="hidden text-2xl font-semibold p-4 md:px-6 md:block">
        Create New Sift
      </h1>
      <main className="p-4 md:px-6 md:py-0">
        <CreateSiftForm />
      </main>
    </div>
  );
}
