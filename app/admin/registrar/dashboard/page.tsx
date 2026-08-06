"use client";

import { useState, useEffect } from "react";
import { AdminDashboardPage } from "../../dashboard/page";

/* ── Grade Requests Panel for Registrar ── */
function RegistrarGradeRequestsPanel() {
  const [requests, setRequests] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3500); }

  function reload() {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    fetch("http://localhost:4000/api/grade-requests/registrar", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.requests) setRequests(data.requests); })
      .catch(() => {});
  }

  useEffect(() => {
    reload();
    const interval = setInterval(reload, 15000);
    return () => clearInterval(interval);
  }, []);

  function sendToPrincipal(id: number) {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    fetch(`http://localhost:4000/api/grade-requests/registrar/${id}/send-to-principal`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    })
      .then(r => r.ok ? r.json() : null)
      .then(() => { reload(); showToast("👀 Sent to Principal for approval."); })
      .catch(() => showToast("⚠️ Failed to send to Principal."));
  }

  function releaseToTeacher(id: number) {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    fetch(`http://localhost:4000/api/grade-requests/registrar/${id}/release`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    })
      .then(r => r.ok ? r.json() : null)
      .then(() => { reload(); showToast("📬 Released back to Teacher."); })
      .catch(() => showToast("⚠️ Failed to release."));
  }

  const forReview   = requests.filter(r => r.status === "registrar_review");
  const atPrincipal = requests.filter(r => r.status === "principal_review");
  const approved    = requests.filter(r => r.status === "principal_approved");
  const released    = requests.filter(r => ["registrar_released", "released_to_student"].includes(r.status));
  const rejected    = requests.filter(r => r.status === "rejected");

  return (
    <div className="d-flex flex-column gap-4 p-3 p-md-4">
      {toast && (
        <div className="position-fixed bottom-0 end-0 m-4 alert alert-dark shadow-lg rounded-3 py-2 px-3" style={{ zIndex: 9999, fontSize: 13, minWidth: 280 }}>{toast}</div>
      )}

      <div>
        <h2 className="fw-black fs-4 text-dark mb-1">Grade Requests</h2>
        <p className="text-muted small mb-0">Review and forward grade requests to the Principal</p>
      </div>

      {/* Pipeline summary */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-3">
          <div className="fw-bold small text-dark mb-3">📊 Pipeline</div>
          <div className="d-flex gap-3 flex-wrap">
            {[
              { label: "Needs Review",     count: forReview.length,   color: "#f59e0b" },
              { label: "At Principal",     count: atPrincipal.length, color: "#8b5cf6" },
              { label: "Approved",         count: approved.length,    color: "#10b981" },
              { label: "Released",         count: released.length,    color: "#059669" },
              { label: "Rejected",         count: rejected.length,    color: "#ef4444" },
            ].map(s => (
              <div key={s.label} className="text-center flex-grow-1" style={{ minWidth: 80 }}>
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-black mx-auto mb-1"
                  style={{ width: 36, height: 36, background: s.color, fontSize: 15 }}>{s.count}</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step 1 — Needs Registrar review */}
      {forReview.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">📋 Needs Review — Send to Principal</h3>
          <div className="d-flex flex-column gap-2">
            {forReview.map((req: any) => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div>
                      <div className="fw-bold text-dark small">{req.student_name || req.student}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{req.subject_name || req.subject} · {req.term}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>Score: <strong>{req.score}</strong> · Teacher: {req.teacher_name || req.teacher}</div>
                    </div>
                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle" style={{ fontSize: 10 }}>📋 Needs Review</span>
                  </div>
                  <button onClick={() => sendToPrincipal(req.id)} className="btn btn-primary btn-sm w-100">👀 Send to Principal</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Waiting for Principal */}
      {atPrincipal.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">⏳ Waiting for Principal Approval</h3>
          <div className="d-flex flex-column gap-2">
            {atPrincipal.map((req: any) => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3 opacity-85">
                <div className="card-body p-3 d-flex align-items-center gap-3">
                  <div className="rounded-3 bg-purple bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 40, height: 40, fontSize: 18, background: "rgba(139,92,246,0.1)" }}>👀</div>
                  <div className="flex-grow-1">
                    <div className="fw-bold small text-dark">{req.student_name || req.student} — {req.subject_name || req.subject}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>Score: {req.score} · Waiting for Principal</div>
                  </div>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: 10 }}>At Principal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Principal approved, release back to teacher */}
      {approved.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">✅ Principal Approved — Release to Teacher</h3>
          <div className="d-flex flex-column gap-2">
            {approved.map((req: any) => (
              <div key={req.id} className="card border-0 rounded-3" style={{ border: "1.5px solid #bbf7d0" }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div>
                      <div className="fw-bold text-dark small">{req.student_name || req.student} — {req.subject_name || req.subject}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>Score: {req.score} · Approved by Principal</div>
                    </div>
                    <span className="badge bg-success text-white" style={{ fontSize: 10 }}>✅ Approved</span>
                  </div>
                  <button onClick={() => releaseToTeacher(req.id)} className="btn btn-success btn-sm w-100">📬 Release to Teacher</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Done */}
      {released.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">🎓 Released</h3>
          <div className="d-flex flex-column gap-2">
            {released.map((req: any) => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3 opacity-75">
                <div className="card-body p-3 d-flex align-items-center justify-content-between">
                  <div>
                    <div className="fw-bold small text-dark">{req.student_name || req.student} — {req.subject_name || req.subject}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>Score: {req.score}</div>
                  </div>
                  <span className="badge bg-success text-white" style={{ fontSize: 10 }}>🎓 Released</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">✕ Rejected</h3>
          <div className="d-flex flex-column gap-2">
            {rejected.map((req: any) => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3 opacity-75">
                <div className="card-body p-3 d-flex align-items-center justify-content-between">
                  <div>
                    <div className="fw-bold small text-dark">{req.student_name || req.student} — {req.subject_name || req.subject}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>Rejected</div>
                  </div>
                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle" style={{ fontSize: 10 }}>✕ Rejected</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-4 text-center text-muted small">No grade requests at this time.</div>
        </div>
      )}
    </div>
  );
}

export default function RegistrarDashboardPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadCount = 2;

  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    const role  = localStorage.getItem("inform_role");
    if (!token || role !== "registrar") {
      window.location.replace("/login");
    }
  }, []);

  return (
    <div className="min-vh-100">
      {/* Welcome banner */}
      <div
        style={{
          marginLeft: sidebarExpanded ? 256 : 80,
          background: "linear-gradient(135deg, #065f46 0%, #059669 60%, #10b981 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "1.25rem 1.5rem",
          transition: "margin-left 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* Left: title */}
        <div>
          <div className="small text-uppercase fw-semibold mb-1" style={{ letterSpacing: "0.12em", color: "rgba(255,255,255,0.6)" }}>
            Registrar Portal
          </div>
          <h1 className="fw-black mb-0" style={{ color: "#ffffff", fontSize: "1.5rem", lineHeight: 1.2 }}>
            Welcome back, Registrar
          </h1>
        </div>

        {/* Right: System Online + Bell */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block", animation: "pulse 2s ease-in-out infinite" }} />
            System Online
          </span>

          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            aria-label="Notifications"
            style={{ position: "relative", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ffffff", transition: "background 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #059669" }}>
                {unreadCount}
              </span>
            )}
          </button>

          <div style={{ background: "linear-gradient(135deg,#059669,#065f46)", border: "2px solid rgba(255,255,255,0.25)", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: 13, fontWeight: 700 }}>
            RG
          </div>
        </div>
      </div>

      {/* Notification dropdown */}
      {showNotifDropdown && (
        <>
          <div style={{ position: "fixed", top: 80, right: 20, width: "min(360px, calc(100vw - 32px))", maxHeight: "min(480px, calc(100vh - 120px))", background: "white", borderRadius: "0.75rem", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", zIndex: 9999, overflowY: "auto" }}>
            <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
              <div><div className="fw-bold text-dark small">Notifications</div><div className="text-muted" style={{ fontSize: 11 }}>{unreadCount} unread</div></div>
              <button onClick={() => setShowNotifDropdown(false)} className="btn btn-link btn-sm p-0 text-muted" style={{ fontSize: 18 }}>✕</button>
            </div>
            {[
              { id: 1, title: "Document Request", message: "Jamie Santos requested a TOR",                 time: "1h ago", read: false },
              { id: 2, title: "Grade Submitted",  message: "Mr. Dela Cruz submitted grades for Algebra I", time: "2h ago", read: false },
              { id: 3, title: "New Enrollment",   message: "Rosa Bautista enrolled in the system",         time: "1d ago", read: true  },
              { id: 4, title: "Payment Received", message: "Carlo Dela Cruz paid tuition fee",             time: "2d ago", read: true  },
            ].map(n => (
              <div key={n.id} className="px-4 py-3 border-bottom d-flex gap-3" style={{ background: n.read ? "white" : "rgba(5,150,105,0.04)", opacity: n.read ? 0.7 : 1 }}>
                <div className="flex-grow-1">
                  <div className="fw-bold small text-dark">{n.title}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>{n.message}</div>
                  <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>{n.time}</div>
                </div>
              </div>
            ))}
            <div className="px-4 py-2 border-top text-center">
              <button onClick={() => setShowNotifDropdown(false)} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: 12 }}>Close</button>
            </div>
          </div>
          <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 9998 }} onClick={() => setShowNotifDropdown(false)} />
        </>
      )}

      <AdminDashboardPage hideBanner onSidebarExpandChange={setSidebarExpanded} readOnly={false} hideTopbarControls role="registrar" />
    </div>
  );
}
