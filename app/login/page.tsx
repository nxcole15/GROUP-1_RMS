"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Role = "student" | "teacher" | "admin";

const STUDENT_ACCOUNTS = [
  { id: "202400001", password: "jamie", name: "Jamie Santos", course: "STEM Grade 11" },
  { id: "202400002", password: "maria", name: "Maria Reyes", course: "HUMSS Grade 11" },
  { id: "202400003", password: "carlo", name: "Carlo Dela Cruz", course: "ABM Grade 12" },
  { id: "202400004", password: "ana", name: "Ana Villanueva", course: "TVL-TechPro Grade 11" },
];

const TEACHER_ACCOUNTS = [
  { id: "T001", password: "maria", name: "Maria Santos", subject: "Mathematics" },
  { id: "T002", password: "juan", name: "Juan Dela Cruz", subject: "English" },
  { id: "T003", password: "ana", name: "Ana Reyes", subject: "Science" },
  { id: "T004", password: "carlos", name: "Carlos Fernandez", subject: "History" },
];

const ADMIN_ACCOUNTS = [
  { username: "principal@inform.edu", password: "principal", name: "Principal", role: "Principal" },
  { username: "registrar@inform.edu", password: "Reg@2026", name: "Registrar", role: "Registrar" },
  { username: "dean@inform.edu", password: "Dean@2026", name: "Dean of Students", role: "Dean" },
];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const detectRole = (identifier: string): Role => {
    const normalized = identifier.trim().toLowerCase();
    if (!normalized) return "student";
    if (normalized.includes("@")) return "admin";
    if (/^t\d+/i.test(normalized)) return "teacher";
    if (/^\d+$/.test(normalized)) return "student";
    return "student";
  };

  const detectedRole = detectRole(form.identifier);
  const roleLabels: Record<Role, string> = {
    student: "Student",
    teacher: "Teacher",
    admin: "Admin",
  };

  const currentLabel = detectedRole === "admin" ? "Admin Username" : detectedRole === "teacher" ? "Teacher ID" : "Student ID";
  const currentTip = "Teacher IDs start with T, admin usernames include @, student IDs are numeric.";
  const detectedLabel = form.identifier
    ? `Detected role: ${roleLabels[detectedRole]}`
    : "Enter your ID or username to detect your role.";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.identifier || !form.password) {
      setError("Please enter your username/ID and password.");
      return;
    }

    if (detectedRole === "admin") {
      const match = ADMIN_ACCOUNTS.find(
        a => a.username.toLowerCase() === form.identifier.trim().toLowerCase() && a.password === form.password
      );
      if (!match) {
        setError("Invalid admin credentials. Please try again.");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const next = match.role === "Principal" ? "/admin/principal/dashboard" : "/admin/dashboard";
        router.push(next);
      }, 1000);
      return;
    }

    const identifier = form.identifier.trim();
    const match = detectedRole === "teacher"
      ? TEACHER_ACCOUNTS.find(a => a.id.toLowerCase() === identifier.toLowerCase() && a.password === form.password)
      : STUDENT_ACCOUNTS.find(a => a.id === identifier && a.password === form.password);

    if (!match) {
      setError(`Invalid ${roleLabels[detectedRole]} credentials. Please try again.`);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push(detectedRole === "teacher" ? "/teacher/dashboard" : "/dashboard");
    }, 1000);
  }

  const getHintRows = () => {
    if (detectedRole === "student") {
      return STUDENT_ACCOUNTS.map(a => (
        <div key={a.id} className="d-flex justify-content-between align-items-center py-1">
          <span className="font-monospace" style={{ color: "#dc2626" }}>{a.id}</span>
          <span className="font-monospace" style={{ color: "#f97316" }}>{a.password}</span>
          <span className="text-muted small d-none d-sm-block">{a.name}</span>
        </div>
      ));
    }

    if (detectedRole === "teacher") {
      return TEACHER_ACCOUNTS.map(a => (
        <div key={a.id} className="d-flex justify-content-between align-items-center py-1">
          <span className="font-monospace" style={{ color: "#dc2626" }}>{a.id}</span>
          <span className="font-monospace" style={{ color: "#f97316" }}>{a.password}</span>
          <span className="text-muted small d-none d-sm-block">{a.subject}</span>
        </div>
      ));
    }

    return ADMIN_ACCOUNTS.map(a => (
      <div key={a.username} className="py-1">
        <div className="d-flex justify-content-between align-items-center">
          <span className="font-monospace" style={{ color: "#dc2626" }}>{a.username}</span>
          <span className="text-muted small d-none d-sm-block">{a.role}</span>
        </div>
        <p className="text-muted small mb-0">pw: <span style={{ color: "#f97316" }}>{a.password}</span></p>
      </div>
    ));
  };

  return (
    <div className="min-vh-100" style={{ background: "linear-gradient(135deg, #fff7ed, #fef3c7)" }}>
      {/* Navigation */}
      <header className="bg-white bg-opacity-90 backdrop-blur border-bottom border-light shadow-sm">
        <div className="container py-3">
          <Link href="/" className="d-flex align-items-center gap-3 text-decoration-none text-dark">
            <img src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle" style={{ width: "40px", height: "40px", objectFit: "cover", border: "2px solid #dc2626" }} />
            <div>
              <h5 className="mb-0 fw-bold" style={{ color: "#dc2626" }}>Cebu Far East Institute</h5>
              <p className="mb-0 text-muted small">Student Information System</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <main className="py-5 py-md-6 py-lg-7">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <Link
                href="/"
                className="d-inline-flex align-items-center gap-2 mb-4 text-decoration-none fw-medium"
                style={{ color: "#dc2626" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
              <div className="text-center mb-5">
                <h1 className="display-4 fw-extrabold mb-3" style={{ color: "#dc2626" }}>Log In</h1>
                <p className="text-muted lead">Enter your ID or username and password to access the portal.</p>
              </div>

              <div className="bg-white rounded-4 shadow-lg p-5" style={{ border: "1px solid #fbbf24" }}>
                {/* Logo Area */}
                <div className="d-flex justify-content-center mb-5">
                  <div className="d-flex align-items-center gap-4">
                    <img src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle" style={{ width: "56px", height: "56px", objectFit: "cover", border: "2px solid #dc2626" }} />
                    <div style={{ width: "2px", height: "48px", background: "linear-gradient(180deg, #dc2626, #f97316, #fbbf24)" }}></div>
                    <img src="/newimlogo.png" alt="INFORM" className="rounded-3" style={{ width: "56px", height: "56px", objectFit: "cover", boxShadow: "0 4px 6px -1px rgba(249, 115, 22, 0.4)" }} />
                  </div>
                </div>

                <div className="mb-4 text-center">
                  <span className="d-inline-flex align-items-center gap-2 rounded-pill small fw-medium" style={{ background: "rgba(220,38,38,0.1)", color: "#dc2626", padding: "8px 18px" }}>
                    {detectedLabel}
                  </span>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold" style={{ color: "#dc2626" }}>{currentLabel}</label>
                    <input
                      type="text"
                      name="identifier"
                      value={form.identifier}
                      onChange={handleChange}
                      placeholder="Enter your ID or username"
                      inputMode={detectedRole === "student" ? "numeric" : "text"}
                      autoComplete="username"
                      className="form-control form-control-lg rounded-xl"
                      style={{ borderColor: "#f97316" }}
                    />
                    <div className="form-text text-muted small">{currentTip}</div>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label fw-semibold mb-0" style={{ color: "#dc2626" }}>Password</label>
                      <button
                        type="button"
                        onClick={() => setShowHint(!showHint)}
                        className="btn btn-link btn-sm p-0 fw-medium text-decoration-none"
                        style={{ color: "#f97316" }}
                      >
                        {showHint ? "Hide hint" : "Need a hint?"}
                      </button>
                    </div>
                    <div className="position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="form-control form-control-lg rounded-xl pe-5"
                        style={{ borderColor: "#f97316" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="btn btn-link position-absolute top-50 end-0 translate-middle-y pe-3 p-0"
                        style={{ color: "#dc2626" }}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {showHint && (
                    <div className="mb-4 rounded-xl overflow-hidden" style={{ background: "#fef3c7", border: "1px solid #fbbf24" }}>
                      <div className="px-4 py-2 border-bottom" style={{ borderColor: "#fbbf24", background: "#fff7ed" }}>
                        <p className="mb-0 fw-semibold text-uppercase small" style={{ color: "#dc2626" }}>Demo login accounts</p>
                      </div>
                      <div className="px-4 py-3">
                        {getHintRows()}
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="alert py-3 px-4 rounded-xl mb-4 text-sm" style={{ background: "#fff7ed", borderColor: "#dc2626", color: "#dc2626" }}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-lg w-100 fw-semibold py-3 rounded-xl shadow hover:shadow-lg transition-all"
                    style={{ background: "linear-gradient(135deg, #dc2626, #f97316)", color: "white" }}
                  >
                    {loading ? (
                      <span className="d-inline-flex align-items-center gap-2">
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Signing in...
                      </span>
                    ) : "Log In"}
                  </button>
                </form>
              </div>

              <p className="text-center text-muted small mt-5">
                © 2026 Cebu Far East Institute. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
