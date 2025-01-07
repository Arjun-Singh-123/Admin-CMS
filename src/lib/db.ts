"use server";
import { Pool, PoolClient } from "pg";

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  ssl: { rejectUnauthorized: false },
});

export async function getClient(): Promise<PoolClient> {
  console.log(pool.totalCount); // Total connections created by the pool
  console.log(pool.idleCount); // Free connections ready for use
  console.log(pool.waitingCount); // Requests waiting for a free connection

  const client = await pool.connect();
  return client;
}

export async function query<T>(text: string, params: any[] = []): Promise<T[]> {
  const client = await getClient();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function querySingle<T>(
  text: string,
  params: any[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function insert<T>(
  table: string,
  data: Record<string, any>
): Promise<T | null> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

  const text = `INSERT INTO ${table} (${keys.join(
    ", "
  )}) VALUES (${placeholders}) RETURNING *`;
  return await querySingle<T>(text, values);
}

export async function update<T>(
  table: string,
  condition: string,
  data: Record<string, any>
): Promise<T | null> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  console.log(keys, values, setClause);

  const text = `UPDATE ${table} SET ${setClause} WHERE ${condition} RETURNING *`;
  console.log(text);
  return await querySingle<T>(text, values);
}

export async function remove(table: string, condition: string): Promise<void> {
  const text = `DELETE FROM ${table} WHERE ${condition}`;
  await query(text);
}
