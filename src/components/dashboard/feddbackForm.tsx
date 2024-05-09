"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

const FormSchema = z.object({
  feedback: z.string().min(10, {
    message: "Feedback must be at least 10 characters.",
  }),
});

export function FeedbackForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      description: "Thank you for your feedback!",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Feedback</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What feature would you like to see next? How can we improve?"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Every feedback is valuable to us. Don&apos;t hesitate to share
                your thoughts.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
