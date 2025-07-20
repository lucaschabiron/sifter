"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newsletter } from "@/lib/db/newsletters";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Eye, Mail } from "lucide-react";

interface NewslettersTableProps {
  newsletters: Newsletter[];
}

export function NewslettersTable({ newsletters }: NewslettersTableProps) {
  if (newsletters.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No newsletters yet</h3>
        <p className="mt-2 text-muted-foreground">
          Your generated newsletters will appear here once they&apos;re sent.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Articles</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {newsletters.map((newsletter) => (
            <TableRow key={newsletter.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className="font-medium">{newsletter.title}</span>
                  <span className="text-sm text-muted-foreground">
                    Newsletter #{newsletter.id}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{newsletter.article_count}</span>
                  <span className="text-sm text-muted-foreground">
                    articles
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {newsletter.sent_at ? (
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(newsletter.sent_at), {
                        addSuffix: true,
                      })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(newsletter.sent_at).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Not sent</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    newsletter.delivery_status === "sent"
                      ? "default"
                      : newsletter.delivery_status === "failed"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {newsletter.delivery_status}
                </Badge>
              </TableCell>
              <TableCell>
                <Link href={`/newsletters/${newsletter.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
