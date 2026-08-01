"use client";

import { useState, useRef } from "react";
import AdminDashboardPage from "../../dashboard/page";

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

/* ── Main Page ── */
export default function PrincipalDashboardPage() {
  const [sidebarExpanded, setSidebarExpanded]   = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfile, setShowProfile]           = useState(false);
  const unreadCount = 2;

  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    const role  = localStorage.getItem("inform_role");
    if (!token || role !== "Principal") {
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
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ animation: unreadCount > 0 ? "swing 1s ease-in-out 0.5s 2" : "none" }}>
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

      {/* Full admin dashboard — principal sees everything including grade requests */}
      <AdminDashboardPage hideBanner onSidebarExpandChange={setSidebarExpanded} hideTopbarControls />

      {/* Profile overlay */}
      {showProfile && (
        <div style={{ position: "fixed", top: 0, left: sidebarExpanded ? 256 : 80, right: 0, bottom: 0, background: "#f0f4ff", zIndex: 1050, overflowY: "auto", padding: "1.5rem", transition: "left 0.3s ease" }}>
          <PrincipalProfile onClose={() => setShowProfile(false)} />
        </div>
      )}
    </div>
  );
}
