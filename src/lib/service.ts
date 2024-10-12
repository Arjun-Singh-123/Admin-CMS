import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

// Types
type Item = {
  id: string;
  name: string;
  href: string;
  status: "draft" | "published";
};

type Product = Item & {
  price: number;
  description: string;
  subcategory_id: string;
  details: any;
};

// Generic fetch function
const fetchItems = async (table: string) => {
  const { data, error } = await supabase.from(table as any).select("*");
  if (error) throw error;
  return data;
};

// Generic create function
const createItem = async (table: string, item: Partial<Item | Product>) => {
  const { data, error } = await supabase
    .from(table as any)
    .insert(item)
    .single();
  if (error) throw error;
  return data;
};

// Generic update function
const updateItem = async (
  table: string,
  id: string,
  updates: Partial<Item | Product>
) => {
  const { data, error } = await supabase
    .from(table as any)
    .update(updates)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};
// Queries
export const useMenuItems = () => {
  return useQuery({
    queryKey: ["menuItems"],
    queryFn: () => fetchItems("menu_items"),
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchItems("categories"),
  });
};

export const useSubcategories = () => {
  return useQuery({
    queryKey: ["subcategories"],
    queryFn: () => fetchItems("subcategories"),
  });
};

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => fetchItems("products"),
  });
};

// Mutations
export const useCreateItem = (table: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item) => createItem(table, item as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
      toast.success(`${table.slice(0, -1)} created successfully!`); // Toast for success
    },
    onError: (error) => {
      toast.error(`Error creating ${table.slice(0, -1)}: ${error.message}`); // Toast for error
    },
  });
};

export const useUpdateItem = (table: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: any; updates: any }) =>
      updateItem(table, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
      toast.success(`${table.slice(0, -1)} updated successfully!`); // Toast for success
    },
    onError: (error) => {
      toast.error(`Error updating ${table.slice(0, -1)}: ${error.message}`); // Toast for error
    },
  });
};

// New function for uploading images to Supabase storage
export const uploadImage = async (file: File, bucket: string) => {
  const { data, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(`${Date.now()}_${file.name}`, file);

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);
  // Check if publicUrlData is defined
  if (!publicUrl) {
    throw new Error("Failed to get public URL");
  }
  return publicUrl;
};

export const uploadImagesAndGetUrls = async (
  files: FileList
): Promise<string[]> => {
  const urls: string[] = [];

  for (const file of Array.from(files)) {
    const filePath = `uploads/${file.name}`;
    try {
      const { data, error } = await supabase.storage
        .from("your-bucket-name")
        .upload(filePath, file);

      if (error) {
        console.error("Upload error:", error);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("your-bucket-name").getPublicUrl(filePath);

      urls.push(publicUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }

  return urls;
};

//   export const handleImageUpload = async (files: FileList, type: 'internal' | 'external') => {

//     const urls = await uploadImagesAndGetUrls(files);

//     setProductDetail((prevDetail) => ({
//       ...prevDetail,
//       images: {
//         ...prevDetail.images,
//         [type]: [...prevDetail.images[type], ...urls],
//       },
//     }));
//   };
