/**
 * Document Workflow Panel for Admin
 * Handles both Registrar and Principal workflows
 */
"use client";

import React, { useState, useEffect } from "react";
import { API_BASE } from "../lib/auth";

type FilterType = "all" | "needs_action" | "in_progress" | "completed";
type ViewMode = "card" | "list";

export function DocumentWorkflowPanel() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list"); // Default to list view
  const [stats, setStats] = useState<any>({});
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [pickupLocation, setPickupLocation] = useState("Registrar's Office");
  const [pickupInstructions, setPickupInstructions] = useState("");
  const [showDocTypesModal, setShowDocTypesModal] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [editingDocType, setEditingDocType] = useState<any>(null);
  const [docTypeForm, setDocTypeForm] = useState({
    document_name: "",
    price: "",
    processing_days: "",
    description: ""
  });
  
  const role = localStorage.getItem("inform_role");
  const isPrincipal = role === "principal";
  const isRegistrar = role === "registrar" || role === "admin";
  const isAccounting = role === "accounting" || role === "admin";

  // Helper function to format time to 12-hour format
  const formatTime = (time24: string) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  useEffect(() => {
    fetchDocuments();
    if (isRegistrar) {
      fetchDocumentTypes();
    }
  }, []);

  const fetchDocuments = () => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    
    let endpoint = "/api/admin/documents/registrar/all";
    if (isPrincipal) endpoint = "/api/admin/documents/principal/all";
    if (isAccounting) endpoint = "/api/admin/documents/accounting";
    
    fetch(`${API_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.documents) {
          setDocs(data.documents);
          if (data.stats) setStats(data.stats);
        }
      })
      .catch(err => console.error("Failed to fetch documents:", err))
      .finally(() => setLoading(false));
  };

  const handleRegistrarForward = async (id: number) => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    
    const res = await fetch(`${API_BASE}/api/admin/documents/${id}/registrar-forward`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    
    if (res.ok) fetchDocuments();
  };

  const handleMarkAsReady = async (id: number) => {
    if (!confirm("Mark this document as ready for pickup now? This will notify the student immediately.")) {
      return;
    }
    
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    
    const res = await fetch(`${API_BASE}/api/admin/documents/${id}/mark-ready`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    
    if (res.ok) fetchDocuments();
  };

  const handlePrincipalApprove = async (id: number) => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    
    const res = await fetch(`${API_BASE}/api/admin/documents/${id}/principal-approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    
    if (res.ok) fetchDocuments();
  };

  const handlePrincipalReject = async () => {
    if (!selectedDoc || !rejectReason.trim()) return;
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    
    const res = await fetch(`${API_BASE}/api/admin/documents/${selectedDoc.id}/principal-reject`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ rejection_reason: rejectReason }),
    });
    
    if (res.ok) {
      setShowRejectModal(false);
      setRejectReason("");
      fetchDocuments();
    }
  };

  const handleSetPickup = async () => {
    if (!selectedDoc || !pickupDate || !pickupTime) return;
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    
    const res = await fetch(`${API_BASE}/api/admin/documents/${selectedDoc.id}/set-pickup`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ 
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        pickup_location: pickupLocation,
        pickup_instructions: pickupInstructions || null
      }),
    });
    
    if (res.ok) {
      setShowPickupModal(false);
      setPickupDate("");
      setPickupTime("10:00");
      fetchDocuments();
    }
  };

  const handleConfirmPickedUp = async (id: number) => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    
    const res = await fetch(`${API_BASE}/api/admin/documents/${id}/confirm-picked-up`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    
    if (res.ok) fetchDocuments();
  };

  // Document Types Management
  const fetchDocumentTypes = async () => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    
    const res = await fetch(`${API_BASE}/api/admin/document-types`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    
    if (res.ok) {
      const data = await res.json();
      setDocumentTypes(data.document_types || []);
    }
  };

  const handleCreateDocType = async () => {
    if (!docTypeForm.document_name || !docTypeForm.processing_days) {
      alert("Document name and processing days are required.");
      return;
    }

    const token = localStorage.getItem("inform_token");
    if (!token) return;

    const res = await fetch(`${API_BASE}/api/admin/document-types`, {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        document_name: docTypeForm.document_name,
        price: parseFloat(docTypeForm.price) || 0,
        processing_days: docTypeForm.processing_days,
        description: docTypeForm.description
      })
    });

    if (res.ok) {
      fetchDocumentTypes();
      setDocTypeForm({ document_name: "", price: "", processing_days: "", description: "" });
      alert("Document type created successfully!");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to create document type.");
    }
  };

  const handleUpdateDocType = async () => {
    if (!editingDocType) return;

    const token = localStorage.getItem("inform_token");
    if (!token) return;

    const res = await fetch(`${API_BASE}/api/admin/document-types/${editingDocType.id}`, {
      method: "PUT",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        document_name: docTypeForm.document_name,
        price: parseFloat(docTypeForm.price) || 0,
        processing_days: docTypeForm.processing_days,
        description: docTypeForm.description
      })
    });

    if (res.ok) {
      fetchDocumentTypes();
      setEditingDocType(null);
      setDocTypeForm({ document_name: "", price: "", processing_days: "", description: "" });
      alert("Document type updated successfully!");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to update document type.");
    }
  };

  const handleDeleteDocType = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document type? This action cannot be undone.")) {
      return;
    }

    const token = localStorage.getItem("inform_token");
    if (!token) return;

    const res = await fetch(`${API_BASE}/api/admin/document-types/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });

    if (res.ok) {
      fetchDocumentTypes();
      alert("Document type deleted successfully!");
    } else {
      alert("Failed to delete document type.");
    }
  };

  const handleEditDocType = (docType: any) => {
    setEditingDocType(docType);
    setDocTypeForm({
      document_name: docType.document_name,
      price: docType.price.toString(),
      processing_days: docType.processing_days,
      description: docType.description || ""
    });
  };

  // Filter documents based on role needs  
  const needsAction = docs.filter(d => 
    isRegistrar 
      ? (d.status === 'pending_registrar_review' || d.status === 'approved' || d.status === 'ready_for_release')
      : isPrincipal
      ? (d.status === 'pending_principal_approval')
      : isAccounting
      ? (d.status === 'pending_payment_verification')
      : false
  );
  
  const inProgress = docs.filter(d => 
    isRegistrar
      ? (d.status === 'pending_principal_approval' || d.status === 'pending_payment_verification' || d.status === 'pickup_scheduled')
      : isPrincipal
      ? (d.status === 'approved' || d.status === 'pickup_scheduled' || d.status === 'pending_payment_verification' || d.status === 'ready_for_release')
      : isAccounting
      ? (d.status === 'ready_for_release')
      : false
  );
  
  const completed = docs.filter(d => 
    d.status === 'released' || d.status === 'rejected'
  );

  // Filtered documents based on active filter
  const filteredDocs = activeFilter === "needs_action" 
    ? needsAction 
    : activeFilter === "in_progress"
    ? inProgress
    : activeFilter === "completed"
    ? completed
    : docs;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, {bg: string; text: string; label: string}> = {
      pending_registrar_review: { bg: "#fef3c7", text: "#92400e", label: "Pending Registrar" },
      pending_principal_approval: { bg: "#dbeafe", text: "#1e40af", label: "With Principal" },
      approved: { bg: "#d1fae5", text: "#065f46", label: "Principal Approved" },
      rejected: { bg: "#fee2e2", text: "#991b1b", label: "Rejected" },
      pickup_scheduled: { bg: "#fde047", text: "#854d0e", label: "Pickup Scheduled" },
      pending_payment_verification: { bg: "#fef3c7", text: "#92400e", label: "Pending Payment" },
      ready_for_release: { bg: "#d1fae5", text: "#065f46", label: "Ready for Release" },
      released: { bg: "#f1f5f9", text: "#475569", label: "Released" },
    };
    const info = statusMap[status] || { bg: "#f3f4f6", text: "#374151", label: status };
    return <span className="badge px-3 py-2 rounded-pill" style={{ background: info.bg, color: info.text, fontSize: "0.75rem", fontWeight: 600 }}>{info.label}</span>;
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* Simple Header with View Toggle */}
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "#1e293b", fontSize: "1.75rem" }}>Document Requests</h2>
          <p className="mb-0 text-muted">
            {isPrincipal && "Principal Approval Queue"}
            {isRegistrar && "Registrar Management"}
            {isAccounting && "Payment Verification Queue"}
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="d-flex gap-2 align-items-center">
          {/* Manage Document Types Button (Registrar Only) */}
          {isRegistrar && (
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={() => setShowDocTypesModal(true)}
              title="Manage Document Types"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z"/>
              </svg>
              <span className="d-none d-md-inline">Manage Types</span>
            </button>
          )}
          
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${viewMode === 'card' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('card')}
              title="Card View"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
              </svg>
            </button>
            <button
              type="button"
              className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {(isRegistrar || isPrincipal) && (
        <div className="row g-3">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body p-3">
                <div className="small text-muted mb-1">
                  {isRegistrar ? "Needs Action" : "Pending Review"}
                </div>
                <div className="fw-bold fs-3 text-warning">{needsAction.length}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body p-3">
                <div className="small text-muted mb-1">In Progress</div>
                <div className="fw-bold fs-3 text-info">{inProgress.length}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body p-3">
                <div className="small text-muted mb-1">Completed</div>
                <div className="fw-bold fs-3 text-success">{completed.length}</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body p-3">
                <div className="small text-muted mb-1">All Requests</div>
                <div className="fw-bold fs-3 text-primary">{docs.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      {(isRegistrar || isPrincipal) && (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-3">
            <div className="d-flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveFilter("all")}
                className="btn d-flex align-items-center gap-2"
                style={{
                  background: activeFilter === "all" ? "#374151" : "transparent",
                  color: activeFilter === "all" ? "#fff" : "#374151",
                  border: `1px solid ${activeFilter === "all" ? "#374151" : "#d1d5db"}`
                }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z"/>
                </svg>
                All Requests
                <span className={`badge ${activeFilter === "all" ? "bg-white text-primary" : "bg-primary text-white"} ms-1`}>
                  {docs.length}
                </span>
              </button>
              <button
                onClick={() => setActiveFilter("needs_action")}
                className={`btn ${activeFilter === "needs_action" ? "btn-warning" : "btn-outline-warning"} d-flex align-items-center gap-2`}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
                {isRegistrar ? "Needs Action" : "Pending Review"}
                <span className={`badge ${activeFilter === "needs_action" ? "bg-white text-warning" : "bg-warning text-white"} ms-1`}>
                  {needsAction.length}
                </span>
              </button>
              <button
                onClick={() => setActiveFilter("in_progress")}
                className={`btn ${activeFilter === "in_progress" ? "btn-info" : "btn-outline-info"} d-flex align-items-center gap-2`}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5z"/>
                </svg>
                In Progress
                <span className={`badge ${activeFilter === "in_progress" ? "bg-white text-info" : "bg-info text-white"} ms-1`}>
                  {inProgress.length}
                </span>
              </button>
              <button
                onClick={() => setActiveFilter("completed")}
                className={`btn ${activeFilter === "completed" ? "btn-success" : "btn-outline-success"} d-flex align-items-center gap-2`}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
                Completed
                <span className={`badge ${activeFilter === "completed" ? "bg-white text-success" : "bg-success text-white"} ms-1`}>
                  {completed.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Display */}
      {filteredDocs.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body text-center py-5">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16" className="opacity-25 mb-3">
              <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z"/>
            </svg>
            <div className="fw-semibold fs-5 text-muted">No documents found</div>
            <p className="text-muted small mb-0">
              {activeFilter === "all" && "No document requests at this time"}
              {activeFilter === "needs_action" && "No documents need your attention right now"}
              {activeFilter === "in_progress" && "No documents currently in progress"}
              {activeFilter === "completed" && "No completed documents yet"}
            </p>
          </div>
        </div>
      ) : viewMode === "card" ? (
        // Card View
        <div className="row g-3">
          {filteredDocs.map(doc => {
            const statusInfo = getStatusBadge(doc.status);
            const needsRegistrarAction = 
              doc.status === 'pending_registrar_review' || 
              doc.status === 'approved' || 
              doc.status === 'ready_for_release';
            
            return (
              <div key={doc.id} className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm rounded-3 h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <div className="fw-bold text-dark mb-1">{doc.student_name}</div>
                        <div className="text-muted small mb-1">
                          <strong>ID:</strong> {doc.student_id} | <strong>Grade:</strong> {doc.grade_level || "—"} 
                          {doc.track && <> | <strong>Track:</strong> {doc.track}</>}
                          {doc.strand && <> - {doc.strand}</>}
                        </div>
                        <div className="text-muted small">{doc.document_type}</div>
                        {doc.purpose && (
                          <div className="text-muted small mb-1">
                            <strong>Purpose:</strong> {doc.purpose}
                          </div>
                        )}
                        <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                          Ref: {doc.reference_number || "—"} • Requested: {new Date(doc.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                      {statusInfo}
                    </div>

                    {/* Document Details */}
                    {doc.payment_amount && (
                      <div className="alert alert-light border mb-3 py-2 px-3">
                        <div className="small text-muted">Document Fee: <strong className="text-dark">₱{doc.payment_amount}</strong></div>
                      </div>
                    )}

                    {doc.pickup_date && (
                      <div className="small text-muted mb-3">
                        📅 Pickup: {new Date(doc.pickup_date).toLocaleDateString("en-PH", { month: "short", day: "numeric" })} at {formatTime(doc.pickup_time || "")} • {doc.pickup_location || ""}
                        {doc.pickup_instructions && (
                          <div className="mt-1 small text-dark">
                            <strong>Instructions:</strong> {doc.pickup_instructions}
                          </div>
                        )}
                        {doc.status === 'pickup_scheduled' && (
                          <div className="mt-1 small" style={{ color: "#f59e0b" }}>
                            <i>⏰ Will be ready for release on scheduled date/time</i>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions for Registrar */}
                    {isRegistrar && doc.status === "pending_registrar_review" && (
                      <button 
                        onClick={() => handleRegistrarForward(doc.id)}
                        className="btn w-100"
                        style={{ background: "#374151", color: "#fff", border: "none" }}
                      >
                        Forward to Principal →
                      </button>
                    )}
                    {isRegistrar && doc.status === "approved" && (
                      <button 
                        onClick={() => { setSelectedDoc(doc); setShowPickupModal(true); }}
                        className="btn btn-warning w-100"
                      >
                        Set Pickup Details
                      </button>
                    )}
                    {isRegistrar && doc.status === "pickup_scheduled" && (
                      <button 
                        onClick={() => handleMarkAsReady(doc.id)}
                        className="btn w-100"
                        style={{ background: "#10b981", color: "#fff", border: "none" }}
                      >
                        ✓ Mark as Ready for Pickup
                      </button>
                    )}
                    {isRegistrar && doc.status === "ready_for_release" && (
                      <button 
                        onClick={() => handleConfirmPickedUp(doc.id)}
                        className="btn btn-success w-100"
                      >
                        ✓ Mark as Released
                      </button>
                    )}

                    {/* Actions for Principal */}
                    {isPrincipal && doc.status === "pending_principal_approval" && (
                      <div className="d-flex gap-2">
                        <button 
                          onClick={() => handlePrincipalApprove(doc.id)}
                          className="btn btn-success flex-grow-1"
                        >
                          ✓ Approve
                        </button>
                        <button 
                          onClick={() => { setSelectedDoc(doc); setShowRejectModal(true); }}
                          className="btn btn-danger flex-grow-1"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                    {isPrincipal && doc.status === "approved" && (
                      <div className="alert alert-success mb-0 py-2 text-center">
                        <strong>✓ Approved</strong>
                      </div>
                    )}
                    {isPrincipal && doc.status === "rejected" && (
                      <div className="alert alert-danger mb-0 py-2 text-center">
                        <strong>✗ Rejected</strong>
                        {doc.rejection_reason && (
                          <div className="small mt-1">Reason: {doc.rejection_reason}</div>
                        )}
                      </div>
                    )}

                    {/* Actions for Accounting */}
                    {isAccounting && doc.status === "pending_payment_verification" && (
                      <button 
                        onClick={() => { setSelectedDoc(doc); /* Show payment modal */ }}
                        className="btn btn-primary w-100"
                      >
                        Verify Payment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // List View
        <div className="card border-0 shadow-sm rounded-3">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <tr>
                  <th className="px-4 py-3" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Student / Document</th>
                  <th className="px-3 py-3" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Purpose</th>
                  <th className="px-3 py-3" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Pickup Info</th>
                  <th className="px-3 py-3 text-center" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Status</th>
                  <th className="px-4 py-3 text-center" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map(doc => {
                  const statusInfo = getStatusBadge(doc.status);
                  
                  return (
                    <tr key={doc.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td className="px-4 py-3">
                        <div className="fw-semibold text-dark mb-1">{doc.student_name}</div>
                        <div className="small text-muted mb-1">
                          ID: {doc.student_id} | Grade: {doc.grade_level || "—"}
                          {doc.track && <> | {doc.track}</>}
                          {doc.strand && <> - {doc.strand}</>}
                        </div>
                        <div className="small text-muted">{doc.document_type}</div>
                        <div className="small text-muted" style={{ fontSize: "0.7rem" }}>
                          Ref: {doc.reference_number || "—"}
                        </div>
                        {doc.payment_amount && (
                          <div className="small mt-1" style={{ color: "#f59e0b", fontWeight: 500 }}>
                            ₱{doc.payment_amount}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="small text-muted">{doc.purpose || "—"}</div>
                      </td>
                      <td className="px-3 py-3">
                        {doc.pickup_date ? (
                          <div className="small">
                            <div className="text-dark mb-1">
                              📅 {new Date(doc.pickup_date).toLocaleDateString("en-PH", { month: "short", day: "numeric" })} at {formatTime(doc.pickup_time || "")}
                            </div>
                            <div className="text-muted">{doc.pickup_location || ""}</div>
                            {doc.pickup_instructions && (
                              <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                                {doc.pickup_instructions}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="small text-muted">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {statusInfo}
                      </td>
                      <td className="px-4 py-3">
                        <div className="d-flex gap-2 justify-content-center">
                          {/* Registrar Actions */}
                          {isRegistrar && doc.status === "pending_registrar_review" && (
                            <button 
                              onClick={() => handleRegistrarForward(doc.id)}
                              className="btn btn-sm"
                              style={{ background: "#374151", color: "#fff", fontSize: "0.75rem" }}
                              title="Forward to Principal"
                            >
                              Forward →
                            </button>
                          )}
                          {isRegistrar && doc.status === "approved" && (
                            <button 
                              onClick={() => { setSelectedDoc(doc); setShowPickupModal(true); }}
                              className="btn btn-sm btn-warning"
                              style={{ fontSize: "0.75rem" }}
                              title="Set Pickup Details"
                            >
                              Set Pickup
                            </button>
                          )}
                          {isRegistrar && doc.status === "pickup_scheduled" && (
                            <button 
                              onClick={() => handleMarkAsReady(doc.id)}
                              className="btn btn-sm"
                              style={{ background: "#10b981", color: "#fff", fontSize: "0.75rem" }}
                              title="Mark as Ready"
                            >
                              Mark Ready
                            </button>
                          )}
                          {isRegistrar && doc.status === "ready_for_release" && (
                            <button 
                              onClick={() => handleConfirmPickedUp(doc.id)}
                              className="btn btn-sm btn-success"
                              style={{ fontSize: "0.75rem" }}
                              title="Mark as Released"
                            >
                              Released
                            </button>
                          )}
                          
                          {/* Principal Actions */}
                          {isPrincipal && doc.status === "pending_principal_approval" && (
                            <>
                              <button 
                                onClick={() => handlePrincipalApprove(doc.id)}
                                className="btn btn-sm btn-success"
                                style={{ fontSize: "0.75rem" }}
                                title="Approve"
                              >
                                ✓ Approve
                              </button>
                              <button 
                                onClick={() => { setSelectedDoc(doc); setShowRejectModal(true); }}
                                className="btn btn-sm btn-danger"
                                style={{ fontSize: "0.75rem" }}
                                title="Reject"
                              >
                                ✗ Reject
                              </button>
                            </>
                          )}
                          {isPrincipal && doc.status === "approved" && (
                            <span className="small text-success fw-semibold">✓ Approved</span>
                          )}
                          {isPrincipal && doc.status === "rejected" && (
                            <span className="small text-danger fw-semibold">✗ Rejected</span>
                          )}
                          {isPrincipal && doc.status === "pending_registrar_review" && (
                            <span className="small text-muted">Pending Registrar</span>
                          )}
                          
                          {/* Accounting Actions */}
                          {isAccounting && doc.status === "pending_payment_verification" && (
                            <button 
                              onClick={() => { setSelectedDoc(doc); /* Show payment modal */ }}
                              className="btn btn-sm btn-primary"
                              style={{ fontSize: "0.75rem" }}
                              title="Verify Payment"
                            >
                              Verify Payment
                            </button>
                          )}
                          
                          {/* No action needed */}
                          {!(
                            (isRegistrar && ["pending_registrar_review", "approved", "pickup_scheduled", "ready_for_release"].includes(doc.status)) ||
                            (isPrincipal && doc.status === "pending_principal_approval") ||
                            (isAccounting && doc.status === "pending_payment_verification")
                          ) && (
                            <span className="small text-muted">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedDoc && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowRejectModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Document Request</h5>
                <button className="btn-close" onClick={() => setShowRejectModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>{selectedDoc.student_name}</strong> - {selectedDoc.document_type}</p>
                <textarea 
                  className="form-control" 
                  rows={4} 
                  placeholder="Enter rejection reason..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handlePrincipalReject}>Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Modal */}
      {showPickupModal && selectedDoc && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowPickupModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Set Pickup Details</h5>
                <button className="btn-close" onClick={() => setShowPickupModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>{selectedDoc.student_name}</strong> - {selectedDoc.document_type}</p>
                
                {selectedDoc.requires_payment && selectedDoc.payment_amount > 0 ? (
                  <div className="alert alert-info mb-3">
                    <div className="small text-muted mb-1">Document Fee:</div>
                    <div className="h4 mb-0 text-dark">₱{selectedDoc.payment_amount || '0.00'}</div>
                    <div className="small mt-1">Student must pay at Accounting before pickup</div>
                  </div>
                ) : (
                  <div className="alert alert-success mb-3">
                    <div className="small">✓ This document is free - no payment required</div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Pickup Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={pickupDate}
                    onChange={e => setPickupDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Pickup Time</label>
                  <input 
                    type="time" 
                    className="form-control" 
                    value={pickupTime}
                    onChange={e => setPickupTime(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Pickup Location</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={pickupLocation}
                    onChange={e => setPickupLocation(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Pickup Instructions (Optional)</label>
                  <textarea 
                    className="form-control" 
                    rows={2}
                    placeholder="e.g., Bring valid ID, Bring receipt..."
                    value={pickupInstructions}
                    onChange={e => setPickupInstructions(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowPickupModal(false)}>Cancel</button>
                <button className="btn btn-warning" onClick={handleSetPickup}>
                  {selectedDoc?.requires_payment ? "Schedule Pickup (Payment Required)" : "Schedule Pickup"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Types Management Modal (Registrar Only) */}
      {showDocTypesModal && isRegistrar && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)", overflowY: "auto" }} onClick={() => setShowDocTypesModal(false)}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Manage Document Types</h5>
                <button className="btn-close" onClick={() => setShowDocTypesModal(false)}></button>
              </div>
              <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {/* Add/Edit Form */}
                <div className="card mb-4">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">{editingDocType ? "Edit" : "Add New"} Document Type</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small">Document Name *</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          placeholder="e.g., Certificate of Enrollment"
                          value={docTypeForm.document_name}
                          onChange={e => setDocTypeForm({...docTypeForm, document_name: e.target.value})}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">Price (₱)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          className="form-control form-control-sm" 
                          placeholder="0.00"
                          value={docTypeForm.price}
                          onChange={e => setDocTypeForm({...docTypeForm, price: e.target.value})}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small">Processing Days *</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          placeholder="e.g., 3-5 days"
                          value={docTypeForm.processing_days}
                          onChange={e => setDocTypeForm({...docTypeForm, processing_days: e.target.value})}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small">Description (Optional)</label>
                        <textarea 
                          className="form-control form-control-sm" 
                          rows={2}
                          placeholder="Additional notes about this document type..."
                          value={docTypeForm.description}
                          onChange={e => setDocTypeForm({...docTypeForm, description: e.target.value})}
                        />
                      </div>
                      <div className="col-12">
                        <div className="d-flex gap-2">
                          {editingDocType ? (
                            <>
                              <button className="btn btn-primary btn-sm" onClick={handleUpdateDocType}>
                                Update Document Type
                              </button>
                              <button 
                                className="btn btn-secondary btn-sm" 
                                onClick={() => {
                                  setEditingDocType(null);
                                  setDocTypeForm({ document_name: "", price: "", processing_days: "", description: "" });
                                }}
                              >
                                Cancel Edit
                              </button>
                            </>
                          ) : (
                            <button className="btn btn-success btn-sm" onClick={handleCreateDocType}>
                              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                              </svg>
                              Add Document Type
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Existing Document Types List */}
                <h6 className="fw-bold mb-3">Existing Document Types ({documentTypes.length})</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead style={{ background: "#f8fafc" }}>
                      <tr>
                        <th className="px-3 py-2 small">Document Name</th>
                        <th className="px-3 py-2 small text-center">Price</th>
                        <th className="px-3 py-2 small text-center">Processing</th>
                        <th className="px-3 py-2 small">Description</th>
                        <th className="px-3 py-2 small text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentTypes.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-muted py-4 small">
                            No document types yet. Add one above!
                          </td>
                        </tr>
                      ) : (
                        documentTypes.map(docType => (
                          <tr key={docType.id}>
                            <td className="px-3 py-2 small fw-medium">{docType.document_name}</td>
                            <td className="px-3 py-2 small text-center">
                              {parseFloat(docType.price) > 0 ? (
                                <span className="text-primary">₱{parseFloat(docType.price).toFixed(2)}</span>
                              ) : (
                                <span className="text-success">Free</span>
                              )}
                            </td>
                            <td className="px-3 py-2 small text-center text-muted">{docType.processing_days}</td>
                            <td className="px-3 py-2 small text-muted">{docType.description || "—"}</td>
                            <td className="px-3 py-2 text-center">
                              <div className="d-flex gap-1 justify-content-center">
                                <button 
                                  className="btn btn-sm btn-outline-primary py-0 px-2" 
                                  style={{ fontSize: "0.75rem" }}
                                  onClick={() => handleEditDocType(docType)}
                                  title="Edit"
                                >
                                  Edit
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger py-0 px-2" 
                                  style={{ fontSize: "0.75rem" }}
                                  onClick={() => handleDeleteDocType(docType.id)}
                                  title="Delete"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDocTypesModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
