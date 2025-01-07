import { query } from "@/lib/db";

export interface MembershipFee {
  id: string;
  content: {
    initialMembershipFee: number;
    damageDeposit: number;
    monthlyMembershipFee: number;
    certificationRide: string;
    initialMembershipTotal: number;
    monthlyDuesTotal: {
      amount: number;
      administrationFee: number;
      membershipFee: number;
    };
    checkRide: number;
  };
  title: string;
  description: string;
  image_url: string | null;
}

export async function getMembershipFees(): Promise<MembershipFee | null> {
  try {
    const [fees] = await query<MembershipFee>(`
    SELECT * FROM membership_fees
     
  `);
    return fees;
  } catch (error) {
    throw new Error(`Error fetching membership fees: ${error}`);
  }
}

// export async function updateMembershipFees(
//   fees: Omit<MembershipFee, "id" | "created_at" | "updated_at">
// ): Promise<MembershipFee> {
//   const [updatedFees] = await query<MembershipFee>(
//     `
//     INSERT INTO membership_fees (content, title, description, image_url)
//     VALUES ($1, $2, $3, $4)
//     ON CONFLICT (id) DO UPDATE
//     SET content = EXCLUDED.content,
//         title = EXCLUDED.title,
//         description = EXCLUDED.description,
//         image_url = EXCLUDED.image_url
//     RETURNING *
//   `,
//     [fees.content, fees.title, fees.description, fees.image_url]
//   );
//   return updatedFees;
// }

// export async function updateMembershipFees(
//   fees: Partial<Omit<MembershipFee, "id" | "created_at" | "updated_at">>
// ): Promise<MembershipFee> {
//   console.log(fees);
//   const keys = Object.keys(fees);
//   const values = Object.values(fees);
//   const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");

//   const updateClause = keys
//     .map((key, index) => `${key} = $${index + 1}`)
//     .join(", ");

//   const queryText = `
//     INSERT INTO membership_fees (${keys.join(", ")})
//     VALUES (${placeholders})
//      ON CONFLICT (id) DO UPDATE
//     SET ${updateClause}
//     RETURNING *;
//   `;

//   console.log("Generated Query:", queryText);
//   console.log("Values:", values);

//   // Execute the query
//   const [updatedFees] = await query<MembershipFee>(queryText, values);
//   return updatedFees;
// }

export async function updateMembershipFees(
  id: string,
  fees: Record<string, any>
) {
  const keys = Object.keys(fees);
  const values = Object.values(fees);
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");

  const updateClause = keys
    .map((key, index) => `${key} = EXCLUDED.${key}`)
    .join(", ");

  const queryText = `
    INSERT INTO membership_fees (${keys.join(", ")})
    VALUES (${placeholders})
    ON CONFLICT (id) DO UPDATE
    SET ${updateClause}
    RETURNING *;
  `;

  console.log("Generated Query:", queryText);
  console.log("Values:", values);

  // Execute the query
  const [updatedFees] = await query<MembershipFee>(queryText, values);
  return updatedFees;
}

export async function deleteMembershipFees(): Promise<void> {
  await query(`DELETE FROM membership_fees`);
}

// import { query } from "@/lib/db";

// export interface MembershipFee {
//   id: number;
//   initialMembershipFee: number;
//   damageDeposit: number;
//   monthlyMembershipFee: number;
//   certificationRide: string;
//   initialMembershipTotal: number;
//   monthlyDuesTotalAmount: number;
//   monthlyDuesTotalAdministrationFee: number;
//   monthlyDuesTotalMembershipFee: number;
//   checkRide: number;
// }

// export async function getMembershipFees(): Promise<MembershipFee> {
//   const [fees] = await query<MembershipFee>(`
//     SELECT * FROM membership_fees
//     ORDER BY created_at DESC
//     LIMIT 1
//   `);
//   return fees;
// }

// export async function updateMembershipFees(
//   fees: Omit<MembershipFee, "id">
// ): Promise<MembershipFee> {
//   try {
//     const feeKeys = Object.keys(fees);
//     const feeValues = Object.values(fees);
//     const placeholders = feeKeys.map((_, index) => `$${index + 1}`).join(", ");

//     const sqlQuery = `
//         INSERT INTO membership_fees (${feeKeys.join(", ")})
//         VALUES (${placeholders})
//         RETURNING *
//       `;

//     const [updatedFees] = await query<MembershipFee>(sqlQuery, feeValues);

//     return updatedFees;
//   } catch (error) {
//     console.error("[DB] Error updating membership fees:", error);
//     throw error;
//   }
// }
