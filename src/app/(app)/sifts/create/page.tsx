import { CreateSiftForm } from "./form";

export default function CreateSiftPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col gap-6">
        
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Sift</h1>
          <p className="text-muted-foreground">
            Set up a new personalized newsletter sift
          </p>
        </div>

        <CreateSiftForm />
      </div>
    </main>
  );
}
