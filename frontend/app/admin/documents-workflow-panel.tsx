/**
 * Document Workflow Panel for Admin
 * Handles both Registrar and Principal workflows
 */
"use client";

import React, { useState, useEffect } from "react";
import { API_BASE } from "../lib/auth";

type FilterType = "all" | "needs_action" | "in_progress" | "completed";

export function DocumentWorkflowPanel() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [stats, setStats] = useState<any>({});
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [pickupLocation, setPickupLocation] = useState("Registrar's Office");
  
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
        pickup_location: pickupLocation
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

  // Filter documents based on registrar's needs
  const needsAction = docs.filter(d => 
    isRegistrar 
      ? (d.status === 'teacher_approved' || d.status === 'principal_approved' || d.status === 'payment_verified')
      : isPrincipal
      ? (d.status === 'registrar_forwarded')
      : false
  );
  
  const inProgress = docs.filter(d => 
    isRegistrar
      ? (d.status === 'registrar_forwarded' || d.status === 'pending_payment')
      : isPrincipal
      ? (d.status === 'principal_approved' || d.status === 'pending_payment' || d.status === 'payment_verified')
      : false
  );
  
  const completed = docs.filter(d => 
    d.status === 'released' || d.status === 'principal_rejected'
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
      student_requested: { bg: "#fef3c7", text: "#92400e", label: "Pending Teacher" },
      teacher_approved: { bg: "#d1fae5", text: "#065f46", label: "Teacher Approved" },
      registrar_forwarded: { bg: "#dbeafe", text: "#1e40af", label: "With Principal" },
      principal_approved: { bg: "#d1fae5", text: "#065f46", label: "Principal Approved" },
      principal_rejected: { bg: "#fee2e2", text: "#991b1b", label: "Rejected" },
      pending_payment: { bg: "#fef3c7", text: "#92400e", label: "Pending Payment" },
      payment_verified: { bg: "#d1fae5", text: "#065f46", label: "Ready for Pickup" },
      released: { bg: "#f1f5f9", text: "#475569", label: "Picked Up" },
    };
    const info = statusMap[status] || { bg: "#f3f4f6", text: "#374151", label: status };
    return <span className="badge px-3 py-2 rounded-pill" style={{ background: info.bg, color: info.text, fontSize: "0.75rem", fontWeight: 600 }}>{info.label}</span>;
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="card border-0 shadow-sm rounded-3" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-white bg-opacity-25 rounded-3 p-3">
              <svg width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
                <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5z"/>
              </svg>
            </div>
            <div className="flex-grow-1 text-white">
              <h2 className="fw-bold mb-1 fs-3">Document Requests</h2>
              <p className="mb-0 opacity-75">
                {isPrincipal && "Principal Approval Queue"}
                {isRegistrar && "Registrar Management - Complete Workflow"}
                {isAccounting && "Payment Verification Queue"}
              </p>
            </div>
            <div className="d-none d-md-block">
              <div className="text-center px-4 py-3 rounded-3" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
                <div className="text-white fw-bold" style={{ fontSize: "2.5rem", lineHeight: 1 }}>{docs.length}</div>
                <div className="text-white opacity-75 small mt-1">Total</div>
              </div>
            </div>
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
                className={`btn ${activeFilter === "all" ? "btn-primary" : "btn-outline-primary"} d-flex align-items-center gap-2`}
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

      {/* Documents List */}
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
      ) : (
        <div className="row g-3">
          {filteredDocs.map(doc => {
            const statusInfo = getStatusBadge(doc.status);
            const needsRegistrarAction = 
              doc.status === 'teacher_approved' || 
              doc.status === 'principal_approved' || 
              doc.status === 'payment_verified';
            
            return (
              <div key={doc.id} className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm rounded-3 h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <div className="fw-bold text-dark mb-1">{doc.student_name}</div>
                        <div className="text-muted small">{doc.document_type}</div>
                        <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                          Teacher: {doc.teacher_name || "—"} • Requested: {new Date(doc.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
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
                      </div>
                    )}

                    {/* Actions for Registrar */}
                    {isRegistrar && doc.status === "teacher_approved" && (
                      <button 
                        onClick={() => handleRegistrarForward(doc.id)}
                        className="btn btn-primary w-100"
                      >
                        Forward to Principal →
                      </button>
                    )}
                    {isRegistrar && doc.status === "principal_approved" && (
                      <button 
                        onClick={() => { setSelectedDoc(doc); setShowPickupModal(true); }}
                        className="btn btn-warning w-100"
                      >
                        Set Pickup Details
                      </button>
                    )}
                    {isRegistrar && doc.status === "payment_verified" && (
                      <button 
                        onClick={() => handleConfirmPickedUp(doc.id)}
                        className="btn btn-success w-100"
                      >
                        ✓ Mark as Picked Up
                      </button>
                    )}

                    {/* Actions for Principal */}
                    {isPrincipal && doc.status === "registrar_forwarded" && (
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
                  </div>
                </div>
              </div>
            );
          })}
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
                
                <div className="alert alert-info mb-3">
                  <div className="small text-muted mb-1">Document Fee:</div>
                  <div className="h4 mb-0 text-dark">₱{selectedDoc.payment_amount || '0.00'}</div>
                  <div className="small mt-1">Student will pay at Accounting before pickup</div>
                </div>

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
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowPickupModal(false)}>Cancel</button>
                <button className="btn btn-warning" onClick={handleSetPickup}>Set Pending Payment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
