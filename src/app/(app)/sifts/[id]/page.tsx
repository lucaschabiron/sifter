import { createClient } from "@/lib/db/server";
import { getSiftById } from "@/lib/db/sifts";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Settings, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";

interface SiftPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SiftPage({ params }: SiftPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view this sift.</div>;
  }

  const sift = await getSiftById(id);

  if (!sift) {
    notFound();
  }

  const getNextIssueDate = (frequency: string) => {
    const now = new Date();
    const nextIssue = new Date(now);

    switch (frequency) {
      case "daily":
        nextIssue.setDate(now.getDate() + 1);
        break;
      case "weekly":
        nextIssue.setDate(now.getDate() + 7);
        break;
      case "monthly":
        nextIssue.setMonth(now.getMonth() + 1);
        break;
      default:
        return null;
    }

    return nextIssue;
  };

  const nextIssue = getNextIssueDate(sift.frequency);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col gap-6">
        
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{sift.title}</h1>
            <p className="text-muted-foreground">
              Sift #{sift.id} • Created {formatDistanceToNow(new Date(sift.created_at), { addSuffix: true })}
            </p>
          </div>
          <Link href={`/sifts/${sift.id}/edit`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Sift
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Sift Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Sift Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Topic</h4>
                <Badge variant="outline" className="mt-1">
                  {sift.topic}
                </Badge>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Frequency</h4>
                <Badge variant="default" className="mt-1 capitalize">
                  {sift.frequency}
                </Badge>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Content Preference</h4>
                <Badge variant="outline" className="mt-1 capitalize">
                  {sift.content_preference}
                </Badge>
              </div>
              
              {sift.usual_sources && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Sources</h4>
                  <p className="text-sm mt-1 break-words">
                    {sift.usual_sources}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                <Badge 
                  variant={sift.active === false ? "secondary" : "default"}
                  className="mt-1"
                >
                  {sift.active === false ? "Inactive" : "Active"}
                </Badge>
              </div>
              
              {sift.active !== false && nextIssue && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Next Issue</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatDistanceToNow(nextIssue, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {nextIssue.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              
              {sift.active === false && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Next Issue</h4>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Newsletter generation is disabled
                  </p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                <p className="text-sm mt-1">
                  {new Date(sift.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Link href={`/sifts/${sift.id}/edit`}>
                <Button variant="outline">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Settings
                </Button>
              </Link>
              <Button variant="outline" disabled>
                Generate Newsletter
              </Button>
              <Button variant="outline" disabled>
                View History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
