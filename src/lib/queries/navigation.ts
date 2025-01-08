"use server";
import { NavItem, NavSection } from "@/types/dashboard";
import { query } from "../db";
import { Contact } from "@/schemas/enhanced-menu-schema";

export async function fetchNavItemsFromDB(): Promise<NavItem[]> {
  const sqlQuery = `
    SELECT 
      ni.id, 
      ni.name, 
      ni.href, 
      ni.status,
    CASE  
    
    WHEN ns.parent_id IS NOT NULL THEN
    
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', ns.id,
          'name', ns.name,
          'href', ns.href,
          'status', ns.status,
          'products', COALESCE((
            SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', p.id,
                'name', p.name,
                'href', p.href
              )
            )
            FROM products p
            WHERE p.nav_section_id = ns.id
          ), '[]'::JSON)  
        )
      )
    
      ELSE '[]'
    
    END AS nav_sections
    FROM nav_items ni
    LEFT JOIN nav_sections ns ON ni.id = ns.parent_id
    GROUP BY 
      ni.id, 
       ns.parent_id,
      ni.name, 
      ni.href, 
      ni.status
      
       ORDER BY ni.priority ASC
    `;

  const result = await query(sqlQuery);
  console.log(result);
  return result as any;
  // console.log((result as any)?.[0].result);
  // return (result as any)?.[0].result;
}

export async function insertNavItemToDB(
  data: Omit<NavItem, "id" | "nav_sections">
): Promise<void> {
  await query(
    "INSERT INTO nav_items (name, href, status) VALUES ($1, $2, $3)",
    [data.name, data.href, data.status]
  );
}

export async function updateNavItemInDB(
  id: string,
  data: Omit<NavItem, "id" | "nav_sections">
): Promise<void> {
  await query(
    "UPDATE nav_items SET name = $1, href = $2, status = $3 WHERE id = $4",
    [data.name, data.href, data.status, id]
  );
}

export async function deleteNavItemFromDB(id: string): Promise<void> {
  await query("DELETE FROM nav_items WHERE id = $1", [id]);
}

export async function insertNavSectionToDB(
  data: Omit<NavSection, "id" | "products">
): Promise<void> {
  await query(
    "INSERT INTO nav_sections (name, href, status, parent_id) VALUES ($1, $2, $3, $4)",
    [data.name, data.href, data.status, data.parent_id]
  );
}

export async function updateNavSectionInDB(
  id: string,
  data: Omit<NavSection, "id" | "products">
): Promise<void> {
  await query(
    "UPDATE nav_sections SET name = $1, href = $2, status = $3, parent_id = $4 WHERE id = $5",
    [data.name, data.href, data.status, data.parent_id, id]
  );
}

export async function deleteNavSectionFromDB(id: string): Promise<void> {
  await query("DELETE FROM nav_sections WHERE id = $1", [id]);
}

export async function fetchContactsFromDB(): Promise<Contact[]> {
  console.log("call happend");
  try {
    // Run the query to fetch all contacts
    const result = await query("SELECT * FROM contacts");

    // Check if the result is empty or not
    if (!result || result.length === 0) {
      console.warn("No contacts found.");
      return [];
    }

    // Optionally, log or process the result before returning
    console.log("Fetched contacts:", result);

    // Return the result (assuming it matches the structure of the Contact interface)
    return result as any;
  } catch (error) {
    // Handle errors and log them for debugging purposes
    console.error("Error fetching contacts:", error);
    throw new Error("Failed to fetch contacts from the database.");
  }
}

// export async function insertContactToDB(
//   data: Omit<Contact, "id">
// ): Promise<void> {
//   await query(
//     "INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)",
//     [data.name, data.email, data.message]
//   );
// }

// export async function updateContactInDB(
//   id: string,
//   data: Omit<Contact, "id">
// ): Promise<void> {
//   await query(
//     "UPDATE contacts SET name = $1, email = $2, message = $3 WHERE id = $4",
//     [data.name, data.email, data.message, id]
//   );
// }

export async function insertContactInDB(
  data: Omit<Contact, "id" | "created_at" | "updated_at">
): Promise<string> {
  const columns = Object.keys(data);
  const values = Object.values(data);

  const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
  console.log(`${columns.join(", ")} and ${placeholders}`);

  const sqlQuery = `
      INSERT INTO contacts (${columns.join(", ")})
      VALUES (${placeholders})
      RETURNING id
    `;

  const result = await query(sqlQuery, values);
  return (result?.[0] as any)?.id;
}

export async function updateContactInDB(
  id: string,
  data: Partial<Omit<Contact, "id" | "created_at" | "updated_at">>
): Promise<void> {
  const columns = Object.keys(data);
  const values = Object.values(data);

  const updateSet = columns
    .map((col, index) => `${col} = $${index + 2}`)
    .join(", ");

  const sqlQuery = `
      UPDATE contacts
      SET ${updateSet}, updated_at = NOW()
      WHERE id = $1
    `;

  await query(sqlQuery, [id, ...values]);
}

export async function deleteContactFromDB(id: string): Promise<void> {
  await query("DELETE FROM contacts WHERE id = $1", [id]);
}

export async function fetchHeaderNavItemsFromDB(): Promise<NavItem[]> {
  console.log("sth happend");
  const sqlQuery = `
    SELECT 
      ni.id, 
      ni.name, 
      ni.href, 
      ni.status,
    CASE  
    
    WHEN ns.parent_id IS NOT NULL THEN
    
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', ns.id,
          'name', ns.name,
          'href', ns.href,
          'status', ns.status,
          'products', COALESCE((
            SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', p.id,
                'name', p.name,
                'href', p.href
              )
            )
            FROM products p
            WHERE p.nav_section_id = ns.id
          ), '[]'::JSON)  
        )
      )
    
      ELSE '[]'
    
    END AS nav_sections
    FROM nav_items ni
    LEFT JOIN nav_sections ns ON ni.id = ns.parent_id
    GROUP BY 
      ni.id, 
       ns.parent_id,
      ni.name, 
      ni.href, 
      ni.status
      
       ORDER BY ni.priority ASC
    `;

  const result = await query(sqlQuery);
  console.log(result);
  return result as any;
  // console.log((result as any)?.[0].result);
  // return (result as any)?.[0].result;
}

// export async function fetchHeaderNavSectionsFromDB(): Promise<NavSection[]> {
//   try {
//     const sqlQuery = `
//     SELECT *
//     FROM nav_sections
//     ORDER BY priority ASC
//   `;

//     console.log(query(sqlQuery));

//     return query(sqlQuery);
//   } catch (error) {
//     console.error(error);
//   }
// }
export async function fetchHeaderNavSectionsFromDB(): Promise<NavSection[]> {
  try {
    const sqlQuery = `
        SELECT *
        FROM nav_sections
       
      `;

    // Await the query to get the resolved data
    const result = await query(sqlQuery);

    console.log(result); // Log the actual result, not the promise

    return result as any; // Return the resolved result
  } catch (error) {
    console.error(error);
    throw error; // Optional: rethrow the error to handle it upstream
  }
}
