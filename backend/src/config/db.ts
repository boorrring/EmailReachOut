import { Pool } from "pg";
import { env } from "./env";

export const pool = new Pool({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME
});

export const testConnection = async () => {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT NOW()");
    console.log("Postgres connected, time:", res.rows[0].now);
  } finally {
    client.release();
  }
};
