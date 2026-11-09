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
  payment_method?: string;
  notes?: string;
  admin_id?: string;
  admin_timestamp?: string;
  recorded_by_name?: string;
  student_email?: string;
  grade_level?: number;
  pathway?: string;
  recorded_by_email?: string;
};

type Student = {
  student_id: string;
  full_name: string;
  email: string;
  grade_level: number;
  pathway: string;
};

type BalanceInfo = {
  student_id: string;
  assessment_id: number;
  total_assessment: number;
  discount_amount: number;
  net_assessment: number;
  total_paid: number;
  remaining_balance: number;
  school_year: string;
  term: string;
};

type IconName = "activity" | "menu" | "file" | "settings" | "users" | "calculator" | "user" | "x";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const props = {
    width: size, height: size, fill: "none", viewBox: "0 0 24 24",
    stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "activity": return <svg {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case "menu": return <svg {...props}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
    case "file": return <svg {...props}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case "settings": return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/></svg>;
    case "users": return <svg {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
    case "calculator": return <svg {...props}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="16" y1="18" x2="16" y2="18"/><line x1="12" y1="18" x2="12" y2="18"/><line x1="8" y1="18" x2="8" y2="18"/></svg>;
    case "user": return <svg {...props}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case "x": return <svg {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    default: return <svg {...props}><circle cx="12" cy="12" r="10"/></svg>;
  }
}

// Record Payment Modal Component
function RecordPaymentModal({ show, onClose, onSuccess }: { show: boolean; onClose: () => void; onSuccess: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form fields
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => {
    // Get current date and time in local timezone
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
        const res = await fetch(
          `${API_BASE}/api/accounting/students/search?q=${encodeURIComponent(searchQuery)}`,
          {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const data = await res.json();
        if (res.ok) {
          setSearchResults(data.students || []);
        }
      } catch (err) {
        console.error("Search failed:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, API_BASE]);

  async function handleSelectStudent(student: Student) {
    setSelectedStudent(student);
    setSearchResults([]);
    setSearchQuery(student.full_name);
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const res = await fetch(
        `${API_BASE}/api/accounting/students/${student.student_id}/balance`,
        {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      
      if (res.ok) {
        setBalanceInfo(data.balance);
      } else {
        setError(data.error || "Failed to load student balance");
        setBalanceInfo(null);
      }
    } catch (err) {
      setError("Failed to load student balance");
      setBalanceInfo(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedStudent || !balanceInfo) {
      setError("Please select a student first");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (parsedAmount > balanceInfo.remaining_balance) {
      setError(`Amount exceeds remaining balance of ₱${balanceInfo.remaining_balance.toLocaleString()}`);
      return;
    }

    if (!paymentMethod.trim()) {
      setError("Payment method is required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/accounting/payments/record`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: selectedStudent.student_id,
          amount: parsedAmount,
          payment_date: new Date(paymentDate).toISOString(),
          payment_method: paymentMethod.trim(),
          notes: notes.trim() || null
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Payment recorded successfully!\n\nNew balance: ₱${data.balance.new_balance.toLocaleString()}`);
        handleClose();
        onSuccess();
      } else {
        setError(data.error || "Failed to record payment");
      }
    } catch (err) {
      console.error("Payment recording failed:", err);
      setError("Failed to record payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedStudent(null);
    setBalanceInfo(null);
    setAmount("");
    // Reset to current date/time in local timezone
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setPaymentDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    setPaymentMethod("");
    setNotes("");
    setError("");
    onClose();
  }

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={handleClose} />
      <div className="modal fade show d-block" style={{ zIndex: 1055 }} tabIndex={-1}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header" style={{ background: "#dc2626", color: "white" }}>
              <h5 className="modal-title fw-bold">Record Tuition Payment</h5>
              <button type="button" className="btn-close btn-close-white" onClick={handleClose} />
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {/* Student Search */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Search Student</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Enter student ID or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={!!selectedStudent}
                  />
                  
                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && !selectedStudent && (
                    <div className="list-group mt-2" style={{ maxHeight: 200, overflowY: "auto" }}>
                      {searchResults.map((student) => (
                        <button
                          key={student.student_id}
                          type="button"
                          className="list-group-item list-group-item-action"
                          onClick={() => handleSelectStudent(student)}
                        >
                          <div className="d-flex justify-content-between">
                            <div>
                              <strong>{student.full_name}</strong>
                              <div className="small text-muted">{student.student_id} • Grade {student.grade_level}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Student & Balance Info */}
                {selectedStudent && balanceInfo && (
                  <div className="card mb-4" style={{ background: "#f8f9fa", border: "2px solid #dee2e6" }}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="fw-bold mb-1">{selectedStudent.full_name}</h6>
                          <div className="small text-muted">
                            {selectedStudent.student_id} • Grade {selectedStudent.grade_level}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setSelectedStudent(null);
                            setBalanceInfo(null);
                            setSearchQuery("");
                          }}
                        >
                          Change Student
                        </button>
                      </div>
                      
                      <div className="row g-3">
                        <div className="col-4">
                          <div className="small text-muted">Total Assessment</div>
                          <div className="fw-semibold">₱{balanceInfo.net_assessment.toLocaleString()}</div>
                        </div>
                        <div className="col-4">
                          <div className="small text-muted">Total Paid</div>
                          <div className="fw-semibold text-success">₱{balanceInfo.total_paid.toLocaleString()}</div>
                        </div>
                        <div className="col-4">
                          <div className="small text-muted">Remaining Balance</div>
                          <div className="fw-bold fs-5 text-danger">
                            ₱{balanceInfo.remaining_balance.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}

                {/* Payment Form */}
                {selectedStudent && balanceInfo && (
                  <>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Amount Paid <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text">₱</span>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="0.00"
                            step="0.01"
                            min="0.01"
                            max={balanceInfo.remaining_balance}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-text">
                          Max: ₱{balanceInfo.remaining_balance.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Payment Date <span className="text-danger">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          className="form-control form-control-lg"
                          value={paymentDate}
                          max={(() => {
                            const now = new Date();
                            const year = now.getFullYear();
                            const month = String(now.getMonth() + 1).padStart(2, '0');
                            const day = String(now.getDate()).padStart(2, '0');
                            const hours = String(now.getHours()).padStart(2, '0');
                            const minutes = String(now.getMinutes()).padStart(2, '0');
                            return `${year}-${month}-${day}T${hours}:${minutes}`;
                          })()}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Payment Method <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="e.g., Cash, Check, Money Order"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        maxLength={100}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Notes (Optional)</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Add any additional notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        maxLength={500}
                      />
                      <div className="form-text">{notes.length}/500 characters</div>
                    </div>
                  </>
                )}

                {/* Error Display */}
                {error && (
                  <div className="alert alert-danger mb-0" role="alert">
                    <strong>Error:</strong> {error}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: "#dc2626", border: "none" }}
                  disabled={!selectedStudent || !balanceInfo || submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Recording...
                    </>
                  ) : (
                    "Save Payment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

// Payment Details Modal Component
function PaymentDetailsModal({ payment, show, onClose }: { payment: PaymentRecord | null; show: boolean; onClose: () => void }) {
  if (!show || !payment) return null;

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onClose} />
      <div className="modal fade show d-block" style={{ zIndex: 1055 }} tabIndex={-1}>
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header" style={{ background: "#1e293b", color: "white" }}>
              <h5 className="modal-title fw-bold">Payment Details</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} />
            </div>
            
            <div className="modal-body">
              {/* Student Information */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3 text-uppercase small" style={{ color: "#64748b", letterSpacing: "0.5px" }}>
                  Student Information
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="small text-muted">Student ID</div>
                    <div className="fw-semibold">{payment.student_id}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="small text-muted">Full Name</div>
                    <div className="fw-semibold">{payment.student_name || "N/A"}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="small text-muted">Grade Level</div>
                    <div className="fw-semibold">Grade {payment.grade_level || "N/A"}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="small text-muted">Email</div>
                    <div className="fw-semibold">{payment.student_email || "N/A"}</div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3 text-uppercase small" style={{ color: "#64748b", letterSpacing: "0.5px" }}>
                  Payment Information
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="small text-muted">Fee Item</div>
                    <div className="fw-semibold">{payment.fee_item}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="small text-muted">Amount Paid</div>
                    <div className="fw-bold fs-4" style={{ color: "#10b981" }}>
                      ₱{Number(payment.amount).toLocaleString()}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="small text-muted">Payment Date</div>
                    <div className="fw-semibold">{formatDateTime(payment.paid_at)}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="small text-muted">Payment Method</div>
                    <div className="fw-semibold">{payment.payment_method || "N/A"}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="small text-muted">Payment Status</div>
                    <div>
                      {payment.status === "verified" ? (
                        <span className="badge fw-semibold px-3 py-2" style={{ fontSize: 14, background: "#d1fae5", color: "#059669" }}>
                          Verified
                        </span>
                      ) : (
                        <span className="badge fw-semibold px-3 py-2" style={{ fontSize: 14, background: "#fef3c7", color: "#d97706" }}>
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recording Information */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3 text-uppercase small" style={{ color: "#64748b", letterSpacing: "0.5px" }}>
                  Recording Information
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="small text-muted">Recorded By</div>
                    <div className="fw-semibold">{payment.recorded_by_name || payment.admin_id || "N/A"}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="small text-muted">Date Recorded</div>
                    <div className="fw-semibold">
                      {payment.admin_timestamp ? formatDateTime(payment.admin_timestamp) : "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {payment.notes && (
                <div className="mb-0">
                  <h6 className="fw-bold mb-3 text-uppercase small" style={{ color: "#64748b", letterSpacing: "0.5px" }}>
                    Additional Notes
                  </h6>
                  <div className="p-3 rounded" style={{ background: "#f8f9fa", border: "1px solid #e2e8f0" }}>
                    {payment.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Main Tuition Payments Page
export default function TuitionPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "verified">("all");
  const [search, setSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"balances" | "payments">("balances");
  const [studentBalances, setStudentBalances] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total_count: 0,
    pending_count: 0,
    verified_count: 0,
    total_verified_amount: 0,
    students_with_balance: 0
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    const role = localStorage.getItem("inform_role");
    if (role !== "accounting") {
      router.replace("/login");
      return;
    }
    loadPayments();
    loadStudentBalances();
  }, [router]);

  async function loadStudentBalances() {
    try {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/accounting/students-with-balance`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStudentBalances(data.students || []);
      }
    } catch (err) {
      console.error("Failed to load student balances:", err);
    }
  }

  async function loadPayments() {
    try {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/accounting/payments`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPayments(data.payments || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewDetails(payment: PaymentRecord) {
    try {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/accounting/payments/${payment.id}`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedPayment(data.payment);
        setShowDetailsModal(true);
      }
    } catch (err) {
      console.error("Failed to load payment details:", err);
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

  return (
    <>
      {/* Modals */}
      <RecordPaymentModal 
        show={showRecordModal} 
        onClose={() => setShowRecordModal(false)}
        onSuccess={() => { 
          loadPayments(); 
          loadStudentBalances();
        }}
      />
      
      <PaymentDetailsModal
        payment={selectedPayment}
        show={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedPayment(null);
        }}
      />

      {/* Mobile Sidebar Overlay */}
      {showSidebar && <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" style={{ zIndex: 1040 }} onClick={() => setShowSidebar(false)} />}
      
      {/* Sidebar */}
      <div className={`position-fixed top-0 start-0 h-100 d-flex flex-column flex-shrink-0 ${showSidebar ? "" : "d-none d-lg-flex"}`} style={{ width: 256, zIndex: 1045, background: "#ffffff", overflowY: "auto", boxShadow: "2px 0 8px rgba(0,0,0,0.1)" }}>
        <div className="p-4 d-flex flex-column align-items-center border-bottom" style={{ borderColor: "#f1f5f9" }}>
          <Image src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle mb-3 sidebar-brand-logo" width={180} height={180} />
          <div className="text-center">
            <div className="fw-bold" style={{ fontSize: "1.1rem", color: "#1f2937" }}>Accounting</div>
            <div className="small" style={{ color: "#6b7280" }}>Payment Management</div>
          </div>
        </div>

        <nav className="flex-grow-1 px-3 py-3 d-flex flex-column gap-2">
          <button 
            onClick={() => router.push("/accounting/dashboard")}
            className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0"
            style={{ color: "#4b5563", background: "transparent" }}
          >
            <Icon name="activity" size={20} />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => router.push("/accounting/dashboard")}
            className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0"
            style={{ color: "#4b5563", background: "transparent" }}
          >
            <Icon name="file" size={20} />
            <span>Document Payments</span>
          </button>
          
          <div className="border-top my-2" style={{ borderColor: "#f1f5f9" }}></div>
          
          <button 
            onClick={() => router.push("/accounting/dashboard")}
            className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0"
            style={{ color: "#4b5563", background: "transparent" }}
          >
            <Icon name="settings" size={20} />
            <span>Fee Settings</span>
          </button>
          <button 
            onClick={() => router.push("/accounting/dashboard")}
            className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0"
            style={{ color: "#4b5563", background: "transparent" }}
          >
            <Icon name="users" size={20} />
            <span>Fee Management</span>
          </button>
          
          <div className="border-top my-2" style={{ borderColor: "#f1f5f9" }}></div>
          
          <button className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0" style={{ color: "#fff", background: "#374151" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            <span>Tuition Payments</span>
          </button>
          <button 
            onClick={() => router.push("/accounting/profile")} 
            className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0" 
            style={{ color: "#4b5563", background: "transparent" }}
          >
            <Icon name="user" size={20} />
            <span>My Profile</span>
          </button>
        </nav>

        <div className="px-3 py-4 border-top" style={{ borderColor: "#f1f5f9" }}>
          <button onClick={() => {
            localStorage.clear();
            router.push("/login");
          }} className="btn w-100 fw-bold py-3 d-flex align-items-center justify-content-center gap-2" style={{ background: "#374151", color: "#fff", border: "none", fontSize: "1rem" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: 256 }} className="d-none d-lg-block">
        <div className="min-vh-100" style={{ background: "#f5f5f5" }}>
          <header style={{ background: "linear-gradient(135deg,#374151 0%,#4b5563 100%)", padding: "24px 0" }}>
            <div className="container-fluid px-4">
              <h1 className="fw-bold text-white mb-1" style={{ fontSize:"1.8rem" }}>Tuition Payment Records</h1>
              <p className="mb-0 text-white-50" style={{ fontSize: 15 }}>Manage and record student tuition payments</p>
            </div>
          </header>

          <main className="container-fluid px-4 py-4">
            {/* Summary Statistics */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="card b
                order-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <p className="text-muted mb-2 fw-semibold" style={{ fontSize: 14 }}>Students with Balance</p>
                    <h2 className="mb-0 fw-bold" style={{ fontSize: 36, color: "#f59e0b" }}>{stats.students_with_balance || 0}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <p className="text-muted mb-2 fw-semibold" style={{ fontSize: 14 }}>Total Payments</p>
                    <h2 className="mb-0 fw-bold" style={{ fontSize: 36, color: "#3b82f6" }}>{stats.verified_count}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <p className="text-muted mb-2 fw-semibold" style={{ fontSize: 14 }}>Paid Students</p>
                    <h2 className="mb-0 fw-bold" style={{ fontSize: 36, color: "#10b981" }}>
                      {studentBalances.filter((s: any) => parseFloat(s.balance) <= 0).length}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <p className="text-muted mb-2 fw-semibold" style={{ fontSize: 14 }}>Total Collected</p>
                    <h2 className="mb-0 fw-bold" style={{ fontSize: 32, color: "#059669" }}>
                      ₱{Number(stats.total_verified_amount).toLocaleString()}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-0">
                <div className="d-flex border-bottom">
                  <button
                    className={`flex-grow-1 btn btn-lg fw-semibold rounded-0 border-0 ${activeTab === "balances" ? "border-bottom border-3" : ""}`}
                    onClick={() => setActiveTab("balances")}
                    style={activeTab === "balances" ? { borderColor: "#dc2626 !important", color: "#dc2626" } : { color: "#6b7280" }}
                  >
                    Student Balances ({stats.students_with_balance || studentBalances.length})
                  </button>
                  <button
                    className={`flex-grow-1 btn btn-lg fw-semibold rounded-0 border-0 ${activeTab === "payments" ? "border-bottom border-3" : ""}`}
                    onClick={() => setActiveTab("payments")}
                    style={activeTab === "payments" ? { borderColor: "#dc2626 !important", color: "#dc2626" } : { color: "#6b7280" }}
                  >
                    Payment History ({payments.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Student Balances Tab */}
            {activeTab === "balances" && (
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Student Payment Status</h5>
                    <button 
                      className="btn btn-lg fw-bold text-white"
                      onClick={() => setShowRecordModal(true)}
                      style={{ background: "#dc2626" }}
                    >
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="me-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                      </svg>
                      Record Payment
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Student ID</th>
                          <th>Name</th>
                          <th>Grade & Pathway</th>
                          <th className="text-end">Total Assessment</th>
                          <th className="text-end">Amount Paid</th>
                          <th className="text-end">Balance</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={7} className="text-center py-5">
                              <div className="spinner-border text-primary" role="status"></div>
                            </td>
                          </tr>
                        ) : studentBalances.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-5 text-muted">
                              No students with assessments found
                            </td>
                          </tr>
                        ) : (
                          studentBalances.map((student: any) => {
                            const balance = parseFloat(student.balance);
                            const isPaid = balance <= 0;
                            const isPartial = balance > 0 && parseFloat(student.total_paid) > 0;
                            
                            return (
                              <tr key={student.student_id}>
                                <td className="fw-medium">{student.student_id}</td>
                                <td>{student.full_name}</td>
                                <td>
                                  <span className="badge bg-light text-dark">
                                    Grade {student.grade_level} • {student.pathway}
                                  </span>
                                </td>
                                <td className="text-end">₱{Number(student.net_assessment).toLocaleString()}</td>
                                <td className="text-end text-success fw-semibold">
                                  ₱{Number(student.total_paid).toLocaleString()}
                                </td>
                                <td className="text-end fw-bold" style={{ color: isPaid ? "#10b981" : "#dc2626" }}>
                                  ₱{Math.max(0, balance).toLocaleString()}
                                </td>
                                <td>
                                  {isPaid ? (
                                    <span className="badge fw-semibold px-3 py-2" style={{ background: "#d1fae5", color: "#059669" }}>
                                      Paid
                                    </span>
                                  ) : isPartial ? (
                                    <span className="badge fw-semibold px-3 py-2" style={{ background: "#fef3c7", color: "#d97706" }}>
                                      Partial
                                    </span>
                                  ) : (
                                    <span className="badge fw-semibold px-3 py-2" style={{ background: "#fee2e2", color: "#dc2626" }}>
                                      Unpaid
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Payments Table */}
            {activeTab === "payments" && (
              <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                  <div className="d-flex gap-3">
                    <button 
                      className={`btn btn-lg fw-semibold ${filter === "all" ? "text-white" : "btn-outline-secondary"}`}
                      onClick={() => setFilter("all")}
                      style={filter === "all" ? { background: "#dc2626" } : {}}
                    >
                      All ({payments.length})
                    </button>
                    <button 
                      className={`btn btn-lg fw-semibold ${filter === "pending" ? "text-white" : "btn-outline-secondary"}`}
                      onClick={() => setFilter("pending")}
                      style={filter === "pending" ? { background: "#f59e0b" } : {}}
                    >
                      Pending ({stats.pending_count})
                    </button>
                    <button 
                      className={`btn btn-lg fw-semibold ${filter === "verified" ? "text-white" : "btn-outline-secondary"}`}
                      onClick={() => setFilter("verified")}
                      style={filter === "verified" ? { background: "#10b981" } : {}}
                    >
                      Verified ({stats.verified_count})
                    </button>
                  </div>
                  
                  <div className="d-flex gap-3 align-items-center">
                    <input 
                      type="search" 
                      className="form-control form-control-lg" 
                      style={{ minWidth: 300, maxWidth: 450 }} 
                      placeholder="Search student, ID, or fee..." 
                      value={search} 
                      onChange={(e) => setSearch(e.target.value)} 
                    />
                  </div>
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
                          <th className="fw-bold py-3 text-dark">Student ID</th>
                          <th className="fw-bold py-3 text-dark">Student Name</th>
                          <th className="fw-bold py-3 text-dark">Fee Item</th>
                          <th className="fw-bold py-3 text-dark">Amount Paid</th>
                          <th className="fw-bold py-3 text-dark">Payment Date</th>
                          <th className="fw-bold py-3 text-dark">Payment Method</th>
                          <th className="fw-bold py-3 text-dark">Status</th>
                          <th className="fw-bold py-3 text-dark">Actions</th>
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
                            <td className="py-3">{payment.payment_method || "—"}</td>
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
                              <button 
                                onClick={() => handleViewDetails(payment)}
                                className="btn btn-sm btn-outline-primary fw-semibold"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={8} className="text-center py-5">
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
            )}
          </main>
        </div>
      </div>

      {/* Mobile View */}
      <div className="d-lg-none">
        <div className="min-vh-100" style={{ background: "#f5f5f5" }}>
          <header style={{ background: "linear-gradient(135deg,#dc2626 0%,#ef4444 100%)", padding: "24px 0", position: "relative" }}>
            <button className="btn position-absolute top-0 start-0 m-3" onClick={() => setShowSidebar(true)} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }}>
              <Icon name="menu" size={20} />
            </button>
            <div className="container-fluid px-4" style={{ paddingTop: 40 }}>
              <h3 className="mb-0 fw-bold text-white" style={{ fontSize: "1.3rem" }}>Tuition Payments</h3>
              <p className="mb-0 text-white-50" style={{ fontSize: 14 }}>Manage payment records</p>
            </div>
          </header>

          <main className="container-fluid px-3 py-4">
            <div className="d-flex gap-2 mb-3">
              <button 
                className="btn btn-primary fw-bold flex-grow-1"
                style={{ background: "#dc2626", border: "none" }}
                onClick={() => setShowRecordModal(true)}
              >
                + Record Payment
              </button>
            </div>

            {/* Mobile Stats */}
            <div className="row g-2 mb-3">
              <div className="col-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-3">
                    <div className="small text-muted">Total</div>
                    <div className="fw-bold fs-4">{stats.total_count}</div>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-3">
                    <div className="small text-muted">Verified</div>
                    <div className="fw-bold fs-4 text-success">{stats.verified_count}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Filters and Search */}
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body p-3">
                <input 
                  type="search" 
                  className="form-control mb-2"
                  placeholder="Search..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                />
                <div className="d-flex gap-2">
                  <button 
                    className={`btn btn-sm flex-grow-1 ${filter === "all" ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setFilter("all")}
                  >
                    All
                  </button>
                  <button 
                    className={`btn btn-sm flex-grow-1 ${filter === "pending" ? "btn-warning" : "btn-outline-secondary"}`}
                    onClick={() => setFilter("pending")}
                  >
                    Pending
                  </button>
                  <button 
                    className={`btn btn-sm flex-grow-1 ${filter === "verified" ? "btn-success" : "btn-outline-secondary"}`}
                    onClick={() => setFilter("verified")}
                  >
                    Verified
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Payment Cards */}
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" />
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="card border-0 shadow-sm">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="fw-bold">{payment.student_name || payment.student_id}</div>
                          <div className="small text-muted">{payment.fee_item}</div>
                        </div>
                        {payment.status === "verified" ? (
                          <span className="badge bg-success">Verified</span>
                        ) : (
                          <span className="badge bg-warning text-dark">Pending</span>
                        )}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="fw-bold text-primary fs-5">
                          ₱{Number(payment.amount).toLocaleString()}
                        </div>
                        <button 
                          onClick={() => handleViewDetails(payment)}
                          className="btn btn-sm btn-outline-primary"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredPayments.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted">No payments found</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
