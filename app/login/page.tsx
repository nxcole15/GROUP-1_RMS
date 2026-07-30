"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserRole = "Student" | "Teacher" | "Registrar" | "Principal" | "Dean" | "Accounting";

type Account = {
  id: string;
  password: string;
  role: UserRole;
  name: string;
  subtitle: string;
  redirect: string;
  altIds?: string[];
};

const USER_ACCOUNTS: Account[] = [
  { id: "202400001", password: "jamie",      role: "Student",    name: "Jamie Santos",      subtitle: "STEM Grade 11",        redirect: "/dashboard" },
  { id: "202400002", password: "maria",      role: "Student",    name: "Maria Reyes",       subtitle: "HUMSS Grade 11",       redirect: "/dashboard" },
  { id: "202400003", password: "carlo",      role: "Student",    name: "Carlo Dela Cruz",   subtitle: "ABM Grade 12",         redirect: "/dashboard" },
  { id: "202400004", password: "ana",        role: "Student",    name: "Ana Villanueva",    subtitle: "TVL-TechPro Grade 11", redirect: "/dashboard" },
  { id: "T001",      password: "maria",      role: "Teacher",    name: "Maria Santos",      subtitle: "Mathematics",          redirect: "/teacher/dashboard" },
  { id: "T002",      password: "juan",       role: "Teacher",    name: "Juan Dela Cruz",    subtitle: "English",              redirect: "/teacher/dashboard" },
  { id: "T003",      password: "ana",        role: "Teacher",    name: "Ana Reyes",         subtitle: "Science",              redirect: "/teacher/dashboard" },
  { id: "T004",      password: "carlos",     role: "Teacher",    name: "Carlos Fernandez",  subtitle: "History",              redirect: "/teacher/dashboard" },
  { id: "P001",      password: "principal",  role: "Principal",  name: "Principal",         subtitle: "School Principal",     redirect: "/admin/principal/dashboard", altIds: ["PRINCIPAL@INFORM.EDU"] },
  { id: "R001",      password: "Reg@2026",   role: "Registrar",  name: "Registrar Office",  subtitle: "Registrar",            redirect: "/admin/dashboard", altIds: ["REGISTRAR@INFORM.EDU"] },
  { id: "D001",      password: "Dean@2026",  role: "Dean",       name: "Dean of Students",  subtitle: "Dean",                 redirect: "/admin/dashboard", altIds: ["DEAN@INFORM.EDU"] },
  { id: "A001",      password: "accounting", role: "Accounting", name: "Accounting Office", subtitle: "Accounting",           redirect: "/accounting/dashboard" },
];

