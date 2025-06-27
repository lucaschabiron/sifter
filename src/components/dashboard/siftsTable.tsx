"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUserSifts, type Sift } from "@/lib/db/sifts";
import { useEffect, useState } from "react";

export function SiftsTable() {
  const [sifts, setSifts] = useState<Sift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSifts() {
      try {
        const userSifts = await getUserSifts();
        setSifts(userSifts);
      } catch (error) {
        console.error("Error fetching sifts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSifts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
    }

    return nextIssue.toLocaleDateString("en-US", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Sifts</CardTitle>
          <CardDescription>Loading your sifts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sifts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Sifts</CardTitle>
          <CardDescription>
            You haven&apos;t created any sifts yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              No sifts found. Create your first sift to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Sifts</CardTitle>
        <CardDescription>
          Here you can see all the sifts you have created.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="">
              <TableHead>Title</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead className="hidden sm:table-cell">Frequency</TableHead>
              <TableHead className="hidden sm:table-cell">Next Issue</TableHead>
              <TableHead className="hidden md:table-cell">Created at</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sifts.map((sift) => (
              <TableRow key={sift.id} className="h-16">
                <TableCell className="font-medium">{sift.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {sift.topic}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell capitalize">
                  {sift.frequency}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {getNextIssueDate(sift.frequency)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatDate(sift.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="">
        <div className="text-xs text-muted-foreground">
          Showing <strong>{sifts.length}</strong> sift
          {sifts.length !== 1 ? "s" : ""}
        </div>
      </CardFooter>
    </Card>
  );
}
