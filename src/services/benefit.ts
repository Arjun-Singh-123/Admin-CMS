import { query } from "@/lib/db";
import { Benefit } from "@/types/benefit-types";

export async function getAllBenefits(): Promise<Benefit[]> {
  const benefits = await query<Benefit>(`
    SELECT * FROM benefits
    ORDER BY display_order ASC
  `);
  return benefits;
}

export async function createBenefit(
  benefit: Omit<Benefit, "id">
): Promise<Benefit> {
  const { icon, title, description, display_order } = benefit;
  const [newBenefit] = await query<Benefit>(
    `
    INSERT INTO benefits (icon, title, description, display_order)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,
    [icon, title, description, display_order]
  );
  return newBenefit;
}

export async function updateBenefit(
  id: string,
  benefit: Partial<Benefit>
): Promise<Benefit> {
  const { icon, title, description, display_order } = benefit;
  const [updatedBenefit] = await query<Benefit>(
    `
    UPDATE benefits
    SET icon = COALESCE($2, icon),
        title = COALESCE($3, title),
        description = COALESCE($4, description),
        display_order = COALESCE($5, display_order),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `,
    [id, icon, title, description, display_order]
  );
  return updatedBenefit;
}

export async function deleteBenefit(id: string): Promise<void> {
  await query(`DELETE FROM benefits WHERE id = $1`, [id]);
}
