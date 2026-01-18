import { Router } from "express";
import { pool } from "../config/db";

const router = Router();

// POST /emails/schedule
router.post("/schedule", async (req, res) => {
  try {
    const { sender_email, recipient_email, subject, body, scheduled_at } = req.body;

    if (!sender_email || !recipient_email || !scheduled_at) {
      return res.status(400).json({ error: "sender_email, recipient_email, and scheduled_at are required" });
    }

    const query = `
      INSERT INTO emails (sender_email, recipient_email, subject, body, scheduled_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, status
    `;
    const values = [sender_email, recipient_email, subject || "", body || "", scheduled_at];

    const result = await pool.query(query, values);

    res.status(201).json({ message: "Email scheduled", email: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
