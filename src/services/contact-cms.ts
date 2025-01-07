import {
  query,
  querySingle,
  insert,
  update,
  remove,
  getClient,
} from "@/lib/db";
import { CMSData, ContactInfo, SocialLink, Route } from "@/types/cms-types";

export async function getCMSData(): Promise<CMSData> {
  try {
    const contactInfos = await querySingle<ContactInfo | any>(
      "SELECT * FROM settings LIMIT 1"
    );
    console.log(contactInfos);
    const contactInfo = contactInfos?.contact_info || {
      email: "",
      phone: "",
      hours: "",
      address: "",
    };
    console.log(contactInfo);
    const socialLinks = await query<SocialLink>("SELECT * FROM social_links");
    const routes = await query<Route>("SELECT * FROM routes");

    if (!contactInfo) {
      throw new Error("Contact info not found");
    }

    return {
      contactInfo,
      socialLinks,
      routes,
    };
  } catch (error) {
    console.error("Error fetching CMS data:", error);
    throw new Error(`Failed to fetch CMS data: ${error}`);
  }
}

export async function createCMSData(data: CMSData): Promise<CMSData> {
  const client = await getClient();
  try {
    await client.query("BEGIN");

    const contactInfo = await insert<ContactInfo>("settings", data.contactInfo);
    if (!contactInfo) {
      throw new Error("Failed to insert contact info");
    }

    const socialLinks = await Promise.all(
      data.socialLinks.map((link) => insert<SocialLink>("social_links", link))
    );

    const routes = await Promise.all(
      data.routes.map((route) => insert<Route>("routes", route))
    );

    await client.query("COMMIT");

    return {
      contactInfo,
      socialLinks: socialLinks.filter(
        (link): link is SocialLink => link !== null
      ),
      routes: routes.filter((route): route is Route => route !== null),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating CMS data:", error);
    throw new Error(`Failed to create CMS data: ${error}`);
  } finally {
    client.release();
  }
}

export async function updateCMSData(data: Partial<CMSData>): Promise<CMSData> {
  const client = await getClient();
  console.log(data);
  try {
    await client.query("BEGIN");

    if (data.contactInfo) {
      await updateContactInfo("1", data.contactInfo);
    }

    if (data.socialLinks) {
      await remove("social_links", "1=1");
      await Promise.all(
        data.socialLinks.map((link) => insert<SocialLink>("social_links", link))
      );
      0;
    }

    if (data.routes) {
      await remove("routes", "1=1");
      await Promise.all(
        data.routes.map((route) => insert<Route>("routes", route))
      );
    }

    await client.query("COMMIT");

    return await getCMSData();
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating CMS data:", error);
    throw new Error(`Failed to update CMS data: ${error}`);
  } finally {
    client.release();
  }
}

export async function deleteCMSData(): Promise<void> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    await remove("settings", "1=1");
    await remove("social_links", "1=1");
    await remove("routes", "1=1");
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting CMS data:", error);
    throw new Error(`Failed to delete CMS data: ${error}`);
  } finally {
    client.release();
  }
}

export async function updateContactInfo(
  id: string,
  contactInfo: Record<string, any>
) {
  console.log(id, contactInfo);
  const intId = parseInt(id, 10);
  if (isNaN(intId)) {
    console.log(intId);
    throw new Error(`Invalid ID: ${id}`);
  }
  try {
    const queryText = `
  UPDATE settings
  SET contact_info = $1
  WHERE id = $2
  RETURNING *;
`;

    console.log("Generated Query:", queryText);
    console.log("Values:", [contactInfo, intId]);

    // Execute the query
    const [updatedContactInfo] = await query(queryText, [contactInfo, intId]);
    return updatedContactInfo;
  } catch (error) {
    console.error("Error updating contact info:", error);
    throw new Error(`Failed to update contact info: ${error}`);
  }
}
