export interface Benefit {
  id: string;
  icon: string;
  title: string;
  description: string;
  display_order: number;
}
export const BASE_API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_PROD_API_URL
    : process.env.NEXT_PUBLIC_BASE_API_URL;
