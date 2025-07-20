"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Mail, 
  TrendingUp, 
  Clock, 
  Plus,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Sift } from "@/lib/db/sifts";
import type { Newsletter } from "@/lib/db/newsletters";

interface DashboardOverviewProps {
  sifts: Sift[];
  newsletters: Newsletter[];
  siftStats: {
    total: number;
    active: number;
    thisMonth: number;
  };
  newsletterStats: {
    total: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export function DashboardOverview({ 
  sifts, 
  newsletters, 
  siftStats, 
  newsletterStats 
}: DashboardOverviewProps) {
  const recentSifts = sifts.slice(0, 3);
  const recentNewsletters = newsletters.slice(0, 3);
  
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

  const nextScheduledSift = sifts
    .filter(sift => sift.active !== false)
    .map(sift => ({ ...sift, nextIssue: getNextIssueDate(sift.frequency) }))
    .filter(sift => sift.nextIssue)
    .sort((a, b) => (a.nextIssue!.getTime() - b.nextIssue!.getTime()))[0];

  return (
    <div className="grid gap-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sifts</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{siftStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {siftStats.active} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Newsletters</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newsletterStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {newsletterStats.thisWeek} this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{siftStats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">
              New sifts created
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Issue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextScheduledSift ? (
              <>
                <div className="text-2xl font-bold">
                  {formatDistanceToNow(nextScheduledSift.nextIssue!, { addSuffix: true })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {nextScheduledSift.title}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">None</div>
                <p className="text-xs text-muted-foreground">
                  No scheduled sifts
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Sifts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Sifts</CardTitle>
            <Link href="/sifts">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentSifts.length > 0 ? (
              <div className="space-y-4">
                {recentSifts.map((sift) => (
                  <div key={sift.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium">{sift.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {sift.topic}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created {formatDistanceToNow(new Date(sift.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={sift.active === false ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {sift.active === false ? "inactive" : sift.frequency}
                      </Badge>
                      <Link href={`/sifts/${sift.id}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Settings className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No sifts yet</p>
                <Link href="/sifts/create">
                  <Button size="sm" className="mt-2">
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first sift
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Newsletters */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Newsletters</CardTitle>
            <Link href="/newsletters">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentNewsletters.length > 0 ? (
              <div className="space-y-4">
                {recentNewsletters.map((newsletter) => (
                  <div key={newsletter.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{newsletter.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{newsletter.article_count} articles</span>
                        {newsletter.sent_at && (
                          <span>• Sent {formatDistanceToNow(new Date(newsletter.sent_at), { addSuffix: true })}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          newsletter.delivery_status === "sent" ? "default" :
                          newsletter.delivery_status === "failed" ? "destructive" : "secondary"
                        }
                        className="text-xs"
                      >
                        {newsletter.delivery_status}
                      </Badge>
                      <Link href={`/newsletters/${newsletter.id}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No newsletters yet</p>
                <p className="text-xs text-muted-foreground">
                  Newsletters will appear here after they&apos;re generated
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/sifts/create">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create New Sift
              </Button>
            </Link>
            <Link href="/sifts">
              <Button className="w-full justify-start" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Manage Sifts
              </Button>
            </Link>
            <Link href="/newsletters">
              <Button className="w-full justify-start" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                View Newsletters
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}