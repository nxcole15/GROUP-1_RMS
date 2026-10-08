"use client";

import { useState, useEffect, useRef } from "react";
import React from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { API_BASE } from "../lib/auth";

type Panel = "home"|"grades"|"schedule"|"tuition"|"documents"|"notifications"|"profile";
type JMsg  = { role:"ai"|"user"; text:string; feedback?:"up"|"down"|null };

type IconName =
  | "check" | "checkCircle" | "calendar" | "chart" | "peso" | "clock" | "file"
  | "bot" | "message" | "palette" | "clipboard" | "lightbulb" | "refresh"
  | "thumbsUp" | "thumbsDown" | "graduation" | "book" | "alert" | "x"
  | "camera" | "bell" | "trash" | "arrowRight" | "send" | "download" | "close"
  | "list" | "grid" | "user" | "map-pin";

function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const, className, "aria-hidden": true as const,
  };
  switch (name) {
    case "check":       return <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
    case "checkCircle": return <svg {...p}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
    case "calendar":    return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "chart":       return <svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
    case "peso":        return <svg {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
    case "clock":       return <svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case "file":        return <svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case "bot":         return <svg {...p}><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><circle cx="8" cy="16" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1" fill="currentColor" stroke="none"/></svg>;
    case "message":     return <svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
    case "palette":     return <svg {...p}><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C21.543 6.012 17.285 2 12 2z"/></svg>;
    case "clipboard":   return <svg {...p}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>;
    case "lightbulb":   return <svg {...p}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg>;
    case "refresh":     return <svg {...p}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>;
    case "thumbsUp":    return <svg {...p}><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>;
    case "thumbsDown":  return <svg {...p}><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>;
    case "graduation":  return <svg {...p}><path d="M22 10l-10-5L2 10l10 5 10-5z"/><path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5"/></svg>;
    case "book":        return <svg {...p}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;
    case "alert":       return <svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
    case "x":           return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case "close":       return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case "camera":      return <svg {...p}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
    case "bell":        return <svg {...p}><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>;
    case "trash":       return <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
    case "arrowRight":  return <svg {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    case "send":        return <svg {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
    case "download":    return <svg {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
    case "list":        return <svg {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
    case "grid":        return <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
    case "user":        return <svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case "map-pin":     return <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
    default:            return null;
  }
}

function peso(amount: number) {
  return `\u20B1${amount.toLocaleString()}`;
}

/* -- JOBERT Chat -- */
function JobertChat({ initialPrompt }: { initialPrompt?: string }) {
  const [open, setOpen]     = useState(false);
  const [msgs, setMsgs]     = useState<JMsg[]>([{ role:"ai", text:"Hi! I am JOBERT, your INFORM Assistant. I can help you understand your grades, schedule, tuition, and more. What do you need?" }]);
  const [input, setInput]   = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef           = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, typing]);
  useEffect(() => {
    if (initialPrompt) {
      setOpen(true);
      send(initialPrompt);
    }
  }, [initialPrompt]);


  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: JMsg = { role:"user", text:text.trim() };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs); setInput(""); setTyping(true);
    fetch("/api/jobert", { method:"POST", headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ message:text.trim(), history:newMsgs.slice(-6).map(m => ({ role:m.role, text:m.text })) }) })
      .then(r => r.json())
      .then(d => setMsgs(prev => [...prev, { role:"ai", text:d.reply ?? "Sorry, I could not respond.", feedback:null }]))
      .catch(() => setMsgs(prev => [...prev, { role:"ai", text:"I am having trouble connecting. Please try again.", feedback:null }]))
      .finally(() => setTyping(false));
  }

  function setFeedback(idx: number, val:"up"|"down") {
    setMsgs(prev => prev.map((m,i) => i===idx ? { ...m, feedback:val } : m));
  }

  const suggestions = ["Explain my GWA","How do I pay tuition?","How to request a TOR?","Enrollment deadline?"];

  return (
    <>
      <button onClick={() => setOpen(!open)} style={{ position:"fixed", bottom:24, right:24, zIndex:1050, border:"none", background:"none", padding:0, cursor:"pointer" }}>
        {open
          ? <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width:52, height:52 }}><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="22" height="22"><path d="M18 6L6 18M6 6l12 12"/></svg></div>
          : <div className="position-relative"><img src="/jobert-avatar.png" alt="JOBERT" style={{ width:52, height:52, objectFit:"cover", objectPosition:"center top", borderRadius:"50%", border:"3px solid white", boxShadow:"0 4px 16px rgba(0,0,0,0.2)" }} /><span className="position-absolute top-0 end-0 rounded-circle bg-success border border-white" style={{ width:14, height:14 }} /></div>
        }
      </button>
      {open && (
        <div className="chat-panel">
          <div className="px-4 py-3 d-flex align-items-center gap-3 flex-shrink-0" style={{ background:"linear-gradient(135deg,#2563eb,#1d4ed8)" }}>
            <div className="rounded-circle overflow-hidden flex-shrink-0 border border-white border-opacity-50" style={{ width:36, height:36 }}>
              <img src="/jobert-avatar.png" alt="JOBERT" style={{ width:36, height:36, objectFit:"cover", objectPosition:"center top" }} />
            </div>
            <div className="flex-grow-1"><div className="text-white fw-bold small">JOBERT</div><div className="text-white-50" style={{ fontSize:11 }}>Powered by Zoilo Tomaquin</div></div>
            <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize:10 }}>Online</span>
          </div>
          <div className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-2" style={{ background:"#f8fafc" }}>
            {msgs.map((m,i) => (
              <div key={i} className={`d-flex gap-2 ${m.role==="user"?"flex-row-reverse":""}`}>
                {m.role==="ai" && <div className="rounded-circle overflow-hidden flex-shrink-0 border border-primary border-opacity-25" style={{ width:28, height:28, marginTop:2 }}><img src="/jobert-avatar.png" alt="JOBERT" style={{ width:28, height:28, objectFit:"cover", objectPosition:"center top" }} /></div>}
                <div className="d-flex flex-column gap-1" style={{ maxWidth:"80%" }}>
                  <div className={`rounded-3 px-3 py-2 small lh-base ${m.role==="ai"?"bg-white border shadow-sm":"bg-primary text-white"}`} style={{ whiteSpace:"pre-line", color:m.role==="ai"?"#1e293b":undefined }}>{m.text}</div>
                  {m.role==="ai" && i>0 && (
                    <div className="d-flex gap-1 ms-1">
                      <button onClick={() => setFeedback(i,"up")}   className={`btn btn-sm py-0 px-1 border-0 ${m.feedback==="up"?"text-success":"text-secondary"}`} style={{ fontSize:13 }} aria-label="Helpful"><Icon name="thumbsUp" size={14} /></button>
                      <button onClick={() => setFeedback(i,"down")} className={`btn btn-sm py-0 px-1 border-0 ${m.feedback==="down"?"text-danger":"text-secondary"}`} style={{ fontSize:13 }} aria-label="Not helpful"><Icon name="thumbsDown" size={14} /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="d-flex gap-2">
                <div className="rounded-circle overflow-hidden flex-shrink-0 border border-primary border-opacity-25" style={{ width:28, height:28 }}><img src="/jobert-avatar.png" alt="JOBERT" style={{ width:28, height:28, objectFit:"cover", objectPosition:"center top" }} /></div>
                <div className="bg-white border rounded-3 px-3 py-2 d-flex gap-1 align-items-center shadow-sm">
                  {[0,150,300].map(d => <span key={d} className="rounded-circle bg-primary" style={{ width:6, height:6, display:"inline-block", animation:`blink 1s ${d}ms infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="px-3 py-2 d-flex gap-2 overflow-auto flex-shrink-0 bg-white border-top" style={{ flexWrap:"nowrap" }}>
            {suggestions.map(s => <button key={s} onClick={() => send(s)} className="btn btn-sm btn-outline-primary flex-shrink-0" style={{ fontSize:11, whiteSpace:"nowrap" }}>{s}</button>)}
          </div>
          <div className="px-3 pb-3 pt-2 d-flex gap-2 flex-shrink-0 bg-white">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && send(input)} placeholder="Ask JOBERT anything..." className="form-control form-control-sm" />
            <button onClick={() => send(input)} disabled={!input.trim()||typing} className="btn btn-primary btn-sm px-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="16" height="16"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* -- Data -- */
type ScheduleEntry = { time: string; subject: string; room: string; teacher: string; enter: string; leave: string };

const gradeData: Array<Record<string, any>> = [];
const gradeRequests: Array<Record<string, any>> = [];
const timetable: Record<string, ScheduleEntry[]> = {};
const fees: Array<{ label: string; amount: number; paid: boolean }> = [];
const notifications: Array<Record<string, any>> = [];
const documentRequests: Array<Record<string, any>> = [];
const availableDocuments: Array<{ id: number; type: string; name: string; description: string }> = [];

/* -- Sidebar nav items -- */
const navItems: { id: Panel; label: string; icon: ReactNode }[] = [
  { id:"home",          label:"Dashboard",   icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id:"grades",        label:"My Grades",   icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { id:"schedule",      label:"My Schedule", icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { id:"tuition",       label:"Tuition Fee", icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
  { id:"documents",     label:"Documents",   icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { id:"notifications", label:"Notifications",icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> },
  { id:"profile",       label:"My Profile",  icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

/* -- Sidebar -- */
function Sidebar({ active, setActive, show, setShow, onExpandChange, student }: { active:string; setActive:(s:Panel)=>void; show:boolean; setShow:(b:boolean)=>void; onExpandChange?:(v:boolean)=>void; student?: { student_id:string; full_name:string; pathway:string; grade_level:number; photo_url?:string } | null }) {
  const expanded = true; // Always expanded

  useEffect(() => {
    onExpandChange?.(true);
  }, [onExpandChange]);

  return (
    <>
      {show && <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" style={{ zIndex:1040 }} onClick={() => setShow(false)} />}
      <div
        className={`dashboard-sidebar d-flex flex-column flex-shrink-0 position-fixed top-0 start-0 h-100 ${show?"":"d-none d-lg-flex"}`}
        style={{ width: 256, zIndex:1045, background:"linear-gradient(180deg,#1e1b4b 0%,#312e81 100%)", overflowY:"auto", overflowX:"hidden" }}
      >
        {/* Logo */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-group" style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" }}>
            <img src="/cfei-logo.jpg" alt="CFEI" className="sidebar-brand-logo" />
            <div className="sidebar-brand-info" style={{ alignItems: "center", textAlign: "center", marginTop: 10 }}>
              <div className="sidebar-brand-title">Student Portal</div>
              <div style={{ color:"rgba(165,180,252,0.6)", fontSize:11 }}>{student ? `${(student as any).course ?? ""} ${(student as any).year_level ? `Year ${(student as any).year_level}` : ""}`.trim() : ""}</div>
            </div>
          </div>
          <button className="btn-close btn-close-white sidebar-brand-close d-lg-none" onClick={() => setShow(false)} />
        </div>

        {/* Student badge */}
        <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-3 d-flex align-items-center gap-2" style={{ background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.35)" }}>
          <span className="text-white-50"><Icon name="graduation" size={16} /></span>
          <div>
            <div style={{ color:"#a5b4fc", fontSize:12, fontWeight:700 }}>Student</div>
            <div style={{ color:"rgba(165,180,252,0.6)", fontSize:11 }}>{student ? `${student.pathway} Grade ${student.grade_level}` : ""}</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-grow-1 px-3 py-2 d-flex flex-column gap-1 mt-2">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActive(item.id); setShow(false); }}
              className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0"
              style={{ color:active===item.id?"#fff":"rgba(255,255,255,0.5)", background:active===item.id?"#4f46e5":"transparent", justifyContent:"flex-start", whiteSpace:"nowrap" }}
              title={item.label}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User / logout */}
        <div className="px-3 py-4 border-top border-white border-opacity-10">
          <div className="d-flex flex-column gap-2 rounded-3 px-3 py-3" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }}>
            <div className="d-flex align-items-center gap-3">
              {student?.photo_url ? (
                <img 
                  src={student.photo_url} 
                  alt={student.full_name}
                  className="rounded-circle" 
                  style={{ width:32, height:32, objectFit:"cover" }}
                />
              ) : (
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0" style={{ width:32, height:32, fontSize:12, background:"linear-gradient(135deg,#6366f1,#7c3aed)" }}>
                  {student ? student.full_name.split(" ").map((n:string) => n[0]).join("").slice(0,2): "?"}
                </div>
              )}
              <div className="flex-grow-1 overflow-hidden">
                <div className="text-white small fw-semibold text-truncate">{student?.full_name ?? "Loading..."}</div>
                <div className="text-truncate" style={{ color:"rgba(255,255,255,0.3)", fontSize:11 }}>{student?.student_id}</div>
              </div>
            </div>
            <button onClick={() => { localStorage.removeItem("inform_token"); localStorage.removeItem("inform_role"); localStorage.removeItem("inform_user"); window.location.href = "/login"; }} className="btn btn-sm btn-danger w-100 fw-semibold" style={{ fontSize:12, borderRadius:8 }}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* -- Home / Overview -- */
function HomePanel({ setPanel, onAskJobert, student, dashboardData }: { 
  setPanel:(p:Panel)=>void; 
  onAskJobert:(p:string)=>void; 
  student?: { student_id: string; full_name: string; pathway: string; grade_level: number; term: string; email: string; photo_url?: string } | null;
  dashboardData?: { stats: { average_grade: number; total_paid: number; total_tuition: number; balance_due: number; pending_docs: number }; recent_grades: any[] } | null;
}) {
  const avgGrade = dashboardData?.stats.average_grade || 0;
  const totalPaid = dashboardData?.stats.total_paid || 0;
  const totalFees = dashboardData?.stats.total_tuition || 0;
  const balanceDue = dashboardData?.stats.balance_due || 0;
  const pendingDocs = dashboardData?.stats.pending_docs || 0;

  const quickLinks = [
    { id:"grades"        as Panel, label:"View Grades",  icon:"", bg:"#8b5cf6" },
    { id:"schedule"      as Panel, label:"My Schedule",  icon:"", bg:"#3b82f6" },
    { id:"tuition"       as Panel, label:"Tuition Fee",  icon:"", bg:"#f59e0b" },
    { id:"documents"     as Panel, label:"Documents",    icon:"", bg:"#ec4899" },
  ];

  return (
    <div className="d-flex flex-column gap-0">
      {/* ── Welcome Banner ───────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg,#6366f1 0%,#7c3aed 100%)",
        borderRadius: "16px 16px 0 0",
        padding: "32px 32px 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position:"absolute", top:-50, right:-50, width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
        <div style={{ position:"absolute", bottom:-60, right:160, width:150, height:150, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ position:"absolute", top:20, right:80, width:70, height:70, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <h1 className="fw-bold text-white mb-1" style={{ fontSize:"1.7rem" }}>
            Welcome back, {student?.full_name ?? "Student"}
          </h1>
          <p className="mb-3" style={{ color:"rgba(255,255,255,0.72)", fontSize:14 }}>
            {student?.student_id ?? ""} · {student?.pathway ?? "STEM"} Grade {student?.grade_level ?? "11"} · {student?.term ?? "Term 1"} SY 2025-2026
          </p>
          <div className="d-flex gap-2 flex-wrap">
            <span className="badge px-3 py-2 rounded-pill" style={{ background:"rgba(255,255,255,0.18)", color:"white", border:"1px solid rgba(255,255,255,0.3)", fontSize:"0.78rem" }}>
              ✅ Active Student
            </span>
            <span className="badge px-3 py-2 rounded-pill" style={{ background:"rgba(255,255,255,0.13)", color:"white", border:"1px solid rgba(255,255,255,0.22)", fontSize:"0.78rem" }}>
              📅 Enrollment Open
            </span>
          </div>
        </div>
      </div>

      {/* ── Content pulled up ────────────────────────────────────── */}
      <div className="d-flex flex-column gap-4" style={{ marginTop:"-52px", padding:"0 4px 4px" }}>

        {/* Stat cards — 3 cards (General Average removed) */}
        <div className="row g-3">
          {[
            {
              label: "Tuition Paid", value: peso(totalPaid),
              gradient: "linear-gradient(135deg,#059669,#10b981)", shadow: "rgba(5,150,105,0.35)",
              bgLight: "#f0fdf4", textColor: "#059669",
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
            },
            {
              label: "Balance Due", value: peso(balanceDue),
              gradient: "linear-gradient(135deg,#f59e0b,#fbbf24)", shadow: "rgba(245,158,11,0.35)",
              bgLight: "#fffbeb", textColor: "#d97706",
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
            },
            {
              label: "Pending Docs", value: String(pendingDocs),
              gradient: "linear-gradient(135deg,#3b82f6,#06b6d4)", shadow: "rgba(59,130,246,0.35)",
              bgLight: "#eff6ff", textColor: "#2563eb",
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
            },
          ].map(s => (
            <div key={s.label} className="col-12 col-sm-4">
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
                  <div className="fw-black" style={{ fontSize:"1.55rem", color:s.textColor, lineHeight:1 }}>{s.value}</div>
                  <div className="text-muted mt-1" style={{ fontSize:"0.78rem" }}>{s.label}</div>
                </div>
                <div style={{ height:3, background:s.gradient }} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Grades + Ask JOBERT */}
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-3"
                    style={{ width:36, height:36, background:"linear-gradient(135deg,#6366f1,#7c3aed)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                  </div>
                  <div className="flex-grow-1">
                    <h3 className="fw-bold mb-0" style={{ fontSize:"0.95rem", color:"#1e293b" }}>Recent Grades</h3>
                  </div>
                  <button onClick={() => setPanel("grades")} className="btn btn-link btn-sm p-0 text-primary d-inline-flex align-items-center gap-1" style={{ fontSize:12 }}>
                    View all <Icon name="arrowRight" size={12} />
                  </button>
                </div>
                {gradeData.length === 0 ? (
                  <div className="d-flex flex-column align-items-center justify-content-center py-4 text-center">
                    <div className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                      style={{ width:52, height:52, background:"#f1f5f9" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                      </svg>
                    </div>
                    <p className="text-muted small mb-0">No grades available yet</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {gradeData.slice(0,4).map((g,i) => (
                      <div key={i} className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ background:"#f8fafc" }}>
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="small fw-semibold text-dark text-truncate">{g.subject}</div>
                          <div className="progress mt-1" style={{ height:4, borderRadius:4 }}>
                            <div className="progress-bar" style={{ width:`${g.term1.pct}%`, background:"linear-gradient(135deg,#6366f1,#7c3aed)" }} />
                          </div>
                        </div>
                        <span className="fw-black small" style={{ color:"#6366f1" }}>{g.term1.grade}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-3"
                    style={{ width:36, height:36, background:"linear-gradient(135deg,#2563eb,#3b82f6)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/>
                    </svg>
                  </div>
                  <h3 className="fw-bold mb-0" style={{ fontSize:"0.95rem", color:"#1e293b" }}>Ask JOBERT</h3>
                </div>
                <p className="text-muted small mb-3">Get instant answers about your grades, schedule, tuition, and more.</p>
                <div className="d-flex flex-column gap-2">
                  {["Explain my GWA","How do I pay tuition?","How to request a TOR?"].map(s => (
                    <button key={s} onClick={() => onAskJobert(s)}
                      className="btn text-start rounded-3 d-flex align-items-center gap-2"
                      style={{ fontSize:12, background:"#f8fafc", border:"1px solid #e2e8f0", color:"#475569" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                      </svg>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* -- Grades View -- */

type TermStatus = "not_available" | "request_open" | "released";

function GradeColorLegend() {
  return (
    <div className="rounded-3 px-3 py-2 flex-shrink-0" style={{ background:"#f8fafc", border:"1.5px solid #e2e8f0" }}>
      <div className="fw-semibold text-dark mb-2 d-flex align-items-center gap-1" style={{ fontSize:11, letterSpacing:"0.03em" }}><Icon name="palette" size={12} /> Color Guide</div>
      <div className="d-flex flex-column gap-1">
        {[
          { dot:"#16a34a", color:"#16a34a", label:"80+",      status:"Passed"             },
          { dot:"#d97706", color:"#d97706", label:"75-79",    status:"Lacking Activities" },
          { dot:"#dc2626", color:"#dc2626", label:"Below 75", status:"Failed"             },
        ].map(item => (
          <div key={item.status} className="d-flex align-items-center gap-2">
            <div className="rounded-circle flex-shrink-0" style={{ width:9, height:9, background:item.dot }} />
            <span className="fw-semibold" style={{ fontSize:11, color:item.color }}>{item.status}</span>
            <span className="text-muted" style={{ fontSize:10 }}>({item.label})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GradesNotAvailable({ term }: { term: string }) {
  return (
    <div className="d-flex flex-column gap-4">
      {/* Main empty state card */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-body p-5 text-center">
          <div className="text-muted mb-3" style={{ marginBottom:16 }}><Icon name="clipboard" size={48} /></div>
          <h3 className="fw-black text-dark mb-2">Grades are not yet available</h3>
          <p className="text-muted small mb-0">
            {term} grades will be available once your teacher submits them and the grade request window opens.
          </p>
        </div>
      </div>

      {/* Reminder note */}
      <div className="rounded-3 p-4" style={{ background:"rgba(245,158,11,0.06)", border:"1.5px solid rgba(245,158,11,0.3)" }}>
        <div className="d-flex align-items-start gap-3">
          <span className="text-warning flex-shrink-0"><Icon name="lightbulb" size={22} /></span>
          <div>
            <div className="fw-bold small text-dark mb-1">Reminder / Note</div>
            <p className="text-muted small mb-0" style={{ lineHeight:1.7 }}>
              When the term is almost done, you will be given a <strong>one-week window</strong> to request your grades.
              Make sure to check back during that period so you don&apos;t miss it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Per-subject request status for the request_open state
type SubjectRequestStatus = "idle" | "pending" | "rejected";

// Workflow steps a request goes through
const WORKFLOW_STEPS = [
  { key:"requested",   label:"Requested"      },
  { key:"calculating", label:"Teacher Calculating" },
  { key:"submitted",   label:"Sent to Admin"  },
  { key:"verified",    label:"Admin Verified" },
  { key:"released",    label:"Released"       },
];

function WorkflowTracker({ subject, currentStep }: { subject: string; currentStep: number }) {
  return (
    <div className="mt-3 pt-3" style={{ borderTop:"1px solid #f1f5f9" }}>
      <div className="text-muted mb-2 d-flex align-items-center gap-1" style={{ fontSize:11, fontWeight:600, letterSpacing:"0.03em" }}>
        <Icon name="refresh" size={12} /> Request Progress - {subject}
      </div>
      <div className="d-flex align-items-center gap-1 flex-wrap">
        {WORKFLOW_STEPS.map((step, i) => {
          const done    = currentStep > i;
          const active  = currentStep === i;
          return (
            <React.Fragment key={step.key}>
              <div className="d-flex flex-column align-items-center" style={{ minWidth:52 }}>
                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold mb-1"
                  style={{
                    width:22, height:22, fontSize:10,
                    background: done ? "#4f46e5" : active ? "#e0e7ff" : "#f1f5f9",
                    color:      done ? "#fff"    : active ? "#4f46e5" : "#94a3b8",
                    border:     active ? "2px solid #4f46e5" : "none",
                    transition: "all 0.2s",
                  }}>
                  {done ? <Icon name="check" size={12} /> : i + 1}
                </div>
                <span style={{
                  fontSize:9, textAlign:"center", whiteSpace:"nowrap",
                  color: done ? "#4f46e5" : active ? "#4f46e5" : "#94a3b8",
                  fontWeight: active ? 700 : 400,
                }}>
                  {step.label}
                </span>
              </div>
              {i < WORKFLOW_STEPS.length - 1 && (
                <div style={{ flex:1, height:2, minWidth:8, background: done ? "#4f46e5" : "#e2e8f0", marginBottom:14, transition:"background 0.2s" }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function GradesRequestOpen({ term, existingRequests = [] }: { term: string; existingRequests?: any[] }) {
  // Fetch real enrolled subjects with their DB IDs
  const [enrolledSubjects, setEnrolledSubjects] = useState<{id: number; code: string; subject_name: string; teacher_name: string}[]>([]);
  const [requestMap, setRequestMap] = useState<Record<number, SubjectRequestStatus>>({});
  const [toast, setToast]               = useState<string | null>(null);
  const [confirmSubjectId, setConfirmSubjectId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    fetch(`${API_BASE}/api/enrollment/schedule`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.schedule?.length) {
          const seen = new Set<number>();
          const unique = data.schedule.filter((s: any) => {
            if (seen.has(s.subject_id)) return false;
            seen.add(s.subject_id);
            return true;
          });
          setEnrolledSubjects(unique.map((s: any) => ({
            id: s.subject_id,
            code: s.code,
            subject_name: s.subject_name,
            teacher_name: s.teacher_name,
          })));
          // Init request map � check existing requests for this term
          const map: Record<number, SubjectRequestStatus> = {};
          unique.forEach((s: any) => {
            const existing = existingRequests.find(r => Number(r.subject_id) === s.subject_id);
            if (!existing) {
              map[s.subject_id] = "idle";
            } else if (existing.status === "rejected") {
              map[s.subject_id] = "rejected";
            } else {
              // Any other status (pending, in-progress, released) ? show as "pending" (not requestable)
              map[s.subject_id] = "pending";
            }
          });
          setRequestMap(map);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function handleRequest(subjectId: number, subjectName: string) {
    setConfirmSubjectId(null);
    const token = localStorage.getItem("inform_token");
    if (token) {
      fetch(`${API_BASE}/api/grade-requests/student`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject_id: subjectId, term }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.error) {
            showToast(data.error);
          } else {
            setRequestMap(prev => ({ ...prev, [subjectId]: "pending" }));
            showToast(`Grade request for ${subjectName} sent to your teacher.`);
          }
        })
        .catch(() => {
          setRequestMap(prev => ({ ...prev, [subjectId]: "pending" }));
          showToast(`Grade request for ${subjectName} sent.`);
        });
    } else {
      setRequestMap(prev => ({ ...prev, [subjectId]: "pending" }));
    }
  }

  const confirmSubject = enrolledSubjects.find(s => s.id === confirmSubjectId);
  
  // Filter logic: 
  // - "idle" subjects need action (can request)
  // - "pending" subjects are in progress
  // - "rejected" subjects can be re-requested
  // - "released_to_student" subjects should NOT show in cards
  const unreleased = enrolledSubjects.filter(s => {
    const existing = existingRequests.find(r => Number(r.subject_id) === s.id);
    return existing?.status !== "released_to_student";
  });
  
  const allRequested   = unreleased.length > 0 && unreleased.every(s => requestMap[s.id] === "pending");
  const pendingCount   = unreleased.filter(s => requestMap[s.id] === "pending").length;

  return (
    <div className="d-flex flex-column gap-4">

      {/* Toast */}
      {toast && (
        <div className="position-fixed bottom-0 end-0 m-4 rounded-3 px-4 py-3 shadow-lg d-flex align-items-center gap-2 text-white"
          style={{ zIndex:9999, fontSize:13, minWidth:280, background:"#1e293b", animation:"fadeInUp 0.3s ease" }}>
          {toast}
        </div>
      )}

      {/* Confirm modal */}
      {confirmSubject && (
        <div className="modal d-block" style={{ background:"rgba(0,0,0,0.45)", zIndex:9998 }} onClick={() => setConfirmSubjectId(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content rounded-3 border-0 shadow-lg">
              <div className="modal-body p-4">
                <div className="text-primary mb-3"><Icon name="clipboard" size={36} /></div>
                <h5 className="fw-black text-dark mb-1">Request Grade?</h5>
                <p className="text-muted small mb-4">
                  You are about to request your <strong>{term}</strong> grade for <strong>{confirmSubject.subject_name}</strong>.
                  Your teacher will be notified to prepare and release your grade.
                </p>
                <div className="d-flex gap-2">
                  <button onClick={() => handleRequest(confirmSubject.id, confirmSubject.subject_name)}
                    className="btn btn-primary flex-grow-1 fw-bold rounded-2">
                    Yes, Request Grade
                  </button>
                  <button onClick={() => setConfirmSubjectId(null)}
                    className="btn btn-outline-secondary flex-grow-1 rounded-2">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress summary */}
      {pendingCount > 0 && !allRequested && (
        <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
          style={{ background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.25)" }}>
          <span className="text-warning"><Icon name="clock" size={16} /></span>
          <span className="small text-dark">
            <strong>{pendingCount}</strong> of <strong>{unreleased.length}</strong> grade request{pendingCount > 1 ? "s" : ""} sent - waiting for your teachers.
          </span>
        </div>
      )}

      {/* All requested � simple confirmation banner */}
      {allRequested && (
        <div className="d-flex align-items-center gap-3 px-4 py-3 rounded-3"
          style={{ background:"rgba(16,185,129,0.07)", border:"1.5px solid rgba(16,185,129,0.3)" }}>
          <span className="text-success"><Icon name="checkCircle" size={20} /></span>
          <span className="fw-semibold small text-dark">
            All grade requests sent! Please wait for your teachers to release your grades.
          </span>
        </div>
      )}

      {/* Subject cards � only show unreleased subjects */}
      {unreleased.length === 0 && (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-4 text-center text-muted small">
            No subjects available for grade requests.
          </div>
        </div>
      )}
      <div className="row g-3">
        {unreleased.map((subj) => {
          const status = requestMap[subj.id] ?? "idle";
          return (
            <div key={subj.id} className="col-12 col-sm-6">
              <div className="card border-0 shadow-sm rounded-3 h-100"
                style={{ borderLeft: status === "pending" ? "4px solid #f59e0b" : status === "rejected" ? "4px solid #ef4444" : "4px solid #e2e8f0" }}>
                <div className="card-body p-4">

                  {/* Subject header */}
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-3 bg-light border d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width:40, height:40 }}><Icon name="book" size={18} /></div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-bold small text-dark text-truncate">{subj.subject_name}</div>
                      <div className="text-muted" style={{ fontSize:11 }}>{subj.teacher_name} - {subj.code}</div>
                    </div>
                  </div>

                  {/* Action / status area */}
                  {(() => {
                    const existing = existingRequests.find(r => Number(r.subject_id) === subj.id);
                    // Grade fully released � show it, no re-request allowed
                    if (existing?.status === "released_to_student") {
                      const score = Number(existing.score);
                      const color = score >= 80 ? "#16a34a" : score >= 75 ? "#d97706" : "#dc2626";
                      return (
                        <div className="rounded-3 p-3 text-center" style={{ background: "rgba(16,185,129,0.07)", border: "1.5px solid rgba(16,185,129,0.3)" }}>
                          <div className="fw-black text-success mb-1" style={{ fontSize: 28 }}>
                            {score >= 97 ? "A+" : score >= 93 ? "A" : score >= 90 ? "A-" : score >= 87 ? "B+" : score >= 83 ? "B" : score >= 80 ? "B-" : score >= 77 ? "C+" : score >= 73 ? "C" : score >= 70 ? "C-" : score >= 65 ? "D" : "F"}
                          </div>
                          <div className="fw-semibold small" style={{ color }}>Score: {existing.score}</div>
                          <div className="text-muted mt-1 d-inline-flex align-items-center gap-1" style={{ fontSize: 11 }}><Icon name="checkCircle" size={12} /> Grade Released</div>
                        </div>
                      );
                    }
                    // Already requested and in-progress
                    if (status === "pending") {
                      return (
                        <>
                          <div className="rounded-3 p-3 text-center mb-0" style={{ background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.3)" }}>
                            <div className="fw-semibold small mb-1 text-warning d-inline-flex align-items-center gap-1"><Icon name="clock" size={12} /> Request Sent</div>
                            <div className="text-muted" style={{ fontSize:11 }}>
                              {existing ? (() => {
                                const s = existing.status;
                                if (s === "registrar_review") return "Registrar is reviewing";
                                if (s === "principal_review") return "Principal is reviewing";
                                if (s === "principal_approved") return "Approved - awaiting release";
                                if (s === "registrar_released") return "Sent back to teacher";
                                return "Waiting for your teacher";
                              })() : "Waiting for your teacher."}
                            </div>
                          </div>
                          <WorkflowTracker subject={subj.subject_name} currentStep={0} />
                        </>
                      );
                    }
                    // Can request
                    if (status === "idle") {
                      return (
                        <button onClick={() => setConfirmSubjectId(subj.id)}
                          className="btn btn-primary btn-sm w-100 rounded-2 fw-semibold"
                          style={{ fontSize:12 }}>
                          Request Grade
                        </button>
                      );
                    }
                    // Rejected � allow re-request
                    if (status === "rejected") {
                      return (
                        <div className="d-flex flex-column gap-2">
                          <div className="rounded-3 p-2 text-center" style={{ background:"rgba(220,38,38,0.07)", border:"1px solid rgba(220,38,38,0.25)" }}>
                            <div className="fw-semibold small" style={{ color:"#dc2626" }}>Request Rejected</div>
                            <div className="text-muted" style={{ fontSize:11 }}>Contact your teacher for details.</div>
                          </div>
                          <button onClick={() => setConfirmSubjectId(subj.id)}
                            className="btn btn-outline-danger btn-sm w-100 rounded-2" style={{ fontSize:11 }}>
                            Re-request Grade
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}

                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

function GradesView({ onAskJobert: _onAskJobert }: { onAskJobert:(p:string)=>void }) {
  const [selectedTerm, setSelectedTerm] = useState<"term1"|"term2"|"term3">("term1");
  const [requestConfig, setRequestConfig] = useState<{term: string; is_open: number}[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list"|"card">("list"); // Default to list view
  const [schoolYear, setSchoolYear] = useState<string>("2025-2026"); // Default school year

  const termLabel = selectedTerm === "term1" ? "Term 1" : selectedTerm === "term2" ? "Term 2" : "Term 3";
  const configEntry = requestConfig.find(c => c.term === termLabel);
  const isRequestOpen = !!configEntry?.is_open;

  // Fetch student info to get school year from schedules
  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    fetch(`${API_BASE}/api/student/schedules`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { 
        if (data?.schedules?.[0]?.school_year) {
          setSchoolYear(data.schedules[0].school_year);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch term config (no auth needed) – poll every 15s so it auto-updates when principal opens/closes
  useEffect(() => {
    function fetchConfig() {
      fetch(`${API_BASE}/api/grade-requests/config`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.config) setRequestConfig(data.config); })
        .catch(() => {});
    }
    fetchConfig();
    const interval = setInterval(fetchConfig, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch student's own grade requests � poll every 15s for live status updates
  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    function fetchRequests() {
      fetch(`${API_BASE}/api/grade-requests/student`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.requests) setMyRequests(data.requests); })
        .catch(() => {});
    }
    setLoading(true);
    fetchRequests();
    setLoading(false);
    const interval = setInterval(fetchRequests, 15000);
    return () => clearInterval(interval);
  }, []);

  // Requests for selected term
  const termRequests = myRequests.filter(r => r.term === termLabel);
  const releasedGrades = termRequests.filter(r => r.status === "released_to_student");
  const pendingRequests = termRequests.filter(r => r.status !== "released_to_student");

  function statusLabel(status: string): string {
    const map: Record<string, string> = {
      student_requested:  "Requested - waiting for teacher",
      teacher_calculating:"Teacher is calculating",
      registrar_review:   "Sent to Registrar",
      principal_review:   "Principal Review",
      principal_approved: "Principal Approved",
      registrar_released: "Released by Registrar",
      rejected:           "Rejected",
    };
    return map[status] || status;
  }

  function statusColor(status: string): string {
    if (status === "rejected") return "bg-danger-subtle text-danger border border-danger-subtle";
    if (status === "student_requested") return "bg-warning-subtle text-warning border border-warning-subtle";
    if (status === "principal_approved" || status === "registrar_released") return "bg-success-subtle text-success border border-success-subtle";
    return "bg-primary-subtle text-primary border border-primary-subtle";
  }

  return (
    <div className="d-flex flex-column gap-3">
      {/* Header + status indicator grouped — no gap between them */}
      <div>
        <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap mb-2">
          <div>
            <h2 className="fw-black fs-4 text-dark mb-1">My Grades</h2>
            <p className="text-muted small mb-0">School Year {schoolYear}</p>
          </div>
          <GradeColorLegend />
        </div>

        {/* Status indicator directly below heading — no extra gap */}
        {isRequestOpen ? (
          <div className="d-flex align-items-center gap-2 mt-1">
            <span className="d-inline-block rounded-circle bg-success" style={{ width:8, height:8 }} />
            <span className="fw-bold small text-dark">Grade Request Window Open — {termLabel}</span>
          </div>
        ) : (
          <div className="d-flex align-items-center gap-2 mt-1">
            <span className="d-inline-block rounded-circle bg-danger" style={{ width:8, height:8 }} />
            <span className="fw-bold small text-muted">Grade Request Window Closed — {termLabel}</span>
          </div>
        )}
      </div>

      {/* Blue instructional box — only when request window is open */}
      {isRequestOpen && (
        <div className="rounded-3 p-3 d-flex align-items-start gap-3"
          style={{ background:"rgba(99,102,241,0.06)", border:"1.5px solid rgba(99,102,241,0.25)" }}>
          <span className="text-primary flex-shrink-0"><Icon name="bell" size={20} /></span>
          <div className="small text-muted">
            You can now request your grades for this term. Click <strong>Request Grade</strong> on each subject. Your teacher will be notified to prepare and release your grades.
          </div>
        </div>
      )}

      {/* Term selector */}
      <div className="d-flex gap-2">
        {(["term1","term2","term3"] as const).map((t,i) => (
          <button key={t} onClick={() => setSelectedTerm(t)}
            className={`btn btn-sm flex-grow-1 rounded-2 ${selectedTerm===t?"btn-primary":"btn-outline-secondary"}`}>
            Term {i+1}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-4"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}

      {/* Released grades with view toggle */}
      {!loading && releasedGrades.length > 0 && (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center gap-2">
            <span className="fw-bold small text-dark">Released Grades - {termLabel}</span>
            <span className="badge bg-success text-white ms-auto d-inline-flex align-items-center gap-1" style={{ fontSize: 10 }}><Icon name="check" size={10} /> Official</span>
            
            {/* View toggle buttons */}
            <div className="btn-group btn-group-sm ms-2" role="group">
              <button 
                type="button" 
                className={`btn ${viewMode === "list" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setViewMode("list")}
                style={{ fontSize: 11 }}>
                <Icon name="list" size={14} /> List
              </button>
              <button 
                type="button" 
                className={`btn ${viewMode === "card" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setViewMode("card")}
                style={{ fontSize: 11 }}>
                <Icon name="grid" size={14} /> Card
              </button>
            </div>
          </div>
          
          {/* List View */}
          {viewMode === "list" && (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing:"0.05em" }}>Subject</th>
                    <th className="small text-muted fw-semibold text-uppercase d-none d-sm-table-cell" style={{ letterSpacing:"0.05em" }}>Teacher</th>
                    <th className="small text-muted fw-semibold text-uppercase text-end" style={{ letterSpacing:"0.05em" }}>Score</th>
                    <th className="small text-muted fw-semibold text-uppercase text-end pe-4" style={{ letterSpacing:"0.05em" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {releasedGrades.map((g, i) => {
                    const score = Number(g.score);
                    const color = score >= 80 ? "#16a34a" : score >= 75 ? "#d97706" : "#dc2626";
                    return (
                      <tr key={i}>
                        <td className="ps-4">
                          <div className="small fw-medium text-dark">{g.subject_name}</div>
                          <div className="text-muted" style={{fontSize:11}}>{g.subject_code}</div>
                        </td>
                        <td className="d-none d-sm-table-cell small text-muted">{g.teacher_name}</td>
                        <td className="text-end">
                          <div className="d-flex align-items-center justify-content-end gap-2">
                            <div className="progress flex-shrink-0" style={{ width:60, height:6 }}>
                              <div className="progress-bar" style={{ width:`${score}%`, background:color }} />
                            </div>
                            <span className="small fw-semibold" style={{color}}>{score}</span>
                          </div>
                        </td>
                        <td className="text-end pe-4">
                          <span className="badge bg-success text-white d-inline-flex align-items-center gap-1" style={{ fontSize: 10 }}><Icon name="check" size={10} /> Released</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Card View */}
          {viewMode === "card" && (
            <div className="p-4">
              <div className="row g-3">
                {releasedGrades.map((g, i) => {
                  const score = Number(g.score);
                  const letterGrade = score >= 97 ? "A+" : score >= 93 ? "A" : score >= 90 ? "A-" : score >= 87 ? "B+" : score >= 83 ? "B" : score >= 80 ? "B-" : score >= 77 ? "C+" : score >= 73 ? "C" : score >= 70 ? "C-" : score >= 65 ? "D" : "F";
                  const color = score >= 80 ? "#16a34a" : score >= 75 ? "#d97706" : "#dc2626";
                  return (
                    <div key={i} className="col-12 col-sm-6 col-lg-4">
                      <div className="card border-0 shadow-sm rounded-3 h-100">
                        <div className="card-body p-4">
                          {/* Subject header */}
                          <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="rounded-3 bg-light border d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width:40, height:40 }}><Icon name="book" size={18} /></div>
                            <div className="flex-grow-1 overflow-hidden">
                              <div className="fw-bold small text-dark text-truncate">{g.subject_name}</div>
                              <div className="text-muted" style={{ fontSize:11 }}>{g.teacher_name} - {g.subject_code}</div>
                            </div>
                          </div>
                          
                          {/* Grade display */}
                          <div className="rounded-3 p-3 text-center" style={{ background: "rgba(16,185,129,0.07)", border: "1.5px solid rgba(16,185,129,0.3)" }}>
                            <div className="fw-black text-success mb-1" style={{ fontSize: 28 }}>{letterGrade}</div>
                            <div className="fw-semibold small" style={{ color }}>Score: {score}</div>
                            <div className="text-muted mt-1 d-inline-flex align-items-center gap-1" style={{ fontSize: 11 }}><Icon name="checkCircle" size={12} /> Grade Released</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pending requests � show status tracker */}
      {!loading && pendingRequests.length > 0 && (
        <div className="d-flex flex-column gap-2">
          <h3 className="fw-bold small text-dark mb-1 d-flex align-items-center gap-1"><Icon name="clipboard" size={14} /> Request Status - {termLabel}</h3>
          {pendingRequests.map((r, i) => (
            <div key={i} className="card border-0 shadow-sm rounded-3">
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <div className="flex-grow-1">
                  <div className="fw-bold small text-dark">{r.subject_name}</div>
                  <div className="text-muted" style={{ fontSize: 11 }}>{r.subject_code} - {r.teacher_name}</div>
                </div>
                <span className={`badge ${statusColor(r.status)}`} style={{ fontSize: 10 }}>
                  {statusLabel(r.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No requests and window closed */}
      {!loading && termRequests.length === 0 && !isRequestOpen && (
        <GradesNotAvailable term={termLabel} />
      )}

      {/* Grade request section � only when window is open */}
      {!loading && isRequestOpen && (
        <div>
          <GradesRequestOpen term={termLabel} existingRequests={myRequests.filter(r => r.term === termLabel)} />
        </div>
      )}
    </div>
  );
}

/* -- Schedule View -- */
function ScheduleView({ onAskJobert }: { onAskJobert:(p:string)=>void }) {
  const [schedules, setSchedules] = useState<{
    schedule_id: number;
    subject_name: string;
    room: string;
    day: string;
    time_start: string;
    time_end: string;
    teacher_name: string;
    department: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  useEffect(() => {
    loadSchedules();
  }, []);

  async function loadSchedules() {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/student/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data?.schedules) {
          setSchedules(data.schedules);
        }
      }
    } catch (err) {
      console.error("Failed to load schedules:", err);
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
    return schedules.filter((schedule) => {
      if (schedule.day !== day) return false;
      
      const scheduleStart = schedule.time_start.slice(0, 5);
      const scheduleEnd = schedule.time_end.slice(0, 5);
      const slotEnd = `${(parseInt(timeSlot.slice(0, 2)) + 1).toString().padStart(2, '0')}:00`;
      
      return scheduleStart <= timeSlot && scheduleEnd > timeSlot;
    });
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
        <div>
          <h2 className="fw-black fs-4 text-dark mb-1">My Schedule</h2>
          <p className="text-muted small mb-0">Term 1 - 2025-2026</p>
        </div>
        <button 
          onClick={loadSchedules}
          className="btn btn-outline-primary btn-sm" 
          style={{ fontSize: 12 }}
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary spinner-border-sm" />
          <p className="text-muted mt-2 small">Loading your schedule...</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-5 text-center">
            <div className="text-muted">
              <Icon name="calendar" size={48} />
              <p className="mt-3 mb-0">No enrolled classes yet</p>
              <p className="small text-muted">Contact the registrar to enroll in classes</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-3">
            <div className="table-responsive">
              <table className="table table-bordered table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '80px', fontSize: '0.75rem' }} className="text-center">Time</th>
                    {daysOfWeek.map(day => (
                      <th key={day} style={{ fontSize: '0.75rem', minWidth: '140px' }} className="text-center fw-bold">
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
                        const daySchedules = getSchedulesForDayAndTime(day, timeSlot);
                        return (
                          <td key={`${day}-${timeSlot}`} className="p-1" style={{ verticalAlign: 'top' }}>
                            {daySchedules.map((schedule) => (
                              <div 
                                key={schedule.schedule_id}
                                className="card mb-1 border cursor-pointer"
                                style={{ 
                                  fontSize: '0.7rem',
                                  backgroundColor: '#e7f3ff',
                                  borderColor: '#4a90e2 !important'
                                }}
                                onClick={() => setSelectedSchedule(schedule)}
                              >
                                <div className="card-body p-2">
                                  <div className="fw-bold text-dark mb-1" style={{ fontSize: '0.75rem' }}>
                                    {schedule.subject_name}
                                  </div>
                                  <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                                    📍 {schedule.room}
                                  </div>
                                  <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                                    👨‍🏫 {schedule.teacher_name}
                                  </div>
                                  <div className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>
                                    {schedule.time_start.slice(0, 5)} - {schedule.time_end.slice(0, 5)}
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
          </div>
        </div>
      )}

      {/* Schedule Details Modal */}
      {selectedSchedule && (
        <div 
          className="modal d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedSchedule(null)}
        >
          <div 
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">{selectedSchedule.subject_name}</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setSelectedSchedule(null)}
                />
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Icon name="user" size={16} />
                      <strong className="small">Teacher:</strong>
                    </div>
                    <p className="ms-4 mb-0">{selectedSchedule.teacher_name}</p>
                    <p className="ms-4 mb-0 text-muted small">{selectedSchedule.department}</p>
                  </div>
                  
                  <div className="col-6">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Icon name="calendar" size={16} />
                      <strong className="small">Day:</strong>
                    </div>
                    <p className="ms-4 mb-0">{selectedSchedule.day}</p>
                  </div>
                  
                  <div className="col-6">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Icon name="clock" size={16} />
                      <strong className="small">Time:</strong>
                    </div>
                    <p className="ms-4 mb-0">
                      {selectedSchedule.time_start.slice(0, 5)} - {selectedSchedule.time_end.slice(0, 5)}
                    </p>
                  </div>
                  
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Icon name="map-pin" size={16} />
                      <strong className="small">Room:</strong>
                    </div>
                    <p className="ms-4 mb-0">{selectedSchedule.room}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedSchedule(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -- Tuition View -- */
function TuitionView({ onAskJobert }: { onAskJobert:(p:string)=>void }) {
  const [apiPayments, setApiPayments] = useState<{id:number;fee_item:string;amount:number;status:string;paid_at:string|null}[]>([]);
  const [summary, setSummary] = useState<{total_assessment:number;total_paid:number;remaining_balance:number}|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    if (!token || token.startsWith("demo_")) return;
    setLoading(true);
    setError(false);
    fetch(`${API_BASE}/api/payments`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.payments?.length) setApiPayments(data.payments);
        if (data?.summary) setSummary(data.summary);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Use API data if available, else fallback to mock
  const useApi = apiPayments.length > 0;
  const total  = useApi ? (summary?.total_assessment ?? fees.reduce((a,f) => a+f.amount, 0)) : fees.reduce((a,f) => a+f.amount, 0);
  const paid   = useApi ? (summary?.total_paid ?? fees.filter(f=>f.paid).reduce((a,f) => a+f.amount, 0)) : fees.filter(f=>f.paid).reduce((a,f) => a+f.amount, 0);
  const balance= useApi ? (summary?.remaining_balance ?? total - paid) : total - paid;
  return (
    <div className="d-flex flex-column gap-4">
      <div><h2 className="fw-black fs-4 text-dark mb-1">Tuition Fee</h2><p className="text-muted small mb-0">Term 1 - 2025-2026</p></div>
      <div className="row g-3">
        {[
          { label:"Total Fees",  value:peso(total),   cls:"bg-light border",                                        val:"text-dark"    },
          { label:"Amount Paid", value:peso(paid),    cls:"bg-success-subtle border-success-subtle",                val:"text-success" },
          { label:"Balance Due", value:peso(balance), cls:balance>0?"bg-danger-subtle border-danger-subtle":"bg-success-subtle border-success-subtle", val:balance>0?"text-danger":"text-success" },
        ].map(s => (
          <div key={s.label} className="col-4">
            <div className={`card border rounded-3 ${s.cls}`}><div className="card-body p-3 text-center"><div className="text-muted small mb-1">{s.label}</div><div className={`fw-black fs-5 ${s.val}`}>{s.value}</div></div></div>
          </div>
        ))}
      </div>
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing:"0.05em" }}>Fee Item</th>
                <th className="small text-muted fw-semibold text-uppercase text-end" style={{ letterSpacing:"0.05em" }}>Amount</th>
                <th className="small text-muted fw-semibold text-uppercase text-end pe-4" style={{ letterSpacing:"0.05em" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="text-center py-4"><div className="spinner-border text-primary spinner-border-sm" role="status"></div></td></tr>
              ) : useApi ? (
                apiPayments.map((f,i) => (
                  <tr key={i}>
                    <td className="ps-4 small fw-medium text-dark">{f.fee_item}</td>
                    <td className="text-end small text-dark">{peso(Number(f.amount))}</td>
                    <td className="text-end pe-4"><span className={`badge ${f.status==="paid"?"bg-success-subtle text-success border border-success-subtle":"bg-danger-subtle text-danger border border-danger-subtle"}`}>{f.status==="paid" ? <span className="d-inline-flex align-items-center gap-1"><Icon name="check" size={10} /> Paid</span> : "Unpaid"}</span></td>
                  </tr>
                ))
              ) : (
                fees.map((f,i) => (
                  <tr key={i}>
                    <td className="ps-4 small fw-medium text-dark">{f.label}</td>
                    <td className="text-end small text-dark">{peso(f.amount)}</td>
                    <td className="text-end pe-4"><span className={`badge ${f.paid?"bg-success-subtle text-success border border-success-subtle":"bg-danger-subtle text-danger border border-danger-subtle"}`}>{f.paid ? <span className="d-inline-flex align-items-center gap-1"><Icon name="check" size={10} /> Paid</span> : "Unpaid"}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {error && <div className="alert alert-warning small">Could not load data. Showing cached data.</div>}
      {balance>0 && (
        <div className="alert alert-warning d-flex align-items-start gap-2">
          
          <div className="small">You have an outstanding balance of <strong>{peso(balance)}</strong>. Please settle at the Finance Office or visit the Student Portal for online payment options.</div>
        </div>
      )}
      <button onClick={() => onAskJobert(`My tuition balance is ${peso(balance)}. How do I pay it?`)} className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1" style={{ fontSize:12 }}><Icon name="bot" size={14} /> Ask JOBERT about payment</button>
    </div>
  );
}

/* -- Documents View -- */
function DocumentsView({ onAskJobert }: { onAskJobert:(p:string)=>void }) {
  const [requests, setRequests]     = useState(documentRequests);
  const [showModal, setShowModal]   = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [purpose, setPurpose]       = useState("");
  const [copies, setCopies]         = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState<string|null>(null);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError]   = useState(false);

  const DOCUMENT_CATALOG = [
    { type:"School Form 10 (Form 137)",              price:"₱250.00",       days:"10-15 working days" },
    { type:"School Form 9 - Report Card (1st copy)", price:"Free of charge", days:"2-3 working days"   },
    { type:"School Form 9 - Report Card (2nd copy)", price:"₱150.00",       days:"2-3 working days"   },
    { type:"Diploma (1st copy)",                     price:"Free of charge", days:"10-15 working days" },
    { type:"Diploma (succeeding copies)",            price:"₱500.00",       days:"10-15 working days" },
    { type:"Certificate of Enrollment",              price:"₱100.00",       days:"3-5 working days"   },
    { type:"Certificate of Graduation",              price:"₱100.00",       days:"3-5 working days"   },
    { type:"Certificate of Grades (GWA)",            price:"₱100.00",       days:"3-5 working days"   },
    { type:"Certificate of Good Moral",              price:"₱50.00",        days:"3-5 working days"   },
    { type:"ESC Certificate / SHS-Voucher Cert.",    price:"₱100.00",       days:"3-5 working days"   },
    { type:"Official Grade Slip (Employment/Any Purpose)", price:"₱100.00", days:"3-5 working days"   },
    { type:"CTC - Form 137 (scanned)",               price:"₱25 colored / ₱20 B&W", days:"1 day"     },
    { type:"CTC - Report Card / Grade Slip",         price:"₱25 colored / ₱20 B&W", days:"1 day"     },
    { type:"CTC - NSO Cert. of Live Birth",          price:"₱25 colored / ₱20 B&W", days:"1 day"     },
  ];

  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    if (!token || token.startsWith("demo_")) return;
    setDocsLoading(true);
    setDocsError(false);
    fetch(`${API_BASE}/api/documents`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.documents?.length) {
          setRequests(data.documents.map((d: {id:number;document_type:string;purpose:string;copies:number;status:string;expected_release_date:string|null;created_at:string}) => ({
            id: d.id,
            type: d.document_type,
            status: d.status === "approved" ? "approved" : d.status === "rejected" ? "rejected" : "pending",
            requestedAt: new Date(d.created_at).toLocaleDateString("en-PH",{month:"long",day:"numeric",year:"numeric"}),
            approvedAt: d.status === "approved" ? d.expected_release_date : null,
            approvedBy: d.status === "approved" ? "Registrar" : null,
            releaseDate: d.expected_release_date,
            downloadUrl: d.status === "approved" ? "#" : null,
          })));
        }
      })
      .catch(() => setDocsError(true))
      .finally(() => setDocsLoading(false));
  }, []);

  function openModal() { setSelectedType(""); setPurpose(""); setCopies(1); setShowModal(true); }

  async function submitRequest() {
    if (!selectedType) { setToast("⚠️ Please select a document type."); setTimeout(()=>setToast(null),3000); return; }
    setSubmitting(true);
    const token = localStorage.getItem("inform_token");
    // Optimistic UI
    setRequests(prev => [...prev, { id:Date.now(), type:selectedType, status:"pending",
      requestedAt:new Date().toLocaleDateString("en-PH",{month:"long",day:"numeric",year:"numeric"}),
      approvedAt:null, approvedBy:null, releaseDate:null, downloadUrl:null }]);
    setShowModal(false);
    if (token && !token.startsWith("demo_")) {
      await fetch(`${API_BASE}/api/documents`, {
        method:"POST",
        headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
        credentials:"include",
        body: JSON.stringify({ document_type: selectedType, purpose: purpose||"Personal use", copies }),
      }).catch(()=>{});
    }
    setToast("✅ Document request submitted!");
    setTimeout(()=>setToast(null), 3000);
    setSubmitting(false);
  }

  const pending  = requests.filter(r => r.status==="pending");
  const approved = requests.filter(r => r.status==="approved");
  const rejected = requests.filter(r => r.status==="rejected");

  return (
    <div className="d-flex flex-column gap-0">

      {/* Toast */}
      {toast && (
        <div className="position-fixed top-0 start-50 translate-middle-x" style={{ zIndex:9999, marginTop:20 }}>
          <div className="d-flex align-items-center gap-3 px-4 py-3 rounded-4 shadow-lg"
            style={{ background: toast.startsWith("⚠️") ? "#fef2f2" : "#f0fdf4", border: toast.startsWith("⚠️") ? "1px solid #fecaca" : "1px solid #bbf7d0", minWidth:320 }}>
            <span style={{ fontSize:20 }}>{toast.startsWith("⚠️") ? "⚠️" : "✅"}</span>
            <span className="fw-semibold" style={{ color: toast.startsWith("⚠️") ? "#dc2626" : "#16a34a", fontSize:14 }}>
              {toast.replace(/^(⚠️|✅)\s*/,"")}
            </span>
          </div>
        </div>
      )}

      {/* Banner */}
      <div style={{ background:"linear-gradient(135deg,#ec4899 0%,#8b5cf6 100%)", borderRadius:"16px 16px 0 0", padding:"32px 32px 80px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-50, right:-50, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
        <div style={{ position:"absolute", bottom:-40, right:140, width:130, height:130, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <h1 className="fw-bold text-white mb-1" style={{ fontSize:"1.6rem" }}>Documents</h1>
          <p className="mb-0" style={{ color:"rgba(255,255,255,0.75)" }}>Request official school documents from the Registrar&apos;s Office</p>
        </div>
      </div>

      {/* Content */}
      <div className="d-flex flex-column gap-4" style={{ marginTop:"-52px", paddingBottom:8 }}>

        {/* Request button card */}
        <div className="card border-0 shadow-lg rounded-4">
          <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h5 className="fw-bold mb-1" style={{ color:"#1e293b" }}>Need a document?</h5>
              <p className="text-muted small mb-0">Submit a request and the Registrar&apos;s Office will process it for you.</p>
            </div>
            <button onClick={openModal}
              className="btn fw-semibold d-flex align-items-center gap-2"
              style={{ background:"linear-gradient(135deg,#ec4899,#8b5cf6)", color:"white", border:"none", borderRadius:10, padding:"10px 24px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Request Document
            </button>
          </div>
        </div>

        {docsLoading && <div className="text-center py-4"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}
        {docsError && <div className="rounded-3 p-3 small" style={{ background:"#fffbeb", border:"1px solid #fef08a", color:"#92400e" }}>Could not load latest data. Showing cached results.</div>}

        {/* My Requests */}
        {(pending.length > 0 || approved.length > 0 || rejected.length > 0) && (
          <div>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="d-flex align-items-center justify-content-center rounded-3"
                style={{ width:32, height:32, background:"linear-gradient(135deg,#ec4899,#8b5cf6)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <h3 className="fw-bold mb-0" style={{ fontSize:"0.95rem", color:"#1e293b" }}>My Requests</h3>
              <span className="badge rounded-pill ms-1" style={{ background:"#f5f3ff", color:"#7c3aed", border:"1px solid #ddd6fe", fontSize:"0.72rem" }}>
                {requests.length} total
              </span>
            </div>
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={{ background:"#f8fafc" }}>
                    <tr>
                      <th className="small fw-semibold text-uppercase ps-4" style={{ letterSpacing:"0.05em", color:"#64748b", paddingTop:14, paddingBottom:14 }}>Document Type</th>
                      <th className="small fw-semibold text-uppercase d-none d-md-table-cell" style={{ letterSpacing:"0.05em", color:"#64748b" }}>Requested</th>
                      <th className="small fw-semibold text-uppercase d-none d-md-table-cell" style={{ letterSpacing:"0.05em", color:"#64748b" }}>Release Date</th>
                      <th className="small fw-semibold text-uppercase pe-4 text-end" style={{ letterSpacing:"0.05em", color:"#64748b" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...pending, ...approved, ...rejected].map(r => (
                      <tr key={r.id}>
                        <td className="ps-4 small fw-semibold text-dark align-middle">{r.type}</td>
                        <td className="small text-muted align-middle d-none d-md-table-cell">{r.requestedAt}</td>
                        <td className="small text-muted align-middle d-none d-md-table-cell">{r.releaseDate || "—"}</td>
                        <td className="pe-4 text-end align-middle">
                          {r.status === "approved" && <span className="badge rounded-pill px-3 py-2" style={{ background:"#f0fdf4", color:"#16a34a", border:"1px solid #bbf7d0", fontSize:"0.72rem" }}>Approved</span>}
                          {r.status === "pending"  && <span className="badge rounded-pill px-3 py-2" style={{ background:"#fffbeb", color:"#d97706", border:"1px solid #fef08a", fontSize:"0.72rem" }}>Pending</span>}
                          {r.status === "rejected" && <span className="badge rounded-pill px-3 py-2" style={{ background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca", fontSize:"0.72rem" }}>Rejected</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Document price list */}
        <div>
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="d-flex align-items-center justify-content-center rounded-3"
              style={{ width:32, height:32, background:"linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 className="fw-bold mb-0" style={{ fontSize:"0.95rem", color:"#1e293b" }}>Document Fees & Processing Time</h3>
          </div>
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ background:"linear-gradient(135deg,#eff6ff,#f0f9ff)" }}>
                  <tr>
                    <th className="small fw-semibold text-uppercase ps-4" style={{ letterSpacing:"0.05em", color:"#1d4ed8", paddingTop:14, paddingBottom:14 }}>Type of Document</th>
                    <th className="small fw-semibold text-uppercase text-center" style={{ letterSpacing:"0.05em", color:"#1d4ed8" }}>Price</th>
                    <th className="small fw-semibold text-uppercase text-center pe-4" style={{ letterSpacing:"0.05em", color:"#1d4ed8" }}>Processing</th>
                  </tr>
                </thead>
                <tbody>
                  {DOCUMENT_CATALOG.map((doc, i) => (
                    <tr key={i} style={{ borderBottom:"1px solid #f1f5f9" }}>
                      <td className="ps-4 small fw-medium text-dark align-middle py-3">{doc.type}</td>
                      <td className="small text-center align-middle py-3">
                        <span className="fw-semibold" style={{ color: doc.price.includes("Free") ? "#16a34a" : "#1d4ed8" }}>{doc.price}</span>
                      </td>
                      <td className="pe-4 small text-center text-muted align-middle py-3">{doc.days}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3" style={{ background:"#f8fafc", borderTop:"1px solid #e2e8f0" }}>
              <p className="text-muted mb-0" style={{ fontSize:"0.78rem" }}>
                * For certificates (3–5 working days): release is immediate if signatories are available.
                CTC (1 day): release is immediate except when in-charge is not available.
              </p>
            </div>
          </div>
        </div>

        <button onClick={() => onAskJobert("How do I request a document from the Registrar?")}
          className="btn btn-sm d-inline-flex align-items-center gap-2 align-self-start"
          style={{ background:"#f5f3ff", color:"#7c3aed", border:"1px solid #ddd6fe", borderRadius:8, fontSize:12 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/>
          </svg>
          Ask JOBERT about documents
        </button>

      </div>

      {/* Request Document Modal */}
      {showModal && (
        <div className="modal d-block" style={{ background:"rgba(0,0,0,0.5)", zIndex:9999 }} onClick={() => setShowModal(false)}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              {/* Modal header */}
              <div style={{ background:"linear-gradient(135deg,#ec4899,#8b5cf6)", padding:"24px 28px 20px" }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h5 className="fw-bold text-white mb-1">Request a Document</h5>
                    <p className="mb-0" style={{ color:"rgba(255,255,255,0.75)", fontSize:13 }}>Choose from the available document types below</p>
                  </div>
                  <button onClick={() => setShowModal(false)}
                    className="btn rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width:32, height:32, background:"rgba(255,255,255,0.2)", border:"none", color:"white", padding:0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="modal-body p-4">
                {/* Document type selector */}
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize:"0.8rem", color:"#475569", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                    Document Type <span className="text-danger">*</span>
                  </label>
                  <div className="row g-2 mt-1" style={{ maxHeight:280, overflowY:"auto", paddingRight:4 }}>
                    {DOCUMENT_CATALOG.map((doc, i) => (
                      <div key={i} className="col-12 col-md-6">
                        <label className="d-flex align-items-start gap-3 p-3 rounded-3 cursor-pointer"
                          style={{
                            border: selectedType === doc.type ? "2px solid #8b5cf6" : "1.5px solid #e2e8f0",
                            background: selectedType === doc.type ? "#f5f3ff" : "white",
                            cursor:"pointer", transition:"all 0.15s"
                          }}>
                          <input type="radio" name="doctype" value={doc.type} checked={selectedType===doc.type}
                            onChange={() => setSelectedType(doc.type)} className="mt-1 flex-shrink-0" />
                          <div>
                            <div className="fw-semibold" style={{ fontSize:"0.82rem", color:"#1e293b", lineHeight:1.4 }}>{doc.type}</div>
                            <div className="d-flex gap-2 mt-1 flex-wrap">
                              <span style={{ fontSize:"0.72rem", color: doc.price.includes("Free") ? "#16a34a" : "#2563eb", fontWeight:600 }}>{doc.price}</span>
                              <span style={{ fontSize:"0.72rem", color:"#94a3b8" }}>• {doc.days}</span>
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Purpose */}
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize:"0.8rem", color:"#475569", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                    Purpose <span className="text-muted fw-normal">(optional)</span>
                  </label>
                  <input type="text" className="form-control rounded-3" placeholder="e.g., Employment, Scholarship, Personal use"
                    value={purpose} onChange={e => setPurpose(e.target.value)}
                    style={{ border:"1.5px solid #e2e8f0" }} />
                </div>

                {/* Copies */}
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize:"0.8rem", color:"#475569", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                    Number of Copies
                  </label>
                  <div className="d-flex align-items-center gap-3">
                    <button onClick={() => setCopies(c => Math.max(1,c-1))}
                      className="btn rounded-circle d-flex align-items-center justify-content-center fw-bold"
                      style={{ width:36, height:36, background:"#f1f5f9", border:"1.5px solid #e2e8f0", color:"#475569", padding:0 }}>−</button>
                    <span className="fw-bold" style={{ fontSize:"1.1rem", minWidth:24, textAlign:"center" }}>{copies}</span>
                    <button onClick={() => setCopies(c => c+1)}
                      className="btn rounded-circle d-flex align-items-center justify-content-center fw-bold"
                      style={{ width:36, height:36, background:"#f1f5f9", border:"1.5px solid #e2e8f0", color:"#475569", padding:0 }}>+</button>
                  </div>
                </div>

                {/* Info note */}
                <div className="d-flex align-items-start gap-3 rounded-3 p-3 mb-4" style={{ background:"#eff6ff", border:"1px solid #bfdbfe" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-1">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="mb-0 small" style={{ color:"#1d4ed8" }}>
                    Your request will be sent to the Registrar&apos;s Office for processing. You will be notified once it&apos;s ready for pickup.
                  </p>
                </div>

                {/* Actions */}
                <div className="d-flex gap-2">
                  <button onClick={submitRequest} disabled={submitting || !selectedType}
                    className="btn fw-semibold flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                    style={{ background: !selectedType ? "#e2e8f0" : "linear-gradient(135deg,#ec4899,#8b5cf6)", color: !selectedType ? "#94a3b8" : "white", border:"none", borderRadius:10, padding:"12px" }}>
                    {submitting ? <><span className="spinner-border spinner-border-sm" /> Submitting...</> : "Submit Request"}
                  </button>
                  <button onClick={() => setShowModal(false)}
                    className="btn fw-semibold px-4"
                    style={{ border:"1.5px solid #e2e8f0", color:"#64748b", borderRadius:10, background:"white" }}>
                    Cancel
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

/* -- Notifications View -- */
function NotificationsView() {
  const [notifs, setNotifs] = useState(notifications);
  const unread = notifs.filter(n => !n.read);
  const read   = notifs.filter(n =>  n.read);
  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-center justify-content-between">
        <div><h2 className="fw-black fs-4 text-dark mb-1">Notifications</h2><p className="text-muted small mb-0">{unread.length} unread</p></div>
        {unread.length>0 && <button onClick={() => setNotifs(prev=>prev.map(n=>({...n,read:true})))} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize:12 }}>Mark all read</button>}
      </div>
      {unread.length>0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">Unread</h3>
          <div className="d-flex flex-column gap-2">
            {unread.map(n => (
              <div key={n.id} className="card border-0 shadow-sm rounded-3" style={{ background:"rgba(59,130,246,0.04)", border:"1px solid rgba(59,130,246,0.12)" }}>
                <div className="card-body p-3 d-flex align-items-start gap-3">
                  <span className="text-primary"><Icon name={n.type === "grade" ? "chart" : n.type === "document" ? "file" : n.type === "enrollment" ? "graduation" : "bell"} size={18} /></span>
                  <div className="flex-grow-1">
                    <div className="fw-bold small text-dark">{n.title}</div>
                    <div className="text-muted small mt-1">{n.message}</div>
                    <div className="text-muted mt-1" style={{ fontSize:11 }}>{n.time}</div>
                  </div>
                  <div className="d-flex gap-1">
                    <button onClick={() => setNotifs(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x))} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize:12 }} aria-label="Mark read"><Icon name="check" size={14} /></button>
                    <button onClick={() => setNotifs(prev=>prev.filter(x=>x.id!==n.id))} className="btn btn-link btn-sm p-0 text-danger" style={{ fontSize:12 }} aria-label="Dismiss"><Icon name="x" size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {read.length>0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">Read</h3>
          <div className="d-flex flex-column gap-2">
            {read.map(n => (
              <div key={n.id} className="card border-0 shadow-sm rounded-3 opacity-75">
                <div className="card-body p-3 d-flex align-items-start gap-3">
                  <span className="text-muted"><Icon name={n.type === "grade" ? "chart" : n.type === "document" ? "file" : n.type === "enrollment" ? "graduation" : "bell"} size={16} /></span>
                  <div className="flex-grow-1"><div className="fw-bold small text-dark">{n.title}</div><div className="text-muted small">{n.message}</div></div>
                  <button onClick={() => setNotifs(prev=>prev.filter(x=>x.id!==n.id))} className="btn btn-link btn-sm p-0 text-danger" style={{ fontSize:12 }} aria-label="Dismiss"><Icon name="x" size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* -- Profile Panel -- */
function ProfilePanel({ student }: { student?: { 
  student_id: string; 
  full_name: string; 
  pathway: string; 
  grade_level: number; 
  term: string; 
  email: string; 
  photo_url?: string;
  lrn?: string;
} | null }) {
  const [profileData, setProfileData] = useState<{
    date_of_birth?: string;
    phone?: string;
    address?: string;
    gender?: string;
    nationality?: string;
    guardian_name?: string;
    guardian_phone?: string;
    enrollment_date?: string;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    if (!token) return;
    
    // Fetch additional profile data from enrollment application
    fetch(`${API_BASE}/api/student/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setProfileData(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="d-flex flex-column gap-0">

      {/* ── Banner ─────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg,#6366f1 0%,#7c3aed 100%)",
        borderRadius: "16px 16px 0 0",
        padding: "32px 32px 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position:"absolute", top:-50, right:-50, width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
        <div style={{ position:"absolute", bottom:-60, right:160, width:150, height:150, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <h1 className="fw-bold text-white mb-1" style={{ fontSize:"1.6rem" }}>My Profile</h1>
          <p className="mb-0" style={{ color:"rgba(255,255,255,0.7)" }}>View your personal information</p>
        </div>
      </div>

      {/* ── Cards pulled up over banner ─────────────────────────────── */}
      <div className="container-fluid px-0" style={{ marginTop:"-52px", paddingBottom:32 }}>
        <div className="row g-4 mx-0">

          {/* Left: Profile Card */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden h-100">
              <div className="card-body p-0">
                {/* Cover */}
                <div className="position-relative" style={{ height:"120px", background:"linear-gradient(135deg,#6366f1,#7c3aed)" }}>
                  <div className="position-absolute top-50 start-50 translate-middle" style={{ marginTop:"40px" }}>
                    <div className="rounded-circle border border-4 border-white overflow-hidden"
                      style={{ width:"110px", height:"110px", boxShadow:"0 6px 20px rgba(99,102,241,0.4)" }}>
                      {student?.photo_url ? (
                        <img src={student.photo_url} alt="Profile" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100 w-100 text-white fw-bold"
                          style={{ fontSize:32, background:"linear-gradient(135deg,#6366f1,#7c3aed)" }}>
                          {student?.full_name.split(" ").map(n => n[0]).join("").slice(0,2) || "??"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="pt-5 px-4 pb-4 text-center">
                  <h3 className="fw-bold text-dark mb-1" style={{ marginTop:32 }}>{student?.full_name || "Loading..."}</h3>
                  <p className="text-muted small mb-3">{student?.student_id || ""}</p>

                  <div className="d-flex justify-content-center gap-2 flex-wrap mb-4">
                    <span className="badge rounded-pill px-3 py-2"
                      style={{ background:"rgba(99,102,241,0.12)", color:"#6366f1", border:"1px solid rgba(99,102,241,0.3)", fontWeight:600 }}>
                      {student?.pathway || "Student"}
                    </span>
                    <span className="badge rounded-pill px-3 py-2"
                      style={{ background:"#f0fdf4", color:"#16a34a", border:"1px solid #bbf7d0", fontWeight:600 }}>
                      Active
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="row g-2">
                    <div className="col-6">
                      <div className="rounded-3 p-3 text-center" style={{ background:"#f8fafc", border:"1px solid #e2e8f0" }}>
                        <div className="fw-bold mb-0" style={{ fontSize:"1.1rem", color:"#6366f1" }}>
                          {profileData?.enrollment_date ? new Date(profileData.enrollment_date).getFullYear() : "—"}
                        </div>
                        <div className="text-muted" style={{ fontSize:"0.7rem" }}>Member Since</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="rounded-3 p-3 text-center" style={{ background:"#f8fafc", border:"1px solid #e2e8f0" }}>
                        <div className="fw-bold mb-0" style={{ fontSize:"1.1rem", color:"#16a34a" }}>Active</div>
                        <div className="text-muted" style={{ fontSize:"0.7rem" }}>Status</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Profile Information */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-lg rounded-4 h-100">
              <div className="card-body p-4 p-md-5">

                {/* Card header */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center justify-content-center rounded-3"
                      style={{ width:44, height:44, background:"linear-gradient(135deg,#6366f1,#7c3aed)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0" style={{ color:"#1e293b" }}>Profile Information</h5>
                      <p className="text-muted mb-0" style={{ fontSize:"0.82rem" }}>Your personal details</p>
                    </div>
                  </div>
                  <span className="badge px-3 py-2 rounded-pill" style={{ background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe", fontSize:"0.75rem" }}>Read-Only</span>
                </div>

                {/* Personal section */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3 pb-2" style={{ borderBottom:"2px solid #f1f5f9" }}>
                    <div style={{ width:4, height:16, background:"linear-gradient(135deg,#6366f1,#7c3aed)", borderRadius:4 }} />
                    <span className="fw-semibold text-uppercase" style={{ fontSize:"0.72rem", letterSpacing:"0.08em", color:"#64748b" }}>Personal Details</span>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>Full Name</label>
                      <input type="text" className="form-control rounded-3" value={student?.full_name || ""} disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc" }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>Student ID</label>
                      <input type="text" className="form-control rounded-3" value={student?.student_id || ""} disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc" }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>Date of Birth</label>
                      <input type="text" className="form-control rounded-3" value={profileData?.date_of_birth ? new Date(profileData.date_of_birth).toLocaleDateString() : "N/A"} disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc" }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>LRN</label>
                      <input type="text" className="form-control rounded-3" value={student?.lrn || "N/A"} disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc" }} />
                    </div>
                  </div>
                </div>

                {/* Contact section */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3 pb-2" style={{ borderBottom:"2px solid #f1f5f9" }}>
                    <div style={{ width:4, height:16, background:"linear-gradient(135deg,#3b82f6,#06b6d4)", borderRadius:4 }} />
                    <span className="fw-semibold text-uppercase" style={{ fontSize:"0.72rem", letterSpacing:"0.08em", color:"#64748b" }}>Contact Information</span>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>Email</label>
                      <input type="email" className="form-control rounded-3" value={student?.email || ""} disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc" }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>Phone</label>
                      <input type="text" className="form-control rounded-3" value={profileData?.phone || "N/A"} disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc" }} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>Address</label>
                      <input type="text" className="form-control rounded-3" value={profileData?.address || "N/A"} disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc" }} />
                    </div>
                  </div>
                </div>

                {/* Academic section */}
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3 pb-2" style={{ borderBottom:"2px solid #f1f5f9" }}>
                    <div style={{ width:4, height:16, background:"linear-gradient(135deg,#10b981,#059669)", borderRadius:4 }} />
                    <span className="fw-semibold text-uppercase" style={{ fontSize:"0.72rem", letterSpacing:"0.08em", color:"#64748b" }}>Academic Details</span>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>Course / Track</label>
                      <input type="text" className="form-control rounded-3" value={student?.pathway || ""} disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc" }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>Year Level</label>
                      <input type="text" className="form-control rounded-3" value={`Grade ${student?.grade_level || ""}`} disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc" }} />
                    </div>
                    {profileData?.guardian_name && (
                      <>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>Guardian Name</label>
                          <input type="text" className="form-control rounded-3" value={profileData.guardian_name} disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc" }} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>Guardian Contact</label>
                          <input type="text" className="form-control rounded-3" value={profileData.guardian_phone || "N/A"} disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc" }} />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Info alert */}
                <div className="d-flex align-items-start gap-3 rounded-3 p-3" style={{ background:"#eff6ff", border:"1px solid #bfdbfe" }}>
                  <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 mt-1"
                    style={{ width:32, height:32, background:"#dbeafe" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <div>
                    <div className="fw-semibold mb-1" style={{ fontSize:"0.85rem", color:"#1d4ed8" }}>Need to update your information?</div>
                    <div style={{ fontSize:"0.82rem", color:"#3b82f6" }}>
                      Please visit the Registrar&apos;s Office or email{" "}
                      <a href="mailto:registrar@cfei.edu.ph" style={{ color:"#2563eb", fontWeight:600 }}>registrar@cfei.edu.ph</a>{" "}
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

export default function DashboardPage() {
  const [panel, setPanel]         = useState<Panel>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifList, setNotifList] = useState(notifications);
  const [jobertPrompt, setJobertPrompt] = useState<string|undefined>(undefined);
  const [authChecked, setAuthChecked] = useState(false);
  const [student, setStudent] = useState<{
    student_id: string;
    full_name: string;
    pathway: string;
    grade_level: number;
    term: string;
    email: string;
    photo_url?: string;
  } | null>(null);

  const [dashboardData, setDashboardData] = useState<{
    stats: {
      average_grade: number;
      total_paid: number;
      total_tuition: number;
      balance_due: number;
      pending_docs: number;
    };
    recent_grades: Array<{
      subject_code: string;
      subject_title: string;
      percentage: number;
      term: string;
    }>;
  } | null>(null);


  // -- Route protection ------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("inform_token");
    const role  = localStorage.getItem("inform_role");
    if (!token || role !== "student") {
      window.location.replace("/login");
    } else {
      setAuthChecked(true);
    }
  }, []);

  // -- Fetch real notifications from API � poll every 20s ---------
  useEffect(() => {
    if (!authChecked) return;
    const token = localStorage.getItem("inform_token");
    if (!token || token.startsWith("demo_")) return;

    function fetchNotifs() {
      fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.notifications?.length) {
            setNotifList(data.notifications.map((n: {id: number; message: string; type: string; is_read: boolean; created_at: string}) => ({
              id:      n.id,
              type:    n.type,
              title:   n.type === "grade" ? "Grade Update" : n.type.charAt(0).toUpperCase() + n.type.slice(1),
              message: n.message,
              time:    new Date(n.created_at).toLocaleDateString("en-PH"),
              read:    !!n.is_read,
            })));
          }
        })
        .catch(() => {});
    }

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 20000);
    return () => clearInterval(interval);
  }, [authChecked]);
  const unreadCount = notifList.filter(n => !n.read).length;

  useEffect(() => {
  if (!authChecked) return;
  const token = localStorage.getItem("inform_token");
  if (!token) return;
  
  // Fetch dashboard data which includes student info
  fetch(`${API_BASE}/api/student/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  })
    .then(r => {
      if (!r.ok) {
        console.error("Dashboard API failed:", r.status);
        return null;
      }
      return r.json();
    })
    .then(data => {
      if (data) {
        console.log("Dashboard data received:", data);
        setStudent(data.student);
        setDashboardData({
          stats: data.stats,
          recent_grades: data.recent_grades
        });
      }
    })
    .catch(err => {
      console.error("Dashboard fetch error:", err);
    });
  }, [authChecked]);


  function askJobert(prompt: string) {
    setJobertPrompt(undefined);
    setTimeout(() => setJobertPrompt(prompt), 50);
  }


  function renderPanel() {
    switch (panel) {
      case "profile":       return <ProfilePanel student={student} />;
      case "grades":        return <GradesView       onAskJobert={askJobert} />;
      case "schedule":      return <ScheduleView     onAskJobert={askJobert} />;
      case "tuition":       return <TuitionView      onAskJobert={askJobert} />;
      case "documents":     return <DocumentsView    onAskJobert={askJobert} />;
      case "notifications": return <NotificationsView />;
      default:              return <HomePanel setPanel={setPanel} onAskJobert={askJobert} student={student} dashboardData={dashboardData} />;
    }
  }

  return (
    <div className="admin-dashboard-layout" style={{ background:"#f0f4ff" }} suppressHydrationWarning>
      <Sidebar active={panel} setActive={setPanel} show={mobileOpen} setShow={setMobileOpen} onExpandChange={setSidebarExpanded} student={student} />

      <div className="admin-dashboard-main" style={{ marginLeft: 256 }}>
        {/* Topbar */}
        <header className="bg-white border-bottom px-2 px-md-4 py-3 d-flex align-items-center gap-2 gap-md-3 flex-shrink-0 shadow-sm flex-wrap">
          <button className="btn btn-link text-dark p-1 d-lg-none hamburger-mobile-only" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="d-flex align-items-center gap-2 gap-md-3 ms-auto flex-wrap">
            <span className="badge bg-success-subtle text-success border border-success-subtle d-none d-md-flex align-items-center gap-1" style={{ fontSize:"clamp(10px,2vw,12px)" }}>
              <span className="rounded-circle bg-success d-inline-block" style={{ width:7, height:7 }} />Active Student
            </span>
            <button className="btn btn-link text-muted p-1 position-relative" onClick={() => setShowNotif(!showNotif)} aria-label="Notifications">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && <span className="position-absolute top-0 end-0 rounded-circle bg-danger d-flex align-items-center justify-content-center text-white" style={{ width:16, height:16, fontSize:9, fontWeight:"bold" }}>{unreadCount}</span>}
            </button>
            <button onClick={() => { setPanel("profile"); }} className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold d-none d-sm-flex border-0" style={{ width:32, height:32, fontSize:12, background:"linear-gradient(135deg,#6366f1,#7c3aed)", cursor:"pointer" }} title="My Profile">JS</button>
          </div>
        </header>

        <main className="flex-grow-1 overflow-auto p-2 p-sm-3 p-md-4">
          {renderPanel()}
        </main>
      </div>

      {/* Notification dropdown */}
      {showNotif && (
        <>
          <div style={{ position:"fixed", top:60, right:20, width:360, maxHeight:480, background:"white", borderRadius:"0.75rem", border:"1px solid rgba(0,0,0,0.1)", boxShadow:"0 10px 40px rgba(0,0,0,0.15)", zIndex:9999, overflowY:"auto" }}>
            <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
              <div><div className="fw-bold text-dark small">Notifications</div><div className="text-muted" style={{ fontSize:11 }}>{unreadCount} unread</div></div>
              <div className="d-flex align-items-center gap-2">
                {unreadCount>0 && <button onClick={() => setNotifList(prev=>prev.map(n=>({...n,read:true})))} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize:11 }}>Mark all read</button>}
                <button onClick={() => setShowNotif(false)} className="btn btn-link btn-sm p-0 text-muted" style={{ fontSize:18 }} aria-label="Close"><Icon name="close" size={16} /></button>
              </div>
            </div>
            {notifList.length===0
              ? <div className="px-4 py-5 text-center text-muted"><div className="mb-2 text-muted"><Icon name="bell" size={32} /></div><small>No notifications</small></div>
              : notifList.map(n => (
                <div key={n.id} className="px-4 py-3 border-bottom d-flex gap-3" style={{ background:n.read?"white":"rgba(99,102,241,0.04)", opacity:n.read?0.7:1 }}>
                  <div className="text-primary" style={{ minWidth:24 }}><Icon name={n.type === "grade" ? "chart" : n.type === "payment" ? "peso" : n.type === "document" ? "file" : "bell"} size={18} /></div>
                  <div className="flex-grow-1">
                    <div className="fw-bold small text-dark">{n.title}</div>
                    <div className="text-muted" style={{ fontSize:12, lineHeight:1.4 }}>{n.message}</div>
                    <div className="text-muted" style={{ fontSize:11, marginTop:4 }}>{n.time}</div>
                  </div>
                  <div className="d-flex gap-1 flex-shrink-0">
                    {!n.read && <button onClick={() => setNotifList(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x))} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize:12 }} aria-label="Mark read"><Icon name="check" size={14} /></button>}
                    <button onClick={() => setNotifList(prev=>prev.filter(x=>x.id!==n.id))} className="btn btn-link btn-sm p-0 text-danger" style={{ fontSize:14 }} aria-label="Dismiss"><Icon name="x" size={14} /></button>
                  </div>
                </div>
              ))
            }
            {notifList.length>0 && <div className="px-4 py-2 border-top text-center"><button onClick={() => { setPanel("notifications"); setShowNotif(false); }} className="btn btn-link btn-sm p-0 text-primary d-inline-flex align-items-center gap-1" style={{ fontSize:12 }}>View all <Icon name="arrowRight" size={12} /></button></div>}
          </div>
          <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex:9998 }} onClick={() => setShowNotif(false)} />
        </>
      )}

      <JobertChat initialPrompt={jobertPrompt} />
    </div>
  );
}

