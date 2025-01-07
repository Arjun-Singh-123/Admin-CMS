import { query } from "@/lib/db";
import { defaultRentalSchema, RentalData } from "@/schemas/rental-schema";

export async function getRentals(): Promise<RentalData[]> {
  try {
    const results = await query<RentalData>(`
      SELECT * FROM rentals
    `);
    return results.length > 0
      ? results
      : [
          {
            id: "rental_data",
            members: [],
            non_members: [],
            category_info: defaultRentalSchema.categoryInfo,
          },
        ];
  } catch (error) {
    console.error("Error fetching rentals:", error);
    throw new Error("Failed to fetch rentals");
  }
}

export async function getRentalById(
  id: string | number
): Promise<RentalData | null> {
  try {
    const [result] = await query<RentalData>(
      `
      SELECT * FROM rentals WHERE id = $1
    `,
      [id]
    );
    return result || null;
  } catch (error) {
    console.error("Error fetching rental:", error);
    throw new Error("Failed to fetch rental");
  }
}

export async function createRental(
  rental: Omit<RentalData, "id">
): Promise<RentalData> {
  try {
    const keys = Object.keys(rental);
    const values = Object.values(rental);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");

    const queryText = `
      INSERT INTO rentals (${keys.join(", ")})
      VALUES (${placeholders})
      RETURNING *
    `;

    const [createdRental] = await query<RentalData>(
      queryText,
      values.map((v) => (typeof v === "object" ? JSON.stringify(v) : v))
    );
    return createdRental;
  } catch (error) {
    console.error("Error creating rental:", error);
    throw new Error("Failed to create rental");
  }
}

export async function updateRental(
  id: string | number,
  rental: Partial<RentalData>
): Promise<RentalData> {
  try {
    console.log("checdking id", id);
    // Validate ID is a UUID
    console.log(rental);
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (typeof id !== "string" || !uuidRegex.test(id)) {
      throw new Error(`Invalid UUID: ${id}`);
    }

    const keys = Object.keys(rental);
    const values = Object.values(rental);

    if (keys.length === 0) throw new Error("No fields to update.");

    const setClause = keys
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");

    const queryText = `
      UPDATE rentals
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    const params = [
      id,
      ...values.map((v) => (typeof v === "object" ? JSON.stringify(v) : v)),
    ];

    const [updatedRental] = await query<RentalData>(queryText, params);
    return updatedRental;
  } catch (error) {
    console.error("Error updating rental:", error);
    throw error;
  }
}

export async function deleteRental(id: string): Promise<void> {
  try {
    await query(
      `
      DELETE FROM rentals
      WHERE id = $1
    `,
      [id]
    );
  } catch (error) {
    console.error("Error deleting rental:", error);
    throw new Error("Failed to delete rental");
  }
}

export async function deleteAllRentals(): Promise<void> {
  try {
    await query(`
      DELETE FROM rentals
    `);
  } catch (error) {
    console.error("Error deleting all rentals:", error);
    throw new Error("Failed to delete all rentals");
  }
}

// import { query } from "@/lib/db";

// export interface Rental {
//   id: string;
//   members: any[];
//   non_members: any[];
//   created_at: string;
//   updated_at: string;
// }

// export async function getRentals(): Promise<Rental | null> {
//   try {
//     const [rental] = await query<Rental>(`
//       SELECT * FROM rentals
//     `);
//     return rental;
//   } catch (error) {
//     console.error("Error fetching rentals:", error);
//     throw new Error("Failed to fetch rentals");
//   }
// }

// export async function updateRentals(
//   rental: Omit<Rental, "id" | "created_at" | "updated_at">
// ): Promise<Rental> {
//   try {
//     const keys = Object.keys(rental);
//     const values = Object.values(rental);

//     const columns = keys.join(", ");
//     const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
//     const updateClause = keys
//       .map((key, index) => `${key} = EXCLUDED.${key}`)
//       .join(", ");

//     const queryText = `
//       INSERT INTO rentals (${columns})
//       VALUES (${placeholders})
//       ON CONFLICT (id) DO UPDATE
//       SET ${updateClause}
//       RETURNING *
//     `;

//     const [updatedRental] = await query<Rental>(queryText, values);
//     return updatedRental;
//   } catch (error) {
//     console.error("Error updating rental:", error);
//     throw new Error("Failed to update rental");
//   }
// }

// export async function deleteRentals(): Promise<void> {
//   try {
//     await query(`DELETE FROM rentals`);
//   } catch (error) {
//     console.error("Error deleting rentals:", error);
//     throw new Error("Failed to delete rentals");
//   }
// }

// import { query } from "@/lib/db";
// import { Feature } from "./feature-services";

// export interface RentalPage {
//   id: number;
//   title: string;
//   description: string;
//   imageUrl: string | null;
//   features: Feature[];
// }

// export async function getRentalPages(): Promise<RentalPage[]> {
//   const pages = await query<RentalPage>(`
//     SELECT rp.*, json_agg(f.*) as features
//     FROM rentals rp
//     LEFT JOIN rental_page_features rpf ON rp.id = rpf.rental_page_id
//     LEFT JOIN features f ON rpf.feature_id = f.id
//     GROUP BY rp.id

//   `);
//   return pages.map((page) => ({
//     ...page,
//     features: page.features.filter((f) => f.id !== null),
//   }));
// }

// export async function createRentalPage(
//   page: Omit<RentalPage, "id" | "features">,
//   featureIds: number[]
// ): Promise<RentalPage> {
//   const [newPage] = await query<RentalPage>(
//     `
//     INSERT INTO rental_pages (title, description, image_url)
//     VALUES ($1, $2, $3)
//     RETURNING *
//   `,
//     [page.title, page.description, page.imageUrl]
//   );

//   await Promise.all(
//     featureIds.map((featureId) =>
//       query(
//         `
//       INSERT INTO rental_page_features (rental_page_id, feature_id)
//       VALUES ($1, $2)
//     `,
//         [newPage.id, featureId]
//       )
//     )
//   );

//   return getRentalPage(newPage.id);
// }

// export async function updateRentalPage(
//   id: number,
//   page: Omit<RentalPage, "id" | "features">,
//   featureIds: number[]
// ): Promise<RentalPage> {
//   await query(
//     `
//     UPDATE rental_pages
//     SET title = $2, description = $3, image_url = $4
//     WHERE id = $1
//   `,
//     [id, page.title, page.description, page.imageUrl]
//   );

//   await query(`DELETE FROM rental_page_features WHERE rental_page_id = $1`, [
//     id,
//   ]);

//   await Promise.all(
//     featureIds.map((featureId) =>
//       query(
//         `
//       INSERT INTO rental_page_features (rental_page_id, feature_id)
//       VALUES ($1, $2)
//     `,
//         [id, featureId]
//       )
//     )
//   );

//   return getRentalPage(id);
// }

// export async function deleteRentalPage(id: number): Promise<void> {
//   await query(`DELETE FROM rental_pages WHERE id = $1`, [id]);
// }

// async function getRentalPage(id: number): Promise<RentalPage> {
//   const [page] = await query<RentalPage>(
//     `
//     SELECT rp.*, json_agg(f.*) as features
//     FROM rental_pages rp
//     LEFT JOIN rental_page_features rpf ON rp.id = rpf.rental_page_id
//     LEFT JOIN features f ON rpf.feature_id = f.id
//     WHERE rp.id = $1
//     GROUP BY rp.id
//   `,
//     [id]
//   );
//   return {
//     ...page,
//     features: page.features.filter((f) => f.id !== null),
//   };
// }
