"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  course: string;
  yearLevel: string;
  dateOfBirth: string;
  guardianName: string;
  guardianContact: string;
  enrollmentDate: string;
  profilePicture?: string;
}

const INITIAL_PROFILE: ProfileData = {
  id: "202400001",
  name: "Jamie Santos",
  email: "jamie.santos@student.cfei.edu",
  phone: "+63 912 345 6789",
  address: "123 Basak, Lapu-Lapu City, Cebu",
  course: "STEM",
  yearLevel: "Grade 11",
  dateOfBirth: "2008-05-15",
  guardianName: "Maria Santos",
  guardianContact: "+63 912 345 6788",
  enrollmentDate: "2024-08-15",
};

/* ── Sidebar ── */
function Sidebar({ show, setShow }: { show: boolean; setShow: (b: boolean) => void }) {
  const [expanded, setExpanded] = useState(false);
  const navItems = [
    { id: "home", label: "Dashboard", href: "/dashboard" },
    { id: "grades", label: "My Grades", href: "/dashboard" },
    { id: "schedule", label: "My Schedule", href: "/dashboard" },
    { id: "tuition", label: "Tuition Fee", href: "/dashboard" },
    { id: "documents", label: "Documents", href: "/dashboard" },
    { id: "notifications", label: "Notifications", href: "/dashboard" },
  ];

  return (
    <>
      {show && <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" style={{ zIndex: 1040 }} onClick={() => setShow(false)} />}
      <div
        className={`d-flex flex-column flex-shrink-0 position-fixed top-0 start-0 h-100 ${show ? "" : "d-none d-lg-flex"}`}
        style={{ width: expanded ? 256 : 80, zIndex: 1045, background: "linear-gradient(180deg,#1e1b4b 0%,#312e81 100%)", overflowY: "auto", overflowX: "hidden", transition: "width 0.3s ease" }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div className="sidebar-brand">
          <div className="sidebar-brand-group" style={{ flexDirection: expanded ? "column" : "row", alignItems: "center", justifyContent: "center", width: "100%" }}>
            <img src="/cfei-logo.jpg" alt="CFEI" className="sidebar-brand-logo" />
            {expanded && (
              <div className="sidebar-brand-info" style={{ alignItems: "center", textAlign: "center", marginTop: 10 }}>
                <div className="sidebar-brand-title">Student Portal</div>
              </div>
            )}
          </div>
          {expanded && <button className="btn-close btn-close-white sidebar-brand-close d-lg-none" onClick={() => setShow(false)} />}
        </div>

        {/* Profile - Right after Student Portal */}
        {expanded && (
          <div className="px-3 mt-3 mb-2">
            <Link href="/dashboard/profile" className="text-decoration-none">
              <div className="d-flex align-items-center gap-3 rounded-3 px-3 py-2" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0" style={{ width: 36, height: 36, fontSize: 13, background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>JS</div>
                <div className="flex-grow-1 overflow-hidden">
                  <div className="text-white small fw-semibold text-truncate">Jamie Santos</div>
                  <div className="text-truncate" style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>STU-2024-001</div>
                </div>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>👤</span>
              </div>
            </Link>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-grow-1 px-3 py-2 d-flex flex-column gap-1 mt-2">
          {navItems.map(item => (
            <Link key={item.id} href={item.href}
              className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0"
              style={{ color: "rgba(255,255,255,0.5)", background: "transparent", justifyContent: expanded ? "flex-start" : "center", whiteSpace: "nowrap" }}
              title={item.label}>
              <span style={{ fontSize: 18 }}></span>
              {expanded && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout button - More visible at bottom */}
        {expanded && (
          <div className="px-3 py-3 border-top border-white border-opacity-10">
            <Link href="/login" className="btn w-100 fw-semibold py-2 d-flex align-items-center justify-content-center gap-2" style={{ background: "rgba(220,38,38,0.15)", color: "#fca5a5", border: "1px solid rgba(220,38,38,0.3)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.25)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(220,38,38,0.15)"; e.currentTarget.style.color = "#fca5a5"; }}>
              <span style={{ fontSize: 16 }}>↩</span>
              <span>Log Out</span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sidebarShow, setSidebarShow] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>("/cfei-logo.jpg");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEditMode(false);
      setToast("Profile updated successfully!");
      setTimeout(() => setToast(null), 3000);
    }, 1000);
  };

  const handleCancel = () => {
    setEditMode(false);
    setProfile(INITIAL_PROFILE);
    setProfilePicture("/cfei-logo.jpg");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast("⚠️ File size must be less than 5MB");
        setTimeout(() => setToast(null), 3000);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar show={sidebarShow} setShow={setSidebarShow} />

      {/* Toast */}
      {toast && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-4" style={{ zIndex: 9999 }}>
          <div className="alert shadow-lg rounded-3 px-4 py-3 d-flex align-items-center gap-3" style={{ minWidth: "300px", background: toast.includes("⚠️") ? "#fef2f2" : "#d1fae5", border: toast.includes("⚠️") ? "1px solid #fecaca" : "1px solid #86efac" }}>
            <span style={{ fontSize: 24 }}>{toast.includes("⚠️") ? "⚠️" : "✅"}</span>
            <span className="fw-semibold" style={{ color: toast.includes("⚠️") ? "#dc2626" : "#059669" }}>{toast}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-grow-1" style={{ marginLeft: "80px", width: "calc(100% - 80px)" }}>
        {/* Header */}
        <header className="bg-white border-bottom border-light shadow-sm position-sticky top-0" style={{ zIndex: 100 }}>
          <div className="container-fluid py-3 px-4">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <button onClick={() => setSidebarShow(true)} className="btn btn-light d-lg-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="h5 mb-0 fw-bold" style={{ color: "#1e293b" }}>My Profile</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container-fluid py-4 px-4">
          <div className="row g-4">
            {/* Profile Card */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-body p-0">
                  {/* Cover */}
                  <div className="position-relative" style={{ height: "120px", background: "linear-gradient(135deg, #6366f1, #7c3aed)" }}>
                    <div className="position-absolute top-50 start-50 translate-middle" style={{ marginTop: "40px" }}>
                      <div className="position-relative">
                        <div className="rounded-circle border border-4 border-white bg-white overflow-hidden" style={{ width: "120px", height: "120px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                          <img src={profilePicture} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        {editMode && (
                          <>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="position-absolute bottom-0 end-0 btn btn-primary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: 36, height: 36, padding: 0 }}
                              title="Change photo"
                            >
                              📷
                            </button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="d-none"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="pt-5 mt-4 px-4 pb-4 text-center">
                    <h3 className="fw-bold mb-1" style={{ color: "#1e293b" }}>{profile.name}</h3>
                    <p className="text-muted small mb-3">ID: {profile.id}</p>
                    <div className="d-flex justify-content-center gap-2 mb-4">
                      <span className="badge rounded-pill px-3 py-2" style={{ background: "linear-gradient(135deg, #6366f1, #7c3aed)", color: "white" }}>
                        {profile.course}
                      </span>
                      <span className="badge rounded-pill px-3 py-2 bg-light text-dark border">
                        {profile.yearLevel}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="rounded-3 p-3 bg-light border">
                          <div className="text-muted small mb-1">Member Since</div>
                          <div className="fw-bold small text-primary">{new Date(profile.enrollmentDate).getFullYear()}</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="rounded-3 p-3 bg-light border">
                          <div className="text-muted small mb-1">Status</div>
                          <div className="fw-bold small text-success">Active</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h4 className="fw-bold mb-1" style={{ color: "#1e293b" }}>Profile Information</h4>
                      <p className="text-muted small mb-0">Manage your personal information</p>
                    </div>
                    {!editMode ? (
                      <button onClick={() => setEditMode(true)} className="btn btn-primary px-4">
                        ✏️ Edit Profile
                      </button>
                    ) : (
                      <div className="d-flex gap-2">
                        <button onClick={handleCancel} className="btn btn-outline-secondary px-3">
                          Cancel
                        </button>
                        <button onClick={handleSave} disabled={loading} className="btn btn-primary px-4">
                          {loading ? "Saving..." : "💾 Save Changes"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="row g-4">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small text-uppercase text-muted">Full Name</label>
                      <input type="text" className="form-control" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} disabled={!editMode} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small text-uppercase text-muted">Student ID</label>
                      <input type="text" className="form-control" value={profile.id} disabled style={{ background: "#f1f5f9" }} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small text-uppercase text-muted">Email</label>
                      <input type="email" className="form-control" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} disabled={!editMode} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small text-uppercase text-muted">Phone</label>
                      <input type="tel" className="form-control" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} disabled={!editMode} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold small text-uppercase text-muted">Address</label>
                      <input type="text" className="form-control" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} disabled={!editMode} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small text-uppercase text-muted">Course</label>
                      <select className="form-select" value={profile.course} onChange={e => setProfile({ ...profile, course: e.target.value })} disabled={!editMode}>
                        <option value="STEM">STEM</option>
                        <option value="HUMSS">HUMSS</option>
                        <option value="ABM">ABM</option>
                        <option value="TVL-TechPro">TVL-TechPro</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small text-uppercase text-muted">Year Level</label>
                      <select className="form-select" value={profile.yearLevel} onChange={e => setProfile({ ...profile, yearLevel: e.target.value })} disabled={!editMode}>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small text-uppercase text-muted">Date of Birth</label>
                      <input type="date" className="form-control" value={profile.dateOfBirth} onChange={e => setProfile({ ...profile, dateOfBirth: e.target.value })} disabled={!editMode} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small text-uppercase text-muted">Enrollment Date</label>
                      <input type="date" className="form-control" value={profile.enrollmentDate} disabled style={{ background: "#f1f5f9" }} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small text-uppercase text-muted">Guardian Name</label>
                      <input type="text" className="form-control" value={profile.guardianName} onChange={e => setProfile({ ...profile, guardianName: e.target.value })} disabled={!editMode} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small text-uppercase text-muted">Guardian Contact</label>
                      <input type="tel" className="form-control" value={profile.guardianContact} onChange={e => setProfile({ ...profile, guardianContact: e.target.value })} disabled={!editMode} />
                    </div>
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
