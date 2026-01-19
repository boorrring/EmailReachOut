import { apiFetch } from "./client";

export type EmailStatus = "scheduled" | "sent" | "failed";

export type ScheduledEmailRow = {
  id: number;
  sender_email: string;
  recipient_email: string;
  subject: string;
  scheduled_at: string; // ISO timestamp string from Postgres
  status: "scheduled";
};

export type SentEmailRow = {
  id: number;
  sender_email: string;
  recipient_email: string;
  subject: string;
  sent_at: string; // ISO timestamp string from Postgres
  status: "sent" | "failed";
};

export type ScheduleEmailRequest = {
  sender_email: string;
  recipient_email: string;
  subject: string;
  body: string;
  scheduled_at: string; // ISO string
};

export type ScheduleEmailResponse = {
  message: string;
  email: {
    id: number;
    status: EmailStatus;
  };
};

export async function fetchScheduledEmails() {
  return apiFetch<ScheduledEmailRow[]>("/emails/scheduled");
}

export async function fetchSentEmails() {
  return apiFetch<SentEmailRow[]>("/emails/sent");
}

export async function scheduleEmail(payload: ScheduleEmailRequest) {
  return apiFetch<ScheduleEmailResponse>("/emails/schedule", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type EmailDetail = {
  id: number;
  sender_email: string;
  recipient_email: string;
  subject: string;
  body: string;
  scheduled_at: string | null;
  sent_at: string | null;
  status: EmailStatus;
  created_at: string;
};

export async function fetchEmailDetail(id: number) {
  return apiFetch<EmailDetail>(`/emails/${id}`);
}