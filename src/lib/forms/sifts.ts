import { z } from "zod";

export const createSiftSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }), // Title
  topic: z.string().min(1, { message: "Topic is required" }), // Topic
  usualSources: z.string(),
  frequency: z.enum(["daily", "weekly", "monthly"]), // Frequency
  contentPreference: z.enum(["summaries", "detailed", "mixed"]), // Content Preference
  active: z.boolean().optional(), // Active (defaults to true)
});

export const editSiftSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  topic: z.string().min(1, { message: "Topic is required" }),
  usualSources: z.string(),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  contentPreference: z.enum(["summaries", "detailed", "mixed"]),
  active: z.boolean(),
});

export type CreateSiftFormData = z.infer<typeof createSiftSchema>;
export type EditSiftFormData = z.infer<typeof editSiftSchema>;
