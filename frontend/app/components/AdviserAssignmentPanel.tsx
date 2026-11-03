"use client";

import React, { useState, useEffect } from "react";
import { API_BASE, getAcademicConfig, type AcademicConfig } from "../lib/auth";

type Student = {
  id: number;
  student_id: string;
  full_name: string;
  grade_level: number;
  track: string | null;
  strand: string | null;
  adviser_name: string | null;
  teacher_id: string | null;
  assignment_id: number | null;
};

type Teacher = {
  id: number;
  teacher_id: string;
  full_name: string;
  department: string;
  email: string;
};

export function AdviserAssignmentPanel() {
  const [academicConfig, setAcademicConfig] = useState<AcademicConfig | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [tracks, setTracks] = useState<string[]>([]);
  const [strands, setStrands] = useState<string[]>([]);
  
  // Filters
  const [gradeLevel, setGradeLevel] = useState<string>("all");
  const [track, setTrack] = useState<string>("all");
  const [strand, setStrand] = useState<string>("all");
  const [adviserStatus, setAdviserStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Selection
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);
  
  // Modals
  const [showIndividualModal, setShowIndividualModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [individualTeacher, setIndividualTeacher] = useState<string>("");
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    studentIds: string[];
    teacherId: string;
    teacherName: string;
    studentCount: number;
  } | null>(null);

  // Load academic config
  useEffect(() => {
    getAcademicConfig().then(setAcademicConfig);
  }, []);

  // Load teachers
  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    fetch(`${API_BASE}/api/admin/advisers/teachers`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success) {
          setTeachers(data.teachers);
        }
      })
      .catch(console.error);
  }, []);

  // Load filter options
  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    fetch(`${API_BASE}/api/admin/advisers/filters?track=${track}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success) {
          setTracks(data.tracks || []);
          setStrands(data.strands || []);
        }
      })
      .catch(console.error);
  }, [track]);

  // Load students with filters
  const loadStudents = () => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setLoading(true);
    const params = new URLSearchParams();
    if (gradeLevel !== "all") params.append("gradeLevel", gradeLevel);
    if (track !== "all") params.append("track", track);
    if (strand !== "all") params.append("strand", strand);
    if (adviserStatus !== "all") params.append("adviserStatus", adviserStatus);
    if (searchQuery) params.append("searchQuery", searchQuery);

    fetch(`${API_BASE}/api/admin/advisers/students?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success) {
          setStudents(data.students || []);
          setAcademicConfig(data.academicPeriod ? {
            school_year: data.academicPeriod.schoolYear,
            current_term: data.academicPeriod.term,
            status: "active",
            enrollment_is_open: false
          } : null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadStudents();
  }, []); // Load initially

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only allow selecting students with the same Grade Level, Track, and Strand
      if (students.length > 0) {
        const firstStudent = students[0];
        const matchingStudents = students.filter(
          (s) =>
            s.grade_level === firstStudent.grade_level &&
            s.track === firstStudent.track &&
            s.strand === firstStudent.strand
        );
        
        if (matchingStudents.length < students.length) {
          setMessage({
            type: "warning",
            text: `Only students with matching Grade Level (${firstStudent.grade_level}), Track (${firstStudent.track || "None"}), and Strand (${firstStudent.strand || "None"}) can be selected together. Applied filters to view matching students only.`
          });
        }
        
        setSelectedStudents(new Set(matchingStudents.map((s) => s.student_id)));
      }
    } else {
      setSelectedStudents(new Set());
    }
  };

  // Handle individual selection
  const handleSelectStudent = (studentId: string, checked: boolean) => {
    const newSelected = new Set(selectedStudents);
    
    if (checked) {
      // Check if this is the first selection or if it matches existing selections
      if (newSelected.size === 0) {
        newSelected.add(studentId);
      } else {
        // Get the first selected student's details
        const firstSelectedId = Array.from(newSelected)[0];
        const firstSelected = students.find((s) => s.student_id === firstSelectedId);
        const currentStudent = students.find((s) => s.student_id === studentId);
        
        if (firstSelected && currentStudent) {
          // Check if they match
          if (
            firstSelected.grade_level === currentStudent.grade_level &&
            firstSelected.track === currentStudent.track &&
            firstSelected.strand === currentStudent.strand
          ) {
            newSelected.add(studentId);
          } else {
            setMessage({
              type: "error",
              text: `Cannot select ${currentStudent.full_name}. All selected students must have the same Grade Level (${firstSelected.grade_level}), Track (${firstSelected.track || "None"}), and Strand (${firstSelected.strand || "None"}).`
            });
            return;
          }
        }
      }
    } else {
      newSelected.delete(studentId);
    }
    
    setSelectedStudents(newSelected);
  };

  // Handle bulk assignment
  const handleBulkAssign = () => {
    if (selectedStudents.size === 0) {
      setMessage({ type: "warning", text: "Please select at least one student" });
      return;
    }
    if (!selectedTeacher) {
      setMessage({ type: "warning", text: "Please select a teacher to assign as adviser" });
      return;
    }

    const teacher = teachers.find((t) => String(t.id) === selectedTeacher);
    if (!teacher) return;

    // Check if any selected student already has an adviser
    const studentsWithAdviser = students.filter(
      (s) => selectedStudents.has(s.student_id) && s.adviser_name
    );

    if (studentsWithAdviser.length > 0) {
      setConfirmData({
        studentIds: Array.from(selectedStudents),
        teacherId: selectedTeacher,
        teacherName: teacher.full_name,
        studentCount: selectedStudents.size,
      });
      setShowConfirmModal(true);
      return;
    }

    // No conflicts, proceed with assignment
    performBulkAssignment(Array.from(selectedStudents), selectedTeacher, false);
  };

  // Perform bulk assignment
  const performBulkAssignment = (studentIds: string[], teacherId: string, replace: boolean) => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setLoading(true);
    fetch(`${API_BASE}/api/admin/advisers/assign`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        studentIds,
        teacherId: parseInt(teacherId),
        replace,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setMessage({ type: "success", text: data.message });
          setSelectedStudents(new Set());
          setSelectedTeacher("");
          loadStudents();
        } else if (data.requiresConfirmation) {
          // Show confirmation modal
          const teacher = teachers.find((t) => String(t.id) === teacherId);
          setConfirmData({
            studentIds,
            teacherId,
            teacherName: teacher?.full_name || "",
            studentCount: studentIds.length,
          });
          setShowConfirmModal(true);
        } else {
          // Handle validation errors
          let errorMessage = data.message || "Failed to assign adviser";
          
          if (data.details && data.details.mismatches) {
            errorMessage += "\n\nMismatched students:";
            data.details.mismatches.forEach((mismatch: any) => {
              errorMessage += `\n• ${mismatch.student_name} (${mismatch.student_id}): ${mismatch.issues}`;
            });
            
            if (data.details.expected) {
              errorMessage += `\n\nExpected: Grade ${data.details.expected.grade_level}, Track: ${data.details.expected.track}, Strand: ${data.details.expected.strand}`;
            }
          }
          
          setMessage({ type: "error", text: errorMessage });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setMessage({ type: "error", text: "Failed to assign adviser" });
        setLoading(false);
      });
  };

  // Handle individual assignment
  const handleIndividualAssign = (student: Student) => {
    setSelectedStudent(student);
    setIndividualTeacher(student.assignment_id ? String(teachers.find(t => t.teacher_id === student.teacher_id)?.id || "") : "");
    setShowIndividualModal(true);
  };

  const performIndividualAssignment = () => {
    if (!selectedStudent || !individualTeacher) return;

    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setLoading(true);
    fetch(`${API_BASE}/api/admin/advisers/assign`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        studentIds: [selectedStudent.student_id],
        teacherId: parseInt(individualTeacher),
        replace: !!selectedStudent.assignment_id,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setMessage({ type: "success", text: data.message });
          setShowIndividualModal(false);
          loadStudents();
        } else {
          setMessage({ type: "error", text: data.message || "Failed to assign adviser" });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setMessage({ type: "error", text: "Failed to assign adviser" });
        setLoading(false);
      });
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ fontSize: "1.5rem", color: "#1e293b" }}>
          Adviser Assignment
        </h2>
        <p className="text-muted" style={{ fontSize: "0.875rem" }}>
          Assign teachers as advisers to students
        </p>
      </div>

      {/* Academic Period Display */}
      {academicConfig ? (
        <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="text-white-50" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                  SCHOOL YEAR
                </div>
                <div className="text-white fw-bold" style={{ fontSize: "1.25rem" }}>
                  {academicConfig.school_year}
                </div>
              </div>
              <div className="col-md-6">
                <div className="text-white-50" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                  CURRENT TERM
                </div>
                <div className="text-white fw-bold" style={{ fontSize: "1.25rem" }}>
                  {academicConfig.current_term}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}>
              <small className="text-white-50">
                ℹ️ These values are configured by the Principal Admin and cannot be changed here.
              </small>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-warning">
          Academic period has not been configured. Please contact the Principal Admin.
        </div>
      )}

      {/* Assignment Rules Info */}
      <div className="alert alert-info d-flex align-items-start gap-2 mb-4">
        <div style={{ fontSize: "1.25rem" }}>📋</div>
        <div>
          <div className="fw-bold mb-1">Adviser Assignment Rules</div>
          <div className="small">
            Students can only be assigned to an adviser when they belong to the same <strong>Grade Level, Track, and Strand</strong>. 
            Use the filters below to select the academic grouping, then select students and assign an adviser.
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3" style={{ fontSize: "1rem" }}>
            Filters
          </h5>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Grade Level</label>
              <select
                className="form-select"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
              >
                <option value="all">All Grades</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Track</label>
              <select
                className="form-select"
                value={track}
                onChange={(e) => {
                  setTrack(e.target.value);
                  setStrand("all");
                }}
              >
                <option value="all">All Tracks</option>
                {tracks.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Strand</label>
              <select
                className="form-select"
                value={strand}
                onChange={(e) => setStrand(e.target.value)}
                disabled={track === "all"}
              >
                <option value="all">All Strands</option>
                {strands.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Adviser Status</label>
              <select
                className="form-select"
                value={adviserStatus}
                onChange={(e) => setAdviserStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="unassigned">No Adviser Assigned</option>
                <option value="assigned">Adviser Assigned</option>
              </select>
            </div>
          </div>
          <div className="row g-3 mt-2">
            <div className="col-md-8">
              <label className="form-label small fw-semibold">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by student name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button
                className="btn btn-primary w-100"
                onClick={loadStudents}
                disabled={loading}
              >
                {loading ? "Loading..." : "Apply Filter"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div 
          className={`alert alert-${message.type === "success" ? "success" : message.type === "warning" ? "warning" : "danger"} alert-dismissible fade show`}
          style={{ whiteSpace: "pre-line" }}
        >
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
        </div>
      )}

      {/* Bulk Assignment */}
      {selectedStudents.size > 0 && (
        <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ background: "#f8fafc" }}>
          <div className="card-body p-4">
            {/* Show selected academic grouping */}
            {(() => {
              const firstSelectedId = Array.from(selectedStudents)[0];
              const firstSelected = students.find((s) => s.student_id === firstSelectedId);
              return firstSelected ? (
                <div className="mb-3 pb-3" style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <div className="small fw-semibold text-muted mb-2">SELECTED ACADEMIC GROUPING:</div>
                  <div className="d-flex gap-3 flex-wrap">
                    <div>
                      <span className="badge bg-primary">Grade {firstSelected.grade_level}</span>
                    </div>
                    <div>
                      <span className="badge bg-info">{firstSelected.track || "No Track"}</span>
                    </div>
                    <div>
                      <span className="badge bg-success">{firstSelected.strand || "No Strand"}</span>
                    </div>
                  </div>
                  <div className="small text-muted mt-2">
                    ℹ️ All selected students must match this Grade Level, Track, and Strand
                  </div>
                </div>
              ) : null;
            })()}
            
            <div className="row g-3 align-items-end">
              <div className="col-md-auto">
                <div className="fw-bold" style={{ fontSize: "0.875rem", color: "#475569" }}>
                  Selected Students: <span style={{ color: "#4f46e5" }}>{selectedStudents.size}</span>
                </div>
              </div>
              <div className="col-md-5">
                <label className="form-label small fw-semibold">Assign Adviser</label>
                <select
                  className="form-select"
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} ({t.teacher_id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-auto">
                <button
                  className="btn btn-primary"
                  onClick={handleBulkAssign}
                  disabled={loading || !selectedTeacher}
                >
                  Assign Adviser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students Table */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <tr>
                  <th className="px-4 py-3" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      checked={selectedStudents.size === students.length && students.length > 0}
                    />
                  </th>
                  <th className="px-4 py-3" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>
                    STUDENT ID
                  </th>
                  <th className="px-4 py-3" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>
                    STUDENT NAME
                  </th>
                  <th className="px-4 py-3" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>
                    GRADE
                  </th>
                  <th className="px-4 py-3" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>
                    TRACK
                  </th>
                  <th className="px-4 py-3" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>
                    STRAND
                  </th>
                  <th className="px-4 py-3" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>
                    CURRENT ADVISER
                  </th>
                  <th className="px-4 py-3" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5 text-muted">
                      No students found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.student_id}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedStudents.has(student.student_id)}
                          onChange={(e) => handleSelectStudent(student.student_id, e.target.checked)}
                        />
                      </td>
                      <td className="px-4 py-3" style={{ fontSize: "0.875rem" }}>
                        {student.student_id}
                      </td>
                      <td className="px-4 py-3" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                        {student.full_name}
                      </td>
                      <td className="px-4 py-3" style={{ fontSize: "0.875rem" }}>
                        {student.grade_level}
                      </td>
                      <td className="px-4 py-3" style={{ fontSize: "0.875rem" }}>
                        {student.track || "—"}
                      </td>
                      <td className="px-4 py-3" style={{ fontSize: "0.875rem" }}>
                        {student.strand || "—"}
                      </td>
                      <td className="px-4 py-3" style={{ fontSize: "0.875rem" }}>
                        {student.adviser_name || (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleIndividualAssign(student)}
                        >
                          {student.adviser_name ? "Change Adviser" : "Assign Adviser"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Individual Assignment Modal */}
      {showIndividualModal && selectedStudent && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowIndividualModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {selectedStudent.adviser_name ? "Change Adviser" : "Assign Adviser"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowIndividualModal(false)}
                ></button>
              </div>
              <div className="modal-body pt-2">
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Student</label>
                  <div className="fw-bold">{selectedStudent.full_name}</div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-4">
                    <label className="form-label small fw-semibold text-muted">Grade Level</label>
                    <div>{selectedStudent.grade_level}</div>
                  </div>
                  <div className="col-4">
                    <label className="form-label small fw-semibold text-muted">Track</label>
                    <div>{selectedStudent.track || "—"}</div>
                  </div>
                  <div className="col-4">
                    <label className="form-label small fw-semibold text-muted">Strand</label>
                    <div>{selectedStudent.strand || "—"}</div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">School Year</label>
                  <div>{academicConfig?.school_year} (read-only)</div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Term</label>
                  <div>{academicConfig?.current_term} (read-only)</div>
                </div>
                {selectedStudent.adviser_name && (
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Current Adviser</label>
                    <div>{selectedStudent.adviser_name}</div>
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    {selectedStudent.adviser_name ? "New Adviser" : "Select Adviser"}
                  </label>
                  <select
                    className="form-select"
                    value={individualTeacher}
                    onChange={(e) => setIndividualTeacher(e.target.value)}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name} ({t.teacher_id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-secondary" onClick={() => setShowIndividualModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={performIndividualAssignment}
                  disabled={!individualTeacher || loading}
                >
                  {selectedStudent.adviser_name ? "Change Adviser" : "Assign Adviser"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmData && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowConfirmModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Confirm Adviser Replacement</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirmModal(false)}
                ></button>
              </div>
              <div className="modal-body pt-2">
                <p>
                  Some of the selected students already have an adviser assigned. Do you want to replace
                  their current adviser with <strong>{confirmData.teacherName}</strong>?
                </p>
                <p className="text-muted small">
                  This will assign <strong>{confirmData.teacherName}</strong> as the adviser for{" "}
                  <strong>{confirmData.studentCount}</strong> student(s) for{" "}
                  <strong>{academicConfig?.school_year}, {academicConfig?.current_term}</strong>.
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-warning"
                  onClick={() => {
                    setShowConfirmModal(false);
                    performBulkAssignment(confirmData.studentIds, confirmData.teacherId, false);
                  }}
                >
                  Skip Students with Advisers
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowConfirmModal(false);
                    performBulkAssignment(confirmData.studentIds, confirmData.teacherId, true);
                  }}
                >
                  Replace Advisers
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
