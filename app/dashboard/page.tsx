"use client";

import { useState, useEffect, useRef } from "react";
import React from "react";
import type { ReactNode as _ReactNode } from "react";
import Link from "next/link";

type Panel = "home"|"grades"|"schedule"|"tuition"|"documents"|"notifications";
type JMsg  = { role:"ai"|"user"; text:string; feedback?:"up"|"down"|null };

/* ── JOBERT Chat ── */
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
                      <button onClick={() => setFeedback(i,"up")}   className={`btn btn-sm py-0 px-1 border-0 ${m.feedback==="up"?"text-success":"text-secondary"}`} style={{ fontSize:13 }}>👍</button>
                      <button onClick={() => setFeedback(i,"down")} className={`btn btn-sm py-0 px-1 border-0 ${m.feedback==="down"?"text-danger":"text-secondary"}`} style={{ fontSize:13 }}>👎</button>
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

/* ── Data ── */
const gradeData = [
  { subject:"Mathematics",        icon:"📐", term1:{grade:"A",  pct:92}, term2:{grade:"A-", pct:90}, term3:null, teacher:"Mr. Dela Cruz",  status:"Excellent" },
  { subject:"Physics",            icon:"⚛️", term1:{grade:"B+", pct:87}, term2:{grade:"B+", pct:88}, term3:null, teacher:"Ms. Villanueva", status:"Passing"   },
  { subject:"English Literature", icon:"📖", term1:{grade:"A+", pct:96}, term2:{grade:"A",  pct:94}, term3:null, teacher:"Ms. Santos",     status:"Excellent" },
  { subject:"Chemistry",          icon:"🧪", term1:{grade:"B",  pct:81}, term2:{grade:"B+", pct:84}, term3:null, teacher:"Mr. Fernandez",  status:"Passing"   },
  { subject:"History",            icon:"🏛️", term1:{grade:"B+", pct:85}, term2:{grade:"A-", pct:89}, term3:null, teacher:"Ms. Reyes",      status:"Passing"   },
  { subject:"Computer Science",   icon:"💻", term1:{grade:"A",  pct:93}, term2:{grade:"A",  pct:95}, term3:null, teacher:"Mr. Uy",         status:"Excellent" },
];

const gradeRequests = [
  { id:1, subject:"Mathematics", teacher:"Mr. Dela Cruz", status:"pending", requestedAt:"2h ago" },
];

const timetable: Record<string, { time:string; subject:string; icon:string; room:string; teacher:string; enter:string; leave:string }[]> = {
  Monday:[
    { time:"07:30–08:30", subject:"Mathematics",        icon:"📐", room:"Room 301", teacher:"Ms. Maria Santos",       enter:"07:25", leave:"08:35" },
    { time:"08:30–09:30", subject:"English Literature", icon:"📖", room:"Room 205", teacher:"Mr. Juan Dela Cruz",     enter:"08:25", leave:"09:35" },
    { time:"10:00–11:00", subject:"Computer Science",   icon:"💻", room:"ICT Lab",  teacher:"Mr. Carlos Fernandez",   enter:"09:55", leave:"11:05" },
    { time:"13:00–14:00", subject:"Physical Education", icon:"🏃", room:"Gym",      teacher:"Coach Maria",            enter:"12:55", leave:"14:05" },
  ],
  Tuesday:[
    { time:"07:30–09:00", subject:"Physics",   icon:"⚛️", room:"Sci. Lab", teacher:"Ms. Ana Reyes",        enter:"07:20", leave:"09:05" },
    { time:"09:00–10:30", subject:"Chemistry", icon:"🧪", room:"Chem Lab", teacher:"Dr. Luis Fernandez",   enter:"08:55", leave:"10:35" },
    { time:"13:00–14:30", subject:"History",   icon:"🏛️", room:"Room 108", teacher:"Mr. Juan Dela Cruz",   enter:"12:55", leave:"14:35" },
  ],
  Wednesday:[
    { time:"07:30–08:30", subject:"Mathematics",        icon:"📐", room:"Room 301", teacher:"Ms. Maria Santos",     enter:"07:25", leave:"08:35" },
    { time:"08:30–09:30", subject:"English Literature", icon:"📖", room:"Room 205", teacher:"Mr. Juan Dela Cruz",   enter:"08:25", leave:"09:35" },
    { time:"10:00–11:00", subject:"Computer Science",   icon:"💻", room:"ICT Lab",  teacher:"Mr. Carlos Fernandez", enter:"09:55", leave:"11:05" },
  ],
  Thursday:[
    { time:"07:30–09:00", subject:"Physics",   icon:"⚛️", room:"Sci. Lab", teacher:"Ms. Ana Reyes",       enter:"07:20", leave:"09:05" },
    { time:"09:00–10:30", subject:"Chemistry", icon:"🧪", room:"Chem Lab", teacher:"Dr. Luis Fernandez",  enter:"08:55", leave:"10:35" },
    { time:"13:00–14:30", subject:"History",   icon:"🏛️", room:"Room 108", teacher:"Mr. Juan Dela Cruz",  enter:"12:55", leave:"14:35" },
  ],
  Friday:[
    { time:"07:30–08:30", subject:"Mathematics",        icon:"📐", room:"Room 301", teacher:"Ms. Maria Santos",     enter:"07:25", leave:"08:35" },
    { time:"08:30–09:30", subject:"Computer Science",   icon:"💻", room:"ICT Lab",  teacher:"Mr. Carlos Fernandez", enter:"08:25", leave:"09:35" },
    { time:"10:00–11:00", subject:"English Literature", icon:"📖", room:"Room 205", teacher:"Mr. Juan Dela Cruz",   enter:"09:55", leave:"11:05" },
  ],
};

