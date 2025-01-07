"use server";

import { revalidatePath, revalidateTag } from "next/cache";

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

async function sendRevalidationRequest(
  path: string | null,
  tag: string | null
) {
  try {
    const url = new URL("/api/revalidate", "http://localhost:3001");
    url.searchParams.append("secret", REVALIDATION_SECRET || "");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path, tag }),
    });

    if (!res.ok) {
      throw new Error("Failed to revalidate");
    }

    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Failed to revalidate: " + error.message);
    } else {
      throw new Error("Failed to revalidate");
    }
  }
}

export async function backendRevalidateProduct(productId: string) {
  console.log(`Backend: Revalidating product ${productId}`);
  await sendRevalidationRequest(null, `product-${productId}`);
  await sendRevalidationRequest("/products", null);
}

export async function backendRevalidateAllProducts() {
  console.log("Backend: Revalidating all products");
  await sendRevalidationRequest(null, "products");
  await sendRevalidationRequest("/products", null);
}
