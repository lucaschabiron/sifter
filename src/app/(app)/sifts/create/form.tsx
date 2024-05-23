"use client";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const siftSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }), // Title
  topic: z.string().min(1, { message: "Topic is required" }), // Topic
  usualSources: z.string(),
  frequency: z.enum(["daily", "weekly", "monthly"]), // Frequency
  contentPreference: z.enum(["summaries", "detailed", "mixed"]), // Content Preference
});

export function CreateSiftForm() {
  const [loading, setLoading] = React.useState(false);

  const form = useForm<z.infer<typeof siftSchema>>({
    resolver: zodResolver(siftSchema),
    defaultValues: {
      title: "",
      topic: "",
      usualSources: "",
      frequency: "weekly",
      contentPreference: "summaries",
    },
  });

  function onSubmit(data: z.infer<typeof siftSchema>) {
    setLoading(true);
  }

  return (
    <div className="mx-auto w-full lg:w-1/2 md:w-2/3">
      <Form {...form}>
        <form className="my-8" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="my-4 space-y-6">
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
                    Don&apos;t worry, if you don&apos;t have any sources in mind
                    right now. You can always add them later.
                  </FormDescription>
                  <FormControl>
                    <Input
                      placeholder="Enter sources (comma separated URLs)"
                      {...field}
                      type="text"
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
                  <FormControl>
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Weekly" />
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
                  <FormControl>
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Summaries" />
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
          </div>
          <div className="flex justify-end">
            <Button disabled={loading} type="submit" className="w-full mt-6">
              {loading ? "Creating Sift..." : "Create Sift"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
