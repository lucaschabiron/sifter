import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import Countdown from "@/components/dashboard/countdown";

export default async function DashboardPage() {
  const nextIssue = { siftName: "AI/ML Sift", siftURL: "/sifts/1" };
  const nextIssueDate = new Date("2024-05-15");
  const nextIssueString = nextIssueDate.toISOString();
  return (
    <>
      <h1 className="text-2xl font-semibold p-4 sm:px-6 ">Dashboard</h1>
      <main className="grid grid-cols-2 md:grid-cols-3 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Latest Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/issues/1">
              <Image
                src="/images/issue.png"
                alt="Your latest issue"
                width={400}
                height={200}
              />
            </Link>
          </CardContent>
        </Card>
        <Card className="col-span-2 ">
          <CardHeader>
            <CardTitle>
              Next Issue{" "}
              <span className="underline">
                <Link href={nextIssue.siftURL}>({nextIssue.siftName})</Link>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg">
            <Countdown targetDate={nextIssueString} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
