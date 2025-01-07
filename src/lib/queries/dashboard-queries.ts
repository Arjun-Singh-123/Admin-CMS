import { BASE_API_URL } from "@/types/benefit-types";

export async function fetchSectionsDashboard() {
  console.log(`${BASE_API_URL}/sections`);
  const response = await fetch(`${BASE_API_URL}/sections`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch sections");
  }

  return await response.json();
}

export async function createSection(sectionData: any) {
  const response = await fetch(`${BASE_API_URL}/sections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sectionData),
  });

  if (!response.ok) {
    throw new Error("Failed to create section");
  }

  return await response.json();
}

export async function updateSection(sectionData: any) {
  const response = await fetch(`${BASE_API_URL}/sections`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sectionData),
  });

  if (!response.ok) {
    throw new Error("Failed to update section");
  }

  return await response.json();
}

export async function deleteSection(sectionId: number) {
  const response = await fetch(`${BASE_API_URL}/sections`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: sectionId }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete section");
  }

  return await response.json();
}
