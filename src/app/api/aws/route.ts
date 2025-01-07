import { getClient } from "@/lib/db";
 
export async function GET(request: Request) {
  try {
    console.log("request checking", request);
 
    const client = await getClient();

    // Log basic connection information
    console.log("Connected to PostgreSQL database!");
    console.log("Client connected to database: ", client);
    // Log detailed connection information
    console.log("Connected to PostgreSQL database!");
    console.log("Client connected to database: ", client.database);
    console.log("Host: ", client.host);
    console.log("Port: ", client.port);
    console.log("SSL Connection: ", client.ssl);
    console.log("User: ", client.user);

    // Fetch database version and server details
    const dbVersionResult = await client.query("SELECT version();");
    console.log("PostgreSQL Version: ", dbVersionResult.rows[0].version);

    // Fetch all tables in the database
    console.log("Fetching list of tables...");
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public';  -- Change schema as needed
    `);
    console.log("Tables in the database:", tablesResult.rows);
    const result = await client.query("SELECT * FROM product_details");
    client.release();
    return Response.json({ data: result.rows });
  } catch (error) {
    return Response.json({ error: error.message });
  }
}
