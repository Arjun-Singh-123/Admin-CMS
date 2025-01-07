import { supabase } from "@/lib/supabase";

export const fetchHeaderNavItems = async () => {
  const { data, error } = await supabase
    .from("nav_items")
    .select(
      `
        *,
        nav_sections (
          *,
          products (*)
        )
      `
    )
    .order("name");
  if (error) throw error;
  return data;
};

export const fetchHeaderNavSections = async () => {
  const { data, error } = await supabase.from("nav_sections").select("*");
  if (error) throw error;
  return data;
};
