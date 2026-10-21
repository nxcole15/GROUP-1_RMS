"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type IconName = "activity" | "menu";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const props = {
    width: size, height: size, fill: "none", viewBox: "0 0 24 24",
    stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "activity": return <svg {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case "menu": return <svg {...props}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
    default: return <svg {...props}><circle cx="12" cy="12" r="10"/></svg>;
  }
}

export default function AccountingProfilePage() {
  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("inform_role");
    if (role !== "accounting") {
      router.replace("/login");
      return;
    }
  }, [router]);

  const name = "Accounting Officer";
  const accountingId = "ACC-2025-001";
  const email = "accounting@cfei.edu.ph";
  const department = "Financial Management";

  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const infoItems = [
    {
      label: "Email",
      value: email,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>,
      bg: "#eff6ff",
    },
    {
      label: "Role",
      value: "Accounting",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>,
      bg: "#f0fdf4",
    },
    {
      label: "Access Level",
      value: "Full Access",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>,
      bg: "#faf5ff",
    },
  ];

  return (
    <>
      {showSidebar && <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" style={{ zIndex: 1040 }} onClick={() => setShowSidebar(false)} />}
      <div className={`position-fixed top-0 start-0 h-100 d-flex flex-column flex-shrink-0 ${showSidebar ? "" : "d-none d-lg-flex"}`} style={{ width: 256, zIndex: 1045, background: "linear-gradient(180deg,#1e3a8a 0%,#1e40af 100%)", overflowY: "auto" }}>
        <div className="p-4 d-flex flex-column align-items-center border-bottom border-white border-opacity-10">
          <Image src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle mb-3" width={80} height={80} />
          <div className="text-center">
            <div className="text-white fw-bold" style={{ fontSize: "1.1rem" }}>Accounting</div>
            <div className="text-white-50 small">Payment Management</div>
          </div>
        </div>

        <nav className="flex-grow-1 px-3 py-3 d-flex flex-column gap-2">
          <button onClick={() => router.push("/accounting/dashboard")} className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0" style={{ color: "rgba(255,255,255,0.7)", background: "transparent" }}>
            <Icon name="activity" size={20} />
            <span>Overview</span>
          </button>
          <button onClick={() => router.push("/accounting/payments")} className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0" style={{ color: "rgba(255,255,255,0.7)", background: "transparent" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            <span>Payments</span>
          </button>
          <button className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0" style={{ color: "#fff", background: "#3b82f6" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span>My Profile</span>
          </button>
        </nav>

        <div className="px-3 py-4 border-top border-white border-opacity-10">
          <button onClick={() => {
            localStorage.clear();
            router.push("/login");
          }} className="btn w-100 fw-bold py-3 d-flex align-items-center justify-content-center gap-2" style={{ background: "#1e3a8a", color: "#fff", border: "2px solid #1e40af", fontSize: "1rem" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </div>

      <div style={{ marginLeft: 256 }} className="d-none d-lg-block">
        <div className="min-vh-100" style={{ background: "#f5f5f5" }}>
          <header style={{ background: "linear-gradient(135deg,#3b82f6 0%,#60a5fa 100%)", padding: "32px 0", position: "relative", overflow: "hidden" }}>
            <div style={{ position:"absolute", top:-50, right:-50, width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
            <div style={{ position:"absolute", bottom:-60, right:160, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
            
            <div className="container-fluid px-4" style={{ position: "relative", zIndex: 1 }}>
              <h1 className="fw-bold text-white mb-1" style={{ fontSize:"1.8rem" }}>My Profile</h1>
              <p className="mb-0" style={{ color: "rgba(255,255,255,0.8)", fontSize: 15 }}>Your personal & professional information</p>
            </div>
          </header>

          <main className="container-fluid px-4" style={{ marginTop: "-40px", paddingBottom: 32 }}>
            <div className="row g-4">
              
              {/* Left: Profile Card */}
              <div className="col-12 col-lg-4">
                <div className="card border-0 shadow-lg rounded-4 h-100" style={{ overflow:"hidden" }}>
                  <div className="card-body p-0">
                    {/* gradient header */}
                    <div className="p-4 text-center" style={{ background:"linear-gradient(135deg,#3b82f6,#60a5fa)" }}>
                      <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                        style={{ width:100, height:100, background:"rgba(255,255,255,0.25)", border:"3px solid rgba(255,255,255,0.4)", fontSize:"2.2rem", fontWeight:"bold", color:"white" }}>
                        {initials}
                      </div>
                      <h4 className="fw-bold text-white mb-1">{name}</h4>
                      <p className="text-white mb-3" style={{ opacity:0.9, fontSize:"0.82rem" }}>{email}</p>
                      <div className="d-flex justify-content-center gap-2">
                        <span className="badge px-3 py-2 rounded-pill" style={{ background:"rgba(255,255,255,0.2)", color:"white", border:"1px solid rgba(255,255,255,0.3)", fontSize:"0.75rem" }}>
                          Accounting
                        </span>
                        <span className="badge px-3 py-2 rounded-pill" style={{ background:"rgba(16,185,129,0.2)", color:"#d1fae5", border:"1px solid rgba(16,185,129,0.3)", fontSize:"0.75rem", fontWeight:600 }}>
                          Active
                        </span>
                      </div>
                    </div>

                    {/* stat boxes */}
                    <div className="p-4">
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <div className="rounded-3 p-3 text-center" style={{ background:"#f8fafc", border:"1px solid #e2e8f0" }}>
                            <div className="fw-bold" style={{ fontSize:"1.15rem", color:"#3b82f6" }}>Full Access</div>
                            <div className="text-muted" style={{ fontSize:"0.7rem" }}>Access Level</div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="rounded-3 p-3 text-center" style={{ background:"#f8fafc", border:"1px solid #e2e8f0" }}>
                            <div className="fw-bold" style={{ fontSize:"1.15rem", color:"#10b981" }}>Active</div>
                            <div className="text-muted" style={{ fontSize:"0.7rem" }}>Status</div>
                          </div>
                        </div>
                      </div>

                      {/* quick-info list */}
                      <hr style={{ borderColor:"#e2e8f0" }} />
                      <div className="d-flex flex-column gap-3">
                        {infoItems.map(item => (
                          <div key={item.label} className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                              style={{ width:34, height:34, background:item.bg }}>
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
              </div>

              {/* Right: Details Card */}
              <div className="col-12 col-lg-8">
                <div className="card border-0 shadow-lg rounded-4 h-100">
                  <div className="card-body p-4 p-md-5">

                    {/* card header */}
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center justify-content-center rounded-3"
                          style={{ width:44, height:44, background:"linear-gradient(135deg,#3b82f6,#60a5fa)" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-0" style={{ color:"#1e293b" }}>Profile Information</h5>
                          <p className="text-muted mb-0" style={{ fontSize:"0.82rem" }}>Your account and role details</p>
                        </div>
                      </div>
                      <span className="badge px-3 py-2 rounded-pill" style={{ background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe", fontSize:"0.75rem" }}>
                        Read-Only
                      </span>
                    </div>

                    {/* Personal section */}
                    <div className="mb-4">
                      <div className="d-flex align-items-center gap-2 mb-3 pb-2" style={{ borderBottom:"2px solid #f1f5f9" }}>
                        <div style={{ width:4, height:16, background:"linear-gradient(135deg,#3b82f6,#60a5fa)", borderRadius:4 }} />
                        <span className="fw-semibold text-uppercase" style={{ fontSize:"0.72rem", letterSpacing:"0.08em", color:"#64748b" }}>Personal Details</span>
                      </div>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>Full Name</label>
                          <input type="text" className="form-control rounded-3" value={name} disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc" }} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>Role</label>
                          <input type="text" className="form-control rounded-3" value="Accounting" disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc" }} />
                        </div>
                      </div>
                    </div>

                    {/* Contact section */}
                    <div className="mb-4">
                      <div className="d-flex align-items-center gap-2 mb-3 pb-2" style={{ borderBottom:"2px solid #f1f5f9" }}>
                        <div style={{ width:4, height:16, background:"linear-gradient(135deg,#8b5cf6,#a78bfa)", borderRadius:4 }} />
                        <span className="fw-semibold text-uppercase" style={{ fontSize:"0.72rem", letterSpacing:"0.08em", color:"#64748b" }}>Contact Information</span>
                      </div>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label small fw-semibold text-uppercase text-muted" style={{ fontSize:10.5 }}>Email Address</label>
                          <input type="email" className="form-control rounded-3" value={email} disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc" }} />
                        </div>
                      </div>
                    </div>

                    {/* Access section */}
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
                          <input type="text" className="form-control rounded-3" value="Active" disabled style={{ border:"1.5px solid #e2e8f0", background:"#f8fafc", color:"#10b981", fontWeight:600 }} />
                        </div>
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
                          Please contact the system administrator or email{" "}
                          <a href="mailto:admin@cfei.edu.ph" style={{ color:"#2563eb", fontWeight:600 }}>admin@cfei.edu.ph</a>{" "}
                          with your updated details.
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>

      <div className="d-lg-none">
        <div className="min-vh-100" style={{ background: "#f5f5f5" }}>
          <header style={{ background: "linear-gradient(135deg,#3b82f6 0%,#60a5fa 100%)", padding: "24px 0", position: "relative" }}>
            <button className="btn position-absolute top-0 start-0 m-3" onClick={() => setShowSidebar(true)} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }}>
              <Icon name="menu" size={20} />
            </button>
            <div className="container-fluid px-4" style={{ paddingTop: 40 }}>
              <h3 className="mb-0 fw-bold text-white" style={{ fontSize: "1.3rem" }}>My Profile</h3>
              <p className="mb-0 text-white-50" style={{ fontSize: 14 }}>Your Information</p>
            </div>
          </header>

          <main className="container-fluid px-3 py-4">
            {/* Profile Card */}
            <div className="card border-0 shadow-sm rounded-4 mb-3">
              <div className="card-body p-0">
                <div className="p-3 text-center" style={{ background:"linear-gradient(135deg,#3b82f6,#60a5fa)" }}>
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                    style={{ width:70, height:70, background:"rgba(255,255,255,0.25)", border:"2px solid rgba(255,255,255,0.4)", fontSize:"1.5rem", fontWeight:"bold", color:"white" }}>
                    {initials}
                  </div>
                  <h5 className="fw-bold text-white mb-1" style={{ fontSize: "1rem" }}>{name}</h5>
                  <p className="text-white mb-2" style={{ opacity:0.9, fontSize:"0.75rem" }}>{email}</p>
                  <div className="d-flex justify-content-center gap-2">
                    <span className="badge px-2 py-1" style={{ background:"rgba(255,255,255,0.2)", color:"white", fontSize:"0.7rem" }}>
                      Accounting
                    </span>
                    <span className="badge px-2 py-1" style={{ background:"rgba(16,185,129,0.2)", color:"#d1fae5", fontSize:"0.7rem" }}>
                      Active
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <div className="d-flex flex-column gap-2">
                    {infoItems.map(item => (
                      <div key={item.label} className="d-flex align-items-center gap-2 p-2 rounded-3" style={{ background:"#f8fafc" }}>
                        <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                          style={{ width:28, height:28, background:item.bg }}>
                          {item.icon}
                        </div>
                        <div style={{ overflow:"hidden" }}>
                          <div className="text-muted" style={{ fontSize:"0.65rem", textTransform:"uppercase" }}>{item.label}</div>
                          <div className="fw-semibold text-truncate" style={{ fontSize:"0.8rem", color:"#1e293b" }}>{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-3">
                <div className="d-flex align-items-start gap-2 rounded-3 p-2" style={{ background:"#eff6ff" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" className="flex-shrink-0 mt-1">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <div>
                    <div className="fw-semibold mb-1" style={{ fontSize:"0.8rem", color:"#1d4ed8" }}>Need to update?</div>
                    <div style={{ fontSize:"0.75rem", color:"#3b82f6" }}>
                      Contact{" "}
                      <a href="mailto:admin@cfei.edu.ph" style={{ color:"#2563eb", fontWeight:600 }}>admin@cfei.edu.ph</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
