"use client";

import { useEffect, useMemo, useState } from "react";

type AccountingActive = { id: string; name: string } | null;

type PaymentRecord = {
  id: number;
  studentId: string;
  student: string;
  feeItem: string;
  amount: number;
  status: "For Verification" | "Verified";
};

type StudentTuition = {
  id: string;
  name: string;
  track: string;
  level: string;
  total: number;
  paid: number;
  balance?: number;
};

const LS_ACTIVE_KEY = "inform_accounting_active";
const LS_PAYMENT_LOG_KEY = "inform_accounting_payment_log";

const STUDENT_TUITION: StudentTuition[] = [
  { id: "STU-2024-001", name: "Jamie Santos", track: "STEM", level: "Grade 11", total: 22050, paid: 22050 },
  { id: "STU-2024-002", name: "Maria Reyes", track: "HUMMS", level: "Grade 11", total: 22050, paid: 18500 },
  { id: "STU-2024-003", name: "Carlo Dela Cruz", track: "ABM", level: "Grade 12", total: 22050, paid: 22050 },
  { id: "STU-2024-005", name: "Luis Fernandez", track: "STEM", level: "Grade 12", total: 22050, paid: 18500 },
  { id: "STU-2024-006", name: "Rosa Bautista", track: "TVL-TechPro", level: "Grade 11", total: 22050, paid: 22050 },
  { id: "STU-2024-008", name: "Lena Cruz", track: "HUMMS", level: "Grade 11", total: 22050, paid: 22050 },
];

const PAYMENT_LOG_SEED: PaymentRecord[] = [
  { id: 1, studentId: "STU-2024-002", student: "Maria Reyes", amount: 3550, feeItem: "Outstanding Balance", status: "For Verification" },
  { id: 2, studentId: "STU-2024-005", student: "Luis Fernandez", amount: 3550, feeItem: "Outstanding Balance", status: "For Verification" },

  { id: 3, studentId: "STU-2024-003", student: "Carlo Dela Cruz", amount: 22050, feeItem: "Tuition Fees", status: "Verified" },
];

function formatCurrencyPHP(amount: number) {
  return `₱${amount.toLocaleString("en-PH")}`;
}

