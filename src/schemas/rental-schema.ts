import { z } from "zod";
export interface FieldSchema {
  name: string;
  type: "text" | "number" | "boolean";
  label: string;
  required: boolean;
  hidden: boolean;
}

export interface CategoryInfo {
  title: string;
  description: string;
  features: any[];
  image: string;
}

// export interface RentalSchema {
//   id: string;
//   members: FieldSchema[];
//   non_members: FieldSchema[];
//   categoryInfo: CategoryInfo;
// }
export const RentalSchema = z.object({
  categoryInfo: z.object({
    title: z.string(),
    description: z.string(),
    features: z.array(z.string()),
    image: z.string(),
  }),
  members: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["text", "number", "boolean"]),
      label: z.string(),
      required: z.boolean(),
      hidden: z.boolean(),
    })
  ),
  non_members: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["text", "number", "boolean"]),
      label: z.string(),
      required: z.boolean(),
      hidden: z.boolean(),
    })
  ),
});
export interface RentalData {
  id: string;
  members: Record<string, any>[];
  non_members: Record<string, any>[];
  category_info: CategoryInfo;
}
type FormValues = z.infer<typeof RentalSchema>;

export const defaultRentalSchema: FormValues = {
  members: [
    {
      name: "vessel_name",
      type: "text",
      label: "Vessel Name",
      required: true,
      hidden: false,
    },
    {
      name: "length",
      type: "text",
      label: "Length",
      required: true,
      hidden: false,
    },
    {
      name: "weekday",
      type: "text",
      label: "Weekday Rate",
      required: true,
      hidden: false,
    },
    {
      name: "weekend",
      type: "text",
      label: "Weekend Rate",
      required: true,
      hidden: false,
    },
    {
      name: "half_day",
      type: "text",
      label: "Half Day Rate",
      required: true,
      hidden: false,
    },
  ],
  non_members: [
    {
      name: "vessel_name",
      type: "text",
      label: "Vessel Name",
      required: true,
      hidden: false,
    },
    {
      name: "length",
      type: "text",
      label: "Length",
      required: true,
      hidden: false,
    },
    {
      name: "weekday",
      type: "text",
      label: "Weekday Rate",
      required: true,
      hidden: false,
    },
    {
      name: "weekend",
      type: "text",
      label: "Weekend Rate",
      required: true,
      hidden: false,
    },
    {
      name: "half_day",
      type: "text",
      label: "Half Day Rate",
      required: true,
      hidden: false,
    },
  ],
  category_info: {
    title: "Our Fleet",
    description:
      "Enjoy a day out on the waves—without owning your own boat! Our rental services are perfect for people looking to experience the joys of sailing without worrying about the upkeep, capital investment, and ownership of an expensive sailboat. All prices below include insurance and cleanup after your charter.",
    features: [
      "Inboard Engines",
      "VHF Radio",
      "Blue-tooth Stereo",
      "Showers",
      "Ice Box",
      "Stoves",
      "Compass",
      "Bow Anchor",
      "Radar/Chart Plotters",
      "Roller Furling Headsails",
      "Biminis/Dodgers",
      "Auto Pilot",
    ],
    image: "/placeholder.svg?height=400&width=600",
  },
};

export const FieldSchema = z.object({
  name: z.string(),
  type: z.union([z.literal("text"), z.literal("number"), z.literal("boolean")]),
  label: z.string(),
  required: z.boolean(),
  hidden: z.boolean(),
});

export const CategoryInfoSchema = z.object({
  title: z.string(),
  description: z.string(),
  features: z.array(z.string()).default([]),
  image: z.string(),
});
