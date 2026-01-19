import { useMemo, useRef, useState } from "react";
import "../styles/compose-page.css";
import { scheduleEmail } from "../api/emails";

type LeadParseResult = {
  emails: string[];
  uniqueEmails: string[];
};

function parseEmailsFromText(text: string): LeadParseResult {
  const matches = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  const emails = matches.map((e) => e.trim()).filter(Boolean);
  const seen = new Set<string>();
  const uniqueEmails: string[] = [];
  for (const e of emails) {
    const lower = e.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      uniqueEmails.push(e);
    }
  }
  return { emails, uniqueEmails };
}

export default function Compose({
  onBack,
  defaultFrom,
  onScheduled,
}: {
  onBack: () => void;
  defaultFrom: string;
  onScheduled: () => void | Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toInputRef = useRef<HTMLInputElement | null>(null);
  const [fromEmail, setFromEmail] = useState(defaultFrom || "");
  const [toInput, setToInput] = useState("");
  const [toTokens, setToTokens] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [delay, setDelay] = useState("00");
  const [hourlyLimit, setHourlyLimit] = useState("00");
  const [scheduledAtLocal, setScheduledAtLocal] = useState("");
  const [body, setBody] = useState("");
  const [leads, setLeads] = useState<string[]>([]);
  const [leadCount, setLeadCount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toDisplay = useMemo(() => {
    if (leadCount > 0) {
      // Show first few from uploaded list
      const first = leads.slice(0, 4);
      const rest = leads.length - first.length;
      return [...first, ...(rest > 0 ? [`+${rest}`] : [])];
    }
    // Show manual entry chips
    return toTokens.slice(0, 4);
  }, [toTokens, leads, leadCount]);

  const triggerUpload = () => fileInputRef.current?.click();

  const onUpload = async (file: File) => {
    const text = await file.text();
    const { uniqueEmails } = parseEmailsFromText(text);
    setLeadCount(uniqueEmails.length);
    setLeads(uniqueEmails);
    setToInput("");
    setToTokens([]);
  };

  const validateEmail = (email: string): boolean => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim());
  };

  const addEmailToken = (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) return;
    if (!validateEmail(trimmed)) {
      setError(`Invalid email: ${trimmed}`);
      return;
    }
    const lower = trimmed.toLowerCase();
    if (toTokens.some((t) => t.toLowerCase() === lower)) {
      setError(`Email already added: ${trimmed}`);
      return;
    }
    setToTokens([...toTokens, trimmed]);
    setToInput("");
    setError(null);
  };

  const removeEmailToken = (index: number) => {
    setToTokens(toTokens.filter((_, i) => i !== index));
  };

  const handleToInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (leadCount > 0) return; // Disable manual entry when list is uploaded

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (toInput.trim()) {
        addEmailToken(toInput);
      }
    } else if (e.key === "Backspace" && toInput === "" && toTokens.length > 0) {
      removeEmailToken(toTokens.length - 1);
    }
  };

  const scheduledAtIso = useMemo(() => {
    if (!scheduledAtLocal) return "";
    // datetime-local returns local time, no timezone; convert to ISO for backend.
    const d = new Date(scheduledAtLocal);
    return d.toISOString();
  }, [scheduledAtLocal]);

  const submit = async () => {
    try {
      setError(null);
      if (!fromEmail.trim()) throw new Error("From email is required");

      // Use uploaded leads if available, otherwise use manual tokens + current input
      let recipients: string[] = [];
      if (leads.length > 0) {
        recipients = leads;
      } else {
        recipients = [...toTokens];
        if (toInput.trim()) {
          const trimmed = toInput.trim();
          if (validateEmail(trimmed)) {
            recipients.push(trimmed);
          } else {
            throw new Error(`Invalid email in To field: ${trimmed}`);
          }
        }
      }
      if (recipients.length === 0) throw new Error("At least one recipient is required");
      if (!scheduledAtIso) throw new Error("Send later time is required");

      setIsSubmitting(true);

      // Backend currently supports ONE recipient per request; loop for leads.
      for (const recipient of recipients) {
        await scheduleEmail({
          sender_email: fromEmail.trim(),
          recipient_email: recipient,
          subject: subject.trim(),
          body: body.trim(),
          scheduled_at: scheduledAtIso,
        });
      }

      await onScheduled();
      onBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to schedule");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="composePage">
      <div className="composeTop">
        <div className="composeTitle">
          <button className="iconBtn" type="button" onClick={onBack} title="Back">
            ←
          </button>
          <span>Compose New Email</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="iconBtn" type="button" title="Edit">
            ✎
          </button>
          <button className="iconBtn" type="button" title="Clock">
            ◷
          </button>
          <button className="sendBtn" type="button" onClick={submit} disabled={isSubmitting}>
            {isSubmitting ? "Scheduling..." : "Send Later"}
          </button>
        </div>
      </div>

      {error ? (
        <div style={{ color: "#b91c1c", fontSize: 12, margin: "6px 0 8px" }}>{error}</div>
      ) : null}

      <div className="formRow">
        <div className="label">From</div>
        <div className="chipRow">
          <input
            className="input"
            placeholder="sender@domain.com"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
          />
        </div>
        <div />
      </div>

      <div className="formRow">
        <div className="label">To</div>
        <div className="chipRow">
          {toDisplay.map((t, idx) => {
            if (t.startsWith("+")) {
              return (
                <span key={t} className="chip chipMore">
                  {t}
                </span>
              );
            }
            return (
              <span
                key={`${t}-${idx}`}
                className="chip"
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                {t}
                {leadCount === 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const actualIdx = toTokens.findIndex((token) => token === t);
                      if (actualIdx >= 0) removeEmailToken(actualIdx);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      marginLeft: 4,
                      fontSize: 14,
                      color: "#6b7280",
                    }}
                    title="Remove"
                  >
                    ×
                  </button>
                )}
              </span>
            );
          })}
          {leadCount > 0 ? (
            <span style={{ fontSize: 11, color: "#9ca3af" }}>{leadCount} loaded</span>
          ) : null}
          <input
            ref={toInputRef}
            className="input"
            placeholder={leadCount > 0 ? "Using uploaded list" : "recipient@example.com (press Enter or comma)"}
            value={toInput}
            onChange={(e) => {
              setToInput(e.target.value);
              setError(null);
            }}
            onKeyDown={handleToInputKeyDown}
            disabled={leadCount > 0}
          />
        </div>
        <div className="uploadLink" onClick={triggerUpload} role="button" tabIndex={0}>
          <span>⤒</span> Upload List
        </div>
      </div>

      <div className="formRow" style={{ gridTemplateColumns: "80px 1fr" }}>
        <div className="label">Subject</div>
        <input
          className="input"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div className="miniRow">
        <div className="miniField">
          <div className="label">Delay between 2 emails</div>
          <input className="miniInput" value={delay} onChange={(e) => setDelay(e.target.value)} />
        </div>
        <div className="miniField">
          <div className="label">Hourly Limit</div>
          <input className="miniInput" value={hourlyLimit} onChange={(e) => setHourlyLimit(e.target.value)} />
        </div>
        <div className="miniField" style={{ marginLeft: "auto" }}>
          <div className="label">Send later</div>
          <input
            className="miniInput"
            style={{ width: 190 }}
            type="datetime-local"
            value={scheduledAtLocal}
            onChange={(e) => setScheduledAtLocal(e.target.value)}
          />
        </div>
      </div>

      <div className="editor">
        <textarea
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            minHeight: 320,
            resize: "vertical",
            fontSize: 12,
          }}
          placeholder="Type Your Reply..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      {/* Hidden input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onUpload(f);
        }}
      />

      {/* Placeholder attachment card to match the PNG composition */}
      <div className="attachment" style={{ marginLeft: 32 }}>
        <img
          alt="attachment preview"
          src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=60"
        />
      </div>
    </div>
  );
}

