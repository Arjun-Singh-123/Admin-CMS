import { query, querySingle } from "@/lib/db";
import { NavItem, Section, UserSelection } from "@/types/dashboard";

export async function fetchDashBoardSectionsAndNavItems(): Promise<{
  sections: Section[];
  navItems: NavItem[];
}> {
  try {
    const sectionsQuery = `
      SELECT * FROM sections
      ORDER BY display_order ASC
    `;
    const sections = await query<Section>(sectionsQuery);

    const navItemsQuery = `
      SELECT 
        ni.id,
        ni.name,
        ni.href,
        ni.status,
        json_agg(
          json_build_object(
            'id', ns.id,
            'name', ns.name,
            'href', ns.href,
            'status', ns.status,
            'products', (
              SELECT json_agg(
                json_build_object(
                  'id', p.id,
                  'name', p.name,
                  'href', p.href,
                  'product_details', pd.*
                )
              )
              FROM products p
              LEFT JOIN product_details pd ON p.id = pd.product_id
              WHERE p.nav_section_id = ns.id
            )
          )
        ) AS nav_sections
      FROM nav_items ni
      LEFT JOIN nav_sections ns ON ni.id = ns.parent_id
      WHERE ni.name = 'Boats'
      GROUP BY ni.id
      ORDER BY ni.priority ASC
    `;
    const navItems = await query<NavItem>(navItemsQuery);

    return { sections, navItems };
  } catch (error) {
    console.error("Error fetching dashboard sections and nav items:", error);
    throw new Error("Error fetching dashboard sections and nav items");
  }
}

export async function updateDashBoardSectionStatus({
  sectionId,
  status,
}: {
  sectionId: string;
  status: string;
}): Promise<void> {
  try {
    const updateQuery = `
      UPDATE sections
      SET status = $1
      WHERE id = $2
    `;
    await query(updateQuery, [status, sectionId]);
  } catch (error) {
    console.error(`Error updating status for section ${sectionId}:`, error);
    throw new Error("Error updating section status");
  }
}

export async function fetchDashBoardUserSelections(
  sectionId: string
): Promise<UserSelection[]> {
  try {
    const selectQuery = `
      SELECT * FROM user_selections
      WHERE section_id = $1
    `;
    return await query<UserSelection>(selectQuery, [sectionId]);
  } catch (error) {
    console.error(
      `Error fetching user selections for section ${sectionId}:`,
      error
    );
    throw new Error("Error fetching user selections");
  }
}

export async function fetchDashBoardBoatsNavItem(): Promise<NavItem> {
  try {
    const selectQuery = `
      SELECT 
        ni.id,
        ni.name,
        json_agg(
          json_build_object(
            'id', ns.id,
            'name', ns.name,
            'products', (
              SELECT json_agg(
                json_build_object(
                  'id', p.id,
                  'name', p.name,
                  'product_details', json_build_object('images', pd.images)
                )
              )
              FROM products p
              LEFT JOIN product_details pd ON p.id = pd.product_id
              WHERE p.nav_section_id = ns.id
            )
          )
        ) AS nav_sections
      FROM nav_items ni
      LEFT JOIN nav_sections ns ON ni.id = ns.parent_id
      WHERE ni.name = 'Boats'
      GROUP BY ni.id
    `;
    const result = await querySingle<NavItem>(selectQuery);
    if (!result) throw new Error("Boats nav item not found");
    return result;
  } catch (error) {
    console.error("Error fetching boats nav item:", error);
    throw new Error("Boats nav item not found");
  }
}

export async function updateDashBoardUserSelection({
  sectionId,
  productId,
  isSelected,
  isExternalImage,
}: {
  sectionId: string;
  productId: string;
  isSelected: boolean;
  isExternalImage: boolean;
}): Promise<void> {
  try {
    if (isSelected) {
      const upsertQuery = `
        INSERT INTO user_selections (section_id, product_id, is_external_image)
        VALUES ($1, $2, $3)
        ON CONFLICT (section_id, product_id) 
        DO UPDATE SET is_external_image = $3
      `;
      await query(upsertQuery, [sectionId, productId, isExternalImage]);
    } else {
      const deleteQuery = `
        DELETE FROM user_selections
        WHERE section_id = $1 AND product_id = $2
      `;
      await query(deleteQuery, [sectionId, productId]);
    }
  } catch (error) {
    console.error(
      `Error updating user selection for section ${sectionId} and product ${productId}:`,
      error
    );
    throw new Error("Error updating user selection");
  }
}

