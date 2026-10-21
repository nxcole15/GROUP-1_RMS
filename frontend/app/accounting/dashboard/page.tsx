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

export default function AccountingDashboardPage() {
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
  const totalAmount = payments.filter(p => p.status === "verified").reduce((sum, p) => sum + Number(p.amount), 0);

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
          <button className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0" style={{ color: "#fff", background: "#3b82f6" }}>
            <Icon name="activity" size={20} />
            <span>Overview</span>
          </button>
          <button onClick={() => router.push("/accounting/payments")} className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0" style={{ color: "rgba(255,255,255,0.7)", background: "transparent" }}>
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
              <h1 className="fw-bold text-white mb-1" style={{ fontSize:"1.8rem" }}>Accounting Dashboard</h1>
              <p className="mb-0 text-white-50" style={{ fontSize: 15 }}>Tuition & Payment Management</p>
            </div>
          </header>

          <main className="container-fluid px-4 py-4">
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 h-100" style={{ overflow:"hidden" }}>
                  <div className="card-body p-4">
                    <p className="text-muted mb-2 fw-semibold" style={{ fontSize: 14 }}>Pending Payments</p>
                    <h2 className="mb-3 fw-bold" style={{ fontSize: 42, color: "#f59e0b", lineHeight: 1 }}>{pendingCount}</h2>
                    <p className="text-muted mb-0" style={{ fontSize: 14 }}>Awaiting verification</p>
                  </div>
                  <div style={{ height:3, background:"linear-gradient(135deg,#f59e0b,#fbbf24)" }} />
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 h-100" style={{ overflow:"hidden" }}>
                  <div className="card-body p-4">
                    <p className="text-muted mb-2 fw-semibold" style={{ fontSize: 14 }}>Verified Payments</p>
                    <h2 className="mb-3 fw-bold" style={{ fontSize: 42, color: "#10b981", lineHeight: 1 }}>{verifiedCount}</h2>
                    <p className="text-muted mb-0" style={{ fontSize: 14 }}>Successfully processed</p>
                  </div>
                  <div style={{ height:3, background:"linear-gradient(135deg,#10b981,#34d399)" }} />
                </div>
              </div>

              <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 h-100" style={{ overflow:"hidden" }}>
                  <div className="card-body p-4">
                    <p className="text-muted mb-2 fw-semibold" style={{ fontSize: 14 }}>Total Verified</p>
                    <h2 className="mb-3 fw-bold" style={{ fontSize: 36, color: "#3b82f6", lineHeight: 1 }}>₱{totalAmount.toLocaleString()}</h2>
                    <p className="text-muted mb-0" style={{ fontSize: 14 }}>Cumulative revenue</p>
                  </div>
                  <div style={{ height:3, background:"linear-gradient(135deg,#3b82f6,#60a5fa)" }} />
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width:36, height:36, background:"linear-gradient(135deg,#3b82f6,#60a5fa)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                        </svg>
                      </div>
                      <h3 className="fw-bold mb-0" style={{ fontSize:"0.95rem", color:"#1e293b" }}>Payment Status Distribution</h3>
                    </div>

                    <div className="d-flex align-items-center justify-content-center py-4" style={{ minHeight: 250 }}>
                      <div className="position-relative" style={{ width: 200, height: 200 }}>
                        <svg viewBox="0 0 100 100" className="w-100 h-100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="none" 
                            stroke="#10b981" 
                            strokeWidth="20"
                            strokeDasharray={`${(verifiedCount / (verifiedCount + pendingCount)) * 251.2} 251.2`}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                          />
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="none" 
                            stroke="#f59e0b" 
                            strokeWidth="20"
                            strokeDasharray={`${(pendingCount / (verifiedCount + pendingCount)) * 251.2} 251.2`}
                            strokeDashoffset={`-${(verifiedCount / (verifiedCount + pendingCount)) * 251.2}`}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="position-absolute top-50 start-50 translate-middle text-center">
                          <div className="fw-bold" style={{ fontSize: "1.5rem", color: "#1e293b" }}>{payments.length}</div>
                          <div className="text-muted small">Total</div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: "#f0fdf4" }}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded" style={{ width: 12, height: 12, background: "#10b981" }} />
                          <span className="small fw-semibold">Verified Payments</span>
                        </div>
                        <span className="badge px-2 py-1" style={{ background: "#10b981", color: "white", fontSize: "0.75rem" }}>
                          {verifiedCount} ({payments.length > 0 ? Math.round((verifiedCount / payments.length) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: "#fffbeb" }}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded" style={{ width: 12, height: 12, background: "#f59e0b" }} />
                          <span className="small fw-semibold">Pending Payments</span>
                        </div>
                        <span className="badge px-2 py-1" style={{ background: "#f59e0b", color: "white", fontSize: "0.75rem" }}>
                          {pendingCount} ({payments.length > 0 ? Math.round((pendingCount / payments.length) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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
              <h3 className="mb-0 fw-bold text-white" style={{ fontSize: "1.3rem" }}>Accounting Dashboard</h3>
              <p className="mb-0 text-white-50" style={{ fontSize: 14 }}>Payment Management</p>
            </div>
          </header>

          <main className="container-fluid px-3 py-4">
            <div className="row g-3 mb-4">
              <div className="col-4">
                <div className="card border-0 shadow-sm rounded-3" style={{ overflow:"hidden" }}>
                  <div className="card-body p-2">
                    <p className="text-muted mb-1 fw-semibold" style={{ fontSize: 10 }}>Pending</p>
                    <h3 className="mb-0 fw-bold" style={{ fontSize: 24, color: "#f59e0b", lineHeight: 1 }}>{pendingCount}</h3>
                  </div>
                  <div style={{ height:2, background:"linear-gradient(135deg,#f59e0b,#fbbf24)" }} />
                </div>
              </div>
              <div className="col-4">
                <div className="card border-0 shadow-sm rounded-3" style={{ overflow:"hidden" }}>
                  <div className="card-body p-2">
                    <p className="text-muted mb-1 fw-semibold" style={{ fontSize: 10 }}>Verified</p>
                    <h3 className="mb-0 fw-bold" style={{ fontSize: 24, color: "#10b981", lineHeight: 1 }}>{verifiedCount}</h3>
                  </div>
                  <div style={{ height:2, background:"linear-gradient(135deg,#10b981,#34d399)" }} />
                </div>
              </div>
              <div className="col-4">
                <div className="card border-0 shadow-sm rounded-3" style={{ overflow:"hidden" }}>
                  <div className="card-body p-2">
                    <p className="text-muted mb-1 fw-semibold" style={{ fontSize: 10 }}>Total</p>
                    <h3 className="mb-0 fw-bold" style={{ fontSize: 18, color: "#3b82f6", lineHeight: 1 }}>₱{(totalAmount/1000).toFixed(0)}k</h3>
                  </div>
                  <div style={{ height:2, background:"linear-gradient(135deg,#3b82f6,#60a5fa)" }} />
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 mb-3">
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width:32, height:32, background:"linear-gradient(135deg,#3b82f6,#60a5fa)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                    </svg>
                  </div>
                  <h4 className="fw-bold mb-0" style={{ fontSize:"0.9rem", color:"#1e293b" }}>Payment Distribution</h4>
                </div>

                <div className="d-flex align-items-center justify-content-center py-3">
                  <div className="position-relative" style={{ width: 150, height: 150 }}>
                    <svg viewBox="0 0 100 100" className="w-100 h-100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="20"
                        strokeDasharray={`${(verifiedCount / (verifiedCount + pendingCount)) * 251.2} 251.2`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="none" 
                        stroke="#f59e0b" 
                        strokeWidth="20"
                        strokeDasharray={`${(pendingCount / (verifiedCount + pendingCount)) * 251.2} 251.2`}
                        strokeDashoffset={`-${(verifiedCount / (verifiedCount + pendingCount)) * 251.2}`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <div className="fw-bold" style={{ fontSize: "1.2rem", color: "#1e293b" }}>{payments.length}</div>
                      <div className="text-muted" style={{ fontSize: "0.7rem" }}>Total</div>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2">
                  <div className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: "#f0fdf4" }}>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded" style={{ width: 10, height: 10, background: "#10b981" }} />
                      <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Verified</span>
                    </div>
                    <span className="badge px-2 py-1" style={{ background: "#10b981", color: "white", fontSize: "0.7rem" }}>
                      {verifiedCount} ({payments.length > 0 ? Math.round((verifiedCount / payments.length) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: "#fffbeb" }}>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded" style={{ width: 10, height: 10, background: "#f59e0b" }} />
                      <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Pending</span>
                    </div>
                    <span className="badge px-2 py-1" style={{ background: "#f59e0b", color: "white", fontSize: "0.7rem" }}>
                      {pendingCount} ({payments.length > 0 ? Math.round((pendingCount / payments.length) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