const fees = [
  { label:"Tuition Fee",          amount:18500, paid:true  },
  { label:"Miscellaneous Fee",    amount: 2200, paid:true  },
  { label:"Laboratory Fee",       amount: 1500, paid:true  },
  { label:"Student Activity Fee", amount:  800, paid:false },
  { label:"ID / Registration",    amount:  350, paid:false },
];

const notifications = [
  { id:1, type:"grade",      title:"Grade Submitted",      message:"Mr. Dela Cruz submitted your Mathematics grade: A (92%)", time:"2h ago",  read:false, icon:"📊" },
  { id:2, type:"document",   title:"Document Approved",    message:"Your TOR request has been approved by Admin",              time:"4h ago",  read:false, icon:"✅" },
  { id:3, type:"enrollment", title:"Enrollment Confirmed", message:"Your enrollment for Term 1 has been confirmed",            time:"1d ago",  read:true,  icon:"🎓" },
  { id:4, type:"attendance", title:"Attendance Alert",     message:"Your attendance in Physics is below 80%",                  time:"2d ago",  read:true,  icon:"⚠️" },
];

const documentRequests = [
  { id:1, type:"TOR",         status:"approved", requestedAt:"May 15, 2026", approvedAt:"May 16, 2026", approvedBy:"Admin", releaseDate:"June 10, 2026", downloadUrl:"#" },
  { id:2, type:"Certificate", status:"pending",  requestedAt:"May 18, 2026", approvedAt:null,           approvedBy:null,    releaseDate:null,             downloadUrl:null },
];

const availableDocuments = [
  { id:1, type:"TOR",         name:"Transcript of Records",       description:"Official academic record with grades and GPA", icon:"📄" },
  { id:2, type:"Certificate", name:"Certificate of Enrollment",   description:"Proof of current enrollment status",           icon:"📜" },
  { id:3, type:"GoodStanding",name:"Good Standing Certificate",   description:"Certificate showing no outstanding balances",  icon:"✅" },
];

/* ── Sidebar nav items ── */
const navItems = [
  { id:"home"          as Panel, label:"Dashboard",    icon:"🏠" },
  { id:"grades"        as Panel, label:"My Grades",    icon:"📊" },
  { id:"schedule"      as Panel, label:"My Schedule",  icon:"📅" },
  { id:"tuition"       as Panel, label:"Tuition Fee",  icon:"💰" },
  { id:"documents"     as Panel, label:"Documents",    icon:"📄" },
  { id:"notifications" as Panel, label:"Notifications",icon:"🔔" },
];

