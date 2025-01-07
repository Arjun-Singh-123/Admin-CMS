import { query, querySingle, insert, update, remove } from "@/lib/db";

import { Product, ProductDetail } from "@/schemas/product-schema";

export async function fetchProducts(): Promise<Product[]> {
  console.log("[DB] Fetching all products");
  try {
    const products = await query<Product>("SELECT * FROM products");
    console.log(`[DB] Fetched ${products.length} products`);
    return products;
  } catch (error) {
    console.error("[DB] Error fetching products:", error);
    throw error;
  }
}

export async function fetchProductDetails(): Promise<ProductDetail[]> {
  console.log("[DB] Fetching all product details");
  try {
    const productDetails = await query<ProductDetail>(
      "SELECT * FROM product_details"
    );
    console.log(`[DB] Fetched ${productDetails.length} product details`);
    return productDetails;
  } catch (error) {
    console.error("[DB] Error fetching product details:", error);
    throw error;
  }
}

export async function fetchSingleProductDetail(
  productId: string
): Promise<ProductDetail | null> {
  console.log(`[DB] Fetching product detail for product ID: ${productId}`);
  try {
    const productDetail = await querySingle<ProductDetail>(
      "SELECT * FROM product_details WHERE product_id = $1",
      [productId]
    );
    console.log(
      `[DB] Fetched product detail: ${productDetail ? "found" : "not found"}`
    );
    return productDetail;
  } catch (error) {
    console.error("[DB] Error fetching single product detail:", error);
    throw error;
  }
}

export async function fetchNavSections() {
  console.log("[DB] Fetching all nav sections");
  try {
    const navSections = await query("SELECT * FROM nav_sections");
    console.log(`[DB] Fetched ${navSections.length} nav sections`);
    return navSections;
  } catch (error) {
    console.error("[DB] Error fetching nav sections:", error);
    throw error;
  }
}

export async function getProductData(productId: string) {
  console.log(`[DB] Fetching product data for ID: ${productId}`);
  try {
    const productData = await querySingle(
      `SELECT p.name, p.nav_section_id,
        json_build_object(
          'name', ns.name,
          'parent_id', ns.parent_id,
          'nav_items', (
            SELECT json_agg(json_build_object('name', ni.name))
            FROM nav_items ni
            WHERE ni.id = ns.parent_id
          )
        ) as nav_sections
      FROM products p
      LEFT JOIN nav_sections ns ON p.nav_section_id = ns.id
      WHERE p.id = $1`,
      [productId]
    );
    console.log(
      `[DB] Fetched product data: ${productData ? "found" : "not found"}`
    );
    return productData;
  } catch (error) {
    console.error("[DB] Error fetching product data:", error);
    return null;
  }
}

export async function saveProductDetail(
  data: ProductDetail,
  editingProductDetail: string | null
): Promise<void> {
  console.log(
    `[DB] ${editingProductDetail ? "Updating" : "Inserting"} product detail`
  );
  try {
    if (editingProductDetail) {
      await update("product_details", `id = '${editingProductDetail}'`, data);
    } else {
      await insert("product_details", data);
    }
    console.log("[DB] Product detail saved successfully");
  } catch (error) {
    console.error("[DB] Error saving product detail:", error);
    throw error;
  }
}

export async function saveProduct(
  data: Product,
  editingProductDetail: string | null
): Promise<void> {
  console.log(
    `[DB] ${editingProductDetail ? "Updating" : "Inserting"} product`
  );
  try {
    if (editingProductDetail) {
      await update("products", `id = '${editingProductDetail}'`, data);
    } else {
      await insert("products", data);
    }
    console.log("[DB] Product saved successfully");
  } catch (error) {
    console.error("[DB] Error saving product:", error);
    throw error;
  }
}

export async function deleteProductById(id: string): Promise<void> {
  console.log(`[DB] Deleting product with ID: ${id}`);
  try {
    await remove("products", `id = '${id}'`);
    console.log("[DB] Product deleted successfully");
  } catch (error) {
    console.error("[DB] Error deleting product:", error);
    throw error;
  }
}

export async function deleteProductDetailById(id: string): Promise<void> {
  console.log(`[DB] Deleting product detail with ID: ${id}`);
  try {
    await remove("product_details", `id = '${id}'`);
    console.log("[DB] Product detail deleted successfully");
  } catch (error) {
    console.error("[DB] Error deleting product detail:", error);
    throw error;
  }
}

// import { supabase } from "@/lib/supabase";
// import { Product, ProductDetail } from "@/schemas/product-schema";

// export const fetchProducts = async () => {
//   const { data, error } = await supabase.from("products").select("*");
//   if (error) throw error;
//   return data;
// };

// export const fetchProductDetails = async () => {
//   const { data, error } = await supabase.from("product_details").select("*");
//   if (error) throw error;
//   return data;
// };

// export const fetchSingleProductDetail = async (productId: any) => {
//   const { data, error } = await supabase
//     .from("product_details")
//     .select("*")
//     .eq("product_id", productId)
//     .single();
//   if (error) throw error;
//   return data;
// };
// export const fetchNavSections = async () => {
//   const { data, error } = await supabase.from("nav_sections").select("*");
//   if (error) throw error;
//   return data;
// };

// // This is how you could query Supabase for the required data.
// export const getProductData = async (productId: any) => {
//   const { data, error } = await supabase
//     .from("products")
//     .select(
//       `
//         name,
//         nav_section_id,
//         nav_sections (
//           name,
//           parent_id,
//           nav_items ( name )
//         )
//       `
//     )
//     .eq("id", productId)
//     .single(); // Assuming single product per query

//   if (error) {
//     console.error("Error fetching product data:", error);
//     return null;
//   }

//   return data;
// };

// export const saveProductDetail = async (
//   data: ProductDetail,
//   editingProductDetail: string | null
// ): Promise<void> => {
//   console.log("checking editing product detail", editingProductDetail);

//   if (editingProductDetail) {
//     const { error } = await supabase
//       .from("product_details")
//       .update(data)
//       .eq("id", editingProductDetail);

//     if (error) throw error;
//   } else {
//     const { error } = await supabase.from("product_details").insert(data);

//     if (error) throw error;
//   }
// };

// export const saveProduct = async (
//   data: Product,
//   editingProductDetail: string | null
// ): Promise<void> => {
//   console.log("checking editing product detail", editingProductDetail);

//   if (editingProductDetail) {
//     const { error } = await supabase
//       .from("products")
//       .update(data)
//       .eq("id", editingProductDetail);

//     if (error) throw error;
//   } else {
//     const { error } = await supabase.from("products").insert(data);

//     if (error) throw error;
//   }
// };

// // Delete product by ID
// export const deleteProductById = async (id: string): Promise<void> => {
//   const { error } = await supabase.from("products").delete().eq("id", id);
//   if (error) throw error;
// };

// // Delete product detail by ID
// export const deleteProductDetailById = async (id: string): Promise<void> => {
//   const { error } = await supabase
//     .from("product_details")
//     .delete()
//     .eq("id", id);
//   if (error) throw error;
// };
