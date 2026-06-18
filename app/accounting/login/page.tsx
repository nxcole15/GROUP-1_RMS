"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ACCOUNTING_ACCOUNTS = [
  { id: "A001", password: "accounting", name: "Accounting Office" },
];


export default function AccountingLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ id: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.id || !form.password) {
      setError("Please enter your Accounting ID and password.");
      return;
    }
    const match = ACCOUNTING_ACCOUNTS.find(a => a.id === form.id && a.password === form.password);
    if (!match) {
      setError("Invalid Accounting ID or password. Access denied.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Demo-only: remember which accounting account is active
      localStorage.setItem(
        "inform_accounting_active",
        JSON.stringify({ id: match.id, name: match.name })
      );
      router.push("/accounting/dashboard");
    }, 600);
  }

  return (
    <div className="min-vh-100" style={{ background: "linear-gradient(135deg, #fff7ed, #fef3c7)" }}>
      <header className="bg-white bg-opacity-90 backdrop-blur border-bottom border-light shadow-sm">
        <div className="container py-3">
          <Link href="/" className="d-flex align-items-center gap-3 text-decoration-none text-dark">
            <img
              src="/cfei-logo.jpg"
              alt="CFEI"
              className="rounded-circle"
              style={{ width: 40, height: 40, objectFit: "cover", border: "2px solid #dc2626" }}
            />
            <div>
              <h5 className="mb-0 fw-bold" style={{ color: "#dc2626" }}>Cebu Far East Institute</h5>
              <p className="mb-0 text-muted small">Student Information System</p>
            </div>
          </Link>
        </div>
      </header>

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
                <h1 className="display-4 fw-extrabold mb-3" style={{ color: "#dc2626" }}>Accounting Login</h1>
                <p className="text-muted lead">Access tuition fee and payment functions</p>
              </div>

              <div className="bg-white rounded-4 shadow-lg p-5" style={{ border: "1px solid #fbbf24" }}>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold" style={{ color: "#dc2626" }}>Accounting ID</label>
                    <input
                      type="text"
                      name="id"
                      value={form.id}
                      onChange={handleChange}
                      placeholder="e.g., A001"
                      autoComplete="username"
                      className="form-control form-control-lg rounded-xl"
                      style={{ borderColor: "#f97316" }}
                    />
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
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  {showHint && (
                    <div className="mb-4 rounded-xl overflow-hidden" style={{ background: "#fef3c7", border: "1px solid #fbbf24" }}>
                      <div className="px-4 py-2 border-bottom" style={{ borderColor: "#fbbf24", background: "#fff7ed" }}>
                        <p className="mb-0 fw-semibold text-uppercase small" style={{ color: "#dc2626" }}>Demo Accounting Accounts</p>
                      </div>
                      <div className="px-4 py-3">
                        {ACCOUNTING_ACCOUNTS.map(a => (
                          <div key={a.id} className="d-flex justify-content-between align-items-center py-1">
                            <span className="font-monospace" style={{ color: "#dc2626" }}>{a.id}</span>
                            <span className="font-monospace" style={{ color: "#f97316" }}>{a.password}</span>
                            <span className="text-muted small d-none d-sm-block">{a.name}</span>
                          </div>
                        ))}
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
                    ) : (
                      "Access Accounting"
                    )}
                  </button>
                </form>

                <p className="text-center text-muted small mt-5">
                  Admin?{" "}
                  <Link href="/admin/login" className="fw-medium text-decoration-none hover:underline" style={{ color: "#dc2626" }}>
                    Go to Admin Login
                  </Link>
                </p>
              </div>

              <p className="text-center text-muted small mt-4">
                © 2026 Cebu Far East Institute. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

