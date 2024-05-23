import { Suspense } from "react";
import { CreateSiftForm } from "./form";

export default function CreateSiftPage() {
  return (
    <div>
      <h1 className="hidden text-2xl font-semibold p-4 md:px-6 md:block">
        Create Sift
      </h1>
      <main className="flex flex-col gap-4 p-4 md:px-6 md:py-0 md:gap-8">
        <Suspense fallback={<div>Loading...</div>}>
          <CreateSiftForm />
        </Suspense>
      </main>
    </div>
  );
}
