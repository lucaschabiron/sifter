import { z } from "zod";

const baseSiftSchema = {
  title: z.string().min(1, { message: "Title is required" }),
  topic: z.string().min(1, { message: "Topic is required" }),
  usualSources: z.string(),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  contentPreference: z.enum(["summaries", "detailed", "mixed"]),
};

export const createSiftSchema = z.object({
  ...baseSiftSchema,
  active: z.boolean().optional(),
});

export const updateSiftSchema = z.object({
  ...baseSiftSchema,
  active: z.boolean(),
});
