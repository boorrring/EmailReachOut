export type EmailStatus = "scheduled" | "sent" | "failed";

export type ScheduledEmailRow = {
  id: number;
  sender_email: string;
  recipient_email: string;
  subject: string;
  scheduled_at: string;
  status: "scheduled";
};

export type SentEmailRow = {
  id: number;
  sender_email: string;
  recipient_email: string;
  subject: string;
  sent_at: string;
  status: "sent" | "failed";
};
  