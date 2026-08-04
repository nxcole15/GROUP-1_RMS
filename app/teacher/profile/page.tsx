"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function TeacherProfilePage() {
  const INITIAL = {
    id:             "T001",
    name:           "Dr. Rosa Mendoza",
    email:          "r.mendoza@inform.edu",
    phone:          "+63 912 000 0001",
    address:        "Cebu Far East Institute, Cebu City",
    department:     "Computer Science",
    position:       "Teacher",
    dateOfBirth:    "1985-04-10",
    employmentDate: "2015-06-01",
  };

  const [profile, setProfile]   = useState(INITIAL);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState<string | null>(null);
  const [pic, setPic]           = useState("/cfei-logo.jpg");
  const fileRef                 = useRef<HTMLInputElement>(null);

  // Load real teacher data on mount
  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    const role  = localStorage.getItem("inform_role");
    if (!token || role !== "Teacher") { window.location.replace("/login"); return; }
    if (token.startsWith("demo_")) return;
    fetch("http://localhost:4000/api/teacher/me", {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.teacher) {
          const t = data.teacher;
          setProfile(prev => ({
            ...prev,
            id:         t.teacher_id || prev.id,
            name:       t.full_name   || prev.name,
            email:      t.email       || prev.email,
            department: t.department  || prev.department,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const save = () => {
    setLoading(true);
    const token = localStorage.getItem("inform_token");
    const doSave = () => {
      setLoading(false);
      setEditMode(false);
      setToast("Profile updated successfully!");
      setTimeout(() => setToast(null), 3000);
    };
    if (token && !token.startsWith("demo_")) {
      fetch("http://localhost:4000/api/teacher/me", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ full_name: profile.name, email: profile.email }),
      }).catch(() => {}).finally(doSave);
    } else {
      setTimeout(doSave, 800);
    }
  };

  const cancel = () => { setEditMode(false); setProfile(INITIAL); setPic("/cfei-logo.jpg"); };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setToast("⚠️ Max 5MB"); return; }
    const r = new FileReader(); r.onloadend = () => setPic(r.result as string); r.readAsDataURL(f);
  };

  return (
    <div className="min-vh-100" style={{ background: "#f0f4ff" }}>
      {/* Toast */}
      {toast && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-4" style={{ zIndex: 9999 }}>
          <div className="alert shadow-lg rounded-3 px-4 py-3" style={{ background: toast.includes("⚠️") ? "#fef2f2" : "#d1fae5", border: toast.includes("⚠️") ? "1px solid #fecaca" : "1px solid #86efac" }}>
            <span className="fw-semibold" style={{ color: toast.includes("⚠️") ? "#dc2626" : "#059669" }}>{toast}</span>
          </div>
        </div>
      )}

      <div className="container py-4" style={{ maxWidth: 960 }}>
        {/* Back button */}
        <Link href="/teacher/dashboard" className="btn btn-outline-secondary btn-sm mb-4">← Back to Dashboard</Link>

        <div className="row g-4">
          {/* Profile card */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-body p-0">
                <div className="position-relative" style={{ height: 120, background: "linear-gradient(135deg,#059669,#10b981)" }}>
                  <div className="position-absolute top-50 start-50 translate-middle" style={{ marginTop: 40 }}>
                    <div className="position-relative">
                      <div className="rounded-circle border border-4 border-white bg-white overflow-hidden" style={{ width: 120, height: 120 }}>
                        <img src={pic} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      {editMode && (
                        <>
                          <button onClick={() => fileRef.current?.click()} className="position-absolute bottom-0 end-0 btn btn-success btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, padding: 0 }}>📷</button>
                          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="d-none" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pt-5 mt-4 px-4 pb-4 text-center">
                  <h3 className="fw-bold mb-1" style={{ color: "#1e293b" }}>{profile.name}</h3>
                  <p className="text-muted small mb-3">ID: {profile.id}</p>
                  <span className="badge rounded-pill px-3 py-2" style={{ background: "linear-gradient(135deg,#059669,#10b981)", color: "white" }}>{profile.department}</span>
                  <div className="row g-3 mt-2">
                    <div className="col-6"><div className="rounded-3 p-3 bg-light border"><div className="text-muted small mb-1">Since</div><div className="fw-bold small text-success">{new Date(profile.employmentDate).getFullYear()}</div></div></div>
                    <div className="col-6"><div className="rounded-3 p-3 bg-light border"><div className="text-muted small mb-1">Status</div><div className="fw-bold small text-success">Active</div></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile details */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div><h4 className="fw-bold mb-1" style={{ color: "#1e293b" }}>Profile Information</h4><p className="text-muted small mb-0">Update your personal details</p></div>
                  {!editMode
                    ? <button onClick={() => setEditMode(true)} className="btn btn-success px-4">✏️ Edit Profile</button>
                    : <div className="d-flex gap-2"><button onClick={cancel} className="btn btn-outline-secondary px-3">Cancel</button><button onClick={save} disabled={loading} className="btn btn-success px-4">{loading ? "Saving..." : "Save Changes"}</button></div>
                  }
                </div>
                <div className="row g-4">
                  {([
                    ["Full Name",        "name",           "text",  false],
                    ["Teacher ID",       "id",             "text",  true ],
                    ["Email",            "email",          "email", false],
                    ["Phone",            "phone",          "tel",   false],
                    ["Address",         "address",         "text",  false],
                    ["Department",      "department",      "text",  true ],
                    ["Position",        "position",        "text",  true ],
                  ] as [string, keyof typeof profile, string, boolean][]).map(([label, key, type, disabled]) => (
                    <div key={key} className="col-12 col-md-6">
                      <label className="form-label fw-semibold small text-uppercase text-muted">{label}</label>
                      <input type={type} className="form-control" value={profile[key]} onChange={e => setProfile({ ...profile, [key]: e.target.value })} disabled={!editMode || disabled} style={disabled ? { background: "#f1f5f9" } : {}} />
                    </div>
                  ))}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small text-uppercase text-muted">Date of Birth</label>
                    <input type="date" className="form-control" value={profile.dateOfBirth} onChange={e => setProfile({ ...profile, dateOfBirth: e.target.value })} disabled={!editMode} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small text-uppercase text-muted">Employment Date</label>
                    <input type="date" className="form-control" value={profile.employmentDate} disabled style={{ background: "#f1f5f9" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
