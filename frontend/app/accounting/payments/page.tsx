"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type PaymentRecord = {
  id: number;
  student_id: string;
  student_name: string;
  fee_item: string;
  amount: number;
  status: string;
  paid_at: string;
  admin_id?: string;
  admin_timestamp?: string;
};

type IconName = "activity" | "menu";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const props = {
    width: size, height: size, fill: "none", viewBox: "0 0 24 24",
    stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "activity": return <svg {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case "menu": return <svg {...props}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
    default: return <svg {...props}><circle cx="12" cy="12" r="10"/></svg>;
  }
}

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "verified">("all");
  const [search, setSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    const role = localStorage.getItem("inform_role");
    if (role !== "accounting") {
      router.replace("/login");
      return;
    }
    loadPayments();
  }, [router]);

  async function loadPayments() {
    try {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/payments`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyPayment(paymentId: number) {
    try {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/payments/${paymentId}/verify`, {
        method: "PATCH",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        }
      });
      if (res.ok) {
        await loadPayments();
      }
    } catch (err) {
      console.error("Failed to verify payment:", err);
    }
  }

  const filteredPayments = payments.filter(p => {
    const matchesFilter = filter === "all" || p.status === filter;
    const matchesSearch = !search || 
      p.student_id.toLowerCase().includes(search.toLowerCase()) ||
      p.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.fee_item.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = payments.filter(p => p.status === "pending").length;
  const verifiedCount = payments.filter(p => p.status === "verified").length;

  return (
    <>
      {showSidebar && <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" style={{ zIndex: 1040 }} onClick={() => setShowSidebar(false)} />}
      <div className={`position-fixed top-0 start-0 h-100 d-flex flex-column flex-shrink-0 ${showSidebar ? "" : "d-none d-lg-flex"}`} style={{ width: 256, zIndex: 1045, background: "linear-gradient(180deg,#1e3a8a 0%,#1e40af 100%)", overflowY: "auto" }}>
        <div className="p-4 d-flex flex-column align-items-center border-bottom border-white border-opacity-10">
          <Image src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle mb-3" width={80} height={80} />
          <div className="text-center">
            <div className="text-white fw-bold" style={{ fontSize: "1.1rem" }}>Accounting</div>
            <div className="text-white-50 small">Payment Management</div>
          </div>
        </div>

        <nav className="flex-grow-1 px-3 py-3 d-flex flex-column gap-2">
          <button onClick={() => router.push("/accounting/dashboard")} className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0" style={{ color: "rgba(255,255,255,0.7)", background: "transparent" }}>
            <Icon name="activity" size={20} />
            <span>Overview</span>
          </button>
          <button className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0" style={{ color: "#fff", background: "#3b82f6" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            <span>Payments</span>
          </button>
          <button onClick={() => router.push("/accounting/profile")} className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0" style={{ color: "rgba(255,255,255,0.7)", background: "transparent" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span>My Profile</span>
          </button>
        </nav>

        <div className="px-3 py-4 border-top border-white border-opacity-10">
          <button onClick={() => {
            localStorage.clear();
            router.push("/login");
          }} className="btn w-100 fw-bold py-3 d-flex align-items-center justify-content-center gap-2" style={{ background: "#1e3a8a", color: "#fff", border: "2px solid #1e40af", fontSize: "1rem" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </div>

      <div style={{ marginLeft: 256 }} className="d-none d-lg-block">
        <div className="min-vh-100" style={{ background: "#f5f5f5" }}>
          <header style={{ background: "linear-gradient(135deg,#3b82f6 0%,#60a5fa 100%)", padding: "24px 0" }}>
            <div className="container-fluid px-4">
              <h1 className="fw-bold text-white mb-1" style={{ fontSize:"1.8rem" }}>Payment Records</h1>
              <p className="mb-0 text-white-50" style={{ fontSize: 15 }}>Manage and verify student payments</p>
            </div>
          </header>

          <main className="container-fluid px-4 py-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                  <div className="d-flex gap-3">
                    <button className={`btn btn-lg fw-semibold ${filter === "all" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setFilter("all")}>
                      All ({payments.length})
                    </button>
                    <button className={`btn btn-lg fw-semibold ${filter === "pending" ? "text-white" : "btn-outline-secondary"}`} onClick={() => setFilter("pending")} style={filter === "pending" ? { background: "#f59e0b" } : {}}>
                      Pending ({pendingCount})
                    </button>
                    <button className={`btn btn-lg fw-semibold ${filter === "verified" ? "text-white" : "btn-outline-secondary"}`} onClick={() => setFilter("verified")} style={filter === "verified" ? { background: "#10b981" } : {}}>
                      Verified ({verifiedCount})
                    </button>
                  </div>
                  
                  <input type="search" className="form-control form-control-lg" style={{ minWidth: 300, maxWidth: 450 }} placeholder="Search student, ID, or fee..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status" style={{ width: 50, height: 50 }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted fs-5">Loading payment records...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: 15 }}>
                      <thead>
                        <tr style={{ borderBottom:"2px solid #f1f5f9" }}>
                          <th className="fw-bold py-3 text-dark" style={{ fontSize: 15 }}>Student ID</th>
                          <th className="fw-bold py-3 text-dark" style={{ fontSize: 15 }}>Student Name</th>
                          <th className="fw-bold py-3 text-dark" style={{ fontSize: 15 }}>Fee Item</th>
                          <th className="fw-bold py-3 text-dark" style={{ fontSize: 15 }}>Amount</th>
                          <th className="fw-bold py-3 text-dark" style={{ fontSize: 15 }}>Paid Date</th>
                          <th className="fw-bold py-3 text-dark" style={{ fontSize: 15 }}>Status</th>
                          <th className="fw-bold py-3 text-dark" style={{ fontSize: 15 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.length > 0 ? filteredPayments.map((payment) => (
                          <tr key={payment.id} style={{ borderBottom:"1px solid #f8fafc" }}>
                            <td className="fw-semibold py-3">{payment.student_id}</td>
                            <td className="py-3">{payment.student_name || "—"}</td>
                            <td className="text-muted py-3">{payment.fee_item}</td>
                            <td className="fw-bold py-3" style={{ fontSize: 16, color: "#3b82f6" }}>
                              ₱{Number(payment.amount).toLocaleString()}
                            </td>
                            <td className="text-muted py-3">
                              {new Date(payment.paid_at).toLocaleDateString('en-US', { 
                                month: 'short', day: 'numeric', year: 'numeric' 
                              })}
                            </td>
                            <td className="py-3">
                              {payment.status === "pending" ? (
                                <span className="badge fw-semibold px-3 py-2" style={{ fontSize: 14, background: "#fef3c7", color: "#d97706" }}>
                                  Pending
                                </span>
                              ) : (
                                <span className="badge fw-semibold px-3 py-2" style={{ fontSize: 14, background: "#d1fae5", color: "#059669" }}>
                                  Verified
                                </span>
                              )}
                            </td>
                            <td className="py-3">
                              {payment.status === "pending" && (
                                <button onClick={() => handleVerifyPayment(payment.id)} className="btn fw-semibold px-4 text-white" style={{ fontSize: 15, background: "#10b981" }}>
                                  Verify Payment
                                </button>
                              )}
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={7} className="text-center py-5">
                              <p className="text-muted mb-0 fs-5">No payments found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className="d-lg-none">
        <div className="min-vh-100" style={{ background: "#f5f5f5" }}>
          <header style={{ background: "linear-gradient(135deg,#3b82f6 0%,#60a5fa 100%)", padding: "24px 0", position: "relative" }}>
            <button className="btn position-absolute top-0 start-0 m-3" onClick={() => setShowSidebar(true)} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }}>
              <Icon name="menu" size={20} />
            </button>
            <div className="container-fluid px-4" style={{ paddingTop: 40 }}>
              <h3 className="mb-0 fw-bold text-white" style={{ fontSize: "1.3rem" }}>Payment Records</h3>
              <p className="mb-0 text-white-50" style={{ fontSize: 14 }}>Manage and verify payments</p>
            </div>
          </header>

          <main className="container-fluid px-3 py-4">
            <div className="card border-0 shadow-sm rounded-4 mb-3">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="fw-bold mb-0" style={{ color: "#3b82f6", fontSize: "1rem" }}>All Payments</h4>
                  <input type="search" className="form-control form-control-sm w-auto" style={{ fontSize: "0.8rem" }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
                </div>
                
                <div className="d-flex gap-2 mb-3">
                  <button className={`btn btn-sm flex-grow-1 ${filter === "all" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setFilter("all")} style={{ fontSize: "0.8rem" }}>
                    All ({payments.length})
                  </button>
                  <button className={`btn btn-sm flex-grow-1 ${filter === "pending" ? "text-white" : "btn-outline-secondary"}`} onClick={() => setFilter("pending")} style={filter === "pending" ? { background: "#f59e0b", fontSize: "0.8rem" } : { fontSize: "0.8rem" }}>
                    Pending
                  </button>
                  <button className={`btn btn-sm flex-grow-1 ${filter === "verified" ? "text-white" : "btn-outline-secondary"}`} onClick={() => setFilter("verified")} style={filter === "verified" ? { background: "#10b981", fontSize: "0.8rem" } : { fontSize: "0.8rem" }}>
                    Verified
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm" style={{ color:"#3b82f6" }} />
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {filteredPayments.map((payment) => (
                      <div key={payment.id} className="p-3 rounded-3 shadow-sm" style={{ background:"#fff", fontSize: "0.85rem" }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="flex-grow-1">
                            <div className="fw-bold" style={{ fontSize: "0.95rem" }}>{payment.student_name || payment.student_id}</div>
                            <div className="text-muted small">{payment.fee_item}</div>
                          </div>
                          {payment.status === "pending" ? (
                            <span className="badge fw-semibold px-2 py-1" style={{ fontSize: "0.7rem", background: "#fef3c7", color: "#d97706" }}>
                              Pending
                            </span>
                          ) : (
                            <span className="badge fw-semibold px-2 py-1" style={{ fontSize: "0.7rem", background: "#d1fae5", color: "#059669" }}>
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="fw-bold" style={{ fontSize: "1rem", color: "#3b82f6" }}>
                            ₱{Number(payment.amount).toLocaleString()}
                          </div>
                          <div className="text-muted small">
                            {new Date(payment.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        {payment.status === "pending" && (
                          <button onClick={() => handleVerifyPayment(payment.id)} className="btn btn-sm w-100 fw-semibold mt-2 text-white" style={{ fontSize: "0.85rem", background: "#10b981" }}>
                            Verify Payment
                          </button>
                        )}
                      </div>
                    ))}
                    {filteredPayments.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-muted mb-0">No payments found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
