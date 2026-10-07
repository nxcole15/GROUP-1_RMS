// Shared grade request store using localStorage

export type GradeRequestStatus =
  | "student_requested"   // Student submitted the request
  | "teacher_calculating" // Teacher received, working on grade
  | "submitted_to_admin"  // Teacher submitted grade+score to admin
  | "admin_verified"      // Admin verified, returned to teacher
  | "released_to_student" // Teacher released the final grade to student
  | "rejected";           // Rejected at any stage

export interface GradeRequest {
  id: number;
  student: string;
  studentId: string;
  subject: string;
  teacher: string;
  term: string;
  status: GradeRequestStatus;
  requestedAt: string;
  // Filled in by teacher
  score?: number;
  letterGrade?: string;
  remarks?: string;
  submittedToAdminAt?: string;
  // Filled in by admin
  adminVerifiedAt?: string;
  adminVerifiedBy?: string;
  adminNote?: string;
  // Filled in when released
  releasedAt?: string;
  // Rejection info
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

const STORAGE_KEY = "inform_grade_requests";

const INITIAL_DATA: GradeRequest[] = [];

export function loadRequests(): GradeRequest[] {
  if (typeof window === "undefined") return INITIAL_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(raw) as GradeRequest[];
  } catch {
    return INITIAL_DATA;
  }
}

export function saveRequests(reqs: GradeRequest[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reqs));
}

export function updateRequest(id: number, patch: Partial<GradeRequest>): GradeRequest[] {
  const reqs = loadRequests().map(r => r.id === id ? { ...r, ...patch } : r);
  saveRequests(reqs);
  return reqs;
}

export function addRequest(req: Omit<GradeRequest, "id">): GradeRequest[] {
  const reqs = loadRequests();
  const newReq = { ...req, id: Date.now() };
  const updated = [...reqs, newReq];
  saveRequests(updated);
  return updated;
}

export function statusLabel(status: GradeRequestStatus): string {
  switch (status) {
    case "student_requested":   return "📨 Requested";
    case "teacher_calculating": return "📝 Teacher Calculating";
    case "submitted_to_admin":  return "📤 Sent to Admin";
    case "admin_verified":      return "✅ Admin Verified";
    case "released_to_student": return "🎓 Grade Released";
    case "rejected":            return "✕ Rejected";
  }
}

export function statusBadgeClass(status: GradeRequestStatus): string {
  switch (status) {
    case "student_requested":   return "bg-warning-subtle text-warning border border-warning-subtle";
    case "teacher_calculating": return "bg-info-subtle text-info border border-info-subtle";
    case "submitted_to_admin":  return "bg-primary-subtle text-primary border border-primary-subtle";
    case "admin_verified":      return "bg-success-subtle text-success border border-success-subtle";
    case "released_to_student": return "bg-success text-white";
    case "rejected":            return "bg-danger-subtle text-danger border border-danger-subtle";
  }
}
