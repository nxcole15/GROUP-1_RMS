"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface TeacherProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  department: string;
  subject: string;
  dateOfBirth: string;
  hireDate: string;
  employmentType: string;
  profilePicture?: string;
}

const INITIAL_PROFILE: TeacherProfileData = {
  id: "T001",
  name: "Maria Santos",
  email: "maria.santos@cfei.edu",
  phone: "+63 923 456 7890",
  address: "456 Mandaue City, Cebu",
  department: "Mathematics",
  subject: "Algebra, Calculus",
  dateOfBirth: "1990-03-20",
  hireDate: "2018-06-01",
  employmentType: "Full-time",
};

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string>("/cfei-logo.jpg");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEditMode(false);
      setToast("success");
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
        setToast("warning");
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

  const yearsOfService = new Date().getFullYear() - new Date(profile.hireDate).getFullYear();

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>

      {/* Toast Notification */}
      {toast && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x"
          style={{ zIndex: 9999, marginTop: "20px" }}
        >
          <div
            className="d-flex align-items-center gap-3 px-4 py-3 rounded-4 shadow-lg"
            style={{
              background: toast === "warning" ? "#fef2f2" : "#f0fdf4",
              border: toast === "warning" ? "1px solid #fecaca" : "1px solid #bbf7d0",
              minWidth: "320px",
            }}
          >
            <span style={{ fontSize: 22 }}>{toast === "warning" ? "⚠️" : "✅"}</span>
            <span className="fw-semibold" style={{ color: toast === "warning" ? "#dc2626" : "#16a34a" }}>
              {toast === "warning" ? "File size must be less than 5MB" : "Profile updated successfully!"}
            </span>
          </div>
        </div>
      )}

      <div style={{ marginLeft: "256px" }}>

        {/* Page Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "32px 32px 80px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <div style={{
            position: "absolute", top: -40, right: -40,
            width: 200, height: 200, borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
          }} />
          <div style={{
            position: "absolute", bottom: -60, right: 120,
            width: 150, height: 150, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }} />

          <div className="d-flex align-items-center justify-content-between" style={{ position: "relative", zIndex: 1 }}>
            <div>
              <h1 className="fw-bold text-white mb-1" style={{ fontSize: "1.8rem" }}>My Profile</h1>
              <p className="mb-0" style={{ color: "rgba(255,255,255,0.75)" }}>
                View and manage your personal information
              </p>
            </div>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="btn d-flex align-items-center gap-2 fw-semibold"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "white",
                  borderRadius: "10px",
                  padding: "10px 20px",
                  backdropFilter: "blur(8px)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Profile
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button
                  onClick={handleCancel}
                  className="btn fw-semibold"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    color: "white",
                    borderRadius: "10px",
                    padding: "10px 20px",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn fw-semibold d-flex align-items-center gap-2"
                  style={{
                    background: "white",
                    color: "#667eea",
                    borderRadius: "10px",
                    padding: "10px 20px",
                    border: "none",
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content pulled up over header */}
        <div className="container-fluid px-4" style={{ marginTop: "-52px", paddingBottom: "40px" }}>
          <div className="row g-4">

            {/* Left: Profile Card */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden h-100">

                {/* Avatar Area */}
                <div className="d-flex flex-column align-items-center pt-4 pb-4 px-4 text-center">
                  <div className="position-relative mb-3">
                    <div
                      className="rounded-circle overflow-hidden border shadow"
                      style={{
                        width: 110, height: 110,
                        border: "4px solid white !important",
                        boxShadow: "0 4px 20px rgba(102,126,234,0.3)",
                      }}
                    >
                      <Image
                        src={profilePicture}
                        alt="Profile"
                        width={110}
                        height={110}
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    </div>
                    {editMode && (
                      <>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="position-absolute bottom-0 end-0 d-flex align-items-center justify-content-center rounded-circle border-0 shadow"
                          style={{
                            width: 34, height: 34,
                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                            color: "white",
                            cursor: "pointer",
                          }}
                          title="Change photo"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                          </svg>
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

                  <h4 className="fw-bold mb-1" style={{ color: "#1e293b" }}>{profile.name}</h4>
                  <p className="text-muted small mb-3">ID: {profile.id}</p>

                  <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                    <span
                      className="badge px-3 py-2 rounded-pill"
                      style={{
                        background: "linear-gradient(135deg, #667eea20, #764ba220)",
                        color: "#667eea",
                        border: "1px solid #667eea40",
                        fontWeight: 600,
                      }}
                    >
                      {profile.department}
                    </span>
                    <span
                      className="badge px-3 py-2 rounded-pill"
                      style={{
                        background: "#f0fdf4",
                        color: "#16a34a",
                        border: "1px solid #bbf7d0",
                        fontWeight: 600,
                      }}
                    >
                      {profile.employmentType}
                    </span>
                  </div>

                  {/* Stats Row */}
                  <div className="w-100 row g-3 mb-3">
                    <div className="col-6">
                      <div className="rounded-3 p-3 text-center" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <div className="fw-bold mb-0" style={{ fontSize: "1.3rem", color: "#667eea" }}>
                          {yearsOfService}
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.72rem" }}>Years of Service</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="rounded-3 p-3 text-center" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <div className="fw-bold mb-0" style={{ fontSize: "1.3rem", color: "#16a34a" }}>
                          Active
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.72rem" }}>Status</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Info List */}
                <div className="px-4 pb-4">
                  <hr style={{ borderColor: "#e2e8f0" }} />
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{ width: 36, height: 36, background: "#ede9fe" }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </div>
                      <div style={{ overflow: "hidden" }}>
                        <div className="text-muted" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</div>
                        <div className="fw-semibold text-truncate" style={{ fontSize: "0.85rem", color: "#1e293b" }}>{profile.email}</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{ width: 36, height: 36, background: "#dbeafe" }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.09 1.18 2 2 0 012.08 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-muted" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Phone</div>
                        <div className="fw-semibold" style={{ fontSize: "0.85rem", color: "#1e293b" }}>{profile.phone}</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{ width: 36, height: 36, background: "#dcfce7" }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-muted" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Address</div>
                        <div className="fw-semibold" style={{ fontSize: "0.85rem", color: "#1e293b" }}>{profile.address}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Details Card */}
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-lg rounded-4 h-100">
                <div className="card-body p-4">

                  {/* Section Header */}
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3"
                      style={{
                        width: 44, height: 44,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0" style={{ color: "#1e293b" }}>Profile Information</h5>
                      <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                        {editMode ? "Edit your details below and save when done" : "Your personal and professional details"}
                      </p>
                    </div>
                  </div>

                  {/* Personal Info Section */}
                  <div className="mb-4">
                    <div
                      className="d-flex align-items-center gap-2 mb-3 pb-2"
                      style={{ borderBottom: "2px solid #f1f5f9" }}
                    >
                      <div style={{ width: 4, height: 18, background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: 4 }} />
                      <span className="fw-semibold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.08em", color: "#64748b" }}>
                        Personal Details
                      </span>
                    </div>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: "0.8rem", color: "#475569" }}>Full Name</label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          value={profile.name}
                          onChange={e => setProfile({ ...profile, name: e.target.value })}
                          disabled={!editMode}
                          style={{ border: "1.5px solid #e2e8f0", background: editMode ? "white" : "#f8fafc" }}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: "0.8rem", color: "#475569" }}>Teacher ID</label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          value={profile.id}
                          disabled
                          style={{ border: "1.5px solid #e2e8f0", background: "#f1f5f9", color: "#94a3b8" }}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: "0.8rem", color: "#475569" }}>Date of Birth</label>
                        <input
                          type="date"
                          className="form-control rounded-3"
                          value={profile.dateOfBirth}
                          onChange={e => setProfile({ ...profile, dateOfBirth: e.target.value })}
                          disabled={!editMode}
                          style={{ border: "1.5px solid #e2e8f0", background: editMode ? "white" : "#f8fafc" }}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: "0.8rem", color: "#475569" }}>Address</label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          value={profile.address}
                          onChange={e => setProfile({ ...profile, address: e.target.value })}
                          disabled={!editMode}
                          style={{ border: "1.5px solid #e2e8f0", background: editMode ? "white" : "#f8fafc" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Info Section */}
                  <div className="mb-4">
                    <div
                      className="d-flex align-items-center gap-2 mb-3 pb-2"
                      style={{ borderBottom: "2px solid #f1f5f9" }}
                    >
                      <div style={{ width: 4, height: 18, background: "linear-gradient(135deg, #3b82f6, #06b6d4)", borderRadius: 4 }} />
                      <span className="fw-semibold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.08em", color: "#64748b" }}>
                        Contact Information
                      </span>
                    </div>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: "0.8rem", color: "#475569" }}>Email Address</label>
                        <input
                          type="email"
                          className="form-control rounded-3"
                          value={profile.email}
                          onChange={e => setProfile({ ...profile, email: e.target.value })}
                          disabled={!editMode}
                          style={{ border: "1.5px solid #e2e8f0", background: editMode ? "white" : "#f8fafc" }}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: "0.8rem", color: "#475569" }}>Phone Number</label>
                        <input
                          type="tel"
                          className="form-control rounded-3"
                          value={profile.phone}
                          onChange={e => setProfile({ ...profile, phone: e.target.value })}
                          disabled={!editMode}
                          style={{ border: "1.5px solid #e2e8f0", background: editMode ? "white" : "#f8fafc" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Info Section */}
                  <div>
                    <div
                      className="d-flex align-items-center gap-2 mb-3 pb-2"
                      style={{ borderBottom: "2px solid #f1f5f9" }}
                    >
                      <div style={{ width: 4, height: 18, background: "linear-gradient(135deg, #10b981, #059669)", borderRadius: 4 }} />
                      <span className="fw-semibold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.08em", color: "#64748b" }}>
                        Professional Details
                      </span>
                    </div>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: "0.8rem", color: "#475569" }}>Department</label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          value={profile.department}
                          disabled
                          style={{ border: "1.5px solid #e2e8f0", background: "#f1f5f9", color: "#94a3b8" }}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: "0.8rem", color: "#475569" }}>Subject(s)</label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          value={profile.subject}
                          onChange={e => setProfile({ ...profile, subject: e.target.value })}
                          disabled={!editMode}
                          style={{ border: "1.5px solid #e2e8f0", background: editMode ? "white" : "#f8fafc" }}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: "0.8rem", color: "#475569" }}>Hire Date</label>
                        <input
                          type="date"
                          className="form-control rounded-3"
                          value={profile.hireDate}
                          disabled
                          style={{ border: "1.5px solid #e2e8f0", background: "#f1f5f9", color: "#94a3b8" }}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: "0.8rem", color: "#475569" }}>Employment Type</label>
                        <select
                          className="form-select rounded-3"
                          value={profile.employmentType}
                          onChange={e => setProfile({ ...profile, employmentType: e.target.value })}
                          disabled={!editMode}
                          style={{ border: "1.5px solid #e2e8f0", background: editMode ? "white" : "#f8fafc" }}
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Edit mode bottom action bar */}
                  {editMode && (
                    <div
                      className="d-flex justify-content-end gap-2 mt-4 pt-4"
                      style={{ borderTop: "1px solid #e2e8f0" }}
                    >
                      <button
                        onClick={handleCancel}
                        className="btn fw-semibold px-4"
                        style={{
                          border: "1.5px solid #e2e8f0",
                          color: "#64748b",
                          borderRadius: "10px",
                          background: "white",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="btn fw-semibold px-4 d-flex align-items-center gap-2"
                        style={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                        }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                              <polyline points="17 21 17 13 7 13 7 21"/>
                              <polyline points="7 3 7 8 15 8"/>
                            </svg>
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