export default function AccountingDashboardPage() {
  const [active, setActive] = useState<AccountingActive>(null);
  const [paymentLog, setPaymentLog] = useState<PaymentRecord[]>(PAYMENT_LOG_SEED);
  const [panel, setPanel] = useState<"tuition" | "payments" | "students">("tuition");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "For Verification" | "Verified">("All");

  useEffect(() => {
    // Route protection
    const token = localStorage.getItem("inform_token");
    const role  = localStorage.getItem("inform_role");
    if (!token || role !== "Accounting") {
      window.location.replace("/login");
      return;
    }

    try {
      const raw = localStorage.getItem(LS_ACTIVE_KEY);
      setActive(raw ? (JSON.parse(raw) as AccountingActive) : null);
    } catch {
      setActive(null);
    }

    try {
      const rawLog = localStorage.getItem(LS_PAYMENT_LOG_KEY);
      if (rawLog) setPaymentLog(JSON.parse(rawLog) as PaymentRecord[]);
    } catch {
      setPaymentLog(PAYMENT_LOG_SEED);
    }

    // Fetch real payments from API if backend is live
    if (!token.startsWith("demo_")) {
      fetch("http://localhost:4000/api/admin/payments", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.payments?.length) {
            setPaymentLog(data.payments.map((p: {id: number; student_id: string; fee_item: string; amount: number; status: string}) => ({
              id:        p.id,
              studentId: p.student_id,
              student:   p.student_id,
              feeItem:   p.fee_item,
              amount:    Number(p.amount),
              status:    p.status === "verified" ? "Verified" : "For Verification",
            })));
          }
        })
        .catch(() => {}); // keep seed data on error
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    try {
      localStorage.setItem(LS_PAYMENT_LOG_KEY, JSON.stringify(paymentLog));
    } catch {
      // ignore
    }
  }, [paymentLog, active]);

  const enrichedStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    // Build per-student summary from real paymentLog data
    const byStudent: Record<string, { id: string; name: string; track: string; level: string; total: number; paid: number }> = {};
    paymentLog.forEach(p => {
      if (!byStudent[p.studentId]) {
        byStudent[p.studentId] = { id: p.studentId, name: p.student, track: "—", level: "—", total: 22050, paid: 0 };
      }
      if (p.status === "Verified") byStudent[p.studentId].paid += p.amount;
    });
    // Fall back to STUDENT_TUITION if no real payments yet
    const sourceList = Object.keys(byStudent).length > 0
      ? Object.values(byStudent)
      : STUDENT_TUITION;
    const filtered = !q
      ? sourceList
      : sourceList.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
    return filtered.map(s => ({ ...s, balance: Math.max(0, s.total - s.paid) }));
  }, [search, paymentLog]);

  const totals = useMemo(() => {
    const base = Object.keys(
      paymentLog.reduce((acc, p) => { acc[p.studentId] = true; return acc; }, {} as Record<string, boolean>)
    ).length > 0
      ? enrichedStudents
      : STUDENT_TUITION.map(s => ({ ...s, balance: Math.max(0, s.total - s.paid) }));
    const totalAssessment = base.reduce((a, s) => a + s.total, 0);
    const totalCollected  = base.reduce((a, s) => a + s.paid,  0);
    const totalBalance    = totalAssessment - totalCollected;
    return { totalAssessment, totalCollected, totalBalance };
  }, [enrichedStudents, paymentLog]);

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return paymentLog.filter(p => {
      const matchSearch = !q || p.student.toLowerCase().includes(q) || p.studentId.toLowerCase().includes(q);
      const matchStatus = filterStatus === "All" || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [paymentLog, search, filterStatus]);

  function verifyPayment(id: number) {
    setPaymentLog(prev => prev.map(p => (p.id === id ? { ...p, status: "Verified" } : p)));
    const token = localStorage.getItem("inform_token");
    if (!token || token.startsWith("demo_")) return;
    fetch(`http://localhost:4000/api/admin/payments/${id}/verify`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
    }).catch(() => {});
  }

  function rejectPayment(id: number) {
    // demo-only: remove record
    setPaymentLog(prev => prev.filter(p => p.id !== id));
  }

  function logout() {
    try {
      localStorage.removeItem(LS_ACTIVE_KEY);
    } catch {
      // ignore
    }
    window.location.href = "/login";
  }

  if (!active) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#f0f4ff" }}>
        <div className="card shadow-sm p-4" style={{ maxWidth: 520, width: "100%" }}>
          <div className="fw-bold" style={{ color: "#dc2626" }}>Accounting session not found</div>
          <p className="text-muted small mb-3">Please login again.</p>
          <a href="/login" className="btn" style={{ background: "linear-gradient(135deg,#dc2626,#f97316)", color: "white" }}>
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="accounting-dashboard-layout" style={{ minHeight: "100vh", background: "#0b1020" }} suppressHydrationWarning>
      {mobileOpen && <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" style={{ zIndex: 1040 }} onClick={() => setMobileOpen(false)} />}
      <aside
        className={`dashboard-sidebar d-flex flex-column flex-shrink-0 ${mobileOpen ? "" : "d-none d-lg-flex"}`}
        style={{ width: 280, background: "linear-gradient(180deg,#111827,#1f2937)", borderRight: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="px-4 py-4 d-flex flex-column align-items-center" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <img src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle mb-2" style={{ width: 52, height: 52, objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)" }} />
          <div className="fw-bold" style={{ color: "#fbbf24", fontSize: 15 }}>CFEI</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>Accounting</div>
        </div>

        <div className="px-3 py-3 d-flex flex-column gap-3" style={{ flex: 1, overflow: "auto" }}>
          <div style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>Signed in as</div>
            <div className="fw-bold" style={{ color: "#fbbf24" }}>{active.name}</div>
          </div>

          <div className="d-flex flex-column gap-2">
            {[
              { id: "tuition", label: "Tuition" },
              { id: "payments", label: "Payments" },
              { id: "students", label: "Students" },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setPanel(item.id as any)}
                className="btn text-start d-flex align-items-center gap-3 rounded-3"
                style={{
                  background: panel === item.id ? "rgba(220,38,38,0.18)" : "transparent",
                  color: "white",
                  border: panel === item.id ? "1px solid rgba(220,38,38,0.35)" : "1px solid transparent",
                }}
              >
                <span style={{ fontSize: 18 }}>{}</span>
                <span className="fw-semibold">{item.label}</span>
              </button>
            ))}
          </div>

          <button onClick={logout} className="btn btn-danger mt-auto fw-semibold d-flex align-items-center justify-content-center gap-2" style={{ borderRadius: 12 }}>
            <span>↩</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <section className="accounting-dashboard-main d-flex flex-column flex-grow-1 overflow-hidden">
        <header style={{ flexShrink: 0, borderBottom: "1px solid rgba(0,0,0,0.08)" }} className="bg-white">
          <div className="d-flex align-items-center gap-3 px-4 py-3">
            <button className="btn btn-link text-dark p-1 d-lg-none" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <div style={{ width: 20, height: 2, background: "currentColor", marginBottom: 4 }} />
              <div style={{ width: 20, height: 2, background: "currentColor", marginBottom: 4 }} />
              <div style={{ width: 20, height: 2, background: "currentColor" }} />
            </button>
            <h4 className="mb-0" style={{ color: "#dc2626" }}>Accounting Dashboard</h4>
          </div>
        </header>

        <main className="flex-grow-1 overflow-auto" style={{ padding: 16 }}>
          {panel === "tuition" && (
            <div className="d-flex flex-column gap-4">
              <div style={{ padding: 18, borderRadius: 18, background: "linear-gradient(135deg, rgba(220,38,38,0.12), rgba(251,191,36,0.12))", border: "1px solid rgba(220,38,38,0.25)" }}>
                <div className="fw-bold" style={{ color: "#ecececff" }}>Tuition Summary</div>
                <div style={{ color: "#ffffff", fontSize: "0.875rem" }}>Demo-only: accounting can view tuition and balances.</div>
              </div>

              <div className="row g-3">
                {[
                  { label: "Total Assessment", value: `₱${totals.totalAssessment.toLocaleString("en-PH")}` },
                  { label: "Total Collected", value: `₱${totals.totalCollected.toLocaleString("en-PH")}` },
                  { label: "Total Balance Due", value: `₱${totals.totalBalance.toLocaleString("en-PH")}` },
                ].map(s => (
                  <div key={s.label} className="col-12 col-md-4">
                    <div className="card" style={{ borderRadius: 16, border: "1px solid rgba(0,0,0,0.08)" }}>
                      <div className="card-body">
                        <div className="text-muted small">{s.label}</div>
                        <div className="fw-bold">{s.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card rounded-4 overflow-hidden">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing: "0.05em" }}>Student</th>
                          <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>Track</th>
                          <th className="small text-muted fw-semibold text-uppercase text-end" style={{ letterSpacing: "0.05em" }}>Total</th>
                          <th className="small text-muted fw-semibold text-uppercase text-end" style={{ letterSpacing: "0.05em" }}>Paid</th>
                          <th className="small text-muted fw-semibold text-uppercase text-end" style={{ letterSpacing: "0.05em" }}>Balance</th>
                          <th className="small text-muted fw-semibold text-uppercase text-end pe-4" style={{ letterSpacing: "0.05em" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrichedStudents.map(s => {
                          const balance = Math.max(0, s.total - s.paid);
                          const status = balance === 0 ? "Paid" : "Unpaid";
                          return (
                            <tr key={s.id}>
                              <td className="ps-4">
                                <div className="fw-semibold">{s.name}</div>
                                <div className="text-muted small">{s.id}</div>
                              </td>
                              <td className="text-muted small">{s.track}</td>
                              <td className="text-end text-muted small">{formatCurrencyPHP(s.total)}</td>
                              <td className="text-end fw-semibold" style={{ color: "#16a34a" }}>{formatCurrencyPHP(s.paid)}</td>
                              <td className="text-end fw-semibold" style={{ color: balance > 0 ? "#dc2626" : "#64748b" }}>{balance > 0 ? formatCurrencyPHP(balance) : "—"}</td>
                              <td className="text-end pe-4">
                                <span className={`badge ${status === "Paid" ? "bg-success-subtle text-success border border-success-subtle" : "bg-danger-subtle text-danger border border-danger-subtle"}`}>
                                  {status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {panel === "payments" && (
            <div className="d-flex flex-column gap-4">
              <div style={{ padding: 18, borderRadius: 18, background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.18)" }}>
                <div className="fw-bold" style={{ color: "#ffffffff" }}>Payment Verification</div>
                <div style={{ color: "#ffffff", fontSize: "0.875rem" }}>Only accounting sees this verification panel (demo).</div>
              </div>

              <div className="card rounded-4 overflow-hidden">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing: "0.05em" }}>Student</th>
                          <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>Fee Item</th>
                          <th className="small text-muted fw-semibold text-uppercase text-end pe-4" style={{ letterSpacing: "0.05em" }}>Amount</th>
                          <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>Status</th>
                          <th className="small text-muted fw-semibold text-uppercase text-end pe-4" style={{ letterSpacing: "0.05em" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.length === 0 ? (
                          <tr><td colSpan={5} className="text-center text-muted py-4">No payment records.</td></tr>
                        ) : (
                          filteredPayments.map(p => (
                            <tr key={p.id}>
                              <td className="ps-4">
                                <div className="fw-semibold">{p.student}</div>
                                <div className="text-muted small">{p.studentId}</div>
                              </td>
                              <td className="text-muted small">{p.feeItem}</td>
                              <td className="text-end pe-4 fw-semibold">{formatCurrencyPHP(p.amount)}</td>
                              <td>
                                <span className={`badge ${p.status === "Verified" ? "bg-success-subtle text-success border border-success-subtle" : "bg-warning-subtle text-warning border border-warning-subtle"}`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="text-end pe-4">
                                {p.status !== "Verified" ? (
                                  <div className="d-flex justify-content-end gap-2">
                                    <button
                                      onClick={() => verifyPayment(p.id)}
                                      className="btn btn-sm"
                                      style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "white", border: "none" }}
                                    >
                                       Verify
                                    </button>
                                    <button
                                      onClick={() => rejectPayment(p.id)}
                                      className="btn btn-sm"
                                      style={{ background: "linear-gradient(135deg,#dc2626,#f97316)", color: "white", border: "none" }}
                                    >
                                       Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-muted small">—</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {panel === "students" && (
            <div className="d-flex flex-column gap-4">
              <div style={{ padding: 18, borderRadius: 18, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.18)" }}>
                <div className="fw-bold" style={{ color: "#f7faffff" }}>Students (Tuition Related)</div>
                <div style={{ color: "#ffffff", fontSize: "0.875rem" }}>Accounting can access tuition-related student info (demo).</div>
              </div>

              <div className="card rounded-4 overflow-hidden">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing: "0.05em" }}>Name</th>
                          <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>Track</th>
                          <th className="small text-muted fw-semibold text-uppercase text-end" style={{ letterSpacing: "0.05em" }}>Balance</th>
                          <th className="small text-muted fw-semibold text-uppercase text-end pe-4" style={{ letterSpacing: "0.05em" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrichedStudents.map(s => {
                          const balance = Math.max(0, s.total - s.paid);
                          return (
                            <tr key={s.id}>
                              <td className="ps-4">
                                <div className="fw-semibold">{s.name}</div>
                                <div className="text-muted small">{s.id}</div>
                              </td>
                              <td className="text-muted small">{s.track}</td>
                              <td className="text-end fw-semibold" style={{ color: balance > 0 ? "#dc2626" : "#64748b" }}>
                                {balance > 0 ? formatCurrencyPHP(balance) : "—"}
                              </td>
                              <td className="text-end pe-4">
                                <div className="d-flex justify-content-end gap-2">
                                  <button onClick={() => setPanel("tuition")} className="btn btn-sm btn-outline-secondary" style={{ borderRadius: 12 }}>
                                    View
                                  </button>
                                  <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: 12 }}>
                                    Notify
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </section>
    </div>
  );
}

