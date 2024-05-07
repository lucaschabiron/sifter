"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useState, useEffect } from "react";

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
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { LoadingButton } from "@/components/loadingButton";

const FormSchema = z.object({
  email: z.string().email(),
});

export function Waitlist() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.email) {
        setMessage(null); // Reset the error message when the email changes
      }
    });

    return () => subscription.unsubscribe(); // Cleanup subscription on component unmount
  }, [form]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setLoading(true);

    try {
      const response = await fetch("/api/marketing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (response.ok) {
        form.reset();
        toast({
          title: "Thank you for your interest!",
          description: result.message,
        });
        setLoading(false);
      } else {
        setMessage(result.message);
        setLoading(false);
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-black" id="waitlist">
      <div className="container px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-white ">
            Join our Waitlist
          </h2>
          <p className="text-gray-300 ">
            Experience the power of our AI-generated newsletters.
          </p>
          <div className="flex justify-center">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full flex justify-center space-x-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="w-2/3 lg:w-3/5">
                      <FormControl>
                        <Input
                          placeholder="Enter your email address"
                          className="text-gray-800 border-0 bg-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage>{message}</FormMessage>
                    </FormItem>
                  )}
                />

                {loading ? (
                  <LoadingButton className="w-36" />
                ) : (
                  <Button
                    type="submit"
                    className="bg-gray-700 hover:bg-gray-600  w-36 text-white"
                  >
                    Submit
                  </Button>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
