"use client";

import { useState, useEffect } from "react";
import { API_BASE, refreshAcademicConfig } from "../lib/auth";

// Icons
function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const props = {
    width: size, height: size, fill: "none", viewBox: "0 0 24 24",
    stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };
  
  if (name === "settings") return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m5.66-15a8.02 8.02 0 010 16m-11.32 0a8.02 8.02 0 010-16"/></svg>;
  if (name === "calendar") return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  if (name === "check") return <svg {...props}><polyline points="20 6 9 17 4 12"/></svg>;
  if (name === "x") return <svg {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
  if (name === "edit") return <svg {...props}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
  if (name === "trash") return <svg {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>;
  if (name === "plus") return <svg {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
  return <svg {...props}><circle cx="12" cy="12" r="10"/></svg>;
}

type SchoolYear = {
  id: number;
  school_year: string;
  current_term: string;
  status: string;
  enrollment_start_date: string | null;
  enrollment_end_date: string | null;
  enrollment_is_open: number;
  term1_completed_at: string | null;
  term2_completed_at: string | null;
  term3_completed_at: string | null;
};

export function SettingsPanel() {
  const [activeConfig, setActiveConfig] = useState<SchoolYear | null>(null);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState<SchoolYear | null>(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("inform_token");
      
      // Fetch active config
      const configRes = await fetch(`${API_BASE}/api/admin/settings/academic-config`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });
      
      if (configRes.ok) {
        const data = await configRes.json();
        setActiveConfig(data.active);
      }
      
      // Fetch all school years
      const yearsRes = await fetch(`${API_BASE}/api/admin/settings/school-years`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });
      
      if (yearsRes.ok) {
        const data = await yearsRes.json();
        setSchoolYears(data.school_years);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString("en-US", { 
      month: "short", day: "numeric", year: "numeric" 
    });
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-fluid p-4">
      <h2 className="fw-bold mb-4">⚙️ System Settings</h2>
      
      {/* Current Academic Year Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: 48, height: 48, background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
              <Icon name="calendar" size={24} />
            </div>
            <div>
              <h5 className="mb-0 fw-bold">Current Academic Year</h5>
              <small className="text-muted">Active school year and term</small>
            </div>
          </div>
          
          {activeConfig && (
            <div className="row g-3">
              <div className="col-md-3">
                <div className="p-3 rounded-3" style={{ background: "#f8fafc" }}>
                  <small className="text-muted d-block mb-1">School Year</small>
                  <h4 className="mb-0 fw-bold text-primary">{activeConfig.school_year}</h4>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 rounded-3" style={{ background: "#f8fafc" }}>
                  <small className="text-muted d-block mb-1">Current Term</small>
                  <h4 className="mb-0 fw-bold text-success">{activeConfig.current_term}</h4>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 rounded-3" style={{ background: "#f8fafc" }}>
                  <small className="text-muted d-block mb-1">Status</small>
                  <span className="badge bg-success px-3 py-2">
                    🟢 {activeConfig.status === "active" ? "Active" : "Completed"}
                  </span>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 rounded-3" style={{ background: "#f8fafc" }}>
                  <button 
                    className="btn btn-primary w-100"
                    onClick={() => setShowTermModal(true)}
                  >
                    Mark Term as Done →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Enrollment Period Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: 48, height: 48, background: "linear-gradient(135deg, #059669, #10b981)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1"/>
                </svg>
              </div>
              <div>
                <h5 className="mb-0 fw-bold">Enrollment Period</h5>
                <small className="text-muted">Configure enrollment dates</small>
              </div>
            </div>
            <button 
              className="btn btn-outline-primary"
              onClick={() => setShowEnrollModal(true)}
            >
              📝 Configure
            </button>
          </div>
          
          {activeConfig && (
            <div className="row g-3">
              <div className="col-md-4">
                <small className="text-muted d-block mb-1">Status</small>
                <span className={`badge px-3 py-2 ${activeConfig.enrollment_is_open ? "bg-success" : "bg-secondary"}`}>
                  {activeConfig.enrollment_is_open ? "🟢 Open" : "🔴 Closed"}
                </span>
              </div>
              <div className="col-md-4">
                <small className="text-muted d-block mb-1">Start Date</small>
                <strong>{formatDate(activeConfig.enrollment_start_date)}</strong>
              </div>
              <div className="col-md-4">
                <small className="text-muted d-block mb-1">End Date</small>
                <strong>{formatDate(activeConfig.enrollment_end_date)}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* School Year History */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h5 className="mb-0 fw-bold">📊 School Year History</h5>
            <button 
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={() => setShowAddModal(true)}
            >
              <Icon name="plus" size={18} />
              Add New School Year
            </button>
          </div>
          
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>School Year</th>
                  <th>Current Term</th>
                  <th>Status</th>
                  <th>Enrollment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schoolYears.map(year => (
                  <tr key={year.id}>
                    <td className="fw-semibold">{year.school_year}</td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary">
                        {year.current_term}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${year.status === "active" ? "bg-success" : "bg-secondary"}`}>
                        {year.status === "active" ? "🟢 Active" : "✅ Completed"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${year.enrollment_is_open ? "bg-success" : "bg-secondary"}`}>
                        {year.enrollment_is_open ? "Open" : "Closed"}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary" 
                          title="View Details"
                          onClick={() => {
                            setSelectedYear(year);
                            setShowViewModal(true);
                          }}
                        >
                          👁️ View
                        </button>
                        <button 
                          className="btn btn-outline-secondary" 
                          title="Edit"
                          onClick={() => {
                            setSelectedYear(year);
                            setShowEditModal(true);
                          }}
                        >
                          <Icon name="edit" size={14} />
                        </button>
                        {year.status !== "active" && (
                          <button 
                            className="btn btn-outline-danger" 
                            title="Delete"
                            onClick={() => {
                              setSelectedYear(year);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {showAddModal && <AddSchoolYearModal onClose={() => { setShowAddModal(false); fetchData(); }} />}
      {showEnrollModal && activeConfig && <ConfigEnrollmentModal config={activeConfig} onClose={() => { setShowEnrollModal(false); fetchData(); }} />}
      {showTermModal && activeConfig && <CompleteTermModal config={activeConfig} onClose={() => { setShowTermModal(false); fetchData(); }} />}
      {showViewModal && selectedYear && <ViewSchoolYearModal year={selectedYear} onClose={() => { setShowViewModal(false); setSelectedYear(null); }} />}
      {showEditModal && selectedYear && <EditSchoolYearModal year={selectedYear} onClose={() => { setShowEditModal(false); setSelectedYear(null); fetchData(); }} />}
      {showDeleteModal && selectedYear && <DeleteSchoolYearModal year={selectedYear} onClose={() => { setShowDeleteModal(false); setSelectedYear(null); fetchData(); }} />}
    </div>
  );
}

// Add School Year Modal
function AddSchoolYearModal({ onClose }: { onClose: () => void }) {
  const [schoolYear, setSchoolYear] = useState("");
  const [startingTerm, setStartingTerm] = useState("Term 1");
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/admin/settings/school-years`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ school_year: schoolYear, starting_term: startingTerm })
      });
      
      if (res.ok) {
        refreshAcademicConfig(); // Clear cache for immediate updates
        alert("School year created successfully!");
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create school year");
      }
    } catch (err) {
      alert("Error creating school year");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">➕ Add New School Year</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">School Year *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., 2027-2028"
                  value={schoolYear}
                  onChange={e => setSchoolYear(e.target.value)}
                  required
                />
                <small className="text-muted">Format: YYYY-YYYY</small>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Starting Term *</label>
                <select
                  className="form-select"
                  value={startingTerm}
                  onChange={e => setStartingTerm(e.target.value)}
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Creating..." : "Create School Year"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Configure Enrollment Modal
function ConfigEnrollmentModal({ config, onClose }: { config: SchoolYear; onClose: () => void }) {
  const [startDate, setStartDate] = useState(config.enrollment_start_date?.split('T')[0] || "");
  const [endDate, setEndDate] = useState(config.enrollment_end_date?.split('T')[0] || "");
  const [openNow, setOpenNow] = useState(config.enrollment_is_open === 1);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/admin/settings/enrollment-config`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          school_year_id: config.id,
          start_date: startDate,
          end_date: endDate,
          open_now: openNow
        })
      });
      
      if (res.ok) {
        refreshAcademicConfig(); // Clear cache for immediate updates
        alert("Enrollment configuration updated!");
        onClose();
      } else {
        alert("Failed to update enrollment config");
      }
    } catch (err) {
      alert("Error updating config");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">🎓 Configure Enrollment Period</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="alert alert-info">
                <strong>School Year:</strong> {config.school_year}
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Start Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">End Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="openNow"
                  checked={openNow}
                  onChange={e => setOpenNow(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="openNow">
                  Open enrollment immediately
                </label>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Save & Apply"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Complete Term Modal
function CompleteTermModal({ config, onClose }: { config: SchoolYear; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  
  const getNextTerm = () => {
    if (config.current_term === "Term 1") return "Term 2";
    if (config.current_term === "Term 2") return "Term 3";
    return "Term 3 (School Year Complete)";
  };
  
  const handleConfirm = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/admin/settings/complete-term`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ school_year_id: config.id })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        refreshAcademicConfig(); // Clear cache for immediate updates
        alert(data.message);
        onClose();
      } else {
        alert(data.error || "Failed to complete term");
      }
    } catch (err) {
      alert("Error completing term");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 pb-0 bg-warning bg-opacity-10">
            <h5 className="modal-title fw-bold">✅ Complete Current Term</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-warning">
              <strong>⚠️ Important:</strong> This action cannot be undone!
            </div>
            
            <p><strong>School Year:</strong> {config.school_year}</p>
            <p><strong>Current Term:</strong> {config.current_term}</p>
            <p><strong>Next:</strong> {getNextTerm()}</p>
            
            <hr />
            
            <p className="mb-2"><strong>This will:</strong></p>
            <ul>
              <li>✓ Close grade submissions for {config.current_term}</li>
              <li>✓ Lock all {config.current_term} records</li>
              <li>✓ Advance to {getNextTerm()}</li>
              <li>✓ Notify all teachers and students</li>
            </ul>
            
            {config.current_term === "Term 3" && (
              <div className="alert alert-danger mt-3">
                <strong>⚠️ Term 3 Completion:</strong> This will mark the entire school year as complete!
              </div>
            )}
          </div>
          <div className="modal-footer border-0">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              className="btn btn-warning" 
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Processing..." : "Yes, Complete Term"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// View School Year Details Modal
function ViewSchoolYearModal({ year, onClose }: { year: SchoolYear; onClose: () => void }) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString("en-US", { 
      month: "long", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };
  
  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 pb-0" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
            <div className="text-white">
              <h5 className="modal-title fw-bold mb-1">📅 School Year Details</h5>
              <small className="opacity-75">{year.school_year}</small>
            </div>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            {/* Status Overview */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="p-3 rounded-3 border">
                  <small className="text-muted d-block mb-2">Current Term</small>
                  <h5 className="mb-0 fw-bold text-primary">{year.current_term}</h5>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 rounded-3 border">
                  <small className="text-muted d-block mb-2">Status</small>
                  <span className={`badge ${year.status === "active" ? "bg-success" : "bg-secondary"}`}>
                    {year.status === "active" ? "🟢 Active" : "✅ Completed"}
                  </span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 rounded-3 border">
                  <small className="text-muted d-block mb-2">Enrollment</small>
                  <span className={`badge ${year.enrollment_is_open ? "bg-success" : "bg-secondary"}`}>
                    {year.enrollment_is_open ? "🟢 Open" : "🔴 Closed"}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Enrollment Period */}
            <div className="mb-4">
              <h6 className="fw-bold mb-3">📋 Enrollment Period</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-3 rounded-3" style={{ background: "#f8fafc" }}>
                    <small className="text-muted d-block mb-1">Start Date</small>
                    <div className="fw-semibold">{formatDate(year.enrollment_start_date)}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 rounded-3" style={{ background: "#f8fafc" }}>
                    <small className="text-muted d-block mb-1">End Date</small>
                    <div className="fw-semibold">{formatDate(year.enrollment_end_date)}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Term Completion Timeline */}
            <div>
              <h6 className="fw-bold mb-3">📊 Term Completion Timeline</h6>
              <div className="d-flex flex-column gap-2">
                {/* Term 1 */}
                <div className={`p-3 rounded-3 d-flex align-items-center justify-content-between ${year.term1_completed_at ? "border-success" : "border"}`}
                  style={{ background: year.term1_completed_at ? "#f0fdf4" : "#f8fafc" }}>
                  <div>
                    <div className="fw-semibold">Term 1</div>
                    <small className="text-muted">
                      {year.term1_completed_at ? formatDate(year.term1_completed_at) : "Not completed"}
                    </small>
                  </div>
                  {year.term1_completed_at && (
                    <span className="badge bg-success">✓ Completed</span>
                  )}
                </div>
                
                {/* Term 2 */}
                <div className={`p-3 rounded-3 d-flex align-items-center justify-content-between ${year.term2_completed_at ? "border-success" : "border"}`}
                  style={{ background: year.term2_completed_at ? "#f0fdf4" : "#f8fafc" }}>
                  <div>
                    <div className="fw-semibold">Term 2</div>
                    <small className="text-muted">
                      {year.term2_completed_at ? formatDate(year.term2_completed_at) : "Not completed"}
                    </small>
                  </div>
                  {year.term2_completed_at && (
                    <span className="badge bg-success">✓ Completed</span>
                  )}
                </div>
                
                {/* Term 3 */}
                <div className={`p-3 rounded-3 d-flex align-items-center justify-content-between ${year.term3_completed_at ? "border-success" : "border"}`}
                  style={{ background: year.term3_completed_at ? "#f0fdf4" : "#f8fafc" }}>
                  <div>
                    <div className="fw-semibold">Term 3</div>
                    <small className="text-muted">
                      {year.term3_completed_at ? formatDate(year.term3_completed_at) : "Not completed"}
                    </small>
                  </div>
                  {year.term3_completed_at && (
                    <span className="badge bg-success">✓ Completed</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Summary Stats */}
            {year.status === "completed" && (
              <div className="alert alert-info mt-4">
                <strong>📊 Summary:</strong> This school year has been completed. All terms are closed and records are locked.
              </div>
            )}
          </div>
          <div className="modal-footer border-0">
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit School Year Modal
function EditSchoolYearModal({ year, onClose }: { year: SchoolYear; onClose: () => void }) {
  const [schoolYear, setSchoolYear] = useState(year.school_year);
  const [currentTerm, setCurrentTerm] = useState(year.current_term);
  const [status, setStatus] = useState(year.status);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/admin/settings/school-years/${year.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ 
          school_year: schoolYear, 
          current_term: currentTerm,
          status: status
        })
      });
      
      if (res.ok) {
        refreshAcademicConfig(); // Clear cache for immediate updates
        alert("School year updated successfully!");
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update school year");
      }
    } catch (err) {
      alert("Error updating school year");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">✏️ Edit School Year</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="alert alert-info">
                <strong>Editing:</strong> School Year ID #{year.id}
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">School Year *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., 2027-2028"
                  value={schoolYear}
                  onChange={e => setSchoolYear(e.target.value)}
                  required
                />
                <small className="text-muted">Format: YYYY-YYYY</small>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Current Term *</label>
                <select
                  className="form-select"
                  value={currentTerm}
                  onChange={e => setCurrentTerm(e.target.value)}
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Status *</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                <small className="text-muted">Note: Only one school year can be active at a time</small>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Updating..." : "Update School Year"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Delete School Year Modal
function DeleteSchoolYearModal({ year, onClose }: { year: SchoolYear; onClose: () => void }) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleDelete = async () => {
    if (confirmText !== year.school_year) {
      alert("Please type the school year name to confirm deletion");
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/admin/settings/school-years/${year.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        },
        credentials: "include"
      });
      
      if (res.ok) {
        refreshAcademicConfig(); // Clear cache for immediate updates
        alert("School year deleted successfully!");
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete school year");
      }
    } catch (err) {
      alert("Error deleting school year");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 pb-0 bg-danger bg-opacity-10">
            <h5 className="modal-title fw-bold text-danger">🗑️ Delete School Year</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-danger">
              <strong>⚠️ Warning:</strong> This action cannot be undone!
            </div>
            
            <p><strong>You are about to delete:</strong></p>
            <div className="p-3 rounded-3 bg-light mb-3">
              <div><strong>School Year:</strong> {year.school_year}</div>
              <div><strong>Current Term:</strong> {year.current_term}</div>
              <div><strong>Status:</strong> {year.status}</div>
            </div>
            
            <div className="alert alert-warning">
              <strong>This will permanently remove:</strong>
              <ul className="mb-0 mt-2">
                <li>School year record</li>
                <li>Enrollment configuration</li>
                <li>Term completion history</li>
                <li>All associated data</li>
              </ul>
            </div>
            
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Type <code className="text-danger">{year.school_year}</code> to confirm:
              </label>
              <input
                type="text"
                className="form-control"
                placeholder={year.school_year}
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer border-0">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              className="btn btn-danger" 
              onClick={handleDelete}
              disabled={loading || confirmText !== year.school_year}
            >
              {loading ? "Deleting..." : "Delete Permanently"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
