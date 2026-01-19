import { useEffect, useMemo, useState } from "react";
import "../styles/dashboard.css";
import { useAuth } from "../auth/AuthContext";
import type { ScheduledEmailRow, SentEmailRow } from "../types/email";
import Compose from "./Compose";
import { fetchScheduledEmails, fetchSentEmails, fetchEmailDetail, type EmailDetail } from "../api/emails";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"scheduled" | "sent">("scheduled");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"inbox" | "compose">("inbox");

  const [scheduled, setScheduled] = useState<ScheduledEmailRow[]>([]);
  const [sent, setSent] = useState<SentEmailRow[]>([]);
  const [loading, setLoading] = useState<null | "scheduled" | "sent">(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);

  const load = async (which: "scheduled" | "sent") => {
    try {
      setError(null);
      setLoading(which);
      if (which === "scheduled") {
        const rows = await fetchScheduledEmails();
        setScheduled(rows);
      } else {
        const rows = await fetchSentEmails();
        setSent(rows);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load emails");
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    void load("scheduled");
    void load("sent");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    const data = activeTab === "scheduled" ? scheduled : sent;
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((r) => r.subject.toLowerCase().includes(q) || r.recipient_email.toLowerCase().includes(q));
  }, [activeTab, scheduled, sent, query]);

  if (view === "compose") {
    return (
      <div className="shell">
        <aside className="sidebar">
          <div className="brand">ONE</div>

          {user ? (
            <div className="profileCard" title={`${user.name} • ${user.email}`}>
              <img className="avatar" src={user.picture} alt="avatar" />
              <div className="profileMeta">
                <div className="profileName">{user.name}</div>
                <div className="profileEmail">{user.email}</div>
              </div>
            </div>
          ) : null}

          <button className="composeBtn" type="button" onClick={() => setView("compose")}>
            Compose
          </button>

          <div className="navLabel">CORE</div>
          <div
            className={`navItem ${activeTab === "scheduled" ? "navItemActive" : ""}`}
            onClick={() => {
              setActiveTab("scheduled");
              setView("inbox");
            }}
            role="button"
            tabIndex={0}
          >
            <div className="navLeft">
              <span>⏱</span>
              <span>Scheduled</span>
            </div>
            <div className="count">12</div>
          </div>
          <div
            className={`navItem ${activeTab === "sent" ? "navItemActive" : ""}`}
            onClick={() => {
              setActiveTab("sent");
              setView("inbox");
            }}
            role="button"
            tabIndex={0}
          >
            <div className="navLeft">
              <span>✈</span>
              <span>Sent</span>
            </div>
            <div className="count">785</div>
          </div>

          <div style={{ marginTop: 14 }}>
            <button type="button" className="iconBtn" onClick={logout} title="Logout">
              Logout
            </button>
          </div>
        </aside>

        <main className="main" style={{ padding: 18 }}>
          <Compose
            onBack={() => setView("inbox")}
            defaultFrom={user?.email ?? ""}
            onScheduled={async () => {
              // Refresh scheduled list after scheduling.
              await load("scheduled");
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">ONE</div>

        {user ? (
          <div className="profileCard" title={`${user.name} • ${user.email}`}>
            <img className="avatar" src={user.picture} alt="avatar" />
            <div className="profileMeta">
              <div className="profileName">{user.name}</div>
              <div className="profileEmail">{user.email}</div>
            </div>
          </div>
        ) : null}

        <button className="composeBtn" type="button" onClick={() => setView("compose")}>
          Compose
        </button>

        <div className="navLabel">CORE</div>
        <div
          className={`navItem ${activeTab === "scheduled" ? "navItemActive" : ""}`}
          onClick={() => setActiveTab("scheduled")}
          role="button"
          tabIndex={0}
        >
          <div className="navLeft">
            <span>⏱</span>
            <span>Scheduled</span>
          </div>
          <div className="count">12</div>
        </div>
        <div
          className={`navItem ${activeTab === "sent" ? "navItemActive" : ""}`}
          onClick={() => setActiveTab("sent")}
          role="button"
          tabIndex={0}
        >
          <div className="navLeft">
            <span>✈</span>
            <span>Sent</span>
          </div>
          <div className="count">785</div>
        </div>

        <div style={{ marginTop: 14 }}>
          <button type="button" className="iconBtn" onClick={logout} title="Logout">
            Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="searchWrap">
            <span style={{ color: "#9ca3af" }}>🔎</span>
            <input
              className="searchInput"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button className="iconBtn" type="button" title="Filter (UI only)">
            ⎇
          </button>
          <button
            className="iconBtn"
            type="button"
            title="Refresh"
            onClick={() => {
              void load("scheduled");
              void load("sent");
            }}
          >
            ↻
          </button>
        </div>

        <div className="list">
          {error ? (
            <div className="row">
              <div className="subject">
                <strong>Failed to load</strong>
                <span className="subjectMuted"> — {error}</span>
              </div>
              <button className="iconBtn" type="button" onClick={() => void load(activeTab)} title="Retry">
                ↻
              </button>
            </div>
          ) : loading === activeTab ? (
            <div className="row">
              <div className="subject">
                <strong>Loading…</strong>
                <span className="subjectMuted"> fetching from backend</span>
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="row">
              <div className="subject">
                <strong>No emails</strong>
                <span className="subjectMuted">
                  {" "}
                  — {activeTab === "scheduled" ? "Nothing scheduled yet" : "Nothing sent yet"}
                </span>
              </div>
            </div>
          ) : (
            rows.map((r) => (
              <div
                className="row"
                key={r.id}
                style={{ cursor: "pointer" }}
                onClick={async () => {
                  try {
                    const detail = await fetchEmailDetail(r.id);
                    setSelectedEmail(detail);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Failed to load email");
                  }
                }}
              >
                <div className="rowTo">
                  <span className="rowToMuted">To:</span> {r.recipient_email}
                </div>

                {activeTab === "scheduled" ? (
                  <span className="pill">
                    {new Date((r as ScheduledEmailRow).scheduled_at).toLocaleString()}
                  </span>
                ) : (
                  <span
                    className="pill"
                    style={{
                      background: (r as SentEmailRow).status === "failed" ? "#fee2e2" : "#eef2ff",
                      borderColor: (r as SentEmailRow).status === "failed" ? "#fecaca" : "#e0e7ff",
                      color: (r as SentEmailRow).status === "failed" ? "#b91c1c" : "#4f46e5",
                    }}
                  >
                    {(r as SentEmailRow).status === "failed" ? "Failed" : "Sent"}
                  </span>
                )}

                <div className="subject">
                  <strong>{r.subject || "(no subject)"}</strong>
                  <span className="subjectMuted"> — id #{r.id}</span>
                </div>

                <button
                  className="iconBtn"
                  type="button"
                  title="Star (UI only)"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  ☆
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Email Detail Modal */}
      {selectedEmail ? (
        <div
          className="modalBackdrop"
          onClick={() => setSelectedEmail(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modalContent"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 8,
              padding: 24,
              maxWidth: 800,
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>{selectedEmail.subject || "(no subject)"}</h2>
              <button
                className="iconBtn"
                type="button"
                onClick={() => setSelectedEmail(null)}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 12, fontSize: 12, color: "#6b7280" }}>
              <div><strong>From:</strong> {selectedEmail.sender_email}</div>
              <div><strong>To:</strong> {selectedEmail.recipient_email}</div>
              {selectedEmail.scheduled_at ? (
                <div><strong>Scheduled:</strong> {new Date(selectedEmail.scheduled_at).toLocaleString()}</div>
              ) : null}
              {selectedEmail.sent_at ? (
                <div><strong>Sent:</strong> {new Date(selectedEmail.sent_at).toLocaleString()}</div>
              ) : null}
              <div><strong>Status:</strong> {selectedEmail.status}</div>
            </div>

            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                paddingTop: 16,
                marginTop: 16,
                whiteSpace: "pre-wrap",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              {selectedEmail.body || "(no body)"}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;
