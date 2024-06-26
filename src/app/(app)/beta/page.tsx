import { FeedbackForm } from "@/components/dashboard/feedbackForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BetaPage() {
  const releases = [
    {
      id: 1,
      title: "Version 0.1.0",
      description: "Initial release of the beta program.",
      date: "2024.05.10",
    },
  ];

  return (
    <div className="flex flex-col">
      <Card className="md:w-1/3 lg:w-1/4 md:fixed md:right-4 m-4">
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <FeedbackForm />
        </CardContent>
      </Card>
      <main className="items-start p-4 sm:px-6 gap-2 md:gap-4 md:w-1/2 lg:w-2/3 ">
        <h1 className="text-2xl font-semibold">Beta</h1>
        <p>You are part of the beta program. Thank you for your support!</p>

        <h2 className="text-xl font-semibold mt-4">What&apos;s new?</h2>
        {releases.map((release) => (
          <div
            key={release.id}
            className="flex flex-col gap-2 border-l-2 border-foreground pl-4 mt-4"
          >
            <h3 className="text-lg font-semibold">
              {release.title} - {release.date}
            </h3>
            <p>{release.description}</p>
          </div>
        ))}
      </main>
    </div>
  );
}
