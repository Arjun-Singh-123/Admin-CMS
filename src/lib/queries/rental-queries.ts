import { Feature } from "@/services/feature-services";
import { RentalPage } from "@/services/rental-services";
import { BASE_API_URL } from "@/types/benefit-types";

export async function fetchRentalPages(): Promise<RentalPage[]> {
  const response = await fetch(`${BASE_API_URL}/rental-pages`);
  if (!response.ok) {
    throw new Error("Failed to fetch rental pages");
  }
  return response.json();
}

export async function fetchFeatures(): Promise<Feature[]> {
  const response = await fetch(`${BASE_API_URL}/features`);
  if (!response.ok) {
    throw new Error("Failed to fetch features");
  }
  return response.json();
}

export async function createRentalPage(
  page: Omit<RentalPage, "id" | "features">,
  featureIds: number[]
): Promise<RentalPage> {
  const response = await fetch(`${BASE_API_URL}/rental-pages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page, featureIds }),
  });
  if (!response.ok) {
    throw new Error("Failed to create rental page");
  }
  return response.json();
}

export async function updateRentalPage(
  id: number,
  page: Omit<RentalPage, "id" | "features">,
  featureIds: number[]
): Promise<RentalPage> {
  const response = await fetch(`${BASE_API_URL}/rental-pages`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, page, featureIds }),
  });
  if (!response.ok) {
    throw new Error("Failed to update rental page");
  }
  return response.json();
}

export async function deleteRentalPage(id: number): Promise<void> {
  const response = await fetch(`${BASE_API_URL}/rental-pages`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error("Failed to delete rental page");
  }
}
