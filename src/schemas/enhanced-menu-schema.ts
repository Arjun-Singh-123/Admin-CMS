import * as z from "zod";

export const contactSchema = z.object({
  id: z.string().uuid().optional(),
  icon: z.string().nullable(),
  label: z.string().min(1, "Label is required"),
  value: z.string().optional(),
  type: z.enum([
    "phone",
    "hours",
    "location",
    "email",
    "support_email",
    "social",
    "login",
  ]),
  platform: z.enum(["facebook", "twitter", "instagram", "custom"]).nullable(),
  status: z.enum(["draft", "published"]).default("published"),
  position: z.enum(["left", "right"]).default("left"),
  button_style: z.enum(["primary", "secondary", "outline"]).nullable(),
  display_order: z
    .number()
    .int()
    .min(0, "Display order must be a non-negative integer")
    .optional(),

  // created_at: z.date().optional(),
  // updated_at: z.date().optional(),
});

export type Contact = z.infer<typeof contactSchema>;

export const defaultContactValues: Partial<Contact> = {
  icon: null,
  label: "",
  value: "",
  type: "phone",
  platform: null,
  status: "published",
  position: "left",
  button_style: null,
  display_order: 0,
};
