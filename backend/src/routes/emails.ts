import { Router } from "express";
import { pool } from "../config/db";
import { emailQueue } from "../config/queue";

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
    // Schedule the job in BullMQ
    await emailQueue.add(
        "sendEmail", 
        { emailId: result.rows[0].id }, 
        { delay: new Date(scheduled_at).getTime() - Date.now() } // delay in milliseconds
    );
  
    

    res.status(201).json({ message: "Email scheduled", email: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

// GET /emails/scheduled
router.get("/scheduled", async (_req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT id, sender_email, recipient_email, subject, scheduled_at, status
        FROM emails
        WHERE status = 'scheduled'
        ORDER BY scheduled_at ASC
        `
      );
  
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // GET /emails/sent
  router.get("/sent", async (_req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT id, sender_email, recipient_email, subject, sent_at, status
        FROM emails
        WHERE status = 'sent'
        ORDER BY sent_at DESC
        `
      );
  
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /emails/:id - Get full email details including body
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `
        SELECT id, sender_email, recipient_email, subject, body, scheduled_at, sent_at, status, created_at
        FROM emails
        WHERE id = $1
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Email not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  