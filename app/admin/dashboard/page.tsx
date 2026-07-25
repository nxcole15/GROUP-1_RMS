"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

/* ── Data ── */
const students = [
  { id:"STU-2024-001", name:"Jamie Santos",    track:"STEM", grade:11, gwa:1.75, status:"Active",   tuition:"Paid",   room:1 },
  { id:"STU-2024-002", name:"Maria Reyes",     track:"HUMMS", grade:11, gwa:2.00, status:"Active",   tuition:"Unpaid", room:2 },
  { id:"STU-2024-003", name:"Carlo Dela Cruz", track:"ABM", grade:12, gwa:1.50, status:"Active",   tuition:"Paid",   room:3 },
  { id:"STU-2024-004", name:"Ana Villanueva",  track:"TVL-TechPro",  grade:11, gwa:2.25, status:"Inactive", tuition:"Unpaid", room:4 },
  { id:"STU-2024-005", name:"Luis Fernandez",  track:"STEM", grade:12, gwa:1.25, status:"Active",   tuition:"Paid",   room:1 },
  { id:"STU-2024-006", name:"Rosa Bautista",   track:"TVL-TechPro", grade:11, gwa:2.50, status:"Active",   tuition:"Paid",   room:2 },
  { id:"STU-2024-007", name:"Mark Uy",         track:"ABM", grade:12, gwa:3.00, status:"Active",   tuition:"Unpaid", room:3 },
  { id:"STU-2024-008", name:"Lena Cruz",       track:"HUMMS",  grade:11, gwa:1.75, status:"Active",   tuition:"Paid",   room:4 },
];

const teachers = [
  {
    id: "T001", name: "Maria Santos", employmentStatus: "Full Time",
    section: "STEM-1",
    subjects: [
      { name: "Mathematics", timeIn: "7:30 AM", timeOut: "9:30 AM" },
      { name: "Physics",     timeIn: "10:00 AM", timeOut: "12:00 PM" },
    ],
    room: 1,
  },
  {
    id: "T002", name: "Juan Dela Cruz", employmentStatus: "Part Time",
    section: "HUMMS-1",
    subjects: [
      { name: "English Literature", timeIn: "8:00 AM", timeOut: "10:00 AM" },
      { name: "History",            timeIn: "1:00 PM", timeOut: "3:00 PM" },
    ],
    room: 2,
  },
  {
    id: "T003", name: "Ana Reyes", employmentStatus: "Full Time",
    section: "ABM-1",
    subjects: [
      { name: "Chemistry", timeIn: "7:30 AM", timeOut: "9:30 AM" },
      { name: "Biology",   timeIn: "11:00 AM", timeOut: "1:00 PM" },
    ],
    room: 3,
  },
  {
    id: "T004", name: "Carlos Fernandez", employmentStatus: "Part Time",
    section: "TVL-1",
    subjects: [
      { name: "Computer Science",          timeIn: "9:00 AM", timeOut: "11:00 AM" },
      { name: "Information Technology",    timeIn: "2:00 PM", timeOut: "4:00 PM" },
    ],
    room: 4,
  },
];

const announcements = [
  { id:1, title:"Enrollment Period Open",       date:"May 20, 2026", target:"All Students",   status:"Active" },
  { id:2, title:"Final Exam Schedule Released", date:"May 18, 2026", target:"All Students",   status:"Active" },
  { id:4, title:"Tuition Deadline Reminder",    date:"May 10, 2026", target:"Unpaid Students",status:"Active" },
  { id:5, title:"Graduation Ceremony Details",  date:"May 5, 2026",  target:"4th Year",       status:"Draft"  },
];

const recentActivity = [
  { action:"New student enrolled",     name:"Rosa Bautista",   time:"2h ago",    icon:"🎓" },
  { action:"Tuition payment received", name:"Carlo Dela Cruz", time:"3h ago",    icon:"💰" },
  { action:"Grade submitted",          name:"Mr. Dela Cruz",   time:"5h ago",    icon:"📊" },

  { action:"Announcement posted",      name:"Admin",           time:"Yesterday", icon:"📢" },
];

const allGradeRequests = [
  { id: 1, student: "Jamie Santos", teacher: "Mr. Dela Cruz", subject: "Algebra I", status: "pending", requestedAt: "2h ago" },
  { id: 2, student: "Maria Reyes", teacher: "Mr. Dela Cruz", subject: "Algebra I", status: "pending", requestedAt: "1h ago" },
  { id: 3, student: "Carlo Dela Cruz", teacher: "Mr. Fernandez", subject: "Calculus I", status: "approved", requestedAt: "30m ago" },
  { id: 4, student: "Luis Fernandez", teacher: "Ms. Villanueva", subject: "Physics", status: "rejected", requestedAt: "1h ago" },
];

const allDocumentRequests = [
  { id: 1, student: "Jamie Santos",    type: "TOR",          status: "pending",  requestedAt: "May 18, 2026", teacher: "Mr. Dela Cruz",   grade: 11, track: "STEM",  releaseDate: null },
  { id: 2, student: "Maria Reyes",     type: "Certificate",  status: "pending",  requestedAt: "May 17, 2026", teacher: "Mr. Dela Cruz",   grade: 11, track: "HUMMS", releaseDate: null },
  { id: 3, student: "Carlo Dela Cruz", type: "TOR",          status: "approved", requestedAt: "May 15, 2026", teacher: "Mr. Fernandez",   grade: 12, track: "ABM",   releaseDate: "June 10, 2026", approvedAt: "May 16, 2026" },
  { id: 4, student: "Ana Villanueva",  type: "Good Standing",status: "approved", requestedAt: "May 14, 2026", teacher: "Ms. Villanueva",  grade: 11, track: "TVL-TechPro",   releaseDate: "June 8, 2026",  approvedAt: "May 15, 2026" },
];

const adminNotifications = [
  { id: 1, type: "document", title: "Document Request", message: "Jamie Santos requested a TOR", time: "1h ago", read: false, icon: "📄" },
  { id: 2, type: "grade", title: "Grade Submitted", message: "Mr. Dela Cruz submitted grades for Algebra I", time: "2h ago", read: false, icon: "✓" },
  { id: 3, type: "enrollment", title: "New Enrollment", message: "Rosa Bautista enrolled in the system", time: "1d ago", read: true, icon: "🎓" },
  { id: 4, type: "payment", title: "Payment Received", message: "Carlo Dela Cruz paid tuition fee", time: "2d ago", read: true, icon: "💰" },
];

const navItems = [
  { id:"overview",      label:"Overview",          icon:"🏠" },
  { id:"students",      label:"Students",          icon:"🎓" },
  { id:"teachers",      label:"Teachers",          icon:"👨‍🏫" },
  { id:"grades",        label:"Grades",            icon:"📊" },
  { id:"requests",      label:"Grade Requests",    icon:"📨" },
  { id:"documents",     label:"Documents",         icon:"📄" },
  { id:"enrollment",    label:"Enrollment",        icon:"📋" },
  { id:"tuition",       label:"Tuition",           icon:"💰" },
  { id:"announcements", label:"Announcements",     icon:"📢" },
  { id:"timelog",       label:"Teacher Time Logs", icon:"🕐" },
];

function initials(name: string) { return name.split(" ").map(n => n[0]).join("").slice(0, 2); }

