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

import { createSiftSchema as siftSchema } from "@/lib/forms/sifts";
import { createSift } from "./actions";

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

  async function onSubmit(formData: z.infer<typeof siftSchema>) {
    setLoading(true);

    const { error } = (await createSift(formData)) || {};
    if (error) {
      form.setError("contentPreference", { message: error });
    }
    setLoading(false);
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
