import * as z from "zod";

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  price: z.string().optional(),
  image_url: z.string().url("Invalid URL for image").optional(),
  nav_section_id: z.string().min(1, "Navigation section is required"),
  href: z.string().optional(),
});

export const productDetailSchema = z.object({
  id: z.string().optional(),
  product_id: z.string().min(1, "Product is required"),
  title: z.string().min(2, "Title must be at least 2 characters."),
  subtitle: z.string(),
  description: z.string(),
  hero_image: z.array(z.string()).optional().nullable(),
  images: z
    .object({
      internal: z
        .array(z.string().url("Invalid URL for internal image"))
        .optional(),
      external: z
        .array(z.string().url("Invalid URL for external image"))
        .optional(),
    })
    .optional(),
  amenities: z
    .array(
      z.object({
        feature: z.string().optional(),
        value: z.string().optional(),
      })
    )
    .optional()
    .nullable()
    .transform((val) => val || []),

  // .transform((val) => (Array.isArray(val) ? val : [])), // Normalize null/undefined to []
  specifications: z
    .record(z.record(z.string().optional()).optional())
    .optional(),
});

export type Product = z.infer<typeof productSchema>;
export type ProductDetail = z.infer<typeof productDetailSchema>;
