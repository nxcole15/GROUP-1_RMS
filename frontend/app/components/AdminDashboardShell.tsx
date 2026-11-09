"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { API_BASE, getAcademicConfig, type AcademicConfig } from "../lib/auth";
import { DocumentWorkflowPanel } from "../admin/documents-workflow-panel";
import { SettingsPanel } from "../principal-dashboard/SettingsPanel";
import { GuidePanel } from "./GuidePanel";

type StudentRecord = {
  id: string;
  name: string;
  track: string;
  grade: number;
  gwa: number;
  status: string;
  tuition: string;
  room: number;
  photo_url?: string | null;
};

type TeacherSubject = { name: string; timeIn: string; timeOut: string };
type TeacherRecord = {
  id: string;
  name: string;
  employmentStatus: string;
  section: string;
  subjects: TeacherSubject[];
  room: number;
};

type DashboardRecord = {
  id: number | string;
  name: string;
  track: string;
  grade: number;
  gwa: number;
  room: number;
  status: string;
  tuition: string;
  total: number;
  paid: number;
  balance: number;
  paymentId?: number;
};

type GradeRequestRecord = {
  id: number;
  student: string;
  teacher: string;
  subject: string;
  status: string;
  requestedAt: string;
};

type DocumentRequestRecord = {
  id: number;
  student: string;
  type: string;
  teacher: string;
  grade: number;
  track: string;
  status: string;
  releaseDate?: string | null;
  rejectionReason?: string;
};

