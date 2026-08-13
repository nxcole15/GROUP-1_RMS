"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE } from "../../lib/auth";

const TIMELOG_KEY = "inform_teacher_timelog";

/* -- Icon Component -- */
type IconName =
  | "overview" | "students" | "teachers" | "grades" | "requests" | "documents"
  | "enrollment" | "tuition" | "announcements" | "timelog"
  | "check" | "checkCircle" | "x" | "close" | "calendar" | "clock" | "bell"
  | "file" | "chart" | "send" | "refresh" | "alert" | "book" | "user"
  | "shield" | "activity" | "lock" | "unlock" | "arrowRight" | "search";

function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  const props = {
    width: size, height: size, fill: "none", viewBox: "0 0 24 24",
    stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const, className, "aria-hidden": true as const,
  };
  switch (name) {
    case "overview":      return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case "students":      return <svg {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
    case "teachers":      return <svg {...props}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8h.01M12 8h5M7 12h10"/></svg>;
    case "grades":        return <svg {...props}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
    case "requests":      return <svg {...props}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 0118 2.18 2 2 0 0120 2h0"/><path d="M14.05 2a9 9 0 018 7.94"/><path d="M14.05 6A5 5 0 0120 11.94"/><polyline points="12 17 16 17 16 21"/></svg>;
    case "documents":     return <svg {...props}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
    case "enrollment":    return <svg {...props}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 12l2 2 4-4"/></svg>;
    case "tuition":       return <svg {...props}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
    case "announcements": return <svg {...props}><path d="M22 17H2a3 3 0 000 6h20v-6z"/><path d="M21 6a3 3 0 00-3-3H6a3 3 0 00-3 3v11h18V6z"/><path d="M12 14v-6"/><path d="M9 11l3-3 3 3"/></svg>;
    case "timelog":       return <svg {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case "check":         return <svg {...props}><polyline points="20 6 9 17 4 12"/></svg>;
    case "checkCircle":   return <svg {...props}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
    case "x":
    case "close":         return <svg {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case "calendar":      return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "clock":         return <svg {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case "bell":          return <svg {...props}><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>;
    case "file":          return <svg {...props}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case "chart":         return <svg {...props}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
    case "send":          return <svg {...props}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
    case "refresh":       return <svg {...props}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>;
    case "alert":         return <svg {...props}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
    case "book":          return <svg {...props}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;
    case "user":          return <svg {...props}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case "shield":        return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case "activity":      return <svg {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case "lock":          return <svg {...props}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
    case "unlock":        return <svg {...props}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 019.9-1"/></svg>;
    case "arrowRight":    return <svg {...props}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    case "search":        return <svg {...props}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    default:              return <svg {...props}><circle cx="12" cy="12" r="10"/></svg>;
  }
}

export type TimeLogEntry = {
  id: number;
  teacherId: string;
  teacherName: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
  status: "in" | "out";
};

function loadTimeLogs(): TimeLogEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(TIMELOG_KEY) || "[]"); } catch { return []; }
}
function saveTimeLogs(logs: TimeLogEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TIMELOG_KEY, JSON.stringify(logs));
}

/* -- Data -- */
const teacherData = {
  teacher_id: "T001",
  full_name: "Maria Santos",
  department: "Mathematics",
  email: "maria.santos@cfei.edu",
};

const subjects = [
  { id: 1, code: "MATH101", name: "Algebra I",  units: 3, enrolled: 35, max: 40 },
  { id: 2, code: "MATH102", name: "Geometry",   units: 3, enrolled: 32, max: 40 },
  { id: 3, code: "MATH201", name: "Calculus I", units: 4, enrolled: 28, max: 35 },
];

const teacherSchedule = [
  { day: "Monday",    time: "07:30-08:30", subject: "Algebra I",  room: "Room 301", enter: "07:25", leave: "08:35" },
  { day: "Monday",    time: "08:30-09:30", subject: "Geometry",   room: "Room 205", enter: "08:25", leave: "09:35" },
  { day: "Tuesday",   time: "07:30-09:00", subject: "Calculus I", room: "Sci. Lab", enter: "07:20", leave: "09:05" },
  { day: "Wednesday", time: "07:30-08:30", subject: "Algebra I",  room: "Room 301", enter: "07:25", leave: "08:35" },
  { day: "Thursday",  time: "07:30-09:00", subject: "Calculus I", room: "Sci. Lab", enter: "07:20", leave: "09:05" },
  { day: "Friday",    time: "07:30-08:30", subject: "Algebra I",  room: "Room 301", enter: "07:25", leave: "08:35" },
];

const students = [
  { id: "STU-2024-001", name: "Jamie Santos",    pathway: "Academic", grade: 11, status: "Active" },
  { id: "STU-2024-002", name: "Maria Reyes",     pathway: "Academic", grade: 11, status: "Active" },
  { id: "STU-2024-003", name: "Carlo Dela Cruz", pathway: "Academic", grade: 12, status: "Active" },
  { id: "STU-2024-005", name: "Luis Fernandez",  pathway: "Academic", grade: 12, status: "Active" },
  { id: "STU-2024-008", name: "Lena Cruz",       pathway: "Academic", grade: 11, status: "Active" },
];

const grades = [
  { student_id: "STU-2024-001", name: "Jamie Santos",    subject: "Algebra I",  percentage: 92, term: "Term 1" },
  { student_id: "STU-2024-002", name: "Maria Reyes",     subject: "Algebra I",  percentage: 87, term: "Term 1" },
  { student_id: "STU-2024-003", name: "Carlo Dela Cruz", subject: "Calculus I", percentage: 95, term: "Term 1" },
  { student_id: "STU-2024-005", name: "Luis Fernandez",  subject: "Calculus I", percentage: 88, term: "Term 1" },
];

const gradeRequestsTeacher = [
  { id: 1, student: "Jamie Santos",    subject: "Algebra I",  status: "pending",  requestedAt: "2h ago" },
  { id: 2, student: "Maria Reyes",     subject: "Algebra I",  status: "pending",  requestedAt: "1h ago" },
  { id: 3, student: "Carlo Dela Cruz", subject: "Calculus I", status: "approved", requestedAt: "30m ago" },
];

const attendance = [
  { student_id: "STU-2024-001", name: "Jamie Santos",    subject: "Algebra I",  present: 18, total: 20, percentage: 90 },
  { student_id: "STU-2024-002", name: "Maria Reyes",     subject: "Algebra I",  present: 19, total: 20, percentage: 95 },
  { student_id: "STU-2024-003", name: "Carlo Dela Cruz", subject: "Calculus I", present: 17, total: 20, percentage: 85 },
  { student_id: "STU-2024-005", name: "Luis Fernandez",  subject: "Calculus I", present: 20, total: 20, percentage: 100 },
];

const recentActivity = [
  { action: "Grade Submitted",    name: "Jamie Santos",    time: "2h ago",   icon: "chart" },
  { action: "Attendance Updated", name: "Maria Reyes",     time: "3h ago",   icon: "calendar" },
  { action: "Grade Submitted",    name: "Carlo Dela Cruz", time: "5h ago",   icon: "chart" },
  { action: "Attendance Updated", name: "Luis Fernandez",  time: "Yesterday",icon: "calendar" },
];

const teacherNotifications = [
  { id: 1, type: "document",   title: "Document Request",   message: "Jamie Santos requested a TOR",                        time: "1h ago", read: false, icon: "file" },
  { id: 2, type: "grade",      title: "Grade Submitted",    message: "Your grades for Algebra I have been submitted",       time: "2h ago", read: false, icon: "check" },
  { id: 3, type: "enrollment", title: "New Student Enrolled",message: "Rosa Bautista enrolled in your Geometry class",     time: "1d ago", read: true,  icon: "students" },
];

