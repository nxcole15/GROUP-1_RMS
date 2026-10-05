"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
  teacher_id: "",
  full_name: "Teacher",
  department: "",
  email: "",
};

type TeacherSubjectRecord = {
  id: number;
  code: string;
  name: string;
  units: number;
  enrolled: number;
  max: number;
};

const subjects: TeacherSubjectRecord[] = [];
const teacherSchedule: Array<{day: string; subject: string; room: string; time: string; enter: string; leave: string}> = [];
const students: Array<{id: string; name: string; pathway: string; grade: number; status: string; photo_url?: string | null; subject?: string; term?: string; track_strand?: string}> = [];
const grades: Array<{student_id: string; name: string; subject: string; percentage: number; term: string}> = [];
const gradeRequestsTeacher: Array<{id: number; student: string; subject: string; status: string; requestedAt: string}> = [];
const attendance: Array<{student_id: string; name: string; subject: string; total: number; present: number; percentage: number}> = [];
const recentActivity: Array<{action: string; name: string; time: string; icon: string}> = [];
const teacherNotifications: Array<{id: number; type: string; message: string; time: string; read: boolean; icon?: string; title?: string}> = [];
const documentApprovals: Array<{id: number; student: string; type: string; status: string; requestedAt?: string; approvedAt?: string}> = [];

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

type Panel = "overview"|"schedule"|"students"|"grades"|"attendance"|"requests"|"documents"|"notifications"|"timelog";

