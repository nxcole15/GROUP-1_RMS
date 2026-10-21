"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type AdminRecord = {
  id: number;
  admin_id: string;
  full_name: string;
  role: string;
  email: string;
  is_archived: number;
  created_at: string;
  updated_at: string;
};

type IconName = "users" | "check" | "archive" | "shield" | "user" | "briefcase" | "calculator" | "settings" | "activity" | "menu";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const props = {
    width: size, height: size, fill: "none", viewBox: "0 0 24 24",
    stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "users": return <svg {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
    case "check": return <svg {...props}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
    case "archive": return <svg {...props}><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>;
    case "shield": return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case "user": return <svg {...props}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case "briefcase": return <svg {...props}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>;
    case "calculator": return <svg {...props}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg>;
    case "settings": return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/></svg>;
    case "activity": return <svg {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case "menu": return <svg {...props}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
    default: return <svg {...props}><circle cx="12" cy="12" r="10"/></svg>;
  }
}

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentRole = localStorage.getItem("inform_role");
    if (currentRole !== "super_admin") {
      router.replace("/login");
      return;
    }

    loadAdmins();
  }, [router]);

  async function loadAdmins() {
    try {
      setLoading(true);
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/admin/admins`, { 
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load admin accounts.");
      setAdmins(Array.isArray(data.admins) ? data.admins : []);
    } catch (err) {
      console.error("Failed to load admins:", err);
    } finally {
      setLoading(false);
    }
  }

  const totalAdmins = admins.length;
  const activeAdmins = admins.filter(a => !a.is_archived).length;
  const archivedAdmins = admins.filter(a => a.is_archived).length;
  const principalCount = admins.filter(a => a.role === "principal" && !a.is_archived).length;
  const registrarCount = admins.filter(a => a.role === "registrar" && !a.is_archived).length;
  const accountingCount = admins.filter(a => a.role === "accounting" && !a.is_archived).length;

  const roleDistribution = [
    { role: "Principal", count: principalCount, color: "#3b82f6", percentage: activeAdmins > 0 ? (principalCount / activeAdmins * 100) : 0 },
    { role: "Registrar", count: registrarCount, color: "#8b5cf6", percentage: activeAdmins > 0 ? (registrarCount / activeAdmins * 100) : 0 },
    { role: "Accounting", count: accountingCount, color: "#06b6d4", percentage: activeAdmins > 0 ? (accountingCount / activeAdmins * 100) : 0 },
  ];

  const stats = [
    {
      label: "Total Accounts",
      value: totalAdmins,
      icon: <Icon name="users" size={22} />,
      gradient: "linear-gradient(135deg,#3b82f6,#60a5fa)",
      shadow: "rgba(59,130,246,0.35)",
      textColor: "#3b82f6",
      bgLight: "#eff6ff",
    },
    {
      label: "Active Accounts",
      value: activeAdmins,
      icon: <Icon name="check" size={22} />,
      gradient: "linear-gradient(135deg,#8b5cf6,#a78bfa)",
      shadow: "rgba(139,92,246,0.35)",
      textColor: "#8b5cf6",
      bgLight: "#f5f3ff",
    },
    {
      label: "Archived",
      value: archivedAdmins,
      icon: <Icon name="archive" size={22} />,
      gradient: "linear-gradient(135deg,#06b6d4,#22d3ee)",
      shadow: "rgba(6,182,212,0.35)",
      textColor: "#06b6d4",
      bgLight: "#ecfeff",
    },
    {
      label: "System Health",
      value: "Healthy",
      icon: <Icon name="shield" size={22} />,
      gradient: "linear-gradient(135deg,#10b981,#34d399)",
      shadow: "rgba(16,185,129,0.35)",
      textColor: "#10b981",
      bgLight: "#f0fdf4",
    },
  ];

  return (
    <>
      {showSidebar && <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" style={{ zIndex: 1040 }} onClick={() => setShowSidebar(false)} />}
      <div className={`position-fixed top-0 start-0 h-100 d-flex flex-column flex-shrink-0 ${showSidebar ? "" : "d-none d-lg-flex"}`} style={{ width: 256, zIndex: 1045, background: "linear-gradient(180deg,#1e3a8a 0%,#1e40af 100%)", overflowY: "auto" }}>
        <div className="p-4 d-flex flex-column align-items-center border-bottom border-white border-opacity-10">
          <Image src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle mb-3" width={80} height={80} />
          <div className="text-center">
            <div className="text-white fw-bold" style={{ fontSize: "1.1rem" }}>Super Admin</div>
            <div className="text-white-50 small">System Control Panel</div>
          </div>
        </div>

        <nav className="flex-grow-1 px-3 py-3 d-flex flex-column gap-2">
          <button className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0" style={{ color: "#fff", background: "#3b82f6" }}>
            <Icon name="activity" size={20} />
            <span>Overview</span>
          </button>
          <button onClick={() => router.push("/admin/super-admin/create")} className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0" style={{ color: "rgba(255,255,255,0.7)", background: "transparent" }}>
            <Icon name="users" size={20} />
            <span>Manage Accounts</span>
          </button>
        </nav>

        <div className="px-3 py-4 border-top border-white border-opacity-10">
          <button onClick={() => {
            localStorage.removeItem("inform_token");
            localStorage.removeItem("inform_role");
            localStorage.removeItem("inform_user");
            localStorage.removeItem("inform_admin_token");
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
        <div className="d-flex flex-column gap-0">
          <div style={{ background: "linear-gradient(135deg,#3b82f6 0%,#60a5fa 100%)", borderRadius: "0", padding: "32px 32px 80px", position: "relative", overflow: "hidden" }}>
            <div style={{ position:"absolute", top:-50, right:-50, width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
            <div style={{ position:"absolute", bottom:-60, right:160, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
            <div style={{ position:"absolute", top:20, right:80, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />

            <div style={{ position:"relative", zIndex:1 }}>
              <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
                <div>
                  <h1 className="fw-bold text-white mb-1" style={{ fontSize:"1.8rem" }}>Super Admin Dashboard</h1>
                  <p className="mb-3" style={{ color:"rgba(255,255,255,0.75)" }}>System Administration & Account Management</p>
                  <div className="d-flex gap-2 flex-wrap">
                    <span className="badge px-3 py-2 rounded-pill" style={{ background:"rgba(255,255,255,0.2)", color:"white", border:"1px solid rgba(255,255,255,0.3)", fontSize:"0.78rem" }}>🔒 Full Access</span>
                    <span className="badge px-3 py-2 rounded-pill" style={{ background:"rgba(255,255,255,0.15)", color:"white", border:"1px solid rgba(255,255,255,0.25)", fontSize:"0.78rem" }}>📅 SY 2025-2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container-fluid px-3 px-md-4" style={{ marginTop:"-52px", paddingBottom:32 }}>
            <div className="row g-3 mb-4">
              {stats.map(s => (
                <div key={s.label} className="col-6 col-lg-3">
                  <div className="card border-0 shadow-lg rounded-4 h-100" style={{ overflow:"hidden" }}>
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width:46, height:46, background:s.gradient, boxShadow:`0 4px 14px ${s.shadow}`, color: "white" }}>
                          {s.icon}
                        </div>
                        <div className="rounded-pill px-2 py-1" style={{ background:s.bgLight }}>
                          <div className="fw-bold" style={{ fontSize:"0.7rem", color:s.textColor }}>↑ Live</div>
                        </div>
                      </div>
                      <div className="fw-black" style={{ fontSize:"1.6rem", color:s.textColor, lineHeight:1 }}>{s.value}</div>
                      <div className="text-muted mt-1" style={{ fontSize:"0.78rem" }}>{s.label}</div>
                    </div>
                    <div style={{ height:3, background:s.gradient }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="row g-4 mb-4">
              <div className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width:36, height:36, background:"linear-gradient(135deg,#3b82f6,#60a5fa)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                        </svg>
                      </div>
                      <h3 className="fw-bold mb-0" style={{ fontSize:"0.95rem", color:"#1e293b" }}>Role Distribution</h3>
                    </div>

                    {activeAdmins > 0 ? (
                      <div className="d-flex flex-column gap-3">
                        {roleDistribution.map((role, i) => (
                          <div key={i}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <div className="d-flex align-items-center gap-2">
                                <div className="rounded" style={{ width:12, height:12, background:role.color }} />
                                <span className="small fw-semibold">{role.role}</span>
                              </div>
                              <span className="badge px-2 py-1" style={{ background:"#eff6ff", color:"#3b82f6", fontSize:"0.7rem" }}>{role.count}</span>
                            </div>
                            <div className="progress" style={{ height:8, background:"#f1f5f9" }}>
                              <div className="progress-bar" style={{ width:`${role.percentage}%`, background:role.color }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted small">No active admin accounts</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-6">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width:36, height:36, background:"linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
                        <Icon name="briefcase" size={16} />
                      </div>
                      <h3 className="fw-bold mb-0" style={{ fontSize:"0.95rem", color:"#1e293b" }}>Admin Roles Breakdown</h3>
                    </div>

                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background:"#eff6ff" }}>
                        <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width:40, height:40, background:"linear-gradient(135deg,#3b82f6,#60a5fa)" }}>
                          <Icon name="shield" size={18} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="small fw-bold text-dark">Principal Officers</div>
                          <div className="text-muted" style={{ fontSize:11 }}>Executive administration</div>
                        </div>
                        <span className="badge rounded-pill px-3 py-2" style={{ background:"#3b82f6", color:"white", fontSize:"0.85rem" }}>{principalCount}</span>
                      </div>

                      <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background:"#f5f3ff" }}>
                        <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width:40, height:40, background:"linear-gradient(135deg,#8b5cf6,#a78bfa)" }}>
                          <Icon name="user" size={18} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="small fw-bold text-dark">Registrar Staff</div>
                          <div className="text-muted" style={{ fontSize:11 }}>Student records management</div>
                        </div>
                        <span className="badge rounded-pill px-3 py-2" style={{ background:"#8b5cf6", color:"white", fontSize:"0.85rem" }}>{registrarCount}</span>
                      </div>

                      <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background:"#ecfeff" }}>
                        <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width:40, height:40, background:"linear-gradient(135deg,#06b6d4,#22d3ee)" }}>
                          <Icon name="calculator" size={18} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="small fw-bold text-dark">Accounting Staff</div>
                          <div className="text-muted" style={{ fontSize:11 }}>Financial operations</div>
                        </div>
                        <span className="badge rounded-pill px-3 py-2" style={{ background:"#06b6d4", color:"white", fontSize:"0.85rem" }}>{accountingCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

              {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" style={{ color:"#3b82f6" }} />
                <div className="mt-3 text-muted">Loading accounts...</div>
              </div>
            ) : (
              <div className="row g-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <div className="d-flex align-items-center gap-2">
                          <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width:36, height:36, background:"linear-gradient(135deg,#3b82f6,#60a5fa)" }}>
                            <Icon name="users" size={16} />
                          </div>
                          <h3 className="fw-bold mb-0" style={{ fontSize:"0.95rem", color:"#1e293b" }}>Recent Admin Accounts</h3>
                        </div>
                        <button onClick={() => router.push("/admin/super-admin/create")} className="btn btn-sm px-3 py-2" style={{ background:"#3b82f6", color:"white", fontSize:"0.8rem" }}>
                          View All
                        </button>
                      </div>

                      <div className="table-responsive">
                        <table className="table align-middle mb-0">
                          <thead>
                            <tr style={{ borderBottom:"2px solid #f1f5f9" }}>
                              <th className="fw-bold text-dark small">Admin ID</th>
                              <th className="fw-bold text-dark small">Name</th>
                              <th className="fw-bold text-dark small">Role</th>
                              <th className="fw-bold text-dark small">Email</th>
                              <th className="fw-bold text-dark small">Status</th>
                              <th className="fw-bold text-dark small">Created</th>
                            </tr>
                          </thead>
                          <tbody>
                            {admins.slice(0, 8).map((admin) => (
                              <tr key={admin.id} style={{ borderBottom:"1px solid #f8fafc" }}>
                                <td className="fw-semibold small">{admin.admin_id}</td>
                                <td className="small">{admin.full_name}</td>
                                <td>
                                  <span className="badge px-2 py-1 text-capitalize" style={{ 
                                    background: admin.role === "principal" ? "#eff6ff" : admin.role === "registrar" ? "#f5f3ff" : "#ecfeff",
                                    color: admin.role === "principal" ? "#3b82f6" : admin.role === "registrar" ? "#8b5cf6" : "#06b6d4",
                                    fontSize:"0.7rem"
                                  }}>{admin.role}</span>
                                </td>
                                <td className="text-muted small">{admin.email}</td>
                                <td>
                                  {admin.is_archived ? (
                                    <span className="badge px-2 py-1" style={{ background:"#f1f5f9", color:"#64748b", fontSize:"0.7rem" }}>Archived</span>
                                  ) : (
                                    <span className="badge px-2 py-1" style={{ background:"#dcfce7", color:"#16a34a", fontSize:"0.7rem" }}>Active</span>
                                  )}
                                </td>
                                <td className="text-muted small">
                                  {new Date(admin.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {admins.length === 0 && (
                        <div className="text-center py-5">
                          <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width:60, height:60, background:"#f8fafc" }}>
                            <Icon name="users" size={24} />
                          </div>
                          <p className="text-muted small mb-0">No admin accounts yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="d-lg-none">
        <div className="d-flex flex-column gap-0">
          <div style={{ background: "linear-gradient(135deg,#3b82f6 0%,#60a5fa 100%)", borderRadius: "0", padding: "32px 32px 80px", position: "relative", overflow: "hidden" }}>
            <button className="btn position-absolute top-0 start-0 m-3" onClick={() => setShowSidebar(true)} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }}>
              <Icon name="menu" size={20} />
            </button>

            <div style={{ position:"relative", zIndex:1, paddingTop: 40 }}>
              <h1 className="fw-bold text-white mb-1" style={{ fontSize:"1.5rem" }}>Super Admin Dashboard</h1>
              <p className="mb-0" style={{ color:"rgba(255,255,255,0.75)", fontSize: "0.9rem" }}>System Administration</p>
            </div>
          </div>

          <div className="container-fluid px-3" style={{ marginTop:"-52px", paddingBottom:32 }}>
            <div className="row g-3 mb-4">
              {stats.map(s => (
                <div key={s.label} className="col-6">
                  <div className="card border-0 shadow-lg rounded-4 h-100" style={{ overflow:"hidden" }}>
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width:36, height:36, background:s.gradient, color: "white" }}>
                          {s.icon}
                        </div>
                      </div>
                      <div className="fw-black" style={{ fontSize:"1.3rem", color:s.textColor, lineHeight:1 }}>{s.value}</div>
                      <div className="text-muted mt-1" style={{ fontSize:"0.7rem" }}>{s.label}</div>
                    </div>
                    <div style={{ height:3, background:s.gradient }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="card border-0 shadow-sm rounded-4 mb-3">
              <div className="card-body p-3">
                <h3 className="fw-bold mb-3" style={{ fontSize:"0.9rem" }}>Role Distribution</h3>
                <div className="d-flex flex-column gap-2">
                  {roleDistribution.map((role, i) => (
                    <div key={i}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small">{role.role}</span>
                        <span className="badge px-2 py-1" style={{ background:"#fef2f2", color:"#dc2626", fontSize:"0.65rem" }}>{role.count}</span>
                      </div>
                      <div className="progress" style={{ height:6, background:"#f1f5f9" }}>
                        <div className="progress-bar" style={{ width:`${role.percentage}%`, background:role.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="fw-bold mb-0" style={{ fontSize:"0.9rem" }}>Recent Accounts</h3>
                  <button onClick={() => router.push("/admin/super-admin/create")} className="btn btn-sm px-2 py-1" style={{ background:"#3b82f6", color:"white", fontSize:"0.7rem" }}>
                    View All
                  </button>
                </div>
                <div className="d-flex flex-column gap-2">
                  {admins.slice(0, 5).map((admin) => (
                    <div key={admin.id} className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background:"#f8fafc" }}>
                      <div className="flex-grow-1">
                        <div className="fw-semibold" style={{ fontSize:"0.8rem" }}>{admin.full_name}</div>
                        <div className="text-muted" style={{ fontSize:"0.65rem" }}>{admin.role}</div>
                      </div>
                      <span className="badge px-2 py-1" style={{ 
                        background: admin.is_archived ? "#f1f5f9" : "#dcfce7", 
                        color: admin.is_archived ? "#64748b" : "#16a34a",
                        fontSize:"0.65rem"
                      }}>
                        {admin.is_archived ? "Archived" : "Active"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