/* ── Sidebar ── */
function Sidebar({ active, setActive, show, setShow, onExpandChange }: { active:string; setActive:(s:string)=>void; show:boolean; setShow:(b:boolean)=>void; onExpandChange?: (expanded: boolean) => void }) {
  const [expanded, setExpanded] = useState(false);

  const handleMouseEnter = () => {
    setExpanded(true);
    onExpandChange?.(true);
  };

  const handleMouseLeave = () => {
    setExpanded(false);
    onExpandChange?.(false);
  };

  return (
    <>
      {show && <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" style={{ zIndex:1040 }} onClick={() => setShow(false)} />}
      <div 
        className={`d-flex flex-column flex-shrink-0 position-fixed position-lg-static top-0 start-0 h-100 ${show ? "" : "d-none d-lg-flex"}`}
        style={{ 
          width: expanded ? 256 : 80, 
          zIndex: 1045, 
          background: "linear-gradient(180deg,#1e1b4b 0%,#312e81 100%)", 
          overflowY: "auto",
          transition: "width 0.3s ease",
          overflowX: "hidden"
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Logo */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-group" style={{ flexDirection: expanded ? "column" : "row", alignItems: "center", justifyContent: "center", width: "100%" }}>
            <img src="/cfei-logo.jpg" alt="CFEI" className="sidebar-brand-logo" />
            {expanded && (
              <div className="sidebar-brand-info" style={{ alignItems: "center", textAlign: "center", marginTop: 10 }}>
                <div className="sidebar-brand-title">Admin Panel</div>
              </div>
            )}
          </div>
          {expanded && <button className="btn-close btn-close-white sidebar-brand-close d-lg-none" onClick={() => setShow(false)} />}
        </div>
        
        {/* Admin badge */}
        {expanded && (
          <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-3 d-flex align-items-center gap-2" style={{ background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.35)" }}>
            <span>🛡️</span>
            <div><div style={{ color:"#a5b4fc", fontSize:12, fontWeight:700 }}>Administrator</div><div style={{ color:"rgba(165,180,252,0.6)", fontSize:11 }}>Full Access</div></div>
          </div>
        )}
        
        {/* Nav */}
        <nav className="flex-grow-1 px-3 py-2 d-flex flex-column gap-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActive(item.id); setShow(false); }}
              className={`btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0 ${active === item.id ? "text-white" : ""}`}
              style={{ 
                color: active === item.id ? "#fff" : "rgba(255,255,255,0.5)", 
                background: active === item.id ? "#4f46e5" : "transparent",
                justifyContent: expanded ? "flex-start" : "center",
                whiteSpace: "nowrap"
              }}
              title={item.label}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {expanded && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        
        {/* User */}
        {expanded && (
          <div className="px-3 py-4 border-top border-white border-opacity-10">
            <div className="d-flex align-items-center gap-3 rounded-3 px-3 py-2" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0" style={{ width:32, height:32, fontSize:12, background:"linear-gradient(135deg,#6366f1,#7c3aed)" }}>AD</div>
              <div className="flex-grow-1 overflow-hidden"><div className="text-white small fw-semibold text-truncate">Admin User</div><div className="text-truncate" style={{ color:"rgba(255,255,255,0.3)", fontSize:11 }}>admin@inform.edu</div></div>
              <Link href="/" className="text-decoration-none" style={{ color:"rgba(255,255,255,0.3)", fontSize:16 }} title="Log out">↩</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Overview ── */
function Overview({ setActive }: { setActive: (s: string) => void }) {
  const activeStudents = students.filter(s => s.status === "Active").length;
  const avgGwa         = (students.reduce((a, s) => a + s.gwa, 0) / students.length).toFixed(2);

  const trackOptions = [
    { label: "All Tracks", value: "all" },
    { label: "STEM", value: "STEM" },
    { label: "HUMMS", value: "HUMMS" },
    { label: "ABM", value: "ABM" },
    { label: "TVL-TechPro", value: "TVL-TechPro" },
  ] as const;

  const gradeOptions = [
    { label: "All Grades", value: "all" },
    { label: "Grade 11", value: "11" },
    { label: "Grade 12", value: "12" },
  ] as const;

  const genderOptions = [
    { label: "All Genders", value: "all" },
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
  ] as const;

  const [chartTrack, setChartTrack] = React.useState<(typeof trackOptions)[number]["value"]>("all");
  const [chartGrade, setChartGrade] = React.useState<(typeof gradeOptions)[number]["value"]>("all");
  const [chartGender, setChartGender] = React.useState<(typeof genderOptions)[number]["value"]>("all");



  const quickLinks = [
    { id:"students",      label:"Students",      icon:"🎓", bg:"#3b82f6" },
    { id:"grades",        label:"Grades",        icon:"📊", bg:"#8b5cf6" },
    { id:"enrollment",    label:"Enrollment",    icon:"📋", bg:"#14b8a6" },
    { id:"tuition",       label:"Tuition",       icon:"💰", bg:"#f59e0b" },
    { id:"announcements", label:"Announcements", icon:"📢", bg:"#ec4899" },
  ];

  return (
    <div className="d-flex flex-column gap-4">
      {/* Welcome banner */}
      <div className="rounded-3 p-4"
        style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow:"0 8px 32px rgba(99,102,241,0.25)" }}>
        <h2 className="text-white fw-black fs-4 mb-1">Welcome back, Admin 👋</h2>
        <p className="text-white-50 small mb-0">Manage students, teachers, grades, and system records.</p>
      </div>

      {/* Stats */}
      <div className="row g-3">
        {[
          { label:"Active Students", value:activeStudents, icon:"✅", cls:"border-success-subtle bg-success-subtle", val:"text-success" },
          { label:"Class Avg. GWA",  value:avgGwa,         icon:"📈", cls:"border-purple-subtle bg-purple-subtle",  val:"text-purple"  },
        ].map(s => (
          <div key={s.label} className="col-6">
            <div className={`card border rounded-3 h-100 ${s.cls}`}>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">{s.label}</span>
                  <span style={{ fontSize:20 }}>{s.icon}</span>
                </div>
                <div className={`fw-black fs-3 ${s.val}`}>{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick access */}
      <div>
        <p className="text-muted text-uppercase small fw-semibold mb-3" style={{ letterSpacing:"0.08em" }}>Quick Access</p>
        <div className="row g-3">
          {quickLinks.map(q => (
            <div key={q.id} className="col-6 col-sm-4 col-lg-2">
              <button onClick={() => setActive(q.id)}
                className="btn w-100 py-3 d-flex flex-column align-items-center gap-2 rounded-3 text-white border-0 shadow-sm"
                style={{ background: q.bg, transition:"transform 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
                <span style={{ fontSize:28 }}>{q.icon}</span>
                <span className="small fw-bold">{q.label}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity + announcements */}
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4">
              <h3 className="fw-bold small text-dark mb-3">Recent Activity</h3>
              <div className="d-flex flex-column gap-3">
                {recentActivity.map((a, i) => (
                  <div key={i} className="d-flex align-items-center gap-3">
                    <div className="rounded-3 bg-light border d-flex align-items-center justify-content-center flex-shrink-0" style={{ width:36, height:36, fontSize:18 }}>{a.icon}</div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="small fw-semibold text-dark text-truncate">{a.action}</div>
                      <div className="text-muted" style={{ fontSize:11 }}>{a.name}</div>
                    </div>
                    <span className="text-muted flex-shrink-0" style={{ fontSize:11 }}>{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Big chart beside announcements */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fw-bold small text-dark mb-0">Enrollment Insights</h3>
                <button onClick={() => setActive("enrollment")} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize:12 }}>Open →</button>
              </div>

              <div className="mb-3">
                <label className="small fw-semibold" style={{ color: "#0f172a" }}>Filter (Track · Grade · Gender)</label>

                <div className="d-flex gap-2 mt-2" style={{ flexWrap: "wrap" }}>
                  <div style={{ minWidth: 160 }}>
                    <label className="small" style={{ color: "#475569" }}>Track</label>
                    <select
                      value={chartTrack}
                      onChange={(e) => setChartTrack(e.target.value as (typeof trackOptions)[number]["value"])}

                      className="form-select form-select-sm rounded-3"
                      style={{ background: "rgba(255,255,255,0.9)" }}
                    >
                      {trackOptions.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ minWidth: 140 }}>
                    <label className="small" style={{ color: "#475569" }}>Grade</label>
                    <select
                      value={chartGrade}
                      onChange={(e) => setChartGrade(e.target.value as (typeof gradeOptions)[number]["value"])}

                      className="form-select form-select-sm rounded-3"
                      style={{ background: "rgba(255,255,255,0.9)" }}
                    >
                      {gradeOptions.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ minWidth: 160 }}>
                    <label className="small" style={{ color: "#475569" }}>Gender</label>
                    <select
                      value={chartGender}
                      onChange={(e) => setChartGender(e.target.value as (typeof genderOptions)[number]["value"])}

                      className="form-select form-select-sm rounded-3"
                      style={{ background: "rgba(255,255,255,0.9)" }}
                    >
                      {genderOptions.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {(() => {
                const filteredStudents = students.filter((s) => {
                  const matchTrack = chartTrack === "all" ? true : s.track === chartTrack;
                  const matchGrade = chartGrade === "all" ? true : String(s.grade) === chartGrade;

                  // Your current mock student data doesn't include gender.
                  // Treat missing gender as "all" so the chart still works.
                  const sGender = (s as unknown as { gender?: string }).gender;
                  const matchGender = chartGender === "all" ? true : (sGender ?? "") === chartGender;

                  return matchTrack && matchGrade && matchGender;
                });



                // group by track (for x-axis)
                const countsByTrack = ["STEM", "HUMMS", "ABM", "TVL-TechPro"].map((t) => {
                  return {
                    track: t,
                    count: filteredStudents.filter((s) => s.track === t).length,
                  };
                });

                const maxCount = Math.max(1, ...countsByTrack.map((c) => c.count));

                return (
                  <div>
                    <div className="small text-muted mb-2">
                      Enrolled students (animated bars)
                    </div>

                    <div
                      className="d-flex align-items-end gap-2"
                      style={{ height: 240, borderRadius: 16, padding: 12, background: "rgba(248,250,252,0.85)", border: "1px solid rgba(0,0,0,0.06)" }}
                    >
                      {countsByTrack.map((c, i) => {
                        const h = Math.round((c.count / maxCount) * 180);
                        const delay = i * 60;
                        const bg = c.count === 0
                          ? "rgba(148,163,184,0.25)"
                          : i % 3 === 0
                            ? "linear-gradient(180deg, rgba(220,38,38,0.95), rgba(245,158,11,0.95))"
                            : i % 3 === 1
                              ? "linear-gradient(180deg, rgba(249,115,22,0.95), rgba(251,191,36,0.95))"
                              : "linear-gradient(180deg, rgba(251,191,36,0.95), rgba(220,38,38,0.95))";

                        return (
                          <div key={c.track} style={{ width: "20%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                            <div
                              style={{
                                width: "100%",
                                height: h,
                                borderRadius: 12,
                                background: bg,
                                border: "1px solid rgba(0,0,0,0.06)",
                                boxShadow: "0 14px 30px rgba(220,38,38,0.15)",
                                transformOrigin: "bottom",
                                animation: `scaleIn 650ms cubic-bezier(0.4,0,0.2,1) ${delay}ms both`,
                              }}
                              title={`${c.track}: ${c.count}`}
                            />
                            <div className="small" style={{ color: "#0f172a", opacity: 0.85, fontWeight: 800, textAlign: "center", lineHeight: 1.1 }}>
                              {c.count} students
                            </div>

                          </div>
                        );
                      })}
                    </div>

                    <div className="d-flex justify-content-between mt-3">
                      <span className="small fw-semibold" style={{ color: "#0f172a" }}>Max: {maxCount}</span>
                      <span className="small fw-semibold" style={{ color: "#dc2626" }}>Theme: Orange/Yellow/Red</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Announcements row (kept) */}
      <div className="row g-4 mt-0">
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fw-bold small text-dark mb-0">Active Announcements</h3>
                <button onClick={() => setActive("announcements")} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize:12 }}>View all →</button>
              </div>
              <div className="d-flex flex-column gap-2">
                {announcements.filter(a => a.status === "Active").slice(0, 4).map(a => (
                  <div key={a.id} className="d-flex align-items-start gap-3 p-3 rounded-3 bg-light border border-transparent" style={{ cursor:"pointer" }}>
                    <span style={{ fontSize:18 }}>📢</span>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="small fw-semibold text-dark text-truncate">{a.title}</div>
                      <div className="text-muted" style={{ fontSize:11 }}>{a.target} · {a.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6"></div>
      </div>

    </div>
  );
}

/* ── Students Panel ── */
function StudentsPanel() {
  const [search, setSearch] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("All");
  const [selectedGrade, setSelectedGrade] = useState("All");

  const tracks = ["All", "STEM", "HUMMS", "ABM", "TVL-TechPro"];
  const grades = ["All", "11", "12"];

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    const matchTrack  = selectedTrack === "All" || s.track === selectedTrack;
    const matchGrade  = selectedGrade === "All" || s.grade === Number(selectedGrade);
    return matchSearch && matchTrack && matchGrade;
  });

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h2 className="fw-black fs-4 text-dark mb-0">Students</h2>
        <p className="text-muted small mb-0">{filtered.length} student{filtered.length !== 1 ? "s" : ""} found</p>
      </div>

      {/* Filters */}
      <div className="d-flex flex-column flex-sm-row gap-3">
        <div className="input-group shadow-sm flex-grow-1">
          <span className="input-group-text bg-white">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..." className="form-control border-start-0" />
        </div>
        <div className="d-flex gap-2">
          <div>
            <select value={selectedTrack} onChange={e => setSelectedTrack(e.target.value)} className="form-select form-select-sm rounded-3" style={{ minWidth: 120 }}>
              {tracks.map(t => <option key={t} value={t}>{t === "All" ? "All Tracks" : t}</option>)}
            </select>
          </div>
          <div>
            <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} className="form-select form-select-sm rounded-3" style={{ minWidth: 120 }}>
              {grades.map(g => <option key={g} value={g}>{g === "All" ? "All Grades" : `Grade ${g}`}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing:"0.05em" }}>#</th>
                <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing:"0.05em" }}>Name</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-sm-table-cell" style={{ letterSpacing:"0.05em" }}>ID</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-lg-table-cell" style={{ letterSpacing:"0.05em" }}>Track & Grade</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-lg-table-cell" style={{ letterSpacing:"0.05em" }}>GWA</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-lg-table-cell" style={{ letterSpacing:"0.05em" }}>Room</th>
                <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing:"0.05em" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={7} className="text-center text-muted py-4 small">No students found for the selected track/grade.</td></tr>
                : filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td className="ps-4 text-muted small">{i + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary fw-bold flex-shrink-0" style={{ width:28, height:28, fontSize:11 }}>{initials(s.name)}</div>
                        <span className="small fw-medium text-dark">{s.name}</span>
                      </div>
                    </td>
                    <td className="d-none d-sm-table-cell font-mono text-muted small">{s.id}</td>
                    <td className="d-none d-lg-table-cell text-muted small">{s.track} — Grade {s.grade}</td>
                    <td className="d-none d-lg-table-cell fw-bold text-primary small">{s.gwa}</td>
                    <td className="d-none d-lg-table-cell text-muted small"><span className="badge bg-info-subtle text-info border border-info-subtle">Room {s.room}</span></td>
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
function GradesPanel() {
  const [selected, setSelected] = useState(students[0].id);
  const student = students.find(s => s.id === selected)!;
  const grades = [
    { subject:"Mathematics",        grade:"A",  pct:92, units:3, teacher:"Mr. Dela Cruz"  },
    { subject:"Physics",            grade:"B+", pct:87, units:3, teacher:"Ms. Villanueva" },
    { subject:"English Literature", grade:"A+", pct:96, units:3, teacher:"Ms. Santos"     },
    { subject:"Chemistry",          grade:"B",  pct:81, units:3, teacher:"Mr. Fernandez"  },
    { subject:"History",            grade:"B+", pct:85, units:3, teacher:"Ms. Reyes"      },
    { subject:"Computer Science",   grade:"A",  pct:93, units:3, teacher:"Mr. Uy"         },
  ];
  const avg = Math.round(grades.reduce((a, g) => a + g.pct, 0) / grades.length);

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
        <div><h2 className="fw-black fs-4 text-dark mb-0">Grades Management</h2><p className="text-muted small mb-0">View and manage student grades</p></div>
        <button className="btn btn-primary btn-sm fw-bold shadow-sm">+ Submit Grades</button>
      </div>
      <div className="d-flex flex-column flex-sm-row gap-3">
        <div style={{ width: 220 }}>
          <label className="form-label text-muted fw-semibold text-uppercase mb-1" style={{ fontSize:11 }}>Select Student</label>
          <select value={selected} onChange={e => setSelected(e.target.value)} className="form-select form-select-sm rounded-3">
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex-grow-1 rounded-3 p-3 d-flex align-items-center gap-3 bg-primary bg-opacity-10 border border-primary border-opacity-25">
          <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0" style={{ width:44, height:44, fontSize:16 }}>{initials(student.name)}</div>
          <div className="flex-grow-1"><div className="fw-bold text-dark">{student.name}</div><div className="text-muted small">{student.id} · {student.track} Grade {student.grade}</div></div>
          <div className="text-end"><div className="fw-black fs-3 text-primary">{avg}%</div><div className="text-muted small">General Average</div></div>
        </div>
      </div>
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing:"0.05em" }}>Subject</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-sm-table-cell" style={{ letterSpacing:"0.05em" }}>Teacher</th>
                <th className="small text-muted fw-semibold text-uppercase text-center" style={{ letterSpacing:"0.05em" }}>Units</th>
                <th className="small text-muted fw-semibold text-uppercase text-end" style={{ letterSpacing:"0.05em" }}>Score</th>
                <th className="small text-muted fw-semibold text-uppercase text-end pe-4" style={{ letterSpacing:"0.05em" }}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => (
                <tr key={i}>
                  <td className="ps-4 small fw-medium text-dark">{g.subject}</td>
                  <td className="d-none d-sm-table-cell text-muted small">{g.teacher}</td>
                  <td className="text-center text-muted small">{g.units}</td>
                  <td className="text-end">
                    <div className="d-flex align-items-center justify-content-end gap-2">
                      <div className="progress flex-shrink-0" style={{ width:60, height:6 }}>
                        <div className="progress-bar bg-primary" style={{ width:`${g.pct}%` }} />
                      </div>
                      <span className="small fw-semibold text-dark">{g.pct}%</span>
                    </div>
                  </td>
                  <td className={`text-end pe-4 fw-black small ${g.pct >= 90 ? "text-success" : g.pct >= 80 ? "text-primary" : "text-warning"}`}>{g.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Enrollment Panel ── */
function EnrollmentPanel() {
  const DEADLINE = new Date("2026-06-15");

  const [enrollments, setEnrollments] = useState([
    { name:"Jamie Santos",    id:"STU-2024-001", track:"STEM",  grade:11, date:"May 18, 2026", enrollDate: new Date("2026-05-18"), status:"Confirmed", photo: null as string | null },
    { name:"Maria Reyes",     id:"STU-2024-002", track:"HUMMS", grade:11, date:"May 19, 2026", enrollDate: new Date("2026-05-19"), status:"Pending",   photo: null as string | null },
    { name:"Carlo Dela Cruz", id:"STU-2024-003", track:"ABM",   grade:12, date:"May 17, 2026", enrollDate: new Date("2026-05-17"), status:"Confirmed", photo: null as string | null },
    { name:"Ana Villanueva",  id:"STU-2024-004", track:"TVL-TechPro",   grade:11, date:"May 20, 2026", enrollDate: new Date("2026-05-20"), status:"Pending",   photo: null as string | null },
    { name:"Luis Fernandez",  id:"STU-2024-005", track:"STEM",  grade:12, date:"Jun 16, 2026", enrollDate: new Date("2026-06-16"), status:"Confirmed", photo: null as string | null },
    { name:"Rosa Bautista",   id:"STU-2024-006", track:"TVL-TechPro",   grade:11, date:"Jun 18, 2026", enrollDate: new Date("2026-06-18"), status:"Confirmed", photo: null as string | null },
  ]);

  function confirmEnrollment(id: string) {
    setEnrollments(prev => prev.map(e => e.id === id ? { ...e, status: "Confirmed" } : e));
  }

  function handlePhotoUpload(id: string, file: File) {
    const url = URL.createObjectURL(file);
    setEnrollments(prev => prev.map(e => e.id === id ? { ...e, photo: url } : e));
  }

  const confirmed = enrollments.filter(e => e.status === "Confirmed");
  const pending   = enrollments.filter(e => e.status === "Pending");
  const late      = enrollments.filter(e => e.enrollDate > DEADLINE);

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
        <div><h2 className="fw-black fs-4 text-dark mb-0">Enrollment</h2><p className="text-muted small mb-0">School Year 2025–2026 · Deadline: June 15, 2026</p></div>
        <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-2">🔔 Enrollment period is open</span>
      </div>

      {/* Stats */}
      <div className="row g-3">
        {[
          { label:"Total Enrolled", value:enrollments.length,  cls:"bg-primary-subtle border-primary-subtle text-primary" },
          { label:"Confirmed",      value:confirmed.length,    cls:"bg-success-subtle border-success-subtle text-success" },
          { label:"Pending Review", value:pending.length,      cls:"bg-warning-subtle border-warning-subtle text-warning" },
          { label:"Late Enrollees", value:late.length,         cls:"bg-danger-subtle border-danger-subtle text-danger"   },
        ].map(s => (
          <div key={s.label} className="col-6 col-sm-3">
            <div className={`card border rounded-3 ${s.cls}`}>
              <div className="card-body p-3 text-center">
                <div className="text-muted small mb-1">{s.label}</div>
                <div className="fw-black fs-2">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing:"0.05em" }}>Student</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-sm-table-cell" style={{ letterSpacing:"0.05em" }}>ID</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-lg-table-cell" style={{ letterSpacing:"0.05em" }}>Track</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-sm-table-cell" style={{ letterSpacing:"0.05em" }}>Date</th>
                <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing:"0.05em" }}>Status</th>
                <th className="small text-muted fw-semibold text-uppercase text-end pe-4" style={{ letterSpacing:"0.05em" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => {
                const isLate = e.enrollDate > DEADLINE;
                return (
                  <tr key={e.id} style={{ background: isLate ? "rgba(220,38,38,0.03)" : undefined }}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2">
                        {/* ID Photo or initials avatar */}
                        {e.photo ? (
                          <img
                            src={e.photo}
                            alt={e.name}
                            className="rounded-circle flex-shrink-0"
                            style={{ width:32, height:32, objectFit:"cover", border:"2px solid #e2e8f0" }}
                          />
                        ) : (
                          <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary fw-bold flex-shrink-0" style={{ width:32, height:32, fontSize:11 }}>
                            {initials(e.name)}
                          </div>
                        )}
                        <div>
                          <div className="small fw-medium text-dark">{e.name}</div>
                          {isLate && (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle" style={{ fontSize:9 }}>⚠️ Late Enrollee</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="d-none d-sm-table-cell font-mono text-muted small">{e.id}</td>
                    <td className="d-none d-lg-table-cell text-muted small">{e.track} Grade {e.grade}</td>
                    <td className="d-none d-sm-table-cell text-muted small">{e.date}</td>
                    <td>
                      <span className={`badge ${e.status==="Confirmed" ? "bg-success-subtle text-success border border-success-subtle" : "bg-warning-subtle text-warning border border-warning-subtle"}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex gap-2 justify-content-end align-items-center">
                        {/* Upload ID photo */}
                        <label className="btn btn-outline-secondary btn-sm mb-0" style={{ fontSize:10, cursor:"pointer" }} title="Upload ID Photo">
                          📷
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display:"none" }}
                            onChange={ev => { if (ev.target.files?.[0]) handlePhotoUpload(e.id, ev.target.files[0]); }}
                          />
                        </label>
                        {e.status === "Pending" && (
                          <button onClick={() => confirmEnrollment(e.id)} className="btn btn-primary btn-sm" style={{ fontSize:11 }}>Confirm</button>
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
    </div>
  );
}

/* ── Tuition Panel ── */
function TuitionPanel() {
  const allRecords = students.map(s => ({ ...s, total:22050, paid:s.tuition==="Paid"?22050:18500, balance:s.tuition==="Paid"?0:3550 }));
  const [search, setSearch]         = useState("");
  const [filterTrack, setFilterTrack] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const tracks = ["All", "STEM", "HUMMS", "ABM", "TVL-TechPro"];

  const filtered = allRecords.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchTrack  = filterTrack === "All" || r.track === filterTrack;
    const matchStatus = filterStatus === "All" || r.tuition === filterStatus;
    return matchSearch && matchTrack && matchStatus;
  });

  const totalCollected = allRecords.reduce((a,r) => a + r.paid, 0);
  const totalBalance   = allRecords.reduce((a,r) => a + r.balance, 0);

  return (
    <div className="d-flex flex-column gap-4">
      <div><h2 className="fw-black fs-4 text-dark mb-0">Tuition Records</h2><p className="text-muted small mb-0">Term 1 · Academic Year 2025–2026</p></div>

      {/* Stats */}
      <div className="row g-3">
        {[
          { label:"Total Assessment",  value:`₱${(allRecords.length*22050).toLocaleString()}`, cls:"bg-light border-secondary" },
          { label:"Total Collected",   value:`₱${totalCollected.toLocaleString()}`,             cls:"bg-success-subtle border-success-subtle text-success" },
          { label:"Total Balance Due", value:`₱${totalBalance.toLocaleString()}`,               cls:"bg-danger-subtle border-danger-subtle text-danger" },
        ].map(s => (
          <div key={s.label} className="col-4">
            <div className={`card border rounded-3 ${s.cls}`}>
              <div className="card-body p-3 text-center">
                <div className="text-muted small mb-1">{s.label}</div>
                <div className="fw-black fs-5">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="d-flex flex-column flex-sm-row gap-3">
        <div className="input-group shadow-sm flex-grow-1">
          <span className="input-group-text bg-white">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..." className="form-control border-start-0" />
        </div>
        <div className="d-flex gap-2">
          <select value={filterTrack} onChange={e => setFilterTrack(e.target.value)} className="form-select form-select-sm rounded-3" style={{ minWidth:130 }}>
            {tracks.map(t => <option key={t} value={t}>{t === "All" ? "All Tracks" : t}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select form-select-sm rounded-3" style={{ minWidth:120 }}>
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      <div className="text-muted small">Showing {filtered.length} of {allRecords.length} students</div>

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing:"0.05em" }}>Student</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-sm-table-cell" style={{ letterSpacing:"0.05em" }}>Track</th>
                <th className="small text-muted fw-semibold text-uppercase text-end d-none d-sm-table-cell" style={{ letterSpacing:"0.05em" }}>Total</th>
                <th className="small text-muted fw-semibold text-uppercase text-end d-none d-sm-table-cell" style={{ letterSpacing:"0.05em" }}>Paid</th>
                <th className="small text-muted fw-semibold text-uppercase text-end" style={{ letterSpacing:"0.05em" }}>Balance</th>
                <th className="small text-muted fw-semibold text-uppercase text-end pe-4" style={{ letterSpacing:"0.05em" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-4 small">No records found.</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={i}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary fw-bold flex-shrink-0" style={{ width:28, height:28, fontSize:11 }}>{initials(r.name)}</div>
                      <span className="small fw-medium text-dark">{r.name}</span>
                    </div>
                  </td>
                  <td className="d-none d-sm-table-cell text-muted small">{r.track} Grade {r.grade}</td>
                  <td className="d-none d-sm-table-cell text-muted small text-end">₱{r.total.toLocaleString()}</td>
                  <td className="d-none d-sm-table-cell text-success small fw-semibold text-end">₱{r.paid.toLocaleString()}</td>
                  <td className={`small fw-semibold text-end ${r.balance > 0 ? "text-danger" : "text-muted"}`}>{r.balance > 0 ? `₱${r.balance.toLocaleString()}` : "—"}</td>
                  <td className="text-end pe-4"><span className={`badge ${r.tuition==="Paid" ? "bg-success-subtle text-success border border-success-subtle" : "bg-danger-subtle text-danger border border-danger-subtle"}`}>{r.tuition}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Teachers Panel ── */
/* ── Grade submission deadlines per trimester ── */
const TRIMESTER_DEADLINES: Record<string, { label: string; deadline: Date; term: number }> = {
  "Term 1": { label: "Term 1",  deadline: new Date("2026-02-28"), term: 1 },
  "Term 2": { label: "Term 2",  deadline: new Date("2026-05-15"), term: 2 },
  "Term 3": { label: "Term 3",  deadline: new Date("2026-07-15"), term: 3 },
};

/* derive which term is currently active (most recent past deadline = current) */
function getCurrentTerm(): string {
  const now = new Date();
  const entries = Object.entries(TRIMESTER_DEADLINES);
  // find the term whose deadline is the nearest future or most recently passed
  const upcoming = entries.filter(([, v]) => v.deadline >= now);
  if (upcoming.length > 0) return upcoming[0][0];
  return entries[entries.length - 1][0]; // default to last
}

function daysUntil(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function TeachersPanel() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [currentTerm, setCurrentTerm]   = useState(getCurrentTerm());

  // Per-teacher state: reminder sent, locked status
  const [reminders, setReminders] = useState<Record<string, { sent: boolean; sentAt: string }>>({});
  const [locked,    setLocked]    = useState<Record<string, boolean>>({});
  const [toastMsg,  setToastMsg]  = useState<string | null>(null);

  const deadline    = TRIMESTER_DEADLINES[currentTerm];
  const daysLeft    = daysUntil(deadline.deadline);
  const isPastDeadline = daysLeft < 0;

  // Build per-teacher pending request count from allGradeRequests
  const pendingByTeacher = allGradeRequests.reduce<Record<string, number>>((acc, r) => {
    if (r.status === "pending") {
      // match by last name heuristic (e.g. "Mr. Dela Cruz" → "Dela Cruz")
      const key = r.teacher.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i, "");
      acc[key] = (acc[key] ?? 0) + 1;
    }
    return acc;
  }, {});

  function getPendingCount(teacherName: string): number {
    const lastName = teacherName.split(" ").slice(1).join(" ");
    return pendingByTeacher[lastName] ?? 0;
  }

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  }

  function sendReminder(teacherId: string, teacherName: string) {
    setReminders(prev => ({ ...prev, [teacherId]: { sent: true, sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) } }));
    showToast(`📧 Reminder sent to ${teacherName}`);
  }

  function sendAllReminders() {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const updates: Record<string, { sent: boolean; sentAt: string }> = {};
    teachers.forEach(t => { if (getPendingCount(t.name) > 0) updates[t.id] = { sent: true, sentAt: now }; });
    setReminders(prev => ({ ...prev, ...updates }));
    showToast(`📧 Reminders sent to all ${Object.keys(updates).length} teacher(s) with pending requests`);
  }

  function lockTeacher(teacherId: string, teacherName: string) {
    setLocked(prev => ({ ...prev, [teacherId]: true }));
    showToast(`🔒 ${teacherName}'s grade submission has been locked`);
  }

  function unlockTeacher(teacherId: string, teacherName: string) {
    setLocked(prev => ({ ...prev, [teacherId]: false }));
    showToast(`🔓 ${teacherName}'s grade submission has been unlocked`);
  }

  function lockAll() {
    const updates: Record<string, boolean> = {};
    teachers.forEach(t => { if (getPendingCount(t.name) > 0) updates[t.id] = true; });
    setLocked(prev => ({ ...prev, ...updates }));
    showToast(`🔒 ${Object.keys(updates).length} teacher(s) with pending requests have been locked`);
  }

  const filtered = teachers.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.section.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || t.employmentStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPending = teachers.reduce((sum, t) => sum + getPendingCount(t.name), 0);

  return (
    <div className="d-flex flex-column gap-4">

      {/* Toast */}
      {toastMsg && (
        <div className="position-fixed bottom-0 end-0 m-4 alert alert-dark shadow-lg rounded-3 d-flex align-items-center gap-2 py-2 px-3"
          style={{ zIndex: 9999, fontSize: 13, animation: "fadeInUp 0.3s ease", minWidth: 260 }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
        <div>
          <h2 className="fw-black fs-4 text-dark mb-0">Teachers</h2>
          <p className="text-muted small mb-0">{filtered.length} faculty member{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        {/* Term selector */}
        <div className="d-flex gap-2 align-items-center">
          <span className="text-muted small fw-semibold">Trimester:</span>
          {Object.keys(TRIMESTER_DEADLINES).map(t => (
            <button key={t} onClick={() => setCurrentTerm(t)}
              className={`btn btn-sm ${currentTerm === t ? "btn-primary" : "btn-outline-secondary"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Deadline alert banner */}
      <div className={`rounded-3 p-3 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 ${isPastDeadline ? "bg-danger-subtle border border-danger-subtle" : daysLeft <= 7 ? "bg-warning-subtle border border-warning-subtle" : "bg-info-subtle border border-info-subtle"}`}>
        <div className="d-flex align-items-center gap-2">
          <span style={{ fontSize: 20 }}>{isPastDeadline ? "🔒" : daysLeft <= 7 ? "⚠️" : "📅"}</span>
          <div>
            <div className="fw-bold small" style={{ color: isPastDeadline ? "#b91c1c" : daysLeft <= 7 ? "#92400e" : "#1e40af" }}>
              {isPastDeadline
                ? `${currentTerm} grade submission deadline has passed — ${Math.abs(daysLeft)} day(s) ago`
                : `${currentTerm} grade submission deadline: ${deadline.deadline.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })} · ${daysLeft} day(s) left`}
            </div>
            <div className="text-muted" style={{ fontSize: 11 }}>
              {totalPending > 0
                ? `${totalPending} pending student grade request(s) need teacher response`
                : "All pending grade requests have been resolved"}
            </div>
          </div>
        </div>
        {totalPending > 0 && (
          <div className="d-flex gap-2 flex-shrink-0">
            <button onClick={sendAllReminders} className="btn btn-sm btn-warning fw-semibold">
              📧 Remind All
            </button>
            {isPastDeadline && (
              <button onClick={lockAll} className="btn btn-sm btn-danger fw-semibold">
                🔒 Lock All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="d-flex flex-column flex-sm-row gap-3">
        <div className="input-group shadow-sm flex-grow-1">
          <span className="input-group-text bg-white">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID, or section..." className="form-control border-start-0" />
        </div>
        <div className="d-flex gap-2">
          {["All", "Full Time", "Part Time"].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)} className={`btn btn-sm ${filterStatus === f ? "btn-primary shadow-sm" : "btn-outline-secondary"}`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Teacher Cards */}
      <div className="d-flex flex-column gap-3">
        {filtered.length === 0
          ? <div className="text-center text-muted py-4 small">No teachers found.</div>
          : filtered.map((t) => {
            const pending       = getPendingCount(t.name);
            const isLocked      = locked[t.id] ?? false;
            const reminderInfo  = reminders[t.id];
            const autoLocked    = isPastDeadline && pending > 0 && !locked[t.id];

            return (
            <div key={t.id} className={`card border-0 shadow-sm rounded-3 overflow-hidden ${isLocked || autoLocked ? "border border-danger-subtle" : ""}`}
              style={{ opacity: isLocked ? 0.85 : 1 }}>

              {/* Locked banner */}
              {(isLocked || autoLocked) && (
                <div className="px-4 py-2 d-flex align-items-center gap-2"
                  style={{ background: "#fef2f2", borderBottom: "1px solid #fecaca" }}>
                  <span>🔒</span>
                  <span className="small text-danger fw-semibold">
                    {autoLocked
                      ? `Auto-locked: ${currentTerm} deadline passed with ${pending} pending request(s)`
                      : "Manually locked by admin — grade submission disabled"}
                  </span>
                  {isLocked && (
                    <button onClick={() => unlockTeacher(t.id, t.name)}
                      className="btn btn-sm btn-outline-danger ms-auto" style={{ fontSize: 11 }}>
                      🔓 Unlock
                    </button>
                  )}
                </div>
              )}

              {/* Teacher Header Row */}
              <div
                className="d-flex align-items-center gap-3 p-3 px-4"
                style={{ cursor: "pointer", background: expanded === t.id ? "#f8f9ff" : "white" }}
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
              >
                <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center text-success fw-bold flex-shrink-0" style={{ width: 40, height: 40, fontSize: 13 }}>
                  {initials(t.name)}
                </div>

                <div className="flex-grow-1">
                  <div className="fw-bold text-dark small">{t.name}</div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
                    <span className="text-muted" style={{ fontSize: 11 }}>{t.id}</span>
                    <span className="text-muted" style={{ fontSize: 11 }}>·</span>
                    <span className="badge bg-info-subtle text-info border border-info-subtle" style={{ fontSize: 11 }}>📚 {t.section}</span>
                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle" style={{ fontSize: 11 }}>Room {t.room}</span>
                    {pending > 0 && (
                      <span className="badge bg-danger text-white" style={{ fontSize: 11 }}>
                        ⏳ {pending} pending request{pending !== 1 ? "s" : ""}
                      </span>
                    )}
                    {pending === 0 && (
                      <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: 11 }}>✓ All resolved</span>
                    )}
                  </div>
                </div>

                <span className={`badge px-3 py-2 flex-shrink-0 ${t.employmentStatus === "Full Time" ? "bg-success-subtle text-success border border-success-subtle" : "bg-secondary-subtle text-secondary border border-secondary-subtle"}`}>
                  {t.employmentStatus === "Full Time" ? "● Full Time" : "◑ Part Time"}
                </span>
                <span className="text-muted ms-2" style={{ fontSize: 12, transition: "transform 0.2s", display: "inline-block", transform: expanded === t.id ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </div>

              {/* Expanded detail */}
              {expanded === t.id && (
                <div className="border-top px-4 py-3" style={{ background: "#f8f9ff" }}>

                  {/* Reminder & Lock actions */}
                  <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                    <p className="text-muted text-uppercase fw-semibold mb-0" style={{ fontSize: 11, letterSpacing: "0.08em" }}>Grade Submission — {currentTerm}</p>
                    <div className="d-flex gap-2 align-items-center">
                      {reminderInfo?.sent && (
                        <span className="text-muted" style={{ fontSize: 11 }}>
                          📧 Reminder sent at {reminderInfo.sentAt}
                        </span>
                      )}
                      {pending > 0 && !isLocked && !autoLocked && (
                        <button onClick={(e) => { e.stopPropagation(); sendReminder(t.id, t.name); }}
                          className="btn btn-sm btn-warning fw-semibold" style={{ fontSize: 12 }}>
                          {reminderInfo?.sent ? "📧 Resend Reminder" : "📧 Send Reminder"}
                        </button>
                      )}
                      {pending > 0 && !isLocked && !autoLocked && (
                        <button onClick={(e) => { e.stopPropagation(); lockTeacher(t.id, t.name); }}
                          className="btn btn-sm btn-danger fw-semibold" style={{ fontSize: 12 }}>
                          🔒 Lock
                        </button>
                      )}
                      {isLocked && (
                        <button onClick={(e) => { e.stopPropagation(); unlockTeacher(t.id, t.name); }}
                          className="btn btn-sm btn-outline-success fw-semibold" style={{ fontSize: 12 }}>
                          🔓 Unlock
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pending requests for this teacher */}
                  {pending > 0 && (
                    <div className="mb-3">
                      <div className="small fw-semibold text-danger mb-2">⏳ Pending student grade requests:</div>
                      <div className="d-flex flex-column gap-1">
                        {allGradeRequests
                          .filter(r => r.status === "pending" && r.teacher.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i, "") === t.name.split(" ").slice(1).join(" "))
                          .map(r => (
                            <div key={r.id} className="d-flex align-items-center gap-2 p-2 rounded-2 bg-white border" style={{ fontSize: 12 }}>
                              <span>👤</span>
                              <span className="fw-semibold text-dark">{r.student}</span>
                              <span className="text-muted">·</span>
                              <span className="text-muted">{r.subject}</span>
                              <span className="ms-auto text-muted" style={{ fontSize: 11 }}>{r.requestedAt}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}

                  {/* Subject Schedule */}
                  <p className="text-muted text-uppercase fw-semibold mb-2" style={{ fontSize: 11, letterSpacing: "0.08em" }}>Subject Schedule</p>
                  <div className="d-flex flex-column gap-2">
                    {t.subjects.map((s, idx) => (
                      <div key={idx} className="d-flex align-items-center gap-3 p-3 rounded-3 bg-white border">
                        <div className="rounded-3 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 36, height: 36, fontSize: 16 }}>📖</div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold text-dark small">{s.name}</div>
                          <div className="text-muted" style={{ fontSize: 11 }}>Section: {t.section}</div>
                        </div>
                        <div className="text-end flex-shrink-0">
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: 11 }}>🕐 In: {s.timeIn}</span>
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle" style={{ fontSize: 11 }}>🕐 Out: {s.timeOut}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            );
          })
        }
      </div>
    </div>
  );
}

/* ── Grade Requests Panel (Admin) ── */
function AdminRequestsPanel() {
  const [requests, setRequests] = useState<import("../../lib/gradeRequests").GradeRequest[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const { loadRequests } = require("../../lib/gradeRequests");
    setRequests(loadRequests());
  }, []);

  function reload() {
    const { loadRequests } = require("../../lib/gradeRequests");
    setRequests(loadRequests());
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  function verifyGrade(id: number) {
    const { updateRequest } = require("../../lib/gradeRequests");
    updateRequest(id, {
      status: "admin_verified",
      adminVerifiedAt: new Date().toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" }),
      adminVerifiedBy: "Admin",
      adminNote: "Grade verified and approved.",
    });
    reload();
    showToast("✅ Grade verified — teacher will now release it to the student");
  }

  function rejectGrade(id: number) {
    const { updateRequest } = require("../../lib/gradeRequests");
    updateRequest(id, {
      status: "rejected",
      rejectedBy: "Admin",
      rejectedAt: new Date().toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" }),
      rejectionReason: "Failed admin verification",
    });
    reload();
    showToast("✕ Grade rejected — teacher must recalculate");
  }

  const { statusLabel, statusBadgeClass } = require("../../lib/gradeRequests");

  const awaitingVerification = requests.filter(r => r.status === "submitted_to_admin");
  const verified             = requests.filter(r => r.status === "admin_verified");
  const released             = requests.filter(r => r.status === "released_to_student");
  const other                = requests.filter(r => !["submitted_to_admin","admin_verified","released_to_student"].includes(r.status));

  return (
    <div className="d-flex flex-column gap-4">
      {/* Toast */}
      {toast && (
        <div className="position-fixed bottom-0 end-0 m-4 alert alert-dark shadow-lg rounded-3 py-2 px-3 d-flex align-items-center gap-2"
          style={{ zIndex: 9999, fontSize: 13, minWidth: 280, animation: "fadeInUp 0.3s ease" }}>
          {toast}
        </div>
      )}

      <div className="d-flex align-items-start justify-content-between gap-3">
        <div><h2 className="fw-black fs-4 text-dark mb-0">Grade Requests</h2><p className="text-muted small mb-0">Verify teacher-submitted grades before release to students</p></div>
        <button onClick={reload} className="btn btn-outline-secondary btn-sm">🔄 Refresh</button>
      </div>

      {/* Stats */}
      <div className="row g-3">
        {[
          { label: "Awaiting Verification", value: awaitingVerification.length, cls: "bg-warning-subtle border-warning-subtle text-warning" },
          { label: "Verified",              value: verified.length,             cls: "bg-success-subtle border-success-subtle text-success"  },
          { label: "Released to Students",  value: released.length,             cls: "bg-primary-subtle border-primary-subtle text-primary"  },
          { label: "Other",                 value: other.length,                cls: "bg-secondary-subtle border-secondary-subtle text-secondary" },
        ].map(s => (
          <div key={s.label} className="col-6 col-lg-3">
            <div className={`card border rounded-3 ${s.cls}`}>
              <div className="card-body p-3 text-center">
                <div className="small mb-1">{s.label}</div>
                <div className="fw-black fs-3">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN ACTION: Grades awaiting admin verification */}
      {awaitingVerification.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">📤 Grades Awaiting Your Verification</h3>
          <div className="d-flex flex-column gap-3">
            {awaitingVerification.map(req => (
              <div key={req.id} className="card border-0 rounded-3" style={{ border: "1.5px solid #bfdbfe" }}>
                <div className="card-body p-4">
                  <div className="row g-3 align-items-start mb-3">
                    <div className="col-12 col-sm-6">
                      <div className="fw-bold text-dark mb-1">{req.student}</div>
                      <div className="text-muted small">{req.subject} · {req.term}</div>
                      <div className="text-muted small">Teacher: {req.teacher}</div>
                      <div className="text-muted small">Submitted: {req.submittedToAdminAt}</div>
                    </div>
                    <div className="col-12 col-sm-6">
                      <div className="rounded-3 p-3 bg-success-subtle border border-success-subtle text-center">
                        <div className="text-muted small mb-1">Submitted Grade</div>
                        <div className="fw-black fs-2 text-success">{req.letterGrade}</div>
                        <div className="fw-semibold text-success small">{req.score}%</div>
                        {req.remarks && <div className="text-muted mt-1 fst-italic" style={{ fontSize: 11 }}>&ldquo;{req.remarks}&rdquo;</div>}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button onClick={() => verifyGrade(req.id)} className="btn btn-success flex-grow-1">✅ Verify &amp; Approve</button>
                    <button onClick={() => rejectGrade(req.id)} className="btn btn-outline-danger">✕ Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified — waiting on teacher to release */}
      {verified.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">✅ Verified — Awaiting Teacher Release</h3>
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing: "0.05em" }}>Student</th>
                    <th className="small text-muted fw-semibold text-uppercase d-none d-sm-table-cell" style={{ letterSpacing: "0.05em" }}>Teacher</th>
                    <th className="small text-muted fw-semibold text-uppercase d-none d-lg-table-cell" style={{ letterSpacing: "0.05em" }}>Subject</th>
                    <th className="small text-muted fw-semibold text-uppercase text-end" style={{ letterSpacing: "0.05em" }}>Grade</th>
                    <th className="small text-muted fw-semibold text-uppercase text-end pe-4" style={{ letterSpacing: "0.05em" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {verified.map(req => (
                    <tr key={req.id}>
                      <td className="ps-4 small fw-medium text-dark">{req.student}</td>
                      <td className="d-none d-sm-table-cell small text-muted">{req.teacher}</td>
                      <td className="d-none d-lg-table-cell small text-muted">{req.subject}</td>
                      <td className="text-end small fw-bold text-success">{req.letterGrade} ({req.score}%)</td>
                      <td className="text-end pe-4"><span className={`badge ${statusBadgeClass(req.status)}`} style={{ fontSize: 10 }}>{statusLabel(req.status)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Full request log */}
      <div>
        <h3 className="fw-bold small text-dark mb-3">📋 All Requests Log</h3>
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing: "0.05em" }}>Student</th>
                  <th className="small text-muted fw-semibold text-uppercase d-none d-sm-table-cell" style={{ letterSpacing: "0.05em" }}>Teacher</th>
                  <th className="small text-muted fw-semibold text-uppercase d-none d-lg-table-cell" style={{ letterSpacing: "0.05em" }}>Subject</th>
                  <th className="small text-muted fw-semibold text-uppercase d-none d-lg-table-cell" style={{ letterSpacing: "0.05em" }}>Term</th>
                  <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td className="ps-4 small fw-medium text-dark">{req.student}</td>
                    <td className="d-none d-sm-table-cell small text-muted">{req.teacher}</td>
                    <td className="d-none d-lg-table-cell small text-muted">{req.subject}</td>
                    <td className="d-none d-lg-table-cell small text-muted">{req.term}</td>
                    <td><span className={`badge ${statusBadgeClass(req.status)}`} style={{ fontSize: 10 }}>{statusLabel(req.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {requests.length === 0 && (
        <div className="card border-0 shadow-sm rounded-3"><div className="card-body p-4 text-center text-muted small">No grade requests yet.</div></div>
      )}
    </div>
  );
}

/* ── Admin Document Management Panel ── */
function AdminDocumentsPanel() {
  const [docs, setDocs] = useState(allDocumentRequests);
  const [approving, setApproving] = useState<number | null>(null);
  const [releaseDate, setReleaseDate] = useState("");
  // Rejection modal state
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonOther, setRejectReasonOther] = useState("");

  const REJECT_REASONS = [
    "Incomplete requirements",
    "Document type not available",
    "Outstanding balance — fees not cleared",
    "Enrollment not yet confirmed",
    "Duplicate request already on file",
    "Student record under review",
    "Other (specify below)",
  ];

  function confirmApprove(id: number) {
    if (!releaseDate) return;
    const formatted = new Date(releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    setDocs(prev =>
      prev.map(d =>
        d.id === id
          ? { ...d, status: "approved", approvedAt: new Date().toLocaleDateString(), releaseDate: formatted }
          : d
      )
    );
    setApproving(null);
    setReleaseDate("");
  }

  function confirmReject() {
    if (!rejecting) return;
    const finalReason = rejectReason === "Other (specify below)"
      ? rejectReasonOther.trim() || "No reason provided"
      : rejectReason;
    if (!finalReason) return;
    setDocs(prev => prev.map(d =>
      d.id === rejecting
        ? { ...d, status: "rejected", rejectionReason: finalReason, rejectedAt: new Date().toLocaleDateString() }
        : d
    ));
    setRejecting(null);
    setRejectReason("");
    setRejectReasonOther("");
  }

  const pending  = docs.filter(d => d.status === "pending");
  const approved = docs.filter(d => d.status === "approved");
  const rejected = docs.filter(d => d.status === "rejected");

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h2 className="fw-black fs-4 text-dark mb-0">Document Management</h2>
        <p className="text-muted small mb-0">Manage all student document requests</p>
      </div>

      {/* Rejection reason modal */}
      {rejecting !== null && (() => {
        const doc = docs.find(d => d.id === rejecting);
        return (
          <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }} onClick={() => { setRejecting(null); setRejectReason(""); setRejectReasonOther(""); }}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
              <div className="modal-content rounded-3 border-0 shadow-lg">
                <div className="modal-header border-0 pb-0 px-4 pt-4">
                  <div>
                    <h5 className="fw-black text-dark mb-1">Reject Document Request</h5>
                    <p className="text-muted small mb-0">{doc?.student} — <strong>{doc?.type}</strong></p>
                  </div>
                </div>
                <div className="modal-body px-4 py-3">
                  <div className="fw-semibold small text-dark mb-2">Reason for rejection <span className="text-danger">*</span></div>
                  <div className="d-flex flex-column gap-2 mb-3">
                    {REJECT_REASONS.map(reason => (
                      <label key={reason} className="d-flex align-items-start gap-2 p-2 rounded-3"
                        style={{ cursor:"pointer", background: rejectReason===reason?"rgba(220,38,38,0.06)":"transparent", border: rejectReason===reason?"1px solid rgba(220,38,38,0.25)":"1px solid transparent", transition:"all 0.15s" }}>
                        <input type="radio" name="rejectReason" value={reason} checked={rejectReason===reason} onChange={() => setRejectReason(reason)} className="form-check-input flex-shrink-0 mt-0" />
                        <span className="small text-dark">{reason}</span>
                      </label>
                    ))}
                  </div>
                  {rejectReason === "Other (specify below)" && (
                    <div>
                      <label className="form-label fw-semibold text-uppercase mb-1" style={{ fontSize:11 }}>Please specify</label>
                      <textarea value={rejectReasonOther} onChange={e => setRejectReasonOther(e.target.value)}
                        className="form-control form-control-sm rounded-3" rows={3}
                        placeholder="Enter the specific reason for rejection..." />
                    </div>
                  )}
                </div>
                <div className="modal-footer border-0 px-4 pb-4 pt-0 d-flex gap-2">
                  <button onClick={confirmReject}
                    disabled={!rejectReason || (rejectReason==="Other (specify below)" && !rejectReasonOther.trim())}
                    className="btn btn-danger flex-grow-1 fw-bold">✕ Confirm Rejection</button>
                  <button onClick={() => { setRejecting(null); setRejectReason(""); setRejectReasonOther(""); }} className="btn btn-outline-secondary flex-grow-1">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Stats */}
      <div className="row g-3">
        {[
          { label: "Pending",  value: pending.length,  icon: "⏳", cls: "bg-warning-subtle border-warning-subtle text-warning" },
          { label: "Approved", value: approved.length, icon: "✓",  cls: "bg-success-subtle border-success-subtle text-success" },
          { label: "Rejected", value: rejected.length, icon: "✕",  cls: "bg-danger-subtle border-danger-subtle text-danger"   },
        ].map(s => (
          <div key={s.label} className="col-4">
            <div className={`card border rounded-3 ${s.cls}`}>
              <div className="card-body p-3 text-center">
                <div className="text-muted small mb-1">{s.label}</div>
                <div className="fw-black fs-3">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing:"0.05em" }}>Student</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-sm-table-cell" style={{ letterSpacing:"0.05em" }}>Type</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-lg-table-cell" style={{ letterSpacing:"0.05em" }}>Teacher</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-lg-table-cell" style={{ letterSpacing:"0.05em" }}>Track & Year</th>
                <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing:"0.05em" }}>Status</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-md-table-cell" style={{ letterSpacing:"0.05em" }}>Release Date</th>
                <th className="small text-muted fw-semibold text-uppercase text-end pe-4" style={{ letterSpacing:"0.05em" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => (
                <React.Fragment key={doc.id}>
                  <tr key={doc.id}>
                    <td className="ps-4 small fw-medium text-dark">{doc.student}</td>
                    <td className="d-none d-sm-table-cell text-muted small">{doc.type}</td>
                    <td className="d-none d-lg-table-cell text-muted small">{doc.teacher}</td>
                    <td className="d-none d-lg-table-cell">
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: 11 }}>
                        {doc.track} — Grade {doc.grade}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        doc.status === "pending"  ? "bg-warning-subtle text-warning border border-warning-subtle" :
                        doc.status === "approved" ? "bg-success-subtle text-success border border-success-subtle" :
                        "bg-danger-subtle text-danger border border-danger-subtle"
                      }`}>
                        {doc.status === "pending" ? "⏳ Pending" : doc.status === "approved" ? "✓ Approved" : "✕ Rejected"}
                      </span>
                      {doc.status === "rejected" && (doc as typeof doc & { rejectionReason?: string }).rejectionReason && (
                        <div className="text-danger mt-1" style={{ fontSize: 10 }}>
                          Reason: {(doc as typeof doc & { rejectionReason?: string }).rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="d-none d-md-table-cell text-muted small">
                      {doc.releaseDate
                        ? <span className="badge bg-info-subtle text-info border border-info-subtle">📅 {doc.releaseDate}</span>
                        : <span className="text-muted">—</span>
                      }
                    </td>
                    <td className="text-end pe-4">
                      {doc.status === "pending" && (
                        <div className="d-flex gap-1 justify-content-end">
                          <button onClick={() => { setApproving(doc.id); setReleaseDate(""); }} className="btn btn-success btn-sm" style={{ fontSize: 11 }}>✓ Approve</button>
                          <button onClick={() => { setRejecting(doc.id); setRejectReason(""); setRejectReasonOther(""); }} className="btn btn-danger btn-sm" style={{ fontSize: 11 }}>✕ Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* Inline date picker when approving */}
                  {approving === doc.id && (
                    <tr key={`approve-${doc.id}`}>
                      <td colSpan={7} className="ps-4 pe-4 pb-3">
                        <div className="rounded-3 p-3 d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                          <div className="flex-grow-1">
                            <div className="fw-semibold small text-dark mb-1">📅 Set Release Date for <span className="text-success">{doc.student}</span></div>
                            <div className="text-muted" style={{ fontSize: 11 }}>The student will be notified in their dashboard with this date.</div>
                          </div>
                          <div className="d-flex align-items-center gap-2 flex-shrink-0">
                            <input
                              type="date"
                              value={releaseDate}
                              onChange={e => setReleaseDate(e.target.value)}
                              min={new Date().toISOString().split("T")[0]}
                              className="form-control form-control-sm rounded-3"
                              style={{ width: 160 }}
                            />
                            <button
                              onClick={() => confirmApprove(doc.id)}
                              disabled={!releaseDate}
                              className="btn btn-success btn-sm fw-bold"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setApproving(null)}
                              className="btn btn-outline-secondary btn-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Announcements Panel ── */
function AnnouncementsPanel() {
  const [items, setItems] = useState(announcements);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:"", target:"All Students" });

  function addAnnouncement() {
    if (!form.title.trim()) return;
    setItems(prev => [{ id:Date.now(), title:form.title, date:"Today", target:form.target, status:"Active" }, ...prev]);
    setForm({ title:"", target:"All Students" }); setShowForm(false);
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
        <div><h2 className="fw-black fs-4 text-dark mb-0">Announcements</h2><p className="text-muted small mb-0">{items.filter(a=>a.status==="Active").length} active</p></div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm fw-bold shadow-sm">+ New Announcement</button>
      </div>
      {showForm && (
        <div className="card border-primary border-opacity-25 rounded-3 shadow-sm">
          <div className="card-body p-4 d-flex flex-column gap-3">
            <h3 className="fw-bold small text-dark mb-0">New Announcement</h3>
            <input value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="Announcement title..." className="form-control rounded-3" />
            <select value={form.target} onChange={e => setForm({...form,target:e.target.value})} className="form-select rounded-3">
              {["All Students","Active Students","Unpaid Students","4th Year","New Students"].map(t=><option key={t}>{t}</option>)}
            </select>
            <div className="d-flex gap-3">
              <button onClick={() => setShowForm(false)} className="btn btn-outline-secondary flex-grow-1 rounded-3">Cancel</button>
              <button onClick={addAnnouncement} className="btn btn-primary flex-grow-1 rounded-3 fw-bold shadow-sm">Post</button>
            </div>
          </div>
        </div>
      )}
      <div className="d-flex flex-column gap-2">
        {items.map(a => (
          <div key={a.id} className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4 d-flex align-items-start gap-3">
              <div className="rounded-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width:40, height:40, fontSize:20 }}>📢</div>
              <div className="flex-grow-1 overflow-hidden">
                <div className="fw-bold small text-dark">{a.title}</div>
                <div className="text-muted" style={{ fontSize:11 }}>Target: {a.target} · {a.date}</div>
              </div>
              <div className="d-flex align-items-center gap-2 flex-shrink-0">
                <span className={`badge ${a.status==="Active"?"bg-success-subtle text-success border border-success-subtle":"bg-secondary-subtle text-secondary border border-secondary-subtle"}`}>{a.status}</span>
                <button className="btn btn-link btn-sm p-0 text-muted" onClick={() => setItems(items.filter(i=>i.id!==a.id))}>✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Library Panel ── */
function LibraryPanel() {
  const libBooks = [
    { title:"Calculus: Early Transcendentals",   author:"James Stewart",       category:"Mathematics", copies:5, available:3 },
    { title:"Conceptual Physics",                author:"Paul G. Hewitt",      category:"Physics",     copies:4, available:1 },
    { title:"Complete Works of Shakespeare",     author:"W. Shakespeare",      category:"Literature",  copies:6, available:6 },
    { title:"Chemistry: The Central Science",    author:"Brown & LeMay",       category:"Chemistry",   copies:4, available:4 },
    { title:"Sapiens: A Brief History",          author:"Yuval Noah Harari",   category:"History",     copies:3, available:1 },
    { title:"Introduction to Algorithms",        author:"Cormen et al.",       category:"CS",          copies:5, available:5 },
  ];
  const [search, setSearch] = useState("");
  const filtered = libBooks.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()));
  const totalCopies = libBooks.reduce((a,b)=>a+b.copies,0);
  const totalAvail  = libBooks.reduce((a,b)=>a+b.available,0);

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
        <div><h2 className="fw-black fs-4 text-dark mb-0">Library Management</h2><p className="text-muted small mb-0">{libBooks.length} titles · {totalCopies} total copies</p></div>
        <button className="btn btn-primary btn-sm fw-bold shadow-sm">+ Add Book</button>
      </div>
      <div className="row g-3">
        {[
          { label:"Total Copies", value:totalCopies,           cls:"bg-primary-subtle border-primary-subtle text-primary" },
          { label:"Available",    value:totalAvail,            cls:"bg-success-subtle border-success-subtle text-success" },
          { label:"Borrowed",     value:totalCopies-totalAvail,cls:"bg-warning-subtle border-warning-subtle text-warning" },
        ].map(s => (
          <div key={s.label} className="col-4">
            <div className={`card border rounded-3 ${s.cls}`}>
              <div className="card-body p-3 text-center">
                <div className="text-muted small mb-1">{s.label}</div>
                <div className="fw-black fs-2">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="input-group shadow-sm">
        <span className="input-group-text bg-white">🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books..." className="form-control border-start-0 rounded-end-3" />
      </div>
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing:"0.05em" }}>Title</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-sm-table-cell" style={{ letterSpacing:"0.05em" }}>Author</th>
                <th className="small text-muted fw-semibold text-uppercase text-center" style={{ letterSpacing:"0.05em" }}>Copies</th>
                <th className="small text-muted fw-semibold text-uppercase text-center pe-4" style={{ letterSpacing:"0.05em" }}>Available</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b,i) => (
                <tr key={i}>
                  <td className="ps-4"><div className="small fw-medium text-dark">{b.title}</div><div className="text-muted" style={{ fontSize:11 }}>{b.category}</div></td>
                  <td className="d-none d-sm-table-cell text-muted small">{b.author}</td>
                  <td className="text-center small fw-semibold text-dark">{b.copies}</td>
                  <td className="text-center pe-4"><span className={`badge ${b.available>0?"bg-success-subtle text-success border border-success-subtle":"bg-danger-subtle text-danger border border-danger-subtle"}`}>{b.available}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Reports Panel ── */
function ReportsPanel() {
  const weekDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const logins   = [12,28,22,35,30,18,8];
  const maxL     = Math.max(...logins);
  return (
    <div className="d-flex flex-column gap-4">
      <div><h2 className="fw-black fs-4 text-dark mb-0">Reports</h2><p className="text-muted small mb-0">System analytics and summaries</p></div>
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4">
              <h3 className="fw-bold small text-dark mb-4">Daily Portal Logins (This Week)</h3>
              <div className="d-flex align-items-end gap-2" style={{ height:128 }}>
                {logins.map((h,i) => (
                  <div key={i} className="flex-grow-1 d-flex flex-column align-items-center gap-1">
                    <span className="text-muted" style={{ fontSize:10 }}>{h}</span>
                    <div className="w-100 rounded-top bg-primary" style={{ height:`${(h/maxL)*100}%` }} />
                  </div>
                ))}
              </div>
              <div className="d-flex justify-content-between mt-2">
                {weekDays.map(d => <span key={d} className="flex-grow-1 text-center text-muted" style={{ fontSize:10 }}>{d}</span>)}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4">
              <h3 className="fw-bold small text-dark mb-4">Students by Course</h3>
              <div className="d-flex flex-column gap-3">
                {[{course:"BSCS",count:2,cls:"bg-primary"},{course:"BSED",count:2,cls:"bg-danger"},{course:"BSBA",count:2,cls:"bg-warning"},{course:"BSN",count:2,cls:"bg-info"}].map(c => (
                  <div key={c.course} className="d-flex align-items-center gap-3">
                    <span className="text-muted small fw-semibold" style={{ width:40 }}>{c.course}</span>
                    <div className="flex-grow-1 progress" style={{ height:10 }}>
                      <div className={`progress-bar ${c.cls}`} style={{ width:`${(c.count/students.length)*100}%` }} />
                    </div>
                    <span className="text-muted small" style={{ width:16 }}>{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-3">
        {[
          { label:"Total Logins Today", value:"35",      icon:"🔐", cls:"bg-primary-subtle border-primary-subtle text-primary" },
          { label:"Files Uploaded",     value:"12",      icon:"📁", cls:"bg-info-subtle    border-info-subtle    text-info"    },
          { label:"Books Borrowed",     value:"7",       icon:"📚", cls:"bg-warning-subtle border-warning-subtle text-warning" },
          { label:"Payments Received",  value:"₱44,100", icon:"💰", cls:"bg-success-subtle border-success-subtle text-success" },
        ].map(s => (
          <div key={s.label} className="col-6 col-lg-3">
            <div className={`card border rounded-3 ${s.cls}`}>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">{s.label}</span>
                  <span style={{ fontSize:20 }}>{s.icon}</span>
                </div>
                <div className="fw-black fs-4">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Teacher Time Log Panel (Admin) ── */
function AdminTimeLogPanel() {
  const TIMELOG_KEY = "inform_teacher_timelog";
  const [logs, setLogs] = useState<{id:number;teacherId:string;teacherName:string;date:string;timeIn:string;timeOut:string|null;status:string}[]>([]);
  const [filterTeacher, setFilterTeacher] = useState("All");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TIMELOG_KEY);
      setLogs(raw ? JSON.parse(raw) : []);
    } catch { setLogs([]); }
  }, []);

  function reload() {
    try {
      const raw = localStorage.getItem(TIMELOG_KEY);
      setLogs(raw ? JSON.parse(raw) : []);
    } catch { setLogs([]); }
  }

  const teacherNames = ["All", ...Array.from(new Set(logs.map(l => l.teacherName)))];

  const filtered = logs.filter(l => {
    const matchTeacher = filterTeacher === "All" || l.teacherName === filterTeacher;
    const matchDate = !filterDate || l.date.includes(filterDate);
    return matchTeacher && matchDate;
  });

  const onCampus = logs.filter(l => l.status === "in");

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div><h2 className="fw-black fs-4 text-dark mb-0">Teacher Time Logs</h2><p className="text-muted small mb-0">Monitor teacher campus attendance in real time</p></div>
        <button onClick={reload} className="btn btn-outline-secondary btn-sm">🔄 Refresh</button>
      </div>

      {/* On-campus now */}
      <div className="card border-0 rounded-3" style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 8px 24px rgba(5,150,105,0.2)" }}>
        <div className="card-body p-4 text-white">
          <div className="fw-black fs-5 mb-1">🟢 Currently On Campus</div>
          {onCampus.length === 0
            ? <div className="text-white-50 small">No teachers are currently timed in.</div>
            : <div className="d-flex flex-wrap gap-2 mt-2">
                {onCampus.map(l => (
                  <span key={l.id} className="badge bg-white text-success fw-bold px-3 py-2 rounded-pill" style={{ fontSize: 12 }}>
                    👨‍🏫 {l.teacherName} — In: {l.timeIn}
                  </span>
                ))}
              </div>
          }
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3">
        {[
          { label: "Total Entries", value: logs.length, cls: "bg-primary-subtle border-primary-subtle text-primary" },
          { label: "On Campus Now", value: onCampus.length, cls: "bg-success-subtle border-success-subtle text-success" },
          { label: "Completed Today", value: logs.filter(l => l.status === "out" && l.date === new Date().toLocaleDateString("en-PH", { year:"numeric", month:"long", day:"numeric" })).length, cls: "bg-info-subtle border-info-subtle text-info" },
        ].map(s => (
          <div key={s.label} className="col-4">
            <div className={`card border rounded-3 ${s.cls}`}>
              <div className="card-body p-3 text-center">
                <div className="small mb-1">{s.label}</div>
                <div className="fw-black fs-3">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="d-flex gap-3 flex-wrap align-items-end">
        <div style={{ minWidth: 200 }}>
          <label className="form-label fw-semibold text-uppercase mb-1" style={{ fontSize: 11 }}>Filter by Teacher</label>
          <select value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)} className="form-select form-select-sm rounded-3">
            {teacherNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label fw-semibold text-uppercase mb-1" style={{ fontSize: 11 }}>Filter by Date</label>
          <input type="text" value={filterDate} onChange={e => setFilterDate(e.target.value)} placeholder="e.g., June 2026" className="form-control form-control-sm rounded-3" style={{ width: 160 }} />
        </div>
        {(filterTeacher !== "All" || filterDate) && (
          <button onClick={() => { setFilterTeacher("All"); setFilterDate(""); }} className="btn btn-outline-secondary btn-sm">Clear Filters</button>
        )}
      </div>

      {/* Log table */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing: "0.05em" }}>Teacher</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-sm-table-cell" style={{ letterSpacing: "0.05em" }}>Date</th>
                <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>Time In</th>
                <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing: "0.05em" }}>Time Out</th>
                <th className="small text-muted fw-semibold text-uppercase pe-4" style={{ letterSpacing: "0.05em" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={5} className="text-center py-4 small text-muted">No time log entries found.</td></tr>
                : [...filtered].reverse().map(l => (
                  <tr key={l.id}>
                    <td className="ps-4 small fw-medium text-dark">{l.teacherName}</td>
                    <td className="d-none d-sm-table-cell small text-muted">{l.date}</td>
                    <td className="small text-success fw-semibold">{l.timeIn}</td>
                    <td className="small text-danger fw-semibold">{l.timeOut ?? <span className="text-muted fst-italic">Still on campus</span>}</td>
                    <td className="pe-4">
                      <span className={`badge ${l.status === "in" ? "bg-success-subtle text-success border border-success-subtle" : "bg-secondary-subtle text-secondary border border-secondary-subtle"}`}>
                        {l.status === "in" ? "🟢 On Campus" : "✓ Completed"}
                      </span>
                    </td>
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

/* ── Page ── */
export default function AdminDashboardPage() {
  const [activeNav, setActiveNav]   = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifs, setNotifs] = useState(() => {
    // Load base notifications + any registrar inquiries from localStorage
    const base = [...adminNotifications];
    try {
      const inquiries = JSON.parse(localStorage.getItem("registrarInquiries") || "[]");
      inquiries.forEach((inq: { id: number; name: string; type: string; time: string; read: boolean }) => {
        base.unshift({
          id: inq.id,
          type: "inquiry",
          title: "Registrar Inquiry",
          message: `${inq.name} submitted a ${inq.type.replace("_", " ")} inquiry`,
          time: inq.time,
          read: inq.read,
          icon: "📩",
        });
      });
    } catch {}
    return base;
  });

  const unreadCount = notifs.filter(n => !n.read).length;

  function markAsRead(id: number) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function markAllAsRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }

  function deleteNotif(id: number) {
    setNotifs(prev => prev.filter(n => n.id !== id));
  }

  function renderPanel() {
    switch (activeNav) {
      case "students":      return <StudentsPanel />;
      case "teachers":      return <TeachersPanel />;
      case "grades":        return <GradesPanel />;
      case "requests":      return <AdminRequestsPanel />;
      case "documents":     return <AdminDocumentsPanel />;
      case "enrollment":    return <EnrollmentPanel />;
      case "tuition":       return <TuitionPanel />;
      case "announcements": return <AnnouncementsPanel />;
      case "library":       return <LibraryPanel />;
      case "reports":       return <ReportsPanel />;
      case "timelog":       return <AdminTimeLogPanel />;
      default:              return <Overview setActive={setActiveNav} />;
    }
  }

  return (
    <div className="d-flex" style={{ height:"100vh", overflow:"hidden", background:"#f0f4ff" }} suppressHydrationWarning>
      <Sidebar active={activeNav} setActive={setActiveNav} show={mobileOpen} setShow={setMobileOpen} onExpandChange={setSidebarExpanded} />

      {/* Desktop layout with sidebar margin */}
      <div className="d-lg-flex d-none flex-column flex-grow-1 overflow-hidden" style={{ marginLeft: "80px", transition: "margin-left 0.3s ease" }}>
        {/* Topbar */}
        <header className="bg-white border-bottom px-3 px-sm-4 py-3 d-flex align-items-center gap-3 flex-shrink-0 shadow-sm">
          <button className="btn btn-link text-muted p-1 d-lg-none" onClick={() => setMobileOpen(true)}>
            <div style={{ width:20, height:2, background:"currentColor", marginBottom:4 }} />
            <div style={{ width:20, height:2, background:"currentColor", marginBottom:4 }} />
            <div style={{ width:20, height:2, background:"currentColor" }} />
          </button>
          <div className="input-group flex-grow-1" style={{ maxWidth:400 }}>
            <span className="input-group-text bg-light border-end-0 text-muted">🔍</span>
            <input type="text" placeholder="Search students, records..." className="form-control bg-light border-start-0" />
          </div>
          <div className="d-flex align-items-center gap-3 ms-auto">
            <span className="badge bg-success-subtle text-success border border-success-subtle d-none d-sm-flex align-items-center gap-1">
              <span className="rounded-circle bg-success d-inline-block" style={{ width:7, height:7 }} />System Online
            </span>
            <button className="btn btn-link text-muted p-1 position-relative" onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
              <span style={{ fontSize:20 }}>🔔</span>
              {unreadCount > 0 && <span className="position-absolute top-0 end-0 rounded-circle bg-danger d-flex align-items-center justify-content-center text-white" style={{ width:16, height:16, fontSize:9, fontWeight:"bold" }}>{unreadCount}</span>}
            </button>
            <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width:32, height:32, fontSize:12, background:"linear-gradient(135deg,#6366f1,#7c3aed)", cursor:"pointer" }}>AD</div>
          </div>
        </header>

        <main className="flex-grow-1 overflow-auto p-3 p-sm-4">
          {renderPanel()}
        </main>
      </div>

      {/* Mobile layout without sidebar margin */}
      <div className="d-flex d-lg-none flex-column flex-grow-1 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-bottom px-3 px-sm-4 py-3 d-flex align-items-center gap-3 flex-shrink-0 shadow-sm">
          <button className="btn btn-link text-muted p-1" onClick={() => setMobileOpen(true)}>
            <div style={{ width:20, height:2, background:"currentColor", marginBottom:4 }} />
            <div style={{ width:20, height:2, background:"currentColor", marginBottom:4 }} />
            <div style={{ width:20, height:2, background:"currentColor" }} />
          </button>
          <div className="input-group flex-grow-1" style={{ maxWidth:400 }}>
            <span className="input-group-text bg-light border-end-0 text-muted">🔍</span>
            <input type="text" placeholder="Search students, records..." className="form-control bg-light border-start-0" />
          </div>
          <div className="d-flex align-items-center gap-3 ms-auto">
            <span className="badge bg-success-subtle text-success border border-success-subtle d-none d-sm-flex align-items-center gap-1">
              <span className="rounded-circle bg-success d-inline-block" style={{ width:7, height:7 }} />System Online
            </span>
            <button className="btn btn-link text-muted p-1 position-relative" onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
              <span style={{ fontSize:20 }}>🔔</span>
              {unreadCount > 0 && <span className="position-absolute top-0 end-0 rounded-circle bg-danger d-flex align-items-center justify-content-center text-white" style={{ width:16, height:16, fontSize:9, fontWeight:"bold" }}>{unreadCount}</span>}
            </button>
            <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width:32, height:32, fontSize:12, background:"linear-gradient(135deg,#6366f1,#7c3aed)", cursor:"pointer" }}>AD</div>
          </div>
        </header>

        <main className="flex-grow-1 overflow-auto p-3 p-sm-4">
          {renderPanel()}
        </main>
      </div>

      {/* Notification Dropdown - shared for both desktop and mobile */}
      {showNotifDropdown && (
        <>
          <div style={{ position:"fixed", top:60, right:20, width:360, maxHeight:480, background:"white", borderRadius:"0.75rem", border:"1px solid rgba(0,0,0,0.1)", boxShadow:"0 10px 40px rgba(0,0,0,0.15)", zIndex:9999, overflowY:"auto", animation:"slideInDown 0.2s ease-out" }}>
            <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
              <div><div className="fw-bold text-dark small">Notifications</div><div className="text-muted" style={{ fontSize:11 }}>{unreadCount} unread</div></div>
              <div className="d-flex align-items-center gap-2">
                {unreadCount > 0 && <button onClick={markAllAsRead} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize:11 }}>Mark all read</button>}
                <button onClick={() => setShowNotifDropdown(false)} className="btn btn-link btn-sm p-0 text-muted" style={{ fontSize:18 }}>✕</button>
              </div>
            </div>
            {notifs.length === 0 ? (
              <div className="px-4 py-5 text-center text-muted"><div style={{ fontSize:32, marginBottom:8 }}>🔔</div><small>No notifications</small></div>
            ) : (
              notifs.map(n => (
                <div key={n.id} className="px-4 py-3 border-bottom d-flex gap-3" style={{ background: n.read ? "white" : "rgba(99,102,241,0.04)", opacity: n.read ? 0.7 : 1 }}>
                  <div style={{ fontSize:20, minWidth:24 }}>{n.icon}</div>
                  <div className="flex-grow-1">
                    <div className="fw-bold small text-dark">{n.title}</div>
                    <div className="text-muted" style={{ fontSize:12, lineHeight:1.4 }}>{n.message}</div>
                    <div className="text-muted" style={{ fontSize:11, marginTop:4 }}>{n.time}</div>
                  </div>
                  <div className="d-flex gap-1 flex-shrink-0">
                    {!n.read && <button onClick={() => markAsRead(n.id)} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize:12 }} title="Mark as read">✓</button>}
                    <button onClick={() => deleteNotif(n.id)} className="btn btn-link btn-sm p-0 text-danger" style={{ fontSize:14 }} title="Delete">✕</button>
                  </div>
                </div>
              ))
            )}
            {notifs.length > 0 && (
              <div className="px-4 py-2 border-top text-center">
                <button onClick={() => setShowNotifDropdown(false)} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize:12 }}>Close</button>
              </div>
            )}
          </div>
          <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex:9998 }} onClick={() => setShowNotifDropdown(false)} />
        </>
      )}
    </div>
  );
}