type NotificationRecord = {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

/* Data loaded from the live backend when available; empty arrays avoid seeded demo records in the UI. */
const students: StudentRecord[] = [];
const teachers: TeacherRecord[] = [];
const recentActivity: Array<Record<string, string>> = [];
const allGradeRequests: GradeRequestRecord[] = [];
const allDocumentRequests: DocumentRequestRecord[] = [];
const adminNotifications: NotificationRecord[] = [];

type IconName =
  | "overview" | "students" | "teachers" | "grades" | "requests" | "documents"
  | "enrollment" | "tuition" | "timelog" | "scheduling" | "settings" | "manage-students"
  | "check" | "checkCircle" | "x" | "close" | "calendar" | "clock" | "bell"

  | "file" | "chart" | "send" | "refresh" | "alert" | "book" | "user" | "users"
  | "shield" | "activity" | "lock" | "unlock" | "arrowRight";

function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  const props = {
    width: size, height: size, fill: "none", viewBox: "0 0 24 24",
    stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const, className, "aria-hidden": true as const,
  };
  switch (name) {
    case "overview":      return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case "students":      return <svg {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
    case "manage-students": return <svg {...props}><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>;
    case "teachers":      return <svg {...props}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8h.01M12 8h5M7 12h10"/></svg>;
    case "grades":        return <svg {...props}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
    case "requests":      return <svg {...props}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 0118 2.18 2 2 0 0120 2h0"/><path d="M14.05 2a9 9 0 018 7.94"/><path d="M14.05 6A5 5 0 0120 11.94"/><polyline points="12 17 16 17 16 21"/></svg>;
    case "documents":     return <svg {...props}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
    case "enrollment":    return <svg {...props}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 12l2 2 4-4"/></svg>;
    case "tuition":       return <svg {...props}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
    case "scheduling":    return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "settings":      return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2"/></svg>;
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
    case "users":         return <svg {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
    case "shield":        return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case "activity":      return <svg {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case "lock":          return <svg {...props}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
    case "unlock":        return <svg {...props}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 019.9-1"/></svg>;
    case "arrowRight":    return <svg {...props}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    default:              return <svg {...props}><circle cx="12" cy="12" r="10"/></svg>;
  }
}

const NavIcon = ({ id }: { id: string }) => <Icon name={id as IconName} />;

const navItems = [
  { id:"overview",      label:"Overview"          },
  { id:"students",      label:"Students"          },
  { id:"teachers",      label:"Teachers"          },
  { id:"grades",        label:"Grades Management"            },
  { id:"requests",      label:"Grade Requests"    },
  { id:"documents",     label:"Documents"         },
  { id:"enrollment",    label:"Enrollment"        },
  { id:"profile",       label:"My Profile"        },
  { id:"settings",      label:"Settings"          },
];

function initials(name: string) { 
  if (!name) return "??";
  return name.split(" ").map(n => n[0]).join("").slice(0, 2); 
}

/*  Sidebar  */
function Sidebar({ active, setActive, show, setShow, onExpandChange, hideRequests, role, adminName }: { active:string; setActive:(s:string)=>void; show:boolean; setShow:(b:boolean)=>void; onExpandChange?: (expanded: boolean) => void; hideRequests?: boolean; role?: string; adminName?: string | null }) {
  const expanded = true; // Always expanded
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    onExpandChange?.(true);
  }, [onExpandChange]);

  const roleConfig = {
    principal: { title: "Principal Panel", subtitle: "Full Access", initials: "PR", email: "principal@cfei.edu" },
    registrar: { title: "Registrar Panel", subtitle: "Full Access", initials: "RG", email: "registrar@cfei.edu" },
    accounting: { title: "Accounting Panel", subtitle: "Full Access", initials: "AC", email: "accounting@cfei.edu" },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || { title: "Admin Panel", subtitle: "Full Access", initials: "AD", email: "admin@cfei.edu" };

  // Filter navigation items based on role
  let filteredNavItems = navItems;
  
  if (role === "registrar") {
    // Registrar: Remove students, teachers, tuition, grades, and grade requests
    filteredNavItems = navItems.filter(item => 
      !["students", "teachers", "tuition", "grades", "requests", "settings"].includes(item.id)
    );
    // Add manage-students link (will navigate to separate page)
    // Add scheduling item after enrollment
    const enrollmentIndex = filteredNavItems.findIndex(item => item.id === "enrollment");
    if (enrollmentIndex !== -1) {
      filteredNavItems = [
        ...filteredNavItems.slice(0, enrollmentIndex + 1),
        { id: "manage-students", label: "Manage Students" },
        { id: "scheduling", label: "Scheduling" },
        ...filteredNavItems.slice(enrollmentIndex + 1)
      ];
    }
  } else if (role === "principal") {
    // Principal: No filtering needed
    filteredNavItems = navItems;
  } else if (role === "accounting") {
    // Accounting: Only settings for principal
    filteredNavItems = navItems.filter(item => item.id !== "settings");
  } else if (role !== "principal") {
    // All other roles: No settings
    filteredNavItems = navItems.filter(item => item.id !== "settings");
  }

  return (
    <>
      {show && <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" style={{ zIndex:1040 }} onClick={() => setShow(false)} />}
      <div 
        className={`dashboard-sidebar d-flex flex-column flex-shrink-0 position-fixed top-0 start-0 h-100 ${show ? "" : "d-none d-lg-flex"}`}
        style={{ 
          width: 256,
          zIndex: 1000, 
          background: "#ffffff", 
          overflowY: "auto",
          overflowX: "hidden",
          boxShadow: "2px 0 10px rgba(0,0,0,0.05)",
          borderRight: "1px solid #f1f5f9"
        }}
      >
        {/* Logo */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-group" style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem" }}>
            <Image src="/cfei-logo.jpg" alt="CFEI" className="sidebar-brand-logo" width={80} height={80} />
            <div className="sidebar-brand-info" style={{ alignItems: "center", textAlign: "center", marginTop: 10 }}>
              <div className="sidebar-brand-title" style={{ color: "#1f2937" }}>{config.title}</div><div style={{ color:"#6b7280", fontSize:11 }}>{config.subtitle}</div></div>
          </div>
          <button className="btn-close sidebar-brand-close d-lg-none" onClick={() => setShow(false)} />
        </div>
        {/* Nav */}
        <nav className="flex-grow-1 px-3 py-2 d-flex flex-column gap-1 mt-2">
          {filteredNavItems.filter(item => !(hideRequests && item.id === "requests")).map(item => (
            <button key={item.id} onClick={() => { setActive(item.id); setShow(false); }}
              className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 border-0"
              style={{
                color: active === item.id ? "#78350f" : "#1f2937",
                background: active === item.id ? "#fbbf24" : "transparent",
                fontWeight: active === item.id ? 600 : 500,
                fontSize: 13.5,
                justifyContent: "flex-start",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { if (active !== item.id) (e.currentTarget as HTMLButtonElement).style.background = "#fef3c7"; }}
              onMouseLeave={e => { if (active !== item.id) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              title={item.label}>
              <NavIcon id={item.id} />
              <span>{item.label}</span>
            </button>
          ))}
          
          {/* Guide Dropdown */}
          <div className="mt-2">
            <button 
              onClick={() => setGuideOpen(!guideOpen)}
              className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 border-0 w-100 guide-dropdown-toggle"
              style={{ color:"#1f2937", background:"transparent", justifyContent:"space-between", whiteSpace:"nowrap", transition: "all 0.2s ease", fontSize: 13.5 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fef3c7"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
              <div className="d-flex align-items-center gap-3">
                <Icon name="book" size={18} />
                <span>Guide</span>
              </div>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ transform: guideOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
            
            {guideOpen && (
              <div className="guide-dropdown-menu mt-1">
                <button
                  onClick={() => { setActive("dashboard-guide"); setShow(false); }}
                  className="btn text-start w-100 border-0 guide-dropdown-item"
                  style={{ color:"#6b7280", background: active === "dashboard-guide" ? "#fef3c7" : "transparent" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fef3c7"; (e.currentTarget as HTMLButtonElement).style.paddingLeft = "1.25rem"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = active === "dashboard-guide" ? "#fef3c7" : "transparent"; (e.currentTarget as HTMLButtonElement).style.paddingLeft = "1rem"; }}>
                  {role === "principal" ? "Principal" : role === "registrar" ? "Registrar" : role === "accounting" ? "Accounting" : "Admin"} Dashboard Guide
                </button>
                <button
                  onClick={() => { setActive("user-guide"); setShow(false); }}
                  className="btn text-start w-100 border-0 guide-dropdown-item"
                  style={{ color:"#6b7280", background: active === "user-guide" ? "#fef3c7" : "transparent" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fef3c7"; (e.currentTarget as HTMLButtonElement).style.paddingLeft = "1.25rem"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = active === "user-guide" ? "#fef3c7" : "transparent"; (e.currentTarget as HTMLButtonElement).style.paddingLeft = "1rem"; }}>
                  {role === "principal" ? "Principal" : role === "registrar" ? "Registrar" : role === "accounting" ? "Accounting" : "Admin"} Guide
                </button>
              </div>
            )}
          </div>
        </nav>
        
        {/* Logout button - More visible at bottom */}
        <div className="px-3 pb-4 pt-2" style={{ borderTop:"1px solid #f3f4f6" }}>
          <div className="rounded-3 p-3" style={{ background:"#f9fafb", border:"1px solid #e5e7eb" }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                style={{ width:34, height:34, fontSize:12, background:"#fbbf24", color:"#78350f" }}>
                {config.initials}
              </div>
              <div className="flex-grow-1 overflow-hidden">
                <div className="fw-semibold text-truncate" style={{ fontSize:13, color:"#1f2937" }}>
                  {adminName || (role === "principal" ? "Principal" : role === "registrar" ? "Registrar" : role === "accounting" ? "Accounting" : "Admin") + " User"}
                </div>
                <div className="text-truncate" style={{ color:"#6b7280", fontSize:11 }}>{config.email}</div>
              </div>
            </div>
            <button
              onClick={() => { localStorage.removeItem("inform_token"); localStorage.removeItem("inform_role"); localStorage.removeItem("inform_user"); window.location.href = "/login"; }}
              className="btn w-100 fw-semibold"
              style={{ fontSize:12, borderRadius:8, background:"#dc2626", color:"#fff", border:"none" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background="#b91c1c"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background="#dc2626"; }}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/*  Overview  */
function Overview({ setActive, hideBanner, adminName, academicConfig }: { setActive: (s: string) => void; hideBanner?: boolean; adminName?: string | null; academicConfig?: AcademicConfig | null }) {
    // Calculate current school year
  const getCurrentSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 6 ? year : year - 1;
    const endYear = startYear + 1;
    return `${startYear}-${endYear}`;
  };

  const [pendingStats, setPendingStats] = useState<{
    enrollments: number; 
    payments: number; 
    documents: number; 
    total: number;
  } | null>(null);

  const [dashboardStats, setDashboardStats] = useState<{
    activeStudents: number;
    avgGwa: string;
  } | null>(null);

  const [enrollmentInsights, setEnrollmentInsights] = useState<Array<{
    track: string;
    grade_level: number;
    gender: string | null;
    count: number;
  }>>([]);

  const [recentActivity, setRecentActivity] = useState<Array<{
    type: string;
    action: string;
    name: string;
    time: string;
  }>>([]);

  const [adminInfo, setAdminInfo] = useState<{
    full_name: string;
    role: string;
  } | null>(null);


  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    fetch(`${API_BASE}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { 
        if (data?.pending) setPendingStats(data.pending);
        if (data?.stats) setDashboardStats(data.stats);
        if (data?.enrollmentInsights) setEnrollmentInsights(data.enrollmentInsights);
        if (data?.recentActivity) setRecentActivity(data.recentActivity);
        if (data?.adminInfo) setAdminInfo(data.adminInfo); 
      })
      .catch(() => {});
  }, []);

  const trackOptions = [
    { label: "All Tracks", value: "all" },
    { label: "Academic Track - STEM", value: "Academic Track - STEM" },
    { label: "Academic Track - HUMSS", value: "Academic Track - HUMSS" },
    { label: "Academic Track - ABM", value: "Academic Track - ABM" },
    { label: "TECH-PRO - ICT", value: "TECH-PRO - ICT" },
    { label: "TECH-PRO - Cookery", value: "TECH-PRO - Cookery" },
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


  return (
    <div className="d-flex flex-column gap-0">
      {/* ── Banner ──────────────────────────────────────────────────── */}
      {!hideBanner && (
        <div style={{
          background: "linear-gradient(135deg,#374151 0%,#1f2937 100%)",
          borderRadius: "16px 16px 0 0",
          padding: "32px 32px 80px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position:"absolute", top:-50, right:-50, width:230, height:230, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
          <div style={{ position:"absolute", bottom:-60, right:180, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.03)" }} />
          <div style={{ position:"absolute", top:30, right:90, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
          <div style={{ position:"relative", zIndex:1 }}>
            <h1 className="fw-bold text-white mb-1" style={{ fontSize:"1.8rem" }}>
              Welcome back, {adminName || adminInfo?.full_name || "..."}
            </h1>
            <p className="mb-3" style={{ color:"rgba(255,255,255,0.72)", fontSize:14 }}>
              {adminInfo?.role === "principal" ? "Principal" : adminInfo?.role ? "Administrator" : "..."} · Full Access · {academicConfig?.current_term || "Term 1"} · SY {academicConfig?.school_year || getCurrentSchoolYear()}
            </p>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge px-3 py-2 rounded-pill" style={{ background:"rgba(255,255,255,0.15)", color:"white", border:"1px solid rgba(255,255,255,0.25)", fontSize:"0.78rem" }}>
                 System Online
              </span>
              {pendingStats && pendingStats.total > 0 && (
                <span className="badge px-3 py-2 rounded-pill" style={{ background:"rgba(55,65,81,0.7)", color:"white", border:"1px solid rgba(75,85,99,0.5)", fontSize:"0.78rem" }}>
                   {pendingStats.total} Pending Action{pendingStats.total !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="container-fluid px-3 px-md-4" style={{ marginTop: !hideBanner ? "-52px" : 0, paddingBottom: 32 }}>

      {/* Stats */}
      {!hideBanner && (
        <div className="row g-3 mb-4">
          {[
            { label:"Active Students",     value: dashboardStats?.activeStudents ?? "—", gradient:"linear-gradient(135deg,#6b7280,#4b5563)", shadow:"rgba(75,85,99,0.2)", bgLight:"#f9fafb", textColor:"#374151",
              icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
            { label:"Class Avg. GWA",      value: dashboardStats?.avgGwa ?? "—",         gradient:"linear-gradient(135deg,#4b5563,#374151)", shadow:"rgba(55,65,81,0.2)", bgLight:"#f3f4f6", textColor:"#1f2937",
              icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
            { label:"Pending Enrollments", value: pendingStats?.enrollments ?? "—",       gradient:"linear-gradient(135deg,#9ca3af,#6b7280)", shadow:"rgba(107,114,128,0.2)", bgLight:"#f9fafb", textColor:"#4b5563",
              icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg> },
            { label:"Pending Payments",    value: pendingStats?.payments ?? "—",          gradient:"linear-gradient(135deg,#6b7280,#4b5563)", shadow:"rgba(75,85,99,0.2)",   bgLight:"#f3f4f6", textColor:"#374151",
              icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
          ].map(s => (
            <div key={s.label} className="col-6 col-lg-3">
              <div className="card border-0 shadow-lg rounded-4 h-100" style={{ overflow:"hidden" }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center justify-content-center rounded-3"
                      style={{ width:46, height:46, background:s.gradient, boxShadow:`0 4px 14px ${s.shadow}` }}>
                      {s.icon}
                    </div>
                    <div className="rounded-pill px-2 py-1" style={{ background:s.bgLight }}>
                      <div className="fw-bold" style={{ fontSize:"0.68rem", color:s.textColor }}>Live</div>
                    </div>
                  </div>
                  <div className="fw-black" style={{ fontSize:"1.65rem", color:s.textColor, lineHeight:1 }}>{s.value}</div>
                  <div className="text-muted mt-1" style={{ fontSize:"0.78rem" }}>{s.label}</div>
                </div>
                <div style={{ height:3, background:s.gradient }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent activity + enrollment insights */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="d-flex align-items-center justify-content-center rounded-3"
                  style={{ width:36, height:36, background:"#f3f4f6" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <h3 className="fw-bold mb-0" style={{ fontSize:"0.95rem", color:"#1e293b" }}>Recent Activity</h3>
              </div>
              <div className="d-flex flex-column gap-2">
                {recentActivity.length === 0 ? (
                  <div className="d-flex flex-column align-items-center justify-content-center py-4 text-center">
                    <div className="rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width:52, height:52, background:"#f1f5f9" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    </div>
                    <p className="text-muted small mb-0">No recent activity</p>
                  </div>
                ) : (
                  recentActivity.map((a, i) => (
                    <div key={i} className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ background:"#f8fafc" }}>
                      <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width:34, height:34, background:"#f3f4f6", color:"#374151" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="small fw-semibold text-dark text-truncate">{a.action}</div>
                        <div className="text-muted text-truncate" style={{ fontSize:11 }}>{a.name}</div>
                      </div>
                      <span className="text-muted flex-shrink-0" style={{ fontSize:11 }}>{a.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enrollment Insights */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="d-flex align-items-center justify-content-center rounded-3"
                    style={{ width:36, height:36, background:"linear-gradient(135deg,#059669,#10b981)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  </div>
                  <h3 className="fw-bold mb-0" style={{ fontSize:"0.95rem", color:"#1e293b" }}>Enrollment Insights</h3>
                </div>
                <button onClick={() => setActive("enrollment")} className="btn btn-link btn-sm p-0 text-primary d-inline-flex align-items-center gap-1" style={{ fontSize:12 }}>
                  Open <Icon name="arrowRight" size={12} />
                </button>
              </div>
              <div className="d-flex gap-2 mb-3 flex-wrap">
                <div style={{ flex:"1 1 110px" }}>
                  <select value={chartTrack} onChange={e => setChartTrack(e.target.value as typeof chartTrack)} className="form-select form-select-sm rounded-3" style={{ fontSize:12 }}>
                    {trackOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div style={{ flex:"1 1 90px" }}>
                  <select value={chartGrade} onChange={e => setChartGrade(e.target.value as typeof chartGrade)} className="form-select form-select-sm rounded-3" style={{ fontSize:12 }}>
                    {gradeOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
                <div style={{ flex:"1 1 90px" }}>
                  <select value={chartGender} onChange={e => setChartGender(e.target.value as typeof chartGender)} className="form-select form-select-sm rounded-3" style={{ fontSize:12 }}>
                    {genderOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
              </div>
              {(() => {
                const filteredData = enrollmentInsights.filter(item => {
                  const matchTrack  = chartTrack  === "all" ? true : item.track === chartTrack;
                  const matchGrade  = chartGrade  === "all" ? true : String(item.grade_level) === chartGrade;
                  const matchGender = chartGender === "all" ? true : (item.gender || "").toLowerCase() === chartGender.toLowerCase();
                  return matchTrack && matchGrade && matchGender;
                });
                const trackMapping = [
                  { fullName:"Academic Track - STEM",  shortName:"STEM"    },
                  { fullName:"Academic Track - HUMSS", shortName:"HUMSS"   },
                  { fullName:"Academic Track - ABM",   shortName:"ABM"     },
                  { fullName:"TECH-PRO - ICT",         shortName:"ICT"     },
                  { fullName:"TECH-PRO - Cookery",     shortName:"Cookery" },
                ];
                const countsByTrack = trackMapping.map(t => ({
                  track: t.shortName, fullTrack: t.fullName,
                  count: filteredData.filter(item => item.track === t.fullName).reduce((sum, item) => sum + item.count, 0),
                }));
                const maxCount = Math.max(1, ...countsByTrack.map(c => c.count));
                const barColors = ["#374151","#4b5563","#6b7280","#9ca3af","#d1d5db"];
                return (
                  <div>
                    <div style={{ display:"flex", gap:8, alignItems:"flex-end", height:150 }}>
                      {countsByTrack.map((c, i) => {
                        const h = c.count === 0 ? 3 : Math.max(10, Math.round((c.count / maxCount) * 110));
                        return (
                          <div key={c.track} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", gap:4 }}>
                            <span style={{ fontSize:11, fontWeight:700, color: c.count > 0 ? barColors[i] : "#cbd5e1" }}>{c.count}</span>
                            <div title={`${c.fullTrack}: ${c.count}`} style={{ width:"60%", minWidth:22, height:h, borderRadius:"4px 4px 2px 2px",
                              background: c.count === 0 ? "#f1f5f9" : barColors[i],
                              boxShadow: c.count > 0 ? `0 3px 12px ${barColors[i]}55` : "none" }} />
                            <span style={{ fontSize:10, fontWeight:600, color:"#94a3b8", textAlign:"center", lineHeight:1.2 }}>{c.track}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop:"1px solid #f1f5f9" }}>
                      <span className="text-muted" style={{ fontSize:11 }}>SY {getCurrentSchoolYear()}</span>
                      <div className="fw-bold text-end" style={{ fontSize:13, color:"#1e293b" }}>
                        {countsByTrack.reduce((a, c) => a + c.count, 0)}
                        <span className="text-muted fw-normal ms-1" style={{ fontSize:11 }}>Total Enrolled</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      </div>
    </div>
  );
}

/*  Students Panel  */
function StudentsPanel() {
  const [search, setSearch] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("All");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [apiStudents, setApiStudents] = useState<typeof students | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    studentId: string;
    studentName: string;
    action: "reactivate" | "deactivate";
  } | null>(null);
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const tracks = ["All", "Academic Track - STEM", "Academic Track - HUMSS", "Academic Track - ABM", "TECH-PRO - ICT", "TECH-PRO - Cookery"];
  const grades = ["All", "11", "12"];
  const statuses = ["All", "Active", "Inactive"];

  // Handle activate/deactivate student
  const handleToggleStatus = async (studentId: string, studentName: string, action: "reactivate" | "deactivate") => {
    // Show confirmation modal
    setConfirmAction({ studentId, studentName, action });
    setShowConfirmModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!confirmAction) return;
    
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    try {
      const endpoint = confirmAction.action === "deactivate" ? "deactivate" : "reactivate";
      const res = await fetch(`${API_BASE}/api/admin/students/${confirmAction.studentId}/${endpoint}`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include",
      });

      if (res.ok) {
        // Close confirmation modal
        setShowConfirmModal(false);
        
        // Show success modal
        const actionText = confirmAction.action === "deactivate" ? "deactivated" : "activated";
        setSuccessMessage(`${confirmAction.studentName} has been ${actionText} successfully!`);
        setShowSuccessModal(true);
        
        setConfirmAction(null);
        
        // Refresh the student list
        setSearch(search + " "); // Trigger re-fetch
        setTimeout(() => setSearch(search.trim()), 100);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update student status.");
        setShowConfirmModal(false);
      }
    } catch (err) {
      alert("Network error. Please try again.");
      setShowConfirmModal(false);
    }
  };

  // Debounced search against real API
  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    if (!token || token.startsWith("demo_")) {
      setApiStudents(null);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(() => {
      const url = search.trim().length >= 2
        ? `${API_BASE}/api/admin/students/search?q=${encodeURIComponent(search.trim())}`
        : `${API_BASE}/api/admin/students`;

      fetch(url, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.students) {
            setApiStudents(data.students.map((s: {
              id: number;
              student_id: string;
              full_name: string;
              pathway?: string;
              track?: string;
              strand?: string;
              grade_level?: number;
              status?: string;
              account_status?: "pending" | "active" | "suspended";
              tuition_status?: string;
              gwa?: number | null;
              room?: string | null;
              photo_url?: string | null;
            }) => ({
              id: s.student_id || String(s.id),
              name: s.full_name,
              track: s.track && s.strand ? `${s.track} - ${s.strand}` : (s.pathway || "N/A"),
              grade: s.grade_level || 11,
              gwa: s.gwa || 0,
              status: s.account_status || s.status || "active",
              tuition: s.tuition_status || "N/A",
              room: s.room ? parseInt(s.room) : 0,
              photo_url: s.photo_url || null,
            })));
          } else {
            setApiStudents([]);
          }
        })
        .catch(() => setApiStudents([]))
        .finally(() => setSearchLoading(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const sourceStudents = apiStudents ?? students;

  const filtered = sourceStudents.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    
    // Match both old format (just "STEM") and new format ("Academic Track - STEM")
    const matchTrack = selectedTrack === "All" || 
                      s.track === selectedTrack || 
                      selectedTrack.endsWith(s.track); // e.g., "Academic Track - STEM" ends with "STEM"
    
    const matchGrade = selectedGrade === "All" || s.grade === Number(selectedGrade);
    
    // Status filter: Active = active, Inactive = suspended, All = both
    const matchStatus = selectedStatus === "All" || 
                       (selectedStatus === "Active" && s.status === "active") ||
                       (selectedStatus === "Inactive" && s.status === "suspended");
    
    return matchSearch && matchTrack && matchGrade && matchStatus;
  });

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h2 className="fw-black fs-4 text-dark mb-0">
          Students Enrolled List 
          {selectedStatus !== "All" && (
            <span className="text-muted fw-normal" style={{ fontSize: 14 }}> ({selectedStatus})</span>
          )}
        </h2>
        <p className="text-muted small mb-0">{filtered.length} student{filtered.length !== 1 ? "s" : ""} found</p>
      </div>

      {/* Filters */}
      <div className="d-flex flex-column flex-sm-row gap-3">
        <div className="input-group shadow-sm flex-grow-1">
          <span className="input-group-text bg-white"></span>
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
          <div>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="form-select form-select-sm rounded-3" style={{ minWidth: 120 }}>
              {statuses.map(st => <option key={st} value={st}>{st === "All" ? "All Status" : st}</option>)}
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
                <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing:"0.05em" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={8} className="text-center text-muted py-4 small">No students found for the selected track/grade.</td></tr>
                : filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td className="ps-4 text-muted small">{i + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {s.photo_url ? (
                          <img 
                            src={s.photo_url} 
                            alt={s.name}
                            className="rounded-circle flex-shrink-0"
                            style={{ width: 32, height: 32, objectFit: "cover" }}
                          />
                        ) : (
                          <div 
                            className="rounded-circle bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center text-primary fw-bold flex-shrink-0 color" 
                            style={{ width: 32, height: 32, fontSize: 11}}
                          >
                            {initials(s.name)}
                          </div>
                        )}
                        <span className="small fw-medium text-dark">{s.name}</span>
                      </div>
                    </td>
                    <td className="d-none d-sm-table-cell font-mono text-muted small">{s.id}</td>
                    <td className="d-none d-lg-table-cell text-muted small">{s.track} Grade {s.grade}</td>
                    <td className="d-none d-lg-table-cell fw-bold text-primary small">
                      {s.gwa != null && s.gwa > 0 ? Number(s.gwa).toFixed(2) : <span className="text-muted">--</span>}
                    </td>
                    <td className="d-none d-lg-table-cell text-muted small">
                      {s.room > 0 ? (
                        <span className="badge bg-info-subtle text-info border border-info-subtle">Room {s.room}</span>
                      ) : (
                        <span className="text-muted">TBA</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${
                        s.status === "active" || s.status === "Active"
                          ? "bg-success-subtle text-success border border-success-subtle"
                          : s.status === "suspended"
                            ? "bg-danger-subtle text-danger border border-danger-subtle"
                            : "bg-secondary-subtle text-secondary border border-secondary-subtle"
                      }`}>
                        {s.status === "active" ? "Active" : s.status === "suspended" ? "Inactive" : s.status}
                      </span>
                    </td>
                    <td>
                      {s.status === "active" ? (
                        <button 
                          onClick={() => handleToggleStatus(s.id, s.name, "deactivate")}
                          className="btn btn-sm btn-outline-danger"
                          style={{ fontSize: 11 }}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleToggleStatus(s.id, s.name, "reactivate")}
                          className="btn btn-sm btn-outline-success"
                          style={{ fontSize: 11 }}
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowConfirmModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {confirmAction.action === "deactivate" ? "Deactivate Student?" : "Activate Student?"}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowConfirmModal(false)}
                ></button>
              </div>
              <div className="modal-body pt-2">
                <p className="mb-2">
                  {confirmAction.action === "deactivate" ? (
                    <>
                      Are you sure you want to deactivate <strong>{confirmAction.studentName}</strong>?
                      <br />
                      <span className="text-danger small">They will no longer be able to access the system.</span>
                    </>
                  ) : (
                    <>
                      Are you sure you want to activate <strong>{confirmAction.studentName}</strong>?
                      <br />
                      <span className="text-success small">They will be able to access the system again.</span>
                    </>
                  )}
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className={`btn ${confirmAction.action === "deactivate" ? "btn-danger" : "btn-success"}`}
                  onClick={confirmToggleStatus}
                >
                  {confirmAction.action === "deactivate" ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowSuccessModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg">
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
                  onClick={() => setShowSuccessModal(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/*  Manage Students Panel (Registrar) */
function ManageStudentsPanel() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [trackFilter, setTrackFilter] = useState("");
  const [strandFilter, setStrandFilter] = useState("");
  
  // Modals
  const [viewModal, setViewModal] = useState<any | null>(null);
  const [editModal, setEditModal] = useState<any | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch students
  useEffect(() => {
    fetchStudents();
  }, [search, gradeFilter, trackFilter, strandFilter]);

  async function fetchStudents() {
    try {
      setLoading(true);
      const token = localStorage.getItem("inform_token");
      if (!token) return;

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (gradeFilter) params.append("grade_level", gradeFilter);
      if (trackFilter) params.append("track", trackFilter);
      if (strandFilter) params.append("strand", strandFilter);

      const res = await fetch(`${API_BASE}/api/admin/students/manage?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch students");

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
      const formData = new FormData(e.target as HTMLFormElement);
      
      const updateData: any = {};
      formData.forEach((value, key) => {
        if (value) updateData[key] = value;
      });

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
    <div className="d-flex flex-column gap-4">
      <div>
        <h2 className="fw-black fs-4 text-dark mb-0">Manage Students</h2>
        <p className="text-muted small mb-0">View and edit information for officially enrolled students</p>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-3">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Student ID or name..."
                className="form-control"
              />
            </div>
            
            <div className="col-md-2">
              <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="form-select">
                <option value="">All Grades</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>
            
            <div className="col-md-3">
              <select value={trackFilter} onChange={(e) => setTrackFilter(e.target.value)} className="form-select">
                <option value="">All Tracks</option>
                <option value="Academic Track">Academic Track</option>
                <option value="TECH-PRO">TECH-PRO</option>
              </select>
            </div>
            
            <div className="col-md-3">
              <select value={strandFilter} onChange={(e) => setStrandFilter(e.target.value)} className="form-select">
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
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="text-center py-5 text-muted">Loading students...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing:"0.05em" }}>Student ID</th>
                  <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing:"0.05em" }}>Full Name</th>
                  <th className="small text-muted fw-semibold text-uppercase d-none d-lg-table-cell" style={{ letterSpacing:"0.05em" }}>Grade</th>
                  <th className="small text-muted fw-semibold text-uppercase d-none d-lg-table-cell" style={{ letterSpacing:"0.05em" }}>Track</th>
                  <th className="small text-muted fw-semibold text-uppercase d-none d-lg-table-cell" style={{ letterSpacing:"0.05em" }}>Strand</th>
                  <th className="small text-muted fw-semibold text-uppercase d-none d-md-table-cell" style={{ letterSpacing:"0.05em" }}>Contact</th>
                  <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing:"0.05em" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4 small">No students found</td></tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.student_id}>
                      <td className="ps-4 font-mono small">{student.student_id}</td>
                      <td className="fw-medium small">{student.full_name}</td>
                      <td className="d-none d-lg-table-cell small">Grade {student.grade_level}</td>
                      <td className="d-none d-lg-table-cell small">{student.track || "N/A"}</td>
                      <td className="d-none d-lg-table-cell small">{student.strand || "N/A"}</td>
                      <td className="d-none d-md-table-cell small">{student.phone || student.email}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button onClick={() => viewStudent(student.student_id)} className="btn btn-sm btn-outline-primary" style={{ fontSize:11 }}>View</button>
                          <button onClick={() => openEditModal(student.student_id)} className="btn btn-sm btn-outline-secondary" style={{ fontSize:11 }}>Edit</button>
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

      {/* View & Edit Modals would go here - simplified for now */}
      {/* View Modal */}
      {viewModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setViewModal(null)}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg">
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
                    <div className="col-md-4">
                      <label className="small text-muted">First Name</label>
                      <div className="fw-semibold">{viewModal.first_name || "N/A"}</div>
                    </div>
                    <div className="col-md-4">
                      <label className="small text-muted">Middle Name</label>
                      <div className="fw-semibold">{viewModal.middle_name || "N/A"}</div>
                    </div>
                    <div className="col-md-4">
                      <label className="small text-muted">Last Name</label>
                      <div className="fw-semibold">{viewModal.last_name || "N/A"}</div>
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
                      <label className="small text-muted">Nationality</label>
                      <div className="fw-semibold">{viewModal.nationality || "N/A"}</div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-4">
                  <h6 className="fw-bold mb-3" style={{ color: "#1f2937", borderBottom: "2px solid #fbbf24", paddingBottom: "0.5rem" }}>Contact Information</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="small text-muted">Phone</label>
                      <div className="fw-semibold">{viewModal.phone || "N/A"}</div>
                    </div>
                    <div className="col-md-6">
                      <label className="small text-muted">Email</label>
                      <div className="fw-semibold">{viewModal.email}</div>
                    </div>
                    <div className="col-12">
                      <label className="small text-muted">Address</label>
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
                      <label className="small text-muted">Mother's Name</label>
                      <div className="fw-semibold">{viewModal.mother_name || "N/A"}</div>
                    </div>
                    <div className="col-md-6">
                      <label className="small text-muted">Guardian Name</label>
                      <div className="fw-semibold">{viewModal.guardian_name || "N/A"}</div>
                    </div>
                    <div className="col-md-6">
                      <label className="small text-muted">Guardian Phone</label>
                      <div className="fw-semibold">{viewModal.guardian_phone || "N/A"}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setViewModal(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={() => setEditModal(null)}></div>
          <div className="modal fade show d-block" style={{ zIndex: 1055 }} onClick={(e) => { if (e.target === e.currentTarget) setEditModal(null); }}>
            <div className="modal-dialog modal-xl" onClick={(e) => e.stopPropagation()} style={{ marginTop: '2rem', marginBottom: '2rem' }}>
              <div className="modal-content">
                <form onSubmit={saveStudentChanges}>
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold">Edit Student Information</h5>
                    <button type="button" className="btn-close" onClick={() => setEditModal(null)}></button>
                  </div>
                  <div className="modal-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                    {/* Student ID Section */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3" style={{ color: "#1f2937", borderBottom: "2px solid #fbbf24", paddingBottom: "0.5rem" }}>Student ID</h6>
                      <div className="alert alert-warning small">
                        <strong>⚠️ Important:</strong> Changing the Student ID will update the student's login credentials.
                      </div>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small">Current Student ID</label>
                          <input type="text" className="form-control" value={editModal.student_id} disabled />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small">New Student ID <span className="text-danger">*</span></label>
                          <input type="text" name="new_student_id" className="form-control" defaultValue={editModal.student_id} required />
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3" style={{ color: "#1f2937", borderBottom: "2px solid #fbbf24", paddingBottom: "0.5rem" }}>Personal Information</h6>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label small">First Name <span className="text-danger">*</span></label>
                          <input type="text" name="first_name" className="form-control" defaultValue={editModal.first_name || ""} required />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small">Middle Name</label>
                          <input type="text" name="middle_name" className="form-control" defaultValue={editModal.middle_name || ""} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small">Last Name <span className="text-danger">*</span></label>
                          <input type="text" name="last_name" className="form-control" defaultValue={editModal.last_name || ""} required />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small">Date of Birth <span className="text-danger">*</span></label>
                          <input type="date" name="date_of_birth" className="form-control" defaultValue={editModal.date_of_birth || ""} required />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small">Gender <span className="text-danger">*</span></label>
                          <select name="gender" className="form-select" defaultValue={editModal.gender || ""} required>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small">Nationality <span className="text-danger">*</span></label>
                          <input type="text" name="nationality" className="form-control" defaultValue={editModal.nationality || ""} required />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3" style={{ color: "#1f2937", borderBottom: "2px solid #fbbf24", paddingBottom: "0.5rem" }}>Contact Information</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small">Phone <span className="text-danger">*</span></label>
                          <input type="tel" name="phone" className="form-control" defaultValue={editModal.phone || ""} required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small">Email <span className="text-danger">*</span></label>
                          <input type="email" name="email" className="form-control" defaultValue={editModal.email} required />
                        </div>
                        <div className="col-12">
                          <label className="form-label small">Address <span className="text-danger">*</span></label>
                          <textarea name="address" className="form-control" rows={2} defaultValue={editModal.address || ""} required></textarea>
                        </div>
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3" style={{ color: "#1f2937", borderBottom: "2px solid #fbbf24", paddingBottom: "0.5rem" }}>Academic Information</h6>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label small">Grade Level <span className="text-danger">*</span></label>
                          <select name="grade_level" className="form-select" defaultValue={editModal.grade_level} required>
                            <option value="11">Grade 11</option>
                            <option value="12">Grade 12</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small">Track <span className="text-danger">*</span></label>
                          <select name="track" className="form-select" defaultValue={editModal.track || ""} required>
                            <option value="">Select Track</option>
                            <option value="Academic Track">Academic Track</option>
                            <option value="TECH-PRO">TECH-PRO</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small">Strand <span className="text-danger">*</span></label>
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
                          <label className="form-label small">Learning Modality <span className="text-danger">*</span></label>
                          <select name="learning_modality" className="form-select" defaultValue={editModal.learning_modality || ""} required>
                            <option value="">Select Modality</option>
                            <option value="Face-to-Face">Face-to-Face</option>
                            <option value="Online">Online</option>
                            <option value="Blended">Blended</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small">LRN</label>
                          <input type="text" name="lrn" className="form-control" defaultValue={editModal.lrn || ""} maxLength={12} />
                        </div>
                      </div>
                    </div>

                    {/* Parent/Guardian Information */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3" style={{ color: "#1f2937", borderBottom: "2px solid #fbbf24", paddingBottom: "0.5rem" }}>Parent/Guardian Information</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small">Father's Name</label>
                          <input type="text" name="father_name" className="form-control" defaultValue={editModal.father_name || ""} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small">Mother's Name</label>
                          <input type="text" name="mother_name" className="form-control" defaultValue={editModal.mother_name || ""} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small">Guardian Name</label>
                          <input type="text" name="guardian_name" className="form-control" defaultValue={editModal.guardian_name || ""} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small">Guardian Phone</label>
                          <input type="tel" name="guardian_phone" className="form-control" defaultValue={editModal.guardian_phone || ""} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditModal(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {successMessage && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSuccessMessage(null)}>
          <div className="modal-dialog modal-dialog-centered modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-body text-center p-4">
                <div className="mb-3">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  </div>
                </div>
                <h5 className="fw-bold mb-2">Success!</h5>
                <p className="text-muted mb-3">{successMessage}</p>
                <button type="button" className="btn" style={{ background: "#374151", color: "#fff", border: "none" }} onClick={() => setSuccessMessage(null)}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/*  Grades Panel  */
function GradesPanel({ role }: { role?: string } = {}) {
  const [selected, setSelected] = useState("");
  
  // Grade submission config state
  const [submissionConfig, setSubmissionConfig] = useState<{
    term: string;
    is_open: boolean;
    actual_status: string;
    status_reason: string;
    start_date: string | null;
    end_date: string | null;
    manual_override: string;
    last_modified_by: string | null;
    last_modified_at: string | null;
    notes: string | null;
  }[]>([]);

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [processingTerm, setProcessingTerm] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Form state for each term
  const [termForms, setTermForms] = useState<Record<string, { startDate: string; startTime: string; endDate: string; endTime: string; notes: string }>>({
    "Term 1": { startDate: "", startTime: "", endDate: "", endTime: "", notes: "" },
    "Term 2": { startDate: "", startTime: "", endDate: "", endTime: "", notes: "" },
    "Term 3": { startDate: "", startTime: "", endDate: "", endTime: "", notes: "" },
  });

  // Selected term for scheduling
  const [selectedTerm, setSelectedTerm] = useState<"Term 1" | "Term 2" | "Term 3">("Term 1");
  
  const student = students.find(s => s.id === selected) ?? students[0] ?? null;
  const grades: Array<{ subject: string; grade: string; pct: number; units: number; teacher: string }> = [];

  // Get config for selected term
  const selectedConfig = submissionConfig.find(c => c.term === selectedTerm);
  const selectedForm = termForms[selectedTerm] || { startDate: "", startTime: "", endDate: "", endTime: "", notes: "" };

  // Load grade submission config
  function loadSubmissionConfig() {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    
    setLoadingConfig(true);
    fetch(`${API_BASE}/api/admin/grade-submission-config`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.config) {
          setSubmissionConfig(data.config);
          
          // Pre-fill form with existing schedule
          const newForms: any = {};
          data.config.forEach((c: any) => {
            if (c.start_date && c.end_date) {
              // Handle both ISO format and MySQL datetime format
              let startDate: Date;
              let endDate: Date;
              
              if (typeof c.start_date === 'string' && c.start_date.includes('T')) {
                // ISO format: "2026-11-03T17:28:00.000Z" or "2026-11-03T17:28:00"
                // Parse and convert to Philippine Time
                startDate = new Date(c.start_date);
                endDate = new Date(c.end_date);
              } else {
                // MySQL format: "2026-11-03 17:28:00"
                // Treat as Philippine Time
                const startStr = c.start_date.replace(' ', 'T') + '+08:00';
                const endStr = c.end_date.replace(' ', 'T') + '+08:00';
                startDate = new Date(startStr);
                endDate = new Date(endStr);
              }
              
              // Format for datetime-local inputs (YYYY-MM-DDTHH:MM)
              const formatForInput = (date: Date) => {
                // Get components in Philippine Time
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                
                return {
                  date: `${year}-${month}-${day}`,
                  time: `${hours}:${minutes}`
                };
              };
              
              const start = formatForInput(startDate);
              const end = formatForInput(endDate);
              
              newForms[c.term] = {
                startDate: start.date,
                startTime: start.time,
                endDate: end.date,
                endTime: end.time,
                notes: c.notes || ""
              };
            } else {
              newForms[c.term] = { startDate: "", startTime: "", endDate: "", endTime: "", notes: "" };
            }
          });
          setTermForms(newForms);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingConfig(false));
  }

  useEffect(() => {
    loadSubmissionConfig();
    // Removed auto-refresh - status updates when Principal takes action
  }, []);

  async function setSchedule(term: string) {
    const form = termForms[term];
    if (!form.startDate || !form.startTime || !form.endDate || !form.endTime) {
      setSuccessMessage("Please fill in all date and time fields");
      setShowSuccessModal(true);
      return;
    }

    const startDateTime = `${form.startDate}T${form.startTime}:00`;
    const endDateTime = `${form.endDate}T${form.endTime}:00`;

    console.log("Setting schedule:", { term, startDateTime, endDateTime, notes: form.notes });

    const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
    if (!token) {
      console.error("No token found");
      return;
    }

    setProcessingTerm(term);
    try {
      const response = await fetch(`${API_BASE}/api/admin/grade-submission-config/${term}/schedule`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          start_date: startDateTime,
          end_date: endDateTime,
          notes: form.notes || null
        }),
      });
      const data = await response.json();
      console.log("Response:", { status: response.status, data });
      
      if (!response.ok) throw new Error(data.error || "Failed to set schedule");

      loadSubmissionConfig();
      setSuccessMessage(`Schedule set for ${term}`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error setting schedule:", error);
      setSuccessMessage(error instanceof Error ? error.message : "Failed to set schedule");
      setShowSuccessModal(true);
    } finally {
      setProcessingTerm(null);
    }
  }

  async function openNow(term: string) {
    const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
    if (!token) return;

    setProcessingTerm(term);
    try {
      const response = await fetch(`${API_BASE}/api/admin/grade-submission-config/${term}/open`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notes: "Manually opened" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to open");

      loadSubmissionConfig();
      setSuccessMessage(`${term} opened successfully`);
      setShowSuccessModal(true);
    } catch (error) {
      setSuccessMessage(error instanceof Error ? error.message : "Failed to open");
      setShowSuccessModal(true);
    } finally {
      setProcessingTerm(null);
    }
  }

  async function closeNow(term: string) {
    const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
    if (!token) return;

    setProcessingTerm(term);
    try {
      const response = await fetch(`${API_BASE}/api/admin/grade-submission-config/${term}/close`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notes: "Manually closed" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to close");

      loadSubmissionConfig();
      setSuccessMessage(`${term} closed successfully`);
      setShowSuccessModal(true);
    } catch (error) {
      setSuccessMessage(error instanceof Error ? error.message : "Failed to close");
      setShowSuccessModal(true);
    } finally {
      setProcessingTerm(null);
    }
  }

  async function clearSchedule(term: string) {
    const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
    if (!token) return;

    setProcessingTerm(term);
    try {
      const response = await fetch(`${API_BASE}/api/admin/grade-submission-config/${term}/schedule`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to clear schedule");

      loadSubmissionConfig();
      setSuccessMessage(`Schedule cleared for ${term}`);
      setShowSuccessModal(true);
    } catch (error) {
      setSuccessMessage(error instanceof Error ? error.message : "Failed to clear schedule");
      setShowSuccessModal(true);
    } finally {
      setProcessingTerm(null);
    }
  }

  function formatDateTime(dateStr: string | null) {
    if (!dateStr) return "Not set";
    
    // The backend now returns ISO strings (e.g., "2026-11-03T17:17:00.000Z")
    // Or MySQL datetime strings (e.g., "2026-11-03 17:17:00")
    // Parse and display in local timezone
    
    let date: Date;
    
    if (dateStr.includes('T')) {
      // ISO format - already has timezone info
      date = new Date(dateStr);
    } else {
      // MySQL format "YYYY-MM-DD HH:MM:SS" - treat as Philippine Time
      const str = dateStr.replace(' ', 'T');
      // Append timezone offset for Philippine Time
      date = new Date(str + '+08:00');
    }
    
    return date.toLocaleString("en-PH", { 
      month: "short", 
      day: "numeric", 
      year: "numeric", 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Manila"
    });
  }

  if (!student) {
    return (
      <div className="d-flex flex-column gap-4">
        
        {/* Grade Submission Control - Principal Only */}
        {role === "principal" && (
        <div className="card border-0 rounded-4" style={{ 
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          overflow: "hidden"
        }}>
          {/* Card Header */}
          <div className="card-header border-0" style={{ 
            background: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
            padding: "1.5rem 2rem"
          }}>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center rounded-3" style={{ 
                width: 48, 
                height: 48, 
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)"
              }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h2 className="fw-bold mb-1 text-white" style={{ fontSize: "1.5rem", letterSpacing: "-0.01em" }}>
                  Grade Submission Control
                </h2>
                <p className="mb-0 text-white" style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                  Manage when teachers can submit student grades
                </p>
              </div>
            </div>
          </div>

          <div className="card-body p-4" style={{ background: "#fafbfc" }}>
            
            {loadingConfig ? (
              <div className="text-center py-5">
                <div className="spinner-border mb-3" role="status" style={{ width: 50, height: 50, color: "#374151" }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mb-0">Loading configuration...</p>
              </div>
            ) : (
              <>
                {/* Term Selector - Enhanced Design */}
                <div className="mb-4">
                  <label className="form-label fw-semibold mb-3 d-flex align-items-center gap-2" style={{ fontSize: "0.95rem", color: "#374151" }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    Select Term to Manage
                  </label>
                  <div className="d-flex gap-3">
                    {["Term 1", "Term 2", "Term 3"].map((term) => {
                      const isSelected = selectedTerm === term;
                      return (
                        <button
                          key={term}
                          onClick={() => setSelectedTerm(term as "Term 1" | "Term 2" | "Term 3")}
                          className="btn flex-fill py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                          style={{
                            background: isSelected ? "linear-gradient(135deg, #374151 0%, #1f2937 100%)" : "#ffffff",
                            color: isSelected ? "#ffffff" : "#6b7280",
                            border: isSelected ? "none" : "2px solid #e5e7eb",
                            borderRadius: "12px",
                            fontSize: "0.95rem",
                            boxShadow: isSelected ? "0 4px 16px rgba(55, 65, 81, 0.3)" : "none",
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = "#374151";
                              e.currentTarget.style.background = "#f3f4f6";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = "#e5e7eb";
                              e.currentTarget.style.background = "#ffffff";
                            }
                          }}
                        >
                          {isSelected && (
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          )}
                          {term}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedConfig && (
                  <div className="card border-0 rounded-4 shadow-sm" style={{ background: "#ffffff" }}>
                    <div className="card-body p-4">
                      {/* Status Header with Enhanced Design */}
                      <div className="d-flex align-items-start justify-content-between mb-4 pb-4 border-bottom">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-3 mb-2">
                            <h4 className="fw-bold mb-0" style={{ fontSize: "1.25rem", color: "#1f2937" }}>
                              {selectedTerm}
                            </h4>
                            <span className={`badge px-3 py-2 d-inline-flex align-items-center gap-2`} style={{ 
                              fontSize: "0.85rem",
                              background: selectedConfig.is_open ? "linear-gradient(135deg, #059669 0%, #10b981 100%)" : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                              color: "#ffffff",
                              borderRadius: "8px",
                              boxShadow: selectedConfig.is_open ? "0 2px 8px rgba(5, 150, 105, 0.3)" : "0 2px 8px rgba(107, 114, 128, 0.3)"
                            }}>
                              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                {selectedConfig.is_open ? (
                                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                ) : (
                                  <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                )}
                              </svg>
                              {selectedConfig.is_open ? "OPEN" : "CLOSED"}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: "0.9rem" }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            {selectedConfig.status_reason}
                          </div>
                        </div>
                      </div>

                      {/* Schedule Form - Enhanced Layout */}
                      <div className="mb-4">
                        <h5 className="fw-semibold mb-3 d-flex align-items-center gap-2" style={{ fontSize: "1rem", color: "#374151" }}>
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          Schedule Configuration
                        </h5>
                        <div className="row g-3">
                          <div className="col-12 col-lg-6">
                            <label className="form-label fw-semibold mb-2 d-flex align-items-center gap-2" style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                              Start Date & Time
                            </label>
                            <div className="row g-2">
                              <div className="col-7">
                                <input 
                                  type="date" 
                                  className="form-control py-2"
                                  value={selectedForm.startDate}
                                  onChange={(e) => setTermForms({
                                    ...termForms,
                                    [selectedTerm]: { ...selectedForm, startDate: e.target.value }
                                  })}
                                  style={{
                                    fontSize: "0.9rem",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px"
                                  }}
                                />
                              </div>
                              <div className="col-5">
                                <input 
                                  type="time" 
                                  className="form-control py-2"
                                  value={selectedForm.startTime}
                                  onChange={(e) => setTermForms({
                                    ...termForms,
                                    [selectedTerm]: { ...selectedForm, startTime: e.target.value }
                                  })}
                                  style={{
                                    fontSize: "0.9rem",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px"
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-12 col-lg-6">
                            <label className="form-label fw-semibold mb-2 d-flex align-items-center gap-2" style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                              End Date & Time
                            </label>
                            <div className="row g-2">
                              <div className="col-7">
                                <input 
                                  type="date" 
                                  className="form-control py-2"
                                  value={selectedForm.endDate}
                                  onChange={(e) => setTermForms({
                                    ...termForms,
                                    [selectedTerm]: { ...selectedForm, endDate: e.target.value }
                                  })}
                                  style={{
                                    fontSize: "0.9rem",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px"
                                  }}
                                />
                              </div>
                              <div className="col-5">
                                <input 
                                  type="time" 
                                  className="form-control py-2"
                                  value={selectedForm.endTime}
                                  onChange={(e) => setTermForms({
                                    ...termForms,
                                    [selectedTerm]: { ...selectedForm, endTime: e.target.value }
                                  })}
                                  style={{
                                    fontSize: "0.9rem",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px"
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-12">
                            <label className="form-label fw-semibold mb-2 d-flex align-items-center gap-2" style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                              </svg>
                              Notes (Optional)
                            </label>
                            <input 
                              type="text" 
                              className="form-control py-2"
                              placeholder="e.g., Extended deadline for additional submissions"
                              value={selectedForm.notes}
                              onChange={(e) => setTermForms({
                                ...termForms,
                                [selectedTerm]: { ...selectedForm, notes: e.target.value }
                              })}
                              style={{
                                fontSize: "0.9rem",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px"
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Current Schedule Info - Only show if scheduled and not passed */}
                      {selectedConfig.start_date && selectedConfig.end_date && 
                       selectedConfig.manual_override === 'none' && 
                       selectedConfig.status_reason !== 'Deadline passed' && (
                        <div className="alert border-0 rounded-3 mb-4" style={{ 
                          background: "#eff6ff",
                          color: "#1e40af",
                          fontSize: "0.875rem"
                        }}>
                          <div className="d-flex gap-3">
                            <svg width="20" height="20" className="flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <div>
                              <div className="fw-semibold mb-1">Current Schedule</div>
                              <div className="mb-1">
                                <strong>Opens:</strong> {formatDateTime(selectedConfig.start_date)}
                              </div>
                              <div>
                                <strong>Closes:</strong> {formatDateTime(selectedConfig.end_date)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Schedule Done Message */}
                      {selectedConfig.status_reason === 'Deadline passed' && (
                        <div className="alert border-0 rounded-3 mb-4" style={{ 
                          background: "#f3f4f6",
                          color: "#6b7280",
                          fontSize: "0.875rem"
                        }}>
                          <div className="d-flex gap-3">
                            <svg width="20" height="20" className="flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <div>
                              <div className="fw-semibold mb-1">Schedule Complete</div>
                              <div>Submission period has ended and is now closed.</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons - Enhanced Design */}
                      <div className="d-flex gap-2 flex-wrap pt-3 border-top">
                        <button 
                          onClick={() => setSchedule(selectedTerm)}
                          className="btn px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                          disabled={processingTerm === selectedTerm}
                          style={{
                            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "0.9rem",
                            boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)"
                          }}
                        >
                          {processingTerm === selectedTerm ? (
                            <>
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                              Set Schedule
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => openNow(selectedTerm)}
                          className="btn px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                          disabled={processingTerm === selectedTerm || selectedConfig.is_open}
                          style={{
                            background: selectedConfig.is_open ? "#e5e7eb" : "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                            color: selectedConfig.is_open ? "#9ca3af" : "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "0.9rem",
                            boxShadow: selectedConfig.is_open ? "none" : "0 2px 8px rgba(5, 150, 105, 0.3)"
                          }}
                        >
                          {processingTerm === selectedTerm ? (
                            <>
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                              </svg>
                              Open Now
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => closeNow(selectedTerm)}
                          className="btn px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                          disabled={processingTerm === selectedTerm || !selectedConfig.is_open}
                          style={{
                            background: !selectedConfig.is_open ? "#e5e7eb" : "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
                            color: !selectedConfig.is_open ? "#9ca3af" : "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "0.9rem",
                            boxShadow: !selectedConfig.is_open ? "none" : "0 2px 8px rgba(220, 38, 38, 0.3)"
                          }}
                        >
                          {processingTerm === selectedTerm ? (
                            <>
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                              </svg>
                              Close Now
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => clearSchedule(selectedTerm)}
                          className="btn px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                          disabled={processingTerm === selectedTerm}
                          style={{
                            background: "#ffffff",
                            color: "#6b7280",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            fontSize: "0.9rem"
                          }}
                        >
                          {processingTerm === selectedTerm ? (
                            <>
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                              Clear
                            </>
                          )}
                        </button>
                      </div>

                      {/* Last Modified */}
                      {selectedConfig.last_modified_by && selectedConfig.last_modified_at && (
                        <div className="mt-4 pt-3 border-top">
                          <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: "0.8rem" }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            Last modified by <strong>{selectedConfig.last_modified_by}</strong> on {formatDateTime(selectedConfig.last_modified_at)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        )}
        
        {/* Submitted Grade Batches - Simple inline version */}
        {role === "principal" && <SubmittedGradesList />}

        {/* Grade Edit Requests - Principal Only */}
        {role === "principal" && <GradeEditRequestsList />}

      </div>
    );
  }

  const avg = grades.length ? Math.round(grades.reduce((a, g) => a + g.pct, 0) / grades.length) : 0;

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
        <div><h2 className="fw-black fs-4 text-dark mb-0">Grades Management</h2><p className="text-muted small mb-0">View and manage student grades</p></div>
        <button className="btn btn-sm fw-bold shadow-sm" style={{ background: "#374151", color: "#fff", border: "none" }}>+ Submit Grades</button>
      </div>
      <div className="d-flex flex-column flex-sm-row gap-3">
        <div style={{ width: 220 }}>
          <label className="form-label text-muted fw-semibold text-uppercase mb-1" style={{ fontSize:11 }}>Select Student</label>
          <select value={selected || student.id} onChange={e => setSelected(e.target.value)} className="form-select form-select-sm rounded-3">
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex-grow-1 rounded-3 p-3 d-flex align-items-center gap-3 bg-primary bg-opacity-10 border border-primary border-opacity-25">
          <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0" style={{ width:44, height:44, fontSize:16 }}>{initials(student.name)}</div>
          <div className="flex-grow-1"><div className="fw-bold text-dark">{student.name}</div><div className="text-muted small">{student.id} • {student.track} Grade {student.grade}</div></div>
          <div className="text-end"><div className="fw-black fs-3 text-primary">{avg}%</div><div className="text-muted small">General Average</div></div>
        </div>
      </div>
      {grades.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-4 text-center text-muted small">No grade records yet for this student.</div>
        </div>
      ) : (
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
      )}
    </div>
  );
}

/*  Enrollment Panel  */
function EnrollmentPanel({ role }: { role?: string }) {
  // Calculate current school year dynamically
  const getCurrentSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 6 ? year : year - 1;
    const endYear = startYear + 1;
    return `${startYear}-${endYear}`;
  };

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterTrack, setFilterTrack] = useState("All");
  const [filterGrade, setFilterGrade] = useState("All");
  const [filterSchoolYear, setFilterSchoolYear] = useState(getCurrentSchoolYear());

  const [enrollments, setEnrollments] = useState<{
    name: string; id: string; track: string; grade: number;
    date: string; enrollDate: Date; status: string; photo: string | null;
    appId?: number; generatedStudentId?: string | null; schoolYear?: string;
  }[]>([]);

  const [rejectionDropdownStudentId, setRejectionDropdownStudentId] = useState<string | null>(null);
  const [rejectionChecklist, setRejectionChecklist] = useState<Record<string, boolean>>({});
  const [rejectionReason, setRejectionReason] = useState<string>("");

  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewChecklist, setReviewChecklist] = useState<Record<string, boolean>>({});

  // Student ID confirmation modal state
  const [studentIdModalOpen, setStudentIdModalOpen] = useState(false);
  const [selectedAppForId, setSelectedAppForId] = useState<any | null>(null);
  const [studentIdInput, setStudentIdInput] = useState("");
  const [studentIdError, setStudentIdError] = useState("");
  const [confirmingStudentId, setConfirmingStudentId] = useState(false);

  const admissionRequirements = [
    { id: "form9", label: "School Form 9/Report Card" },
    { id: "birthcert", label: "Birth Certificate" },
    { id: "gmoral", label: "Certificate of Good Moral Character" },
    { id: "idpic", label: "2x2 Colored ID Pictures" },
    { id: "esc", label: "ESC Certificate" },
    { id: "completion", label: "Certificate of Completion/Diploma" },
    { id: "form10", label: "School Form 10" },
  ];

  const openRejectionDropdown = (studentId: string) => {
    setRejectionDropdownStudentId(rejectionDropdownStudentId === studentId ? null : studentId);
    // Initialize empty checklist for this rejection (none are checked initially)
    setRejectionChecklist({});
    // Pre-fill reason with all requirements (none are checked)
    const allReqs = admissionRequirements.map(req => req.label);
    setRejectionReason(allReqs.join(", "));
  };

  const toggleRejectionRequirement = (requirementId: string) => {
    setRejectionChecklist(prev => ({
      ...prev,
      [requirementId]: !prev[requirementId],
    }));
    // Update reason to reflect unchecked items
    const updatedChecklist = { ...rejectionChecklist, [requirementId]: !rejectionChecklist[requirementId] };
    const uncheckedReqs = admissionRequirements
      .filter(req => !updatedChecklist[req.id])
      .map(req => req.label);
    setRejectionReason(uncheckedReqs.join(", "));
  };

  const confirmRejection = async (studentId: string, appId?: number) => {
    const token = localStorage.getItem("inform_token");
    if (!token || !appId) return;
    
    try {
      await fetch(`${API_BASE}/api/applications/${appId}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      });
      
      setEnrollments(prev => prev.map(e => e.id === studentId ? { ...e, status: "Rejected" } : e));
      setRejectionDropdownStudentId(null);
      setRejectionChecklist({});
      setRejectionReason("");
    } catch (err) {
      console.error("Rejection error:", err);
    }
  };

  useEffect(() => {
  const token = localStorage.getItem("inform_token");
  if (!token) {
    console.warn("No token found");
    setEnrollments([]);
    return;
  }
  
  console.log("Fetching applications...");
  
  // Fetch from applications API (where students actually submit)
  fetch(`${API_BASE}/api/applications`, {
    headers: { 
      Authorization: `Bearer ${token}`
    },
    credentials: "include",
  })
    .then(r => {
      console.log("Applications response status:", r.status);
      if (!r.ok) {
        console.error("Applications fetch error:", r.status, r.statusText);
        throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      }
      return r.json();
    })
    .then(data => {
      console.log("Applications data:", data);
      if (!data) {
        console.warn("No applications data received");
        setEnrollments([]);
        return;
      }
      if (data?.applications && Array.isArray(data.applications)) {
        console.log(`Found ${data.applications.length} applications`);
        // Map applications to enrollment format
        setEnrollments(data.applications.map((app: {
          id: number; 
          first_name?: string;
          middle_name?: string;
          last_name?: string;
          extension_name?: string;
          student_name?: string; 
          email: string;
          pathway?: string; 
          grade_level?: number; 
          school_year?: string;
          status: string; 
          created_at: string;
          generated_student_id?: string | null;
          photo_url?: string | null;
        }) => {
          // Build full name from parts
          const fullName = [
            app.first_name,
            app.middle_name,
            app.last_name,
            app.extension_name
          ].filter(Boolean).join(" ") || app.student_name || app.email || "Unknown";

          return {
            name: fullName,
            id: app.email,
            track: app.pathway || "N/A",
            grade: app.grade_level || 0,
            date: new Date(app.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }),
            enrollDate: new Date(app.created_at),
            status:
              app.status === "approved"
                ? "Confirmed"
                : app.status === "principal_review"
                  ? "Principal Review"
                  : app.status === "rejected"
                    ? "Rejected"
                  : app.status === "submitted" || app.status === "registrar_review"
                    ? "Pending"
                    : "Other",
            photo: app.photo_url || null,
            appId: app.id,
            generatedStudentId: app.generated_student_id,
            schoolYear: app.school_year || getCurrentSchoolYear(),
          };
        }));
      } else {
        console.warn("No applications data received");
        setEnrollments([]);
      }
    })
    .catch(err => {
      console.error("Applications fetch error:", err);
      setEnrollments([]);
    });
}, []);

  async function openReviewModal(app: any) {
    const token = localStorage.getItem("inform_token");

    if (!token || !app?.appId) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/applications/${app.appId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch application details");
      }

      const data = await response.json();
      const parsedReview = (() => {
        try {
          const note = data.application?.registrar_note;
          if (!note) return {};
          const parsed = JSON.parse(note);
          return parsed.checklist || {};
        } catch {
          return {};
        }
      })();

      const checklist = Object.fromEntries(
        admissionRequirements.map((req) => [req.id, Boolean(parsedReview[req.id])])
      );

      setSelectedApplication({
        ...data.application,
        reviewChecklist: checklist,
      });
      setReviewChecklist(checklist);
      setReviewNote(
        (() => {
          try {
            const note = data.application?.registrar_note;
            if (!note) return "";
            const parsed = JSON.parse(note);
            return parsed.notes || "";
          } catch {
            return data.application?.registrar_note || "";
          }
        })()
      );
      setReviewModalOpen(true);
    } catch (error) {
      console.error("Error opening review modal:", error);
    }
  }

  function confirmEnrollment(id: string) {
    setEnrollments(prev => prev.map(e => e.id === id ? { ...e, status: "Confirmed" } : e));
    const token = localStorage.getItem("inform_token");

    if (!token) return;
    // Find the enrollment db id from the list – for now we match by student_id
    fetch(`${API_BASE}/api/admin/enrollments`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const match = data?.enrollments?.find((e: { student_id: string; id: number }) => e.student_id === id);
       
        if (!match) return;
        return fetch(`${API_BASE}/api/admin/enrollments/${match.id}/approve`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({}),
        });
      })
      .catch(() => {});
  }

  function rejectEnrollment(id: string) {
    setEnrollments(prev => prev.map(e => e.id === id ? { ...e, status: "Rejected" } : e));
    const token = localStorage.getItem("inform_token");

    if (!token) return;
    fetch(`${API_BASE}/api/admin/enrollments`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const match = data?.enrollments?.find((e: { student_id: string; id: number }) => e.student_id === id);
        if (!match) return;
        return fetch(`${API_BASE}/api/admin/enrollments/${match.id}/reject`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({}),
        });
      })
      .catch(() => {});
  }

  function handlePhotoUpload(id: string, file: File) {
    const url = URL.createObjectURL(file);
    setEnrollments(prev => prev.map(e => e.id === id ? { ...e, photo: url } : e));
  }

  const updateEnrollmentStatus = (appId?: number, nextStatus?: string) => {
    if (!appId || !nextStatus) return;
    setEnrollments(prev => prev.map(e => e.appId === appId ? { ...e, status: nextStatus } : e));
  };

  const handleConfirmStudentId = async () => {
    if (!studentIdInput.trim()) {
      setStudentIdError("Student ID is required");
      return;
    }

    const token = localStorage.getItem("inform_token");
    if (!token || !selectedAppForId?.appId) return;

    setConfirmingStudentId(true);
    setStudentIdError("");

    try {
      const response = await fetch(`${API_BASE}/api/applications/${selectedAppForId.appId}/confirm-student-id`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          official_student_id: studentIdInput.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStudentIdError(data.error || "Failed to confirm Student ID");
        return;
      }

      // Success! Update the enrollment list
      setEnrollments(prev =>
        prev.map(e =>
          e.appId === selectedAppForId.appId
            ? { ...e, status: "Confirmed", generatedStudentId: studentIdInput.trim() }
            : e
        )
      );

      // Close modal and reset
      setStudentIdModalOpen(false);
      setSelectedAppForId(null);
      setStudentIdInput("");
      setStudentIdError("");

      alert(`✅ Success!\n\nStudent ID ${studentIdInput.trim()} confirmed.\nAccount created and credentials sent to ${selectedAppForId.id}`);
    } catch (error) {
      console.error("Student ID confirmation error:", error);
      setStudentIdError("Network error. Please try again.");
    } finally {
      setConfirmingStudentId(false);
    }
  };

  const normalizeApplicationStatus = (status?: string) => {
    switch (status) {
      case "approved":
      case "principal_approved":
        return "Confirmed";
      case "principal_review":
        return "Principal Review";
      case "rejected":
        return "Rejected";
      case "submitted":
      case "registrar_review":
        return "Pending";
      default:
        return status || "Pending";
    }
  };

  const confirmed = enrollments.filter(e => e.status === "Confirmed");
  const pending   = enrollments.filter(e => e.status === "Pending" || e.status === "Principal Review");

  // Filter and search logic
  const filteredEnrollments = enrollments.filter(enrollment => {
    // Search filter (name, email, student ID)
    const matchesSearch = searchQuery === "" || 
      enrollment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enrollment.generatedStudentId && enrollment.generatedStudentId.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter
    const matchesStatus = filterStatus === "All" || enrollment.status === filterStatus;

    // Track filter
    const matchesTrack = filterTrack === "All" || enrollment.track.includes(filterTrack);

    // Grade filter
    const matchesGrade = filterGrade === "All" || String(enrollment.grade) === filterGrade;

    // School year filter
    const matchesSchoolYear = filterSchoolYear === "All" || enrollment.schoolYear === filterSchoolYear;

    return matchesSearch && matchesStatus && matchesTrack && matchesGrade && matchesSchoolYear;
  });

  // Get unique school years for filter dropdown
  const uniqueSchoolYears = Array.from(new Set(enrollments.map(e => e.schoolYear).filter(Boolean)));

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
        <div><h2 className="fw-black fs-4 text-dark mb-0">Enrollment</h2><p className="text-muted small mb-0">School Year {getCurrentSchoolYear()}</p></div>
        <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-2"> Enrollment period is open</span>
      </div>

      {/* Search and Filters */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-3">
          <div className="row g-3">
            {/* Search */}
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-muted">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold text-muted">Status</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Principal Review">Principal Review</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Track Filter */}
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold text-muted">Track</label>
              <select
                className="form-select"
                value={filterTrack}
                onChange={(e) => setFilterTrack(e.target.value)}
              >
                <option value="All">All Tracks</option>
                <option value="STEM">STEM</option>
                <option value="ABM">ABM</option>
                <option value="HUMSS">HUMSS</option>
                <option value="ICT">ICT</option>
                <option value="Cookery">Cookery</option>
              </select>
            </div>

            {/* Grade Filter */}
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold text-muted">Grade</label>
              <select
                className="form-select"
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
              >
                <option value="All">All Grades</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>

            {/* School Year Filter */}
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold text-muted">School Year</label>
              <select
                className="form-select"
                value={filterSchoolYear}
                onChange={(e) => setFilterSchoolYear(e.target.value)}
              >
                <option value="All">All Years</option>
                {uniqueSchoolYears.sort().reverse().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 text-muted small">
            Showing {filteredEnrollments.length} of {enrollments.length} application{enrollments.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3">
        {[
          { 
            label: "Total Enrolled", 
            value: confirmed.length, 
            icon: "students" as IconName,
            gradient: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
            bgColor: "rgba(107, 114, 128, 0.1)",
            textColor: "#4b5563"
          },
          { 
            label: "Confirmed", 
            value: confirmed.length, 
            icon: "checkCircle" as IconName,
            gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            bgColor: "rgba(16, 185, 129, 0.1)",
            textColor: "#059669"
          },
          { 
            label: "Pending Review", 
            value: pending.length, 
            icon: "clock" as IconName,
            gradient: "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
            bgColor: "rgba(156, 163, 175, 0.1)",
            textColor: "#6b7280"
          },
        ].map(s => (
          <div key={s.label} className="col-12 col-md-4">
            <div 
              className="card border-0 shadow-sm rounded-3 overflow-hidden h-100"
              style={{ 
                background: "white",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "default"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            >
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div 
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: 56,
                      height: 56,
                      background: s.bgColor,
                      color: s.textColor
                    }}
                  >
                    <Icon name={s.icon} size={28} />
                  </div>
                  <div 
                    className="fw-black" 
                    style={{ 
                      fontSize: "2.5rem",
                      background: s.gradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      lineHeight: 1
                    }}
                  >
                    {s.value}
                  </div>
                </div>
                <div>
                  <div className="fw-semibold text-dark mb-1" style={{ fontSize: "0.95rem" }}>
                    {s.label}
                  </div>
                  <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                    {s.label === "Total Enrolled" && "Successfully enrolled students"}
                    {s.label === "Confirmed" && "Approved applications"}
                    {s.label === "Pending Review" && "Awaiting approval"}
                  </div>
                </div>
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
                <th className="small text-muted fw-semibold text-uppercase d-none d-sm-table-cell" style={{ letterSpacing:"0.05em" }}>Student ID</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-lg-table-cell" style={{ letterSpacing:"0.05em" }}>Track</th>
                <th className="small text-muted fw-semibold text-uppercase d-none d-sm-table-cell" style={{ letterSpacing:"0.05em" }}>Date</th>
                <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing:"0.05em" }}>Status</th>
                <th className="small text-muted fw-semibold text-uppercase text-end pe-4" style={{ letterSpacing:"0.05em" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <Icon name="alert" size={32} />
                      <div>No applications found</div>
                      <small>Try adjusting your search or filters</small>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((e) => {
                return (
                  <React.Fragment key={e.id}>
                    <tr>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          {/* Student Photo */}
                          {e.photo ? (
                            <Image
                              src={e.photo}
                              alt={e.name}
                              className="rounded-circle flex-shrink-0"
                              width={40}
                              height={40}
                              style={{ objectFit:"cover", border:"2px solid #e2e8f0" }}
                            />
                          ) : (
                            <div className="rounded-circle bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center text-primary fw-bold flex-shrink-0" 
                              style={{ width:40, height:40, fontSize:12 }}>
                              {initials(e.name)}
                            </div>
                          )}
                          <div>
                            <div className="small fw-medium text-dark">{e.name}</div>
                            <div className="text-muted" style={{ fontSize: 11 }}>{e.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="d-none d-sm-table-cell text-muted small">
                        {e.generatedStudentId || "—"}
                      </td>
                      <td className="d-none d-lg-table-cell text-muted small">{e.track} Grade {e.grade}</td>
                      <td className="d-none d-sm-table-cell text-muted small">{e.date}</td>
                      <td>
                        <span className={`badge ${
                          e.status === "Confirmed" && e.generatedStudentId
                            ? "bg-success-subtle text-success border border-success-subtle"
                            : e.status === "Confirmed" && !e.generatedStudentId
                              ? "bg-warning-subtle text-warning border border-warning-subtle"
                              : e.status === "Rejected"
                                ? "bg-danger-subtle text-danger border border-danger-subtle"
                                : e.status === "Principal Review"
                                  ? "bg-info-subtle text-info border border-info-subtle"
                                : "bg-warning-subtle text-warning border border-warning-subtle"
                        }`}>
                          {e.status === "Confirmed" && !e.generatedStudentId ? "ID Confirmation Needed" : e.status}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex gap-2 justify-content-end align-items-center flex-wrap">
                          {/* Registrar: Show "Confirm Student ID" for approved applications without student_id */}
                          {role === "registrar" && e.status === "Confirmed" && !e.generatedStudentId && (
                            <button
                              onClick={() => {
                                setSelectedAppForId(e);
                                setStudentIdInput("");
                                setStudentIdError("");
                                setStudentIdModalOpen(true);
                              }}
                              className="btn btn-sm"
                              style={{
                                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                                color: "#fff",
                                border: "none",
                                fontSize: 11,
                                fontWeight: 600,
                              }}
                            >
                              Confirm Student ID
                            </button>
                          )}

                          {/* Registrar: Can edit applications in Pending or Principal Review */}
                          {role === "registrar" && (e.status === "Pending" || e.status === "Principal Review") && (
                            <button
                              onClick={() => openReviewModal(e)}
                              className="btn btn-outline-primary btn-sm"
                              style={{ fontSize: 11 }}
                            >
                              {e.status === "Principal Review" ? "View" : "Review"}
                            </button>
                          )}
                          
                          {/* Principal: Can only view applications forwarded by registrar */}
                          {role === "principal" && e.status === "Principal Review" && (
                            <button
                              onClick={() => openReviewModal(e)}
                              className="btn btn-sm"
                              style={{ background: "#374151", color: "#fff", border: "none", fontSize: 11 }}
                            >
                              Review Application
                            </button>
                          )}
                          
                          {/* Principal: Show "Registrar Reviewing" for pending applications */}
                          {role === "principal" && e.status === "Pending" && (
                            <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2" style={{ fontSize: 11 }}>
                              Registrar Reviewing
                            </span>
                          )}
                          
                          {/* View button for confirmed applications */}
                          {e.status === "Confirmed" && (
                            <button
                              onClick={() => openReviewModal(e)}
                              className="btn btn-outline-primary btn-sm"
                              style={{ fontSize: 11 }}
                            >
                              View
                            </button>
                          )}
                          
                          {/* Reactivate button for rejected applications */}
                          {(role === "principal" || role === "registrar" || role === "admin") && e.status === "Rejected" && (
                            <button
                              onClick={async () => {
                                const token = localStorage.getItem("inform_token");
                                if (!token || !e.generatedStudentId) return;

                                try {
                                  const response = await fetch(
                                    `${API_BASE}/api/admin/students/${e.generatedStudentId}/reactivate`,
                                    {
                                      method: "PATCH",
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                        "Content-Type": "application/json",
                                      },
                                      credentials: "include",
                                    }
                                  );

                                  if (!response.ok) {
                                    throw new Error("Reactivation failed");
                                  }

                                  setEnrollments(prev =>
                                    prev.map(enrollment =>
                                      enrollment.id === e.id
                                        ? { ...enrollment, status: "Confirmed" }
                                        : enrollment
                                    )
                                  );
                                } catch (error) {
                                  console.error("Reactivation error:", error);
                                }
                              }}
                              className="btn btn-outline-success btn-sm"
                              style={{ fontSize: 11 }}
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                  </React.Fragment>
                );
              }))
              }
            </tbody>
          </table>
        </div>
      </div>

      {reviewModalOpen && selectedApplication && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)" }}
          onClick={() => setReviewModalOpen(false)}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90%", margin: "auto" }}
          >
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 20, overflow: "hidden" }}>
              
              {/* Header with gradient */}
              <div 
                className="modal-header border-0 text-white position-relative" 
                style={{ 
                  background: "linear-gradient(135deg, #374151 0%, #4b5563 100%)",
                  padding: "2rem 2.5rem"
                }}
              >
                <div className="d-flex align-items-center gap-3 w-100">
                  <div>
                    <h4 className="modal-title fw-bold mb-1 d-flex align-items-center gap-2">
                      <Icon name="enrollment" size={28} />
                      Enrollment Application Review
                    </h4>
                    <p className="mb-0 opacity-75" style={{ fontSize: 14 }}>
                      Review student information and admission requirements
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-auto"
                    onClick={() => setReviewModalOpen(false)}
                    style={{ filter: "brightness(0) invert(1)" }}
                  />
                </div>
              </div>

              <div className="modal-body p-0" style={{ background: "#f8f9fa" }}>
                <div className="row g-0">
                  
                  {/* Left Column - Student Photo & Basic Info */}
                  <div className="col-lg-4" style={{ background: "#fff", borderRight: "1px solid #e5e7eb" }}>
                    <div className="p-4">
                      
                      {/* Student Photo */}
                      <div className="text-center mb-4">
                        {selectedApplication.photo_url ? (
                          <div className="position-relative d-inline-block">
                            <Image
                              src={selectedApplication.photo_url}
                              alt="Student Photo"
                              className="rounded-4 shadow-sm"
                              width={200}
                              height={200}
                              style={{
                                objectFit: "cover",
                                border: "4px solid #e5e7eb"
                              }}
                            />
                            <div 
                              className="position-absolute bottom-0 end-0 rounded-circle bg-success d-flex align-items-center justify-content-center"
                              style={{ width: 40, height: 40, border: "3px solid white" }}
                            >
                              <Icon name="checkCircle" size={20} className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="rounded-4 bg-gradient d-flex align-items-center justify-content-center mx-auto shadow-sm"
                            style={{
                              width: 200,
                              height: 200,
                              background: "linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%)",
                              border: "4px solid #e5e7eb"
                            }}
                          >
                            <Icon name="user" size={80} className="text-secondary opacity-50" />
                          </div>
                        )}
                      </div>

                      {/* Student Name */}
                      <div className="text-center mb-4">
                        <h5 className="fw-bold text-dark mb-1">
                          {[selectedApplication.first_name, selectedApplication.middle_name, selectedApplication.last_name, selectedApplication.extension_name]
                            .filter(Boolean)
                            .join(" ")}
                        </h5>
                        <div className="d-flex justify-content-center gap-2 flex-wrap">
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">
                            {selectedApplication.pathway || "—"}
                          </span>
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                            Grade {selectedApplication.grade_level || "—"}
                          </span>
                          <span className="badge bg-info-subtle text-info border border-info-subtle px-3 py-2">
                            SY {selectedApplication.school_year || "—"}
                          </span>
                        </div>
                      </div>

                      {/* Quick Info Cards */}
                      <div className="d-flex flex-column gap-3">
                        {[
                          { icon: "user", label: "Student Status", value: selectedApplication.student_status === "new" ? "New Student" : "Returning Student", color: "primary" },
                          { icon: "calendar", label: "Application Date", value: new Date(selectedApplication.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }), color: "secondary" },
                          { icon: "bell", label: "Current Status", value: normalizeApplicationStatus(selectedApplication.status), color: selectedApplication.status === "approved" ? "success" : selectedApplication.status === "rejected" ? "danger" : "warning" },
                        ].map((item, idx) => (
                          <div key={idx} className={`rounded-3 p-3 bg-${item.color}-subtle border border-${item.color}-subtle`}>
                            <div className="d-flex align-items-center gap-3">
                              <div className={`rounded-circle bg-${item.color} bg-opacity-10 d-flex align-items-center justify-content-center`} style={{ width: 40, height: 40 }}>
                                <Icon name={item.icon as IconName} size={20} className={`text-${item.color}`} />
                              </div>
                              <div className="flex-grow-1">
                                <div className="small text-muted mb-1">{item.label}</div>
                                <div className="fw-semibold text-dark small">{item.value}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Detailed Information */}
                  <div className="col-lg-8">
                    <div className="p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                      
                      {/* Personal Information Section */}
                      <div className="mb-4">
                        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                          <Icon name="user" size={18} />
                          Personal Information
                        </h6>
                        <div className="card border-0 shadow-sm">
                          <div className="card-body p-4">
                            <div className="row g-3">
                              {[
                                { label: "Learners Reference No. (LRN)", value: selectedApplication.lrn || "—", icon: "book" },
                                { label: "Email Address", value: selectedApplication.email, icon: "bell" },
                                { label: "Phone Number", value: selectedApplication.phone, icon: "bell" },
                                { label: "Date of Birth", value: selectedApplication.date_of_birth ? new Date(selectedApplication.date_of_birth).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" }) : "—", icon: "calendar" },
                                { label: "Gender", value: selectedApplication.gender, icon: "user" },
                                { label: "Civil Status", value: selectedApplication.civil_status || "—", icon: "user" },
                                { label: "Nationality", value: selectedApplication.nationality, icon: "user" },
                                { label: "Religion", value: selectedApplication.religion || "—", icon: "user" },
                                { label: "Complete Address", value: selectedApplication.address, icon: "user", fullWidth: true },
                              ].map((field, idx) => (
                                <div key={idx} className={field.fullWidth ? "col-12" : "col-md-6"}>
                                  <div className="d-flex flex-column">
                                    <span className="text-muted small mb-1">{field.label}</span>
                                    <span className="fw-medium text-dark">{field.value}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Academic Information Section */}
                      <div className="mb-4">
                        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                          <Icon name="book" size={18} />
                          Academic Information
                        </h6>
                        <div className="card border-0 shadow-sm">
                          <div className="card-body p-4">
                            <div className="row g-3">
                              {[
                                { label: "Learning Modality", value: selectedApplication.learning_modality },
                                { label: "Previous School", value: selectedApplication.previous_school || "—" },
                                { label: "Previous School Address", value: selectedApplication.previous_school_address || "—", fullWidth: true },
                                { label: "Years Attended", value: selectedApplication.years_attended || "—" },
                              ].map((field, idx) => (
                                <div key={idx} className={field.fullWidth ? "col-12" : "col-md-6"}>
                                  <div className="d-flex flex-column">
                                    <span className="text-muted small mb-1">{field.label}</span>
                                    <span className="fw-medium text-dark">{field.value}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Family Information Section */}
                      <div className="mb-4">
                        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                          <Icon name="users" size={18} />
                          Family / Guardian Information
                        </h6>
                        <div className="card border-0 shadow-sm">
                          <div className="card-body p-4">
                            <div className="row g-3">
                              {[
                                { label: "Father's Name", value: selectedApplication.father_name || "—" },
                                { label: "Father's Occupation", value: selectedApplication.father_occupation || "—" },
                                { label: "Mother's Name", value: selectedApplication.mother_name || "—" },
                                { label: "Mother's Occupation", value: selectedApplication.mother_occupation || "—" },
                                { label: "Guardian Name", value: selectedApplication.guardian_name || "—" },
                                { label: "Guardian Relation", value: selectedApplication.guardian_relation || "—" },
                                { label: "Guardian Phone", value: selectedApplication.guardian_phone || "—" },
                              ].map((field, idx) => (
                                <div key={idx} className="col-md-6">
                                  <div className="d-flex flex-column">
                                    <span className="text-muted small mb-1">{field.label}</span>
                                    <span className="fw-medium text-dark">{field.value}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Requirements Checklist Section */}
                      <div className="mb-4">
                        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                          <Icon name="file" size={18} />
                          Admission Requirements Checklist
                        </h6>
                        <div className="card border-0 shadow-sm">
                          <div className="card-body p-4">
                            <div className="row g-3">
                              {admissionRequirements.map((req) => (
                                <div key={req.id} className="col-md-6">
                                  <div className="d-flex align-items-center p-3 rounded-3 bg-light border" style={{ minHeight: 60 }}>
                                    <input
                                      className="form-check-input me-3 flex-shrink-0"
                                      type="checkbox"
                                      id={`req-${req.id}`}
                                      checked={Boolean(reviewChecklist[req.id])}
                                      disabled={role === "principal"}
                                      onChange={() => {
                                        if (role === "principal") return;
                                        setReviewChecklist((prev) => ({
                                          ...prev,
                                          [req.id]: !prev[req.id],
                                        }));
                                      }}
                                      style={{ width: 20, height: 20, marginTop: 0 }}
                                    />
                                    <label className="form-check-label fw-medium text-dark mb-0" htmlFor={`req-${req.id}`} style={{ cursor: role === "principal" ? "default" : "pointer" }}>
                                      {req.label}
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes Section */}
                      <div className="mb-3">
                        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                          <Icon name="file" size={18} />
                          Registrar Notes / Missing Requirements
                        </h6>
                        <div className="card border-0 shadow-sm">
                          <div className="card-body p-4">
                            <textarea
                              className="form-control border-0 bg-light"
                              rows={4}
                              value={reviewNote}
                              onChange={(e) => setReviewNote(e.target.value)}
                              disabled={role === "principal"}
                              placeholder={role === "principal" ? "View-only mode for Principal" : "List any missing documents, concerns, or notes about this application..."}
                              style={{ resize: "none", fontSize: 14 }}
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with Actions */}
              <div className="modal-footer border-0 bg-white p-4" style={{ borderTop: "1px solid #e5e7eb" }}>
                <div className="d-flex gap-2 w-100 justify-content-end">
                  
                  {normalizeApplicationStatus(selectedApplication?.status) === "Confirmed" || normalizeApplicationStatus(selectedApplication?.status) === "Rejected" ? null : role === "principal" ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-danger px-4"
                        onClick={async () => {
                          const token = localStorage.getItem("inform_token");
                          if (!token || !selectedApplication?.id) return;

                          await fetch(`${API_BASE}/api/applications/${selectedApplication.id}/reject`, {
                            method: "PATCH",
                            headers: {
                              Authorization: `Bearer ${token}`,
                              "Content-Type": "application/json",
                            },
                            credentials: "include",
                            body: JSON.stringify({
                              rejection_reason: reviewNote || "Application rejected after principal review.",
                            }),
                          });

                          updateEnrollmentStatus(selectedApplication.id, "Rejected");
                          setReviewModalOpen(false);
                          setSelectedApplication(null);
                          setReviewChecklist({});
                        }}
                      >
                        <Icon name="x" size={18} className="me-2" />
                        Reject Application
                      </button>
                      
                      <button
                        type="button"
                        className="btn btn-success px-4"
                        onClick={async () => {
                          const token = localStorage.getItem("inform_token");
                          if (!token || !selectedApplication?.id) return;

                          await fetch(`${API_BASE}/api/applications/${selectedApplication.id}/approve`, {
                            method: "PATCH",
                            headers: {
                              Authorization: `Bearer ${token}`,
                              "Content-Type": "application/json",
                            },
                            credentials: "include",
                            body: JSON.stringify({
                              principal_note: reviewNote || "Application approved after review.",
                            }),
                          });

                          updateEnrollmentStatus(selectedApplication.id, "Confirmed");
                          setReviewModalOpen(false);
                          setSelectedApplication(null);
                          setReviewChecklist({});
                        }}
                      >
                        <Icon name="checkCircle" size={18} className="me-2" />
                        Approve & Enroll
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn-danger px-4"
                        onClick={async () => {
                          const token = localStorage.getItem("inform_token");
                          if (!token || !selectedApplication?.id) return;

                          await fetch(`${API_BASE}/api/applications/${selectedApplication.id}/reject`, {
                            method: "PATCH",
                            headers: {
                              Authorization: `Bearer ${token}`,
                              "Content-Type": "application/json",
                            },
                            credentials: "include",
                            body: JSON.stringify({
                              rejection_reason: reviewNote || "Missing required documents.",
                            }),
                          });

                          updateEnrollmentStatus(selectedApplication.id, "Rejected");
                          setReviewModalOpen(false);
                          setSelectedApplication(null);
                          setReviewChecklist({});
                        }}
                      >
                        <Icon name="x" size={18} className="me-2" />
                        Reject
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary px-4"
                        onClick={async () => {
                          const token = localStorage.getItem("inform_token");
                          if (!token || !selectedApplication?.id) return;

                          await fetch(`${API_BASE}/api/applications/${selectedApplication.id}/forward`, {
                            method: "PATCH",
                            headers: {
                              Authorization: `Bearer ${token}`,
                              "Content-Type": "application/json",
                            },
                            credentials: "include",
                            body: JSON.stringify({
                              registrar_note: reviewNote || "Reviewed and forwarded to the principal.",
                              review_checklist: reviewChecklist,
                            }),
                          });

                          updateEnrollmentStatus(selectedApplication.id, "Principal Review");
                          setReviewModalOpen(false);
                          setSelectedApplication(null);
                          setReviewChecklist({});
                        }}
                      >
                        <Icon name="arrowRight" size={18} className="me-2" />
                        Forward to Principal
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student ID Confirmation Modal */}
      {studentIdModalOpen && selectedAppForId && (
        <div
          className="modal fade show d-block"
          style={{
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => {
            if (!confirmingStudentId) {
              setStudentIdModalOpen(false);
              setSelectedAppForId(null);
              setStudentIdInput("");
              setStudentIdError("");
            }
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div
                className="p-4 text-white rounded-top-4"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h5 className="fw-bold mb-1">Confirm Official Student ID</h5>
                    <small className="opacity-90">
                      {selectedAppForId.name} • {selectedAppForId.id}
                    </small>
                  </div>
                  {!confirmingStudentId && (
                    <button
                      onClick={() => {
                        setStudentIdModalOpen(false);
                        setSelectedAppForId(null);
                        setStudentIdInput("");
                        setStudentIdError("");
                      }}
                      className="btn btn-link text-white p-0"
                      style={{ fontSize: 24, lineHeight: 1 }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="alert alert-info mb-4">
                  <div className="d-flex gap-2">
                    <div style={{ fontSize: 20 }}>ℹ️</div>
                    <div className="small">
                      <strong>Important:</strong> Enter the official Student ID assigned by the school.
                      The system will create the student account and send login credentials via email.
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Official Student ID <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${studentIdError ? "is-invalid" : ""}`}
                    placeholder="e.g., 2025123456"
                    value={studentIdInput}
                    onChange={(e) => {
                      setStudentIdInput(e.target.value);
                      setStudentIdError("");
                    }}
                    disabled={confirmingStudentId}
                    autoFocus
                  />
                  {studentIdError && (
                    <div className="invalid-feedback d-block">{studentIdError}</div>
                  )}
                </div>
                <div className="bg-light rounded-3 p-3 mb-4">
                  <h6 className="fw-semibold mb-2 small">What happens next:</h6>
                  <ol className="mb-0 ps-3" style={{ fontSize: 13 }}>
                    <li>Student account created with this ID</li>
                    <li>Temporary password generated</li>
                    <li>Credentials emailed to {selectedAppForId.id}</li>
                    <li>Student can log in immediately</li>
                  </ol>
                </div>
                <div className="d-flex gap-2">
                  <button
                    onClick={() => {
                      setStudentIdModalOpen(false);
                      setSelectedAppForId(null);
                      setStudentIdInput("");
                      setStudentIdError("");
                    }}
                    className="btn btn-outline-secondary flex-grow-1"
                    disabled={confirmingStudentId}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmStudentId}
                    className="btn flex-grow-1"
                    style={{
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      color: "#fff",
                      border: "none",
                    }}
                    disabled={confirmingStudentId || !studentIdInput.trim()}
                  >
                    {confirmingStudentId ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />
                        Creating Account...
                      </>
                    ) : (
                      "Confirm & Create Account"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/*  Tuition Panel  */
function TuitionPanel() {
  // Calculate current school year dynamically
  const getCurrentSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 6 ? year : year - 1;
    const endYear = startYear + 1;
    return `${startYear}-${endYear}`;
  };

  const [search, setSearch] = useState("");
  const [filterTrack, setFilterTrack] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [apiPayments, setApiPayments] = useState<{
    id: number; student_id: string; student_name: string;
    fee_item: string; amount: number; status: string; paid_at: string;
  }[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    fetch(`${API_BASE}/api/admin/payments`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.payments?.length) setApiPayments(data.payments); })
      .catch(() => {});
  }, []);

  const allRecords: DashboardRecord[] = apiPayments.length > 0
    ? apiPayments.map(p => ({
        id: p.student_id,
        name: p.student_name,
        track: "N/A",
        grade: 0,
        gwa: 0,
        room: 0,
        status: "Active",
        tuition: p.status === "verified" ? "Paid" : "Unpaid",
        total: Number(p.amount),
        paid: p.status === "verified" ? Number(p.amount) : 0,
        balance: p.status === "verified" ? 0 : Number(p.amount),
        paymentId: p.id,
      }))
    : students.map(s => ({
        id: s.id,
        name: s.name,
        track: s.track,
        grade: s.grade,
        gwa: s.gwa,
        room: s.room,
        status: s.status,
        tuition: s.tuition,
        total: 22050,
        paid: s.tuition === "Paid" ? 22050 : 18500,
        balance: s.tuition === "Paid" ? 0 : 3550,
        paymentId: 0,
      }));

  const tracks = ["All", "Academic Track - STEM", "Academic Track - HUMSS", "Academic Track - ABM", "TECH-PRO - ICT", "TECH-PRO - Cookery"];

  const filtered = allRecords.filter(r => {
    const name = String(r.name).toLowerCase();
    const idValue = String(r.id).toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || idValue.includes(search.toLowerCase());
    const matchTrack = filterTrack === "All" || r.track === filterTrack;
    const matchStatus = filterStatus === "All" || r.tuition === filterStatus;
    return matchSearch && matchTrack && matchStatus;
  });

  const totalCollected = allRecords.reduce((a,r) => a + r.paid, 0);
  const totalBalance   = allRecords.reduce((a,r) => a + r.balance, 0);

  return (
    <div className="d-flex flex-column gap-4">
      <div><h2 className="fw-black fs-4 text-dark mb-0">Tuition Records</h2><p className="text-muted small mb-0">Academic Year {getCurrentSchoolYear()}</p></div>

      {/* Stats */}
      <div className="row g-3">
        {[
          { label:"Total Assessment",  value:`${(allRecords.length*22050).toLocaleString()}`, cls:"bg-light border-secondary" },
          { label:"Total Collected",   value:`${totalCollected.toLocaleString()}`,             cls:"bg-success-subtle border-success-subtle text-success" },
          { label:"Total Balance Due", value:`${totalBalance.toLocaleString()}`,               cls:"bg-danger-subtle border-danger-subtle text-danger" },
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
          <span className="input-group-text bg-white"></span>
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
                  <td className="d-none d-sm-table-cell text-muted small text-end">{r.total.toLocaleString()}</td>
                  <td className="d-none d-sm-table-cell text-success small fw-semibold text-end">{r.paid.toLocaleString()}</td>
                  <td className={`small fw-semibold text-end ${r.balance > 0 ? "text-danger" : "text-muted"}`}>{r.balance > 0 ? `${r.balance.toLocaleString()}` : ""}</td>
                  <td className="text-end pe-4">
                    <div className="d-flex align-items-center justify-content-end gap-2">
                        <span className={`badge ${r.tuition==="Paid" ? "bg-success-subtle text-success border border-success-subtle" : "bg-danger-subtle text-danger border border-danger-subtle"}`}>
                          {r.tuition}
                        </span>
                        {r.tuition === "Unpaid" && (r as typeof r & { paymentId?: number }).paymentId ? (
                          <button
                            onClick={() => {
                              const token = localStorage.getItem("inform_token");
                              if (!token) return;
                              fetch(`${API_BASE}/api/admin/payments/${(r as typeof r & { paymentId?: number }).paymentId}/verify`, {
                                method: "PATCH",
                                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({}),
                              })
                                .then(res => res.ok ? setApiPayments(prev => prev.map(p => p.id === (r as typeof r & { paymentId?: number }).paymentId ? { ...p, status: "verified" } : p)) : null)
                                .catch(() => {});
                            }}
                            className="btn btn-success btn-sm d-inline-flex align-items-center gap-1"
                            style={{ fontSize: 11 }}
                          >
                            <Icon name="check" size={11} /> Verify
                          </button>
                        ) : null}
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

/*  Teachers Panel  */
/*  Grade submission deadlines per trimester  */
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

function TeachersPanel({ readOnly, registrarView, role }: { readOnly?: boolean; registrarView?: boolean; role?: string } = {}) {
  const [search, setSearch] = useState("");

  interface Teacher {
    id: number;
    teacher_id: string;
    full_name: string;
    department: string;
    email: string;
    employment_type: "Part-time" | "Full-time";
    term: "Term 1" | "Term 2" | "Term 3" | null;
    account_status: "active" | "suspended";
  }

  const [apiTeachers, setApiTeachers] = useState<Teacher[]>([]);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherForm, setTeacherForm] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    password: "",
    employmentType: "Full-time" as "Full-time" | "Part-time",
    term: "" as "" | "Term 1" | "Term 2" | "Term 3"
  });
  const [creatingTeacher, setCreatingTeacher] = useState(false);
  
  // Edit modal
  const [showEditTeacher, setShowEditTeacher] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editForm, setEditForm] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    employmentType: "Full-time" as "Full-time" | "Part-time",
    term: "" as "" | "Term 1" | "Term 2" | "Term 3"
  });
  const [updatingTeacher, setUpdatingTeacher] = useState(false);

  // Status filter
  const [statusFilter, setStatusFilter] = useState<"All" | "Full-time" | "Part-time" | "Inactive">("All");
  const [termFilter, setTermFilter] = useState<"All Terms" | "Term 1" | "Term 2" | "Term 3">("All Terms");

  // Confirmation modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: "deactivate" | "activate", teacher: Teacher } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [processingAction, setProcessingAction] = useState(false);

  function loadTeachers() {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    fetch(`${API_BASE}/api/admin/teachers`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data?.teachers)) {
          setApiTeachers(data.teachers);
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadTeachers();
  }, []);

  async function createTeacher(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
    if (!token) { 
      setSuccessMessage("Session expired. Please log in again.");
      setShowSuccessModal(true);
      return;
    }

    setCreatingTeacher(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/teachers`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          first_name: teacherForm.firstName,
          last_name: teacherForm.lastName,
          email: teacherForm.email,
          password: teacherForm.password,
          employment_type: teacherForm.employmentType,
          term: teacherForm.term || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create teacher account.");

      setTeacherForm({ firstName: "", lastName: "", email: "", password: "", employmentType: "Full-time", term: "" });
      setShowAddTeacher(false);
      loadTeachers();
      setSuccessMessage(`Teacher account created: ${data.teacher.teacher_id}`);
      setShowSuccessModal(true);
    } catch (error) {
      setSuccessMessage(error instanceof Error ? error.message : "Unable to create teacher account.");
      setShowSuccessModal(true);
    } finally {
      setCreatingTeacher(false);
    }
  }

  function openEditModal(teacher: Teacher) {
    setEditingTeacher(teacher);
    const [firstName, ...lastNameParts] = teacher.full_name.split(" ");
    setEditForm({
      firstName,
      lastName: lastNameParts.join(" "),
      email: teacher.email,
      employmentType: teacher.employment_type,
      term: teacher.term || ""
    });
    setShowEditTeacher(true);
  }

  async function updateTeacher(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingTeacher) return;

    const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
    if (!token) {
      setSuccessMessage("Session expired. Please log in again.");
      setShowSuccessModal(true);
      return;
    }

    setUpdatingTeacher(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/teachers/${editingTeacher.teacher_id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          email: editForm.email,
          employment_type: editForm.employmentType,
          term: editForm.term || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update teacher.");

      setShowEditTeacher(false);
      setEditingTeacher(null);
      loadTeachers();
      setSuccessMessage("Teacher updated successfully");
      setShowSuccessModal(true);
    } catch (error) {
      setSuccessMessage(error instanceof Error ? error.message : "Unable to update teacher.");
      setShowSuccessModal(true);
    } finally {
      setUpdatingTeacher(false);
    }
  }

  function openConfirmModal(type: "deactivate" | "activate", teacher: Teacher) {
    setConfirmAction({ type, teacher });
    setShowConfirmModal(true);
  }

  async function handleConfirmAction() {
    if (!confirmAction) return;

    const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
    if (!token) {
      setSuccessMessage("Session expired. Please log in again.");
      setShowSuccessModal(true);
      setShowConfirmModal(false);
      return;
    }

    setProcessingAction(true);
    try {
      const endpoint = confirmAction.type === "deactivate" ? "deactivate" : "reactivate";
      const response = await fetch(`${API_BASE}/api/admin/teachers/${confirmAction.teacher.teacher_id}/${endpoint}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Unable to ${confirmAction.type} teacher.`);

      setShowConfirmModal(false);
      setConfirmAction(null);
      loadTeachers();
      setSuccessMessage(confirmAction.type === "deactivate" ? "Teacher deactivated successfully" : "Teacher reactivated successfully");
      setShowSuccessModal(true);
    } catch (error) {
      setSuccessMessage(error instanceof Error ? error.message : `Unable to ${confirmAction.type} teacher.`);
      setShowSuccessModal(true);
      setShowConfirmModal(false);
    } finally {
      setProcessingAction(false);
    }
  }

  // Filter teachers
  const filtered = apiTeachers.filter(t => {
    const matchSearch = t.full_name.toLowerCase().includes(search.toLowerCase()) ||
      t.teacher_id.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase());
    
    let matchStatus = true;
    if (statusFilter === "Full-time") {
      matchStatus = t.account_status === "active" && t.employment_type === "Full-time";
    } else if (statusFilter === "Part-time") {
      matchStatus = t.account_status === "active" && t.employment_type === "Part-time";
    } else if (statusFilter === "Inactive") {
      matchStatus = t.account_status === "suspended";
    } else if (statusFilter === "All") {
      matchStatus = t.account_status === "active";
    }
    
    // Apply term filter
    let matchTerm = true;
    if (termFilter !== "All Terms") {
      matchTerm = t.term === termFilter;
    }
    
    return matchSearch && matchStatus && matchTerm;
  });

  // Count statistics
  const totalActive = apiTeachers.filter(t => t.account_status === "active").length;
  const totalFullTime = apiTeachers.filter(t => t.account_status === "active" && t.employment_type === "Full-time").length;
  const totalPartTime = apiTeachers.filter(t => t.account_status === "active" && t.employment_type === "Part-time").length;
  const totalInactive = apiTeachers.filter(t => t.account_status === "suspended").length;
  const totalTerm1 = apiTeachers.filter(t => t.account_status === "active" && t.term === "Term 1").length;
  const totalTerm2 = apiTeachers.filter(t => t.account_status === "active" && t.term === "Term 2").length;
  const totalTerm3 = apiTeachers.filter(t => t.account_status === "active" && t.term === "Term 3").length;

  return (
    <div className="d-flex flex-column gap-4">

      {/* Header with title and Add Teacher button */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
        <div>
          <h2 className="fw-black fs-4 text-dark mb-0">
            Teachers {statusFilter !== "All" && `(${statusFilter})`}
          </h2>
        </div>
        {role === "principal" && (
          <button onClick={() => setShowAddTeacher(true)} className="btn btn-sm fw-semibold" style={{ background: "#374151", color: "#fff", border: "none" }}>
            + Add Teacher
          </button>
        )}
      </div>

      {/* Search Bar and Term Filter */}
      <div className="row g-3">
        <div className="col-12 col-md-8">
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-white border-end-0"></span>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by name, ID, or email..." 
              className="form-control border-start-0" 
            />
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-white border-end-0"></span>
            <select 
              value={termFilter}
              onChange={e => setTermFilter(e.target.value as "All Terms" | "Term 1" | "Term 2" | "Term 3")}
              className="form-select border-start-0"
              style={{ cursor: "pointer" }}
            >
              <option value="All Terms">All Terms</option>
              <option value="Term 1">Term 1 ({totalTerm1})</option>
              <option value="Term 2">Term 2 ({totalTerm2})</option>
              <option value="Term 3">Term 3 ({totalTerm3})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Cards */}
      <div className="row g-3">
        <div className="col-6 col-md-3">
          <div 
            className={`card border-0 shadow-sm h-100 ${statusFilter === "All" ? "border-primary" : ""}`}
            style={{ 
              cursor: "pointer", 
              borderWidth: statusFilter === "All" ? "2px" : "0",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 .5rem 1rem rgba(0,0,0,.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 .125rem .25rem rgba(0,0,0,.075)";
            }}
            onClick={() => setStatusFilter("All")}
          >
            <div className="card-body text-center py-3">
              <div className="fs-2 fw-bold text-primary">{totalActive}</div>
              <div className="small text-muted">All Active</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div 
            className={`card border-0 shadow-sm h-100 ${statusFilter === "Full-time" ? "border-info" : ""}`}
            style={{ 
              cursor: "pointer", 
              borderWidth: statusFilter === "Full-time" ? "2px" : "0",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 .5rem 1rem rgba(0,0,0,.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 .125rem .25rem rgba(0,0,0,.075)";
            }}
            onClick={() => setStatusFilter("Full-time")}
          >
            <div className="card-body text-center py-3">
              <div className="fs-2 fw-bold text-info">{totalFullTime}</div>
              <div className="small text-muted">Full-time</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div 
            className={`card border-0 shadow-sm h-100 ${statusFilter === "Part-time" ? "border-warning" : ""}`}
            style={{ 
              cursor: "pointer", 
              borderWidth: statusFilter === "Part-time" ? "2px" : "0",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 .5rem 1rem rgba(0,0,0,.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 .125rem .25rem rgba(0,0,0,.075)";
            }}
            onClick={() => setStatusFilter("Part-time")}
          >
            <div className="card-body text-center py-3">
              <div className="fs-2 fw-bold text-warning">{totalPartTime}</div>
              <div className="small text-muted">Part-time</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div 
            className={`card border-0 shadow-sm h-100 ${statusFilter === "Inactive" ? "border-secondary" : ""}`}
            style={{ 
              cursor: "pointer", 
              borderWidth: statusFilter === "Inactive" ? "2px" : "0",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 .5rem 1rem rgba(0,0,0,.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 .125rem .25rem rgba(0,0,0,.075)";
            }}
            onClick={() => setStatusFilter("Inactive")}
          >
            <div className="card-body text-center py-3">
              <div className="fs-2 fw-bold text-secondary">{totalInactive}</div>
              <div className="small text-muted">Inactive</div>
            </div>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3 small fw-semibold text-muted">TEACHER</th>
                <th className="px-4 py-3 small fw-semibold text-muted">TEACHER ID</th>
                <th className="px-4 py-3 small fw-semibold text-muted">EMAIL</th>
                <th className="px-4 py-3 small fw-semibold text-muted">EMPLOYMENT TYPE</th>
                <th className="px-4 py-3 small fw-semibold text-muted">TERM</th>
                <th className="px-4 py-3 small fw-semibold text-muted">STATUS</th>
                {role === "principal" && <th className="px-4 py-3 small fw-semibold text-muted">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={role === "principal" ? 7 : 6} className="text-center py-5 text-muted">
                    No teachers found.
                  </td>
                </tr>
              ) : (
                filtered.map((teacher) => {
                  const initials = teacher.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                  
                  return (
                    <tr key={teacher.id}>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div 
                            className="rounded-circle bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center text-primary fw-bold flex-shrink-0" 
                            style={{ width: 40, height: 40, fontSize: 13 }}
                          >
                            {initials}
                          </div>
                          <div className="fw-semibold text-dark">{teacher.full_name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted small">{teacher.teacher_id}</td>
                      <td className="px-4 py-3 text-muted small">{teacher.email}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${teacher.employment_type === "Full-time" ? "bg-info" : "bg-warning"} text-white`}>
                          {teacher.employment_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {teacher.term ? (
                          <span className="badge bg-purple text-white" style={{ backgroundColor: "#6f42c1" }}>
                            {teacher.term}
                          </span>
                        ) : (
                          <span className="text-muted small">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${teacher.account_status === "active" ? "bg-success" : "bg-secondary"}`}>
                          {teacher.account_status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      {role === "principal" && (
                        <td className="px-4 py-3">
                          <div className="d-flex gap-2">
                            <button 
                              onClick={() => openEditModal(teacher)}
                              className="btn btn-sm btn-outline-primary"
                              title="Edit teacher"
                            >
                              Edit Teacher
                            </button>
                            {teacher.account_status === "active" ? (
                              <button 
                                onClick={() => openConfirmModal("deactivate", teacher)}
                                className="btn btn-sm btn-outline-danger"
                                title="Deactivate teacher"
                              >
                                Deactivate 
                              </button>
                            ) : (
                              <button 
                                onClick={() => openConfirmModal("activate", teacher)}
                                className="btn btn-sm btn-outline-success"
                                title="Activate teacher"
                              >
                                
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {showAddTeacher && role === "principal" && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }} onClick={() => setShowAddTeacher(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={createTeacher}>
                <div className="modal-header border-0 pb-0">
                  <div>
                    <h5 className="modal-title fw-bold mb-1">Add Teacher</h5>
                    <p className="text-muted small mb-0">Create a new teacher account</p>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setShowAddTeacher(false)} />
                </div>
                <div className="modal-body d-flex flex-column gap-3">
                  <div className="row g-3">
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold">First name</label>
                      <input 
                        required 
                        minLength={2} 
                        value={teacherForm.firstName} 
                        onChange={e => setTeacherForm({ ...teacherForm, firstName: e.target.value })} 
                        className="form-control" 
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold">Last name</label>
                      <input 
                        required 
                        minLength={2} 
                        value={teacherForm.lastName} 
                        onChange={e => setTeacherForm({ ...teacherForm, lastName: e.target.value })} 
                        className="form-control" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label small fw-semibold">Email</label>
                    <input 
                      required 
                      type="email" 
                      value={teacherForm.email} 
                      onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })} 
                      className="form-control" 
                    />
                  </div>
                  <div>
                    <label className="form-label small fw-semibold">Temporary password</label>
                    <input 
                      required 
                      minLength={8} 
                      type="password" 
                      value={teacherForm.password} 
                      onChange={e => setTeacherForm({ ...teacherForm, password: e.target.value })} 
                      className="form-control" 
                    />
                    <div className="form-text">Minimum 8 characters</div>
                  </div>
                  <div>
                    <label className="form-label small fw-semibold">Employment Type</label>
                    <select 
                      required
                      value={teacherForm.employmentType}
                      onChange={e => setTeacherForm({ ...teacherForm, employmentType: e.target.value as "Full-time" | "Part-time" })}
                      className="form-select"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label small fw-semibold">Term (Optional)</label>
                    <select 
                      value={teacherForm.term}
                      onChange={e => setTeacherForm({ ...teacherForm, term: e.target.value as "" | "Term 1" | "Term 2" | "Term 3" })}
                      className="form-select"
                    >
                      <option value="">Not assigned</option>
                      <option value="Term 1">Term 1</option>
                      <option value="Term 2">Term 2</option>
                      <option value="Term 3">Term 3</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddTeacher(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={creatingTeacher}>
                    {creatingTeacher ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {showEditTeacher && editingTeacher && role === "principal" && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }} onClick={() => setShowEditTeacher(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={updateTeacher}>
                <div className="modal-header border-0 pb-0">
                  <div>
                    <h5 className="modal-title fw-bold mb-1">Edit Teacher</h5>
                    <p className="text-muted small mb-0">Update teacher information</p>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setShowEditTeacher(false)} />
                </div>
                <div className="modal-body d-flex flex-column gap-3">
                  <div className="row g-3">
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold">First name</label>
                      <input 
                        required 
                        minLength={2} 
                        value={editForm.firstName} 
                        onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} 
                        className="form-control" 
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold">Last name</label>
                      <input 
                        required 
                        minLength={2} 
                        value={editForm.lastName} 
                        onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} 
                        className="form-control" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label small fw-semibold">Email</label>
                    <input 
                      required 
                      type="email" 
                      value={editForm.email} 
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })} 
                      className="form-control" 
                    />
                  </div>
                  <div>
                    <label className="form-label small fw-semibold">Employment Type</label>
                    <select 
                      required
                      value={editForm.employmentType}
                      onChange={e => setEditForm({ ...editForm, employmentType: e.target.value as "Full-time" | "Part-time" })}
                      className="form-select"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label small fw-semibold">Term</label>
                    <select 
                      value={editForm.term}
                      onChange={e => setEditForm({ ...editForm, term: e.target.value as "" | "Term 1" | "Term 2" | "Term 3" })}
                      className="form-select"
                    >
                      <option value="">Not assigned</option>
                      <option value="Term 1">Term 1</option>
                      <option value="Term 2">Term 2</option>
                      <option value="Term 3">Term 3</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowEditTeacher(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={updatingTeacher}>
                    {updatingTeacher ? "Updating..." : "Update Teacher"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1060 }} onClick={() => !processingAction && setShowConfirmModal(false)}>
          <div className="modal-dialog modal-dialog-centered modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-body text-center py-4">
                <div className="mb-3">
                  <div 
                    className={`rounded-circle mx-auto d-flex align-items-center justify-content-center ${confirmAction.type === "deactivate" ? "bg-danger" : "bg-success"} bg-opacity-10`}
                    style={{ width: 60, height: 60 }}
                  >
                    <span style={{ fontSize: 30 }}>{confirmAction.type === "deactivate" ? "🚫" : "✅"}</span>
                  </div>
                </div>
                <h5 className="fw-bold mb-2">
                  {confirmAction.type === "deactivate" ? "Deactivate Teacher?" : "Activate Teacher?"}
                </h5>
                <p className="text-muted small mb-4">
                  {confirmAction.type === "deactivate" 
                    ? `Are you sure you want to deactivate ${confirmAction.teacher.full_name}? They will not be able to log in.`
                    : `Are you sure you want to activate ${confirmAction.teacher.full_name}?`}
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button 
                    onClick={() => setShowConfirmModal(false)} 
                    className="btn btn-outline-secondary"
                    disabled={processingAction}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmAction} 
                    className={`btn ${confirmAction.type === "deactivate" ? "btn-danger" : "btn-success"}`}
                    disabled={processingAction}
                  >
                    {processingAction ? "Processing..." : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1060 }} onClick={() => setShowSuccessModal(false)}>
          <div className="modal-dialog modal-dialog-centered modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-body text-center py-4">
                <div className="mb-3">
                  <div 
                    className="rounded-circle bg-success bg-opacity-10 mx-auto d-flex align-items-center justify-content-center"
                    style={{ width: 60, height: 60 }}
                  >
                    <span style={{ fontSize: 30 }}>✅</span>
                  </div>
                </div>
                <p className="text-dark mb-4">{successMessage}</p>
                <button onClick={() => setShowSuccessModal(false)} className="btn btn-primary">
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/*  Grade Requests Panel (Admin)  */
function AdminRequestsPanel({ role }: { role?: string }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [termConfig, setTermConfig] = useState<{ term: string; is_open: number }[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  function reload() {
    const token = localStorage.getItem("inform_admin_token");
    if (!token) return;
    const endpoint = role === "registrar"
      ? `${API_BASE}/api/grade-requests/registrar`
      : `${API_BASE}/api/grade-requests/principal`;
    fetch(endpoint, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.requests) setRequests(data.requests); })
      .catch(() => {});
    fetch(`${API_BASE}/api/grade-requests/config`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { 
        console.log('Config fetched:', data);
        if (data?.config) {
          console.log('Setting termConfig to:', data.config);
          setTermConfig(data.config);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch config:', err);
      });
  }

  useEffect(() => {
    reload();
    const interval = setInterval(reload, 15000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // -- Term controls (principal only) --------------------------
  function toggleTerm(term: string, open: boolean) {
    const token = localStorage.getItem("inform_admin_token");
    if (!token) { showToast("Session expired. Please log in again."); return; }
    
    // Optimistically update UI
    setTermConfig(prev => prev.map(c => c.term === term ? { ...c, is_open: open ? 1 : 0 } : c));
    
    // Use the grade-requests endpoints (for Grade Request system, not Grade Submission)
    fetch(`${API_BASE}/api/grade-requests/principal/${open ? "open" : "close"}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ term }),
    })
      .then(r => {
        return r.ok ? r.json() : Promise.reject(r.status);
      })
      .then((data) => { 
        showToast(open ? `${term} opened.` : `${term} closed.`); 
        reload(); 
      })
      .catch((err) => {
        console.error('toggleTerm error:', err);
        // Revert on error
        setTermConfig(prev => prev.map(c => c.term === term ? { ...c, is_open: open ? 0 : 1 } : c));
        showToast("Failed to update term.");
      });
  }

  // -- Registrar actions ----------------------------------------
  function sendToPrincipal(id: number) {
    const token = localStorage.getItem("inform_admin_token");
    if (!token) return;
    fetch(`${API_BASE}/api/grade-requests/registrar/${id}/send-to-principal`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify({}),
    })
      .then(r => r.ok ? r.json() : null)
      .then(() => { reload(); showToast("Sent to Principal for approval."); })
      .catch(() => showToast("Failed."));
  }

  function releaseToTeacher(id: number) {
    const token = localStorage.getItem("inform_admin_token");
    if (!token) return;
    fetch(`${API_BASE}/api/grade-requests/registrar/${id}/release`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify({}),
    })
      .then(r => r.ok ? r.json() : null)
      .then(() => { reload(); showToast("Released back to Teacher."); })
      .catch(() => showToast("Failed."));
  }

  // -- Principal actions ----------------------------------------
  function approveRequest(id: number) {
    const token = localStorage.getItem("inform_admin_token");
    if (!token) return;
    fetch(`${API_BASE}/api/grade-requests/principal/${id}/approve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify({}),
    })
      .then(r => r.ok ? r.json() : null)
      .then(() => { reload(); showToast("Grade approved."); })
      .catch(() => showToast("Failed to approve."));
  }

  function rejectRequest(id: number) {
    const token = localStorage.getItem("inform_admin_token");
    if (!token) return;
    const reason = prompt("Reason for rejection (required):") || "";
    if (!reason.trim()) { showToast("Rejection reason is required."); return; }
    fetch(`${API_BASE}/api/grade-requests/principal/${id}/reject`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ rejection_reason: reason }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(() => { reload(); showToast("Grade request rejected."); })
      .catch(() => showToast("Failed."));
  }

  function badgeClass(status: string) {
    if (status === "released_to_student") return "bg-success text-white";
    if (status === "rejected") return "bg-danger-subtle text-danger border border-danger-subtle";
    if (status === "student_requested") return "bg-warning-subtle text-warning border border-warning-subtle";
    if (status === "principal_approved" || status === "registrar_released") return "bg-success-subtle text-success border border-success-subtle";
    return "bg-primary-subtle text-primary border border-primary-subtle";
  }

  function statusText(status: string) {
    const map: Record<string, string> = {
      student_requested: "Requested", registrar_review: "Registrar Review",
      principal_review: "Principal Review", principal_approved: "Approved",
      registrar_released: "Registrar Released", released_to_student: "Released", rejected: "Rejected",
    };
    return map[status] || status;
  }

  const forReview = role === "registrar"
    ? requests.filter(r => r.status === "registrar_review")
    : requests.filter(r => r.status === "principal_review");
  const approved   = requests.filter(r => r.status === "principal_approved");
  const released   = requests.filter(r => ["registrar_released", "released_to_student"].includes(r.status));
  const rejected   = requests.filter(r => r.status === "rejected");
  const other      = requests.filter(r => !["registrar_review","principal_review","principal_approved","registrar_released","released_to_student","rejected"].includes(r.status));

  return (
    <div className="d-flex flex-column gap-4">
      {toast && (
        <div className="position-fixed bottom-0 end-0 m-4 alert alert-dark shadow-lg rounded-3 py-2 px-3 d-flex align-items-center gap-2"
          style={{ zIndex: 9999, fontSize: 13, minWidth: 280, animation: "fadeInUp 0.3s ease" }}>{toast}</div>
      )}

      <div className="d-flex align-items-start justify-content-between gap-3">
        <div>
          <h2 className="fw-black fs-4 text-dark mb-0">Grade Requests</h2>
          <p className="text-muted small mb-0">
            {role === "registrar" ? "Review teacher-submitted grades and forward to Principal" : "Approve or reject grade requests forwarded by the Registrar"}
          </p>
        </div>
        <button onClick={reload} className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"><Icon name="refresh" size={14} /> Refresh</button>
      </div>

      {/* Term controls � principal only */}
      {role === "principal" && (
        <div>
          <h3 className="fw-bold small text-dark mb-3 d-flex align-items-center gap-2"><Icon name="calendar" size={14} /> Grade Request Window</h3>
          <div className="row g-3">
            {["Term 1", "Term 2", "Term 3"].map(term => {
              const cfg = termConfig.find(c => c.term === term);
              const isOpen = !!cfg?.is_open;
              return (
                <div key={term} className="col-12 col-md-4">
                  <div className="card border-0 shadow-sm rounded-3" style={{ borderLeft: isOpen ? "4px solid #10b981" : "4px solid #e2e8f0" }}>
                    <div className="card-body p-3 d-flex align-items-center justify-content-between gap-3">
                      <div>
                        <div className="fw-bold text-dark small">{term}</div>
                        <span className={`badge mt-1 d-inline-flex align-items-center gap-1 ${isOpen ? "bg-success text-white" : "bg-secondary-subtle text-secondary border border-secondary-subtle"}`}>
                          {isOpen ? <><Icon name="unlock" size={10} /> Open</> : <><Icon name="lock" size={10} /> Closed</>}
                        </span>
                      </div>
                      <button onClick={() => toggleTerm(term, !isOpen)} className={`btn btn-sm ${isOpen ? "btn-outline-danger" : "btn-success"}`}>
                        {isOpen ? "Close" : "Open"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="row g-3">
        {[
          { label: role === "registrar" ? "Awaiting Review" : "Awaiting Approval", value: forReview.length, cls: "bg-warning-subtle border-warning-subtle text-warning" },
          { label: role === "registrar" ? "Sent to Principal" : "Approved",        value: approved.length,  cls: "bg-success-subtle border-success-subtle text-success"  },
          { label: "Released to Students",                                           value: released.length,  cls: "bg-primary-subtle border-primary-subtle text-primary"  },
          { label: "Other",                                                          value: other.length + rejected.length, cls: "bg-secondary-subtle border-secondary-subtle text-secondary" },
        ].map(s => (
          <div key={s.label} className="col-6 col-lg-3">
            <div className={`card border rounded-3 shadow-sm ${s.cls}`}>
              <div className="card-body p-3 text-center">
                <div className="small mb-1">{s.label}</div>
                <div className="fw-black fs-3">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grades awaiting action */}
      {forReview.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3 d-flex align-items-center gap-2">
            <Icon name="grades" size={14} />
            {role === "registrar" ? "Grades Awaiting Your Review" : "Grades Awaiting Your Approval"}
          </h3>
          <div className="d-flex flex-column gap-3">
            {forReview.map((req: any) => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3" style={{ border: "1.5px solid #bfdbfe" }}>
                <div className="card-body p-4">
                  <div className="row g-3 align-items-start mb-3">
                    <div className="col-12 col-sm-6">
                      <div className="fw-bold text-dark mb-1">{req.student_name || req.student}</div>
                      <div className="text-muted small">{req.subject_name || req.subject} - {req.term}</div>
                      <div className="text-muted small">Teacher: {req.teacher_name || req.teacher}</div>
                      {req.registrar_note && <div className="text-muted small fst-italic">Note: {req.registrar_note}</div>}
                    </div>
                    <div className="col-12 col-sm-6">
                      <div className="rounded-3 p-3 bg-success-subtle border border-success-subtle text-center">
                        <div className="text-muted small mb-1">Submitted Grade</div>
                        <div className="fw-black text-success" style={{ fontSize: 40 }}>
                          {req.score != null ? (Number(req.score) >= 97 ? "A+" : Number(req.score) >= 93 ? "A" : Number(req.score) >= 90 ? "A-" : Number(req.score) >= 87 ? "B+" : Number(req.score) >= 83 ? "B" : Number(req.score) >= 80 ? "B-" : Number(req.score) >= 77 ? "C+" : Number(req.score) >= 73 ? "C" : Number(req.score) >= 70 ? "C-" : Number(req.score) >= 65 ? "D" : "F") : "-"}
                        </div>
                        <div className="fw-semibold text-success small">{req.score != null ? `${req.score}%` : ""}</div>
                        {req.remarks && <div className="text-muted mt-1 fst-italic" style={{ fontSize: 11 }}>&ldquo;{req.remarks}&rdquo;</div>}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    {role === "registrar"
                      ? <button onClick={() => sendToPrincipal(req.id)} className="btn btn-success flex-grow-1 d-inline-flex align-items-center justify-content-center gap-1"><Icon name="send" size={14} /> Send to Principal</button>
                      : <button onClick={() => approveRequest(req.id)} className="btn btn-success flex-grow-1 d-inline-flex align-items-center justify-content-center gap-1"><Icon name="check" size={14} /> Verify &amp; Approve</button>
                    }
                    <button onClick={() => rejectRequest(req.id)} className="btn btn-outline-danger">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Principal approved � registrar releases to teacher */}
      {role === "registrar" && approved.length > 0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3 d-flex align-items-center gap-2"><Icon name="checkCircle" size={14} /> Principal Approved - Release to Teacher</h3>
          <div className="d-flex flex-column gap-2">
            {approved.map((req: any) => (
              <div key={req.id} className="card border-0 shadow-sm rounded-3" style={{ border: "1.5px solid #bbf7d0" }}>
                <div className="card-body p-4 d-flex align-items-center gap-3">
                  <div className="flex-grow-1">
                    <div className="fw-bold text-dark small">{req.student_name || req.student} - {req.subject_name || req.subject}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>Score: {req.score} - Approved by Principal</div>
                  </div>
                  <button onClick={() => releaseToTeacher(req.id)} className="btn btn-success btn-sm d-inline-flex align-items-center gap-1"><Icon name="send" size={12} /> Release to Teacher</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* All requests log */}
      <div>
        <h3 className="fw-bold small text-dark mb-3 d-flex align-items-center gap-2"><Icon name="file" size={14} /> All Requests Log</h3>
        {requests.length === 0
          ? <div className="card border-0 shadow-sm rounded-3"><div className="card-body p-4 text-center text-muted small">No grade requests yet.</div></div>
          : (
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
                  {requests.map((req: any) => (
                    <tr key={req.id}>
                      <td className="ps-4 small fw-medium text-dark">{req.student_name || req.student}</td>
                      <td className="d-none d-sm-table-cell small text-muted">{req.teacher_name || req.teacher}</td>
                      <td className="d-none d-lg-table-cell small text-muted">{req.subject_name || req.subject}</td>
                      <td className="d-none d-lg-table-cell small text-muted">{req.term}</td>
                      <td><span className={`badge ${badgeClass(req.status)}`} style={{ fontSize: 10 }}>{statusText(req.status)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/*  Admin Document Management Panel  */
function AdminDocumentsPanel() {
  const [docs, setDocs] = useState<typeof allDocumentRequests>([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState<number | null>(null);
  const [releaseDate, setReleaseDate] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/api/admin/documents`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.documents?.length) {
          setDocs(data.documents.map((d: {
            id: number; student_name: string; document_type: string;
            status: string; created_at: string; expected_release_date: string | null;
            rejection_reason?: string;
          }) => ({
            id: d.id,
            student: d.student_name,
            type: d.document_type,
            status: d.status,
            requestedAt: new Date(d.created_at).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" }),
            teacher: "",
            grade: 0,
            track: "",
            releaseDate: d.expected_release_date,
            approvedAt: d.status === "approved" ? d.expected_release_date : null,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Rejection modal state
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonOther, setRejectReasonOther] = useState("");

  const REJECT_REASONS = [
    "Incomplete requirements",
    "Document type not available",
    "Outstanding balance  fees not cleared",
    "Enrollment not yet confirmed",
    "Duplicate request already on file",
    "Student record under review",
    "Other (specify below)",
  ];

  function confirmApprove(id: number) {
  if (!releaseDate) return;
  const formatted = new Date(releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  
  // Optimistic UI update
  setDocs(prev => prev.map(d => d.id === id ? { ...d, status: "approved", approvedAt: new Date().toLocaleDateString(), releaseDate: formatted } : d));
  setApproving(null);
  setReleaseDate("");

  // Real API call
  const token = localStorage.getItem("inform_token");
  if (!token) return;
  fetch(`${API_BASE}/api/admin/documents/${id}/approve`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ expected_release_date: releaseDate }),
  }).catch(() => {});
}

  function confirmReject() {
  if (!rejecting) return;
  const finalReason = rejectReason === "Other (specify below)"
    ? rejectReasonOther.trim() || "No reason provided"
    : rejectReason;
  if (!finalReason) return;
  const id = rejecting;
  
  // Optimistic UI update
  setDocs(prev => prev.map(d =>
    d.id === id
      ? { ...d, status: "rejected", rejectionReason: finalReason, rejectedAt: new Date().toLocaleDateString() }
      : d
  ));
  setRejecting(null);
  setRejectReason("");
  setRejectReasonOther("");

  // Real API call
  const token = localStorage.getItem("inform_token");

  if (!token) return;
  fetch(`${API_BASE}/api/admin/documents/${id}/reject`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ rejection_reason: finalReason }),
  }).catch(() => {});

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
                    <p className="text-muted small mb-0">{doc?.student}  <strong>{doc?.type}</strong></p>
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
                    className="btn btn-danger flex-grow-1 fw-bold d-inline-flex align-items-center justify-content-center gap-1"><Icon name="x" size={14} /> Confirm Rejection</button>
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
          { label: "Pending",  value: pending.length,  cls: "bg-warning-subtle border-warning-subtle text-warning" },
          { label: "Approved", value: approved.length, cls: "bg-success-subtle border-success-subtle text-success" },
          { label: "Rejected", value: rejected.length, cls: "bg-danger-subtle border-danger-subtle text-danger"   },
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
                <React.Fragment key={String(doc.id)}>
                  <tr key={String(doc.id)}>
                    <td className="ps-4 small fw-medium text-dark">{String(doc.student)}</td>
                    <td className="d-none d-sm-table-cell text-muted small">{String(doc.type)}</td>
                    <td className="d-none d-lg-table-cell text-muted small">{String(doc.teacher)}</td>
                    <td className="d-none d-lg-table-cell">
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: 11 }}>
                        {String(doc.track)}  Grade {String(doc.grade)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        doc.status === "pending"  ? "bg-warning-subtle text-warning border border-warning-subtle" :
                        doc.status === "approved" ? "bg-success-subtle text-success border border-success-subtle" :
                        "bg-danger-subtle text-danger border border-danger-subtle"
                      }`}>
                        {doc.status === "pending" ? "Pending" : doc.status === "approved" ? "Approved" : "Rejected"}
                      </span>
                      {doc.status === "rejected" && (doc as typeof doc & { rejectionReason?: string }).rejectionReason && (
                        <div className="text-danger mt-1" style={{ fontSize: 10 }}>
                          Reason: {(doc as typeof doc & { rejectionReason?: string }).rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="d-none d-md-table-cell text-muted small">
                      {doc.releaseDate
                        ? <span className="badge bg-info-subtle text-info border border-info-subtle"> {doc.releaseDate}</span>
                        : <span className="text-muted"></span>
                      }
                    </td>
                    <td className="text-end pe-4">
                      {doc.status === "pending" && (
                        <div className="d-flex gap-1 justify-content-end">
                          <button onClick={() => { setApproving(doc.id); setReleaseDate(""); }} className="btn btn-success btn-sm d-inline-flex align-items-center gap-1" style={{ fontSize: 11 }}><Icon name="check" size={11} /> Approve</button>
                          <button onClick={() => { setRejecting(doc.id); setRejectReason(""); setRejectReasonOther(""); }} className="btn btn-danger btn-sm d-inline-flex align-items-center gap-1" style={{ fontSize: 11 }}><Icon name="x" size={11} /> Reject</button>
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
                            <div className="fw-semibold small text-dark mb-1"> Set Release Date for <span className="text-success">{doc.student}</span></div>
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

/*  Scheduling Panel  */

// Timetable View Component
function TimetableView({ filters, setFilters, showToast }: any) {
  const [timetableData, setTimetableData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScheduleDetails, setSelectedScheduleDetails] = useState<any>(null);

  const getCurrentSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  useEffect(() => {
    loadTimetable();
  }, [filters]);

  async function loadTimetable() {
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.term) params.append('term', filters.term);
      if (filters.track) params.append('track', filters.track);
      if (filters.strand) params.append('strand', filters.strand);
      if (filters.room) params.append('room', filters.room);
      params.append('school_year', getCurrentSchoolYear());

      const response = await fetch(
        `${API_BASE}/api/admin/scheduling/timetable?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTimetableData(data);
      } else {
        showToast("Failed to load timetable");
      }
    } catch (err) {
      showToast("Failed to load timetable");
    } finally {
      setLoading(false);
    }
  }

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timeSlots = [
    "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  function getSchedulesForDayAndTime(day: string, timeSlot: string) {
    if (!timetableData?.schedules) return [];
    
    return timetableData.schedules.filter((schedule: any) => {
      if (schedule.day !== day) return false;
      
      const scheduleStart = schedule.time_start.slice(0, 5);
      const scheduleEnd = schedule.time_end.slice(0, 5);
      const slotEnd = `${(parseInt(timeSlot.slice(0, 2)) + 1).toString().padStart(2, '0')}:00`;
      
      return scheduleStart <= timeSlot && scheduleEnd > timeSlot;
    });
  }

  return (
    <div className="card border-0 shadow-sm rounded-3">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold fs-5 mb-1">Weekly Timetable</h3>
            <p className="text-muted small mb-0">View all schedules in calendar format</p>
          </div>
          
          <button className="btn btn-sm btn-outline-primary" onClick={loadTimetable}>
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <label className="form-label small fw-semibold">Term</label>
            <select 
              className="form-select form-select-sm"
              value={filters.term}
              onChange={(e) => setFilters({ ...filters, term: e.target.value })}
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-semibold">Track</label>
            <select 
              className="form-select form-select-sm"
              value={filters.track}
              onChange={(e) => setFilters({ ...filters, track: e.target.value, strand: "" })}
            >
              <option value="">All Tracks</option>
              <option value="Academic Track">Academic Track</option>
              <option value="TechPro Track">TechPro Track</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-semibold">Strand</label>
            <select 
              className="form-select form-select-sm"
              value={filters.strand}
              onChange={(e) => setFilters({ ...filters, strand: e.target.value })}
              disabled={!filters.track}
            >
              <option value="">All Strands</option>
              {filters.track === "Academic Track" && (
                <>
                  <option value="STEM">STEM</option>
                  <option value="HUMMS">HUMMS</option>
                  <option value="ABM">ABM</option>
                  <option value="GAS">GAS</option>
                </>
              )}
              {filters.track === "TechPro Track" && (
                <>
                  <option value="ICT">ICT</option>
                  <option value="Cookery">Cookery</option>
                </>
              )}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-semibold">Room</label>
            <input 
              type="text" 
              className="form-control form-control-sm"
              placeholder="Filter by room..."
              value={filters.room}
              onChange={(e) => setFilters({ ...filters, room: e.target.value })}
            />
          </div>
        </div>

        {/* Conflicts Warning */}
        {timetableData?.conflicts && timetableData.conflicts.length > 0 && (
          <div className="alert alert-warning mb-4">
            <strong>{timetableData.conflicts.length} Room Conflict(s) Detected:</strong>
            <ul className="mb-0 mt-2 small">
              {timetableData.conflicts.map((conflict: any, idx: number) => (
                <li key={idx}>
                  <strong>{conflict.room}</strong> on <strong>{conflict.day}</strong>: 
                  {` ${conflict.schedule1.subject} (${conflict.schedule1.teacher}) `}
                  conflicts with 
                  {` ${conflict.schedule2.subject} (${conflict.schedule2.teacher})`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
            <p className="text-muted mt-2">Loading timetable...</p>
          </div>
        ) : !timetableData || timetableData.total === 0 ? (
          <div className="text-center py-5 text-muted">
            <p>No schedules found for the selected filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '80px', fontSize: '0.75rem' }} className="text-center">Time</th>
                  {daysOfWeek.map(day => (
                    <th key={day} style={{ fontSize: '0.75rem', minWidth: '150px' }} className="text-center fw-bold">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(timeSlot => (
                  <tr key={timeSlot}>
                    <td className="text-center fw-semibold small text-muted" style={{ fontSize: '0.75rem' }}>
                      {timeSlot}
                    </td>
                    {daysOfWeek.map(day => {
                      const schedules = getSchedulesForDayAndTime(day, timeSlot);
                      return (
                        <td key={`${day}-${timeSlot}`} className="p-1" style={{ verticalAlign: 'top' }}>
                          {schedules.map((schedule: any) => (
                            <div 
                              key={schedule.id}
                              className="card mb-1 border cursor-pointer"
                              style={{ 
                                fontSize: '0.7rem',
                                backgroundColor: schedule.enrolled_count >= schedule.max_capacity * 0.9 ? '#fef3cd' : '#d1e7dd'
                              }}
                              onClick={() => setSelectedScheduleDetails(schedule)}
                            >
                              <div className="card-body p-2">
                                <div className="fw-bold text-truncate">{schedule.subject_name}</div>
                                <div className="text-muted text-truncate" style={{ fontSize: '0.65rem' }}>
                                  {schedule.room} • {schedule.teacher_name}
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                                  {schedule.time_start.slice(0,5)}-{schedule.time_end.slice(0,5)}
                                </div>
                                <div className="mt-1">
                                  <span className={`badge ${schedule.enrolled_count >= schedule.max_capacity * 0.9 ? 'bg-warning' : 'bg-success'}`} 
                                    style={{ fontSize: '0.6rem' }}>
                                    {schedule.enrolled_count}/{schedule.max_capacity}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Schedule Details Modal */}
        {selectedScheduleDetails && (
          <>
            <div className="modal-backdrop fade show" onClick={() => setSelectedScheduleDetails(null)} />
            <div className="modal fade show d-block" tabIndex={-1}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">Schedule Details</h5>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedScheduleDetails(null)} />
                  </div>
                  <div className="modal-body">
                    <table className="table table-sm">
                      <tbody>
                        <tr><th>Subject:</th><td>{selectedScheduleDetails.subject_name}</td></tr>
                        <tr><th>Teacher:</th><td>{selectedScheduleDetails.teacher_name}</td></tr>
                        <tr><th>Room:</th><td>{selectedScheduleDetails.room}</td></tr>
                        <tr><th>Day:</th><td>{selectedScheduleDetails.day}</td></tr>
                        <tr><th>Time:</th><td>{selectedScheduleDetails.time_start.slice(0,5)} - {selectedScheduleDetails.time_end.slice(0,5)}</td></tr>
                        <tr><th>Track/Strand:</th><td>{selectedScheduleDetails.track} / {selectedScheduleDetails.strand}</td></tr>
                        <tr><th>Term:</th><td>{selectedScheduleDetails.term}</td></tr>
                        <tr><th>Capacity:</th><td>{selectedScheduleDetails.enrolled_count} / {selectedScheduleDetails.max_capacity}</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setSelectedScheduleDetails(null)}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Submitted Grades List Component
function SubmittedGradesList() {
  const [submissions, setSubmissions] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  
  // Filters
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterSubjectStrand, setFilterSubjectStrand] = useState("");
  
  // Modal state
  const [viewingSubmission, setViewingSubmission] = useState<any>(null);
  const [students, setStudents] = useState<Array<any>>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, [selectedTerm]);

  async function loadSubmissions() {
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/grade-submissions?term=${selectedTerm}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setLoading(false);
    }
  }

  async function viewDetails(submission: any) {
    setViewingSubmission(submission);
    setLoadingStudents(true);
    
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    try {
      // Use the admin endpoint to get submission details
      const response = await fetch(
        `${API_BASE}/api/admin/grade-submissions/${submission.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStudents(data.grades || []);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoadingStudents(false);
    }
  }

  function closeModal() {
    setViewingSubmission(null);
    setStudents([]);
  }

  // Get unique values for filters
  const teachers = Array.from(new Set(submissions.map(s => s.teacher_name))).sort();
  
  // Combine subject and strand for filter options
  const subjectStrands = Array.from(new Set(
    submissions.map(s => {
      const subject = s.display_subject_name;
      const strand = s.display_strand;
      return strand ? `${subject} - ${strand}` : subject;
    })
  )).sort();

  // Apply filters
  const filteredSubmissions = submissions.filter(sub => {
    if (filterTeacher && sub.teacher_name !== filterTeacher) return false;
    if (filterSubjectStrand) {
      const subjectStrand = sub.display_strand 
        ? `${sub.display_subject_name} - ${sub.display_strand}`
        : sub.display_subject_name;
      if (subjectStrand !== filterSubjectStrand) return false;
    }
    return true;
  });

  return (
    <>
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold mb-1">Submitted Grades</h3>
              <p className="text-muted small mb-0">View all grade submissions from teachers</p>
            </div>
            <select
              className="form-select form-select-sm"
              style={{ width: "auto" }}
              value={selectedTerm}
              onChange={e => setSelectedTerm(e.target.value)}
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>

          {/* Filters */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize: 11 }}>
                Filter by Teacher
              </label>
              <select
                className="form-select form-select-sm"
                value={filterTeacher}
                onChange={e => setFilterTeacher(e.target.value)}
              >
                <option value="">All Teachers</option>
                {teachers.map(teacher => (
                  <option key={teacher} value={teacher}>{teacher}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize: 11 }}>
                Filter by Subject & Track/Strand
              </label>
              <select
                className="form-select form-select-sm"
                value={filterSubjectStrand}
                onChange={e => setFilterSubjectStrand(e.target.value)}
              >
                <option value="">All Subjects & Tracks/Strands</option>
                {subjectStrands.map(ss => (
                  <option key={ss} value={ss}>{ss}</option>
                ))}
              </select>
            </div>
          </div>

          {(filterTeacher || filterSubjectStrand) && (
            <div className="mb-3">
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setFilterTeacher("");
                  setFilterSubjectStrand("");
                }}
              >
                Clear Filters
              </button>
              <span className="text-muted small ms-2">
                Showing {filteredSubmissions.length} of {submissions.length} submissions
              </span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary spinner-border-sm me-2" />
              <span className="text-muted small">Loading submissions...</span>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center text-muted small py-4">
              {submissions.length === 0 
                ? `No grade submissions for ${selectedTerm} yet.`
                : 'No submissions match the selected filters.'}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="small fw-semibold text-uppercase">Teacher</th>
                    <th className="small fw-semibold text-uppercase">Subject</th>
                    <th className="small fw-semibold text-uppercase text-center">Students</th>
                    <th className="small fw-semibold text-uppercase text-center">Status</th>
                    <th className="small fw-semibold text-uppercase">Submitted</th>
                    <th className="small fw-semibold text-uppercase text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub.id}>
                      <td className="small">{sub.teacher_name}</td>
                      <td className="small">
                        {sub.display_subject_name}
                        {sub.display_strand && <span className="text-muted"> - {sub.display_strand}</span>}
                      </td>
                      <td className="small text-center">{sub.total_students}</td>
                      <td className="text-center">
                        <span className={`badge ${
                          sub.status === 'approved' ? 'bg-success' : 
                          sub.status === 'submitted' ? 'bg-primary' : 
                          sub.status === 'returned' ? 'bg-warning' : 'bg-secondary'
                        }`}>
                          {sub.status === 'approved' ? '✅ Submitted' : 
                           sub.status === 'submitted' ? '📤 Pending' : 
                           sub.status === 'returned' ? '↩️ Returned' : sub.status}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {new Date(sub.submitted_at).toLocaleDateString()} {new Date(sub.submitted_at).toLocaleTimeString()}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => viewDetails(sub)}
                        >
                          👁️ View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {viewingSubmission && (
        <>
          <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title fw-bold mb-1">Grade Submission Details</h5>
                    <p className="text-muted small mb-0">
                      {viewingSubmission.display_subject_name}
                      {viewingSubmission.display_strand && ` - ${viewingSubmission.display_strand}`}
                      {' · '}
                      {viewingSubmission.term}
                    </p>
                  </div>
                  <button type="button" className="btn-close" onClick={closeModal} />
                </div>
                <div className="modal-body">
                  {/* Submission Info */}
                  <div className="card bg-light border-0 mb-4">
                    <div className="card-body p-3">
                      <div className="row g-3">
                        <div className="col-6">
                          <div className="text-muted small">Teacher</div>
                          <div className="fw-semibold">{viewingSubmission.teacher_name}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted small">Total Students</div>
                          <div className="fw-semibold">{viewingSubmission.total_students}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted small">Submitted At</div>
                          <div className="fw-semibold">
                            {new Date(viewingSubmission.submitted_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted small">Status</div>
                          <div>
                            <span className={`badge ${
                              viewingSubmission.status === 'approved' ? 'bg-success' : 
                              viewingSubmission.status === 'submitted' ? 'bg-primary' : 
                              viewingSubmission.status === 'returned' ? 'bg-warning' : 'bg-secondary'
                            }`}>
                              {viewingSubmission.status === 'approved' ? 'Submitted' : 
                               viewingSubmission.status === 'submitted' ? 'Pending' : 
                               viewingSubmission.status === 'returned' ? 'Returned' : viewingSubmission.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Students List */}
                  {loadingStudents ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary spinner-border-sm me-2" />
                      <span className="text-muted small">Loading students...</span>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="text-center text-muted small py-4">
                      No student data available
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="small fw-semibold">Student ID</th>
                            <th className="small fw-semibold">Name</th>
                            <th className="small fw-semibold">Pathway</th>
                            <th className="small fw-semibold text-center">Grade (%)</th>
                            <th className="small fw-semibold text-center">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((student) => {
                            const grade = student.percentage !== null ? parseFloat(student.percentage) : null;
                            const passed = grade !== null && grade >= 80; // Correct passing grade is 80+
                            
                            return (
                              <tr key={student.student_id}>
                                <td className="small">{student.student_id}</td>
                                <td className="small">{student.student_name}</td>
                                <td className="small text-muted">{student.pathway}</td>
                                <td className="small text-center">
                                  <span className={`fw-semibold ${
                                    grade === null ? 'text-muted' : 
                                    passed ? 'text-success' : 'text-danger'
                                  }`}>
                                    {grade !== null ? grade.toFixed(2) : '-'}
                                  </span>
                                </td>
                                <td className="text-center">
                                  {grade !== null && (
                                    <span className={`badge ${passed ? 'bg-success' : 'bg-danger'}`}>
                                      {passed ? 'Passed' : 'Failed'}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" onClick={closeModal} />
        </>
      )}
    </>
  );
}

// Statistics Dashboard Component
function StatisticsDashboard({ filters, setFilters, showToast }: any) {
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [filters]);

  async function loadStatistics() {
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.term) params.append('term', filters.term);
      if (filters.school_year) params.append('school_year', filters.school_year);

      const response = await fetch(
        `${API_BASE}/api/admin/scheduling/statistics?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics);
      } else {
        showToast("❌ Failed to load statistics");
      }
    } catch (err) {
      showToast("❌ Failed to load statistics");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card border-0 shadow-sm rounded-3">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold fs-5 mb-1"> Scheduling Statistics</h3>
            <p className="text-muted small mb-0">Overview and analytics</p>
          </div>
          
          <button className="btn btn-sm btn-outline-primary" onClick={loadStatistics}>
             Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label small fw-semibold">Term</label>
            <select 
              className="form-select form-select-sm"
              value={filters.term}
              onChange={(e) => setFilters({ ...filters, term: e.target.value })}
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold">School Year</label>
            <input 
              type="text" 
              className="form-control form-control-sm"
              placeholder="e.g., 2026-2027"
              value={filters.school_year}
              onChange={(e) => setFilters({ ...filters, school_year: e.target.value })}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
            <p className="text-muted mt-2">Loading statistics...</p>
          </div>
        ) : !statistics ? (
          <div className="text-center py-5 text-muted">
            <p>No statistics available.</p>
          </div>
        ) : (
          <div className="row g-4">
            {/* Overview Cards */}
            <div className="col-md-4">
              <div className="card border-0 bg-secondary bg-opacity-10">
                <div className="card-body text-center">
                  <div className="display-4 fw-bold text-primary">{statistics.total_schedules}</div>
                  <div className="text-muted">Total Schedules</div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 bg-success bg-opacity-10">
                <div className="card-body text-center">
                  <div className="display-4 fw-bold text-success">
                    {statistics.teachers.with_schedules}/{statistics.teachers.total}
                  </div>
                  <div className="text-muted">Teachers Assigned</div>
                  <div className="small text-success fw-bold">{statistics.teachers.percentage}%</div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 bg-info bg-opacity-10">
                <div className="card-body text-center">
                  <div className="display-4 fw-bold text-info">
                    {statistics.students.enrolled}/{statistics.students.total_approved}
                  </div>
                  <div className="text-muted">Students Enrolled</div>
                  <div className="small text-info fw-bold">{statistics.students.percentage}%</div>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white">
                  <h6 className="mb-0 fw-semibold">Room Utilization</h6>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Rooms Used:</span>
                    <span className="fw-bold">{statistics.rooms.utilized}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Capacity Utilization:</span>
                    <span className="fw-bold">{statistics.capacity.utilization_percentage}%</span>
                  </div>
                  <div className="progress mt-2" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${statistics.capacity.utilization_percentage}%` }}
                    />
                  </div>
                  <small className="text-muted">
                    {statistics.capacity.enrolled} / {statistics.capacity.total} total seats
                  </small>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white">
                  <h6 className="mb-0 fw-semibold">Conflicts</h6>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Room Conflicts:</span>
                    <span className={`badge ${statistics.conflicts.room_conflicts > 0 ? 'bg-danger' : 'bg-success'} fs-6`}>
                      {statistics.conflicts.room_conflicts}
                    </span>
                  </div>
                  {statistics.conflicts.room_conflicts > 0 && (
                    <div className="alert alert-warning mt-3 mb-0 small">
                       Please review the timetable to resolve conflicts
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Track Distribution */}
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white">
                  <h6 className="mb-0 fw-semibold">Track Distribution</h6>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>Track</th>
                          <th className="text-center">Schedules</th>
                          <th className="text-center">Total Students</th>
                          <th className="text-center">Avg. Class Size</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statistics.track_distribution.map((track: any) => (
                          <tr key={track.track}>
                            <td className="fw-semibold">{track.track}</td>
                            <td className="text-center">{track.schedule_count}</td>
                            <td className="text-center">{track.total_students}</td>
                            <td className="text-center">
                              {track.schedule_count > 0 
                                ? Math.round(track.total_students / track.schedule_count) 
                                : 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SchedulingPanel() {
  const [activeTab, setActiveTab] = useState<"teacher" | "student" | "timetable" | "statistics">("teacher");
  
  // Calculate current school year
  const getCurrentSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 6 ? year : year - 1;
    const endYear = startYear + 1;
    return `${startYear}-${endYear}`;
  };
  
  // Teacher Schedule State
  const [teachers, setTeachers] = useState<any[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("");
  const [teacherFilter, setTeacherFilter] = useState<"all" | "with" | "without">("all");
  const [showAddTeacherSchedule, setShowAddTeacherSchedule] = useState(false);
  const [showViewTeacherSchedules, setShowViewTeacherSchedules] = useState(false);
  const [showEditTeacherSchedule, setShowEditTeacherSchedule] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [teacherSchedules, setTeacherSchedules] = useState<any[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [teacherScheduleForm, setTeacherScheduleForm] = useState({
    subject: "", room: "", day: "", timeStart: "", timeEnd: "", strand: "", track: "Academic Track", term: "Term 1"
  });
  const [saving, setSaving] = useState(false);

  // Student Schedule State
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentFilter, setStudentFilter] = useState<"all" | "scheduled" | "unscheduled">("all");
  const [showEnrollSchedule, setShowEnrollSchedule] = useState(false);
  const [showViewStudentSchedules, setShowViewStudentSchedules] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentSchedules, setStudentSchedules] = useState<any[]>([]);
  const [availableSchedules, setAvailableSchedules] = useState<any[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  
  // Priority 2: Timetable State
  const [timetableData, setTimetableData] = useState<any>(null);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [timetableFilters, setTimetableFilters] = useState({
    term: "Term 1",
    track: "",
    strand: "",
    room: ""
  });

  // Priority 2: Bulk Enrollment State
  const [showBulkEnroll, setShowBulkEnroll] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [bulkEnrollScheduleId, setBulkEnrollScheduleId] = useState<string>("");

  // Priority 2: Statistics State
  const [statistics, setStatistics] = useState<any>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [statisticsFilters, setStatisticsFilters] = useState({
    term: "Term 1",
    school_year: getCurrentSchoolYear()
  });
  
  const [toast, setToast] = useState<string | null>(null);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const academicStrands = ["STEM", "HUMMS", "ABM", "GAS"];
  const techProStrands = ["ICT", "Cookery"];
  const allStrands = [...academicStrands, ...techProStrands];
  const terms = ["Term 1", "Term 2", "Term 3"];

  // Load teachers on mount
  useEffect(() => {
    loadTeachers();
  }, []);

  // Load students when tab changes
  useEffect(() => {
    if (activeTab === "student") {
      loadStudents();
    }
  }, [activeTab]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function loadTeachers() {
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setTeachersLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/scheduling/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setTeachers(data.teachers || []);
      }
    } catch (err) {
      showToast("❌ Failed to load teachers");
    } finally {
      setTeachersLoading(false);
    }
  }

  async function loadStudents() {
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setStudentsLoading(true);
    try {
      // Use the same API as StudentsPanel - gets all enrolled students
      const response = await fetch(`${API_BASE}/api/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        // Load schedule count for each student
        const studentsWithSchedules = await Promise.all(
          data.students.map(async (student: any) => {
            const schedRes = await fetch(`${API_BASE}/api/admin/scheduling/students/${student.student_id}/schedules`, {
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            });
            const schedData = await schedRes.json();
            return {
              student_id: student.student_id,
              full_name: student.full_name,
              profile_picture_url: student.photo_url,  // Backend returns photo_url
              strand: student.pathway || student.strand,
              track: student.pathway && ['STEM', 'HUMMS', 'ABM', 'GAS'].includes(student.pathway) 
                ? 'Academic Track' 
                : student.pathway && ['ICT', 'Cookery'].includes(student.pathway)
                  ? 'TechPro Track'
                  : 'Academic Track',
              term: 'Term 1', // Default term, adjust if needed
              hasSchedule: schedData.total > 0,
              scheduleCount: schedData.total
            };
          })
        );
        setStudents(studentsWithSchedules);
      }
    } catch (err) {
      showToast("❌ Failed to load students");
    } finally {
      setStudentsLoading(false);
    }
  }

  async function handleAddTeacherSchedule() {
    if (!selectedTeacher || !teacherScheduleForm.subject || !teacherScheduleForm.room || 
        !teacherScheduleForm.day || !teacherScheduleForm.timeStart || !teacherScheduleForm.timeEnd ||
        !teacherScheduleForm.strand || !teacherScheduleForm.track || !teacherScheduleForm.term) {
      showToast("❌ Please fill in all fields");
      return;
    }

    // Feature 5: Check for room conflicts
    const conflict = await checkRoomConflict(
      teacherScheduleForm.room,
      teacherScheduleForm.day,
      teacherScheduleForm.timeStart,
      teacherScheduleForm.timeEnd
    );

    if (conflict) {
      const confirmCreate = confirm(
        `⚠️ Room Conflict Detected!\n\n` +
        `${teacherScheduleForm.room} is already occupied on ${teacherScheduleForm.day} at ${teacherScheduleForm.timeStart}-${teacherScheduleForm.timeEnd}\n\n` +
        `Conflicting schedule: ${conflict.subject_name} (${conflict.teacher_name})\n\n` +
        `Do you want to create this schedule anyway?`
      );
      
      if (!confirmCreate) {
        return; // Cancel creation
      }
    }

    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/scheduling/schedules`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          teacher_id: selectedTeacher.id,
          subject_name: teacherScheduleForm.subject,
          room: teacherScheduleForm.room,
          day: teacherScheduleForm.day,
          time_start: teacherScheduleForm.timeStart,
          time_end: teacherScheduleForm.timeEnd,
          track: teacherScheduleForm.track,
          strand: teacherScheduleForm.strand,
          term: teacherScheduleForm.term,
          school_year: getCurrentSchoolYear(),
          max_capacity: 40
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToast("✅ Schedule added successfully");
        setShowAddTeacherSchedule(false);
        setTeacherScheduleForm({ subject: "", room: "", day: "", timeStart: "", timeEnd: "", strand: "", track: "Academic Track", term: "Term 1" });
        loadTeachers(); // Reload to update schedule count
      } else {
        showToast(`❌ ${data.error || "Failed to add schedule"}`);
      }
    } catch (err) {
      showToast("❌ Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleEnrollStudent() {
    if (!selectedStudent || !selectedScheduleId) {
      showToast("❌ Please select a schedule");
      return;
    }

    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/scheduling/schedules/${selectedScheduleId}/enroll`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          student_ids: [selectedStudent.student_id]
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToast("✅ Student enrolled successfully");
        setShowEnrollSchedule(false);
        setSelectedScheduleId("");
        loadStudents(); // Reload to update schedule count
      } else {
        showToast(`❌ ${data.error || "Failed to enroll student"}`);
      }
    } catch (err) {
      showToast("❌ Network error");
    } finally {
      setSaving(false);
    }
  }

  // Priority 2: Bulk Enroll Students
  async function handleBulkEnrollStudents() {
    if (!bulkEnrollScheduleId || selectedStudentIds.length === 0) {
      showToast("❌ Please select a schedule and at least one student");
      return;
    }

    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setSaving(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/scheduling/schedules/${bulkEnrollScheduleId}/enroll-bulk`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            student_ids: selectedStudentIds
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        showToast(`✅ ${data.enrolled} student(s) enrolled successfully${data.skipped > 0 ? ` (${data.skipped} already enrolled)` : ''}`);
        setShowBulkEnroll(false);
        setSelectedStudentIds([]);
        setBulkEnrollScheduleId("");
        loadStudents(); // Reload to update schedule counts
      } else {
        if (data.incompatible) {
          showToast(`❌ Track/Strand mismatch: ${data.incompatible.length} student(s) incompatible`);
        } else {
          showToast(`❌ ${data.error || "Failed to enroll students"}`);
        }
      }
    } catch (err) {
      showToast("❌ Network error");
    } finally {
      setSaving(false);
    }
  }

  async function loadAvailableSchedules(student: any) {
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/scheduling/schedules?track=${encodeURIComponent(student.track)}&strand=${encodeURIComponent(student.strand)}&term=${encodeURIComponent(student.term)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableSchedules(data.schedules || []);
      }
    } catch (err) {
      console.error("Failed to load schedules");
    }
  }

  // Feature 1: Load Teacher's Schedules
  async function loadTeacherSchedules(teacher: any) {
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setSchedulesLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/scheduling/teachers/${teacher.id}/schedules`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTeacherSchedules(data.schedules || []);
      }
    } catch (err) {
      showToast("❌ Failed to load teacher schedules");
    } finally {
      setSchedulesLoading(false);
    }
  }

  // Feature 2: Edit Teacher Schedule
  async function handleEditTeacherSchedule() {
    if (!selectedSchedule) return;

    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setSaving(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/scheduling/schedules/${selectedSchedule.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            subject_name: teacherScheduleForm.subject,
            room: teacherScheduleForm.room,
            day: teacherScheduleForm.day,
            time_start: teacherScheduleForm.timeStart,
            time_end: teacherScheduleForm.timeEnd,
            track: teacherScheduleForm.track,
            strand: teacherScheduleForm.strand,
            term: teacherScheduleForm.term,
          }),
        }
      );

      if (response.ok) {
        showToast("✅ Schedule updated successfully");
        setShowEditTeacherSchedule(false);
        // Keep view modal open and refresh data
        if (selectedTeacher) {
          loadTeacherSchedules(selectedTeacher);
        }
        loadTeachers(); // Refresh teacher list
      } else {
        const error = await response.json();
        showToast(`❌ ${error.error || "Failed to update schedule"}`);
      }
    } catch (err) {
      showToast("❌ Failed to update schedule");
    } finally {
      setSaving(false);
    }
  }

  // Feature 3: Delete Teacher Schedule
  async function handleDeleteSchedule() {
    if (!selectedSchedule) return;

    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setSaving(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/scheduling/schedules/${selectedSchedule.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );

      if (response.ok) {
        showToast("✅ Schedule deleted successfully");
        setShowDeleteConfirmation(false);
        // Keep view modal open and refresh data
        if (selectedTeacher) {
          loadTeacherSchedules(selectedTeacher);
        }
        loadTeachers(); // Refresh teacher list
      } else {
        const error = await response.json();
        showToast(`❌ ${error.error || "Failed to delete schedule"}`);
      }
    } catch (err) {
      showToast("❌ Failed to delete schedule");
    } finally {
      setSaving(false);
    }
  }

  // Feature 4: Load Student's Schedules
  async function loadStudentSchedules(student: any) {
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setSchedulesLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/scheduling/students/${student.student_id}/schedules`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStudentSchedules(data.schedules || []);
      }
    } catch (err) {
      showToast("❌ Failed to load student schedules");
    } finally {
      setSchedulesLoading(false);
    }
  }

  // Feature 4: Unenroll Student from Schedule
  async function handleUnenrollStudent(scheduleId: number) {
    if (!selectedStudent) return;

    const token = localStorage.getItem("inform_token");
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/scheduling/schedules/${scheduleId}/students/${selectedStudent.student_id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );

      if (response.ok) {
        showToast("✅ Student unenrolled successfully");
        loadStudentSchedules(selectedStudent);
        loadStudents(); // Refresh student list
      } else {
        const error = await response.json();
        showToast(`❌ ${error.error || "Failed to unenroll student"}`);
      }
    } catch (err) {
      showToast("❌ Failed to unenroll student");
    }
  }

  // Feature 5: Check for Room Conflicts
  async function checkRoomConflict(room: string, day: string, timeStart: string, timeEnd: string, excludeScheduleId?: number) {
    const token = localStorage.getItem("inform_token");
    if (!token) return null;

    try {
      // Get all schedules for this room and day
      const response = await fetch(
        `${API_BASE}/api/admin/scheduling/schedules`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        const conflicts = data.schedules.filter((s: any) => {
          // Skip the current schedule when editing
          if (excludeScheduleId && s.id === excludeScheduleId) return false;
          
          // Must be same room and day
          if (s.room !== room || s.day !== day) return false;
          
          // Check time overlap
          const existingStart = s.time_start.slice(0, 5);
          const existingEnd = s.time_end.slice(0, 5);
          
          return (
            (timeStart >= existingStart && timeStart < existingEnd) ||
            (timeEnd > existingStart && timeEnd <= existingEnd) ||
            (timeStart <= existingStart && timeEnd >= existingEnd)
          );
        });

        return conflicts.length > 0 ? conflicts[0] : null;
      }
    } catch (err) {
      console.error("Failed to check room conflict");
    }
    return null;
  }

  // Update strand options based on track
  const getStrandOptions = () => {
    if (teacherScheduleForm.track === "Academic Track") {
      return academicStrands;
    } else if (teacherScheduleForm.track === "TechPro Track") {
      return techProStrands;
    }
    return allStrands;
  };

  // Filter teachers by search and schedule status
  const filteredTeachers = teachers.filter(teacher => {
    // Search filter
    const matchesSearch = !teacherSearchQuery || 
      teacher.full_name.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
      teacher.teacher_id.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
      (teacher.email && teacher.email.toLowerCase().includes(teacherSearchQuery.toLowerCase()));
    
    // Schedule filter
    let matchesFilter = true;
    if (teacherFilter === "with") {
      matchesFilter = teacher.schedule_count > 0;
    } else if (teacherFilter === "without") {
      matchesFilter = !teacher.schedule_count || teacher.schedule_count === 0;
    }
    
    return matchesSearch && matchesFilter;
  });

  const filteredStudents = students.filter(s => {
    // Search filter
    const matchesSearch = !studentSearchQuery || 
      s.full_name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      s.student_id.toLowerCase().includes(studentSearchQuery.toLowerCase());
    
    // Schedule filter
    let matchesFilter = true;
    if (studentFilter === "scheduled") {
      matchesFilter = s.hasSchedule;
    } else if (studentFilter === "unscheduled") {
      matchesFilter = !s.hasSchedule;
    }
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h2 className="fw-black fs-4 text-dark mb-0">Class Scheduling</h2>
        <p className="text-muted small mb-0">Manage class schedules and timetables</p>
      </div>

      {/* Tab Selector */}
      <div className="btn-group" role="group">
        <button 
          className="btn"
          style={{
            background: activeTab === "teacher" ? "#374151" : "transparent",
            color: activeTab === "teacher" ? "#fff" : "#374151",
            borderTop: `1px solid ${activeTab === "teacher" ? "#374151" : "#d1d5db"}`,
            borderBottom: `1px solid ${activeTab === "teacher" ? "#374151" : "#d1d5db"}`,
            borderLeft: `1px solid ${activeTab === "teacher" ? "#374151" : "#d1d5db"}`,
            borderRight: "none"
          }}
          onClick={() => setActiveTab("teacher")}
        >
         Teachers
        </button>
        <button 
          className="btn"
          style={{
            background: activeTab === "student" ? "#374151" : "transparent",
            color: activeTab === "student" ? "#fff" : "#374151",
            borderTop: `1px solid ${activeTab === "student" ? "#374151" : "#d1d5db"}`,
            borderBottom: `1px solid ${activeTab === "student" ? "#374151" : "#d1d5db"}`,
            borderLeft: `1px solid ${activeTab === "student" ? "#374151" : "#d1d5db"}`,
            borderRight: "none"
          }}
          onClick={() => setActiveTab("student")}
        >
           Students
        </button>
        <button 
          className="btn"
          style={{
            background: activeTab === "timetable" ? "#374151" : "transparent",
            color: activeTab === "timetable" ? "#fff" : "#374151",
            borderTop: `1px solid ${activeTab === "timetable" ? "#374151" : "#d1d5db"}`,
            borderBottom: `1px solid ${activeTab === "timetable" ? "#374151" : "#d1d5db"}`,
            borderLeft: `1px solid ${activeTab === "timetable" ? "#374151" : "#d1d5db"}`,
            borderRight: "none"
          }}
          onClick={() => setActiveTab("timetable")}
        >
         Timetable
        </button>
        <button 
          className="btn"
          style={{
            background: activeTab === "statistics" ? "#374151" : "transparent",
            color: activeTab === "statistics" ? "#fff" : "#374151",
            border: `1px solid ${activeTab === "statistics" ? "#374151" : "#d1d5db"}`
          }}
          onClick={() => setActiveTab("statistics")}
        >
           Statistics
        </button>
      </div>
      
      {/* Teacher Schedule */}
      {/* Teacher Schedule */}
      {activeTab === "teacher" && (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-4">
            {/* Search and Filters */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                    </svg>
                  </span>
                  <input 
                    type="text" 
                    className="form-control border-start-0" 
                    placeholder="Search by name, ID, or email..."
                    value={teacherSearchQuery}
                    onChange={(e) => setTeacherSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="btn-group w-100" role="group">
                  <button 
                    className="btn"
                    style={{
                      background: teacherFilter === "all" ? "#374151" : "transparent",
                      color: teacherFilter === "all" ? "#fff" : "#374151",
                      border: `1px solid ${teacherFilter === "all" ? "#374151" : "#d1d5db"}`,
                      borderRight: "none"
                    }}
                    onClick={() => setTeacherFilter("all")}
                  >
                    All Teachers
                  </button>
                  <button 
                    className="btn"
                    style={{
                      background: teacherFilter === "with" ? "#10b981" : "transparent",
                      color: teacherFilter === "with" ? "#fff" : "#10b981",
                      border: `1px solid ${teacherFilter === "with" ? "#10b981" : "#d1d5db"}`,
                      borderRight: "none"
                    }}
                    onClick={() => setTeacherFilter("with")}
                  >
                    With Schedule
                  </button>
                  <button 
                    className="btn"
                    style={{
                      background: teacherFilter === "without" ? "#f59e0b" : "transparent",
                      color: teacherFilter === "without" ? "#fff" : "#f59e0b",
                      border: `1px solid ${teacherFilter === "without" ? "#f59e0b" : "#d1d5db"}`
                    }}
                    onClick={() => setTeacherFilter("without")}
                  >
                    Without Schedule
                  </button>
                </div>
              </div>
            </div>

            {teachersLoading ? (
              <div className="text-center py-4 text-muted">
                <div className="spinner-border spinner-border-sm me-2" />
                Loading teachers...
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                {teacherSearchQuery ? `No teachers found matching "${teacherSearchQuery}"` : 
                 teacherFilter === "with" ? "No teachers with schedules found." :
                 teacherFilter === "without" ? "No teachers without schedules found." :
                 "No teachers found. Ask principal to add teachers first."}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr className="border-bottom">
                      <th className="fw-semibold text-muted small pb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Name</th>
                      <th className="fw-semibold text-muted small pb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Teacher ID</th>
                      <th className="fw-semibold text-muted small pb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Email</th>
                      <th className="fw-semibold text-muted small pb-3 text-center" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Assigned</th>
                      <th className="fw-semibold text-muted small pb-3 text-end" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.map(teacher => (
                      <tr key={teacher.id} className="border-bottom">
                        <td className="py-3">
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center text-primary fw-bold flex-shrink-0" 
                              style={{ width: 32, height: 32, fontSize: 11 }}>
                              {teacher.full_name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
                            </div>
                            <div>
                              <div className="fw-semibold" style={{ fontSize: '0.875rem' }}>{teacher.full_name}</div>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{teacher.department}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="font-monospace text-muted" style={{ fontSize: '0.8125rem' }}>{teacher.teacher_id}</span>
                        </td>
                        <td className="py-3">
                          <span className="text-muted" style={{ fontSize: '0.8125rem' }}>{teacher.email || 'N/A'}</span>
                        </td>
                        <td className="py-3 text-center">
                          {teacher.schedule_count > 0 ? (
                            <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                              ✓ {teacher.schedule_count}
                            </span>
                          ) : (
                            <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                              ✗ None
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="d-flex gap-2 justify-content-end">
                            {teacher.schedule_count > 0 && (
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                style={{ fontSize: '0.8125rem', padding: '0.25rem 0.75rem' }}
                                onClick={() => {
                                  setSelectedTeacher(teacher);
                                  loadTeacherSchedules(teacher);
                                  setShowViewTeacherSchedules(true);
                                }}
                              >
                                View
                              </button>
                            )}
                            <button 
                              className="btn btn-sm btn-success"
                              style={{ fontSize: '0.8125rem', padding: '0.25rem 0.75rem' }}
                              onClick={() => {
                                setSelectedTeacher(teacher);
                                setTeacherScheduleForm({
                                  subject: "", room: "", day: "", timeStart: "", timeEnd: "", 
                                  strand: "", track: "Academic Track", term: "Term 1"
                                });
                                setShowAddTeacherSchedule(true);
                              }}
                            >
                              + Add
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Schedule */}
      {activeTab === "student" && (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-4">
            {/* Bulk Enroll Button */}
            <div className="d-flex justify-content-end mb-3">
              <button 
                className="btn btn-sm"
                style={{ background: "#374151", color: "#fff", border: "none" }}
                onClick={() => {
                  setShowBulkEnroll(true);
                  setSelectedStudentIds([]);
                  setBulkEnrollScheduleId("");
                  loadAvailableSchedules({ track: "", strand: "", term: "Term 1" });
                }}
              >
                  Bulk Enroll Students
              </button>
            </div>

            {/* Search and Filters */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                    </svg>
                  </span>
                  <input 
                    type="text" 
                    className="form-control border-start-0" 
                    placeholder="Search by name or student ID..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="btn-group w-100" role="group">
                  <button 
                    className="btn"
                    style={{
                      background: studentFilter === "all" ? "#374151" : "transparent",
                      color: studentFilter === "all" ? "#fff" : "#374151",
                      border: `1px solid ${studentFilter === "all" ? "#374151" : "#d1d5db"}`
                    }}
                    onClick={() => setStudentFilter("all")}
                  >
                    All Students
                  </button>
                  <button 
                    className={`btn ${studentFilter === "scheduled" ? "btn-success" : "btn-outline-success"}`}
                    onClick={() => setStudentFilter("scheduled")}
                  >
                    With Schedule
                  </button>
                  <button 
                    className={`btn ${studentFilter === "unscheduled" ? "btn-warning" : "btn-outline-warning"}`}
                    onClick={() => setStudentFilter("unscheduled")}
                  >
                    No Schedule
                  </button>
                </div>
              </div>
            </div>
            
            {studentsLoading ? (
              <div className="text-center py-4 text-muted">
                <div className="spinner-border spinner-border-sm me-2" />
                Loading students...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                {studentSearchQuery ? `No students found matching "${studentSearchQuery}"` :
                 studentFilter === "scheduled" ? "No students with schedules." :
                 studentFilter === "unscheduled" ? "No students without schedules." :
                 "No approved enrolled students found."}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr className="border-bottom">
                      <th className="fw-semibold text-muted small pb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Name</th>
                      <th className="fw-semibold text-muted small pb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Student ID</th>
                      <th className="fw-semibold text-muted small pb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Track/Strand</th>
                      <th className="fw-semibold text-muted small pb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Term</th>
                      <th className="fw-semibold text-muted small pb-3 text-center" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Enrolled</th>
                      <th className="fw-semibold text-muted small pb-3 text-end" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => (
                      <tr key={student.student_id} className="border-bottom">
                        <td className="py-3">
                          <div className="d-flex align-items-center gap-2">
                            {student.profile_picture_url ? (
                              <img 
                                src={student.profile_picture_url} 
                                alt={student.full_name}
                                className="rounded-circle flex-shrink-0"
                                style={{ width: 32, height: 32, objectFit: 'cover' }}
                              />
                            ) : (
                              <div 
                                className="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center text-info fw-bold flex-shrink-0" 
                                style={{ width: 32, height: 32, fontSize: 11 }}>
                                {student.full_name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
                              </div>
                            )}
                            <div className="fw-semibold" style={{ fontSize: '0.875rem' }}>
                              {student.full_name.replace(/,\s*$/, '').trim()}
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="font-monospace text-muted" style={{ fontSize: '0.8125rem' }}>{student.student_id}</span>
                        </td>
                        <td className="py-3">
                          <div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{student.track}</div>
                            <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.7rem' }}>{student.strand}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="text-muted" style={{ fontSize: '0.8125rem' }}>{student.term}</span>
                        </td>
                        <td className="py-3 text-center">
                          {student.scheduleCount > 0 ? (
                            <span className="badge bg-info-subtle text-info border border-info-subtle" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                              ✓ {student.scheduleCount}
                            </span>
                          ) : (
                            <span className="badge bg-warning-subtle text-warning border border-warning-subtle" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                              ✗ None
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="d-flex gap-2 justify-content-end">
                            {student.scheduleCount > 0 && (
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                style={{ fontSize: '0.8125rem', padding: '0.25rem 0.75rem' }}
                                onClick={() => {
                                  setSelectedStudent(student);
                                  loadStudentSchedules(student);
                                  setShowViewStudentSchedules(true);
                                }}
                              >
                                View
                              </button>
                            )}
                            <button 
                              className="btn btn-sm btn-success"
                              style={{ fontSize: '0.8125rem', padding: '0.25rem 0.75rem' }}
                              onClick={() => {
                                setSelectedStudent(student);
                                loadAvailableSchedules(student);
                                setSelectedScheduleId("");
                                setShowEnrollSchedule(true);
                              }}
                            >
                              + Enroll
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weekly Timetable View */}
      {activeTab === "timetable" && (
        <TimetableView 
          filters={timetableFilters}
          setFilters={setTimetableFilters}
          showToast={showToast}
        />
      )}

      {/* Statistics Dashboard */}
      {activeTab === "statistics" && (
        <StatisticsDashboard 
          filters={statisticsFilters}
          setFilters={setStatisticsFilters}
          showToast={showToast}
        />
      )}

      {/* Add Teacher Schedule Modal */}
      {showAddTeacherSchedule && selectedTeacher && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowAddTeacherSchedule(false)} />
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Schedule - {selectedTeacher.full_name}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddTeacherSchedule(false)} />
                </div>
                <div className="modal-body">
                  <div className="alert alert-info small mb-3">
                    <strong>School Year:</strong> {getCurrentSchoolYear()} (Auto-calculated)
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Subject</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Mathematics"
                        value={teacherScheduleForm.subject}
                        onChange={(e) => setTeacherScheduleForm({...teacherScheduleForm, subject: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Room</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Room 101"
                        value={teacherScheduleForm.room}
                        onChange={(e) => setTeacherScheduleForm({...teacherScheduleForm, room: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Day</label>
                      <select 
                        className="form-select"
                        value={teacherScheduleForm.day}
                        onChange={(e) => setTeacherScheduleForm({...teacherScheduleForm, day: e.target.value})}
                      >
                        <option value="">Select Day</option>
                        {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Time Start</label>
                      <input 
                        type="time" 
                        className="form-control"
                        value={teacherScheduleForm.timeStart}
                        onChange={(e) => setTeacherScheduleForm({...teacherScheduleForm, timeStart: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Time End</label>
                      <input 
                        type="time" 
                        className="form-control"
                        value={teacherScheduleForm.timeEnd}
                        onChange={(e) => setTeacherScheduleForm({...teacherScheduleForm, timeEnd: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Track</label>
                      <select 
                        className="form-select"
                        value={teacherScheduleForm.track}
                        onChange={(e) => {
                          setTeacherScheduleForm({
                            ...teacherScheduleForm, 
                            track: e.target.value,
                            strand: "" // Reset strand when track changes
                          });
                        }}
                      >
                        <option value="Academic Track">Academic Track</option>
                        <option value="TechPro Track">TechPro Track</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Strand</label>
                      <select 
                        className="form-select"
                        value={teacherScheduleForm.strand}
                        onChange={(e) => setTeacherScheduleForm({...teacherScheduleForm, strand: e.target.value})}
                      >
                        <option value="">Select Strand</option>
                        {getStrandOptions().map(strand => <option key={strand} value={strand}>{strand}</option>)}
                      </select>
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Term</label>
                      <select 
                        className="form-select"
                        value={teacherScheduleForm.term}
                        onChange={(e) => setTeacherScheduleForm({...teacherScheduleForm, term: e.target.value})}
                      >
                        {terms.map(term => <option key={term} value={term}>{term}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddTeacherSchedule(false)}>
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn"
                  style={{ background: "#374151", color: "#fff", border: "none" }} 
                    onClick={handleAddTeacherSchedule}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Add Schedule"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Enroll Student Schedule Modal */}
      {showEnrollSchedule && selectedStudent && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowEnrollSchedule(false)} />
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Enroll Schedule - {selectedStudent.full_name}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEnrollSchedule(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3 p-3 bg-light rounded">
                    <div className="small text-muted">Student Info</div>
                    <div className="fw-semibold">{selectedStudent.student_id}</div>
                    <div className="small">{selectedStudent.strand}/{selectedStudent.track} • {selectedStudent.term}</div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Schedule</label>
                    <select 
                      className="form-select"
                      value={selectedScheduleId}
                      onChange={(e) => setSelectedScheduleId(e.target.value)}
                    >
                      <option value="">Select Schedule</option>
                      {availableSchedules.map(schedule => (
                        <option key={schedule.id} value={schedule.id}>
                          {schedule.subject_name} - {schedule.teacher_name} 
                          ({schedule.day} {schedule.time_start.slice(0,5)}-{schedule.time_end.slice(0,5)}) 
                          [{schedule.enrolled_count}/{schedule.max_capacity}]
                        </option>
                      ))}
                    </select>
                    {availableSchedules.length === 0 && (
                      <div className="text-muted small mt-2">
                        No available schedules for {selectedStudent.track} - {selectedStudent.strand}
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEnrollSchedule(false)}>
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn"
                  style={{ background: "#374151", color: "#fff", border: "none" }} 
                    onClick={handleEnrollStudent}
                    disabled={saving || !selectedScheduleId}
                  >
                    {saving ? "Enrolling..." : "Enroll Schedule"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* View Teacher Schedules Modal */}
      {showViewTeacherSchedules && selectedTeacher && !showEditTeacherSchedule && !showDeleteConfirmation && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowViewTeacherSchedules(false)} />
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <div>
                    <h5 className="modal-title mb-0">{selectedTeacher.full_name} - Schedules</h5>
                    <div className="small opacity-75">{selectedTeacher.department}</div>
                  </div>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewTeacherSchedules(false)} />
                </div>
                <div className="modal-body">
                  {schedulesLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border spinner-border-sm me-2" />
                      Loading schedules...
                    </div>
                  ) : teacherSchedules.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      No schedules assigned yet.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Day</th>
                            <th>Time</th>
                            <th>Subject</th>
                            <th>Room</th>
                            <th>Track/Strand</th>
                            <th>Term</th>
                            <th>Students</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teacherSchedules.map((schedule) => (
                            <tr key={schedule.id}>
                              <td className="fw-medium">{schedule.day}</td>
                              <td className="small">{schedule.time_start.slice(0,5)} - {schedule.time_end.slice(0,5)}</td>
                              <td>{schedule.subject_name}</td>
                              <td>{schedule.room}</td>
                              <td className="small">{schedule.track}<br/><span className="badge bg-secondary-subtle text-secondary">{schedule.strand}</span></td>
                              <td>{schedule.term}</td>
                              <td>
                                <span className={`badge ${schedule.enrolled_count >= schedule.max_capacity * 0.9 ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} border`}>
                                  {schedule.enrolled_count}/{schedule.max_capacity}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <button 
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() => {
                                      setSelectedSchedule(schedule);
                                      setTeacherScheduleForm({
                                        subject: schedule.subject_name,
                                        room: schedule.room,
                                        day: schedule.day,
                                        timeStart: schedule.time_start.slice(0,5),
                                        timeEnd: schedule.time_end.slice(0,5),
                                        strand: schedule.strand,
                                        track: schedule.track,
                                        term: schedule.term
                                      });
                                      setShowEditTeacherSchedule(true);
                                    }}
                                    title="Edit"
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => {
                                      setSelectedSchedule(schedule);
                                      setShowDeleteConfirmation(true);
                                    }}
                                    title="Delete"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowViewTeacherSchedules(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Teacher Schedule Modal */}
      {showEditTeacherSchedule && selectedSchedule && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowEditTeacherSchedule(false)} />
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-title">Edit Schedule</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEditTeacherSchedule(false)} />
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Subject</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={teacherScheduleForm.subject}
                        onChange={(e) => setTeacherScheduleForm({...teacherScheduleForm, subject: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Room</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={teacherScheduleForm.room}
                        onChange={(e) => setTeacherScheduleForm({...teacherScheduleForm, room: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Day</label>
                      <select 
                        className="form-select"
                        value={teacherScheduleForm.day}
                        onChange={(e) => setTeacherScheduleForm({...teacherScheduleForm, day: e.target.value})}
                      >
                        {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Time Start</label>
                      <input 
                        type="time" 
                        className="form-control"
                        value={teacherScheduleForm.timeStart}
                        onChange={(e) => setTeacherScheduleForm({...teacherScheduleForm, timeStart: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Time End</label>
                      <input 
                        type="time" 
                        className="form-control"
                        value={teacherScheduleForm.timeEnd}
                        onChange={(e) => setTeacherScheduleForm({...teacherScheduleForm, timeEnd: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Track</label>
                      <select 
                        className="form-select"
                        value={teacherScheduleForm.track}
                        onChange={(e) => {
                          setTeacherScheduleForm({
                            ...teacherScheduleForm, 
                            track: e.target.value,
                            strand: ""
                          });
                        }}
                      >
                        <option value="Academic Track">Academic Track</option>
                        <option value="TechPro Track">TechPro Track</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Strand</label>
                      <select 
                        className="form-select"
                        value={teacherScheduleForm.strand}
                        onChange={(e) => setTeacherScheduleForm({...teacherScheduleForm, strand: e.target.value})}
                      >
                        <option value="">Select Strand</option>
                        {getStrandOptions().map(strand => <option key={strand} value={strand}>{strand}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditTeacherSchedule(false)}>
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-warning" 
                    onClick={handleEditTeacherSchedule}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Update Schedule"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Schedule Confirmation Modal */}
      {showDeleteConfirmation && selectedSchedule && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowDeleteConfirmation(false)} />
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1070 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">⚠️ Delete Schedule?</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteConfirmation(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <strong>{selectedSchedule.subject_name}</strong>
                    <div className="small text-muted">
                      {selectedSchedule.day} • {selectedSchedule.time_start.slice(0,5)} - {selectedSchedule.time_end.slice(0,5)} • {selectedSchedule.room}
                    </div>
                  </div>
                  
                  {selectedSchedule.enrolled_count > 0 ? (
                    <div className="alert alert-warning">
                      <strong>Warning:</strong> This schedule has <strong>{selectedSchedule.enrolled_count} enrolled student(s)</strong>.
                      <br/>Deleting will automatically unenroll all students.
                    </div>
                  ) : (
                    <div className="alert alert-info">
                      This schedule has no enrolled students.
                    </div>
                  )}
                  
                  <p className="mb-0">Are you sure you want to delete this schedule?</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteConfirmation(false)}>
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={handleDeleteSchedule}
                    disabled={saving}
                  >
                    {saving ? "Deleting..." : "Delete Schedule"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* View Student Schedules Modal */}
      {showViewStudentSchedules && selectedStudent && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowViewStudentSchedules(false)} />
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-xl modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header bg-info text-white">
                  <div>
                    <h5 className="modal-title mb-0">{selectedStudent.full_name} - Enrolled Schedules</h5>
                    <div className="small opacity-75">{selectedStudent.student_id} • {selectedStudent.track} - {selectedStudent.strand}</div>
                  </div>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewStudentSchedules(false)} />
                </div>
                <div className="modal-body">
                  {schedulesLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border spinner-border-sm me-2" />
                      Loading schedules...
                    </div>
                  ) : studentSchedules.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      No schedules enrolled yet.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Day</th>
                            <th>Time</th>
                            <th>Subject</th>
                            <th>Room</th>
                            <th>Teacher</th>
                            <th>Track/Strand</th>
                            <th>Term</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentSchedules.map((schedule: any) => (
                            <tr key={schedule.schedule_id}>
                              <td className="fw-medium">{schedule.day}</td>
                              <td className="small">{schedule.time_start.slice(0,5)} - {schedule.time_end.slice(0,5)}</td>
                              <td>{schedule.subject_name}</td>
                              <td>{schedule.room}</td>
                              <td>{schedule.teacher_name}</td>
                              <td className="small">{schedule.track}<br/><span className="badge bg-secondary-subtle text-secondary">{schedule.strand}</span></td>
                              <td>{schedule.term}</td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => {
                                    if (confirm(`Unenroll from ${schedule.subject_name}?`)) {
                                      handleUnenrollStudent(schedule.schedule_id);
                                    }
                                  }}
                                  title="Unenroll"
                                >
                                  ❌ Unenroll
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowViewStudentSchedules(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bulk Enroll Students Modal */}
      {showBulkEnroll && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowBulkEnroll(false)} />
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Bulk Enroll Students</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowBulkEnroll(false)} />
                </div>
                <div className="modal-body">
                  {/* Select Schedule */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Select Schedule</label>
                    <select 
                      className="form-select"
                      value={bulkEnrollScheduleId}
                      onChange={(e) => setBulkEnrollScheduleId(e.target.value)}
                    >
                      <option value="">Choose a schedule...</option>
                      {availableSchedules.map(schedule => (
                        <option key={schedule.id} value={schedule.id}>
                          {schedule.subject_name} - {schedule.teacher_name} 
                          ({schedule.day} {schedule.time_start.slice(0,5)}-{schedule.time_end.slice(0,5)}) 
                          - {schedule.track}/{schedule.strand}
                          [{schedule.enrolled_count}/{schedule.max_capacity} slots]
                        </option>
                      ))}
                    </select>
                    {availableSchedules.length === 0 && (
                      <div className="text-muted small mt-2">
                        No available schedules. Adjust filters or create schedules first.
                      </div>
                    )}
                  </div>

                  {/* Student Selection */}
                  {bulkEnrollScheduleId && (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <label className="form-label fw-semibold mb-0">Select Students ({selectedStudentIds.length} selected)</label>
                        <div>
                          <button 
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => setSelectedStudentIds(filteredStudents.map(s => s.student_id))}
                          >
                            Select All
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setSelectedStudentIds([])}
                          >
                            Clear All
                          </button>
                        </div>
                      </div>

                      <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-hover table-sm">
                          <thead className="table-light" style={{ position: 'sticky', top: 0 }}>
                            <tr>
                              <th style={{ width: '50px' }}>
                                <input 
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedStudentIds(filteredStudents.map(s => s.student_id));
                                    } else {
                                      setSelectedStudentIds([]);
                                    }
                                  }}
                                />
                              </th>
                              <th>Name</th>
                              <th>Student ID</th>
                              <th>Track/Strand</th>
                              <th>Term</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStudents.map(student => {
                              const selectedSchedule = availableSchedules.find(s => s.id.toString() === bulkEnrollScheduleId);
                              const isCompatible = selectedSchedule && 
                                student.track === selectedSchedule.track && 
                                student.strand === selectedSchedule.strand;
                              
                              return (
                                <tr 
                                  key={student.student_id}
                                  className={!isCompatible ? 'table-warning' : ''}
                                >
                                  <td>
                                    <input 
                                      type="checkbox"
                                      className="form-check-input"
                                      checked={selectedStudentIds.includes(student.student_id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedStudentIds([...selectedStudentIds, student.student_id]);
                                        } else {
                                          setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.student_id));
                                        }
                                      }}
                                      disabled={!isCompatible}
                                    />
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center gap-2">
                                      {student.profile_picture_url ? (
                                        <img 
                                          src={student.profile_picture_url} 
                                          alt={student.full_name}
                                          className="rounded-circle flex-shrink-0"
                                          style={{ width: 28, height: 28, objectFit: 'cover' }}
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const fallback = e.currentTarget.nextElementSibling;
                                            if (fallback) (fallback as HTMLElement).style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <div 
                                        className="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center text-info fw-bold flex-shrink-0" 
                                        style={{ 
                                          width: 28, 
                                          height: 28, 
                                          fontSize: 10,
                                          display: student.profile_picture_url ? 'none' : 'flex'
                                        }}>
                                        {student.full_name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
                                      </div>
                                      <span>{student.full_name}</span>
                                    </div>
                                  </td>
                                  <td className="font-monospace small">{student.student_id}</td>
                                  <td>
                                    {student.track} / {student.strand}
                                    {!isCompatible && <span className="badge bg-warning ms-2">Mismatch</span>}
                                  </td>
                                  <td>{student.term}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {selectedStudentIds.length > 0 && (
                        <div className="alert alert-info mt-3">
                          <strong>{selectedStudentIds.length} student(s)</strong> will be enrolled in the selected schedule.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowBulkEnroll(false)}>
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn"
                  style={{ background: "#374151", color: "#fff", border: "none" }} 
                    onClick={handleBulkEnrollStudents}
                    disabled={saving || !bulkEnrollScheduleId || selectedStudentIds.length === 0}
                  >
                    {saving ? "Enrolling..." : `Enroll ${selectedStudentIds.length} Student(s)`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <div className="alert alert-dark mb-0 shadow-lg">{toast}</div>
        </div>
      )}
    </div>
  );
}



/*  Library Panel  */
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
        <div><h2 className="fw-black fs-4 text-dark mb-0">Library Management</h2><p className="text-muted small mb-0">{libBooks.length} titles � {totalCopies} total copies</p></div>
        <button className="btn btn-sm fw-bold shadow-sm" style={{ background: "#374151", color: "#fff", border: "none" }}>+ Add Book</button>
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
        <span className="input-group-text bg-white"></span>
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

/*  Reports Panel  */
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
          { label:"Total Logins Today", value:"35",      cls:"bg-primary-subtle border-primary-subtle text-primary" },
          { label:"Files Uploaded",     value:"12",      cls:"bg-info-subtle    border-info-subtle    text-info"    },
          { label:"Books Borrowed",     value:"7",       cls:"bg-warning-subtle border-warning-subtle text-warning" },
          { label:"Payments Received",  value:"44,100", cls:"bg-success-subtle border-success-subtle text-success" },
        ].map(s => (
          <div key={s.label} className="col-6 col-lg-3">
            <div className={`card border rounded-3 ${s.cls}`}>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">{s.label}</span>
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

/* ── Principal / Admin Profile Panel ──────────────────────────────── */
function PrincipalProfilePanel({ adminName, role }: { adminName?: string | null; role?: string }) {
  const name  = adminName || (role === "principal" ? "Principal" : role === "registrar" ? "Registrar" : "Admin");
  const email = role === "principal" ? "principal@cfei.edu.ph"
              : role === "registrar"  ? "registrar@cfei.edu.ph"
              : "admin@cfei.edu.ph";
  const initials2 = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "PR";
  const roleLabel = role === "principal" ? "Principal" : role === "registrar" ? "Registrar" : role === "accounting" ? "Accounting Officer" : "Administrator";

  const infoItems = [
    {
      label: "Email", value: email, bg: "#f3f4f6",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    },
    {
      label: "Role", value: roleLabel, bg: "#f3f4f6",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    },
    {
      label: "Access Level", value: "Full Access", bg: "#dcfce7",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    },
  ];

  return (
    <div className="d-flex flex-column gap-0">
      {/* Banner */}
      <div style={{ background:"linear-gradient(135deg,#374151 0%,#4b5563 100%)", borderRadius:"16px 16px 0 0", padding:"32px 32px 80px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-50, right:-50, width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
        <div style={{ position:"absolute", bottom:-60, right:160, width:150, height:150, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <h1 className="fw-bold text-white mb-1" style={{ fontSize:"1.6rem" }}>My Profile</h1>
          <p className="mb-0" style={{ color:"rgba(255,255,255,0.7)" }}>Your personal &amp; professional information</p>
        </div>
      </div>

      {/* Cards pulled up over banner */}
      <div className="container-fluid px-3 px-md-4" style={{ marginTop:"-52px", paddingBottom:32 }}>
        <div className="row g-4">

          {/* Left: Profile Card */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden h-100">
              <div className="d-flex flex-column align-items-center pt-4 pb-4 px-4 text-center">
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold mb-3"
                  style={{ width:100, height:100, fontSize:32, background:"linear-gradient(135deg,#374151,#4b5563)", boxShadow:"0 6px 20px rgba(55,65,81,0.4)", border:"4px solid white" }}>
                  {initials2}
                </div>
                <h4 className="fw-bold mb-1" style={{ color:"#1e293b" }}>{name}</h4>
                <p className="text-muted small mb-3">{email}</p>
                <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                  <span className="badge rounded-pill px-3 py-2" style={{ background:"rgba(107,114,128,0.1)", color:"#374151", border:"1px solid rgba(107,114,128,0.25)", fontWeight:600 }}>{roleLabel}</span>
                  <span className="badge rounded-pill px-3 py-2" style={{ background:"#f0fdf4", color:"#16a34a", border:"1px solid #bbf7d0", fontWeight:600 }}>Active</span>
                </div>
                <div className="w-100 row g-2 mb-3">
                  <div className="col-6">
                    <div className="rounded-3 p-3 text-center" style={{ background:"#f8fafc", border:"1px solid #e2e8f0" }}>
                      <div className="fw-bold" style={{ fontSize:"1.1rem", color:"#374151" }}>Full</div>
                      <div className="text-muted" style={{ fontSize:"0.7rem" }}>Access</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="rounded-3 p-3 text-center" style={{ background:"#f8fafc", border:"1px solid #e2e8f0" }}>
                      <div className="fw-bold" style={{ fontSize:"1.1rem", color:"#16a34a" }}>Active</div>
                      <div className="text-muted" style={{ fontSize:"0.7rem" }}>Status</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4">
                <hr style={{ borderColor:"#e2e8f0" }} />
                <div className="d-flex flex-column gap-3">
                  {infoItems.map(item => (
                    <div key={item.label} className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width:34, height:34, background:item.bg }}>
                        {item.icon}
                      </div>
                      <div style={{ overflow:"hidden" }}>
                        <div className="text-muted" style={{ fontSize:"0.7rem", textTransform:"uppercase", letterSpacing:"0.05em" }}>{item.label}</div>
                        <div className="fw-semibold text-truncate" style={{ fontSize:"0.84rem", color:"#1e293b" }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Details Card */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-lg rounded-4 h-100">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width:44, height:44, background:"linear-gradient(135deg,#374151,#4b5563)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0" style={{ color:"#1e293b" }}>Profile Information</h5>
                      <p className="text-muted mb-0" style={{ fontSize:"0.82rem" }}>Your account and role details</p>
                    </div>
                  </div>
                  <span className="badge px-3 py-2 rounded-pill" style={{ background:"#f3f4f6", color:"#374151", border:"1px solid #e5e7eb", fontSize:"0.75rem" }}>Read-Only</span>
                </div>

                {/* Personal */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3 pb-2" style={{ borderBottom:"2px solid #f1f5f9" }}>
                    <div style={{ width:4, height:16, background:"linear-gradient(135deg,#6b7280,#9ca3af)", borderRadius:4 }} />
                    <span className="fw-semibold text-uppercase" style={{ fontSize:"0.72rem", letterSpacing:"0.08em", color:"#64748b" }}>Personal Details</span>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>Full Name</label>
                      <input type="text" className="form-control rounded-3" value={name} disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc" }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>Role</label>
                      <input type="text" className="form-control rounded-3" value={roleLabel} disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc" }} />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3 pb-2" style={{ borderBottom:"2px solid #f1f5f9" }}>
                    <div style={{ width:4, height:16, background:"linear-gradient(135deg,#6b7280,#9ca3af)", borderRadius:4 }} />
                    <span className="fw-semibold text-uppercase" style={{ fontSize:"0.72rem", letterSpacing:"0.08em", color:"#64748b" }}>Contact Information</span>
                  </div>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>Email Address</label>
                      <input type="email" className="form-control rounded-3" value={email} disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc" }} />
                    </div>
                  </div>
                </div>

                {/* Access */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3 pb-2" style={{ borderBottom:"2px solid #f1f5f9" }}>
                    <div style={{ width:4, height:16, background:"linear-gradient(135deg,#10b981,#059669)", borderRadius:4 }} />
                    <span className="fw-semibold text-uppercase" style={{ fontSize:"0.72rem", letterSpacing:"0.08em", color:"#64748b" }}>Access Details</span>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>Access Level</label>
                      <input type="text" className="form-control rounded-3" value="Full Access" disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc" }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>Status</label>
                      <input type="text" className="form-control rounded-3" value="Active" disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc", color:"#16a34a", fontWeight:600 }} />
                    </div>
                  </div>
                </div>

                {/* Info alert */}
                <div className="d-flex align-items-start gap-3 rounded-3 p-3" style={{ background:"#f3f4f6", border:"1px solid #e5e7eb" }}>
                  <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 mt-1" style={{ width:32, height:32, background:"#d1d5db" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <div>
                    <div className="fw-semibold mb-1" style={{ fontSize:"0.85rem", color:"#374151" }}>Need to update your information?</div>
                    <div style={{ fontSize:"0.82rem", color:"#4b5563" }}>
                      Please contact the system administrator or email{" "}
                      <a href="mailto:admin@cfei.edu.ph" style={{ color:"#374151", fontWeight:600 }}>admin@cfei.edu.ph</a>{" "}
                      with your updated details.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/*  Page  */
export function AdminDashboardPage({ hideBanner, onSidebarExpandChange, readOnly, hideTopbarControls, hideRequests, gradeRequestsContent, role, bannerHeight }: { hideBanner?: boolean; onSidebarExpandChange?: (expanded: boolean) => void; readOnly?: boolean; hideTopbarControls?: boolean; hideRequests?: boolean; gradeRequestsContent?: React.ReactNode; role?: string; bannerHeight?: number } = {}) {
  const [activeNav, setActiveNav]   = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [academicConfig, setAcademicConfig] = useState<AcademicConfig | null>(null);

  // Fetch admin name on mount
  useEffect(() => {
    const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
    if (!token) return;
    fetch(`${API_BASE}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.adminInfo?.full_name) {
          setAdminName(data.adminInfo.full_name);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch academic config
  useEffect(() => {
    getAcademicConfig().then(config => setAcademicConfig(config));
  }, []);

  // Route protection � only runs when used as standalone page (not wrapped)
  useEffect(() => {
    if (hideBanner) return; // wrapped by principal/registrar � they handle auth
    const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
    const role  = localStorage.getItem("inform_role");
    const adminRoles = ["registrar", "principal", "accounting"];
    if (!token || !adminRoles.includes(role ?? "")) {
      window.location.replace("/login");
    }
  }, [hideBanner]);
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
          });
      });
    } catch {}
    return base;
  });

  // Poll staff notifications (grade request related) for registrar/principal
  useEffect(() => {
    if (!["registrar", "principal"].includes(role ?? "")) return;
    
    function fetchStaffNotifs() {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      if (!token) return;
      
      fetch(`${API_BASE}/api/staff-notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.notifications?.length) {
            setNotifs(prev => {
              // Keep existing read states for items already marked read locally
              const readIds = new Set(prev.filter((n: any) => n.read).map((n: any) => n.id));
              const fresh = data.notifications.map((n: { id: number; type: string; title?: string; message: string; created_at: string; is_read: boolean }) => ({
                id: n.id,
                type: n.type,
                title: n.title || (n.type === 'grade_request' ? 'Grade Request' : n.type === 'document_approved' ? 'Document Approved' : n.type === 'enrollment' ? 'New Enrollment' : 'Notification'),
                message: n.message,
                time: new Date(n.created_at).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
                // Preserve local read state if already marked, otherwise use DB value
                read: readIds.has(n.id) ? true : !!n.is_read,
              }));
              return fresh;
            });
          }
        })
        .catch(() => {});
    }
    fetchStaffNotifs();
    const interval = setInterval(fetchStaffNotifs, 30000);
    return () => clearInterval(interval);
  }, [role]);

  const unreadCount = notifs.filter(n => !n.read).length;

  function markAsRead(id: number) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    // Persist to DB using staff notifications API
    const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
    if (token) {
      fetch(`${API_BASE}/api/staff-notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      }).catch(() => {});
    }
  }

  function markAllAsRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    // Mark all as read on server
    const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
    if (token) {
      fetch(`${API_BASE}/api/staff-notifications/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      }).catch(() => {});
    }
  }

  function deleteNotif(id: number) {
    setNotifs(prev => prev.filter(n => n.id !== id));
    // Delete from DB using staff notifications API
    const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
    if (token) {
      fetch(`${API_BASE}/api/staff-notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      }).catch(() => {});
    }
  }

  function renderPanel() {
    switch (activeNav) {
      case "students":      return <StudentsPanel />;
      case "manage-students": return <ManageStudentsPanel />;
      case "teachers":      return <TeachersPanel readOnly={readOnly} registrarView={hideRequests} role={role} />;
      case "grades":        return <GradesPanel role={role} />;
      case "requests":      return <>{gradeRequestsContent}<AdminRequestsPanel role={role} /></>;
      case "documents":     return <DocumentWorkflowPanel />;
      case "enrollment":    return <EnrollmentPanel role={role} />;
      case "scheduling":    return <SchedulingPanel />;
      case "library":       return <LibraryPanel />;
      case "reports":       return <ReportsPanel />;
      case "profile":       return <PrincipalProfilePanel adminName={adminName} role={role} />;
      case "settings":      return <SettingsPanel />;
      case "dashboard-guide": return <GuidePanel role={role === "principal" ? "principal" : role === "registrar" ? "registrar" : role === "accounting" ? "accounting" : "principal"} type="dashboard" />;
      case "user-guide":    return <GuidePanel role={role === "principal" ? "principal" : role === "registrar" ? "registrar" : role === "accounting" ? "accounting" : "principal"} type="user" />;
      default:              return <Overview setActive={setActiveNav} hideBanner={hideBanner} adminName={adminName} academicConfig={academicConfig} />;
    }
  }

  return (
    <div className="admin-dashboard-layout" suppressHydrationWarning>
      <Sidebar active={activeNav} setActive={setActiveNav} show={mobileOpen} setShow={setMobileOpen} onExpandChange={(v) => { setSidebarExpanded(v); onSidebarExpandChange?.(v); }} hideRequests={hideRequests} role={role} adminName={adminName} />

      {/* Fixed header bar - above everything */}
      {!hideTopbarControls && (
      <header className="bg-white border-bottom px-2 px-md-4 py-3 d-flex align-items-center gap-2 gap-md-3 shadow-sm flex-wrap" style={{ position: "fixed", top: 0, left: 256, right: 0, zIndex: 1046, transition: "left 0.3s ease", height: 57 }}>
        <button className="btn btn-link text-dark p-1 d-lg-none hamburger-mobile-only" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="d-flex align-items-center gap-2 gap-md-3 ms-auto flex-wrap">
          <span className="badge bg-success-subtle text-success border border-success-subtle d-none d-md-flex align-items-center gap-1" style={{ fontSize: "clamp(10px, 2vw, 12px)" }}>
            <span className="rounded-circle bg-success d-inline-block" style={{ width:7, height:7 }} />System Online
          </span>
          <button className="btn btn-link text-muted p-1 position-relative" onClick={() => setShowNotifDropdown(!showNotifDropdown)} aria-label="Notifications">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && <span className="position-absolute top-0 end-0 rounded-circle bg-danger d-flex align-items-center justify-content-center text-white" style={{ width:16, height:16, fontSize:9, fontWeight:"bold" }}>{unreadCount}</span>}
          </button>
        </div>
      </header>
      )}

      {/* Main content - responsive for all screen sizes */}
      <div className="admin-dashboard-main" style={{ marginLeft: 256, minHeight: "100vh", transition: "margin-left 0.3s ease", display: "flex", flexDirection: "column", paddingTop: !hideTopbarControls ? 57 : (bannerHeight || 0) }}>
        {/* Topbar � hidden when parent supplies its own banner (e.g. Principal portal) */}
        {!hideTopbarControls && (
        <div style={{ display: "none" }}>hidden header</div>
        )}

        <main className="flex-grow-1 overflow-auto p-2 p-sm-3 p-md-4" style={{ minHeight: 0 }}>
          {renderPanel()}
        </main>
      </div>

      {/* Notification Dropdown - responsive */}
      {showNotifDropdown && (
        <>
          <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex:1998 }} onClick={() => setShowNotifDropdown(false)} />
          <div style={{ position:"fixed", top:60, right:"clamp(8px, 2vw, 20px)", width:"min(360px, calc(100vw - 32px))", maxHeight:"min(480px, calc(100vh - 100px))", background:"white", borderRadius:"0.75rem", border:"1px solid rgba(0,0,0,0.1)", boxShadow:"0 10px 40px rgba(0,0,0,0.15)", zIndex:2000, display:"flex", flexDirection:"column", animation:"slideInDown 0.2s ease-out" }}>
            <div className="px-3 px-md-4 py-3 border-bottom d-flex align-items-center justify-content-between flex-shrink-0">
              <div><div className="fw-bold text-dark small">Notifications</div><div className="text-muted" style={{ fontSize:11 }}>{unreadCount} unread</div></div>
              <div className="d-flex align-items-center gap-2">
                {unreadCount > 0 && <button onClick={markAllAsRead} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize:11 }}>Mark all read</button>}
                <button onClick={() => setShowNotifDropdown(false)} className="btn btn-link btn-sm p-0 text-muted" style={{ fontSize:18 }} aria-label="Close"><Icon name="close" size={16} /></button>
              </div>
            </div>
            <div style={{ overflowY:"auto", flex:"1 1 auto" }}>
              {notifs.length === 0 ? (
                <div className="px-4 py-5 text-center text-muted"><small>No notifications</small></div>
              ) : (
                notifs.map(n => (
                  <div key={n.id} className="px-3 px-md-4 py-3 border-bottom d-flex gap-2 gap-md-3" style={{ background: n.read ? "white" : "rgba(99,102,241,0.04)", opacity: n.read ? 0.7 : 1 }}>
                    <div className="text-primary" style={{ minWidth:24 }}>
                      <Icon name={n.type === "grade" ? "grades" : n.type === "document" ? "documents" : n.type === "enrollment" ? "enrollment" : n.type === "payment" ? "tuition" : "bell"} size={18} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold small text-dark">{n.title}</div>
                      <div className="text-muted" style={{ fontSize:12, lineHeight:1.4 }}>{n.message}</div>
                      <div className="text-muted" style={{ fontSize:11, marginTop:4 }}>{n.time}</div>
                    </div>
                    <div className="d-flex gap-1 flex-shrink-0">
                      {!n.read && <button onClick={() => markAsRead(n.id)} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize:12 }} title="Mark as read" aria-label="Mark as read"><Icon name="check" size={14} /></button>}
                      <button onClick={() => deleteNotif(n.id)} className="btn btn-link btn-sm p-0 text-danger" style={{ fontSize:14 }} title="Delete" aria-label="Delete"><Icon name="x" size={14} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifs.length > 0 && (
              <div className="px-4 py-2 border-top text-center flex-shrink-0">
                <button onClick={() => { setActiveNav("documents"); setShowNotifDropdown(false); }} className="btn btn-link btn-sm p-0 text-primary d-inline-flex align-items-center gap-1" style={{ fontSize:12 }}>
                  View all <Icon name="arrowRight" size={12} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}





// Grade Edit Requests List Component
function GradeEditRequestsList() {
  const [requests, setRequests] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  // Modal state
  const [viewingRequest, setViewingRequest] = useState<any>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [selectedTerm, filterStatus, filterTeacher, filterSubject]);

  async function loadRequests() {
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTerm) params.append('term', selectedTerm);
      if (filterStatus) params.append('status', filterStatus);
      if (filterTeacher) params.append('teacher_id', filterTeacher);
      if (filterSubject) params.append('subject_name', filterSubject);

      const response = await fetch(
        `${API_BASE}/api/grade-edit-requests/principal/requests?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Failed to load edit requests:", err);
    } finally {
      setLoading(false);
    }
  }

  async function approveRequest(requestId: number) {
    setProcessing(true);
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/grade-edit-requests/principal/requests/${requestId}/approve`,
        {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setShowApproveModal(false);
        setViewingRequest(null);
        loadRequests();
        alert("✅ Grade edit request approved successfully!");
      } else {
        const data = await response.json();
        alert("Error: " + (data.error || "Failed to approve request"));
      }
    } catch (err) {
      console.error("Failed to approve request:", err);
      alert("Error approving request");
    } finally {
      setProcessing(false);
    }
  }

  async function rejectRequest(requestId: number) {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setProcessing(true);
    const token = localStorage.getItem("inform_token");
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/grade-edit-requests/principal/requests/${requestId}/reject`,
        {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ rejection_reason: rejectionReason })
        }
      );

      if (response.ok) {
        setShowRejectModal(false);
        setViewingRequest(null);
        setRejectionReason("");
        loadRequests();
        alert("✅ Grade edit request rejected");
      } else {
        const data = await response.json();
        alert("Error: " + (data.error || "Failed to reject request"));
      }
    } catch (err) {
      console.error("Failed to reject request:", err);
      alert("Error rejecting request");
    } finally {
      setProcessing(false);
    }
  }

  function getStatusBadge(status: string) {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: "warning", text: "dark", label: "Pending" },
      approved: { bg: "success", text: "white", label: "Approved" },
      rejected: { bg: "danger", text: "white", label: "Rejected" },
      completed: { bg: "secondary", text: "white", label: "Completed" }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`badge bg-${badge.bg} text-${badge.text}`}>
        {badge.label}
      </span>
    );
  }

  // Get unique values for filters
  const teachers = Array.from(new Set(requests.map(r => r.teacher_name))).sort();
  const subjects = Array.from(new Set(requests.map(r => r.subject_name))).sort();

  return (
    <>
      <div className="card border-0 shadow-sm rounded-3 mt-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold mb-1">Grade Edit Requests</h3>
              <p className="text-muted small mb-0">
                Review and approve teacher requests to correct submitted grades
              </p>
            </div>
            <select
              className="form-select form-select-sm"
              style={{ width: "auto" }}
              value={selectedTerm}
              onChange={e => setSelectedTerm(e.target.value)}
            >
              <option value="">All Terms</option>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>

          {/* Filters */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize: 11 }}>
                Status
              </label>
              <select
                className="form-select form-select-sm"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize: 11 }}>
                Teacher
              </label>
              <select
                className="form-select form-select-sm"
                value={filterTeacher}
                onChange={e => setFilterTeacher(e.target.value)}
              >
                <option value="">All Teachers</option>
                {teachers.map(teacher => (
                  <option key={teacher} value={teacher}>{teacher}</option>
                ))}
              </select>
            </div>
            <div className="col-md-5">
              <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize: 11 }}>
                Subject
              </label>
              <select
                className="form-select form-select-sm"
                value={filterSubject}
                onChange={e => setFilterSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>

          {(filterStatus || filterTeacher || filterSubject) && (
            <div className="mb-3">
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setFilterStatus("");
                  setFilterTeacher("");
                  setFilterSubject("");
                }}
              >
                Clear Filters
              </button>
              <span className="text-muted small ms-2">
                Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary spinner-border-sm me-2" />
              <span className="text-muted small">Loading edit requests...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center text-muted small py-4">
              No grade edit requests found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="small fw-semibold text-uppercase">Teacher</th>
                    <th className="small fw-semibold text-uppercase">Student</th>
                    <th className="small fw-semibold text-uppercase">Subject</th>
                    <th className="small fw-semibold text-uppercase">Term</th>
                    <th className="small fw-semibold text-uppercase text-center">Original</th>
                    <th className="small fw-semibold text-uppercase text-center">Proposed</th>
                    <th className="small fw-semibold text-uppercase text-center">Status</th>
                    <th className="small fw-semibold text-uppercase">Requested</th>
                    <th className="small fw-semibold text-uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(request => (
                    <tr key={request.id}>
                      <td className="align-middle">
                        <div className="fw-semibold">{request.teacher_name}</div>
                      </td>
                      <td className="align-middle">
                        <div className="fw-semibold">{request.student_name}</div>
                        <div className="small text-muted">{request.student_id}</div>
                      </td>
                      <td className="align-middle">
                        <div>{request.subject_name}</div>
                        {request.strand && (
                          <div className="small text-muted">{request.strand}</div>
                        )}
                      </td>
                      <td className="align-middle">{request.term}</td>
                      <td className="align-middle text-center">
                        <span className="badge bg-light text-dark">
                          {request.original_grade}%
                        </span>
                      </td>
                      <td className="align-middle text-center">
                        {request.proposed_grade ? (
                          <span className="badge bg-info text-white">
                            {request.proposed_grade}%
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td className="align-middle text-center">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="align-middle">
                        <div className="small">{new Date(request.created_at).toLocaleDateString()}</div>
                        <div className="small text-muted">
                          {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="align-middle text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => setViewingRequest(request)}
                        >
                          View
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-sm btn-success me-1"
                              onClick={() => {
                                setViewingRequest(request);
                                setShowApproveModal(true);
                              }}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                setViewingRequest(request);
                                setShowRejectModal(true);
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {viewingRequest && !showApproveModal && !showRejectModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Grade Edit Request Details</h5>
                <button type="button" className="btn-close" onClick={() => setViewingRequest(null)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="small text-muted text-uppercase fw-semibold">Teacher</label>
                    <div className="fw-semibold">{viewingRequest.teacher_name}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="small text-muted text-uppercase fw-semibold">Status</label>
                    <div>{getStatusBadge(viewingRequest.status)}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="small text-muted text-uppercase fw-semibold">Student</label>
                    <div className="fw-semibold">{viewingRequest.student_name}</div>
                    <div className="small text-muted">{viewingRequest.student_id}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="small text-muted text-uppercase fw-semibold">Grade Level & Track</label>
                    <div>Grade {viewingRequest.grade_level} - {viewingRequest.track}</div>
                  </div>
                  <div className="col-md-12">
                    <label className="small text-muted text-uppercase fw-semibold">Subject</label>
                    <div className="fw-semibold">{viewingRequest.subject_name}</div>
                    {viewingRequest.strand && (
                      <div className="small text-muted">{viewingRequest.strand}</div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="small text-muted text-uppercase fw-semibold">Term</label>
                    <div>{viewingRequest.term}</div>
                  </div>
                  <div className="col-md-4">
                    <label className="small text-muted text-uppercase fw-semibold">Original Grade</label>
                    <div className="fs-4 text-danger">{viewingRequest.original_grade}%</div>
                  </div>
                  <div className="col-md-4">
                    <label className="small text-muted text-uppercase fw-semibold">Proposed Grade</label>
                    <div className="fs-4 text-success">
                      {viewingRequest.proposed_grade ? `${viewingRequest.proposed_grade}%` : 'Not specified'}
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="small text-muted text-uppercase fw-semibold">Reason for Correction</label>
                    <div className="p-3 bg-light rounded">{viewingRequest.reason}</div>
                  </div>
                  {viewingRequest.rejection_reason && (
                    <div className="col-12">
                      <label className="small text-muted text-uppercase fw-semibold text-danger">Rejection Reason</label>
                      <div className="p-3 bg-danger bg-opacity-10 rounded text-danger">
                        {viewingRequest.rejection_reason}
                      </div>
                    </div>
                  )}
                  {viewingRequest.corrected_grade && (
                    <div className="col-12">
                      <div className="alert alert-success mb-0">
                        <strong>✓ Correction Applied:</strong> Grade changed to {viewingRequest.corrected_grade}% on{' '}
                        {new Date(viewingRequest.corrected_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button className="btn btn-secondary" onClick={() => setViewingRequest(null)}>
                  Close
                </button>
                {viewingRequest.status === 'pending' && (
                  <>
                    <button 
                      className="btn btn-success"
                      onClick={() => setShowApproveModal(true)}
                    >
                      Approve Request
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => setShowRejectModal(true)}
                    >
                      Reject Request
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && viewingRequest && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Approve Grade Edit Request</h5>
                <button type="button" className="btn-close" onClick={() => setShowApproveModal(false)} />
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to approve this grade edit request?
                </p>
                <div className="alert alert-info mb-0">
                  <strong>{viewingRequest.teacher_name}</strong> will be authorized to change{' '}
                  <strong>{viewingRequest.student_name}'s</strong> grade in{' '}
                  <strong>{viewingRequest.subject_name}</strong> ({viewingRequest.term}) from{' '}
                  <strong>{viewingRequest.original_grade}%</strong> to a corrected value.
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowApproveModal(false)}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-success"
                  onClick={() => approveRequest(viewingRequest.id)}
                  disabled={processing}
                >
                  {processing ? 'Approving...' : 'Approve Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && viewingRequest && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Reject Grade Edit Request</h5>
                <button type="button" className="btn-close" onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }} />
              </div>
              <div className="modal-body">
                <p className="text-danger">
                  Please provide a reason for rejecting this request:
                </p>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Enter rejection reason..."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                />
              </div>
              <div className="modal-footer border-top-0">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                  }}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => rejectRequest(viewingRequest.id)}
                  disabled={processing || !rejectionReason.trim()}
                >
                  {processing ? 'Rejecting...' : 'Reject Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