const documentApprovals = [
  { id: 1, student: "Jamie Santos",    type: "TOR",         status: "pending",  requestedAt: "May 18, 2026", approvedAt: "",            icon: "file" },
  { id: 2, student: "Maria Reyes",     type: "Certificate", status: "pending",  requestedAt: "May 17, 2026", approvedAt: "",            icon: "file" },
  { id: 3, student: "Carlo Dela Cruz", type: "TOR",         status: "approved", requestedAt: "May 15, 2026", approvedAt: "May 16, 2026",icon: "checkCircle" },
];

/* -- Trimester deadline logic -- */
const TEACHER_TERM_DEADLINES: Record<string, Date> = {
  "Term 1": new Date("2026-02-28"),
  "Term 2": new Date("2026-05-15"),
  "Term 3": new Date("2026-07-15"),
};
function getActiveTerm() {
  const now = new Date();
  const entries = Object.entries(TEACHER_TERM_DEADLINES);
  const upcoming = entries.filter(([, d]) => d >= now);
  return upcoming.length > 0 ? upcoming[0][0] : entries[entries.length - 1][0];
}
function isDeadlinePassed() {
  return new Date() > TEACHER_TERM_DEADLINES[getActiveTerm()];
}

type Panel = "overview"|"subjects"|"schedule"|"students"|"grades"|"attendance"|"requests"|"documents"|"notifications"|"timelog";

const navItems: { id: Panel|"overview"; label: string; icon: string }[] = [
  { id: "overview",       label: "Overview",        icon: "overview" },
  { id: "subjects",       label: "My Classes",       icon: "book" },
  { id: "schedule",       label: "My Schedule",      icon: "calendar" },
  { id: "students",       label: "My Students",      icon: "students" },
  { id: "grades",         label: "Submit Grades",    icon: "chart" },
  { id: "requests",       label: "Grade Requests",   icon: "requests" },
  { id: "attendance",     label: "Attendance",       icon: "activity" },
  { id: "documents",      label: "Documents",        icon: "documents" },
  { id: "timelog" as Panel, label: "Time Log", icon: "clock" },
];

