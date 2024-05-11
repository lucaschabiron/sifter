import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import Countdown from "@/components/dashboard/countdown";
import { FeedbackForm } from "@/components/dashboard/feedbackForm";
import placeholder from "@/components/placeholder.png";

export default async function DashboardPage() {
  const nextIssue = { siftName: "AI/ML Sift", siftURL: "/sifts/1" };
  const nextIssueDate = new Date("2024-05-15");
  const nextIssueString = nextIssueDate.toISOString();
  return (
    <>
      <h1 className="hidden text-2xl font-semibold p-4 sm:px-6 md:block">
        Dashboard
      </h1>
      <main className="grid grid-cols-2 md:grid-cols-3 grid-rows-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Card className="col-span-2 md:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Latest Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/issues/1">
              <div className="flex justify-center aspect-auto">
                <Image
                  src={placeholder}
                  alt="Your latest issue"
                  className="rounded-lg"
                />
              </div>
            </Link>
          </CardContent>
        </Card>
        <div className="col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Next Issue{" "}
                <span className="underline">
                  <Link href={nextIssue.siftURL}>({nextIssue.siftName})</Link>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <Countdown targetDate={nextIssueString} />
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <FeedbackForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
