"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserRole = "student" | "teacher" | "admin" | null;

interface StudentProfile {
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
}

interface TeacherProfile {
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
}

interface AdminProfile {
  username: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  hireDate: string;
}

const EMPTY_STUDENT_PROFILE: StudentProfile = {
  id: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  course: "",
  yearLevel: "",
  dateOfBirth: "",
  guardianName: "",
  guardianContact: "",
  enrollmentDate: "",
};

const EMPTY_TEACHER_PROFILE: TeacherProfile = {
  id: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  department: "",
  subject: "",
  dateOfBirth: "",
  hireDate: "",
  employmentType: "",
};

const EMPTY_ADMIN_PROFILE: AdminProfile = {
  username: "",
  name: "",
  email: "",
  phone: "",
  role: "",
  department: "",
  hireDate: "",
};

export default function ProfilePage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [dark, setDark] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [studentProfile, setStudentProfile] = useState(EMPTY_STUDENT_PROFILE);
  const [teacherProfile, setTeacherProfile] = useState(EMPTY_TEACHER_PROFILE);
  const [adminProfile, setAdminProfile] = useState(EMPTY_ADMIN_PROFILE);

  useEffect(() => {
    const storedRole = localStorage.getItem("user-role") as UserRole;
    if (storedRole) {
      setUserRole(storedRole);
    } else {
      setUserRole(null);
    }

    // Load theme
    try {
      const saved = localStorage.getItem("landing-theme");
      if (saved === "dark") {
        setDark(true);
        document.documentElement.setAttribute("data-landing", "dark");
      }
    } catch (e) {
      // ignore
    }
  }, []);

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
    setStudentProfile(EMPTY_STUDENT_PROFILE);
    setTeacherProfile(EMPTY_TEACHER_PROFILE);
    setAdminProfile(EMPTY_ADMIN_PROFILE);
  };

  const getBackLink = () => {
    if (userRole === "teacher") return "/teacher/dashboard";
    if (userRole === "admin") return "/admin/dashboard";
    return "/dashboard";
  };

  if (!userRole) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "linear-gradient(135deg, #fff7ed, #fef3c7)" }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-vh-100${dark ? " landing-dark" : ""}`} style={{ background: dark ? "linear-gradient(135deg,#0f172a,#0b1220)" : "linear-gradient(135deg, #fff7ed, #fef3c7)", color: dark ? "#f8fafc" : undefined }}>
      {/* Toast Notification */}
      {toast && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-4" style={{ zIndex: 9999 }}>
          <div className="alert alert-success shadow-lg rounded-3 px-4 py-3 d-flex align-items-center gap-3" style={{ minWidth: "300px" }}>
            <span style={{ fontSize: 24 }}>✅</span>
            <span className="fw-semibold">{toast}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <header className="bg-white bg-opacity-90 backdrop-blur border-bottom border-light shadow-sm">
        <div className="container py-3">
          <div className="d-flex align-items-center justify-content-between">
            <Link href="/" className="d-flex align-items-center gap-3 text-decoration-none text-dark">
              <img src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle" style={{ width: "40px", height: "40px", objectFit: "cover", border: "2px solid #dc2626" }} />
              <div>
                <h5 className="mb-0 fw-bold" style={{ color: "#dc2626" }}>Cebu Far East Institute</h5>
                <p className="mb-0 text-muted small">Student Information System</p>
              </div>
            </Link>
            <button
              onClick={() => {
                setDark(!dark);
                if (!dark) {
                  document.documentElement.setAttribute("data-landing", "dark");
                  localStorage.setItem("landing-theme", "dark");
                } else {
                  document.documentElement.removeAttribute("data-landing");
                  localStorage.setItem("landing-theme", "light");
                }
              }}
              style={{
                width: 44, height: 26, borderRadius: 13, border: "none", cursor: "pointer", padding: 0, position: "relative",
                background: dark ? "linear-gradient(135deg, #1e293b, #334155)" : "linear-gradient(135deg, #fef3c7, #fde68a)",
                boxShadow: dark ? "inset 0 0 0 1.5px #475569" : "inset 0 0 0 1.5px #fbbf24",
              }}
            >
              <span style={{
                position: "absolute", top: 3, left: dark ? 21 : 3, width: 20, height: 20, borderRadius: "50%",
                background: dark ? "linear-gradient(135deg, #f1f5f9, #cbd5e1)" : "linear-gradient(135deg, #f97316, #dc2626)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11,
              }}>
                {dark ? "🌙" : "☀️"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-5">
        <div className="container">
          <Link href={getBackLink()} className="d-inline-flex align-items-center gap-2 mb-4 text-decoration-none fw-medium" style={{ color: "#dc2626" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          <div className="row">
            {/* Profile Card */}
            <div className="col-12 col-lg-4 mb-4">
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={dark ? { background: "#071025", border: "1px solid rgba(251,191,36,0.12)" } : { background: "white" }}>
                <div className="card-body p-0">
                  {/* Cover Image */}
                  <div className="position-relative" style={{ height: "120px", background: "linear-gradient(135deg, #dc2626, #f97316)" }}>
                    <div className="position-absolute top-50 start-50 translate-middle" style={{ marginTop: "40px" }}>
                      <div className="rounded-circle border border-4 border-white bg-white d-flex align-items-center justify-content-center" style={{ width: "120px", height: "120px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                        <span style={{ fontSize: "48px" }}>
                          {userRole === "student" ? "🎓" : userRole === "teacher" ? "👨‍🏫" : "👔"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="pt-5 mt-4 px-4 pb-4 text-center">
                    <h3 className="fw-bold mb-1" style={{ color: dark ? "#fbbf24" : "#dc2626" }}>
                      {userRole === "student" ? studentProfile.name : userRole === "teacher" ? teacherProfile.name : adminProfile.name}
                    </h3>
                    <p className="text-muted small mb-3">
                      {userRole === "student" ? `ID: ${studentProfile.id}` : userRole === "teacher" ? `ID: ${teacherProfile.id}` : adminProfile.role}
                    </p>
                    <div className="d-flex justify-content-center gap-2 mb-4">
                      <span className="badge rounded-pill px-3 py-2" style={{ background: "linear-gradient(135deg, #dc2626, #f97316)", color: "white" }}>
                        {userRole === "student" ? studentProfile.course : userRole === "teacher" ? teacherProfile.department : adminProfile.department}
                      </span>
                    </div>

                    {/* Quick Stats */}
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="rounded-3 p-3" style={dark ? { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" } : { background: "#fef3c7" }}>
                          <div className="text-muted small mb-1">Member Since</div>
                          <div className="fw-bold small" style={{ color: dark ? "#fbbf24" : "#dc2626" }}>
                            {userRole === "student" ? new Date(studentProfile.enrollmentDate).getFullYear() : userRole === "teacher" ? new Date(teacherProfile.hireDate).getFullYear() : new Date(adminProfile.hireDate).getFullYear()}
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="rounded-3 p-3" style={dark ? { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" } : { background: "#fef3c7" }}>
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
              <div className="card border-0 shadow-lg rounded-4" style={dark ? { background: "#071025", border: "1px solid rgba(251,191,36,0.12)" } : { background: "white" }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h4 className="fw-bold mb-1" style={{ color: dark ? "#fbbf24" : "#dc2626" }}>Profile Information</h4>
                      <p className="text-muted small mb-0">Manage your personal information</p>
                    </div>
                    {!editMode ? (
                      <button onClick={() => setEditMode(true)} className="btn btn-sm px-4 py-2 rounded-3" style={{ background: "linear-gradient(135deg, #dc2626, #f97316)", color: "white" }}>
                        ✏️ Edit
                      </button>
                    ) : (
                      <div className="d-flex gap-2">
                        <button onClick={handleCancel} className="btn btn-sm btn-outline-secondary px-3 py-2 rounded-3">
                          Cancel
                        </button>
                        <button onClick={handleSave} disabled={loading} className="btn btn-sm px-4 py-2 rounded-3" style={{ background: "linear-gradient(135deg, #dc2626, #f97316)", color: "white" }}>
                          {loading ? "Saving..." : "💾 Save"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Student Profile */}
                  {userRole === "student" && (
                    <div className="row g-4">
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Full Name</label>
                        <input type="text" className="form-control rounded-3" value={studentProfile.name} onChange={e => setStudentProfile({ ...studentProfile, name: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Student ID</label>
                        <input type="text" className="form-control rounded-3" value={studentProfile.id} disabled style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : { background: "#f1f5f9" }} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Email</label>
                        <input type="email" className="form-control rounded-3" value={studentProfile.email} onChange={e => setStudentProfile({ ...studentProfile, email: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Phone</label>
                        <input type="tel" className="form-control rounded-3" value={studentProfile.phone} onChange={e => setStudentProfile({ ...studentProfile, phone: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}} />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Address</label>
                        <input type="text" className="form-control rounded-3" value={studentProfile.address} onChange={e => setStudentProfile({ ...studentProfile, address: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Course</label>
                        <select className="form-select rounded-3" value={studentProfile.course} onChange={e => setStudentProfile({ ...studentProfile, course: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}}>
                          <option value="STEM">STEM</option>
                          <option value="HUMSS">HUMSS</option>
                          <option value="ABM">ABM</option>
                          <option value="TVL-TechPro">TVL-TechPro</option>
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Year Level</label>
                        <select className="form-select rounded-3" value={studentProfile.yearLevel} onChange={e => setStudentProfile({ ...studentProfile, yearLevel: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}}>
                          <option value="Grade 11">Grade 11</option>
                          <option value="Grade 12">Grade 12</option>
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Date of Birth</label>
                        <input type="date" className="form-control rounded-3" value={studentProfile.dateOfBirth} onChange={e => setStudentProfile({ ...studentProfile, dateOfBirth: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Guardian Name</label>
                        <input type="text" className="form-control rounded-3" value={studentProfile.guardianName} onChange={e => setStudentProfile({ ...studentProfile, guardianName: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Guardian Contact</label>
                        <input type="tel" className="form-control rounded-3" value={studentProfile.guardianContact} onChange={e => setStudentProfile({ ...studentProfile, guardianContact: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Enrollment Date</label>
                        <input type="date" className="form-control rounded-3" value={studentProfile.enrollmentDate} disabled style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : { background: "#f1f5f9" }} />
                      </div>
                    </div>
                  )}

                  {/* Teacher Profile */}
                  {userRole === "teacher" && (
                    <div className="row g-4">
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Full Name</label>
                        <input type="text" className="form-control rounded-3" value={teacherProfile.name} onChange={e => setTeacherProfile({ ...teacherProfile, name: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Teacher ID</label>
                        <input type="text" className="form-control rounded-3" value={teacherProfile.id} disabled style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : { background: "#f1f5f9" }} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Email</label>
                        <input type="email" className="form-control rounded-3" value={teacherProfile.email} onChange={e => setTeacherProfile({ ...teacherProfile, email: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Phone</label>
                        <input type="tel" className="form-control rounded-3" value={teacherProfile.phone} onChange={e => setTeacherProfile({ ...teacherProfile, phone: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}} />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Address</label>
                        <input type="text" className="form-control rounded-3" value={teacherProfile.address} onChange={e => setTeacherProfile({ ...teacherProfile, address: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Department</label>
                        <input type="text" className="form-control rounded-3" value={teacherProfile.department} disabled style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : { background: "#f1f5f9" }} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Subject</label>
                        <input type="text" className="form-control rounded-3" value={teacherProfile.subject} onChange={e => setTeacherProfile({ ...teacherProfile, subject: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Date of Birth</label>
                        <input type="date" className="form-control rounded-3" value={teacherProfile.dateOfBirth} onChange={e => setTeacherProfile({ ...teacherProfile, dateOfBirth: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Hire Date</label>
                        <input type="date" className="form-control rounded-3" value={teacherProfile.hireDate} disabled style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : { background: "#f1f5f9" }} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Employment Type</label>
                        <select className="form-select rounded-3" value={teacherProfile.employmentType} onChange={e => setTeacherProfile({ ...teacherProfile, employmentType: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}}>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Admin Profile */}
                  {userRole === "admin" && (
                    <div className="row g-4">
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Full Name</label>
                        <input type="text" className="form-control rounded-3" value={adminProfile.name} onChange={e => setAdminProfile({ ...adminProfile, name: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Username</label>
                        <input type="text" className="form-control rounded-3" value={adminProfile.username} disabled style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : { background: "#f1f5f9" }} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Email</label>
                        <input type="email" className="form-control rounded-3" value={adminProfile.email} onChange={e => setAdminProfile({ ...adminProfile, email: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Phone</label>
                        <input type="tel" className="form-control rounded-3" value={adminProfile.phone} onChange={e => setAdminProfile({ ...adminProfile, phone: e.target.value })} disabled={!editMode} style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : {}} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Role</label>
                        <input type="text" className="form-control rounded-3" value={adminProfile.role} disabled style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : { background: "#f1f5f9" }} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Department</label>
                        <input type="text" className="form-control rounded-3" value={adminProfile.department} disabled style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : { background: "#f1f5f9" }} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold small text-uppercase" style={{ color: dark ? "#fbbf24" : "#dc2626", letterSpacing: "0.05em" }}>Hire Date</label>
                        <input type="date" className="form-control rounded-3" value={adminProfile.hireDate} disabled style={dark ? { background: "#071025", color: "#f8fafc", borderColor: "#334155" } : { background: "#f1f5f9" }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Section */}
              <div className="card border-0 shadow-lg rounded-4 mt-4" style={dark ? { background: "#071025", border: "1px solid rgba(251,191,36,0.12)" } : { background: "white" }}>
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-3" style={{ color: dark ? "#fbbf24" : "#dc2626" }}>Security Settings</h4>
                  <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
                    <div>
                      <div className="fw-semibold" style={{ color: dark ? "#f8fafc" : "#1e293b" }}>Password</div>
                      <div className="text-muted small">Last changed 3 months ago</div>
                    </div>
                    <button className="btn btn-sm btn-outline-primary rounded-3">Change Password</button>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-3">
                    <div>
                      <div className="fw-semibold" style={{ color: dark ? "#f8fafc" : "#1e293b" }}>Two-Factor Authentication</div>
                      <div className="text-muted small">Add an extra layer of security</div>
                    </div>
                    <button className="btn btn-sm btn-outline-success rounded-3">Enable 2FA</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4" style={{ background: dark ? "#071025" : "#dc2626", color: "white" }}>
        <div className="container">
          <p className="text-center small mb-0" style={{ color: dark ? "rgba(255,255,255,0.6)" : "white" }}>
            © 2026 Cebu Far East Institute. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
