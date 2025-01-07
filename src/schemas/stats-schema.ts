import * as z from "zod";

const statItemSchema = z.object({
  icon: z.string().min(1, "Icon is required"),
  count: z.number().min(0, "Count must be a positive number"),
  title: z.string().min(1, "Title is required"),
});

export const statsSchema = z.object({
  stats: z.array(statItemSchema).min(1, "At least one stat item is required"),
});
