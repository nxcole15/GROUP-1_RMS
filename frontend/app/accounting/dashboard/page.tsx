"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function AccountingDashboardPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "verified">("all");
  const [search, setSearch] = useState("");

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
    <div className="min-vh-100" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)" }}>
      {/* Header */}
      <header className="bg-white border-bottom shadow-sm">
        <div className="container-fluid px-4 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <img src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle" style={{ width: 40, height: 40, objectFit: "cover" }} />
              <div>
                <h5 className="mb-0 fw-bold" style={{ color: "#0369a1" }}>Accounting Dashboard</h5>
                <p className="mb-0 text-muted small">Tuition & Payment Management</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                router.push("/login");
              }}
              className="btn btn-outline-danger btn-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container-fluid px-4 py-4">
        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #f59e0b" }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted small mb-1">Pending Payments</p>
                    <h3 className="mb-0 fw-bold">{pendingCount}</h3>
                  </div>
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #10b981" }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted small mb-1">Verified Payments</p>
                    <h3 className="mb-0 fw-bold">{verifiedCount}</h3>
                  </div>
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #0369a1" }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted small mb-1">Total Verified</p>
                    <h3 className="mb-0 fw-bold">₱{totalAmount.toLocaleString()}</h3>
                  </div>
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: "rgba(3,105,161,0.1)", color: "#0369a1" }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <div className="btn-group" role="group">
                <button 
                  className={`btn ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setFilter("all")}
                >
                  All ({payments.length})
                </button>
                <button 
                  className={`btn ${filter === "pending" ? "btn-warning" : "btn-outline-warning"}`}
                  onClick={() => setFilter("pending")}
                >
                  Pending ({pendingCount})
                </button>
                <button 
                  className={`btn ${filter === "verified" ? "btn-success" : "btn-outline-success"}`}
                  onClick={() => setFilter("verified")}
                >
                  Verified ({verifiedCount})
                </button>
              </div>

              <input
                type="search"
                className="form-control w-auto"
                style={{ minWidth: 250 }}
                placeholder="Search student or fee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr className="border-bottom">
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Fee Item</th>
                      <th>Amount</th>
                      <th>Paid Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length > 0 ? filteredPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="fw-semibold">{payment.student_id}</td>
                        <td>{payment.student_name || "—"}</td>
                        <td>{payment.fee_item}</td>
                        <td className="fw-bold">₱{Number(payment.amount).toLocaleString()}</td>
                        <td className="text-muted small">{new Date(payment.paid_at).toLocaleDateString()}</td>
                        <td>
                          {payment.status === "pending" ? (
                            <span className="badge bg-warning text-dark">Pending</span>
                          ) : (
                            <span className="badge bg-success">Verified</span>
                          )}
                        </td>
                        <td>
                          {payment.status === "pending" && (
                            <button
                              onClick={() => handleVerifyPayment(payment.id)}
                              className="btn btn-sm btn-success"
                            >
                              Verify Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-4">
                          No payments found
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
  );
}
