"use client";

import { useState, useRef } from "react";
import Link from "next/link";

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
      {/* Toast */}
      {toast && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-4" style={{ zIndex: 9999 }}>
          <div className="alert shadow-lg rounded-3 px-4 py-3 d-flex align-items-center gap-3" style={{ minWidth: "300px", background: toast.includes("⚠️") ? "#fef2f2" : "#d1fae5", border: toast.includes("⚠️") ? "1px solid #fecaca" : "1px solid #86efac" }}>
            <span style={{ fontSize: 24 }}>{toast.includes("⚠️") ? "⚠️" : "✅"}</span>
            <span className="fw-semibold" style={{ color: toast.includes("⚠️") ? "#dc2626" : "#059669" }}>{toast}</span>
          </div>
        </div>
      )}

      {/* Main Content - Using existing teacher dashboard sidebar */}
      <div className="flex-grow-1" style={{ marginLeft: "80px", width: "calc(100% - 80px)" }}>
        {/* Header */}
        <header className="bg-white border-bottom border-light shadow-sm position-sticky top-0" style={{ zIndex: 100 }}>
          <div className="container-fluid py-3 px-4">
            <h1 className="h5 mb-0 fw-bold" style={{ color: "#1e293b" }}>My Profile</h1>
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
                  <div className="position-relative" style={{ height: "120px", background: "linear-gradient(135deg, #059669, #10b981)" }}>
                    <div className="position-absolute top-50 start-50 translate-middle" style={{ marginTop: "40px" }}>
                      <div className="position-relative">
                        <div className="rounded-circle border border-4 border-white bg-white overflow-hidden" style={{ width: "120px", height: "120px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                          <img src={profilePicture} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        {editMode && (
                          <>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="position-absolute bottom-0 end-0 btn btn-success btn-sm rounded-circle d-flex align-items-center justify-content-center"
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
                      <span className="badge rounded-pill px-3 py-2" style={{ background: "linear-gradient(135deg, #059669, #10b981)", color: "white" }}>
                        {profile.department}
                      </span>
                      <span className="badge rounded-pill px-3 py-2 bg-light text-dark border">
                        {profile.employmentType}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="rounded-3 p-3 bg-light border">
                          <div className="text-muted small mb-1">Joined</div>
                          <div className="fw-bold small text-success">{new Date(profile.hireDate).getFullYear()}</div>
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
                      <button onClick={() => setEditMode(true)} className="btn btn-success px-4">
                        ✏️ Edit Profile
                      </button>
                    ) : (
                      <div className="d-flex gap-2">
                        <button onClick={handleCancel} className="btn btn-outline-secondary px-3">
                          Cancel
                        </button>
                        <button onClick={handleSave} disabled={loading} className="btn btn-success px-4">
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
                      <label className="form-label fw-semibold small text-uppercase text-muted">Teacher ID</label>
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
                      <label className="form-label fw-semibold small text-uppercase text-muted">Department</label>
                      <input type="text" className="form-control" value={profile.department} disabled style={{ background: "#f1f5f9" }} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small text-uppercase text-muted">Subject</label>
                      <input type="text" className="form-control" value={profile.subject} onChange={e => setProfile({ ...profile, subject: e.target.value })} disabled={!editMode} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small text-uppercase text-muted">Date of Birth</label>
                      <input type="date" className="form-control" value={profile.dateOfBirth} onChange={e => setProfile({ ...profile, dateOfBirth: e.target.value })} disabled={!editMode} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small text-uppercase text-muted">Hire Date</label>
                      <input type="date" className="form-control" value={profile.hireDate} disabled style={{ background: "#f1f5f9" }} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small text-uppercase text-muted">Employment Type</label>
                      <select className="form-select" value={profile.employmentType} onChange={e => setProfile({ ...profile, employmentType: e.target.value })} disabled={!editMode}>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                      </select>
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
