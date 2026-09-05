"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function TeacherLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ id: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (!form.id || !form.password) {
    setError("Please enter your Teacher ID and password.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const res = await fetch("/api/teacher/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacher_id: form.id, password: form.password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Login failed. Please try again.");
      setLoading(false);
      return;
    }

    // Login successful — redirect to dashboard
    router.push("/teacher/dashboard");

  } catch {
    setError("Could not connect to server. Please try again.");
    setLoading(false);
  }
}


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

              <div className="bg-white rounded-4 shadow-lg p-5" style={{ border: "1px solid #fbbf24" }}>
                {/* Logo Area with Login Text */}
                <div className="d-flex flex-column align-items-center mb-5">
                  <img src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle mb-4" style={{ width: "56px", height: "56px", objectFit: "cover", border: "2px solid #dc2626" }} />
                  <h2 className="fw-bold mb-4" style={{ color: "#dc2626" }}>Login</h2>
                  <p className="text-muted text-center mb-0" style={{ fontSize: "14px" }}>Access your class management and grading portal</p>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Teacher ID */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold" style={{ color: "#dc2626" }}>Teacher ID</label>
                    <input
                      type="text"
                      name="id"
                      value={form.id}
                      onChange={handleChange}
                      placeholder="e.g., T001"
                      autoComplete="username"
                      className="form-control form-control-lg rounded-xl"
                      style={{ borderColor: "#f97316" }}
                    />
                    <div className="form-text text-muted small">Format: T followed by numbers</div>
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label fw-semibold mb-0" style={{ color: "#dc2626" }}>Password</label>
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

                 

                  {/* Error */}
                  {error && (
                    <div className="alert py-3 px-4 rounded-xl mb-4 text-sm" style={{ background: "#fff7ed", borderColor: "#dc2626", color: "#dc2626" }}>
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-lg w-100 fw-semibold py-3 rounded-xl shadow hover:shadow-lg transition-all"
                    style={{ background: "linear-gradient(135deg, #f97316, #fbbf24)", color: "white" }}
                  >
                    {loading ? (
                      <span className="d-inline-flex align-items-center gap-2">
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Signing in...
                      </span>
                    ) : "Access Teacher Portal"}
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <p className="text-muted small">
                    Student?{" "}
                    <Link href="/login" className="fw-medium text-decoration-none hover:underline" style={{ color: "#dc2626" }}>
                      Go to Student Login
                    </Link>
                  </p>
                </div>
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
