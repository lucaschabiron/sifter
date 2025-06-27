import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function SiftEditPage() {
  return (
    <div>
      <h1 className="hidden text-2xl font-semibold p-4 md:px-6 md:block">
        Sift Edit
      </h1>
      <main className="grid grid-cols-2 md:grid-cols-3 grid-rows-1 items-start gap-4 p-4 md:px-6 md:py-0 md:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Sift Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Individual sift page - coming soon!</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
