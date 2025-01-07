import { statsSchema } from "@/schemas/stats-schema";
import { z } from "zod";

export type StatsFormData = z.infer<typeof statsSchema>;
