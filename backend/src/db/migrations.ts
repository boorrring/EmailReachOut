import { pool } from "../config/db";

export const createTables = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS emails (
      id SERIAL PRIMARY KEY,
      sender_email VARCHAR(255) NOT NULL,
      recipient_email VARCHAR(255) NOT NULL,
      subject VARCHAR(255),
      body TEXT,
      scheduled_at TIMESTAMP NOT NULL,
      sent_at TIMESTAMP,
      status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  await pool.query(query);
  console.log("-->Emails table created or already exists");
};