const navItems: { id: Panel|"overview"; label: string; icon: string }[] = [
  { id: "overview",       label: "Overview",        icon: "overview" },
  { id: "schedule",       label: "My Schedule",      icon: "calendar" },
  { id: "students",       label: "My Students",      icon: "students" },
  { id: "grades",         label: "Submit Grades",    icon: "chart" },
  { id: "requests",       label: "Grade Requests",   icon: "requests" },
  { id: "documents",      label: "Document Requests",        icon: "documents" },
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
            <Image src="/cfei-logo.jpg" alt="CFEI" className="sidebar-brand-logo" width={80} height={80} />
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
function Overview({ isGradeLocked, activeTerm, teacher }: { setActive?: (s: Panel) => void; isGradeLocked: boolean; activeTerm: string; teacher?: { teacher_id: string; full_name: string; department: string } | null }) {
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
          { label: "My Students",      value: students.length,    icon: "students", cls: "border-success-subtle bg-success-subtle",   val: "text-success"   },
          { label: "Class Avg. Grade", value: `${avgGrade}%`,     icon: "chart", cls: "border-warning-subtle bg-warning-subtle",   val: "text-warning"   },
          { label: "Pending Requests", value: pendingRequests,    icon: "requests", cls: "border-danger-subtle bg-danger-subtle",     val: "text-danger"    },
        ].map(s => (
          <div key={s.label} className="col-6 col-lg-4">
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
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Calculate current school year
  const getCurrentSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 6 ? year : year - 1;
    const endYear = startYear + 1;
    return `${startYear}-${endYear}`;
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  async function loadSchedules() {
    const token = localStorage.getItem("inform_token");
    
    if (!token || token.startsWith("demo_")) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/teacher/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules(data.schedules || []);
      }
    } catch (err) {
      console.error("Failed to load schedules:", err);
    } finally {
      setLoading(false);
    }
  }

  // Get unique time slots
  const timeSlots = Array.from(
    new Set(
      schedules.map(s => `${s.time_start.slice(0, 5)}-${s.time_end.slice(0, 5)}`)
    )
  ).sort();

  // Helper to find schedule for specific day and time
  const getScheduleForSlot = (day: string, timeSlot: string) => {
    return schedules.find(s => 
      s.day === day && 
      `${s.time_start.slice(0, 5)}-${s.time_end.slice(0, 5)}` === timeSlot
    );
  };

  // Format time for display (e.g., "08:00" -> "8:00 AM")
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const currentTerm = schedules[0]?.term || "Term 1";
  const schoolYear = schedules[0]?.school_year || getCurrentSchoolYear();

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h2 className="fw-black fs-4 text-dark mb-1">My Teaching Schedule</h2>
        <p className="text-muted small mb-0">{currentTerm} {schoolYear}</p>
      </div>

      {loading ? (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-4 text-center text-muted">
            <div className="spinner-border spinner-border-sm me-2" />
            Loading schedule...
          </div>
        </div>
      ) : schedules.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-4 text-center text-muted">
            <div className="mb-2">📅</div>
            <div className="fw-semibold">No classes scheduled</div>
            <div className="small">Your registrar hasn't assigned any schedules yet.</div>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-bordered mb-0" style={{ minWidth: 900 }}>
              <thead style={{ background: "linear-gradient(135deg, #0891b2, #06b6d4)", color: "white" }}>
                <tr>
                  <th className="text-center fw-semibold" style={{ width: 140, verticalAlign: "middle" }}>
                    TIME & ROOM
                  </th>
                  {days.map(day => (
                    <th key={day} className="text-center fw-semibold" style={{ minWidth: 160 }}>
                      {day.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot, idx) => (
                  <tr key={idx}>
                    <td className="text-center align-middle bg-light" style={{ fontWeight: 600, fontSize: 13 }}>
                      <div>{formatTime(timeSlot.split('-')[0])}</div>
                      <div>{formatTime(timeSlot.split('-')[1])}</div>
                    </td>
                    {days.map(day => {
                      const schedule = getScheduleForSlot(day, timeSlot);
                      return (
                        <td 
                          key={day} 
                          className={`align-middle ${schedule ? 'bg-white' : 'bg-light bg-opacity-50'}`}
                          style={{ padding: schedule ? 12 : 8 }}
                        >
                          {schedule ? (
                            <div>
                              <div className="fw-bold text-dark small mb-1" style={{ fontSize: 12 }}>
                                {schedule.subject_name}
                              </div>
                              <div className="text-muted mb-1" style={{ fontSize: 11 }}>
                                <strong>Room:</strong> {schedule.room}
                              </div>
                              <div className="text-muted mb-1" style={{ fontSize: 11 }}>
                                {schedule.strand}
                              </div>
                              <div>
                                <span 
                                  className="badge" 
                                  style={{ 
                                    fontSize: 10,
                                    background: schedule.enrolled_count >= schedule.max_capacity * 0.9 
                                      ? '#fecaca' 
                                      : '#bbf7d0',
                                    color: schedule.enrolled_count >= schedule.max_capacity * 0.9 
                                      ? '#991b1b' 
                                      : '#166534'
                                  }}
                                >
                                  👥 {schedule.enrolled_count}/{schedule.max_capacity}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-muted" style={{ fontSize: 11 }}>-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* -- Subjects Panel -- */
function SubjectsPanel({ subjects: propSubjects }: { subjects?: typeof subjects } = {}) {
  // Using propSubjects or fallback to subjects
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
function StudentsPanel({ students: propStudents }: { students?: Array<{id: string; name: string; pathway: string; grade: number; status: string; photo_url?: string | null; subject?: string; term?: string; track_strand?: string}> } = {}) {
  // State for search and filters
  const [search, setSearch] = useState("");
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  
  const displayStudents = propStudents ?? students;
  
  // Get unique class combinations (Subject - Track & Strand)
  const uniqueClasses = Array.from(
    new Set(
      displayStudents
        .filter(s => s.subject && s.track_strand)
        .map(s => `${s.subject} - ${s.track_strand}`)
    )
  ) as string[];
  
  // Filter logic - chain multiple conditions
  const filtered = displayStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    
    // Match by subject and track_strand combination
    const studentClass = s.subject && s.track_strand ? `${s.subject} - ${s.track_strand}` : "";
    const matchesClass = selectedClass === "all" || studentClass === selectedClass;
    
    const matchesTerm = selectedTerm === "all" || s.term === selectedTerm;
    return matchesSearch && matchesClass && matchesTerm;
  });
  
  const handleImageError = (studentId: string) => {
    setImageErrors(prev => new Set(prev).add(studentId));
  };
  
  const clearAllFilters = () => {
    setSearch("");
    setSelectedClass("all");
    setSelectedTerm("all");
  };
  
  const hasActiveFilters = search !== "" || selectedClass !== "all" || selectedTerm !== "all";
  
  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h2 className="fw-black fs-4 text-dark mb-1">My Students</h2>
        <p className="text-muted small mb-0">Showing {filtered.length} of {displayStudents.length} students</p>
      </div>
      
      {/* Search Bar */}
      <div className="input-group shadow-sm" style={{ maxWidth: 400 }}>
        <span className="input-group-text bg-white"><Icon name="search" size={18} /></span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..." className="form-control border-start-0" />
      </div>
      
      {/* Filter Dropdowns */}
      <div className="row g-3">
        <div className="col-md-5">
          <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: "0.05em" }}>Subject - Track & Strand</label>
          <select className="form-select form-select-sm" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="all">All Classes</option>
            {uniqueClasses.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: "0.05em" }}>Term</label>
          <select className="form-select form-select-sm" value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
            <option value="all">All Terms</option>
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <button className="btn btn-outline-secondary btn-sm w-100" onClick={clearAllFilters} disabled={!hasActiveFilters}>
            Clear Filters
          </button>
        </div>
      </div>
      
      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <div className="d-flex gap-2 flex-wrap align-items-center">
          <span className="small text-muted fw-semibold">Active filters:</span>
          {search !== "" && (
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle d-flex align-items-center gap-1">
              Search: &quot;{search}&quot;
              <button type="button" className="btn-close" style={{ fontSize: 8, width: 10, height: 10 }} onClick={() => setSearch("")} aria-label="Clear search"></button>
            </span>
          )}
          {selectedClass !== "all" && (
            <span className="badge bg-info-subtle text-info border border-info-subtle d-flex align-items-center gap-1">
              {selectedClass}
              <button type="button" className="btn-close" style={{ fontSize: 8, width: 10, height: 10 }} onClick={() => setSelectedClass("all")} aria-label="Clear class"></button>
            </span>
          )}
          {selectedTerm !== "all" && (
            <span className="badge bg-warning-subtle text-warning border border-warning-subtle d-flex align-items-center gap-1">
              {selectedTerm}
              <button type="button" className="btn-close" style={{ fontSize: 8, width: 10, height: 10 }} onClick={() => setSelectedTerm("all")} aria-label="Clear term"></button>
            </span>
          )}
        </div>
      )}
      
      {/* Students Table */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing: "0.05em" }}>Name</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-sm-table-cell" style={{ letterSpacing: "0.05em" }}>ID</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-md-table-cell" style={{ letterSpacing: "0.05em" }}>Subject</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-lg-table-cell" style={{ letterSpacing: "0.05em" }}>Track & Strand</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-lg-table-cell" style={{ letterSpacing: "0.05em" }}>Term</th>
                <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={6} className="text-center py-4 small text-muted">{displayStudents.length === 0 ? "No students found." : "No students match the selected filters."}</td></tr>
                : filtered.map((s, idx) => (
                  <tr key={`${s.id}-${s.subject}-${s.term}-${idx}`}>
                    <td className="ps-4 small fw-medium text-dark">
                      <div className="d-flex align-items-center gap-2">
                        {s.photo_url && !imageErrors.has(s.id) ? (
                          <img src={s.photo_url} alt={s.name} className="rounded-circle" style={{ width: 32, height: 32, objectFit: 'cover' }} onError={() => handleImageError(s.id)} />
                        ) : (
                          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                            {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td className="d-none d-sm-table-cell small text-muted">{s.id}</td>
                    <td className="d-none d-md-table-cell small text-muted">{s.subject || "-"}</td>
                    <td className="d-none d-lg-table-cell small text-muted">{s.track_strand || s.pathway}</td>
                    <td className="d-none d-lg-table-cell small text-muted">{s.term || "-"}</td>
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

/* -- NEW Grades Panel -- */
function GradesPanel({ isGradeLocked, activeTerm }: { isGradeLocked: boolean; activeTerm: string }) {
  // ========== STATE ==========
  // Subject/Class selection
  const [subjects, setSubjects] = useState<Array<{
    subject_name: string;
    strand: string;
    term: string;
    total_students: number;
    graded_count: number;
    progress_percentage: number;
    is_complete: boolean;
  }>>([]);
  
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string>("Term 1"); // Default to Term 1
  
  // Students and grades
  const [students, setStudents] = useState<Array<{
    student_id: string;
    full_name: string;
    photo_url: string | null;
    pathway: string;
    grade_level: number;
    percentage: number | null;
    submission_status: string | null;
  }>>([]);
  
  const [editedGrades, setEditedGrades] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  
  // Submission window
  const [submissionWindow, setSubmissionWindow] = useState<{
    is_open: boolean;
    start_date: string;
    end_date: string;
    days_remaining: number;
  } | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // ========== LOAD SUBJECTS ON MOUNT ==========
  useEffect(() => {
    loadSubjects();
  }, [selectedTerm]);

  async function loadSubjects() {
    const token = localStorage.getItem("inform_token");
    if (!token || token.startsWith("demo_")) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/teacher/grade-submission/subjects-new`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
        
        // Auto-select first subject for selected term
        const termSubjects = data.subjects.filter((s: any) => s.term === selectedTerm);
        if (termSubjects.length > 0 && !selectedSubject) {
          const firstSubject = `${termSubjects[0].subject_name}|${termSubjects[0].strand}`;
          setSelectedSubject(firstSubject);
        }
      }
    } catch (err) {
      console.error("Failed to load subjects:", err);
      showToast("❌ Failed to load subjects");
    } finally {
      setLoading(false);
    }
  }

  // ========== LOAD STUDENTS WHEN SUBJECT CHANGES ==========
  useEffect(() => {
    if (selectedSubject) {
      loadStudents();
    }
  }, [selectedSubject, selectedTerm]);

  async function loadStudents() {
    if (!selectedSubject) return;
    
    const [subject_name, strand] = selectedSubject.split("|");
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setLoading(true);

    try {
      const params = new URLSearchParams({
        subject_name,
        strand,
        term: selectedTerm
      });

      const response = await fetch(
        `${API_BASE}/api/teacher/grade-submission/students-for-class?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
        setSubmissionWindow(data.submission_window);
        
        // Initialize edited grades with current values
        const initial: Record<string, string> = {};
        data.students.forEach((s: any) => {
          if (s.percentage !== null) {
            initial[s.student_id] = s.percentage.toString();
          }
        });
        setEditedGrades(initial);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
      showToast("❌ Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  // ========== AUTO-SAVE EVERY 30 SECONDS ==========
  useEffect(() => {
    if (!selectedSubject || Object.keys(editedGrades).length === 0) return;
    
    const interval = setInterval(() => {
      autoSaveGrades();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [editedGrades, selectedSubject]);

  async function autoSaveGrades() {
    if (!selectedSubject || saving || submitting) return;

    const [subject_name, strand] = selectedSubject.split("|");
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    let savedCount = 0;

    for (const [student_id, percentageStr] of Object.entries(editedGrades)) {
      if (percentageStr === '' || percentageStr === null) continue;
      
      const percentage = parseFloat(percentageStr);
      if (isNaN(percentage) || percentage < 0 || percentage > 100) continue;

      try {
        const response = await fetch(`${API_BASE}/api/teacher/grade-submission/save-draft`, {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            student_id,
            subject_name,
            strand,
            percentage,
            term: selectedTerm
          })
        });

        if (response.ok) {
          savedCount++;
        }
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }

    if (savedCount > 0) {
      setLastAutoSave(new Date());
    }
  }

  // ========== MANUAL SAVE ==========
  async function saveAllDrafts() {
    if (!selectedSubject) return;

    const [subject_name, strand] = selectedSubject.split("|");
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setSaving(true);
    let successCount = 0;
    let errorCount = 0;

    for (const [student_id, percentageStr] of Object.entries(editedGrades)) {
      if (percentageStr === '' || percentageStr === null) continue;
      
      const percentage = parseFloat(percentageStr);
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        errorCount++;
        continue;
      }

      try {
        const response = await fetch(`${API_BASE}/api/teacher/grade-submission/save-draft`, {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            student_id,
            subject_name,
            strand,
            percentage,
            term: selectedTerm
          })
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (err) {
        errorCount++;
      }
    }

    setSaving(false);
    
    if (errorCount === 0) {
      showToast(`✅ Saved ${successCount} grade(s)`);
      setLastAutoSave(new Date());
      loadStudents(); // Reload to get updated data
    } else {
      showToast(`⚠️ Saved ${successCount}, ${errorCount} failed`);
    }
  }

  // ========== SUBMIT BATCH ==========
  async function submitBatch() {
    if (!selectedSubject) return;

    const [subject_name, strand] = selectedSubject.split("|");
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setSubmitting(true);
    setShowConfirmModal(false);

    try {
      const response = await fetch(`${API_BASE}/api/teacher/grade-submission/submit-batch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          subject_name,
          strand,
          term: selectedTerm,
          notes: ""
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`✅ ${data.total_submitted} grades submitted successfully!`);
        loadStudents();
      } else {
        showToast(`❌ ${data.error || "Submission failed"}`);
      }
    } catch (err) {
      showToast("❌ Network error");
    } finally {
      setSubmitting(false);
    }
  }

  // ========== HELPER FUNCTIONS ==========
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  function handleGradeChange(studentId: string, value: string) {
    // Allow empty or numbers 0-100 with decimals
    if (value === '' || (/^\d*\.?\d*$/.test(value) && (value === '' || parseFloat(value) <= 100))) {
      setEditedGrades(prev => ({ ...prev, [studentId]: value }));
    }
  }

  function handleImageError(studentId: string) {
    setImageErrors(prev => new Set(prev).add(studentId));
  }

  // ========== CALCULATED VALUES ==========
  const currentSubjectData = subjects.find(s => 
    `${s.subject_name}|${s.strand}` === selectedSubject && s.term === selectedTerm
  );

  const gradedStudents = students.filter(s => 
    editedGrades[s.student_id] && editedGrades[s.student_id] !== ''
  );

  const percentages = gradedStudents
    .map(s => parseFloat(editedGrades[s.student_id]))
    .filter(p => !isNaN(p));

  const classAverage = percentages.length > 0
    ? (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(1)
    : '0.0';

  const progressPercentage = students.length > 0
    ? Math.round((gradedStudents.length / students.length) * 100)
    : 0;

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id.toLowerCase().includes(search.toLowerCase())
  );

  const canSubmit = gradedStudents.length === students.length && students.length > 0;
  const isWindowOpen = submissionWindow?.is_open ?? false;
  
  // Check if all grades are already approved
  const allApproved = students.length > 0 && students.every(s => s.submission_status === 'approved');
  const hasApprovedGrades = students.some(s => s.submission_status === 'approved');

  // Get time since last auto-save
  const timeSinceAutoSave = lastAutoSave 
    ? Math.floor((new Date().getTime() - lastAutoSave.getTime()) / 1000)
    : null;

  // ========== RENDER ==========
  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div>
        <h2 className="fw-black fs-4 text-dark mb-1">Grade Management</h2>
        <p className="text-muted small mb-0">Submit and manage student grades (internal record)</p>
      </div>

      {/* Status Alert */}
      {!isWindowOpen && (
        <div className="rounded-3 p-3 d-flex align-items-start gap-3" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <div style={{ color: "#dc2626", marginTop: 2 }}><Icon name="alert" size={20} /></div>
          <div>
            <div className="fw-bold small text-danger">Grade Submission Closed for {selectedTerm}</div>
            <div className="text-muted small">Contact the principal to open the submission window.</div>
          </div>
        </div>
      )}

      {isWindowOpen && submissionWindow && (
        <div className="rounded-3 p-3 d-flex align-items-start gap-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <div style={{ color: "#16a34a", marginTop: 2 }}><Icon name="checkCircle" size={20} /></div>
          <div>
            <div className="fw-bold small text-success">Grade Submission Open for {selectedTerm}</div>
            <div className="text-muted small">
              {submissionWindow.days_remaining > 0 
                ? `${submissionWindow.days_remaining} days remaining until ${new Date(submissionWindow.end_date).toLocaleDateString()}`
                : 'Closes today!'}
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="rounded-3 p-3 d-flex align-items-start gap-3" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
        <div style={{ color: "#2563eb", marginTop: 2 }}><Icon name="alert" size={18} /></div>
        <div className="small text-muted">
          <strong>Note:</strong> Submitted grades are recorded internally and not visible to students. 
          Students must submit grade requests to receive their grades.
        </div>
      </div>

      {/* Already Approved Alert */}
      {selectedSubject && allApproved && (
        <div className="rounded-3 p-3 d-flex align-items-start gap-3" style={{ background: "#f0fdf4", border: "1px solid #86efac" }}>
          <div style={{ color: "#16a34a", marginTop: 2 }}><Icon name="checkCircle" size={20} /></div>
          <div>
            <div className="fw-bold small text-success">Grades Already Submitted & Approved</div>
            <div className="text-muted small">
              All grades for this class have been submitted and approved. No further action needed.
            </div>
          </div>
        </div>
      )}

      {/* Class Selector & Term Filter */}
      <div className="row g-3">
        <div className="col-md-7">
          <label className="form-label fw-semibold text-uppercase small mb-2" style={{ letterSpacing: "0.05em", color: "#6b7280" }}>
            Select Class
          </label>
          <select
            value={selectedSubject || ""}
            onChange={e => setSelectedSubject(e.target.value)}
            className="form-select shadow-sm"
            disabled={loading}
          >
            <option value="">-- Select a class --</option>
            {subjects.filter(s => s.term === selectedTerm).map(subj => (
              <option key={`${subj.subject_name}|${subj.strand}`} value={`${subj.subject_name}|${subj.strand}`}>
                {subj.subject_name} - {subj.strand}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-5">
          <label className="form-label fw-semibold text-uppercase small mb-2" style={{ letterSpacing: "0.05em", color: "#6b7280" }}>
            Term
          </label>
          <div className="btn-group w-100 shadow-sm" role="group">
            {["Term 1", "Term 2", "Term 3"].map(term => (
              <button
                key={term}
                type="button"
                className={`btn ${selectedTerm === term ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => {
                  setSelectedTerm(term);
                  setSelectedSubject(null);
                }}
              >
                {term.replace("Term ", "")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Card */}
      {selectedSubject && (
        <div className="card border-0 shadow-sm rounded-3" style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)" }}>
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h3 className="fw-bold mb-1">{selectedSubject.split("|")[0]}</h3>
                <p className="text-muted small mb-0">{selectedSubject.split("|")[1]} · {selectedTerm}</p>
              </div>
              {lastAutoSave && timeSinceAutoSave !== null && (
                <span className="badge bg-success-subtle text-success border border-success-subtle">
                  💾 Auto-saved {timeSinceAutoSave}s ago
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small fw-semibold text-dark">Progress</span>
                <span className="small text-muted">{gradedStudents.length}/{students.length} students ({progressPercentage}%)</span>
              </div>
              <div className="progress" style={{ height: 12 }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${progressPercentage}%` }}
                  role="progressbar"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="row g-3">
              <div className="col-6">
                <div className="text-muted small">Class Average</div>
                <div className="fw-bold fs-4 text-primary">{classAverage}%</div>
              </div>
              <div className="col-6">
                <div className="text-muted small">Total Students</div>
                <div className="fw-bold fs-4 text-dark">{students.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {selectedSubject && students.length > 0 && (
        <div className="input-group shadow-sm">
          <span className="input-group-text bg-white border-end-0">
            <Icon name="search" size={18} />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search students by name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Students Table */}
      {selectedSubject && (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em", color: "#6b7280" }}>Student</th>
                  <th className="small fw-semibold text-uppercase d-none d-md-table-cell" style={{ letterSpacing: "0.05em", color: "#6b7280" }}>ID</th>
                  <th className="small fw-semibold text-uppercase d-none d-lg-table-cell" style={{ letterSpacing: "0.05em", color: "#6b7280" }}>Pathway</th>
                  <th className="small fw-semibold text-uppercase" style={{ letterSpacing: "0.05em", color: "#6b7280" }}>Grade (%)</th>
                  <th className="pe-4 small fw-semibold text-uppercase text-center" style={{ letterSpacing: "0.05em", color: "#6b7280", width: 60 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-primary me-2" />
                      <span className="text-muted small">Loading students...</span>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted small">
                      {search ? `No students found matching "${search}"` : 'No students enrolled in this class'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => {
                    const hasGrade = editedGrades[student.student_id] && editedGrades[student.student_id] !== '';
                    const gradeValue = editedGrades[student.student_id] || '';
                    const isValid = gradeValue === '' || (!isNaN(parseFloat(gradeValue)) && parseFloat(gradeValue) >= 0 && parseFloat(gradeValue) <= 100);

                    return (
                      <tr key={student.student_id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-2">
                            {student.photo_url && !imageErrors.has(student.student_id) ? (
                              <img
                                src={student.photo_url}
                                alt={student.full_name}
                                className="rounded-circle"
                                style={{ width: 32, height: 32, objectFit: 'cover' }}
                                onError={() => handleImageError(student.student_id)}
                              />
                            ) : (
                              <div
                                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                                style={{ width: 32, height: 32, fontSize: '0.75rem' }}
                              >
                                {student.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span className="small fw-medium">{student.full_name}</span>
                          </div>
                        </td>
                        <td className="d-none d-md-table-cell small text-muted">{student.student_id}</td>
                        <td className="d-none d-lg-table-cell small text-muted">{student.pathway}</td>
                        <td>
                          <input
                            type="text"
                            className={`form-control form-control-sm ${!isValid ? 'is-invalid' : ''}`}
                            style={{ width: 100 }}
                            value={gradeValue}
                            onChange={e => handleGradeChange(student.student_id, e.target.value)}
                            placeholder="0-100"
                            disabled={!isWindowOpen || student.submission_status === 'approved'}
                          />
                        </td>
                        <td className="pe-4 text-center">
                          {hasGrade && isValid ? (
                            <span className="text-success" title="Grade entered">✅</span>
                          ) : !isValid ? (
                            <span className="text-danger" title="Invalid grade">⚠️</span>
                          ) : (
                            <span className="text-muted" title="No grade">⚪</span>
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
      )}

      {/* Action Buttons */}
      {selectedSubject && students.length > 0 && isWindowOpen && !allApproved && (
        <div className="d-flex gap-2 justify-content-end">
          <button
            className="btn btn-outline-secondary"
            onClick={() => {
              setEditedGrades({});
              loadStudents();
            }}
            disabled={saving || submitting}
          >
            Cancel Changes
          </button>
          <button
            className="btn btn-primary"
            onClick={saveAllDrafts}
            disabled={saving || submitting || Object.keys(editedGrades).length === 0}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Saving...
              </>
            ) : (
              <>
                💾 Save All Drafts
              </>
            )}
          </button>
          <button
            className="btn btn-success"
            onClick={() => setShowConfirmModal(true)}
            disabled={!canSubmit || saving || submitting || allApproved}
            title={allApproved ? "Grades already submitted and approved" : ""}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Submitting...
              </>
            ) : allApproved ? (
              <>
                ✅ Already Submitted
              </>
            ) : (
              <>
                📤 Submit All Grades
              </>
            )}
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Grade Submission</h5>
                  <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)} />
                </div>
                <div className="modal-body">
                  <p>You are about to submit grades for <strong>{gradedStudents.length} students</strong>.</p>
                  <p className="text-muted small mb-0">
                    These grades will be recorded in the system and available for grade requests. 
                    The principal can return grades if corrections are needed.
                  </p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-success" onClick={submitBatch}>
                    Confirm Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" onClick={() => setShowConfirmModal(false)} />
        </>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 11 }}>
          <div className="toast show" role="alert">
            <div className="toast-body">
              {toast}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -- Grade Requests Panel -- */
function RequestsPanel({ isGradeLocked, activeTerm }: { isGradeLocked: boolean; activeTerm: string }) {
  const [requests, setRequests] = useState<Array<{
    id: number;
    status: string;
    student_id: string;
    full_name: string;
    student_name?: string;
    subject_code: string;
    subject_name: string;
    subject_title: string;
    term: string;
    current_grade?: string;
    requestedAt?: string;
    created_at?: string;
    score?: number;
    letterGrade?: string;
    submittedToAdminAt?: string;
    adminVerifiedBy?: string;
    adminVerifiedAt?: string;
    adminNote?: string;
    releasedAt?: string;
    rejectedBy?: string;
  }>>([]);
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
    showToast("Request accepted - enter the calculated grade below");
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "teacher_calculating" } : r));
  }

  async function submitToAdmin(id: number) {
    if (isGradeLocked) return;
    const g = grading[id];
    if (!g?.score || isNaN(Number(g.score))) { 
      showToast("Enter a valid score first"); 
      return; 
    }
    const score = Number(g.score);
      
    const token = localStorage.getItem("inform_token");
    if (!token) {
      showToast("Authentication required");
      return;
    }

    try {
      console.log(`[SUBMIT] Submitting grade request ${id} with score ${score}`);
      const response = await fetch(`${API_BASE}/api/grade-requests/teacher/${id}/submit`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        credentials: "include",
        body: JSON.stringify({ score, remarks: g.remarks || "" }),
      });

      console.log(`[SUBMIT] Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error(`[SUBMIT] Error:`, errorData);
        showToast(errorData?.error || "Failed to submit grade");
        return;
      }

      const data = await response.json();
      console.log(`[SUBMIT] Success:`, data);
      
      // Clear the grading entry and reload
      setGrading(prev => { 
        const n = { ...prev }; 
        delete n[id]; 
        return n; 
      });
      
      await reload();
      showToast("Grade submitted to Principal for review");
    } catch (err) {
      console.error(`[SUBMIT] Exception:`, err);
      showToast("Network error - please try again");
    }
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
      .then(() => { reload(); showToast("Grade released to student!"); })
      .catch(() => {});
  }


  function rejectRequest(_id: number) {
    if (isGradeLocked) return;
    reload();
    showToast("? Request rejected");
  }

  function statusLabel(status: string): string {
    const labels: Record<string, string> = {
      student_requested:  "Requested",
      teacher_calculating:"Calculating",
      principal_review:   "Sent to Principal",
      principal_approved: "Principal Approved",
      released_to_student:"Grade Released",
      rejected:           "Rejected",
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
  const pendingAdmin    = requests.filter(r => r.status === "principal_review"); // NEW FLOW: principal_review instead of registrar_review
  const verifiedByAdmin = requests.filter(r => r.status === "principal_approved");
  const released        = requests.filter(r => r.status === "released_to_student");
  const rejected        = requests.filter(r => r.status === "rejected");

  // Lock check (tracked but not displayed currently)

  return (
    <div className="d-flex flex-column gap-4">
      {/* Toast */}
      {toast && (
        <div className="position-fixed bottom-0 end-0 m-4 alert alert-dark shadow-lg rounded-3 py-2 px-3 d-flex align-items-center gap-2"
          style={{ zIndex: 9999, fontSize: 13, minWidth: 280, animation: "fadeInUp 0.3s ease" }}>
          {toast}
        </div>
      )}

      <div><h2 className="fw-black fs-4 text-dark mb-1">Grade Requests</h2><p className="text-muted small mb-0">Student grade requests from all terms</p></div>

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
          <h3 className="fw-bold small text-dark mb-3">New Student Requests - Action Required</h3>
          <div className="d-flex flex-column gap-2">
            {newRequests.map(req => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark mb-1">{req.student_name || req.full_name}</div>
                      <div className="text-muted small">{req.subject_code || req.subject_name}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{req.term} · Requested: {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'N/A'}</div>
                    </div>
                    <span className={`badge ${statusBadgeClass(req.status)}`} style={{ fontSize: 10 }}>{statusLabel(req.status)}</span>
                  </div>
                  {isGradeLocked
                    ? <div className="rounded-3 p-2 text-center small text-danger" style={{ background: "#fef2f2", border: "1px dashed #fca5a5" }}>Locked - visit Registrar's Office</div>
                    : <div className="d-flex gap-2">
                        <button onClick={() => acceptRequest(req.id)} className="btn btn-primary btn-sm flex-grow-1">Accept &amp; Calculate</button>
                        <button onClick={() => rejectRequest(req.id)} className="btn btn-outline-danger btn-sm">Reject</button>
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
          <h3 className="fw-bold small text-dark mb-3">Enter &amp; Submit Grades to Principal</h3>
          <div className="d-flex flex-column gap-2">
            {inProgress.map(req => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3" style={{ border: "1.5px solid #bfdbfe" }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark mb-1">{req.student_name || req.full_name}</div>
                      <div className="text-muted small">{req.subject_code || req.subject_name}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{activeTerm}</div>
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
                    ? <div className="rounded-3 p-2 text-center small text-danger" style={{ background: "#fef2f2", border: "1px dashed #fca5a5" }}>Locked - visit Registrar's Office</div>
                    : <button onClick={() => submitToAdmin(req.id)} className="btn btn-primary btn-sm w-100">Submit to Principal for Verification</button>
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
          <h3 className="fw-bold small text-dark mb-3">Awaiting Principal Verification</h3>
          <div className="d-flex flex-column gap-2">
            {pendingAdmin.map(req => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3 opacity-85">
                <div className="card-body p-3 d-flex align-items-center gap-3">
                  <div className="rounded-3 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0 text-primary" style={{ width: 40, height: 40 }}><Icon name="requests" size={20} /></div>
                  <div className="flex-grow-1">
                    <div className="fw-bold small text-dark">{req.full_name} · {req.subject_title}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>Score: {req.score}% ({req.letterGrade}) · Submitted: {req.submittedToAdminAt}</div>
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
          <h3 className="fw-bold small text-dark mb-3">Principal Verified - Release to Student</h3>
          <div className="d-flex flex-column gap-2">
            {verifiedByAdmin.map(req => (
              <div key={req.id} className="card border-0 rounded-3" style={{ border: "1.5px solid #bbf7d0" }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                    <div>
                      <div className="fw-bold text-dark small">{req.full_name} · {req.subject_title}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>Score: {req.score}% ({req.letterGrade}) · Verified by {req.adminVerifiedBy} on {req.adminVerifiedAt}</div>
                      {req.adminNote && <div className="text-muted fst-italic" style={{ fontSize: 11 }}>Admin note: {req.adminNote}</div>}
                    </div>
                    <span className={`badge ${statusBadgeClass(req.status)}`} style={{ fontSize: 10 }}>{statusLabel(req.status)}</span>
                  </div>
                  {isGradeLocked
                    ? <div className="rounded-3 p-2 text-center small text-danger" style={{ background: "#fef2f2", border: "1px dashed #fca5a5" }}>Locked - visit Registrar's Office</div>
                    : <button onClick={() => releaseToStudent(req.id)} className="btn btn-success btn-sm w-100">Release Grade to Student</button>
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
          <h3 className="fw-bold small text-dark mb-3">🎓 Released to Students</h3>
          <div className="d-flex flex-column gap-2">
            {released.map(req => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3 opacity-75">
                <div className="card-body p-3 d-flex align-items-center gap-3">
                  <div className="rounded-3 bg-success bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0 text-success" style={{ width: 40, height: 40 }}><Icon name="checkCircle" size={20} /></div>
                  <div className="flex-grow-1">
                    <div className="fw-bold small text-dark">{req.full_name} – {req.subject_title}</div>
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
                  <div><div className="fw-bold small text-dark">{req.full_name} · {req.subject_title}</div><div className="text-muted" style={{ fontSize: 11 }}>Rejected by {req.rejectedBy}</div></div>
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
          <h3 className="fw-bold small text-dark mb-3">🔔 Unread</h3>
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
function AttendancePanel({ teacherSubjects = subjects }: { teacherSubjects?: Array<{ id: number; name: string }> }) {
  const [selectedSubject, setSelectedSubject] = useState<number | null>(teacherSubjects[0]?.id ?? null);
  const [apiAttendance, setApiAttendance] = useState<{student_id:string;full_name:string;total_meetings:number;days_present:number}[]>([]);
  const [attLoading, setAttLoading] = useState(false);
  const [attError, setAttError] = useState(false);
  const [attToast, setAttToast] = useState<string|null>(null);

  function showAttToast(msg: string) { setAttToast(msg); setTimeout(() => setAttToast(null), 3000); }

  useEffect(() => {
    if (selectedSubject === null) return;
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
    const record = (apiAttendance.length > 0 ? apiAttendance : attendance.filter(a => a.subject === teacherSubjects.find(s=>s.id===selectedSubject)?.name).map(a=>({student_id:a.student_id,full_name:a.name,total_meetings:a.total,days_present:a.present})))
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
    : attendance.filter(a => a.subject === teacherSubjects.find(s => s.id === selectedSubject)?.name);

  const avgAttendance = displayAttendance.length > 0 ? Math.round(displayAttendance.reduce((a, att) => a + att.percentage, 0) / displayAttendance.length) : 0;
  return (
    <div className="d-flex flex-column gap-4">
      {attToast && <div className="position-fixed bottom-0 end-0 m-4 alert alert-dark shadow-lg rounded-3 py-2 px-3" style={{ zIndex: 9999, fontSize: 13, minWidth: 220, animation: "fadeInUp 0.3s ease" }}>{attToast}</div>}
      <div><h2 className="fw-black fs-4 text-dark mb-1">Attendance Management</h2><p className="text-muted small mb-0">Track student attendance per subject</p></div>
      <div className="d-flex gap-3 flex-wrap align-items-center">
        <div style={{ width: 220 }}>
          <label className="form-label fw-semibold text-uppercase mb-1" style={{ fontSize: 11 }}>Select Subject</label>
          <select value={selectedSubject ?? ""} onChange={e => setSelectedSubject(e.target.value ? Number(e.target.value) : null)} className="form-select form-select-sm rounded-3">
            {teacherSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="card border-0 bg-success-subtle flex-grow-1 rounded-3">
          <div className="card-body p-3 d-flex align-items-center gap-3">
            <span style={{ fontSize: 24 }}></span>
            <div className="flex-grow-1"><div className="fw-bold text-dark small">{teacherSubjects.find(s => s.id === selectedSubject)?.name ?? "No subject assigned"}</div><div className="text-muted" style={{ fontSize: 11 }}>{displayAttendance.length} students tracked</div></div>
            <div className="fw-black fs-3 text-success">{avgAttendance}%</div>
          </div>
        </div>
      </div>
      {teacherSubjects.length === 0 && <div className="alert alert-info small">No subjects are assigned to your account yet.</div>}
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
          <h3 className="fw-bold small text-dark mb-3">📅 Today&apos;s Log</h3>
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
          <h3 className="fw-bold small text-dark mb-3">📋 Full History</h3>
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
    student_id: string; full_name: string; email: string; pathway: string | null; grade_level: number | null; photo_url: string | null; track: string | null; strand: string | null; subject_name?: string; term?: string; track_strand?: string;
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
      case "schedule":      return <SchedulePanel />;
      case "students":      return <StudentsPanel students={apiStudents.length ? apiStudents.map(s => {
        // Build pathway string from track/strand
        let pathwayDisplay = s.track || "Academic Track";
        if (s.strand) {
          pathwayDisplay = `${s.track} - ${s.strand}`;
        }
        
        // Build track_strand string
        const trackStrand = (s.track && s.strand) ? `${s.track} - ${s.strand}` : (s.track || s.strand || "");
        
        return {
          id: s.student_id, 
          name: s.full_name, 
          pathway: pathwayDisplay, 
          grade: s.grade_level || 11, 
          status: "Active",
          photo_url: s.photo_url,
          subject: s.subject_name,
          term: s.term,
          track_strand: trackStrand
        };
      }) : undefined} />;
      case "grades":        return <GradesPanel isGradeLocked={isGradeLocked} activeTerm={activeTerm} />;
      case "requests":      return <RequestsPanel isGradeLocked={isGradeLocked} activeTerm={activeTerm} />;
      case "documents":     return <DocumentApprovalsPanel />;
      case "notifications": return <NotificationsPanel />;
      default:          return <Overview setActive={setPanel} isGradeLocked={isGradeLocked} activeTerm={activeTerm} teacher={apiTeacher} />;
    }
  }

  return (
    <div className="teacher-dashboard-layout" style={{ minHeight: "100vh", background: "#f0f4ff" }} suppressHydrationWarning>
      <Sidebar active={panel} setActive={setPanel} show={mobileOpen} setShow={setMobileOpen} />

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
                🔒 Grades Locked
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
                  <div className="text-muted" style={{ minWidth: 24 }}><Icon name={(n.icon || 'bell') as IconName} size={18} /></div>
                  <div className="flex-grow-1">
                    <div className="fw-bold small text-dark">{n.title || 'Notification'}</div>
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

