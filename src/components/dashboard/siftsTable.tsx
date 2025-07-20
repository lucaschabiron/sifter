"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Sift } from "@/lib/db/sifts";
import { Settings, Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface SiftsTableProps {
  sifts: Sift[];
}

export function SiftsTable({ sifts }: SiftsTableProps) {
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
        return "Not scheduled";
    }

    return nextIssue.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (sifts.length === 0) {
    return (
      <div className="text-center py-12">
        <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No sifts yet</h3>
        <p className="mt-2 text-muted-foreground">
          Create your first sift to start generating personalized newsletters.
        </p>
        <Link href="/sifts/create">
          <Button className="mt-4">Create Your First Sift</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Next Issue</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sifts.map((sift) => (
            <TableRow key={sift.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className="font-medium">{sift.title}</span>
                  <span className="text-sm text-muted-foreground">
                    Sift #{sift.id}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {sift.topic}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {sift.frequency}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={sift.active === false ? "secondary" : "default"}
                >
                  {sift.active === false ? "Inactive" : "Active"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">
                    {sift.active === false ? "Disabled" : getNextIssueDate(sift.frequency)}
                  </span>
                  {sift.active !== false && (
                    <span className="text-xs text-muted-foreground">
                      Every {sift.frequency}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(sift.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(sift.created_at).toLocaleDateString()}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/sifts/${sift.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/sifts/${sift.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
