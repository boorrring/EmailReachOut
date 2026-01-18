import { Queue, Worker } from "bullmq";
import nodemailer from "nodemailer";
import { pool } from "./db";
import { createTransporter } from "./mailer";

const connectionOptions = {
  host: "localhost",
  port: 6379
};

export const emailQueue = new Queue("emailQueue", {
  connection: connectionOptions
});

export const emailWorker = new Worker(
  "emailQueue",
  async job => {
    const { emailId } = job.data;

    // 1. Fetch email from DB
    const result = await pool.query(
      "SELECT * FROM emails WHERE id = $1",
      [emailId]
    );

    if (result.rows.length === 0) {
      throw new Error("Email not found");
    }

    const email = result.rows[0];

    // 2. Send email via Ethereal
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: email.sender_email,
      to: email.recipient_email,
      subject: email.subject,
      text: email.body
    });

    console.log("Email sent:", nodemailer.getTestMessageUrl(info));

    // 3. Update DB
    await pool.query(
      "UPDATE emails SET status = 'sent', sent_at = NOW() WHERE id = $1",
      [emailId]
    );
  },
  { connection: connectionOptions }
);