/* -- Sidebar -- */
function Sidebar({ active, setActive, show, setShow, onExpandChange }: { active: string; setActive: (s: Panel) => void; show: boolean; setShow: (b: boolean) => void; onExpandChange?: (expanded: boolean) => void }) {
  const expanded = true;
  useEffect(() => {
    onExpandChange?.(true);
  }, [onExpandChange]);
  return (
    <>
      {show && <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" style={{ zIndex: 1040 }} onClick={() => setShow(false)} />}
      <div
        className={`dashboard-sidebar d-flex flex-column flex-shrink-0 position-fixed top-0 start-0 h-100 ${show ? "" : "d-none d-lg-flex"}`}
        style={{ width: 256, zIndex: 1045, background: "linear-gradient(180deg,#1e1b4b 0%,#312e81 100%)", overflowY: "auto", overflowX: "hidden" }}
      >
        {/* Logo */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-group" style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" }}>
            <img src="/cfei-logo.jpg" alt="CFEI" className="sidebar-brand-logo" />
            <div className="sidebar-brand-info" style={{ alignItems: "center", textAlign: "center", marginTop: 10 }}>
              <div className="sidebar-brand-title">Teacher Portal</div>
            </div>
          </div>
          <button className="btn-close btn-close-white sidebar-brand-close d-lg-none" onClick={() => setShow(false)} />
        </div>

        {/* Profile - Right after Teacher Portal */}
        <div className="px-3 mt-3 mb-2">
          <Link href="/teacher/profile" className="text-decoration-none">
            <div className="d-flex align-items-center gap-3 rounded-3 px-3 py-2" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>
              <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0" style={{ width: 36, height: 36, fontSize: 13, background: "linear-gradient(135deg,#059669,#10b981)" }}>
                {teacherData.full_name.split(" ").map(n => n[0]).join("").slice(0,2)}
              </div>
              <div className="flex-grow-1 overflow-hidden">
                <div className="text-white small fw-semibold text-truncate">{teacherData.full_name}</div>
                <div className="text-truncate" style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{teacherData.teacher_id}</div>
              </div>
              <span style={{ color: "rgba(255,255,255,0.5)" }}><Icon name="arrowRight" size={16} /></span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-grow-1 px-3 py-2 d-flex flex-column gap-1 mt-2">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActive(item.id as Panel); setShow(false); }}
              className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0"
              style={{ color: active === item.id ? "#fff" : "rgba(255,255,255,0.5)", background: active === item.id ? "#059669" : "transparent", justifyContent: expanded ? "flex-start" : "center", whiteSpace: "nowrap" }}
              title={item.label}>
              <Icon name={item.icon as IconName} size={20} />
              {expanded && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout button - More visible at bottom */}
        <div className="px-3 py-3 border-top border-white border-opacity-10">
          <Link href="/login" className="btn w-100 fw-semibold py-2 d-flex align-items-center justify-content-center gap-2" style={{ background: "rgba(220,38,38,0.15)", color: "#fca5a5", border: "1px solid rgba(220,38,38,0.3)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.25)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(220,38,38,0.15)"; e.currentTarget.style.color = "#fca5a5"; }}
            onClick={() => { localStorage.removeItem("inform_token"); localStorage.removeItem("inform_role"); localStorage.removeItem("inform_user"); }}>
            <Icon name="unlock" size={18} />
            <span>Log Out</span>
          </Link>
        </div>
      </div>
    </>
  );
}

/* -- Overview -- */
function Overview({ setActive, isGradeLocked, activeTerm, teacher }: { setActive: (s: Panel) => void; isGradeLocked: boolean; activeTerm: string; teacher?: { teacher_id: string; full_name: string; department: string } | null }) {
  const displayTeacher = teacher ?? teacherData;
  const pendingRequests = gradeRequestsTeacher.filter(r => r.status === "pending").length;
  const avgGrade = Math.round(grades.reduce((a, g) => a + g.percentage, 0) / grades.length);

  return (
    <div className="d-flex flex-column gap-4">
      {/* Welcome */}
      <div className="rounded-3 p-4" style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 8px 32px rgba(5,150,105,0.25)" }}>
        <h2 className="text-white fw-black fs-4 mb-1">Welcome back, {displayTeacher.full_name} </h2>
        <p className="text-white-50 small mb-0">Department: {displayTeacher.department}  {displayTeacher.teacher_id}</p>
      </div>

      {/* Lock banner */}
      {isGradeLocked && (
        <div className="rounded-3 p-3 d-flex align-items-start gap-3" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <div style={{ color: "rgba(220,38,38,0.8)", marginTop: 2 }}><Icon name="alert" size={20} /></div>
          <div>
            <div className="fw-bold small text-danger">Grade Submission Locked – {activeTerm} Deadline Passed</div>
            <div className="text-muted small">You have unresolved grade requests. Visit the <strong>Registrar&apos;s Office</strong> to restore access.</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="row g-3">
        {[
          { label: "My Classes",       value: subjects.length,    icon: "book", cls: "border-primary-subtle bg-primary-subtle",   val: "text-primary"   },
          { label: "My Students",      value: students.length,    icon: "students", cls: "border-success-subtle bg-success-subtle",   val: "text-success"   },
          { label: "Class Avg. Grade", value: `${avgGrade}%`,     icon: "chart", cls: "border-warning-subtle bg-warning-subtle",   val: "text-warning"   },
          { label: "Pending Requests", value: pendingRequests,    icon: "requests", cls: "border-danger-subtle bg-danger-subtle",     val: "text-danger"    },
        ].map(s => (
          <div key={s.label} className="col-6 col-lg-3">
            <div className={`card border rounded-3 h-100 ${s.cls}`}>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">{s.label}</span>
                  <Icon name={s.icon as IconName} size={24} />
                </div>
                <div className={`fw-black fs-3 ${s.val}`}>{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity + Class Summary */}
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4">
              <h3 className="fw-bold small text-dark mb-3">Recent Activity</h3>
              <div className="d-flex flex-column gap-3">
                {recentActivity.map((a, i) => (
                  <div key={i} className="d-flex align-items-center gap-3">
                    <div className="rounded-3 bg-light border d-flex align-items-center justify-content-center flex-shrink-0 text-primary" style={{ width: 36, height: 36 }}><Icon name={a.icon as IconName} size={18} /></div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="small fw-semibold text-dark text-truncate">{a.action}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{a.name}</div>
                    </div>
                    <span className="text-muted flex-shrink-0" style={{ fontSize: 11 }}>{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4">
              <h3 className="fw-bold small text-dark mb-3">Class Summary</h3>
              <div className="d-flex flex-column gap-3">
                {subjects.map(s => (
                  <div key={s.id} className="d-flex align-items-center gap-3">
                    <div className="rounded-3 bg-success bg-opacity-10 border border-success border-opacity-25 d-flex align-items-center justify-content-center flex-shrink-0 text-success" style={{ width: 36, height: 36 }}><Icon name="book" size={18} /></div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="small fw-semibold text-dark text-truncate">{s.name}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{s.code} – {s.units} units</div>
                    </div>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">{s.enrolled}/{s.max}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -- Schedule Panel -- */
function SchedulePanel() {
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
  const todayIdx = Math.min(new Date().getDay() - 1, 4);
  const [day, setDay] = useState(days[todayIdx >= 0 ? todayIdx : 0]);
  const daySchedule = teacherSchedule.filter(s => s.day === day);
  return (
    <div className="d-flex flex-column gap-4">
      <div><h2 className="fw-black fs-4 text-dark mb-1">My Teaching Schedule</h2><p className="text-muted small mb-0">Term 1     2025-2026</p></div>
      <div className="d-flex gap-2 overflow-auto pb-1">
        {days.map(d => (
          <button key={d} onClick={() => setDay(d)}
            className={`btn btn-sm flex-shrink-0 ${day === d ? "btn-success text-white" : "btn-outline-secondary"}`}>
            {d.slice(0, 3)}
          </button>
        ))}
      </div>
      {daySchedule.length === 0
        ? <div className="card border-0 shadow-sm rounded-3"><div className="card-body p-4 text-center text-muted small">No classes scheduled for {day}</div></div>
        : <div className="d-flex flex-column gap-3">
            {daySchedule.map((cls, i) => (
              <div key={i} className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div><div className="fw-bold text-dark">{cls.subject}</div><div className="text-muted small"> {cls.room}</div></div>
                    <span className="badge bg-dark text-white">{cls.time}</span>
                  </div>
                  <div className="row g-2">
                    {[[" Room", cls.room, "bg-light"], ["✓ Enter", cls.enter, "bg-success bg-opacity-10 border-success border-opacity-25"], ["✓ Leave", cls.leave, "bg-danger bg-opacity-10 border-danger border-opacity-25"], ["👥 Students", String(subjects.find(s => s.name === cls.subject)?.enrolled || 0), "bg-info bg-opacity-10 border-info border-opacity-25"]].map(([label, val, bg]) => (
                      <div key={label} className="col-6 col-sm-3">
                        <div className={`rounded-3 p-3 border ${bg}`}>
                          <div className="text-muted small mb-1">{label}</div>
                          <div className="fw-bold text-dark small">{val}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

/* -- Subjects Panel -- */
function SubjectsPanel({ subjects: propSubjects }: { subjects?: typeof subjects } = {}) {
  const displaySubjects = propSubjects ?? subjects;
  return (
    <div className="d-flex flex-column gap-4">
      <div><h2 className="fw-black fs-4 text-dark mb-1">My Classes</h2><p className="text-muted small mb-0">{subjects.length} classes assigned</p></div>
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing: "0.05em" }}>Code</th>
                <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>Subject</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-sm-table-cell" style={{ letterSpacing: "0.05em" }}>Units</th>
                <th className="small text-muted fw-semibold text-uppercase text-end pe-4" style={{ letterSpacing: "0.05em" }}>Enrollment</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(s => (
                <tr key={s.id}>
                  <td className="ps-4 small fw-semibold text-muted">{s.code}</td>
                  <td className="small fw-medium text-dark">{s.name}</td>
                  <td className="d-none d-sm-table-cell small text-muted">{s.units}</td>
                  <td className="text-end pe-4">
                    <div className="d-flex align-items-center justify-content-end gap-2">
                      <div className="progress flex-shrink-0" style={{ width: 60, height: 6 }}>
                        <div className="progress-bar bg-success" style={{ width: `${(s.enrolled / s.max) * 100}%` }} />
                      </div>
                      <span className="small fw-semibold text-dark">{s.enrolled}/{s.max}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* -- Students Panel -- */
function StudentsPanel({ students: propStudents }: { students?: typeof students } = {}) {
  const [search, setSearch] = useState("");
  const displayStudents = propStudents ?? students;
  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="d-flex flex-column gap-4">
      <div><h2 className="fw-black fs-4 text-dark mb-1">My Students</h2><p className="text-muted small mb-0">{displayStudents.length} students in your classes</p></div>
      <div className="input-group shadow-sm" style={{ maxWidth: 400 }}>
        <span className="input-group-text bg-white"><Icon name="search" size={18} /></span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..." className="form-control border-start-0" />
      </div>
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing: "0.05em" }}>Name</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-sm-table-cell" style={{ letterSpacing: "0.05em" }}>ID</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-lg-table-cell" style={{ letterSpacing: "0.05em" }}>Pathway</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-lg-table-cell" style={{ letterSpacing: "0.05em" }}>Grade</th>
                <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={5} className="text-center py-4 small text-muted">No students found.</td></tr>
                : filtered.map(s => (
                  <tr key={s.id}>
                    <td className="ps-4 small fw-medium text-dark">{s.name}</td>
                    <td className="d-none d-sm-table-cell small text-muted">{s.id}</td>
                    <td className="d-none d-lg-table-cell small text-muted">{s.pathway}</td>
                    <td className="d-none d-lg-table-cell small text-muted">Grade {s.grade}</td>
                    <td><span className={`badge ${s.status === "Active" ? "bg-success-subtle text-success border border-success-subtle" : "bg-secondary-subtle text-secondary border border-secondary-subtle"}`}>{s.status}</span></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* -- Grades Panel -- */
function GradesPanel({ isGradeLocked, activeTerm }: { isGradeLocked: boolean; activeTerm: string }) {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
  const [apiGrades, setApiGrades] = useState<{student_id:string;full_name:string;percentage:number;term:string}[]>([]);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [gradesError, setGradesError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    if (!token || token.startsWith("demo_")) return;
    setGradesLoading(true);
    setGradesError(false);
    fetch(`${API_BASE}/api/teacher/grades/${selectedSubject}`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.grades?.length) setApiGrades(data.grades);
        else setApiGrades([]);
      })
      .catch(() => setGradesError(true))
      .finally(() => setGradesLoading(false));
  }, [selectedSubject]);

  const displayGrades = apiGrades.length > 0
    ? apiGrades.map(g => ({ student_id: g.student_id, name: g.full_name, subject: subjects.find(s=>s.id===selectedSubject)?.name ?? "", percentage: g.percentage, term: g.term }))
    : grades.filter(g => g.subject === subjects.find(s => s.id === selectedSubject)?.name);

  const avg = displayGrades.length > 0 ? Math.round(displayGrades.reduce((a, g) => a + g.percentage, 0) / displayGrades.length) : 0;
  return (
    <div className="d-flex flex-column gap-4">
      <div><h2 className="fw-black fs-4 text-dark mb-1">Grade Management</h2><p className="text-muted small mb-0">Submit and manage student grades</p></div>
      {isGradeLocked && (
        <div className="rounded-3 p-3 d-flex align-items-start gap-3" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <div style={{ color: "rgba(220,38,38,0.8)", marginTop: 2 }}><Icon name="alert" size={20} /></div>
          <div>
            <div className="fw-bold small text-danger">Grade Submission Locked – {activeTerm} deadline passed</div>
            <div className="text-muted small">This panel is read-only. Visit the <strong>Registrar&apos;s Office</strong> to restore access.</div>
          </div>
        </div>
      )}
      <div className="d-flex gap-3 flex-wrap align-items-center">
        <div style={{ width: 220 }}>
          <label className="form-label fw-semibold text-uppercase mb-1" style={{ fontSize: 11 }}>Select Subject</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(Number(e.target.value))} className="form-select form-select-sm rounded-3">
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="card border-0 bg-success-subtle flex-grow-1 rounded-3">
          <div className="card-body p-3 d-flex align-items-center gap-3">
            <Icon name="chart" size={24} className="text-success" />
            <div className="flex-grow-1"><div className="fw-bold text-dark small">{subjects.find(s => s.id === selectedSubject)?.name}</div><div className="text-muted" style={{ fontSize: 11 }}>{displayGrades.length} students graded</div></div>
            <div className="fw-black fs-3 text-success">{avg}%</div>
          </div>
        </div>
      </div>
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing: "0.05em" }}>Student</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-sm-table-cell" style={{ letterSpacing: "0.05em" }}>ID</th>
                <th className="small text-muted fw-semibold text-uppercase text-end" style={{ letterSpacing: "0.05em" }}>Score</th>
                <th className="small text-muted fw-semibold text-uppercase text-end pe-4" style={{ letterSpacing: "0.05em" }}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {gradesLoading ? (
                <tr><td colSpan={4} className="text-center py-4"><div className="spinner-border text-success spinner-border-sm" role="status"></div></td></tr>
              ) : (
                displayGrades.map((g, i) => (
                  <tr key={i}>
                    <td className="ps-4 small fw-medium text-dark">{g.name}</td>
                    <td className="d-none d-sm-table-cell small text-muted">{g.student_id}</td>
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        <div className="progress flex-shrink-0" style={{ width: 60, height: 6 }}>
                          <div className="progress-bar bg-success" style={{ width: `${g.percentage}%` }} />
                        </div>
                        <span className="small fw-semibold text-dark">{g.percentage}%</span>
                      </div>
                    </td>
                    <td className="text-end pe-4 fw-black small text-success">{g.percentage >= 90 ? "A" : g.percentage >= 80 ? "B" : "C"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {gradesError && <div className="alert alert-warning small mt-3">Could not load grades from server. Showing cached data.</div>}
    </div>
  );
}

/* -- Grade Requests Panel -- */
function RequestsPanel({ isGradeLocked, activeTerm }: { isGradeLocked: boolean; activeTerm: string }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [grading, setGrading] = useState<Record<number, { score: string; remarks: string }>>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    fetch(`${API_BASE}/api/grade-requests/teacher`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.requests) setRequests(data.requests); })
      .catch(() => {});
  }, []);
  


  function reload() {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    fetch(`${API_BASE}/api/grade-requests/teacher`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.requests) setRequests(data.requests); })
      .catch(() => {});
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  function acceptRequest(id: number) {
    if (isGradeLocked) return;
    showToast("?? Request accepted � enter the calculated grade below");
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "teacher_calculating" } : r));
  }

  function submitToAdmin(id: number) {
    if (isGradeLocked) return;
    const g = grading[id];
    if (!g?.score || isNaN(Number(g.score))) { showToast("?? Enter a valid score first"); return; }
    const score = Number(g.score);
    const letterGrade = score >= 97 ? "A+" : score >= 93 ? "A" : score >= 90 ? "A-"
      : score >= 87 ? "B+" : score >= 83 ? "B" : score >= 80 ? "B-"
      : score >= 77 ? "C+" : score >= 73 ? "C" : score >= 70 ? "C-"
      : score >= 65 ? "D" : "F";
      
    const token = localStorage.getItem("inform_token");
      if (token) {
        fetch(`${API_BASE}/api/grade-requests/teacher/${id}/submit`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ score, remarks: g.remarks || "" }),
        })
          .then(r => r.ok ? r.json() : null)
          .then(data => { if (data?.request) reload(); })
          .catch(() => {});
    }
    setGrading(prev => { const n = { ...prev }; delete n[id]; return n; });
    reload();
    showToast(`?? Grade submitted to Registrar for review`);
  }

  function releaseToStudent(id: number) {
    if (isGradeLocked) return;
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    fetch(`${API_BASE}/api/grade-requests/teacher/${id}/release`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    })
      .then(r => r.ok ? r.json() : null)
      .then(() => { reload(); showToast("?? Grade released to student!"); })
      .catch(() => {});
  }


  function rejectRequest(id: number) {
    if (isGradeLocked) return;
    reload();
    showToast("? Request rejected");
  }

  function statusLabel(status: string): string {
    const labels: Record<string, string> = {
      student_requested:  "?? Requested",
      teacher_calculating:"?? Calculating",
      registrar_review:   "?? Sent to Registrar",
      principal_review:   "?? Principal Review",
      principal_approved: "? Principal Approved",
      registrar_released: "?? Released by Registrar",
      released_to_student:"?? Grade Released",
      rejected:           "? Rejected",
    };
    return labels[status] || status;
  }

  function statusBadgeClass(status: string): string {
    if (status === "released_to_student" || status === "principal_approved") return "bg-success text-white";
    if (status === "rejected") return "bg-danger-subtle text-danger border border-danger-subtle";
    if (status === "student_requested") return "bg-warning-subtle text-warning border border-warning-subtle";
    return "bg-primary-subtle text-primary border border-primary-subtle";
  }

  const newRequests     = requests.filter(r => r.status === "student_requested");
  const inProgress      = requests.filter(r => r.status === "teacher_calculating");
  const pendingAdmin    = requests.filter(r => r.status === "registrar_review");
  const verifiedByAdmin = requests.filter(r => r.status === "principal_approved" || r.status === "registrar_released");
  const released        = requests.filter(r => r.status === "released_to_student");
  const rejected        = requests.filter(r => r.status === "rejected");

  // Lock check: if deadline passed and teacher still has unsubmitted requests
  const unsubmitted = requests.filter(r => ["student_requested", "teacher_calculating"].includes(r.status));

  return (
    <div className="d-flex flex-column gap-4">
      {/* Toast */}
      {toast && (
        <div className="position-fixed bottom-0 end-0 m-4 alert alert-dark shadow-lg rounded-3 py-2 px-3 d-flex align-items-center gap-2"
          style={{ zIndex: 9999, fontSize: 13, minWidth: 280, animation: "fadeInUp 0.3s ease" }}>
          {toast}
        </div>
      )}

      <div><h2 className="fw-black fs-4 text-dark mb-1">Grade Requests</h2><p className="text-muted small mb-0">Student grade requests for {activeTerm}</p></div>

      {/* Lock banner */}
      {isGradeLocked && (
        <div className="rounded-3 p-3 d-flex align-items-start gap-3" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <div style={{ color: "rgba(220,38,38,0.8)", marginTop: 2 }}><Icon name="alert" size={20} /></div>
          <div>
            <div className="fw-bold small text-danger">Actions Locked – {activeTerm} deadline passed</div>
            <div className="text-muted small">Visit the <strong>Registrar&apos;s Office</strong> to restore access.</div>
          </div>
        </div>
      )}

      {/* Pipeline workflow diagram */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-3">
          <div className="fw-bold small text-dark mb-3"> Grade Request Pipeline</div>
          <div className="d-flex align-items-center justify-content-between gap-1 overflow-auto pb-1">
            {[
              { label: "Student\nRequested",    count: newRequests.length,     color: "#f59e0b" },
              { label: "Teacher\nCalculating",  count: inProgress.length,      color: "#3b82f6" },
              { label: "Sent to\nAdmin",        count: pendingAdmin.length,    color: "#8b5cf6" },
              { label: "Admin\nVerified",       count: verifiedByAdmin.length, color: "#10b981" },
              { label: "Released to\nStudent",  count: released.length,        color: "#059669" },
            ].map((step, i, arr) => (
              <div key={i} className="d-flex align-items-center gap-1 flex-shrink-0">
                <div className="text-center" style={{ minWidth: 80 }}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-black mx-auto mb-1"
                    style={{ width: 36, height: 36, background: step.color, fontSize: 16 }}>{step.count}</div>
                  <div style={{ fontSize: 10, color: "#64748b", whiteSpace: "pre-line", lineHeight: 1.2 }}>{step.label}</div>
                </div>
                {i < arr.length - 1 && <div style={{ width: 20, height: 2, background: "#e2e8f0", flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STEP 1 � New student requests */}
      {newRequests.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">?? New Student Requests � Action Required</h3>
          <div className="d-flex flex-column gap-2">
            {newRequests.map(req => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div>
                      <div className="fw-bold text-dark small">{req.student}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{req.subject} � {req.term} � {req.requestedAt}</div>
                    </div>
                    <span className={`badge ${statusBadgeClass(req.status)}`} style={{ fontSize: 10 }}>{statusLabel(req.status)}</span>
                  </div>
                  {isGradeLocked
                    ? <div className="rounded-3 p-2 text-center small text-danger" style={{ background: "#fef2f2", border: "1px dashed #fca5a5" }}>?? Locked � visit Registrar&apos;s Office</div>
                    : <div className="d-flex gap-2">
                        <button onClick={() => acceptRequest(req.id)} className="btn btn-primary btn-sm flex-grow-1">?? Accept &amp; Calculate</button>
                        <button onClick={() => rejectRequest(req.id)} className="btn btn-outline-danger btn-sm">? Reject</button>
                      </div>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 � Teacher calculating, enter grade form */}
      {inProgress.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">?? Enter &amp; Submit Grades to Admin</h3>
          <div className="d-flex flex-column gap-2">
            {inProgress.map(req => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3" style={{ border: "1.5px solid #bfdbfe" }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div>
                      <div className="fw-bold text-dark small">{req.student}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{req.subject} � {req.term}</div>
                    </div>
                    <span className={`badge ${statusBadgeClass(req.status)}`} style={{ fontSize: 10 }}>{statusLabel(req.status)}</span>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label className="form-label fw-semibold text-uppercase mb-1" style={{ fontSize: 10 }}>Score (0�100)</label>
                      <input type="number" min={0} max={100}
                        value={grading[req.id]?.score ?? ""}
                        onChange={e => setGrading(prev => ({ ...prev, [req.id]: { ...prev[req.id], score: e.target.value, remarks: prev[req.id]?.remarks ?? "" } }))}
                        className="form-control form-control-sm rounded-3"
                        placeholder="e.g. 91" />
                    </div>
                    <div className="col-8">
                      <label className="form-label fw-semibold text-uppercase mb-1" style={{ fontSize: 10 }}>Remarks (optional)</label>
                      <input type="text"
                        value={grading[req.id]?.remarks ?? ""}
                        onChange={e => setGrading(prev => ({ ...prev, [req.id]: { ...prev[req.id], remarks: e.target.value, score: prev[req.id]?.score ?? "" } }))}
                        className="form-control form-control-sm rounded-3"
                        placeholder="e.g. Excellent performance" />
                    </div>
                  </div>
                  {grading[req.id]?.score && !isNaN(Number(grading[req.id].score)) && (
                    <div className="mb-3 p-2 rounded-3 bg-success-subtle text-success small fw-semibold">
                      Computed grade: <strong>
                        {(() => { const s = Number(grading[req.id].score); return s >= 97 ? "A+" : s >= 93 ? "A" : s >= 90 ? "A-" : s >= 87 ? "B+" : s >= 83 ? "B" : s >= 80 ? "B-" : s >= 77 ? "C+" : s >= 73 ? "C" : s >= 70 ? "C-" : s >= 65 ? "D" : "F"; })()}
                      </strong> ({grading[req.id].score}%)
                    </div>
                  )}
                  {isGradeLocked
                    ? <div className="rounded-3 p-2 text-center small text-danger" style={{ background: "#fef2f2", border: "1px dashed #fca5a5" }}>?? Locked � visit Registrar&apos;s Office</div>
                    : <button onClick={() => submitToAdmin(req.id)} className="btn btn-primary btn-sm w-100">?? Submit to Admin for Verification</button>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 � Waiting for admin */}
      {pendingAdmin.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">? Awaiting Admin Verification</h3>
          <div className="d-flex flex-column gap-2">
            {pendingAdmin.map(req => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3 opacity-85">
                <div className="card-body p-3 d-flex align-items-center gap-3">
                  <div className="rounded-3 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0 text-primary" style={{ width: 40, height: 40 }}><Icon name="requests" size={20} /></div>
                  <div className="flex-grow-1">
                    <div className="fw-bold small text-dark">{req.student} � {req.subject}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>Score: {req.score}% ({req.letterGrade}) � Submitted: {req.submittedToAdminAt}</div>
                  </div>
                  <span className={`badge ${statusBadgeClass(req.status)}`} style={{ fontSize: 10 }}>{statusLabel(req.status)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4 � Admin verified, teacher must release */}
      {verifiedByAdmin.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">? Admin Verified � Release to Student</h3>
          <div className="d-flex flex-column gap-2">
            {verifiedByAdmin.map(req => (
              <div key={req.id} className="card border-0 rounded-3" style={{ border: "1.5px solid #bbf7d0" }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                    <div>
                      <div className="fw-bold text-dark small">{req.student} � {req.subject}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>Score: {req.score}% ({req.letterGrade}) � Verified by {req.adminVerifiedBy} on {req.adminVerifiedAt}</div>
                      {req.adminNote && <div className="text-muted fst-italic" style={{ fontSize: 11 }}>Admin note: {req.adminNote}</div>}
                    </div>
                    <span className={`badge ${statusBadgeClass(req.status)}`} style={{ fontSize: 10 }}>{statusLabel(req.status)}</span>
                  </div>
                  {isGradeLocked
                    ? <div className="rounded-3 p-2 text-center small text-danger" style={{ background: "#fef2f2", border: "1px dashed #fca5a5" }}>?? Locked � visit Registrar&apos;s Office</div>
                    : <button onClick={() => releaseToStudent(req.id)} className="btn btn-success btn-sm w-100">?? Release Grade to Student</button>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5 � Released */}
      {released.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">?? Released to Students</h3>
          <div className="d-flex flex-column gap-2">
            {released.map(req => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3 opacity-75">
                <div className="card-body p-3 d-flex align-items-center gap-3">
                  <div className="rounded-3 bg-success bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0 text-success" style={{ width: 40, height: 40 }}><Icon name="checkCircle" size={20} /></div>
                  <div className="flex-grow-1">
                    <div className="fw-bold small text-dark">{req.student} – {req.subject}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>Final Grade: {req.letterGrade} ({req.score}%) – Released: {req.releasedAt}</div>
                  </div>
                  <span className="badge bg-success text-white" style={{ fontSize: 10 }}><Icon name="check" size={12} className="me-1" /> Released</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">? Rejected</h3>
          <div className="d-flex flex-column gap-2">
            {rejected.map(req => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3 opacity-75">
                <div className="card-body p-3 d-flex align-items-center justify-content-between">
                  <div><div className="fw-bold small text-dark">{req.student} � {req.subject}</div><div className="text-muted" style={{ fontSize: 11 }}>Rejected by {req.rejectedBy}</div></div>
                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle" style={{ fontSize: 10 }}>? Rejected</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="card border-0 shadow-sm rounded-3"><div className="card-body p-4 text-center text-muted small">No grade requests at this time.</div></div>
      )}
    </div>
  );
}

/* -- Document Approvals -- */
function DocumentApprovalsPanel() {
  const [docs, setDocs] = useState(documentApprovals);
  const pending  = docs.filter(d => d.status === "pending");
  const approved = docs.filter(d => d.status === "approved");
  return (
    <div className="d-flex flex-column gap-4">
      <div><h2 className="fw-black fs-4 text-dark mb-1">Document Approvals</h2><p className="text-muted small mb-0">Verify and approve student document requests</p></div>
      <div className="row g-3">
        {[{ label: "Pending", value: pending.length, cls: "bg-warning-subtle border-warning-subtle text-warning" }, { label: "Approved", value: approved.length, cls: "bg-success-subtle border-success-subtle text-success" }].map(s => (
          <div key={s.label} className="col-6"><div className={`card border rounded-3 ${s.cls}`}><div className="card-body p-3 text-center"><div className="small mb-1">{s.label}</div><div className="fw-black fs-3">{s.value}</div></div></div></div>
        ))}
      </div>
      {pending.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3"> Pending Approvals</h3>
          <div className="d-flex flex-column gap-2">
            {pending.map(doc => (
              <div key={doc.id} className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div><div className="fw-bold small text-dark">{doc.student}</div><div className="text-muted" style={{ fontSize: 11 }}>{doc.type}  {doc.requestedAt}</div></div>
                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle">Pending</span>
                  </div>
                  <div className="d-flex gap-2">
                    <button onClick={() => setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: "approved", approvedAt: new Date().toLocaleDateString() } : d))} className="btn btn-success btn-sm flex-grow-1">Approve</button>
                    <button onClick={() => setDocs(prev => prev.filter(d => d.id !== doc.id))} className="btn btn-danger btn-sm flex-grow-1"> Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {approved.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">Approved</h3>
          <div className="d-flex flex-column gap-2">
            {approved.map(doc => (
              <div key={doc.id} className="card border-0 shadow-sm rounded-3 opacity-75">
                <div className="card-body p-3 d-flex align-items-center justify-content-between">
                  <div><div className="fw-bold small text-dark">{doc.student}</div><div className="text-muted" style={{ fontSize: 11 }}>{doc.type}  Approved {doc.approvedAt}</div></div>
                  <span className="badge bg-success-subtle text-success border border-success-subtle"> Approved</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* -- Notifications -- */
function NotificationsPanel() {
  const [notifs, setNotifs] = useState(teacherNotifications);

  function fetchNotifs() {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    fetch(`${API_BASE}/api/grade-requests/staff-notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.notifications?.length) {
          setNotifs(data.notifications.map((n: {
            id: number; type: string; title: string; message: string; created_at: string; is_read: boolean;
          }) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            time: new Date(n.created_at).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
            read: !!n.is_read,
            icon: n.type === "grade_request" ? "??" : "?",
          })));
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  function markAllRead() {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    fetch(`${API_BASE}/api/grade-requests/staff-notifications/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    }).catch(() => {});
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }

  const unread = notifs.filter(n => !n.read);
  const read   = notifs.filter(n =>  n.read);
  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-center justify-content-between">
        <div><h2 className="fw-black fs-4 text-dark mb-1">Notifications</h2><p className="text-muted small mb-0">{unread.length} unread</p></div>
        {unread.length > 0 && <button onClick={markAllRead} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: 12 }}>Mark all read</button>}
      </div>
      {unread.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">?? Unread</h3>
          <div className="d-flex flex-column gap-2">
            {unread.map(n => (
              <div key={n.id} className="card border-0 shadow-sm rounded-3" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)" }}>
                <div className="card-body p-3">
                  <div className="d-flex align-items-start gap-3">
                    <span style={{ fontSize: 18 }}>{n.icon}</span>
                    <div className="flex-grow-1">
                      <div className="fw-bold small text-dark">{n.title}</div>
                      <div className="text-muted small mt-1">{n.message}</div>
                      <div className="text-muted mt-1" style={{ fontSize: 11 }}>{n.time}</div>
                    </div>
                    <div className="d-flex gap-1">
                      <button onClick={() => {
                        const token = localStorage.getItem("inform_token");
                        if (token) fetch(`${API_BASE}/api/grade-requests/staff-notifications/${n.id}/read`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, credentials: "include" }).catch(() => {});
                        setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                      }} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: 12 }}>?</button>
                      <button onClick={() => setNotifs(prev => prev.filter(x => x.id !== n.id))} className="btn btn-link btn-sm p-0 text-danger" style={{ fontSize: 12 }}>?</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {read.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">? Read</h3>
          <div className="d-flex flex-column gap-2">
            {read.map(n => (
              <div key={n.id} className="card border-0 shadow-sm rounded-3 opacity-75">
                <div className="card-body p-3 d-flex align-items-start gap-3">
                  <span style={{ fontSize: 16 }}>{n.icon}</span>
                  <div className="flex-grow-1"><div className="fw-bold small text-dark">{n.title}</div><div className="text-muted small">{n.message}</div></div>
                  <button onClick={() => setNotifs(prev => prev.filter(x => x.id !== n.id))} className="btn btn-link btn-sm p-0 text-danger" style={{ fontSize: 12 }}>?</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* -- Attendance Panel -- */
function AttendancePanel() {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
  const [apiAttendance, setApiAttendance] = useState<{student_id:string;full_name:string;total_meetings:number;days_present:number}[]>([]);
  const [attLoading, setAttLoading] = useState(false);
  const [attError, setAttError] = useState(false);
  const [attToast, setAttToast] = useState<string|null>(null);

  function showAttToast(msg: string) { setAttToast(msg); setTimeout(() => setAttToast(null), 3000); }

  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    if (!token || token.startsWith("demo_")) return;
    setAttLoading(true);
    setAttError(false);
    fetch(`${API_BASE}/api/teacher/attendance/${selectedSubject}`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.attendance?.length) setApiAttendance(data.attendance);
        else setApiAttendance([]);
      })
      .catch(() => setAttError(true))
      .finally(() => setAttLoading(false));
  }, [selectedSubject]);

  function markAttendance(studentId: string, present: boolean) {
    const token = localStorage.getItem("inform_token");
    const record = (apiAttendance.length > 0 ? apiAttendance : attendance.filter(a => a.subject === subjects.find(s=>s.id===selectedSubject)?.name).map(a=>({student_id:a.student_id,full_name:a.name,total_meetings:a.total,days_present:a.present})))
      .find(a => a.student_id === studentId);
    const newPresent = present
      ? Math.min((record?.days_present ?? 0) + 1, record?.total_meetings ?? 20)
      : Math.max((record?.days_present ?? 1) - 1, 0);

    // Optimistic update
    setApiAttendance(prev => prev.map(a => a.student_id === studentId ? { ...a, days_present: newPresent } : a));
    showAttToast(present ? "? Marked Present" : "? Marked Absent");

    if (!token || token.startsWith("demo_")) return;
    fetch(`${API_BASE}/api/teacher/attendance`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ student_id: studentId, subject_id: selectedSubject, total_meetings: record?.total_meetings ?? 20, days_present: newPresent }),
    }).catch(() => {}); // UI already updated
  }

  const displayAttendance = apiAttendance.length > 0
    ? apiAttendance.map(a => ({ student_id: a.student_id, name: a.full_name, subject: subjects.find(s=>s.id===selectedSubject)?.name ?? "", present: a.days_present, total: a.total_meetings, percentage: a.total_meetings > 0 ? Math.round((a.days_present/a.total_meetings)*100) : 0 }))
    : attendance.filter(a => a.subject === subjects.find(s => s.id === selectedSubject)?.name);

  const avgAttendance = displayAttendance.length > 0 ? Math.round(displayAttendance.reduce((a, att) => a + att.percentage, 0) / displayAttendance.length) : 0;
  return (
    <div className="d-flex flex-column gap-4">
      {attToast && <div className="position-fixed bottom-0 end-0 m-4 alert alert-dark shadow-lg rounded-3 py-2 px-3" style={{ zIndex: 9999, fontSize: 13, minWidth: 220, animation: "fadeInUp 0.3s ease" }}>{attToast}</div>}
      <div><h2 className="fw-black fs-4 text-dark mb-1">Attendance Management</h2><p className="text-muted small mb-0">Track student attendance per subject</p></div>
      <div className="d-flex gap-3 flex-wrap align-items-center">
        <div style={{ width: 220 }}>
          <label className="form-label fw-semibold text-uppercase mb-1" style={{ fontSize: 11 }}>Select Subject</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(Number(e.target.value))} className="form-select form-select-sm rounded-3">
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="card border-0 bg-success-subtle flex-grow-1 rounded-3">
          <div className="card-body p-3 d-flex align-items-center gap-3">
            <span style={{ fontSize: 24 }}></span>
            <div className="flex-grow-1"><div className="fw-bold text-dark small">{subjects.find(s => s.id === selectedSubject)?.name}</div><div className="text-muted" style={{ fontSize: 11 }}>{displayAttendance.length} students tracked</div></div>
            <div className="fw-black fs-3 text-success">{avgAttendance}%</div>
          </div>
        </div>
      </div>
      {attError && <div className="alert alert-warning small">Could not load attendance from server. Showing cached data.</div>}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing: "0.05em" }}>Student</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-sm-table-cell" style={{ letterSpacing: "0.05em" }}>Present</th>
                <th className="small text-muted fw-semibold text-uppercase text-center" style={{ letterSpacing: "0.05em" }}>Action</th>
                <th className="small text-muted fw-semibold text-uppercase text-end pe-4" style={{ letterSpacing: "0.05em" }}>%</th>
              </tr>
            </thead>
            <tbody>
              {attLoading ? (
                <tr><td colSpan={4} className="text-center py-4"><div className="spinner-border text-success spinner-border-sm" role="status"></div></td></tr>
              ) : (
                displayAttendance.map((a, i) => (
                  <tr key={i}>
                    <td className="ps-4 small fw-medium text-dark">{a.name}</td>
                    <td className="d-none d-sm-table-cell small text-muted">{a.present}/{a.total}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button onClick={() => markAttendance(a.student_id, true)}  className="btn btn-success btn-sm" style={{ fontSize: 11 }}>? Present</button>
                        <button onClick={() => markAttendance(a.student_id, false)} className="btn btn-danger btn-sm"  style={{ fontSize: 11 }}>? Absent</button>
                      </div>
                    </td>
                    <td className="text-end pe-4 fw-black small text-success">{a.percentage}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* -- Time Log Panel -- */
function TimeLogPanel() {
  const [logs, setLogs] = useState<TimeLogEntry[]>([]);
  const [currentSession, setCurrentSession] = useState<TimeLogEntry | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const all = loadTimeLogs().filter(l => l.teacherId === teacherData.teacher_id);
    setLogs(all);
    const open = all.find(l => l.status === "in");
    setCurrentSession(open || null);
  }, []);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  function handleTimeIn() {
    const now = new Date();
    const entry: TimeLogEntry = {
      id: Date.now(),
      teacherId: teacherData.teacher_id,
      teacherName: teacherData.full_name,
      date: now.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
      timeIn: now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      timeOut: null,
      status: "in",
    };
    const all = loadTimeLogs();
    all.push(entry);
    saveTimeLogs(all);
    const mine = all.filter(l => l.teacherId === teacherData.teacher_id);
    setLogs(mine);
    setCurrentSession(entry);
    showToast("? Time In recorded successfully");
  }

  function handleTimeOut() {
    if (!currentSession) return;
    const now = new Date();
    const timeOut = now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const all = loadTimeLogs().map(l =>
      l.id === currentSession.id ? { ...l, timeOut, status: "out" as const } : l
    );
    saveTimeLogs(all);
    const mine = all.filter(l => l.teacherId === teacherData.teacher_id);
    setLogs(mine);
    setCurrentSession(null);
    showToast("?? Time Out recorded successfully");
  }

  const today = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  const todayLogs = logs.filter(l => l.date === today);

  return (
    <div className="d-flex flex-column gap-4">
      {toast && (
        <div className="position-fixed bottom-0 end-0 m-4 alert alert-dark shadow-lg rounded-3 py-2 px-3" style={{ zIndex: 9999, fontSize: 13, minWidth: 260, animation: "fadeInUp 0.3s ease" }}>
          {toast}
        </div>
      )}

      <div><h2 className="fw-black fs-4 text-dark mb-1">My Time Log</h2><p className="text-muted small mb-0">{today}</p></div>

      {/* Current status card */}
      <div className="card border-0 rounded-3" style={{ background: currentSession ? "linear-gradient(135deg,#059669,#10b981)" : "linear-gradient(135deg,#1e40af,#3b82f6)", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
        <div className="card-body p-4 text-white">
          <div className="d-flex align-items-center gap-3 mb-3">
            <Icon name={currentSession ? "checkCircle" : "clock"} size={40} className="text-white" />
            <div>
              <div className="fw-black fs-5">{currentSession ? "Currently On Campus" : "Not Timed In"}</div>
              {currentSession && <div className="text-white-50 small">Time In: {currentSession.timeIn}</div>}
            </div>
          </div>
          <button
            onClick={currentSession ? handleTimeOut : handleTimeIn}
            className="btn btn-light fw-black w-100 rounded-3"
            style={{ fontSize: 15, color: currentSession ? "#059669" : "#1e40af" }}
          >
            {currentSession ? "Time Out" : "Time In"}
          </button>
        </div>
      </div>

      {/* Today's log */}
      {todayLogs.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">?? Today&apos;s Log</h3>
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing: "0.05em" }}>Date</th>
                  <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>Time In</th>
                  <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>Time Out</th>
                  <th className="small text-muted fw-semibold text-uppercase pe-4" style={{ letterSpacing: "0.05em" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayLogs.map(l => (
                  <tr key={l.id}>
                    <td className="ps-4 small fw-medium text-dark">{l.date}</td>
                    <td className="small text-success fw-semibold">{l.timeIn}</td>
                    <td className="small text-danger fw-semibold">{l.timeOut ?? <span className="text-muted fst-italic">�</span>}</td>
                    <td className="pe-4">
                      <span className={`badge ${l.status === "in" ? "bg-success-subtle text-success border border-success-subtle" : "bg-secondary-subtle text-secondary border border-secondary-subtle"}`}>
                        {l.status === "in" ? "?? On Campus" : "? Completed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full history */}
      {logs.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">?? Full History</h3>
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing: "0.05em" }}>Date</th>
                    <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>Time In</th>
                    <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>Time Out</th>
                    <th className="small text-muted fw-semibold text-uppercase pe-4" style={{ letterSpacing: "0.05em" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...logs].reverse().map(l => (
                    <tr key={l.id}>
                      <td className="ps-4 small fw-medium text-dark">{l.date}</td>
                      <td className="small text-success fw-semibold">{l.timeIn}</td>
                      <td className="small text-danger fw-semibold">{l.timeOut ?? <span className="text-muted fst-italic">Not timed out</span>}</td>
                      <td className="pe-4">
                        <span className={`badge ${l.status === "in" ? "bg-success-subtle text-success border border-success-subtle" : "bg-secondary-subtle text-secondary border border-secondary-subtle"}`}>
                          {l.status === "in" ? "?? On Campus" : "? Done"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {logs.length === 0 && (
        <div className="card border-0 shadow-sm rounded-3"><div className="card-body p-4 text-center text-muted small">No time log entries yet. Click &quot;Time In&quot; when you arrive at campus.</div></div>
      )}
    </div>
  );
}

/* -- Main Page -- */
export default function TeacherDashboardPage() {
  const [panel, setPanel]           = useState<Panel>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showNotif, setShowNotif]   = useState(false);
  const [notifs, setNotifs]         = useState(teacherNotifications);
  const [pendingCount, setPendingCount] = useState(0);
  const [authChecked, setAuthChecked] = useState(false);

  // Poll staff notifications for the topbar bell unread count
  useEffect(() => {
    function fetchNotifs() {
      const token = localStorage.getItem("inform_token");
      if (!token) return;
      fetch(`${API_BASE}/api/grade-requests/staff-notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.notifications?.length) {
            setNotifs(prev => {
              // Preserve locally-marked-read states so poll doesn't undo them
              const readIds = new Set(prev.filter(n => n.read).map(n => n.id));
              return data.notifications.map((n: { id: number; type: string; title: string; message: string; created_at: string; is_read: boolean }) => ({
                id: n.id, type: n.type, title: n.title, message: n.message,
                time: new Date(n.created_at).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
                read: readIds.has(n.id) ? true : !!n.is_read,
                icon: "??",
              }));
            });
          }
        })
        .catch(() => {});
    }
    const interval = setInterval(fetchNotifs, 15000);
    fetchNotifs();
    return () => clearInterval(interval);
  }, []);

    const [apiTeacher, setApiTeacher] = useState<{
    teacher_id: string; full_name: string; department: string; email: string;
  } | null>(null);
  const [apiSubjects, setApiSubjects] = useState<{
    id: number; code: string; name: string; units: number; max_capacity: number; enrolled_count: number;
  }[]>([]);
  const [apiStudents, setApiStudents] = useState<{
    student_id: string; full_name: string; email: string;
  }[]>([]);

  // -- Route protection ------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    const role  = localStorage.getItem("inform_role");
    if (!token || role !== "teacher") {
      window.location.replace("/login");
    } else {
      setAuthChecked(true);
    }
  }, []);

  // Fetch real teacher dashboard data from API
  useEffect(() => {
    if (!authChecked) return;
    const token = localStorage.getItem("inform_token");
    if (!token || token.startsWith("demo_")) return;
    fetch(`${API_BASE}/api/teacher/dashboard`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        if (data.stats?.pending_requests !== undefined) setPendingCount(data.stats.pending_requests);
        if (data.teacher) setApiTeacher(data.teacher);
        if (data.subjects?.length) setApiSubjects(data.subjects);
        if (data.students?.length) setApiStudents(data.students);
      })
      .catch(() => {});
  }, [panel, authChecked]);
  const deadlinePassed = isDeadlinePassed();
  const isGradeLocked  = deadlinePassed && pendingCount > 0;
  const activeTerm     = getActiveTerm();
  const unreadCount    = notifs.filter(n => !n.read).length;

  function renderPanel() {
    switch (panel) {
      case "subjects":      return <SubjectsPanel subjects={apiSubjects.length ? apiSubjects.map(s => ({ id: s.id, code: s.code, name: s.name, units: s.units, enrolled: s.enrolled_count, max: s.max_capacity })) : undefined} />;
      case "schedule":      return <SchedulePanel />;
      case "students":      return <StudentsPanel students={apiStudents.length ? apiStudents.map(s => ({ id: s.student_id, name: s.full_name, pathway: "Academic", grade: 0, status: "Active" })) : undefined} />;
      case "grades":        return <GradesPanel isGradeLocked={isGradeLocked} activeTerm={activeTerm} />;
      case "requests":      return <RequestsPanel isGradeLocked={isGradeLocked} activeTerm={activeTerm} />;
      case "attendance":    return <AttendancePanel />;
      case "documents":     return <DocumentApprovalsPanel />;
      case "notifications": return <NotificationsPanel />;
      case "timelog":       return <TimeLogPanel />;
      default:          return <Overview setActive={setPanel} isGradeLocked={isGradeLocked} activeTerm={activeTerm} teacher={apiTeacher} />;
    }
  }

  return (
    <div className="teacher-dashboard-layout" style={{ minHeight: "100vh", background: "#f0f4ff" }} suppressHydrationWarning>
      <Sidebar active={panel} setActive={setPanel} show={mobileOpen} setShow={setMobileOpen} onExpandChange={setSidebarExpanded} />

      <div className="teacher-dashboard-main" style={{ marginLeft: 256 }}>
        {/* Topbar */}
        <header className="bg-white border-bottom px-3 px-md-4 py-3 d-flex align-items-center gap-2 gap-md-3 flex-shrink-0 shadow-sm">
          <button className="btn btn-link text-dark p-1 d-lg-none hamburger-mobile-only" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          
          {/* Left side - Logo */}
          <div className="d-flex align-items-center gap-3">
            <img src="/cfei-logo.jpg" alt="CFEI Logo" className="rounded-circle" style={{ width: 36, height: 36, objectFit: "cover", border: "2px solid #dc2626" }} />
            <div className="d-none d-sm-block">
              <div className="fw-bold" style={{ color: "#dc2626", fontSize: 14 }}>CFEI Portal</div>
              <div className="text-muted" style={{ fontSize: 11 }}>Teacher Dashboard</div>
            </div>
          </div>

          {/* Right side - Status badges & Notification */}
          <div className="d-flex align-items-center gap-3 ms-auto">
            <span className="badge bg-success-subtle text-success border border-success-subtle d-none d-sm-flex align-items-center gap-1">
              <span className="rounded-circle bg-success d-inline-block" style={{ width: 7, height: 7 }} />Online
            </span>
            {isGradeLocked && (
              <span className="badge bg-danger-subtle text-danger border border-danger-subtle d-none d-md-flex align-items-center gap-1" style={{ fontSize: "clamp(10px, 2vw, 12px)" }}>
                ?? Grades Locked
              </span>
            )}
            <button className="btn btn-link text-muted p-1 position-relative" onClick={() => setShowNotif(!showNotif)}>
              <Icon name="bell" size={20} className="text-muted" />
              {unreadCount > 0 && <span className="position-absolute top-0 end-0 rounded-circle bg-danger d-flex align-items-center justify-content-center text-white" style={{ width: 18, height: 18, fontSize: 10, fontWeight: "bold" }}>{unreadCount}</span>}
            </button>
          </div>
        </header>

        <main className="flex-grow-1 overflow-auto p-2 p-sm-3 p-md-4">
          {renderPanel()}
        </main>
      </div>

      {/* Notification dropdown */}
      {showNotif && (
        <>
          <div style={{ position: "fixed", top: 60, right: "clamp(8px, 2vw, 20px)", width: "min(360px, calc(100vw - 32px))", maxHeight: "min(480px, calc(100vh - 100px))", background: "white", borderRadius: "0.75rem", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", zIndex: 9999, overflowY: "auto" }}>
            <div className="px-3 px-md-4 py-3 border-bottom d-flex align-items-center justify-content-between">
              <div><div className="fw-bold text-dark small">Notifications</div><div className="text-muted" style={{ fontSize: 11 }}>{unreadCount} unread</div></div>
              <div className="d-flex align-items-center gap-2">
                {unreadCount > 0 && <button onClick={() => setNotifs(prev => prev.map(n => ({ ...n, read: true })))} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: 11 }}>Mark all read</button>}
                <button onClick={() => setShowNotif(false)} className="btn btn-link btn-sm p-0 text-muted" aria-label="Close"><Icon name="close" size={18} className="text-muted" /></button>
              </div>
            </div>
            {notifs.length === 0
              ? <div className="px-4 py-5 text-center text-muted"><div className="mb-2"><Icon name="bell" size={32} className="text-muted opacity-50" /></div><small>No notifications</small></div>
              : notifs.map(n => (
                <div key={n.id} className="px-3 px-md-4 py-3 border-bottom d-flex gap-2 gap-md-3" style={{ background: n.read ? "white" : "rgba(5,150,105,0.04)", opacity: n.read ? 0.7 : 1 }}>
                  <div className="text-muted" style={{ minWidth: 24 }}><Icon name={n.icon as IconName} size={18} /></div>
                  <div className="flex-grow-1">
                    <div className="fw-bold small text-dark">{n.title}</div>
                    <div className="text-muted" style={{ fontSize: 12, lineHeight: 1.4 }}>{n.message}</div>
                    <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>{n.time}</div>
                  </div>
                  <div className="d-flex gap-1 flex-shrink-0">
                    {!n.read && <button onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: 12 }} aria-label="Mark as read">?</button>}
                    <button onClick={() => setNotifs(prev => prev.filter(x => x.id !== n.id))} className="btn btn-link btn-sm p-0 text-danger" style={{ fontSize: 14 }} aria-label="Delete">?</button>
                  </div>
                </div>
              ))
            }
          </div>
          <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 9998 }} onClick={() => setShowNotif(false)} />
        </>
      )}
    </div>
  );
}