export async function updateDashBoardExternalImageStatus({
  sectionId,
  productId,
  isExternalImage,
}: {
  sectionId: string;
  productId: string;
  isExternalImage: boolean;
}): Promise<void> {
  try {
    const updateQuery = `
      UPDATE user_selections
      SET is_external_image = $1
      WHERE section_id = $2 AND product_id = $3
    `;
    await query(updateQuery, [isExternalImage, sectionId, productId]);
  } catch (error) {
    console.error(
      `Error updating external image status for section ${sectionId} and product ${productId}:`,
      error
    );
    throw new Error("Error updating external image status");
  }
}

export async function fetchUserSelectionsSections(sectionId: number) {
  const sql = `SELECT * FROM user_selections WHERE section_id = $1`;
  try {
    const result = await query(sql, [sectionId]);
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error fetching user selections:", error);
    throw error;
  }
}

// export async function fetchSectionsAndNavItemsDashboard() {
//   try {
//     const sqlQuery = `
//         WITH nav_items_with_sections AS (
//           SELECT
//             ni.id AS nav_item_id,
//             ni.name AS nav_item_name,
//             ni.href AS nav_item_href,
//             ni.status AS nav_item_status,
//             CASE
//               WHEN ns.parent_id IS NOT NULL THEN
//                 JSON_AGG(
//                   JSON_BUILD_OBJECT(
//                     'id', ns.id,
//                     'name', ns.name,
//                     'href', ns.href,
//                     'status', ns.status,
//                     'products', COALESCE((
//                       SELECT JSON_AGG(
//                         JSON_BUILD_OBJECT(
//                           'id', p.id,
//                           'name', p.name,
//                           'href', p.href
//                         )
//                       )
//                       FROM products p
//                       WHERE p.nav_section_id = ns.id
//                     ), '[]'::JSON)
//                   )
//                 )
//               ELSE '[]'::JSON
//             END AS nav_sections
//           FROM nav_items ni
//           LEFT JOIN nav_sections ns ON ni.id = ns.parent_id
//           WHERE ni.name = 'Boats'
//           GROUP BY
//             ni.id,
//             ni.name,
//             ni.href,
//             ni.status,
//             ns.parent_id
//         ),
//         sections_with_order AS (
//           SELECT *
//           FROM sections
//           ORDER BY display_order ASC
//         )
//         SELECT
//           (SELECT JSON_AGG(swo) FROM sections_with_order swo) AS sections,
//           (SELECT JSON_AGG(niws) FROM nav_items_with_sections niws) AS nav_items;
//       `;

//     const result = await query(sqlQuery);
//     console.log(result);
//     return result as any;
//   } catch (error) {
//     console.error("Error fetching sections and nav items:", error);
//     throw error;
//   }
// }
// export async function fetchBoatsNavItemSections() {
//   const sql = `
//     SELECT
//       ni.id AS nav_item_id,
//       ni.name AS nav_item_name,
//       JSON_AGG(
//         JSON_BUILD_OBJECT(
//           'id', ns.id,
//           'name', ns.name,
//           'products', COALESCE(
//             (
//               SELECT JSON_AGG(
//                 JSON_BUILD_OBJECT(
//                   'id', p.id,
//                   'name', p.name,
//                   'product_details', JSON_BUILD_OBJECT('images', pd.images)
//                 )
//               )
//               FROM products p
//               LEFT JOIN product_details pd ON p.id = pd.product_id
//               WHERE p.nav_section_id = ns.id
//             ), '[]'::JSON
//           )
//         )
//       ) AS nav_sections
//     FROM nav_items ni
//     LEFT JOIN nav_sections ns ON ni.id = ns.parent_id
//     WHERE ni.name = 'Boats'
//     GROUP BY ni.id, ni.name;
//   `;

//   try {
//     const result = await query(sql);
//     return result?.[0];
//   } catch (error) {
//     console.error("Error fetching Boats nav item:", error);
//     throw error;
//   }
// }

// export async function updateSectionStatusDashboard(
//   sectionId: string,
//   status: string
// ) {
//   try {
//     const sqlQuery = `
//         UPDATE sections
//         SET status = $1
//         WHERE id = $2;
//       `;

//     await query(sqlQuery, [status, sectionId]);
//     console.log(`Section ${sectionId} status updated to ${status}`);
//   } catch (error) {
//     console.error("Error updating section status:", error);
//     throw error;
//   }
// }

// export async function fetchUserSelectionsSections(sectionId: number) {
//   const sql = `SELECT * FROM user_selections WHERE section_id = $1`;
//   try {
//     const result = await query(sql, [sectionId]);
//     console.log(result);
//     return result;
//   } catch (error) {
//     console.error("Error fetching user selections:", error);
//     throw error;
//   }
// }
