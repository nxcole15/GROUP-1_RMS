"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getAcademicConfig, type AcademicConfig } from "../../lib/auth";

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

type DocumentPaymentRecord = {
  id: number;
  student_name: string;
  student_email: string;
  document_type: string;
  payment_amount: number;
  pickup_date: string;
  pickup_time: string;
  pickup_location: string;
  created_at: string;
  status: string;
  accounting_verified_at?: string;
  accounting_verified_by_name?: string;
  payment_reference?: string;
};

type FeeItem = {
  id: number;
  item_name: string;
  description: string | null;
  default_amount: number;
  is_active: number;
  created_by: string;
  created_at: string;
};

type Student = {
  student_id: string;
  full_name: string;
  grade_level: number;
  pathway: string;
  email: string;
  assessment_id: number | null;
  total_assessment: number | null;
  net_assessment: number | null;
  total_paid: number;
  balance: number;
};

type IconName = "activity" | "menu" | "file" | "settings" | "users" | "plus" | "edit" | "trash" | "x" | "archive";

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
    case "plus": return <svg {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case "edit": return <svg {...props}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case "trash": return <svg {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>;
    case "x": return <svg {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case "archive": return <svg {...props}><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>;
    default: return <svg {...props}><circle cx="12" cy="12" r="10"/></svg>;
  }
}

export default function AccountingDashboardPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [documentPayments, setDocumentPayments] = useState<DocumentPaymentRecord[]>([]);
  const [documentStats, setDocumentStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "verified">("all");
  const [documentFilter, setDocumentFilter] = useState<"all" | "needs_verification" | "verified" | "completed">("all");
  const [search, setSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentPaymentRecord | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [activeView, setActiveView] = useState<"overview" | "documents" | "fee-items" | "fee-management">("overview");
  const [academicConfig, setAcademicConfig] = useState<AcademicConfig | null>(null);
  const [accountingName, setAccountingName] = useState<string>("");
  
  // Fee Items Management
  const [feeItems, setFeeItems] = useState<FeeItem[]>([]);
  const [showAddFeeItemModal, setShowAddFeeItemModal] = useState(false);
  const [showEditFeeItemModal, setShowEditFeeItemModal] = useState(false);
  const [selectedFeeItem, setSelectedFeeItem] = useState<FeeItem | null>(null);
  const [newFeeItem, setNewFeeItem] = useState({ item_name: "", description: "", default_amount: "" });
  
  // Fee Management (Student Assessments)
  const [students, setStudents] = useState<Student[]>([]);
  const [feeStats, setFeeStats] = useState<any>({});
  const [showAssignFeesModal, setShowAssignFeesModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedFees, setSelectedFees] = useState<{fee_item_id: number; amount: string}[]>([]);
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [assessmentNotes, setAssessmentNotes] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Helper function to format time to 12-hour format
  const formatTime = (time24: string) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  useEffect(() => {
    const role = localStorage.getItem("inform_role");
    if (role !== "accounting") {
      router.replace("/login");
      return;
    }
    loadPayments();
    loadFeeItems();
    
    // Fetch academic config
    getAcademicConfig().then(config => {
      setAcademicConfig(config);
      // Load students after getting config
      if (config) {
        loadStudents();
      }
    });
    
    // Get accounting user name from localStorage
    const user = localStorage.getItem("inform_user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setAccountingName(parsed.full_name || "Accounting User");
      } catch (e) {
        setAccountingName("Accounting User");
      }
    }
  }, [router]);

  async function loadPayments() {
    try {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      
      // Load tuition payments
      const res = await fetch(`${API_BASE}/api/payments`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPayments(data.payments || []);
      }
      
      // Load all document payments with stats
      const docRes = await fetch(`${API_BASE}/api/admin/documents/accounting/all`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` }
      });
      const docData = await docRes.json();
      if (docRes.ok) {
        setDocumentPayments(docData.documents || []);
        setDocumentStats(docData.stats || {});
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadFeeItems() {
    try {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/fees/items`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFeeItems(data.fee_items || []);
      }
    } catch (err) {
      console.error("Failed to load fee items:", err);
    }
  }

  async function loadStudents() {
    try {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const schoolYear = academicConfig?.school_year || "2026-2027";
      const term = academicConfig?.current_term || "Term 1";
      
      const res = await fetch(`${API_BASE}/api/fees/students?school_year=${schoolYear}&term=${term}`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStudents(data.students || []);
        setFeeStats(data.stats || {});
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    }
  }

  async function handleCreateFeeItem() {
    if (!newFeeItem.item_name.trim()) {
      alert("Fee item name is required");
      return;
    }

    if (!newFeeItem.default_amount || parseFloat(newFeeItem.default_amount) < 0) {
      alert("Default amount is required and must be non-negative");
      return;
    }

    try {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/fees/items`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newFeeItem)
      });

      if (res.ok) {
        setShowAddFeeItemModal(false);
        setNewFeeItem({ item_name: "", description: "", default_amount: "" });
        await loadFeeItems();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create fee item");
      }
    } catch (err) {
      console.error("Failed to create fee item:", err);
      alert("Failed to create fee item");
    }
  }

  async function handleUpdateFeeItem() {
    if (!selectedFeeItem || !selectedFeeItem.item_name.trim()) {
      alert("Fee item name is required");
      return;
    }

    if (selectedFeeItem.default_amount < 0) {
      alert("Default amount must be non-negative");
      return;
    }

    try {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/fees/items/${selectedFeeItem.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          item_name: selectedFeeItem.item_name,
          description: selectedFeeItem.description,
          default_amount: selectedFeeItem.default_amount
        })
      });

      if (res.ok) {
        setShowEditFeeItemModal(false);
        setSelectedFeeItem(null);
        await loadFeeItems();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update fee item");
      }
    } catch (err) {
      console.error("Failed to update fee item:", err);
      alert("Failed to update fee item");
    }
  }

  async function handleArchiveFeeItem(id: number, name: string) {
    if (!confirm(`Are you sure you want to archive "${name}"?\n\nThis will:\n• Mark it as inactive (won't show in new assignments)\n• Remove it from all student assessments\n• Recalculate their totals\n\nThe item stays in database for records.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/fees/items/${id}/archive`, {
        method: "PATCH",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        await loadFeeItems();
        
        // Refresh students list if we're on the fee-management view
        if (activeView === "fee-management") {
          await loadStudents();
        }
        
        // Show info about affected assessments
        if (data.affected_assessments > 0) {
          alert(`Fee item archived successfully!\n\n${data.info}`);
        }
      } else {
        alert("Failed to archive fee item");
      }
    } catch (err) {
      console.error("Failed to archive fee item:", err);
      alert("Failed to archive fee item");
    }
  }

  async function handleDeleteFeeItem(id: number, name: string) {
    if (!confirm(`⚠️ PERMANENT DELETE\n\nAre you sure you want to permanently delete "${name}"?\n\nThis will:\n• Remove it from all student assessments\n• Recalculate their totals\n• PERMANENTLY delete from database\n\nThis CANNOT be undone!\n\nTip: Use "Archive" instead to keep records.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/fees/items/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        await loadFeeItems();
        
        // Refresh students list if we're on the fee-management view
        if (activeView === "fee-management") {
          await loadStudents();
        }
        
        // Show info about affected assessments
        if (data.affected_assessments > 0) {
          alert(`Fee item permanently deleted!\n\n${data.info}`);
        }
      } else {
        alert("Failed to delete fee item");
      }
    } catch (err) {
      console.error("Failed to delete fee item:", err);
      alert("Failed to delete fee item");
    }
  }

  function openAssignFeesModal(student: Student) {
    setSelectedStudent(student);
    
    // If student has existing assessment, load it
    if (student.assessment_id) {
      loadExistingAssessment(student.student_id);
    } else {
      // New assessment - start fresh
      setSelectedFees([]);
      setDiscountAmount("");
      setDiscountReason("");
      setAssessmentNotes("");
    }
    
    setShowAssignFeesModal(true);
  }

  async function loadExistingAssessment(student_id: string) {
    try {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const schoolYear = academicConfig?.school_year || "2026-2027";
      const term = academicConfig?.current_term || "Term 1";
      
      const res = await fetch(`${API_BASE}/api/fees/students/${student_id}/assessment?school_year=${schoolYear}&term=${term}`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.assessment) {
          // Pre-fill with existing line items
          const existingFees = data.assessment.line_items.map((item: any) => ({
            fee_item_id: item.fee_item_id,
            amount: item.amount.toString()
          }));
          setSelectedFees(existingFees);
          setDiscountAmount(data.assessment.discount_amount > 0 ? data.assessment.discount_amount.toString() : "");
          setDiscountReason(data.assessment.discount_reason || "");
          setAssessmentNotes(data.assessment.notes || "");
        }
      }
    } catch (err) {
      console.error("Failed to load existing assessment:", err);
    }
  }

  function toggleFeeItem(item: FeeItem, checked: boolean) {
    if (checked) {
      // Pre-fill with default_amount from the fee item
      setSelectedFees([...selectedFees, { fee_item_id: item.id, amount: item.default_amount.toString() }]);
    } else {
      setSelectedFees(selectedFees.filter(f => f.fee_item_id !== item.id));
    }
  }

  function updateFeeAmount(feeItemId: number, amount: string) {
    setSelectedFees(selectedFees.map(f => 
      f.fee_item_id === feeItemId ? { ...f, amount } : f
    ));
  }

  function calculateTotal() {
    return selectedFees.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);
  }

  async function handleAssignFees() {
    if (!selectedStudent) return;
    
    const validFees = selectedFees.filter(f => parseFloat(f.amount) > 0);
    if (validFees.length === 0) {
      alert("Please add at least one fee item with an amount");
      return;
    }

    try {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const schoolYear = academicConfig?.school_year || "2026-2027";
      const term = academicConfig?.current_term || "Term 1";

      const res = await fetch(`${API_BASE}/api/fees/students/${selectedStudent.student_id}/assign`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          school_year: schoolYear,
          term,
          line_items: validFees.map(f => ({
            fee_item_id: f.fee_item_id,
            amount: parseFloat(f.amount)
          })),
          discount_amount: parseFloat(discountAmount) || 0,
          discount_reason: discountReason.trim() || null,
          notes: assessmentNotes.trim() || null
        })
      });

      if (res.ok) {
        setShowAssignFeesModal(false);
        setSelectedStudent(null);
        await loadStudents();
        alert("Fees assigned successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to assign fees");
      }
    } catch (err) {
      console.error("Failed to assign fees:", err);
      alert("Failed to assign fees");
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

  async function handleVerifyDocumentPayment() {
    if (!selectedDoc) return;
    
    try {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/admin/documents/${selectedDoc.id}/accounting-verify-payment`, {
        method: "POST",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ payment_reference: `PAY-${Date.now()}` }) // Auto-generate reference
      });
      
      if (res.ok) {
        setShowVerifyModal(false);
        setSelectedDoc(null);
        await loadPayments();
      }
    } catch (err) {
      console.error("Failed to verify document payment:", err);
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

  // Filter document payments
  const filteredDocumentPayments = documentPayments.filter(doc => {
    if (documentFilter === "needs_verification") return doc.status === "pending_payment";
    if (documentFilter === "verified") return doc.status === "payment_verified";
    if (documentFilter === "completed") return doc.status === "released";
    return true; // "all"
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, {bg: string; text: string; label: string}> = {
      pending_payment: { bg: "#fef3c7", text: "#92400e", label: "Needs Verification" },
      payment_verified: { bg: "#d1fae5", text: "#065f46", label: "Payment Verified" },
      released: { bg: "#f1f5f9", text: "#475569", label: "Picked Up" },
    };
    const info = statusMap[status] || { bg: "#f3f4f6", text: "#374151", label: status };
    return <span className="badge px-3 py-2 rounded-pill" style={{ background: info.bg, color: info.text, fontSize: "0.75rem", fontWeight: 600 }}>{info.label}</span>;
  };

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
          <button 
            onClick={() => setActiveView("overview")}
            className={`btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0`}
            style={{ color: activeView === "overview" ? "#fff" : "rgba(255,255,255,0.7)", background: activeView === "overview" ? "#3b82f6" : "transparent" }}
          >
            <Icon name="activity" size={20} />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => setActiveView("documents")}
            className={`btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0`}
            style={{ color: activeView === "documents" ? "#fff" : "rgba(255,255,255,0.7)", background: activeView === "documents" ? "#3b82f6" : "transparent" }}
          >
            <Icon name="file" size={20} />
            <span>Document Payments</span>
            {documentStats.needs_verification > 0 && (
              <span className="badge bg-warning text-dark ms-auto">{documentStats.needs_verification}</span>
            )}
          </button>
          
          {/* Divider */}
          <div className="border-top border-white border-opacity-10 my-2"></div>
          
          <button 
            onClick={() => setActiveView("fee-items")}
            className={`btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0`}
            style={{ color: activeView === "fee-items" ? "#fff" : "rgba(255,255,255,0.7)", background: activeView === "fee-items" ? "#3b82f6" : "transparent" }}
          >
            <Icon name="settings" size={20} />
            <span>Fee Settings</span>
          </button>
          <button 
            onClick={() => setActiveView("fee-management")}
            className={`btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0`}
            style={{ color: activeView === "fee-management" ? "#fff" : "rgba(255,255,255,0.7)", background: activeView === "fee-management" ? "#3b82f6" : "transparent" }}
          >
            <Icon name="users" size={20} />
            <span>Fee Management</span>
            {feeStats.pending_assessment > 0 && (
              <span className="badge bg-warning text-dark ms-auto">{feeStats.pending_assessment}</span>
            )}
          </button>
          
          {/* Divider */}
          <div className="border-top border-white border-opacity-10 my-2"></div>
          
          <button onClick={() => router.push("/accounting/payments")} className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0" style={{ color: "rgba(255,255,255,0.7)", background: "transparent" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            <span>Tuition Payments</span>
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
          <header style={{ background: "linear-gradient(135deg,#3b82f6 0%,#60a5fa 100%)", padding: "32px 0 80px", position: "relative", overflow: "hidden" }}>
            {/* Decorative circles */}
            <div style={{ position:"absolute", top:-50, right:-50, width:230, height:230, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
            <div style={{ position:"absolute", bottom:-60, right:180, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
            <div style={{ position:"absolute", top:30, right:90, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />
            
            <div className="container-fluid px-4" style={{ position: "relative", zIndex: 1 }}>
              <h1 className="fw-bold text-white mb-1" style={{ fontSize:"1.8rem" }}>
                Welcome back, {accountingName || "Accounting User"}
              </h1>
              <p className="mb-3" style={{ color:"rgba(255,255,255,0.72)", fontSize:14 }}>
                Accounting · Full Access · {academicConfig?.current_term || "Term 1"} · SY {academicConfig?.school_year || "2026-2027"}
              </p>
              <div className="d-flex gap-2 flex-wrap">
                <span className="badge px-3 py-2 rounded-pill" style={{ background:"rgba(255,255,255,0.18)", color:"white", border:"1px solid rgba(255,255,255,0.3)", fontSize:"0.78rem" }}>
                  ✅ System Online
                </span>
                <span className="badge px-3 py-2 rounded-pill" style={{ background:"rgba(255,255,255,0.13)", color:"white", border:"1px solid rgba(255,255,255,0.22)", fontSize:"0.78rem" }}>
                  💰 Payment Management
                </span>
              </div>
            </div>
          </header>

          <main className="container-fluid px-4" style={{ marginTop: "-52px", paddingBottom: 32 }}>
            {activeView === "overview" && (
              <>
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
            </>
            )}

            {activeView === "documents" && (
              <>
                {/* Stats Cards */}
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100" style={{ overflow:"hidden" }}>
                      <div className="card-body p-4">
                        <p className="text-muted mb-2 fw-semibold" style={{ fontSize: 14 }}>Needs Verification</p>
                        <h2 className="mb-3 fw-bold" style={{ fontSize: 42, color: "#f59e0b", lineHeight: 1 }}>{documentStats.needs_verification || 0}</h2>
                        <p className="text-muted mb-0" style={{ fontSize: 14 }}>₱{(documentStats.pending_amount || 0).toLocaleString()}</p>
                      </div>
                      <div style={{ height:3, background:"linear-gradient(135deg,#f59e0b,#fbbf24)" }} />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100" style={{ overflow:"hidden" }}>
                      <div className="card-body p-4">
                        <p className="text-muted mb-2 fw-semibold" style={{ fontSize: 14 }}>Verified Payments</p>
                        <h2 className="mb-3 fw-bold" style={{ fontSize: 42, color: "#10b981", lineHeight: 1 }}>{documentStats.verified || 0}</h2>
                        <p className="text-muted mb-0" style={{ fontSize: 14 }}>Ready for pickup</p>
                      </div>
                      <div style={{ height:3, background:"linear-gradient(135deg,#10b981,#34d399)" }} />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100" style={{ overflow:"hidden" }}>
                      <div className="card-body p-4">
                        <p className="text-muted mb-2 fw-semibold" style={{ fontSize: 14 }}>Completed</p>
                        <h2 className="mb-3 fw-bold" style={{ fontSize: 42, color: "#6b7280", lineHeight: 1 }}>{documentStats.completed || 0}</h2>
                        <p className="text-muted mb-0" style={{ fontSize: 14 }}>Already picked up</p>
                      </div>
                      <div style={{ height:3, background:"linear-gradient(135deg,#6b7280,#9ca3af)" }} />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100" style={{ overflow:"hidden" }}>
                      <div className="card-body p-4">
                        <p className="text-muted mb-2 fw-semibold" style={{ fontSize: 14 }}>Total Verified</p>
                        <h2 className="mb-3 fw-bold" style={{ fontSize: 36, color: "#3b82f6", lineHeight: 1 }}>₱{(documentStats.verified_amount || 0).toLocaleString()}</h2>
                        <p className="text-muted mb-0" style={{ fontSize: 14 }}>Revenue collected</p>
                      </div>
                      <div style={{ height:3, background:"linear-gradient(135deg,#3b82f6,#60a5fa)" }} />
                    </div>
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="card border-0 shadow-sm rounded-3 mb-4">
                  <div className="card-body p-3">
                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        onClick={() => setDocumentFilter("all")}
                        className={`btn ${documentFilter === "all" ? "btn-primary" : "btn-outline-primary"} d-flex align-items-center gap-2`}
                      >
                        All Documents
                        <span className={`badge ${documentFilter === "all" ? "bg-white text-primary" : "bg-primary text-white"} ms-1`}>
                          {documentPayments.length}
                        </span>
                      </button>
                      <button
                        onClick={() => setDocumentFilter("needs_verification")}
                        className={`btn ${documentFilter === "needs_verification" ? "btn-warning" : "btn-outline-warning"} d-flex align-items-center gap-2`}
                      >
                        Needs Verification
                        <span className={`badge ${documentFilter === "needs_verification" ? "bg-white text-warning" : "bg-warning text-white"} ms-1`}>
                          {documentStats.needs_verification || 0}
                        </span>
                      </button>
                      <button
                        onClick={() => setDocumentFilter("verified")}
                        className={`btn ${documentFilter === "verified" ? "btn-success" : "btn-outline-success"} d-flex align-items-center gap-2`}
                      >
                        Verified
                        <span className={`badge ${documentFilter === "verified" ? "bg-white text-success" : "bg-success text-white"} ms-1`}>
                          {documentStats.verified || 0}
                        </span>
                      </button>
                      <button
                        onClick={() => setDocumentFilter("completed")}
                        className={`btn ${documentFilter === "completed" ? "btn-secondary" : "btn-outline-secondary"} d-flex align-items-center gap-2`}
                      >
                        Completed
                        <span className={`badge ${documentFilter === "completed" ? "bg-white text-secondary" : "bg-secondary text-white"} ms-1`}>
                          {documentStats.completed || 0}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Document Cards */}
                <div className="row g-4">
                  {filteredDocumentPayments.length === 0 ? (
                    <div className="col-12">
                      <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body text-center py-5">
                          <Icon name="file" size={48} />
                          <div className="fw-semibold mt-3">No documents found</div>
                          <div className="text-muted small">
                            {documentFilter === "all" && "No document payment requests at this time"}
                            {documentFilter === "needs_verification" && "All document payments have been verified"}
                            {documentFilter === "verified" && "No verified payments waiting for pickup"}
                            {documentFilter === "completed" && "No completed documents yet"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    filteredDocumentPayments.map(doc => (
                      <div key={doc.id} className="col-12 col-lg-6">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                          <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div className="flex-grow-1">
                                <div className="fw-bold text-dark mb-1">{doc.student_name}</div>
                                <div className="text-muted small">{doc.document_type}</div>
                                <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                                  {doc.student_email}
                                </div>
                              </div>
                              {getStatusBadge(doc.status)}
                            </div>

                            {/* Payment Amount */}
                            <div className="alert alert-light border mb-3 py-2 px-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <div className="small text-muted">Payment Amount:</div>
                                <div className="fw-bold text-warning fs-5">₱{parseFloat(String(doc.payment_amount)).toFixed(2)}</div>
                              </div>
                            </div>

                            {/* Pickup Details */}
                            {doc.pickup_date && (
                              <div className="small text-muted mb-3">
                                <div>📅 Pickup: {new Date(doc.pickup_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })} at {formatTime(doc.pickup_time)}</div>
                                <div>📍 {doc.pickup_location}</div>
                              </div>
                            )}

                            {/* Verified Info */}
                            {doc.status === "payment_verified" || doc.status === "released" ? (
                              <div className="alert alert-success mb-3 py-2 px-3">
                                <div className="small">
                                  <div className="fw-semibold">✓ Payment Verified</div>
                                  {doc.accounting_verified_at && (
                                    <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                                      {new Date(doc.accounting_verified_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                      {doc.accounting_verified_by_name && ` by ${doc.accounting_verified_by_name}`}
                                    </div>
                                  )}
                                  {doc.payment_reference && (
                                    <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                                      Ref: {doc.payment_reference}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : null}

                            {/* Action Button */}
                            {doc.status === "pending_payment" && (
                              <button
                                onClick={() => {
                                  setSelectedDoc(doc);
                                  setShowVerifyModal(true);
                                }}
                                className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
                              >
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                                </svg>
                                Verify Payment
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* Fee Items (Settings) View */}
            {activeView === "fee-items" && (
              <>
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h3 className="fw-bold mb-1" style={{ fontSize:"1.2rem", color:"#1e293b" }}>Fee Settings</h3>
                        <p className="text-muted mb-0 small">Manage fee items that can be assigned to students</p>
                      </div>
                      <button
                        onClick={() => setShowAddFeeItemModal(true)}
                        className="btn btn-primary d-flex align-items-center gap-2"
                      >
                        <Icon name="plus" size={16} />
                        Add Fee Item
                      </button>
                    </div>

                    {loading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : feeItems.length === 0 ? (
                      <div className="text-center py-5">
                        <Icon name="settings" size={48} />
                        <div className="fw-semibold mt-3">No fee items yet</div>
                        <div className="text-muted small">Create fee items that can be assigned to students</div>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle">
                          <thead style={{ background: "#f8fafc" }}>
                            <tr>
                              <th className="fw-semibold small text-muted">Fee Item Name</th>
                              <th className="fw-semibold small text-muted">Description</th>
                              <th className="fw-semibold small text-muted text-end">Default Amount</th>
                              <th className="fw-semibold small text-muted">Status</th>
                              <th className="fw-semibold small text-muted">Created</th>
                              <th className="fw-semibold small text-muted text-end">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {feeItems.map(item => (
                              <tr key={item.id}>
                                <td className="fw-semibold">{item.item_name}</td>
                                <td className="text-muted small">{item.description || "—"}</td>
                                <td className="text-end fw-semibold text-primary">₱{parseFloat(String(item.default_amount)).toLocaleString()}</td>
                                <td>
                                  <span className={`badge ${item.is_active ? "bg-success" : "bg-secondary"}`}>
                                    {item.is_active ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td className="text-muted small">
                                  {new Date(item.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                                </td>
                                <td className="text-end">
                                  <button
                                    onClick={() => {
                                      setSelectedFeeItem(item);
                                      setShowEditFeeItemModal(true);
                                    }}
                                    className="btn btn-sm btn-outline-primary me-2"
                                    title="Edit"
                                  >
                                    <Icon name="edit" size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleArchiveFeeItem(item.id, item.item_name)}
                                    className="btn btn-sm btn-outline-warning me-2"
                                    title="Archive (soft delete)"
                                  >
                                    <Icon name="archive" size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFeeItem(item.id, item.item_name)}
                                    className="btn btn-sm btn-outline-danger"
                                    title="Delete permanently"
                                  >
                                    <Icon name="trash" size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Fee Management (Student Assessments) View */}
            {activeView === "fee-management" && (
              <>
                {/* Stats */}
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100" style={{ overflow:"hidden" }}>
                      <div className="card-body p-4">
                        <p className="text-muted mb-2 fw-semibold" style={{ fontSize: 14 }}>Total Students</p>
                        <h2 className="mb-3 fw-bold" style={{ fontSize: 42, color: "#3b82f6", lineHeight: 1 }}>{students.length}</h2>
                        <p className="text-muted mb-0" style={{ fontSize: 14 }}>In current term</p>
                      </div>
                      <div style={{ height:3, background:"linear-gradient(135deg,#3b82f6,#60a5fa)" }} />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100" style={{ overflow:"hidden" }}>
                      <div className="card-body p-4">
                        <p className="text-muted mb-2 fw-semibold" style={{ fontSize: 14 }}>With Assessment</p>
                        <h2 className="mb-3 fw-bold" style={{ fontSize: 42, color: "#10b981", lineHeight: 1 }}>{feeStats.with_assessment || 0}</h2>
                        <p className="text-muted mb-0" style={{ fontSize: 14 }}>Fees assigned</p>
                      </div>
                      <div style={{ height:3, background:"linear-gradient(135deg,#10b981,#34d399)" }} />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100" style={{ overflow:"hidden" }}>
                      <div className="card-body p-4">
                        <p className="text-muted mb-2 fw-semibold" style={{ fontSize: 14 }}>Pending</p>
                        <h2 className="mb-3 fw-bold" style={{ fontSize: 42, color: "#f59e0b", lineHeight: 1 }}>{feeStats.pending_assessment || 0}</h2>
                        <p className="text-muted mb-0" style={{ fontSize: 14 }}>No fees assigned</p>
                      </div>
                      <div style={{ height:3, background:"linear-gradient(135deg,#f59e0b,#fbbf24)" }} />
                    </div>
                  </div>
                </div>

                {/* Students Table */}
                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h3 className="fw-bold mb-1" style={{ fontSize:"1.2rem", color:"#1e293b" }}>Student Fee Management</h3>
                        <p className="text-muted mb-0 small">Assign fee assessments to students</p>
                      </div>
                    </div>

                    {loading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : students.length === 0 ? (
                      <div className="text-center py-5">
                        <Icon name="users" size={48} />
                        <div className="fw-semibold mt-3">No students found</div>
                        <div className="text-muted small">No students available in the current term</div>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle">
                          <thead style={{ background: "#f8fafc" }}>
                            <tr>
                              <th className="fw-semibold small text-muted">Student ID</th>
                              <th className="fw-semibold small text-muted">Name</th>
                              <th className="fw-semibold small text-muted">Grade & Pathway</th>
                              <th className="fw-semibold small text-muted text-end">Total Assessment</th>
                              <th className="fw-semibold small text-muted text-end">Paid</th>
                              <th className="fw-semibold small text-muted text-end">Balance</th>
                              <th className="fw-semibold small text-muted text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.map(student => (
                              <tr key={student.student_id}>
                                <td className="fw-semibold small">{student.student_id}</td>
                                <td>
                                  <div className="fw-semibold">{student.full_name}</div>
                                  <div className="text-muted small">{student.email}</div>
                                </td>
                                <td className="small">Grade {student.grade_level} - {student.pathway}</td>
                                <td className="text-end">
                                  {student.net_assessment !== null ? (
                                    <span className="fw-semibold">₱{student.net_assessment.toLocaleString()}</span>
                                  ) : (
                                    <span className="text-muted">—</span>
                                  )}
                                </td>
                                <td className="text-end">
                                  <span className="text-success">₱{student.total_paid.toLocaleString()}</span>
                                </td>
                                <td className="text-end">
                                  {student.balance > 0 ? (
                                    <span className="text-warning fw-semibold">₱{student.balance.toLocaleString()}</span>
                                  ) : (
                                    <span className="text-muted">₱0</span>
                                  )}
                                </td>
                                <td className="text-center">
                                  <button
                                    onClick={() => openAssignFeesModal(student)}
                                    className={`btn btn-sm ${student.assessment_id ? "btn-outline-primary" : "btn-primary"}`}
                                  >
                                    {student.assessment_id ? "Update Fees" : "Assign Fees"}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Add Fee Item Modal */}
      {showAddFeeItemModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowAddFeeItemModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Add New Fee Item</h5>
                <button className="btn-close" onClick={() => setShowAddFeeItemModal(false)}></button>
              </div>
              <div className="modal-body px-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Fee Item Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Tuition Fee, Lab Fee, etc."
                    value={newFeeItem.item_name}
                    onChange={e => setNewFeeItem({ ...newFeeItem, item_name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Default Amount <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text">₱</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0.00"
                      value={newFeeItem.default_amount}
                      onChange={e => setNewFeeItem({ ...newFeeItem, default_amount: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <small className="text-muted">This amount will be pre-filled when assigning to students</small>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Description (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Brief description of this fee item"
                    value={newFeeItem.description}
                    onChange={e => setNewFeeItem({ ...newFeeItem, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-secondary" onClick={() => setShowAddFeeItemModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreateFeeItem}>
                  <Icon name="plus" size={16} /> Create Fee Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Fee Item Modal */}
      {showEditFeeItemModal && selectedFeeItem && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowEditFeeItemModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Edit Fee Item</h5>
                <button className="btn-close" onClick={() => setShowEditFeeItemModal(false)}></button>
              </div>
              <div className="modal-body px-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Fee Item Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedFeeItem.item_name}
                    onChange={e => setSelectedFeeItem({ ...selectedFeeItem, item_name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Default Amount <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text">₱</span>
                    <input
                      type="number"
                      className="form-control"
                      value={selectedFeeItem.default_amount.toString()}
                      onChange={e => setSelectedFeeItem({ ...selectedFeeItem, default_amount: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <small className="text-muted">This amount will be pre-filled when assigning to students</small>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Description (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={selectedFeeItem.description || ""}
                    onChange={e => setSelectedFeeItem({ ...selectedFeeItem, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-secondary" onClick={() => setShowEditFeeItemModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleUpdateFeeItem}>
                  <Icon name="edit" size={16} /> Update Fee Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Fees Modal */}
      {showAssignFeesModal && selectedStudent && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowAssignFeesModal(false)}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <div>
                  <h5 className="modal-title fw-bold">Assign Fees to Student</h5>
                  <p className="text-muted small mb-0">{selectedStudent.full_name} ({selectedStudent.student_id})</p>
                </div>
                <button className="btn-close" onClick={() => setShowAssignFeesModal(false)}></button>
              </div>
              <div className="modal-body px-4" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                {/* Academic Period Info */}
                <div className="alert alert-info mb-4">
                  <small>
                    <strong>📅 Academic Period:</strong> {academicConfig?.school_year || "2026-2027"} · {academicConfig?.current_term || "Term 1"}
                  </small>
                </div>

                {/* Fee Items Selection */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Select Fee Items to Assign</label>
                  {feeItems.filter(item => item.is_active).length === 0 ? (
                    <div className="alert alert-warning">
                      No active fee items available. Please create fee items first.
                    </div>
                  ) : (
                    <div className="border rounded-3 p-3">
                      {feeItems.filter(item => item.is_active).map(item => {
                        const isSelected = selectedFees.some(f => f.fee_item_id === item.id);
                        
                        return (
                          <div key={item.id} className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              style={{ width: 20, height: 20 }}
                              checked={isSelected}
                              onChange={e => toggleFeeItem(item, e.target.checked)}
                            />
                            <div className="flex-grow-1">
                              <div className="fw-semibold">{item.item_name}</div>
                              {item.description && <div className="text-muted small">{item.description}</div>}
                            </div>
                            <div style={{ minWidth: 120, textAlign: "right" }}>
                              <span className="fw-semibold" style={{ color: "#000", fontSize: "1rem" }}>
                                ₱{parseFloat(String(item.default_amount)).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Subtotal */}
                <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded-3" style={{ background: "#f8fafc" }}>
                  <span className="fw-semibold">Subtotal:</span>
                  <span className="fw-bold fs-5">₱{calculateTotal().toLocaleString()}</span>
                </div>

                {/* Discount (Optional) */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Discount Amount (Optional)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0.00"
                    value={discountAmount}
                    onChange={e => setDiscountAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>

                {discountAmount && parseFloat(discountAmount) > 0 && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Discount Reason</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Scholarship, Financial Assistance"
                      value={discountReason}
                      onChange={e => setDiscountReason(e.target.value)}
                    />
                  </div>
                )}

                {/* Net Total */}
                <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded-3" style={{ background: "#e0f2fe", border: "2px solid #3b82f6" }}>
                  <span className="fw-bold">Net Assessment:</span>
                  <span className="fw-bold fs-4 text-primary">
                    ₱{(calculateTotal() - (parseFloat(discountAmount) || 0)).toLocaleString()}
                  </span>
                </div>

                {/* Notes (Optional) */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Additional notes or remarks"
                    value={assessmentNotes}
                    onChange={e => setAssessmentNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-secondary" onClick={() => setShowAssignFeesModal(false)}>Cancel</button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleAssignFees}
                  disabled={selectedFees.filter(f => parseFloat(f.amount) > 0).length === 0}
                >
                  Assign Fees
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Verification Modal - Simplified */}
      {showVerifyModal && selectedDoc && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowVerifyModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Verify Document Payment</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowVerifyModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <Icon name="file" size={48} />
                  </div>
                  <h5 className="fw-bold">{selectedDoc.student_name}</h5>
                  <p className="text-muted mb-0">{selectedDoc.document_type}</p>
                </div>
                
                <div className="alert alert-light border text-center mb-3">
                  <div className="small text-muted mb-1">Amount Paid:</div>
                  <div className="h3 mb-0 text-success">₱{parseFloat(String(selectedDoc.payment_amount)).toFixed(2)}</div>
                </div>

                <div className="alert alert-warning mb-0">
                  <small>
                    <strong>⚠️ Confirm Payment Verification</strong><br/>
                    By clicking "Verify Payment", you confirm that this student has paid the required amount at the Accounting office.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowVerifyModal(false)}>Cancel</button>
                <button 
                  className="btn btn-success" 
                  onClick={handleVerifyDocumentPayment}
                >
                  ✓ Verify Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="d-lg-none">
        <div className="min-vh-100" style={{ background: "#f5f5f5" }}>
          <header style={{ background: "linear-gradient(135deg,#3b82f6 0%,#60a5fa 100%)", padding: "24px 0", position: "relative" }}>
            <button className="btn position-absolute top-0 start-0 m-3" onClick={() => setShowSidebar(true)} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }}>
              <Icon name="menu" size={20} />
            </button>
            <div className="container-fluid px-4" style={{ paddingTop: 40 }}>
              <h3 className="mb-0 fw-bold text-white" style={{ fontSize: "1.3rem" }}>Welcome back, {accountingName || "User"}</h3>
              <p className="mb-0 text-white-50" style={{ fontSize: 14 }}>Accounting · {academicConfig?.current_term || "Term 1"} · SY {academicConfig?.school_year || "2026-2027"}</p>
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
