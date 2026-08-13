"use client";

import { useState, useRef, useEffect } from "react";
import { AdminDashboardPage } from "../../../components/AdminDashboardShell";

/* ── Profile Panel ── */
function PrincipalProfile({ onClose }: { onClose: () => void }) {
  const INITIAL = { id: "P001", name: "Principal", email: "principal@cfei.edu", phone: "+63 912 000 0001", address: "Cebu Far East Institute, Cebu City", position: "School Principal", department: "Administration", dateOfBirth: "1975-03-20", employmentDate: "2010-06-01" };
  const [profile, setProfile]   = useState(INITIAL);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState<string | null>(null);
  const [pic, setPic]           = useState("/cfei-logo.jpg");
  const fileRef                 = useRef<HTMLInputElement>(null);

  const save = () => { setLoading(true); setTimeout(() => { setLoading(false); setEditMode(false); setToast("Profile updated!"); setTimeout(() => setToast(null), 3000); }, 1000); };
  const cancel = () => { setEditMode(false); setProfile(INITIAL); setPic("/cfei-logo.jpg"); };
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setToast("⚠️ Max 5MB"); return; }
    const r = new FileReader(); r.onloadend = () => setPic(r.result as string); r.readAsDataURL(f);
  };

  return (
    <div className="d-flex flex-column gap-4">
      {toast && <div className="position-fixed top-0 start-50 translate-middle-x mt-4" style={{ zIndex: 9999 }}><div className="alert shadow-lg rounded-3 px-4 py-3" style={{ background: toast.includes("⚠️") ? "#fef2f2" : "#d1fae5", border: toast.includes("⚠️") ? "1px solid #fecaca" : "1px solid #86efac" }}><span className="fw-semibold" style={{ color: toast.includes("⚠️") ? "#dc2626" : "#059669" }}>{toast}</span></div></div>}
      <div className="d-flex align-items-center justify-content-between">
        <div><h2 className="fw-black fs-4 text-dark mb-1">My Profile</h2><p className="text-muted small mb-0">Manage your personal information</p></div>
        <button onClick={onClose} className="btn btn-outline-secondary btn-sm">← Back</button>
      </div>
      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-0">
              <div className="position-relative" style={{ height: 120, background: "linear-gradient(135deg,#1e3a5f,#1d4ed8)" }}>
                <div className="position-absolute top-50 start-50 translate-middle" style={{ marginTop: 40 }}>
                  <div className="position-relative">
                    <div className="rounded-circle border border-4 border-white bg-white overflow-hidden" style={{ width: 120, height: 120 }}><img src={pic} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                    {editMode && <><button onClick={() => fileRef.current?.click()} className="position-absolute bottom-0 end-0 btn btn-primary btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, padding: 0 }}>📷</button><input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="d-none" /></>}
                  </div>
                </div>
              </div>
              <div className="pt-5 mt-4 px-4 pb-4 text-center">
                <h3 className="fw-bold mb-1" style={{ color: "#1e293b" }}>{profile.name}</h3>
                <p className="text-muted small mb-3">ID: {profile.id}</p>
                <span className="badge rounded-pill px-3 py-2" style={{ background: "linear-gradient(135deg,#1e3a5f,#1d4ed8)", color: "white" }}>{profile.position}</span>
                <div className="row g-3 mt-2">
                  <div className="col-6"><div className="rounded-3 p-3 bg-light border"><div className="text-muted small mb-1">Since</div><div className="fw-bold small text-primary">{new Date(profile.employmentDate).getFullYear()}</div></div></div>
                  <div className="col-6"><div className="rounded-3 p-3 bg-light border"><div className="text-muted small mb-1">Status</div><div className="fw-bold small text-success">Active</div></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div><h4 className="fw-bold mb-1" style={{ color: "#1e293b" }}>Profile Information</h4><p className="text-muted small mb-0">Update your personal details</p></div>
                {!editMode ? <button onClick={() => setEditMode(true)} className="btn btn-primary px-4">✏️ Edit Profile</button> : <div className="d-flex gap-2"><button onClick={cancel} className="btn btn-outline-secondary px-3">Cancel</button><button onClick={save} disabled={loading} className="btn btn-primary px-4">{loading ? "Saving..." : "Save Changes"}</button></div>}
              </div>
              <div className="row g-4">
                {([ ["Full Name","name","text",false], ["Principal ID","id","text",true], ["Email","email","email",false], ["Phone","phone","tel",false], ["Address","address","text",false], ["Position","position","text",true], ["Department","department","text",true] ] as [string,string,string,boolean][]).map(([label, key, type, disabled]) => (
                  <div key={key} className="col-12 col-md-6">
                    <label className="form-label fw-semibold small text-uppercase text-muted">{label}</label>
                    <input type={type} className="form-control" value={profile[key as keyof typeof profile]} onChange={e => setProfile({ ...profile, [key]: e.target.value })} disabled={!editMode || disabled} style={disabled ? { background: "#f1f5f9" } : {}} />
                  </div>
                ))}
                <div className="col-12 col-md-6"><label className="form-label fw-semibold small text-uppercase text-muted">Date of Birth</label><input type="date" className="form-control" value={profile.dateOfBirth} onChange={e => setProfile({ ...profile, dateOfBirth: e.target.value })} disabled={!editMode} /></div>
                <div className="col-12 col-md-6"><label className="form-label fw-semibold small text-uppercase text-muted">Employment Date</label><input type="date" className="form-control" value={profile.employmentDate} disabled style={{ background: "#f1f5f9" }} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Grade Requests Panel for Principal ── */
function PrincipalGradeRequestsPanel() {
  const [requests, setRequests]   = useState<any[]>([]);
  const [termConfig, setTermConfig] = useState<{ term: string; is_open: number }[]>([]);
  const [toast, setToast]         = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3500); }

  function reload() {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    fetch("https://group-1rms-production-a4d8.up.railway.app/api/grade-requests/principal", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => {
        if (r.status === 401) { showToast("⚠️ Session expired. Please log in again."); return null; }
        return r.ok ? r.json() : null;
      })
      .then(data => { if (data?.requests) setRequests(data.requests); })
      .catch(() => {});

    fetch("https://group-1rms-production-a4d8.up.railway.app/api/grade-requests/config")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.config) setTermConfig(data.config); })
      .catch(() => {});
  }

  // Re-fetch config only (lighter than full reload)
  function reloadConfig() {
    fetch("https://group-1rms-production-a4d8.up.railway.app/api/grade-requests/config")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.config) setTermConfig(data.config); })
      .catch(() => {});
  }

  useEffect(() => {
    reload();
    const interval = setInterval(reload, 15000);
    return () => clearInterval(interval);
  }, []);

  function toggleTerm(term: string, open: boolean) {
    const token = localStorage.getItem("inform_token");
    if (!token) { showToast("⚠️ Session expired. Please log in again."); return; }
    // Optimistic update — flip immediately so UI responds at once
    setTermConfig(prev => prev.map(c => c.term === term ? { ...c, is_open: open ? 1 : 0 } : c));
    fetch(`https://group-1rms-production-a4d8.up.railway.app/api/grade-requests/principal/${open ? "open" : "close"}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ term }),
    })
      .then(r => {
        if (r.status === 401) { showToast("⚠️ Session expired. Please log in again."); return null; }
        return r.ok ? r.json() : Promise.reject(r.status);
      })
      .then(data => {
        if (!data) return;
        showToast(open ? `🟢 ${term} grade requests opened.` : `🔴 ${term} grade requests closed.`);
        reloadConfig(); // confirm from server
      })
      .catch(() => {
        // Revert optimistic update on failure
        setTermConfig(prev => prev.map(c => c.term === term ? { ...c, is_open: open ? 0 : 1 } : c));
        showToast("⚠️ Failed to update term status. Please try again.");
      });
  }

  function approveRequest(id: number) {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    fetch(`https://group-1rms-production-a4d8.up.railway.app/api/grade-requests/principal/${id}/approve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    })
      .then(r => r.ok ? r.json() : null)
      .then(() => { reload(); showToast("✅ Grade approved. Sent back to Registrar."); })
      .catch(() => showToast("⚠️ Failed to approve."));
  }

  function rejectRequest(id: number) {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    const reason = prompt("Reason for rejection (required):") || "";
    if (!reason.trim()) { showToast("⚠️ Rejection reason is required."); return; }
    fetch(`https://group-1rms-production-a4d8.up.railway.app/api/grade-requests/principal/${id}/reject`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ rejection_reason: reason }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(() => { reload(); showToast("✕ Grade request rejected."); })
      .catch(() => showToast("⚠️ Failed to reject."));
  }

  const forReview = requests.filter(r => r.status === "principal_review");
  const approved  = requests.filter(r => r.status === "principal_approved");
  const rejected  = requests.filter(r => r.status === "rejected");
  const others    = requests.filter(r => !["principal_review", "principal_approved", "rejected"].includes(r.status));

  return (
    <div className="d-flex flex-column gap-4 p-3 p-md-4">
        {toast && (
          <div className="position-fixed bottom-0 end-0 m-4 alert alert-dark shadow-lg rounded-3 py-2 px-3" style={{ zIndex: 9999, fontSize: 13, minWidth: 280 }}>{toast}</div>
        )}

        {/* Open/Close Term Controls */}
        <div>
          <h2 className="fw-black fs-4 text-dark mb-1">Grade Request Controls</h2>
          <p className="text-muted small mb-3">Open or close the grade request window for each term</p>
          <div className="row g-3">
            {["Term 1", "Term 2", "Term 3"].map(term => {
              const config = termConfig.find(c => c.term === term);
              const isOpen = !!config?.is_open;
              return (
                <div key={term} className="col-12 col-md-4">
                  <div className={`card border-0 shadow-sm rounded-3 ${isOpen ? "border-start border-4 border-success" : ""}`}
                    style={{ borderLeft: isOpen ? "4px solid #10b981" : "4px solid #e2e8f0" }}>
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="fw-bold text-dark">{term}</div>
                        <span className={`badge ${isOpen ? "bg-success text-white" : "bg-secondary-subtle text-secondary border border-secondary-subtle"}`}>
                          {isOpen ? "🟢 Open" : "🔴 Closed"}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleTerm(term, !isOpen)}
                        className={`btn btn-sm w-100 ${isOpen ? "btn-outline-danger" : "btn-success"}`}>
                        {isOpen ? "🔴 Close Requests" : "🟢 Open Requests"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grade Requests — Review */}
        <div>
          <h2 className="fw-black fs-4 text-dark mb-1">Grade Requests</h2>
          <p className="text-muted small mb-0">Approve or reject grade requests forwarded by the Registrar</p>
        </div>

        {forReview.length > 0 && (
          <div>
            <h3 className="fw-bold small text-dark mb-3">👀 Needs Your Approval</h3>
            <div className="d-flex flex-column gap-2">
              {forReview.map((req: any) => (
                <div key={req.id} className="card border-0 shadow-sm rounded-3" style={{ borderLeft: "4px solid #8b5cf6" }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                      <div>
                        <div className="fw-bold text-dark small">{req.student_name || req.student}</div>
                        <div className="text-muted" style={{ fontSize: 11 }}>{req.subject_name || req.subject} · {req.term}</div>
                        <div className="text-muted" style={{ fontSize: 11 }}>Score: <strong>{req.score}</strong> · Teacher: {req.teacher_name || req.teacher}</div>
                        {req.registrar_note && <div className="text-muted fst-italic" style={{ fontSize: 11 }}>Registrar note: {req.registrar_note}</div>}
                      </div>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: 10 }}>👀 Review</span>
                    </div>
                    <div className="d-flex gap-2">
                      <button onClick={() => approveRequest(req.id)} className="btn btn-success btn-sm flex-grow-1">✅ Approve</button>
                      <button onClick={() => rejectRequest(req.id)} className="btn btn-outline-danger btn-sm">✕ Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {approved.length > 0 && (
          <div>
            <h3 className="fw-bold small text-dark mb-3">✅ Approved</h3>
            <div className="d-flex flex-column gap-2">
              {approved.map((req: any) => (
                <div key={req.id} className="card border-0 shadow-sm rounded-3 opacity-75">
                  <div className="card-body p-3 d-flex align-items-center justify-content-between">
                    <div>
                      <div className="fw-bold small text-dark">{req.student_name || req.student} — {req.subject_name || req.subject}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>Score: {req.score} · Sent back to Registrar</div>
                    </div>
                    <span className="badge bg-success text-white" style={{ fontSize: 10 }}>✅ Approved</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

        {others.length > 0 && (
          <div>
            <h3 className="fw-bold small text-dark mb-3">📋 Other Requests</h3>
            <div className="d-flex flex-column gap-2">
              {others.map((req: any) => (
                <div key={req.id} className="card border-0 shadow-sm rounded-3 opacity-75">
                  <div className="card-body p-3 d-flex align-items-center justify-content-between">
                    <div>
                      <div className="fw-bold small text-dark">{req.student_name || req.student} — {req.subject_name || req.subject}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{req.status}</div>
                    </div>
                    <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle" style={{ fontSize: 10 }}>{req.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {requests.length === 0 && forReview.length === 0 && (
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4 text-center text-muted small">No grade requests forwarded yet.</div>
          </div>
        )}
      </div>
  );
}

/* ── Main Page ── */
export default function PrincipalDashboardPage() {
  const [sidebarExpanded, setSidebarExpanded]   = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfile, setShowProfile]           = useState(false);
  const unreadCount = 2;

  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    const role  = localStorage.getItem("inform_role");
    if (!token || role !== "principal") {
      window.location.replace("/login");
    }
  }, []);

  return (
    <div className="min-vh-100">
      {/* Welcome banner */}
      <div style={{ marginLeft: sidebarExpanded ? 256 : 80, background: "linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 60%,#2563eb 100%)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1.25rem 1.5rem", transition: "margin-left 0.3s ease", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <div className="small text-uppercase fw-semibold mb-1" style={{ letterSpacing: "0.12em", color: "rgba(255,255,255,0.6)" }}>Principal Portal</div>
          <h1 className="fw-black mb-0" style={{ color: "#ffffff", fontSize: "1.5rem", lineHeight: 1.2 }}>Welcome back, Principal</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(16,185,129,0.18)", border: "1px solid rgba(16,185,129,0.4)", color: "#6ee7b7", borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block", animation: "pulse 2s ease-in-out infinite" }} />
            System Online
          </span>
          <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} aria-label="Notifications"
            style={{ position: "relative", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: "background 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            {unreadCount > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #1d4ed8" }}>{unreadCount}</span>}
          </button>
          <button onClick={() => setShowProfile(true)} aria-label="My Profile" title="My Profile"
            style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)", border: "2px solid rgba(255,255,255,0.25)", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0, transition: "transform 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
            PR
          </button>
        </div>
      </div>

      {/* Notification dropdown */}
      {showNotifDropdown && (
        <>
          <div style={{ position: "fixed", top: 80, right: 20, width: "min(360px,calc(100vw - 32px))", maxHeight: "min(480px,calc(100vh - 120px))", background: "white", borderRadius: "0.75rem", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", zIndex: 9999, overflowY: "auto" }}>
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
              <div key={n.id} className="px-4 py-3 border-bottom d-flex gap-3" style={{ background: n.read ? "white" : "rgba(99,102,241,0.04)", opacity: n.read ? 0.7 : 1 }}>
                <div className="flex-grow-1">
                  <div className="fw-bold small text-dark">{n.title}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>{n.message}</div>
                  <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>{n.time}</div>
                </div>
              </div>
            ))}
            <div className="px-4 py-2 border-top text-center"><button onClick={() => setShowNotifDropdown(false)} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: 12 }}>Close</button></div>
          </div>
          <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 9998 }} onClick={() => setShowNotifDropdown(false)} />
        </>
      )}

      <AdminDashboardPage
        hideBanner
        onSidebarExpandChange={setSidebarExpanded}
        hideTopbarControls
        role="principal"
      />

      {/* Profile overlay */}
      {showProfile && (
        <div style={{ position: "fixed", top: 0, left: sidebarExpanded ? 256 : 80, right: 0, bottom: 0, background: "#f0f4ff", zIndex: 1050, overflowY: "auto", padding: "1.5rem", transition: "left 0.3s ease" }}>
          <PrincipalProfile onClose={() => setShowProfile(false)} />
        </div>
      )}
    </div>
  );
}

