"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const TIMELOG_KEY = "inform_teacher_timelog";

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

/* ── Data ── */
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
  { day: "Monday",    time: "07:30–08:30", subject: "Algebra I",  room: "Room 301", enter: "07:25", leave: "08:35" },
  { day: "Monday",    time: "08:30–09:30", subject: "Geometry",   room: "Room 205", enter: "08:25", leave: "09:35" },
  { day: "Tuesday",   time: "07:30–09:00", subject: "Calculus I", room: "Sci. Lab", enter: "07:20", leave: "09:05" },
  { day: "Wednesday", time: "07:30–08:30", subject: "Algebra I",  room: "Room 301", enter: "07:25", leave: "08:35" },
  { day: "Thursday",  time: "07:30–09:00", subject: "Calculus I", room: "Sci. Lab", enter: "07:20", leave: "09:05" },
  { day: "Friday",    time: "07:30–08:30", subject: "Algebra I",  room: "Room 301", enter: "07:25", leave: "08:35" },
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
  { action: "Grade Submitted",    name: "Jamie Santos",    time: "2h ago",   icon: "📊" },
  { action: "Attendance Updated", name: "Maria Reyes",     time: "3h ago",   icon: "✅" },
  { action: "Grade Submitted",    name: "Carlo Dela Cruz", time: "5h ago",   icon: "📊" },
  { action: "Attendance Updated", name: "Luis Fernandez",  time: "Yesterday",icon: "✅" },
];

const teacherNotifications = [
  { id: 1, type: "document",   title: "Document Request",   message: "Jamie Santos requested a TOR",                        time: "1h ago", read: false, icon: "📄" },
  { id: 2, type: "grade",      title: "Grade Submitted",    message: "Your grades for Algebra I have been submitted",       time: "2h ago", read: false, icon: "✅" },
  { id: 3, type: "enrollment", title: "New Student Enrolled",message: "Rosa Bautista enrolled in your Geometry class",     time: "1d ago", read: true,  icon: "🎓" },
];

const documentApprovals = [
  { id: 1, student: "Jamie Santos",    type: "TOR",         status: "pending",  requestedAt: "May 18, 2026", approvedAt: "",            icon: "📄" },
  { id: 2, student: "Maria Reyes",     type: "Certificate", status: "pending",  requestedAt: "May 17, 2026", approvedAt: "",            icon: "📜" },
  { id: 3, student: "Carlo Dela Cruz", type: "TOR",         status: "approved", requestedAt: "May 15, 2026", approvedAt: "May 16, 2026",icon: "✅" },
];

/* ── Trimester deadline logic ── */
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
  { id: "overview",       label: "Overview",        icon: "🏠" },
  { id: "subjects",       label: "My Classes",       icon: "📚" },
  { id: "schedule",       label: "My Schedule",      icon: "📅" },
  { id: "students",       label: "My Students",      icon: "🎓" },
  { id: "grades",         label: "Submit Grades",    icon: "📊" },
  { id: "requests",       label: "Grade Requests",   icon: "📨" },
  { id: "attendance",     label: "Attendance",       icon: "✅" },
  { id: "documents",      label: "Documents",        icon: "📄" },
  { id: "timelog" as Panel, label: "Time Log", icon: "🕐" },
];

