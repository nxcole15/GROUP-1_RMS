/**
 * Document Workflow Panel for Admin
 * Handles both Registrar and Principal workflows
 */
"use client";

import React, { useState, useEffect } from "react";
import { API_BASE } from "../lib/auth";

export function DocumentWorkflowPanel() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = () => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    
    const endpoint = isPrincipal ? "/api/admin/documents/principal" : "/api/admin/documents/registrar";
    
    fetch(`${API_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.documents) {
          setDocs(data.documents);
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

  const handleMarkReleased = async (id: number) => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    
    const res = await fetch(`${API_BASE}/api/admin/documents/${id}/mark-released`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    
    if (res.ok) fetchDocuments();
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, {bg: string; text: string; label: string}> = {
      student_requested: { bg: "#fef3c7", text: "#92400e", label: "Pending Teacher" },
      teacher_approved: { bg: "#d1fae5", text: "#065f46", label: "Teacher Approved" },
      registrar_forwarded: { bg: "#dbeafe", text: "#1e40af", label: "Pending Principal" },
      principal_approved: { bg: "#d1fae5", text: "#065f46", label: "Principal Approved" },
      principal_rejected: { bg: "#fee2e2", text: "#991b1b", label: "Rejected" },
      ready_for_pickup: { bg: "#e9d5ff", text: "#6b21a8", label: "Ready for Pickup" },
      released: { bg: "#f1f5f9", text: "#475569", label: "Released" },
    };
    const info = statusMap[status] || { bg: "#f3f4f6", text: "#374151", label: status };
    return <span className="badge px-3 py-2" style={{ background: info.bg, color: info.text, fontSize: "0.75rem" }}>{info.label}</span>;
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="fw-bold fs-3 mb-1">Document Requests</h2>
        <p className="text-muted">{isPrincipal ? "Principal Approval Queue" : "Registrar Management"}</p>
      </div>

      {docs.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <p className="text-muted mb-0">No pending documents at this time</p>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Student</th>
                <th>Document Type</th>
                <th>Teacher</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => (
                <tr key={doc.id}>
                  <td className="fw-semibold">{doc.student_name}</td>
                  <td>{doc.document_type}</td>
                  <td className="text-muted small">{doc.teacher_name || "—"}</td>
                  <td>{getStatusBadge(doc.status)}</td>
                  <td className="text-end">
                    {/* Registrar Actions */}
                    {isRegistrar && doc.status === "teacher_approved" && (
                      <button 
                        onClick={() => handleRegistrarForward(doc.id)}
                        className="btn btn-sm btn-primary"
                      >
                        Forward to Principal
                      </button>
                    )}
                    {isRegistrar && doc.status === "principal_approved" && (
                      <button 
                        onClick={() => { setSelectedDoc(doc); setShowPickupModal(true); }}
                        className="btn btn-sm btn-success"
                      >
                        Set Pickup Details
                      </button>
                    )}
                    {isRegistrar && doc.status === "ready_for_pickup" && (
                      <button 
                        onClick={() => handleMarkReleased(doc.id)}
                        className="btn btn-sm btn-secondary"
                      >
                        Mark as Released
                      </button>
                    )}

                    {/* Principal Actions */}
                    {isPrincipal && doc.status === "registrar_forwarded" && (
                      <div className="d-flex gap-2 justify-content-end">
                        <button 
                          onClick={() => handlePrincipalApprove(doc.id)}
                          className="btn btn-sm btn-success"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => { setSelectedDoc(doc); setShowRejectModal(true); }}
                          className="btn btn-sm btn-danger"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <button className="btn btn-success" onClick={handleSetPickup}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
