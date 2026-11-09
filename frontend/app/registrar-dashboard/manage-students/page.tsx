"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Student = {
  id: number;
  student_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  pathway: string;
  grade_level: number;
  track: string | null;
  strand: string | null;
  school_year: string | null;
  account_status: string;
  created_at: string;
  photo_url: string | null;
};

type StudentDetails = Student & {
  date_of_birth: string | null;
  gender: string | null;
  civil_status: string | null;
  nationality: string | null;
  religion: string | null;
  address: string | null;
  learning_modality: string | null;
  father_name: string | null;
  father_occupation: string | null;
  mother_name: string | null;
  mother_occupation: string | null;
  guardian_name: string | null;
  guardian_relation: string | null;
  guardian_phone: string | null;
  previous_school: string | null;
  previous_school_address: string | null;
  years_attended: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  extension_name: string | null;
  lrn: string | null;
  enrollment_status: string | null;
  reviewed_by_principal: string | null;
  principal_reviewed_at: string | null;
};

export default function ManageStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [trackFilter, setTrackFilter] = useState("");
  const [strandFilter, setStrandFilter] = useState("");
  const [schoolYearFilter, setSchoolYearFilter] = useState("");
  
  // Modals
  const [viewModal, setViewModal] = useState<StudentDetails | null>(null);
  const [editModal, setEditModal] = useState<StudentDetails | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch students
  useEffect(() => {
    fetchStudents();
  }, [search, gradeFilter, trackFilter, strandFilter, schoolYearFilter]);

  async function fetchStudents() {
    try {
      setLoading(true);
      const token = localStorage.getItem("inform_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (gradeFilter) params.append("grade_level", gradeFilter);
      if (trackFilter) params.append("track", trackFilter);
      if (strandFilter) params.append("strand", strandFilter);
      if (schoolYearFilter) params.append("school_year", schoolYearFilter);

      const res = await fetch(`${API_BASE}/api/admin/students/manage?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch students");
      }

      const data = await res.json();
      setStudents(data.students || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function viewStudent(studentId: string) {
    try {
      const token = localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/admin/students/manage/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch student details");

      const data = await res.json();
      setViewModal(data.student);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to load student details");
    }
  }

  async function openEditModal(studentId: string) {
    try {
      const token = localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/admin/students/manage/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch student details");

      const data = await res.json();
      setEditModal(data.student);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to load student details");
    }
  }

  async function saveStudentChanges(e: React.FormEvent) {
    e.preventDefault();
    if (!editModal) return;

    try {
      const token = localStorage.getItem("inform_token");
      
      const updateData = {
        new_student_id: (e.target as any).new_student_id?.value || editModal.student_id,
        first_name: (e.target as any).first_name?.value,
        middle_name: (e.target as any).middle_name?.value || null,
        last_name: (e.target as any).last_name?.value,
        extension_name: (e.target as any).extension_name?.value || null,
        date_of_birth: (e.target as any).date_of_birth?.value,
        gender: (e.target as any).gender?.value,
        civil_status: (e.target as any).civil_status?.value || null,
        nationality: (e.target as any).nationality?.value,
        religion: (e.target as any).religion?.value || null,
        phone: (e.target as any).phone?.value,
        email: (e.target as any).email?.value,
        address: (e.target as any).address?.value,
        grade_level: (e.target as any).grade_level?.value,
        track: (e.target as any).track?.value,
        strand: (e.target as any).strand?.value,
        learning_modality: (e.target as any).learning_modality?.value,
        father_name: (e.target as any).father_name?.value || null,
        father_occupation: (e.target as any).father_occupation?.value || null,
        mother_name: (e.target as any).mother_name?.value || null,
        mother_occupation: (e.target as any).mother_occupation?.value || null,
        guardian_name: (e.target as any).guardian_name?.value || null,
        guardian_relation: (e.target as any).guardian_relation?.value || null,
        guardian_phone: (e.target as any).guardian_phone?.value || null,
        previous_school: (e.target as any).previous_school?.value || null,
        previous_school_address: (e.target as any).previous_school_address?.value || null,
        years_attended: (e.target as any).years_attended?.value || null,
        lrn: (e.target as any).lrn?.value,
      };

      const res = await fetch(`${API_BASE}/api/admin/students/manage/${editModal.student_id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update student");
      }

      const data = await res.json();
      setSuccessMessage(data.message);
      setEditModal(null);
      fetchStudents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update student");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "2rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1f2937", marginBottom: "0.5rem" }}>
            Manage Students
          </h1>
          <p style={{ color: "#6b7280" }}>
            View and edit information for officially enrolled students
          </p>
        </div>

        {/* Filters */}
        <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", marginBottom: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Student ID or name..."
                className="form-control"
              />
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>
                Grade Level
              </label>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="form-select"
              >
                <option value="">All Grades</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>
                Track
              </label>
              <select
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value)}
                className="form-select"
              >
                <option value="">All Tracks</option>
                <option value="Academic Track">Academic Track</option>
                <option value="TECH-PRO">TECH-PRO</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "0.5rem" }}>
                Strand
              </label>
              <select
                value={strandFilter}
                onChange={(e) => setStrandFilter(e.target.value)}
                className="form-select"
              >
                <option value="">All Strands</option>
                <option value="STEM">STEM</option>
                <option value="HUMSS">HUMSS</option>
                <option value="ABM">ABM</option>
                <option value="ICT">ICT</option>
                <option value="Cookery">Cookery</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
            Loading students...
          </div>
        ) : error ? (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "1rem", borderRadius: "0.5rem" }}>
            {error}
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="table table-hover mb-0">
                <thead style={{ background: "#f9fafb" }}>
                  <tr>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" }}>Student ID</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" }}>Full Name</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" }}>Grade Level</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" }}>Track</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" }}>Strand</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" }}>Contact</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" }}>Status</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                        No students found
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.student_id}>
                        <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace" }}>{student.student_id}</td>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: "500" }}>{student.full_name}</td>
                        <td style={{ padding: "0.75rem 1rem" }}>Grade {student.grade_level}</td>
                        <td style={{ padding: "0.75rem 1rem" }}>{student.track || "N/A"}</td>
                        <td style={{ padding: "0.75rem 1rem" }}>{student.strand || "N/A"}</td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem" }}>{student.phone || student.email}</td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <span className={`badge ${student.account_status === "active" ? "bg-success" : "bg-secondary"}`}>
                            {student.account_status}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              onClick={() => viewStudent(student.student_id)}
                              className="btn btn-sm btn-outline-primary"
                              style={{ fontSize: "0.75rem" }}
                            >
                              View
                            </button>
                            <button
                              onClick={() => openEditModal(student.student_id)}
                              className="btn btn-sm btn-outline-secondary"
                              style={{ fontSize: "0.75rem" }}
                            >
                              Edit
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
        )}

        {/* View Modal */}
        {viewModal && (
          <div 
            className="modal fade show d-block" 
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setViewModal(null)}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Student Information</h5>
                  <button type="button" className="btn-close" onClick={() => setViewModal(null)}></button>
                </div>
                <div className="modal-body">
                  {/* Personal Information */}
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3" style={{ color: "#1f2937", borderBottom: "2px solid #fbbf24", paddingBottom: "0.5rem" }}>Personal Information</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="small text-muted">Student ID</label>
                        <div className="fw-semibold">{viewModal.student_id}</div>
                      </div>
                      <div className="col-md-6">
                        <label className="small text-muted">LRN</label>
                        <div className="fw-semibold">{viewModal.lrn || "N/A"}</div>
                      </div>
                      <div className="col-md-3">
                        <label className="small text-muted">First Name</label>
                        <div className="fw-semibold">{viewModal.first_name || "N/A"}</div>
                      </div>
                      <div className="col-md-3">
                        <label className="small text-muted">Middle Name</label>
                        <div className="fw-semibold">{viewModal.middle_name || "N/A"}</div>
                      </div>
                      <div className="col-md-3">
                        <label className="small text-muted">Last Name</label>
                        <div className="fw-semibold">{viewModal.last_name || "N/A"}</div>
                      </div>
                      <div className="col-md-3">
                        <label className="small text-muted">Extension</label>
                        <div className="fw-semibold">{viewModal.extension_name || "N/A"}</div>
                      </div>
                      <div className="col-md-4">
                        <label className="small text-muted">Date of Birth</label>
                        <div className="fw-semibold">{viewModal.date_of_birth || "N/A"}</div>
                      </div>
                      <div className="col-md-4">
                        <label className="small text-muted">Gender</label>
                        <div className="fw-semibold">{viewModal.gender || "N/A"}</div>
                      </div>
                      <div className="col-md-4">
                        <label className="small text-muted">Civil Status</label>
                        <div className="fw-semibold">{viewModal.civil_status || "N/A"}</div>
                      </div>
                      <div className="col-md-6">
                        <label className="small text-muted">Nationality</label>
                        <div className="fw-semibold">{viewModal.nationality || "N/A"}</div>
                      </div>
                      <div className="col-md-6">
                        <label className="small text-muted">Religion</label>
                        <div className="fw-semibold">{viewModal.religion || "N/A"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3" style={{ color: "#1f2937", borderBottom: "2px solid #fbbf24", paddingBottom: "0.5rem" }}>Contact Information</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="small text-muted">Phone Number</label>
                        <div className="fw-semibold">{viewModal.phone || "N/A"}</div>
                      </div>
                      <div className="col-md-6">
                        <label className="small text-muted">Email Address</label>
                        <div className="fw-semibold">{viewModal.email}</div>
                      </div>
                      <div className="col-12">
                        <label className="small text-muted">Home Address</label>
                        <div className="fw-semibold">{viewModal.address || "N/A"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3" style={{ color: "#1f2937", borderBottom: "2px solid #fbbf24", paddingBottom: "0.5rem" }}>Academic Information</h6>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="small text-muted">Grade Level</label>
                        <div className="fw-semibold">Grade {viewModal.grade_level}</div>
                      </div>
                      <div className="col-md-4">
                        <label className="small text-muted">Track</label>
                        <div className="fw-semibold">{viewModal.track || "N/A"}</div>
                      </div>
                      <div className="col-md-4">
                        <label className="small text-muted">Strand</label>
                        <div className="fw-semibold">{viewModal.strand || "N/A"}</div>
                      </div>
                      <div className="col-md-6">
                        <label className="small text-muted">Learning Modality</label>
                        <div className="fw-semibold">{viewModal.learning_modality || "N/A"}</div>
                      </div>
                      <div className="col-md-6">
                        <label className="small text-muted">School Year</label>
                        <div className="fw-semibold">{viewModal.school_year || "N/A"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Parent/Guardian Information */}
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3" style={{ color: "#1f2937", borderBottom: "2px solid #fbbf24", paddingBottom: "0.5rem" }}>Parent/Guardian Information</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="small text-muted">Father's Name</label>
                        <div className="fw-semibold">{viewModal.father_name || "N/A"}</div>
                      </div>
                      <div className="col-md-6">
                        <label className="small text-muted">Father's Occupation</label>
                        <div className="fw-semibold">{viewModal.father_occupation || "N/A"}</div>
                      </div>
                      <div className="col-md-6">
                        <label className="small text-muted">Mother's Name</label>
                        <div className="fw-semibold">{viewModal.mother_name || "N/A"}</div>
                      </div>
                      <div className="col-md-6">
                        <label className="small text-muted">Mother's Occupation</label>
                        <div className="fw-semibold">{viewModal.mother_occupation || "N/A"}</div>
                      </div>
                      <div className="col-md-4">
                        <label className="small text-muted">Guardian's Name</label>
                        <div className="fw-semibold">{viewModal.guardian_name || "N/A"}</div>
                      </div>
                      <div className="col-md-4">
                        <label className="small text-muted">Guardian Relation</label>
                        <div className="fw-semibold">{viewModal.guardian_relation || "N/A"}</div>
                      </div>
                      <div className="col-md-4">
                        <label className="small text-muted">Guardian Phone</label>
                        <div className="fw-semibold">{viewModal.guardian_phone || "N/A"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Enrollment Status - Read Only */}
                  {viewModal.enrollment_status && (
                    <div className="alert alert-info">
                      <strong>Enrollment Status:</strong> {viewModal.enrollment_status}
                      {viewModal.reviewed_by_principal && (
                        <div className="small mt-1">
                          Approved by: {viewModal.reviewed_by_principal} on {viewModal.principal_reviewed_at ? new Date(viewModal.principal_reviewed_at).toLocaleDateString() : "N/A"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setViewModal(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal - Continue in next message due to length */}
        {editModal && (
          <div 
            className="modal fade show d-block" 
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setEditModal(null)}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <form onSubmit={saveStudentChanges}>
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold">Edit Student Information</h5>
                    <button type="button" className="btn-close" onClick={() => setEditModal(null)}></button>
                  </div>
                  <div className="modal-body">
                    {/* Student ID Section */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3" style={{ color: "#1f2937", borderBottom: "2px solid #fbbf24", paddingBottom: "0.5rem" }}>Student ID</h6>
                      <div className="alert alert-warning">
                        <strong>⚠️ Important:</strong> Changing the Student ID will also update the student's login credentials. The student will use the new ID to log in.
                      </div>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Current Student ID</label>
                          <input type="text" className="form-control" value={editModal.student_id} disabled />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">New Student ID <span className="text-danger">*</span></label>
                          <input 
                            type="text" 
                            name="new_student_id" 
                            className="form-control" 
                            defaultValue={editModal.student_id}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3" style={{ color: "#1f2937", borderBottom: "2px solid #fbbf24", paddingBottom: "0.5rem" }}>Personal Information</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">LRN</label>
                          <input type="text" name="lrn" className="form-control" defaultValue={editModal.lrn || ""} maxLength={12} />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">First Name <span className="text-danger">*</span></label>
                          <input type="text" name="first_name" className="form-control" defaultValue={editModal.first_name || ""} required />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Middle Name</label>
                          <input type="text" name="middle_name" className="form-control" defaultValue={editModal.middle_name || ""} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Last Name <span className="text-danger">*</span></label>
                          <input type="text" name="last_name" className="form-control" defaultValue={editModal.last_name || ""} required />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Extension</label>
                          <input type="text" name="extension_name" className="form-control" defaultValue={editModal.extension_name || ""} placeholder="Jr., Sr., III" />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Date of Birth <span className="text-danger">*</span></label>
                          <input type="date" name="date_of_birth" className="form-control" defaultValue={editModal.date_of_birth || ""} required />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Gender <span className="text-danger">*</span></label>
                          <select name="gender" className="form-select" defaultValue={editModal.gender || ""} required>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Civil Status</label>
                          <select name="civil_status" className="form-select" defaultValue={editModal.civil_status || ""}>
                            <option value="">Select Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Nationality <span className="text-danger">*</span></label>
                          <input type="text" name="nationality" className="form-control" defaultValue={editModal.nationality || ""} required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Religion</label>
                          <input type="text" name="religion" className="form-control" defaultValue={editModal.religion || ""} />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3" style={{ color: "#1f2937", borderBottom: "2px solid #fbbf24", paddingBottom: "0.5rem" }}>Contact Information</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Phone Number <span className="text-danger">*</span></label>
                          <input type="tel" name="phone" className="form-control" defaultValue={editModal.phone || ""} required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Email Address <span className="text-danger">*</span></label>
                          <input type="email" name="email" className="form-control" defaultValue={editModal.email} required />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Home Address <span className="text-danger">*</span></label>
                          <textarea name="address" className="form-control" rows={2} defaultValue={editModal.address || ""} required></textarea>
                        </div>
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3" style={{ color: "#1f2937", borderBottom: "2px solid #fbbf24", paddingBottom: "0.5rem" }}>Academic Information</h6>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label">Grade Level <span className="text-danger">*</span></label>
                          <select name="grade_level" className="form-select" defaultValue={editModal.grade_level} required>
                            <option value="11">Grade 11</option>
                            <option value="12">Grade 12</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Track <span className="text-danger">*</span></label>
                          <select name="track" className="form-select" defaultValue={editModal.track || ""} required>
                            <option value="">Select Track</option>
                            <option value="Academic Track">Academic Track</option>
                            <option value="TECH-PRO">TECH-PRO</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Strand <span className="text-danger">*</span></label>
                          <select name="strand" className="form-select" defaultValue={editModal.strand || ""} required>
                            <option value="">Select Strand</option>
                            <option value="STEM">STEM</option>
                            <option value="HUMSS">HUMSS</option>
                            <option value="ABM">ABM</option>
                            <option value="ICT">ICT</option>
                            <option value="Cookery">Cookery</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Learning Modality <span className="text-danger">*</span></label>
                          <select name="learning_modality" className="form-select" defaultValue={editModal.learning_modality || ""} required>
                            <option value="">Select Modality</option>
                            <option value="Face-to-Face">Face-to-Face</option>
                            <option value="Online">Online</option>
                            <option value="Blended">Blended</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Parent/Guardian Information */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3" style={{ color: "#1f2937", borderBottom: "2px solid #fbbf24", paddingBottom: "0.5rem" }}>Parent/Guardian Information</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Father's Name</label>
                          <input type="text" name="father_name" className="form-control" defaultValue={editModal.father_name || ""} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Father's Occupation</label>
                          <input type="text" name="father_occupation" className="form-control" defaultValue={editModal.father_occupation || ""} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Mother's Name</label>
                          <input type="text" name="mother_name" className="form-control" defaultValue={editModal.mother_name || ""} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Mother's Occupation</label>
                          <input type="text" name="mother_occupation" className="form-control" defaultValue={editModal.mother_occupation || ""} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Guardian's Name</label>
                          <input type="text" name="guardian_name" className="form-control" defaultValue={editModal.guardian_name || ""} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Guardian Relation</label>
                          <input type="text" name="guardian_relation" className="form-control" defaultValue={editModal.guardian_relation || ""} placeholder="e.g., Uncle, Aunt" />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Guardian Phone</label>
                          <input type="tel" name="guardian_phone" className="form-control" defaultValue={editModal.guardian_phone || ""} />
                        </div>
                      </div>
                    </div>

                    {/* Previous School Information */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3" style={{ color: "#1f2937", borderBottom: "2px solid #fbbf24", paddingBottom: "0.5rem" }}>Previous School Information</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Previous School Name</label>
                          <input type="text" name="previous_school" className="form-control" defaultValue={editModal.previous_school || ""} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Years Attended</label>
                          <input type="text" name="years_attended" className="form-control" defaultValue={editModal.years_attended || ""} placeholder="e.g., 2020-2022" />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Previous School Address</label>
                          <textarea name="previous_school_address" className="form-control" rows={2} defaultValue={editModal.previous_school_address || ""}></textarea>
                        </div>
                      </div>
                    </div>

                    {/* Protected Enrollment Status - Read Only */}
                    {editModal.enrollment_status && (
                      <div className="alert alert-info">
                        <strong>🔒 Enrollment Status (Protected):</strong> {editModal.enrollment_status}
                        <div className="small mt-1">
                          This information is controlled by the Principal and cannot be modified here.
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditModal(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div 
            className="modal fade show d-block" 
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSuccessMessage(null)}
          >
            <div className="modal-dialog modal-dialog-centered modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-body text-center p-4">
                  <div className="mb-3">
                    <div 
                      className="rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    >
                      <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                    </div>
                  </div>
                  <h5 className="fw-bold mb-2">Success!</h5>
                  <p className="text-muted mb-3">{successMessage}</p>
                  <button 
                    type="button" 
                    className="btn"
                    style={{ background: "#374151", color: "#fff", border: "none" }}
                    onClick={() => setSuccessMessage(null)}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
