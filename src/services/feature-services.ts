import { query } from "@/lib/db";

export interface Feature {
  id: number;
  name: string;
}

export async function getFeatures(): Promise<Feature[]> {
  try {
    return await query<Feature>(`SELECT * FROM rentals `);
  } catch (error) {
    console.error(`Error fetching features: ${error}`);
    throw new Error(`Error fetching features: ${error}`);
  }
}

export async function createFeature(name: string): Promise<Feature> {
  const [feature] = await query<Feature>(
    `
    INSERT INTO features (name) VALUES ($1)
    RETURNING *
  `,
    [name]
  );
  return feature;
}

export async function updateFeature(
  id: number,
  name: string
): Promise<Feature> {
  const [feature] = await query<Feature>(
    `
    UPDATE features SET name = $2 WHERE id = $1
    RETURNING *
  `,
    [id, name]
  );
  return feature;
}

export async function deleteFeature(id: number): Promise<void> {
  await query(`DELETE FROM features WHERE id = $1`, [id]);
}