function normalizeId(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function detectRole(id: string): string {
  const value = normalizeId(id);
  if (!value) return "";
  if (/^[0-9]{8,12}$/.test(value)) return "Student";
  if (/^T/i.test(value)) return "Teacher";
  if (/^R/i.test(value)) return "Registrar";
  if (/^P/i.test(value)) return "Principal";
  if (/^D/i.test(value)) return "Dean";
  if (/^A/i.test(value)) return "Accounting";
  if (value.includes("REGISTRAR@")) return "Registrar";
  if (value.includes("PRINCIPAL@")) return "Principal";
  if (value.includes("DEAN@")) return "Dean";
  return "";
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<"email" | "code" | "reset" | "success">("email");
  const [forgotPasswordForm, setForgotPasswordForm] = useState({ email: "", userId: "", code: "", newPassword: "", confirmPassword: "" });
  const [generatedCode, setGeneratedCode] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");

  const detectedRole = detectRole(form.identifier);
  const normalizedId = normalizeId(form.identifier);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.identifier || !form.password) {
      setError("Please enter your User ID and password.");
      return;
    }

    const match = USER_ACCOUNTS.find((account) => {
      const matchesId = account.id === normalizedId || account.altIds?.map((a) => a.toUpperCase()).includes(normalizedId);
      return matchesId && account.password === form.password;
    });

    if (!match) {
      setError("Invalid User ID or password. Please try again.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push(match.redirect);
    }, 800);
  }

  function handleForgotPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setForgotPasswordError("");
    setForgotPasswordSuccess("");

    if (forgotPasswordStep === "email") {
      if (!forgotPasswordForm.email || !forgotPasswordForm.userId) {
        setForgotPasswordError("Please enter both your email and User ID.");
        return;
      }
      const normalizedUserId = normalizeId(forgotPasswordForm.userId);
      const account = USER_ACCOUNTS.find((acc) =>
        acc.id === normalizedUserId || acc.altIds?.map((a) => a.toUpperCase()).includes(normalizedUserId)
      );
      if (!account) {
        setForgotPasswordError("User ID not found. Please check and try again.");
        return;
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setForgotPasswordSuccess(`A verification code has been sent to ${forgotPasswordForm.email}`);
      setTimeout(() => {
        setForgotPasswordStep("code");
        setForgotPasswordSuccess("");
      }, 2000);

    } else if (forgotPasswordStep === "code") {
      if (!forgotPasswordForm.code) {
        setForgotPasswordError("Please enter the verification code.");
        return;
      }
      if (forgotPasswordForm.code !== generatedCode) {
        setForgotPasswordError("Invalid verification code. Please try again.");
        return;
      }
      setForgotPasswordSuccess("Code verified! You can now reset your password.");
      setTimeout(() => {
        setForgotPasswordStep("reset");
        setForgotPasswordSuccess("");
      }, 1500);

    } else if (forgotPasswordStep === "reset") {
      if (!forgotPasswordForm.newPassword || !forgotPasswordForm.confirmPassword) {
        setForgotPasswordError("Please enter and confirm your new password.");
        return;
      }
      if (forgotPasswordForm.newPassword.length < 6) {
        setForgotPasswordError("Password must be at least 6 characters long.");
        return;
      }
      if (forgotPasswordForm.newPassword !== forgotPasswordForm.confirmPassword) {
        setForgotPasswordError("Passwords do not match. Please try again.");
        return;
      }
      setForgotPasswordStep("success");
    }
  }

  function resetForgotPasswordModal() {
    setShowForgotPassword(false);
    setForgotPasswordStep("email");
    setForgotPasswordForm({ email: "", userId: "", code: "", newPassword: "", confirmPassword: "" });
    setGeneratedCode("");
    setForgotPasswordError("");
    setForgotPasswordSuccess("");
  }

  return (
    <div className="min-vh-100" style={{ background: "linear-gradient(135deg, #fff7ed, #fef3c7)" }}>
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

      <main className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <Link href="/" className="d-inline-flex align-items-center gap-2 mb-4 text-decoration-none fw-medium" style={{ color: "#dc2626" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>

              <div className="text-center mb-5">
                <h1 className="display-4 fw-bold mb-3" style={{ color: "#dc2626" }}>Login</h1>
                <p className="text-muted lead">Enter your User ID and password. The portal detects your role automatically.</p>
              </div>

              <div className="bg-white rounded-4 shadow-lg p-5" style={{ border: "1px solid #fbbf24" }}>
                <div className="d-flex justify-content-center mb-5">
                  <div className="d-flex align-items-center gap-4">
                    <img src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle" style={{ width: "56px", height: "56px", objectFit: "cover", border: "2px solid #dc2626" }} />
                    <div style={{ width: "2px", height: "48px", background: "linear-gradient(180deg, #dc2626, #f97316, #fbbf24)" }} />
                    <img src="/newimlogo.png" alt="INFORM" className="rounded-3" style={{ width: "56px", height: "56px", objectFit: "cover" }} />
                  </div>
                </div>

                {detectedRole && (
                  <div className="mb-4 text-center">
                    <span className="d-inline-flex align-items-center gap-2 rounded-pill small fw-medium" style={{ background: "rgba(220,38,38,0.1)", color: "#dc2626", padding: "8px 18px" }}>
                      Detected role: <strong>{detectedRole}</strong>
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold" style={{ color: "#dc2626" }}>User ID</label>
                    <input
                      type="text"
                      name="identifier"
                      value={form.identifier}
                      onChange={handleChange}
                      placeholder="e.g. 202400001, T001, R001, P001, A001"
                      autoComplete="username"
                      className="form-control form-control-lg"
                      style={{ borderColor: "#f97316" }}
                    />
                    <div className="form-text text-muted small">Enter your student, teacher, registrar, principal, dean, or accounting ID.</div>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label fw-semibold mb-0" style={{ color: "#dc2626" }}>Password</label>
                      <button type="button" onClick={() => setShowHint(!showHint)} className="btn btn-link btn-sm p-0 fw-medium text-decoration-none" style={{ color: "#f97316" }}>
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
                        className="form-control form-control-lg pe-5"
                        style={{ borderColor: "#f97316" }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="btn btn-link position-absolute top-50 end-0 translate-middle-y pe-3 p-0" style={{ color: "#dc2626" }}>
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
                    <div className="mb-4 rounded-3 overflow-hidden" style={{ background: "#fef3c7", border: "1px solid #fbbf24" }}>
                      <div className="px-4 py-2 border-bottom" style={{ borderColor: "#fbbf24", background: "#fff7ed" }}>
                        <p className="mb-0 fw-semibold text-uppercase small" style={{ color: "#dc2626" }}>Demo login accounts</p>
                      </div>
                      <div className="px-4 py-3">
                        {USER_ACCOUNTS.map((account) => (
                          <div key={account.id} className="py-2 border-bottom border-dashed border-secondary-subtle">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="font-monospace" style={{ color: "#dc2626" }}>{account.id}</span>
                              <span className="text-muted small">{account.subtitle}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="font-monospace" style={{ color: "#f97316" }}>{account.password}</span>
                              <span className="badge rounded-pill" style={{ background: "#fef2f2", color: "#991b1b", fontSize: 12 }}>{account.role}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="alert py-3 px-4 rounded-3 mb-4" style={{ background: "#fff7ed", borderColor: "#dc2626", color: "#dc2626" }}>
                      {error}
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <button type="button" onClick={() => setShowForgotPassword(true)} className="btn btn-link p-0 text-decoration-none fw-medium" style={{ color: "#f97316" }}>
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-lg w-100 fw-semibold py-3"
                    style={{ background: "linear-gradient(135deg, #dc2626, #f97316)", color: "white" }}
                  >
                    {loading ? (
                      <span className="d-inline-flex align-items-center gap-2">
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        Signing in...
                      </span>
                    ) : "Continue"}
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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <>
          <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" style={{ zIndex: 9998 }} onClick={resetForgotPasswordModal} />
          <div className="position-fixed top-50 start-50 translate-middle bg-white rounded-4 shadow-lg" style={{ zIndex: 9999, width: "min(480px, calc(100vw - 32px))", maxHeight: "calc(100vh - 64px)", overflowY: "auto" }}>
            <div className="p-4 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: "#fbbf24" }}>
              <h5 className="mb-0 fw-bold" style={{ color: "#dc2626" }}>
                {forgotPasswordStep === "email" && "Reset Your Password"}
                {forgotPasswordStep === "code" && "Verify Code"}
                {forgotPasswordStep === "reset" && "Create New Password"}
                {forgotPasswordStep === "success" && "Password Reset Complete"}
              </h5>
              <button onClick={resetForgotPasswordModal} className="btn btn-link p-0 text-muted" style={{ fontSize: 24 }} aria-label="Close">×</button>
            </div>

            <div className="p-4">
              {forgotPasswordStep === "email" && (
                <form onSubmit={handleForgotPasswordSubmit}>
                  <p className="text-muted mb-4">Enter your email address and User ID to receive a verification code.</p>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: "#dc2626" }}>Email Address</label>
                    <input type="email" value={forgotPasswordForm.email} onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, email: e.target.value })} placeholder="your.email@example.com" className="form-control form-control-lg" style={{ borderColor: "#f97316" }} required />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold" style={{ color: "#dc2626" }}>User ID</label>
                    <input type="text" value={forgotPasswordForm.userId} onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, userId: e.target.value.toUpperCase() })} placeholder="e.g. 202400001, T001, R001" className="form-control form-control-lg" style={{ borderColor: "#f97316" }} required />
                  </div>
                  {forgotPasswordError && <div className="alert py-2 px-3 rounded-3 mb-3" style={{ background: "#fef2f2", borderColor: "#dc2626", color: "#dc2626" }}>{forgotPasswordError}</div>}
                  {forgotPasswordSuccess && <div className="alert py-2 px-3 rounded-3 mb-3" style={{ background: "#f0fdf4", borderColor: "#10b981", color: "#059669" }}>{forgotPasswordSuccess}</div>}
                  <button type="submit" className="btn btn-lg w-100 fw-semibold py-3" style={{ background: "linear-gradient(135deg, #dc2626, #f97316)", color: "white" }}>Send Verification Code</button>
                </form>
              )}

              {forgotPasswordStep === "code" && (
                <form onSubmit={handleForgotPasswordSubmit}>
                  <p className="text-muted mb-4">Enter the 6-digit verification code sent to <strong>{forgotPasswordForm.email}</strong></p>
                  <div className="mb-4">
                    <label className="form-label fw-semibold" style={{ color: "#dc2626" }}>Verification Code</label>
                    <input type="text" value={forgotPasswordForm.code} onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, code: e.target.value.replace(/\D/g, "").slice(0, 6) })} placeholder="000000" className="form-control form-control-lg text-center font-monospace" style={{ borderColor: "#f97316", fontSize: "24px", letterSpacing: "0.5em" }} maxLength={6} required />
                    <div className="form-text text-center mt-2"><small className="text-muted">Demo: Your code is <strong className="text-success">{generatedCode}</strong></small></div>
                  </div>
                  {forgotPasswordError && <div className="alert py-2 px-3 rounded-3 mb-3" style={{ background: "#fef2f2", borderColor: "#dc2626", color: "#dc2626" }}>{forgotPasswordError}</div>}
                  {forgotPasswordSuccess && <div className="alert py-2 px-3 rounded-3 mb-3" style={{ background: "#f0fdf4", borderColor: "#10b981", color: "#059669" }}>{forgotPasswordSuccess}</div>}
                  <button type="submit" className="btn btn-lg w-100 fw-semibold py-3 mb-2" style={{ background: "linear-gradient(135deg, #dc2626, #f97316)", color: "white" }}>Verify Code</button>
                  <button type="button" onClick={() => setForgotPasswordStep("email")} className="btn btn-link w-100 text-decoration-none" style={{ color: "#f97316" }}>← Back to Email</button>
                </form>
              )}

              {forgotPasswordStep === "reset" && (
                <form onSubmit={handleForgotPasswordSubmit}>
                  <p className="text-muted mb-4">Create a new password for your account.</p>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: "#dc2626" }}>New Password</label>
                    <input type="password" value={forgotPasswordForm.newPassword} onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, newPassword: e.target.value })} placeholder="••••••••" className="form-control form-control-lg" style={{ borderColor: "#f97316" }} minLength={6} required />
                    <div className="form-text">Password must be at least 6 characters long.</div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold" style={{ color: "#dc2626" }}>Confirm New Password</label>
                    <input type="password" value={forgotPasswordForm.confirmPassword} onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, confirmPassword: e.target.value })} placeholder="••••••••" className="form-control form-control-lg" style={{ borderColor: "#f97316" }} minLength={6} required />
                  </div>
                  {forgotPasswordError && <div className="alert py-2 px-3 rounded-3 mb-3" style={{ background: "#fef2f2", borderColor: "#dc2626", color: "#dc2626" }}>{forgotPasswordError}</div>}
                  {forgotPasswordSuccess && <div className="alert py-2 px-3 rounded-3 mb-3" style={{ background: "#f0fdf4", borderColor: "#10b981", color: "#059669" }}>{forgotPasswordSuccess}</div>}
                  <button type="submit" className="btn btn-lg w-100 fw-semibold py-3" style={{ background: "linear-gradient(135deg, #dc2626, #f97316)", color: "white" }}>Reset Password</button>
                </form>
              )}

              {forgotPasswordStep === "success" && (
                <div className="text-center py-4">
                  <div className="mb-4">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="mx-auto">
                      <circle cx="12" cy="12" r="10" fill="#10b981" opacity="0.2"/>
                      <path d="M9 12l2 2 4-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h4 className="fw-bold mb-3" style={{ color: "#059669" }}>Password Reset Successful!</h4>
                  <p className="text-muted mb-4">Your password has been successfully reset. You can now log in with your new password.</p>
                  <button onClick={resetForgotPasswordModal} className="btn btn-lg w-100 fw-semibold py-3" style={{ background: "linear-gradient(135deg, #dc2626, #f97316)", color: "white" }}>Go to Login</button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