/* ── Sidebar ── */
function Sidebar({ active, setActive, show, setShow, unreadCount, onExpandChange }: { active:string; setActive:(s:Panel)=>void; show:boolean; setShow:(b:boolean)=>void; unreadCount:number; onExpandChange?: (expanded: boolean) => void }) {
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
        className={`d-flex flex-column flex-shrink-0 position-fixed top-0 start-0 h-100 ${show?"":"d-none d-lg-flex"}`}
        style={{ width:expanded?256:80, zIndex:1045, background:"linear-gradient(180deg,#1e1b4b 0%,#312e81 100%)", overflowY:"auto", overflowX:"hidden", transition:"width 0.3s ease" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Logo */}
        <div className="d-flex align-items-center gap-3 px-4 py-4 border-bottom border-white border-opacity-10" style={{ minHeight:80 }}>
          <img src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle flex-shrink-0" style={{ width:32, height:32, objectFit:"cover", border:"1px solid rgba(255,255,255,0.2)" }} />
          {expanded && <>
            <img src="/newimlogo.png" alt="CFEI" className="rounded-3 flex-shrink-0" style={{ width:36, height:36, objectFit:"cover" }} />
            <div><div className="text-white fw-bold lh-1" style={{ fontSize:15 }}>CFEI</div><div style={{ color:"#818cf8", fontSize:11 }}>Student Portal</div></div>
          </>}
          {show && <button className="btn-close btn-close-white ms-auto d-lg-none" onClick={() => setShow(false)} />}
        </div>

        {/* Student badge */}
        {expanded && (
          <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-3 d-flex align-items-center gap-2" style={{ background:"rgba(99,102,241,0.2)", border:"1px solid rgba(99,102,241,0.35)" }}>
            <span>🎓</span>
            <div><div style={{ color:"#a5b4fc", fontSize:12, fontWeight:700 }}>Jamie Santos</div><div style={{ color:"rgba(165,180,252,0.6)", fontSize:11 }}>STEM Grade 11</div></div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-grow-1 px-3 py-2 d-flex flex-column gap-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActive(item.id); setShow(false); }}
              className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0 position-relative"
              style={{ color:active===item.id?"#fff":"rgba(255,255,255,0.5)", background:active===item.id?"#4f46e5":"transparent", justifyContent:expanded?"flex-start":"center", whiteSpace:"nowrap" }}
              title={item.label}>
              <span style={{ fontSize:18 }}>{item.icon}</span>
              {expanded && <span>{item.label}</span>}
              {item.id==="notifications" && unreadCount>0 && (
                <span className="position-absolute top-0 end-0 rounded-circle bg-danger d-flex align-items-center justify-content-center text-white" style={{ width:16, height:16, fontSize:9, fontWeight:"bold", margin:4 }}>{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        {expanded && (
          <div className="px-3 py-4 border-top border-white border-opacity-10">
            <div className="d-flex align-items-center gap-3 rounded-3 px-3 py-2" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0" style={{ width:32, height:32, fontSize:12, background:"linear-gradient(135deg,#6366f1,#7c3aed)" }}>JS</div>
              <div className="flex-grow-1 overflow-hidden"><div className="text-white small fw-semibold text-truncate">Jamie Santos</div><div className="text-truncate" style={{ color:"rgba(255,255,255,0.3)", fontSize:11 }}>STU-2024-001</div></div>
              <Link href="/login" className="btn btn-sm btn-danger rounded-pill px-3 py-1 text-decoration-none d-flex align-items-center gap-1" style={{ fontSize: 11, fontWeight: 600 }} title="Log out">
                <span>↩</span>
                <span className="d-none d-xl-inline">Logout</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Home / Overview ── */
function HomePanel({ setPanel, onAskJobert }: { setPanel:(p:Panel)=>void; onAskJobert:(p:string)=>void }) {
  const totalPaid    = fees.filter(f => f.paid).reduce((a,f) => a+f.amount, 0);
  const totalFees    = fees.reduce((a,f) => a+f.amount, 0);
  const avgGrade     = Math.round(gradeData.map(g => g.term1.pct).reduce((a,b) => a+b,0)/gradeData.length);
  const pendingDocs  = documentRequests.filter(d => d.status==="pending").length;

  const quickLinks = [
    { id:"grades"        as Panel, label:"View Grades",  icon:"📊", bg:"#8b5cf6" },
    { id:"schedule"      as Panel, label:"My Schedule",  icon:"📅", bg:"#3b82f6" },
    { id:"tuition"       as Panel, label:"Tuition Fee",  icon:"💰", bg:"#f59e0b" },
    { id:"documents"     as Panel, label:"Documents",    icon:"📄", bg:"#ec4899" },
  ];

  return (
    <div className="d-flex flex-column gap-4">
      {/* Welcome */}
      <div className="rounded-3 p-4" style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow:"0 8px 32px rgba(99,102,241,0.25)" }}>
        <h2 className="text-white fw-black fs-4 mb-1">Welcome back, Jamie Santos 👋</h2>
        <p className="text-white-50 small mb-0">STU-2024-001 · STEM Grade 11 · Term 1 SY 2025–2026</p>
        <div className="d-flex gap-2 mt-3 flex-wrap">
          <span className="badge bg-white bg-opacity-20 text-white border border-white border-opacity-25">🎓 Active Student</span>
          <span className="badge bg-warning bg-opacity-20 text-white border border-warning border-opacity-25">🔔 Enrollment Open</span>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3">
        {[
          { label:"General Average", value:`${avgGrade}%`,          icon:"📈", cls:"border-primary-subtle bg-primary-subtle",   val:"text-primary"  },
          { label:"Tuition Paid",    value:`₱${totalPaid.toLocaleString()}`, icon:"💰", cls:"border-success-subtle bg-success-subtle", val:"text-success"  },
          { label:"Balance Due",     value:`₱${(totalFees-totalPaid).toLocaleString()}`, icon:"⚠️", cls:"border-warning-subtle bg-warning-subtle", val:"text-warning" },
          { label:"Pending Docs",    value:pendingDocs,              icon:"📄", cls:"border-info-subtle bg-info-subtle",         val:"text-info"     },
        ].map(s => (
          <div key={s.label} className="col-6 col-lg-3">
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

      {/* Quick Access */}
      <div>
        <p className="text-muted text-uppercase small fw-semibold mb-3" style={{ letterSpacing:"0.08em" }}>Quick Access</p>
        <div className="row g-3">
          {quickLinks.map(q => (
            <div key={q.id} className="col-6 col-sm-3">
              <button onClick={() => setPanel(q.id)}
                className="btn w-100 py-3 d-flex flex-column align-items-center gap-2 rounded-3 text-white border-0 shadow-sm"
                style={{ background:q.bg, transition:"transform 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.transform="scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform="scale(1)")}>
                <span style={{ fontSize:28 }}>{q.icon}</span>
                <span className="small fw-bold">{q.label}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent grades + JOBERT */}
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="fw-bold small text-dark mb-0">Recent Grades</h3>
                <button onClick={() => setPanel("grades")} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize:12 }}>View all →</button>
              </div>
              <div className="d-flex flex-column gap-3">
                {gradeData.slice(0,4).map((g,i) => (
                  <div key={i} className="d-flex align-items-center gap-3">
                    <div className="rounded-3 bg-light border d-flex align-items-center justify-content-center flex-shrink-0" style={{ width:36, height:36, fontSize:18 }}>{g.icon}</div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="small fw-semibold text-dark text-truncate">{g.subject}</div>
                      <div className="progress mt-1" style={{ height:4 }}><div className="progress-bar bg-primary" style={{ width:`${g.term1.pct}%` }} /></div>
                    </div>
                    <span className="fw-black small text-primary">{g.term1.grade}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4">
              <h3 className="fw-bold small text-dark mb-3">🤖 Ask JOBERT</h3>
              <p className="text-muted small mb-3">Get instant answers about your grades, schedule, tuition, and more.</p>
              <div className="d-flex flex-column gap-2">
                {["Explain my GWA","How do I pay tuition?","How to request a TOR?"].map(s => (
                  <button key={s} onClick={() => onAskJobert(s)} className="btn btn-light btn-sm text-start border rounded-3" style={{ fontSize:12 }}>💬 {s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Grades View ── */

// Mock term status — swap these values to test different states.
// Replace with real API data from backend later.
// "not_available" = term is ongoing, no grades yet
// "request_open"  = admin opened the grade request window
// "released"      = teacher has released grades to this student
type TermStatus = "not_available" | "request_open" | "released";

const termStatusMock: Record<"term1"|"term2"|"term3", TermStatus> = {
  term1: "request_open",  // ← set to "not_available" to go back to the empty state
  term2: "not_available",
  term3: "not_available",
};

function GradeColorLegend() {
  return (
    <div className="rounded-3 px-3 py-2 flex-shrink-0" style={{ background:"#f8fafc", border:"1.5px solid #e2e8f0" }}>
      <div className="fw-semibold text-dark mb-2" style={{ fontSize:11, letterSpacing:"0.03em" }}>📊 Color Guide</div>
      <div className="d-flex flex-column gap-1">
        {[
          { dot:"#16a34a", color:"#16a34a", label:"80+",      status:"Passed"             },
          { dot:"#d97706", color:"#d97706", label:"75–79",    status:"Lacking Activities" },
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
          <div style={{ fontSize:56, marginBottom:16 }}>📋</div>
          <h3 className="fw-black text-dark mb-2">Grades are not yet available</h3>
          <p className="text-muted small mb-0">
            {term} grades will be available once your teacher submits them and the grade request window opens.
          </p>
        </div>
      </div>

      {/* Reminder note */}
      <div className="rounded-3 p-4" style={{ background:"rgba(245,158,11,0.06)", border:"1.5px solid rgba(245,158,11,0.3)" }}>
        <div className="d-flex align-items-start gap-3">
          <span style={{ fontSize:22, flexShrink:0 }}>📌</span>
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

// For the mock, all pending requests are at step 0 (just requested)
function WorkflowTracker({ subject, currentStep }: { subject: string; currentStep: number }) {
  return (
    <div className="mt-3 pt-3" style={{ borderTop:"1px solid #f1f5f9" }}>
      <div className="text-muted mb-2" style={{ fontSize:11, fontWeight:600, letterSpacing:"0.03em" }}>
        📋 Request Progress — {subject}
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
                  {done ? "✓" : i + 1}
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

function GradesRequestOpen({ term }: { term: string }) {
  const [requestMap, setRequestMap] = useState<Record<string, SubjectRequestStatus>>(
    () => Object.fromEntries(gradeData.map(g => [g.subject, "idle" as SubjectRequestStatus]))
  );
  const [toast, setToast]               = useState<string | null>(null);
  const [confirmSubject, setConfirmSubject] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function handleRequest(subject: string) {
    setRequestMap(prev => ({ ...prev, [subject]: "pending" }));
    setConfirmSubject(null);
    showToast(`📨 Grade request for ${subject} has been sent to your teacher.`);
  }

  const allRequested      = gradeData.every(g => requestMap[g.subject] !== "idle");
  const pendingCount      = gradeData.filter(g => requestMap[g.subject] === "pending").length;

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
        <div className="modal d-block" style={{ background:"rgba(0,0,0,0.45)", zIndex:9998 }} onClick={() => setConfirmSubject(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content rounded-3 border-0 shadow-lg">
              <div className="modal-body p-4">
                <div style={{ fontSize:36, marginBottom:12 }}>📨</div>
                <h5 className="fw-black text-dark mb-1">Request Grade?</h5>
                <p className="text-muted small mb-4">
                  You are about to request your <strong>{term}</strong> grade for <strong>{confirmSubject}</strong>.
                  Your teacher will be notified to prepare and release your grade.
                </p>
                <div className="d-flex gap-2">
                  <button onClick={() => handleRequest(confirmSubject)}
                    className="btn btn-primary flex-grow-1 fw-bold rounded-2">
                    Yes, Request Grade
                  </button>
                  <button onClick={() => setConfirmSubject(null)}
                    className="btn btn-outline-secondary flex-grow-1 rounded-2">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request window notice */}
      <div className="rounded-3 p-3 d-flex align-items-start gap-3"
        style={{ background:"rgba(99,102,241,0.06)", border:"1.5px solid rgba(99,102,241,0.25)" }}>
        <span style={{ fontSize:20, flexShrink:0 }}>🟢</span>
        <div>
          <div className="fw-bold small text-dark mb-1">Grade Request Window is Open — {term}</div>
          <p className="text-muted small mb-0" style={{ lineHeight:1.6 }}>
            You can now request your grades for this term. Click <strong>Request Grade</strong> on each subject.
            Your teacher will be notified to prepare and release your grades.
          </p>
        </div>
      </div>

      {/* Progress summary */}
      {pendingCount > 0 && !allRequested && (
        <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
          style={{ background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.25)" }}>
          <span style={{ fontSize:16 }}>⏳</span>
          <span className="small text-dark">
            <strong>{pendingCount}</strong> of <strong>{gradeData.length}</strong> grade request{pendingCount > 1 ? "s" : ""} sent — waiting for your teachers.
          </span>
        </div>
      )}

      {/* All requested — simple confirmation banner */}
      {allRequested && (
        <div className="d-flex align-items-center gap-3 px-4 py-3 rounded-3"
          style={{ background:"rgba(16,185,129,0.07)", border:"1.5px solid rgba(16,185,129,0.3)" }}>
          <span style={{ fontSize:20 }}>✅</span>
          <span className="fw-semibold small text-dark">
            All grade requests sent! Please wait for your teachers to release your grades.
          </span>
        </div>
      )}

      {/* Subject cards — always visible */}
      <div className="row g-3">
        {gradeData.map((g, i) => {
          const status = requestMap[g.subject];
          return (
            <div key={i} className="col-12 col-sm-6">
              <div className="card border-0 shadow-sm rounded-3 h-100"
                style={{ borderLeft: status === "pending" ? "4px solid #f59e0b" : status === "rejected" ? "4px solid #ef4444" : "4px solid #e2e8f0" }}>
                <div className="card-body p-4">

                  {/* Subject header */}
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-3 bg-light border d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width:40, height:40, fontSize:20 }}>{g.icon}</div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-bold small text-dark text-truncate">{g.subject}</div>
                      <div className="text-muted" style={{ fontSize:11 }}>👨‍🏫 {g.teacher}</div>
                    </div>
                  </div>

                  {/* Action / status area */}
                  {status === "idle" && (
                    <button onClick={() => setConfirmSubject(g.subject)}
                      className="btn btn-primary btn-sm w-100 rounded-2 fw-semibold"
                      style={{ fontSize:12 }}>
                      📨 Request Grade
                    </button>
                  )}

                  {status === "pending" && (
                    <>
                      <div className="rounded-3 p-3 text-center mb-0"
                        style={{ background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.3)" }}>
                        <div className="fw-semibold small mb-1" style={{ color:"#d97706" }}>⏳ Request Sent</div>
                        <div className="text-muted" style={{ fontSize:11 }}>Waiting for your teacher.</div>
                      </div>
                      <WorkflowTracker subject={g.subject} currentStep={0} />
                    </>
                  )}

                  {status === "rejected" && (
                    <div className="d-flex flex-column gap-2">
                      <div className="rounded-3 p-2 text-center"
                        style={{ background:"rgba(220,38,38,0.07)", border:"1px solid rgba(220,38,38,0.25)" }}>
                        <div className="fw-semibold small" style={{ color:"#dc2626" }}>❌ Request Rejected</div>
                        <div className="text-muted" style={{ fontSize:11 }}>Contact your teacher for details.</div>
                      </div>
                      <button onClick={() => setConfirmSubject(g.subject)}
                        className="btn btn-outline-danger btn-sm w-100 rounded-2" style={{ fontSize:11 }}>
                        🔄 Re-request Grade
                      </button>
                    </div>
                  )}

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

  const termStatus = termStatusMock[selectedTerm];
  const termLabel  = selectedTerm === "term1" ? "Term 1" : selectedTerm === "term2" ? "Term 2" : "Term 3";

  return (
    <div className="d-flex flex-column gap-4">

      {/* Header — title left, color guide right */}
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
        <div>
          <h2 className="fw-black fs-4 text-dark mb-1">My Grades</h2>
          <p className="text-muted small mb-0">School Year 2025–2026 · Jamie Santos</p>
        </div>
        <GradeColorLegend />
      </div>

      {/* Term selector */}
      <div className="d-flex gap-2">
        {(["term1","term2","term3"] as const).map((t,i) => (
          <button key={t} onClick={() => setSelectedTerm(t)}
            className={`btn btn-sm flex-grow-1 rounded-2 ${selectedTerm===t?"btn-primary":"btn-outline-secondary"}`}>
            Term {i+1}
          </button>
        ))}
      </div>

      {/* Content based on term status */}
      {termStatus === "not_available" && <GradesNotAvailable term={termLabel} />}
      {termStatus === "request_open"  && <GradesRequestOpen  term={termLabel} />}

    </div>
  );
}

/* ── Schedule View ── */
function ScheduleView({ onAskJobert }: { onAskJobert:(p:string)=>void }) {
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
  const todayIdx = Math.min(new Date().getDay()-1,4);
  const [day, setDay] = useState(days[todayIdx>=0?todayIdx:0]);
  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
        <div><h2 className="fw-black fs-4 text-dark mb-1">My Schedule</h2><p className="text-muted small mb-0">Term 1 · 2025–2026</p></div>
        <button onClick={() => onAskJobert(`Today is ${day}. My classes are: ${timetable[day].map(c=>c.subject).join(", ")}. Give me study tips.`)}
          className="btn btn-outline-primary btn-sm" style={{ fontSize:12 }}>🤖 Study tips for today</button>
      </div>
      <div className="d-flex gap-2 overflow-auto pb-1">
        {days.map(d => (
          <button key={d} onClick={() => setDay(d)} className={`btn btn-sm flex-shrink-0 ${day===d?"btn-primary":"btn-outline-secondary"}`}>{d.slice(0,3)}</button>
        ))}
      </div>
      <div className="d-flex flex-column gap-3">
        {timetable[day].map((cls,i) => (
          <div key={i} className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-3 bg-light border d-flex align-items-center justify-content-center flex-shrink-0" style={{ width:44, height:44, fontSize:22 }}>{cls.icon}</div>
                  <div><div className="fw-bold text-dark">{cls.subject}</div><div className="text-muted small">👨‍🏫 {cls.teacher}</div></div>
                </div>
                <span className="badge bg-dark text-white">{cls.time}</span>
              </div>
              <div className="row g-2">
                {[["📍 Room",cls.room,"bg-light"],["🚪 Enter",cls.enter,"bg-success bg-opacity-10 border-success border-opacity-25"],["🚪 Leave",cls.leave,"bg-danger bg-opacity-10 border-danger border-opacity-25"]].map(([lbl,val,bg]) => (
                  <div key={lbl} className="col-4">
                    <div className={`rounded-3 p-2 border ${bg}`}><div className="text-muted" style={{ fontSize:10 }}>{lbl}</div><div className="fw-bold small text-dark">{val}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tuition View ── */
function TuitionView({ onAskJobert }: { onAskJobert:(p:string)=>void }) {
  const total  = fees.reduce((a,f) => a+f.amount, 0);
  const paid   = fees.filter(f=>f.paid).reduce((a,f) => a+f.amount, 0);
  const balance= total - paid;
  return (
    <div className="d-flex flex-column gap-4">
      <div><h2 className="fw-black fs-4 text-dark mb-1">Tuition Fee</h2><p className="text-muted small mb-0">Term 1 · 2025–2026</p></div>
      <div className="row g-3">
        {[
          { label:"Total Fees",  value:`₱${total.toLocaleString()}`,   cls:"bg-light border",                                        val:"text-dark"    },
          { label:"Amount Paid", value:`₱${paid.toLocaleString()}`,    cls:"bg-success-subtle border-success-subtle",                val:"text-success" },
          { label:"Balance Due", value:`₱${balance.toLocaleString()}`, cls:balance>0?"bg-danger-subtle border-danger-subtle":"bg-success-subtle border-success-subtle", val:balance>0?"text-danger":"text-success" },
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
              {fees.map((f,i) => (
                <tr key={i}>
                  <td className="ps-4 small fw-medium text-dark">{f.label}</td>
                  <td className="text-end small text-dark">₱{f.amount.toLocaleString()}</td>
                  <td className="text-end pe-4"><span className={`badge ${f.paid?"bg-success-subtle text-success border border-success-subtle":"bg-danger-subtle text-danger border border-danger-subtle"}`}>{f.paid?"✓ Paid":"Unpaid"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {balance>0 && (
        <div className="alert alert-warning d-flex align-items-start gap-2">
          <span>💳</span>
          <div className="small">You have an outstanding balance of <strong>₱{balance.toLocaleString()}</strong>. Please settle at the Finance Office or visit the Student Portal for online payment options.</div>
        </div>
      )}
      <button onClick={() => onAskJobert(`My tuition balance is ₱${balance.toLocaleString()}. How do I pay it?`)} className="btn btn-outline-primary btn-sm" style={{ fontSize:12 }}>🤖 Ask JOBERT about payment</button>
    </div>
  );
}

/* ── Documents View ── */
function DocumentsView({ onAskJobert }: { onAskJobert:(p:string)=>void }) {
  const [requests, setRequests] = useState(documentRequests);
  const [selectedDoc, setSelectedDoc] = useState<string|null>(null);
  const approved = requests.filter(r => r.status==="approved");
  const pending  = requests.filter(r => r.status==="pending");

  function requestDocument(type: string) {
    if (!requests.some(r => r.type===type && r.status==="pending")) {
      setRequests(prev => [...prev, { id:Date.now(), type, status:"pending", requestedAt:new Date().toLocaleDateString("en-PH",{month:"long",day:"numeric",year:"numeric"}), approvedAt:null, approvedBy:null, releaseDate:null, downloadUrl:null }]);
    }
    setSelectedDoc(null);
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div><h2 className="fw-black fs-4 text-dark mb-1">Documents</h2><p className="text-muted small mb-0">Request and download official documents</p></div>
      <div>
        <p className="text-muted text-uppercase small fw-semibold mb-3" style={{ letterSpacing:"0.08em" }}>Available Documents</p>
        <div className="row g-3">
          {availableDocuments.map(doc => {
            const alreadyPending = requests.some(r => r.type===doc.type && r.status==="pending");
            return (
              <div key={doc.id} className="col-12 col-sm-6 col-lg-4">
                <div className="card border-0 shadow-sm rounded-3 h-100" style={{ cursor:alreadyPending?"default":"pointer", transition:"transform 0.15s" }}
                  onMouseEnter={e => { if(!alreadyPending)(e.currentTarget as HTMLDivElement).style.transform="translateY(-3px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform=""; }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start gap-3 mb-3">
                      <div className="rounded-3 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width:44, height:44, fontSize:22 }}>{doc.icon}</div>
                      <div><div className="fw-bold small text-dark">{doc.name}</div><div className="text-muted" style={{ fontSize:11 }}>{doc.description}</div></div>
                    </div>
                    {alreadyPending
                      ? <span className="badge bg-warning-subtle text-warning border border-warning-subtle w-100 py-2">⏳ Request Pending</span>
                      : <button onClick={() => setSelectedDoc(doc.type)} className="btn btn-primary btn-sm w-100" style={{ fontSize:11 }}>📨 Request Document</button>
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm modal */}
      {selectedDoc && (
        <div className="modal d-block" style={{ background:"rgba(0,0,0,0.5)", zIndex:9999 }} onClick={() => setSelectedDoc(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content rounded-3 border-0 shadow-lg">
              <div className="modal-body p-4">
                <h5 className="fw-bold text-dark mb-2">Request {availableDocuments.find(d=>d.type===selectedDoc)?.name}?</h5>
                <p className="text-muted small mb-4">This request will be sent to the Registrar&apos;s Office for approval.</p>
                <div className="d-flex gap-2">
                  <button onClick={() => requestDocument(selectedDoc)} className="btn btn-primary flex-grow-1">Confirm Request</button>
                  <button onClick={() => setSelectedDoc(null)} className="btn btn-outline-secondary flex-grow-1">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {pending.length>0 && (
        <div>
          <p className="text-muted text-uppercase small fw-semibold mb-3" style={{ letterSpacing:"0.08em" }}>⏳ Pending Requests</p>
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="small text-muted fw-semibold text-uppercase ps-4" style={{ letterSpacing:"0.05em" }}>Document</th>
                    <th className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing:"0.05em" }}>Requested</th>
                    <th className="small text-muted fw-semibold text-uppercase pe-4" style={{ letterSpacing:"0.05em" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map(r => (
                    <tr key={r.id}>
                      <td className="ps-4 small fw-medium text-dark">{r.type}</td>
                      <td className="small text-muted">{r.requestedAt}</td>
                      <td className="pe-4"><span className="badge bg-warning-subtle text-warning border border-warning-subtle">⏳ Pending</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {approved.length>0 && (
        <div>
          <p className="text-muted text-uppercase small fw-semibold mb-3" style={{ letterSpacing:"0.08em" }}>✅ Approved Documents</p>
          <div className="d-flex flex-column gap-2">
            {approved.map(r => (
              <div key={r.id} className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-3 d-flex align-items-center gap-3">
                  <div className="rounded-3 bg-success bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width:40, height:40, fontSize:20 }}>📄</div>
                  <div className="flex-grow-1">
                    <div className="fw-bold small text-dark">{r.type}</div>
                    <div className="text-muted" style={{ fontSize:11 }}>Approved by {r.approvedBy} · {r.approvedAt} · Ready: {r.releaseDate}</div>
                  </div>
                  <a href={r.downloadUrl||"#"} className="btn btn-success btn-sm" style={{ fontSize:11 }}>⬇ Download</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => onAskJobert("How do I request a Transcript of Records?")} className="btn btn-outline-primary btn-sm" style={{ fontSize:12 }}>🤖 Ask JOBERT about documents</button>
    </div>
  );
}

/* ── Notifications View ── */
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
          <h3 className="fw-bold small text-dark mb-3">🔔 Unread</h3>
          <div className="d-flex flex-column gap-2">
            {unread.map(n => (
              <div key={n.id} className="card border-0 shadow-sm rounded-3" style={{ background:"rgba(59,130,246,0.04)", border:"1px solid rgba(59,130,246,0.12)" }}>
                <div className="card-body p-3 d-flex align-items-start gap-3">
                  <span style={{ fontSize:18 }}>{n.icon}</span>
                  <div className="flex-grow-1">
                    <div className="fw-bold small text-dark">{n.title}</div>
                    <div className="text-muted small mt-1">{n.message}</div>
                    <div className="text-muted mt-1" style={{ fontSize:11 }}>{n.time}</div>
                  </div>
                  <div className="d-flex gap-1">
                    <button onClick={() => setNotifs(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x))} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize:12 }}>✓</button>
                    <button onClick={() => setNotifs(prev=>prev.filter(x=>x.id!==n.id))} className="btn btn-link btn-sm p-0 text-danger" style={{ fontSize:12 }}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {read.length>0 && (
        <div>
          <h3 className="fw-bold small text-dark mb-3">✅ Read</h3>
          <div className="d-flex flex-column gap-2">
            {read.map(n => (
              <div key={n.id} className="card border-0 shadow-sm rounded-3 opacity-75">
                <div className="card-body p-3 d-flex align-items-start gap-3">
                  <span style={{ fontSize:16 }}>{n.icon}</span>
                  <div className="flex-grow-1"><div className="fw-bold small text-dark">{n.title}</div><div className="text-muted small">{n.message}</div></div>
                  <button onClick={() => setNotifs(prev=>prev.filter(x=>x.id!==n.id))} className="btn btn-link btn-sm p-0 text-danger" style={{ fontSize:12 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */
export default function DashboardPage() {
  const [panel, setPanel]         = useState<Panel>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifList, setNotifList] = useState(notifications);
  const [jobertPrompt, setJobertPrompt] = useState<string|undefined>(undefined);

  const unreadCount = notifList.filter(n => !n.read).length;

  function askJobert(prompt: string) {
    setJobertPrompt(undefined);
    setTimeout(() => setJobertPrompt(prompt), 50);
  }


  function renderPanel() {
    switch (panel) {
      case "grades":        return <GradesView       onAskJobert={askJobert} />;
      case "schedule":      return <ScheduleView     onAskJobert={askJobert} />;
      case "tuition":       return <TuitionView      onAskJobert={askJobert} />;
      case "documents":     return <DocumentsView    onAskJobert={askJobert} />;
      case "notifications": return <NotificationsView />;
      default:              return <HomePanel setPanel={setPanel} onAskJobert={askJobert} />;
    }
  }

  return (
    <div className="dashboard-layout" suppressHydrationWarning>
      <Sidebar active={panel} setActive={setPanel} show={mobileOpen} setShow={setMobileOpen} unreadCount={unreadCount} onExpandChange={setSidebarExpanded} />

      <div className="dashboard-main dashboard-content" style={{ marginLeft: sidebarExpanded ? 256 : 80 }}>
        {/* Topbar */}
        <header className="bg-white border-bottom px-4 py-3 d-flex align-items-center gap-3 flex-shrink-0 shadow-sm">
          <button className="btn btn-link text-muted p-1 d-lg-none" onClick={() => setMobileOpen(true)}>
            <div style={{ width:20, height:2, background:"currentColor", marginBottom:4 }} />
            <div style={{ width:20, height:2, background:"currentColor", marginBottom:4 }} />
            <div style={{ width:20, height:2, background:"currentColor" }} />
          </button>
          <div className="fw-bold text-dark d-none d-sm-block">
            {navItems.find(n => n.id===panel)?.label ?? "Dashboard"}
          </div>
          <div className="d-flex align-items-center gap-3 ms-auto">
            <span className="badge bg-success-subtle text-success border border-success-subtle d-none d-sm-flex align-items-center gap-1">
              <span className="rounded-circle bg-success d-inline-block" style={{ width:7, height:7 }} />Active Student
            </span>
            <button className="btn btn-link text-muted p-1 position-relative" onClick={() => setShowNotif(!showNotif)}>
              <span style={{ fontSize:20 }}>🔔</span>
              {unreadCount>0 && <span className="position-absolute top-0 end-0 rounded-circle bg-danger d-flex align-items-center justify-content-center text-white" style={{ width:16, height:16, fontSize:9, fontWeight:"bold" }}>{unreadCount}</span>}
            </button>
            <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width:32, height:32, fontSize:12, background:"linear-gradient(135deg,#6366f1,#7c3aed)", cursor:"pointer" }}>JS</div>
          </div>
        </header>

        <main className="flex-grow-1 overflow-auto p-3 p-sm-4">
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
                <button onClick={() => setShowNotif(false)} className="btn btn-link btn-sm p-0 text-muted" style={{ fontSize:18 }}>✕</button>
              </div>
            </div>
            {notifList.length===0
              ? <div className="px-4 py-5 text-center text-muted"><div style={{ fontSize:32, marginBottom:8 }}>🔔</div><small>No notifications</small></div>
              : notifList.map(n => (
                <div key={n.id} className="px-4 py-3 border-bottom d-flex gap-3" style={{ background:n.read?"white":"rgba(99,102,241,0.04)", opacity:n.read?0.7:1 }}>
                  <div style={{ fontSize:20, minWidth:24 }}>{n.icon}</div>
                  <div className="flex-grow-1">
                    <div className="fw-bold small text-dark">{n.title}</div>
                    <div className="text-muted" style={{ fontSize:12, lineHeight:1.4 }}>{n.message}</div>
                    <div className="text-muted" style={{ fontSize:11, marginTop:4 }}>{n.time}</div>
                  </div>
                  <div className="d-flex gap-1 flex-shrink-0">
                    {!n.read && <button onClick={() => setNotifList(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x))} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize:12 }}>✓</button>}
                    <button onClick={() => setNotifList(prev=>prev.filter(x=>x.id!==n.id))} className="btn btn-link btn-sm p-0 text-danger" style={{ fontSize:14 }}>✕</button>
                  </div>
                </div>
              ))
            }
            {notifList.length>0 && <div className="px-4 py-2 border-top text-center"><button onClick={() => { setPanel("notifications"); setShowNotif(false); }} className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize:12 }}>View all →</button></div>}
          </div>
          <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex:9998 }} onClick={() => setShowNotif(false)} />
        </>
      )}

      <JobertChat initialPrompt={jobertPrompt} />
    </div>
  );
}
