"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { editSiftSchema } from "@/lib/forms/sifts";
import { updateSift } from "./actions";
import Link from "next/link";
import type { Sift } from "@/lib/db/sifts";

interface EditSiftFormProps {
  sift: Sift;
}

export function EditSiftForm({ sift }: EditSiftFormProps) {
  const [loading, setLoading] = React.useState(false);

  const form = useForm<z.infer<typeof editSiftSchema>>({
    resolver: zodResolver(editSiftSchema),
    defaultValues: {
      title: sift.title,
      topic: sift.topic,
      usualSources: sift.usual_sources || "",
      frequency: sift.frequency as "daily" | "weekly" | "monthly",
      contentPreference: sift.content_preference as "summaries" | "detailed" | "mixed",
      active: sift.active ?? true,
    },
  });

  async function onSubmit(formData: z.infer<typeof editSiftSchema>) {
    setLoading(true);

    const { error } = (await updateSift(sift.id.toString(), formData)) || {};
    if (error) {
      form.setError("contentPreference", { message: error });
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Sift Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter sift title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter sift topic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="usualSources"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usual Sources</FormLabel>
                    <FormDescription>
                      Add URLs or RSS feeds, separated by commas. Leave empty to let AI discover sources automatically.
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="https://example.com/rss, https://blog.example.com/feed"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <FormDescription>
                      How often should newsletters be generated for this sift?
                    </FormDescription>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contentPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Preference</FormLabel>
                    <FormDescription>
                      Choose how detailed you want the newsletter content to be.
                    </FormDescription>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select content preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="summaries">Summaries</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Active Sift
                      </FormLabel>
                      <FormDescription>
                        Enable or disable newsletter generation for this sift.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Link href={`/sifts/${sift.id}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button disabled={loading} type="submit">
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}