/* ── Sidebar ── */
function Sidebar({ active, setActive, show, setShow, onExpandChange }: { active: string; setActive: (s: Panel) => void; show: boolean; setShow: (b: boolean) => void; onExpandChange?: (expanded: boolean) => void }) {
  const [expanded, setExpanded] = useState(false);
  const handleMouseEnter = () => { setExpanded(true); onExpandChange?.(true); };
  const handleMouseLeave = () => { setExpanded(false); onExpandChange?.(false); };
  return (
    <>
      {show && <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" style={{ zIndex: 1040 }} onClick={() => setShow(false)} />}
      <div
        className={`dashboard-sidebar d-flex flex-column flex-shrink-0 position-fixed top-0 start-0 h-100 ${show ? "" : "d-none d-lg-flex"}`}
        style={{ width: show ? 256 : expanded ? 256 : 80, zIndex: 1045, background: "linear-gradient(180deg,#1e1b4b 0%,#312e81 100%)", overflowY: "auto", overflowX: "hidden" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Logo */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-group" style={{ flexDirection: expanded ? "column" : "row", alignItems: "center", justifyContent: "center", width: "100%" }}>
            <img src="/cfei-logo.jpg" alt="CFEI" className="sidebar-brand-logo" />
            {expanded && (
              <div className="sidebar-brand-info" style={{ alignItems: "center", textAlign: "center", marginTop: 10 }}>
                <div className="sidebar-brand-title">Teacher Portal</div>
              </div>
            )}
          </div>
          {expanded && <button className="btn-close btn-close-white sidebar-brand-close d-lg-none" onClick={() => setShow(false)} />}
        </div>

        {/* Profile - Right after Teacher Portal */}
        {expanded && (
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
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>👤</span>
              </div>
            </Link>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-grow-1 px-3 py-2 d-flex flex-column gap-1 mt-2">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActive(item.id as Panel); setShow(false); }}
              className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0"
              style={{ color: active === item.id ? "#fff" : "rgba(255,255,255,0.5)", background: active === item.id ? "#059669" : "transparent", justifyContent: expanded ? "flex-start" : "center", whiteSpace: "nowrap" }}
              title={item.label}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {expanded && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout button - More visible at bottom */}
        {expanded && (
          <div className="px-3 py-3 border-top border-white border-opacity-10">
            <Link href="/teacher/login" className="btn w-100 fw-semibold py-2 d-flex align-items-center justify-content-center gap-2" style={{ background: "rgba(220,38,38,0.15)", color: "#fca5a5", border: "1px solid rgba(220,38,38,0.3)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.25)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(220,38,38,0.15)"; e.currentTarget.style.color = "#fca5a5"; }}>
              <span style={{ fontSize: 16 }}>↩</span>
              <span>Log Out</span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Overview ── */
function Overview({ setActive, isGradeLocked, activeTerm }: { setActive: (s: Panel) => void; isGradeLocked: boolean; activeTerm: string }) {
  const pendingRequests = gradeRequestsTeacher.filter(r => r.status === "pending").length;
  const avgGrade = Math.round(grades.reduce((a, g) => a + g.percentage, 0) / grades.length);

  const quickLinks = [
    { id: "subjects"  as Panel, label: "My Classes",     icon: "📚", bg: "#3b82f6" },
    { id: "grades"    as Panel, label: "Submit Grades",  icon: "📊", bg: isGradeLocked ? "#94a3b8" : "#8b5cf6" },
    { id: "requests"  as Panel, label: "Grade Requests", icon: "📨", bg: isGradeLocked ? "#94a3b8" : "#f59e0b" },
    { id: "attendance"as Panel, label: "Attendance",     icon: "✅", bg: "#14b8a6" },
    { id: "documents" as Panel, label: "Documents",      icon: "📄", bg: "#ec4899" },
  ];

  return (
    <div className="d-flex flex-column gap-4">
      {/* Welcome */}
      <div className="rounded-3 p-4" style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 8px 32px rgba(5,150,105,0.25)" }}>
        <h2 className="text-white fw-black fs-4 mb-1">Welcome back, {teacherData.full_name} 👋</h2>
        <p className="text-white-50 small mb-0">Department: {teacherData.department} · {teacherData.teacher_id}</p>
      </div>

      {/* Lock banner */}
      {isGradeLocked && (
        <div className="rounded-3 p-3 d-flex align-items-start gap-3" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <span style={{ fontSize: 22 }}>🔒</span>
          <div>
            <div className="fw-bold small text-danger">Grade Submission Locked — {activeTerm} Deadline Passed</div>
            <div className="text-muted small">You have unresolved grade requests. Visit the <strong>Registrar&apos;s Office</strong> to restore access.</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="row g-3">
        {[
          { label: "My Classes",       value: subjects.length,    icon: "📚", cls: "border-primary-subtle bg-primary-subtle",   val: "text-primary"   },
          { label: "My Students",      value: students.length,    icon: "🎓", cls: "border-success-subtle bg-success-subtle",   val: "text-success"   },
          { label: "Class Avg. Grade", value: `${avgGrade}%`,     icon: "📈", cls: "border-warning-subtle bg-warning-subtle",   val: "text-warning"   },
          { label: "Pending Requests", value: pendingRequests,    icon: "📨", cls: "border-danger-subtle bg-danger-subtle",     val: "text-danger"    },
        ].map(s => (
          <div key={s.label} className="col-6 col-lg-3">
            <div className={`card border rounded-3 h-100 ${s.cls}`}>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">{s.label}</span>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                </div>
                <div className={`fw-black fs-3 ${s.val}`}>{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div>
        <p className="text-muted text-uppercase small fw-semibold mb-3" style={{ letterSpacing: "0.08em" }}>Quick Access</p>
        <div className="row g-3">
          {quickLinks.map(q => {
            const locked = isGradeLocked && (q.id === "grades" || q.id === "requests");
            return (
              <div key={q.id} className="col-6 col-sm-4 col-lg-2">
                <button onClick={() => !locked && setActive(q.id)}
                  disabled={locked}
                  title={locked ? "Locked — visit Registrar's Office" : undefined}
                  className="btn w-100 py-3 d-flex flex-column align-items-center gap-2 rounded-3 text-white border-0 shadow-sm"
                  style={{ background: q.bg, transition: "transform 0.15s", opacity: locked ? 0.5 : 1, cursor: locked ? "not-allowed" : "pointer" }}
                  onMouseEnter={e => { if (!locked) e.currentTarget.style.transform = "scale(1.04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
                  <span style={{ fontSize: 28 }}>{locked ? "🔒" : q.icon}</span>
                  <span className="small fw-bold">{q.label}</span>
                </button>
              </div>
            );
          })}
        </div>
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
                    <div className="rounded-3 bg-light border d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 36, height: 36, fontSize: 18 }}>{a.icon}</div>
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
                    <div className="rounded-3 bg-success bg-opacity-10 border border-success border-opacity-25 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 36, height: 36, fontSize: 18 }}>📚</div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="small fw-semibold text-dark text-truncate">{s.name}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{s.code} · {s.units} units</div>
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

/* ── Schedule Panel ── */
function SchedulePanel() {
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
  const todayIdx = Math.min(new Date().getDay() - 1, 4);
  const [day, setDay] = useState(days[todayIdx >= 0 ? todayIdx : 0]);
  const daySchedule = teacherSchedule.filter(s => s.day === day);
  return (
    <div className="d-flex flex-column gap-4">
      <div><h2 className="fw-black fs-4 text-dark mb-1">My Teaching Schedule</h2><p className="text-muted small mb-0">Term 1 · 2025–2026</p></div>
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
                    <div><div className="fw-bold text-dark">{cls.subject}</div><div className="text-muted small">📍 {cls.room}</div></div>
                    <span className="badge bg-dark text-white">{cls.time}</span>
                  </div>
                  <div className="row g-2">
                    {[["📍 Room", cls.room, "bg-light"], ["🚪 Enter", cls.enter, "bg-success bg-opacity-10 border-success border-opacity-25"], ["🚪 Leave", cls.leave, "bg-danger bg-opacity-10 border-danger border-opacity-25"], ["👥 Students", String(subjects.find(s => s.name === cls.subject)?.enrolled || 0), "bg-info bg-opacity-10 border-info border-opacity-25"]].map(([label, val, bg]) => (
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

/* ── Subjects Panel ── */
function SubjectsPanel() {
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

/* ── Students Panel ── */
function StudentsPanel() {
  const [search, setSearch] = useState("");
  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="d-flex flex-column gap-4">
      <div><h2 className="fw-black fs-4 text-dark mb-1">My Students</h2><p className="text-muted small mb-0">{students.length} students in your classes</p></div>
      <div className="input-group shadow-sm" style={{ maxWidth: 400 }}>
        <span className="input-group-text bg-white">🔍</span>
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

/* ── Grades Panel ── */
function GradesPanel({ isGradeLocked, activeTerm }: { isGradeLocked: boolean; activeTerm: string }) {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
  const subjectGrades = grades.filter(g => g.subject === subjects.find(s => s.id === selectedSubject)?.name);
  const avg = subjectGrades.length > 0 ? Math.round(subjectGrades.reduce((a, g) => a + g.percentage, 0) / subjectGrades.length) : 0;
  return (
    <div className="d-flex flex-column gap-4">
      <div><h2 className="fw-black fs-4 text-dark mb-1">Grade Management</h2><p className="text-muted small mb-0">Submit and manage student grades</p></div>
      {isGradeLocked && (
        <div className="rounded-3 p-3 d-flex align-items-start gap-3" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <span style={{ fontSize: 22 }}>🔒</span>
          <div>
            <div className="fw-bold small text-danger">Grade Submission Locked — {activeTerm} deadline passed</div>
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
            <span style={{ fontSize: 24 }}>📊</span>
            <div className="flex-grow-1"><div className="fw-bold text-dark small">{subjects.find(s => s.id === selectedSubject)?.name}</div><div className="text-muted" style={{ fontSize: 11 }}>{subjectGrades.length} students graded</div></div>
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
              {subjectGrades.map((g, i) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Grade Requests Panel ── */
function RequestsPanel({ isGradeLocked, activeTerm }: { isGradeLocked: boolean; activeTerm: string }) {
  const [requests, setRequests] = useState<import("../../../app/lib/gradeRequests").GradeRequest[]>([]);
  const [grading, setGrading] = useState<Record<number, { score: string; remarks: string }>>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const { loadRequests } = require("../../../app/lib/gradeRequests");
    // Teacher T001 = "Mr. Dela Cruz" — show requests assigned to this teacher
    setRequests(loadRequests().filter((r: import("../../../app/lib/gradeRequests").GradeRequest) =>
      r.teacher === "Mr. Dela Cruz"
    ));
  }, []);

  function reload() {
    const { loadRequests } = require("../../../app/lib/gradeRequests");
    setRequests(loadRequests().filter((r: import("../../../app/lib/gradeRequests").GradeRequest) =>
      r.teacher === "Mr. Dela Cruz"
    ));
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  function acceptRequest(id: number) {
    if (isGradeLocked) return;
    const { updateRequest } = require("../../../app/lib/gradeRequests");
    updateRequest(id, { status: "teacher_calculating" });
    reload();
    showToast("📝 Request accepted — enter the calculated grade below");
  }

  function submitToAdmin(id: number) {
    if (isGradeLocked) return;
    const g = grading[id];
    if (!g?.score || isNaN(Number(g.score))) { showToast("⚠️ Enter a valid score first"); return; }
    const score = Number(g.score);
    const letterGrade = score >= 97 ? "A+" : score >= 93 ? "A" : score >= 90 ? "A-"
      : score >= 87 ? "B+" : score >= 83 ? "B" : score >= 80 ? "B-"
      : score >= 77 ? "C+" : score >= 73 ? "C" : score >= 70 ? "C-"
      : score >= 65 ? "D" : "F";
    const { updateRequest } = require("../../../app/lib/gradeRequests");
    updateRequest(id, {
      status: "submitted_to_admin",
      score,
      letterGrade,
      remarks: g.remarks || "",
      submittedToAdminAt: new Date().toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" }),
    });
    setGrading(prev => { const n = { ...prev }; delete n[id]; return n; });
    reload();
    showToast(`📤 Grade submitted to Admin for verification`);
  }

  function releaseToStudent(id: number) {
    if (isGradeLocked) return;
    const { updateRequest } = require("../../../app/lib/gradeRequests");
    updateRequest(id, {
      status: "released_to_student",
      releasedAt: new Date().toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" }),
    });
    reload();
    showToast("🎓 Grade released to student!");
  }

  function rejectRequest(id: number) {
    if (isGradeLocked) return;
    const { updateRequest } = require("../../../app/lib/gradeRequests");
    updateRequest(id, {
      status: "rejected",
      rejectedBy: "Teacher",
      rejectedAt: new Date().toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" }),
    });
    reload();
    showToast("✕ Request rejected");
  }

  const { statusLabel, statusBadgeClass } = require("../../../app/lib/gradeRequests");

  const newRequests     = requests.filter(r => r.status === "student_requested");
  const inProgress      = requests.filter(r => r.status === "teacher_calculating");
  const pendingAdmin    = requests.filter(r => r.status === "submitted_to_admin");
  const verifiedByAdmin = requests.filter(r => r.status === "admin_verified");
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
          <span style={{ fontSize: 22 }}>🔒</span>
          <div>
            <div className="fw-bold small text-danger">Actions Locked — {activeTerm} deadline passed</div>
            <div className="text-muted small">Visit the <strong>Registrar&apos;s Office</strong> to restore access.</div>
          </div>
        </div>
      )}

      {/* Pipeline workflow diagram */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-3">
          <div className="fw-bold small text-dark mb-3">📊 Grade Request Pipeline</div>
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

      {/* STEP 1 — New student requests */}
      {newRequests.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">📨 New Student Requests — Action Required</h3>
          <div className="d-flex flex-column gap-2">
            {newRequests.map(req => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div>
                      <div className="fw-bold text-dark small">{req.student}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{req.subject} · {req.term} · {req.requestedAt}</div>
                    </div>
                    <span className={`badge ${statusBadgeClass(req.status)}`} style={{ fontSize: 10 }}>{statusLabel(req.status)}</span>
                  </div>
                  {isGradeLocked
                    ? <div className="rounded-3 p-2 text-center small text-danger" style={{ background: "#fef2f2", border: "1px dashed #fca5a5" }}>🔒 Locked — visit Registrar&apos;s Office</div>
                    : <div className="d-flex gap-2">
                        <button onClick={() => acceptRequest(req.id)} className="btn btn-primary btn-sm flex-grow-1">📝 Accept &amp; Calculate</button>
                        <button onClick={() => rejectRequest(req.id)} className="btn btn-outline-danger btn-sm">✕ Reject</button>
                      </div>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 — Teacher calculating, enter grade form */}
      {inProgress.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">📝 Enter &amp; Submit Grades to Admin</h3>
          <div className="d-flex flex-column gap-2">
            {inProgress.map(req => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3" style={{ border: "1.5px solid #bfdbfe" }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div>
                      <div className="fw-bold text-dark small">{req.student}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{req.subject} · {req.term}</div>
                    </div>
                    <span className={`badge ${statusBadgeClass(req.status)}`} style={{ fontSize: 10 }}>{statusLabel(req.status)}</span>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label className="form-label fw-semibold text-uppercase mb-1" style={{ fontSize: 10 }}>Score (0–100)</label>
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
                    ? <div className="rounded-3 p-2 text-center small text-danger" style={{ background: "#fef2f2", border: "1px dashed #fca5a5" }}>🔒 Locked — visit Registrar&apos;s Office</div>
                    : <button onClick={() => submitToAdmin(req.id)} className="btn btn-primary btn-sm w-100">📤 Submit to Admin for Verification</button>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 — Waiting for admin */}
      {pendingAdmin.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">⏳ Awaiting Admin Verification</h3>
          <div className="d-flex flex-column gap-2">
            {pendingAdmin.map(req => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3 opacity-85">
                <div className="card-body p-3 d-flex align-items-center gap-3">
                  <div className="rounded-3 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40, fontSize: 18 }}>📤</div>
                  <div className="flex-grow-1">
                    <div className="fw-bold small text-dark">{req.student} — {req.subject}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>Score: {req.score}% ({req.letterGrade}) · Submitted: {req.submittedToAdminAt}</div>
                  </div>
                  <span className={`badge ${statusBadgeClass(req.status)}`} style={{ fontSize: 10 }}>{statusLabel(req.status)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4 — Admin verified, teacher must release */}
      {verifiedByAdmin.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">✅ Admin Verified — Release to Student</h3>
          <div className="d-flex flex-column gap-2">
            {verifiedByAdmin.map(req => (
              <div key={req.id} className="card border-0 rounded-3" style={{ border: "1.5px solid #bbf7d0" }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                    <div>
                      <div className="fw-bold text-dark small">{req.student} — {req.subject}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>Score: {req.score}% ({req.letterGrade}) · Verified by {req.adminVerifiedBy} on {req.adminVerifiedAt}</div>
                      {req.adminNote && <div className="text-muted fst-italic" style={{ fontSize: 11 }}>Admin note: {req.adminNote}</div>}
                    </div>
                    <span className={`badge ${statusBadgeClass(req.status)}`} style={{ fontSize: 10 }}>{statusLabel(req.status)}</span>
                  </div>
                  {isGradeLocked
                    ? <div className="rounded-3 p-2 text-center small text-danger" style={{ background: "#fef2f2", border: "1px dashed #fca5a5" }}>🔒 Locked — visit Registrar&apos;s Office</div>
                    : <button onClick={() => releaseToStudent(req.id)} className="btn btn-success btn-sm w-100">🎓 Release Grade to Student</button>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5 — Released */}
      {released.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">🎓 Released to Students</h3>
          <div className="d-flex flex-column gap-2">
            {released.map(req => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3 opacity-75">
                <div className="card-body p-3 d-flex align-items-center gap-3">
                  <div className="rounded-3 bg-success bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40, fontSize: 18 }}>🎓</div>
                  <div className="flex-grow-1">
                    <div className="fw-bold small text-dark">{req.student} — {req.subject}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>Final Grade: {req.letterGrade} ({req.score}%) · Released: {req.releasedAt}</div>
                  </div>
                  <span className="badge bg-success text-white" style={{ fontSize: 10 }}>🎓 Released</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">✕ Rejected</h3>
          <div className="d-flex flex-column gap-2">
            {rejected.map(req => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3 opacity-75">
                <div className="card-body p-3 d-flex align-items-center justify-content-between">
                  <div><div className="fw-bold small text-dark">{req.student} — {req.subject}</div><div className="text-muted" style={{ fontSize: 11 }}>Rejected by {req.rejectedBy}</div></div>
                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle" style={{ fontSize: 10 }}>✕ Rejected</span>
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

/* ── Document Approvals ── */
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
          <h3 className="fw-bold small text-dark mb-3">⏳ Pending Approvals</h3>
          <div className="d-flex flex-column gap-2">
            {pending.map(doc => (
              <div key={doc.id} className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div><div className="fw-bold small text-dark">{doc.student}</div><div className="text-muted" style={{ fontSize: 11 }}>{doc.type} · {doc.requestedAt}</div></div>
                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle">Pending</span>
                  </div>
                  <div className="d-flex gap-2">
                    <button onClick={() => setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: "approved", approvedAt: new Date().toLocaleDateString() } : d))} className="btn btn-success btn-sm flex-grow-1">✓ Approve</button>
                    <button onClick={() => setDocs(prev => prev.filter(d => d.id !== doc.id))} className="btn btn-danger btn-sm flex-grow-1">✕ Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {approved.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">✅ Approved</h3>
          <div className="d-flex flex-column gap-2">
            {approved.map(doc => (
              <div key={doc.id} className="card border-0 shadow-sm rounded-3 opacity-75">
                <div className="card-body p-3 d-flex align-items-center justify-content-between">
                  <div><div className="fw-bold small text-dark">{doc.student}</div><div className="text-muted" style={{ fontSize: 11 }}>{doc.type} · Approved {doc.approvedAt}</div></div>
                  <span className="badge bg-success-subtle text-success border border-success-subtle">✓ Approved</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Notifications ── */
function NotificationsPanel() {
  const [notifs, setNotifs] = useState(teacherNotifications);
  const unread = notifs.filter(n => !n.read);
  const read   = notifs.filter(n => n.read);
  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-center justify-content-between">
        <div><h2 className="fw-black fs-4 text-dark mb-1">Notifications</h2><p className="text-muted small mb-0">{unread.length} unread</p></div>
        {unread.length > 0 && <button onClick={() => setNotifs(prev => prev.map(n => ({ ...n, read: true })))} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: 12 }}>Mark all read</button>}
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
                      <button onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: 12 }}>✓</button>
                      <button onClick={() => setNotifs(prev => prev.filter(x => x.id !== n.id))} className="btn btn-link btn-sm p-0 text-danger" style={{ fontSize: 12 }}>✕</button>
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
          <h3 className="fw-bold small text-dark mb-3">✅ Read</h3>
          <div className="d-flex flex-column gap-2">
            {read.map(n => (
              <div key={n.id} className="card border-0 shadow-sm rounded-3 opacity-75">
                <div className="card-body p-3 d-flex align-items-start gap-3">
                  <span style={{ fontSize: 16 }}>{n.icon}</span>
                  <div className="flex-grow-1"><div className="fw-bold small text-dark">{n.title}</div><div className="text-muted small">{n.message}</div></div>
                  <button onClick={() => setNotifs(prev => prev.filter(x => x.id !== n.id))} className="btn btn-link btn-sm p-0 text-danger" style={{ fontSize: 12 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Attendance Panel ── */
function AttendancePanel() {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
  const subjectAttendance = attendance.filter(a => a.subject === subjects.find(s => s.id === selectedSubject)?.name);
  const avgAttendance = subjectAttendance.length > 0 ? Math.round(subjectAttendance.reduce((a, att) => a + att.percentage, 0) / subjectAttendance.length) : 0;
  return (
    <div className="d-flex flex-column gap-4">
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
            <span style={{ fontSize: 24 }}>✅</span>
            <div className="flex-grow-1"><div className="fw-bold text-dark small">{subjects.find(s => s.id === selectedSubject)?.name}</div><div className="text-muted" style={{ fontSize: 11 }}>{subjectAttendance.length} students tracked</div></div>
            <div className="fw-black fs-3 text-success">{avgAttendance}%</div>
          </div>
        </div>
      </div>
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
              {subjectAttendance.map((a, i) => (
                <tr key={i}>
                  <td className="ps-4 small fw-medium text-dark">{a.name}</td>
                  <td className="d-none d-sm-table-cell small text-muted">{a.present}/{a.total}</td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <button className="btn btn-success btn-sm" style={{ fontSize: 11 }}>✓ Present</button>
                      <button className="btn btn-danger btn-sm"  style={{ fontSize: 11 }}>✕ Absent</button>
                    </div>
                  </td>
                  <td className="text-end pe-4 fw-black small text-success">{a.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Time Log Panel ── */
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
    showToast("✅ Time In recorded successfully");
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
    showToast("👋 Time Out recorded successfully");
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
            <span style={{ fontSize: 36 }}>{currentSession ? "🟢" : "🔴"}</span>
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
            {currentSession ? "🚪 Time Out" : "🏫 Time In"}
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
                    <td className="small text-danger fw-semibold">{l.timeOut ?? <span className="text-muted fst-italic">—</span>}</td>
                    <td className="pe-4">
                      <span className={`badge ${l.status === "in" ? "bg-success-subtle text-success border border-success-subtle" : "bg-secondary-subtle text-secondary border border-secondary-subtle"}`}>
                        {l.status === "in" ? "🟢 On Campus" : "✓ Completed"}
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
                          {l.status === "in" ? "🟢 On Campus" : "✓ Done"}
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

/* ── Main Page ── */
export default function TeacherDashboardPage() {
  const [panel, setPanel]           = useState<Panel>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showNotif, setShowNotif]   = useState(false);
  const [notifs, setNotifs]         = useState(teacherNotifications);
  const [pendingCount, setPendingCount] = useState(0);

  // Load live pending count from shared store
  useEffect(() => {
    const { loadRequests } = require("../../lib/gradeRequests");
    const reqs = loadRequests();
    const count = reqs.filter((r: { teacher: string; status: string }) =>
      r.teacher === "Mr. Dela Cruz" &&
      ["student_requested", "teacher_calculating"].includes(r.status)
    ).length;
    setPendingCount(count);
  }, [panel]); // re-check when user navigates panels
  const deadlinePassed = isDeadlinePassed();
  const isGradeLocked  = deadlinePassed && pendingCount > 0;
  const activeTerm     = getActiveTerm();
  const unreadCount    = notifs.filter(n => !n.read).length;

  function renderPanel() {
    switch (panel) {
      case "subjects":      return <SubjectsPanel />;
      case "schedule":      return <SchedulePanel />;
      case "students":      return <StudentsPanel />;
      case "grades":        return <GradesPanel isGradeLocked={isGradeLocked} activeTerm={activeTerm} />;
      case "requests":      return <RequestsPanel isGradeLocked={isGradeLocked} activeTerm={activeTerm} />;
      case "attendance":    return <AttendancePanel />;
      case "documents":     return <DocumentApprovalsPanel />;
      case "notifications": return <NotificationsPanel />;
      case "timelog":       return <TimeLogPanel />;
      default:              return <Overview setActive={setPanel} isGradeLocked={isGradeLocked} activeTerm={activeTerm} />;
    }
  }

  return (
    <div className="teacher-dashboard-layout" style={{ minHeight: "100vh", background: "#f0f4ff" }} suppressHydrationWarning>
      <Sidebar active={panel} setActive={setPanel} show={mobileOpen} setShow={setMobileOpen} onExpandChange={setSidebarExpanded} />

      <div className="teacher-dashboard-main" style={{ marginLeft: sidebarExpanded ? 256 : 80 }}>
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
              <span style={{ fontSize: 22 }}>🔔</span>
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
                <button onClick={() => setShowNotif(false)} className="btn btn-link btn-sm p-0 text-muted" style={{ fontSize: 18 }} aria-label="Close">✕</button>
              </div>
            </div>
            {notifs.length === 0
              ? <div className="px-4 py-5 text-center text-muted"><div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div><small>No notifications</small></div>
              : notifs.map(n => (
                <div key={n.id} className="px-3 px-md-4 py-3 border-bottom d-flex gap-2 gap-md-3" style={{ background: n.read ? "white" : "rgba(5,150,105,0.04)", opacity: n.read ? 0.7 : 1 }}>
                  <div style={{ fontSize: 20, minWidth: 24 }}>{n.icon}</div>
                  <div className="flex-grow-1">
                    <div className="fw-bold small text-dark">{n.title}</div>
                    <div className="text-muted" style={{ fontSize: 12, lineHeight: 1.4 }}>{n.message}</div>
                    <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>{n.time}</div>
                  </div>
                  <div className="d-flex gap-1 flex-shrink-0">
                    {!n.read && <button onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: 12 }} aria-label="Mark as read">✓</button>}
                    <button onClick={() => setNotifs(prev => prev.filter(x => x.id !== n.id))} className="btn btn-link btn-sm p-0 text-danger" style={{ fontSize: 14 }} aria-label="Delete">✕</button>
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
