"use client";

import { useEffect, useMemo, useState } from "react";
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

type IconName = "users" | "activity" | "menu";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const props = {
    width: size, height: size, fill: "none", viewBox: "0 0 24 24",
    stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "users": return <svg {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
    case "activity": return <svg {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case "menu": return <svg {...props}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
    default: return <svg {...props}><circle cx="12" cy="12" r="10"/></svg>;
  }
}

const emptyForm = {
  admin_id: "",
  full_name: "",
  email: "",
  password: "",
};

export default function SuperAdminCreateAccountPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [role, setRole] = useState("principal");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
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
      setLoadingList(true);
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/admin/admins`, { 
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load admin accounts.");
      setAdmins(Array.isArray(data.admins) ? data.admins : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin accounts.");
    } finally {
      setLoadingList(false);
    }
  }

  const filteredAdmins = useMemo(() => {
    const term = search.toLowerCase();
    return admins.filter((admin) => {
      const matchesText = !term || [admin.admin_id, admin.full_name, admin.email, admin.role].join(" ").toLowerCase().includes(term);
      return matchesText;
    });
  }, [admins, search]);

  function resetForm() {
    setForm(emptyForm);
    setRole("principal");
    setEditingId(null);
  }

  function startEdit(admin: AdminRecord) {
    setEditingId(admin.id);
    setRole(admin.role);
    setForm({
      admin_id: admin.admin_id,
      full_name: admin.full_name,
      email: admin.email,
      password: "",
    });
    setSuccess("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      
      if (editingId) {
        const res = await fetch(`${API_BASE}/api/admin/admins/${editingId}`, {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          credentials: "include",
          body: JSON.stringify({
            full_name: form.full_name,
            email: form.email,
            role,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to update admin account.");
        setSuccess(data.message || "Admin account updated successfully.");
      } else {
        const res = await fetch(`${API_BASE}/api/admin/create-admin`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          credentials: "include",
          body: JSON.stringify({ ...form, role }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to create admin account.");
        setSuccess(`Successfully created ${role} admin account for ${data.admin.admin_id}.`);
        setForm(emptyForm);
      }

      resetForm();
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to process request.");
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive(admin: AdminRecord) {
    try {
      setError("");
      setSuccess("");
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/admin/admins/${admin.id}/archive`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({ archived: Number(admin.is_archived) === 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to update archive status.");
      setSuccess(data.message || "Status updated.");
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update archive status.");
    }
  }

  async function handleDelete(admin: AdminRecord) {
    if (!confirm(`Delete ${admin.full_name} (${admin.admin_id})? This action cannot be undone.`)) return;

    try {
      setError("");
      setSuccess("");
      const token = localStorage.getItem("inform_admin_token") || localStorage.getItem("inform_token");
      const res = await fetch(`${API_BASE}/api/admin/admins/${admin.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to delete admin account.");
      setSuccess(data.message || "Admin account deleted.");
      await loadAdmins();
      if (editingId === admin.id) resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete admin account.");
    }
  }

  return (
    <>
      {showSidebar && <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none" style={{ zIndex: 1040 }} onClick={() => setShowSidebar(false)} />}
      <div className={`position-fixed top-0 start-0 h-100 d-flex flex-column flex-shrink-0 ${showSidebar ? "" : "d-none d-lg-flex"}`} style={{ width: 256, zIndex: 1045, background: "#fff", overflowY: "auto", boxShadow: "2px 0 10px rgba(0,0,0,0.05)" }}>
        <div className="p-4 d-flex flex-column align-items-center border-bottom" style={{ borderColor: "#f1f5f9" }}>
          <Image src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle mb-3" width={80} height={80} />
          <div className="text-center">
            <div className="fw-bold" style={{ fontSize: "1.1rem", color: "#1f2937" }}>Super Admin</div>
            <div className="small" style={{ color: "#6b7280" }}>System Control Panel</div>
          </div>
        </div>

        <nav className="flex-grow-1 px-3 py-3 d-flex flex-column gap-2">
          <button onClick={() => router.push("/admin/super-admin/dashboard")} className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0" style={{ color: "#6b7280", background: "transparent" }}>
            <Icon name="activity" size={20} />
            <span>Overview</span>
          </button>
          <button className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0" style={{ color: "#fff", background: "#374151", boxShadow: "0 2px 8px rgba(75, 85, 99, 0.3)" }}>
            <Icon name="users" size={20} />
            <span>Manage Accounts</span>
          </button>
          <button onClick={() => {
            localStorage.setItem("superadmin_active_panel", "documentation");
            router.push("/admin/super-admin/dashboard");
          }} className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0" style={{ color: "#6b7280", background: "transparent" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
            </svg>
            <span>Documentation</span>
          </button>
        </nav>

        <div className="px-3 py-4 border-top" style={{ borderColor: "#f1f5f9" }}>
          <button onClick={() => {
            localStorage.removeItem("inform_token");
            localStorage.removeItem("inform_role");
            localStorage.removeItem("inform_user");
            localStorage.removeItem("inform_admin_token");
            router.push("/login");
          }} className="btn w-100 fw-bold py-3 d-flex align-items-center justify-content-center gap-2 rounded-3" style={{ background: "#374151", color: "#fff", border: "none", fontSize: "1rem", boxShadow: "0 4px 12px rgba(75, 85, 99, 0.3)" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </div>

      <div style={{ marginLeft: 256 }} className="d-none d-lg-block">
        <div className="min-vh-100" style={{ background: "#ffffff" }}>
          {/* Modern Header */}
          <header style={{ 
            background: "linear-gradient(135deg, #374151 0%, #1f2937 100%)", 
            padding: "32px 0",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
          }}>
            <div className="container-fluid px-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h2 className="mb-2 fw-bold text-white" style={{ fontSize: "1.75rem", letterSpacing: "-0.02em" }}>
                    Admin Account Management
                  </h2>
                  <p className="mb-0 d-flex align-items-center gap-2" style={{ fontSize: 15, color: "rgba(255,255,255,0.9)" }}>
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                    Create, edit, and manage administrator accounts securely
                  </p>
                </div>
                <div className="d-flex gap-3 align-items-center">
                  <div className="text-end text-white">
                    <div className="fw-semibold" style={{ fontSize: "1.5rem", lineHeight: 1 }}>{admins.length}</div>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>Total Admins</div>
                  </div>
                  <div className="text-end text-white">
                    <div className="fw-semibold" style={{ fontSize: "1.5rem", lineHeight: 1 }}>{admins.filter(a => !a.is_archived).length}</div>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>Active</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="container-fluid px-4 py-4">
            {/* Alert Messages */}
            {error && (
              <div className="alert alert-danger border-0 rounded-3 d-flex align-items-center gap-3 mb-4" style={{ 
                background: "#f3f4f6", 
                color: "#374151",
                boxShadow: "0 2px 8px rgba(75, 85, 99, 0.1)"
              }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="alert alert-success border-0 rounded-3 d-flex align-items-center gap-3 mb-4" style={{ 
                background: "#f0fdf4", 
                color: "#16a34a",
                boxShadow: "0 2px 8px rgba(22, 163, 74, 0.1)"
              }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>{success}</span>
              </div>
            )}

            <div className="row g-4">
              {/* Form Section */}
              <div className="col-xl-5">
                <div className="card border-0 rounded-4" style={{ 
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                  background: "#ffffff"
                }}>
                  <div className="card-body p-4">
                    {/* Form Header */}
                    <div className="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom">
                      <div>
                        <h4 className="fw-bold mb-2 d-flex align-items-center gap-2" style={{ color: "#1f2937" }}>
                          <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ 
                            width: 36, 
                            height: 36, 
                            background: "linear-gradient(135deg, #4b5563 0%, #374151 100%)"
                          }}>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                          </div>
                          {editingId ? "Edit Account" : "Create New Account"}
                        </h4>
                        <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                          {editingId ? "Update administrator information" : "Add a new administrator to the system"}
                        </p>
                      </div>
                      {editingId && (
                        <button 
                          className="btn btn-sm px-3 d-flex align-items-center gap-2" 
                          type="button" 
                          onClick={resetForm}
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            color: "#64748b"
                          }}
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                          Cancel
                        </button>
                      )}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold d-flex align-items-center gap-2 mb-2" style={{ fontSize: 14, color: "#374151" }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/>
                            </svg>
                            Admin ID
                          </label>
                          <input 
                            type="text" 
                            className="form-control py-2" 
                            value={form.admin_id} 
                            onChange={(e) => setForm({ ...form, admin_id: e.target.value })} 
                            disabled={!!editingId} 
                            placeholder="e.g. PRINCIPAL01" 
                            required 
                            style={{ 
                              fontSize: 14,
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                              background: editingId ? "#f9fafb" : "#ffffff"
                            }}
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold d-flex align-items-center gap-2 mb-2" style={{ fontSize: 14, color: "#374151" }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                            Role
                          </label>
                          <select 
                            className="form-select py-2" 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)}
                            style={{ 
                              fontSize: 14,
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px"
                            }}
                          >
                            <option value="principal">Principal</option>
                            <option value="registrar">Registrar</option>
                            <option value="accounting">Accounting</option>
                            <option value="teacher_coordinator">Teacher Coordinator</option>
                          </select>
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-semibold d-flex align-items-center gap-2 mb-2" style={{ fontSize: 14, color: "#374151" }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            Full Name
                          </label>
                          <input 
                            type="text" 
                            className="form-control py-2" 
                            value={form.full_name} 
                            onChange={(e) => setForm({ ...form, full_name: e.target.value })} 
                            placeholder="e.g. Maria Santos" 
                            required 
                            style={{ 
                              fontSize: 14,
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px"
                            }}
                          />
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-semibold d-flex align-items-center gap-2 mb-2" style={{ fontSize: 14, color: "#374151" }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            Email Address
                          </label>
                          <input 
                            type="email" 
                            className="form-control py-2" 
                            value={form.email} 
                            onChange={(e) => setForm({ ...form, email: e.target.value })} 
                            placeholder="admin@cfei.edu" 
                            required 
                            style={{ 
                              fontSize: 14,
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px"
                            }}
                          />
                        </div>

                        {!editingId && (
                          <div className="col-12">
                            <label className="form-label fw-semibold d-flex align-items-center gap-2 mb-2" style={{ fontSize: 14, color: "#374151" }}>
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                              </svg>
                              Temporary Password
                            </label>
                            <input 
                              type="password" 
                              className="form-control py-2" 
                              value={form.password} 
                              onChange={(e) => setForm({ ...form, password: e.target.value })} 
                              placeholder="Minimum 8 characters" 
                              minLength={8} 
                              required 
                              style={{ 
                                fontSize: 14,
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px"
                              }}
                            />
                            <small className="text-muted d-block mt-1" style={{ fontSize: 12 }}>
                              User will be required to change this password on first login
                            </small>
                          </div>
                        )}

                        <div className="col-12 pt-3">
                          <button 
                            type="submit" 
                            className="btn w-100 py-3 fw-semibold text-white d-flex align-items-center justify-content-center gap-2" 
                            disabled={loading} 
                            style={{ 
                              fontSize: 15, 
                              background: loading ? "#9ca3af" : "linear-gradient(135deg, #4b5563 0%, #374151 100%)", 
                              border: "none",
                              borderRadius: "10px",
                              boxShadow: loading ? "none" : "0 4px 16px rgba(220, 38, 38, 0.3)"
                            }}
                          >
                            {loading ? (
                              <>
                                <div className="spinner-border spinner-border-sm" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                                {editingId ? "Updating..." : "Creating..."}
                              </>
                            ) : (
                              <>
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                                </svg>
                                {editingId ? "Update Account" : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Accounts List Section */}
              <div className="col-xl-7">
                <div className="card border-0 rounded-4" style={{ 
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                  background: "#ffffff"
                }}>
                  <div className="card-body p-4">
                    {/* List Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom flex-wrap gap-3">
                      <div>
                        <h4 className="fw-bold mb-2 d-flex align-items-center gap-2" style={{ color: "#1f2937" }}>
                          <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ 
                            width: 36, 
                            height: 36, 
                            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                          }}>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                          </div>
                          Administrator Accounts
                        </h4>
                        <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                          {filteredAdmins.length} {filteredAdmins.length === 1 ? 'account' : 'accounts'} found
                        </p>
                      </div>
                      <div className="position-relative">
                        <svg 
                          width="18" 
                          height="18" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="#9ca3af" 
                          strokeWidth="2"
                          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input 
                          type="search" 
                          className="form-control py-2 ps-5" 
                          style={{ 
                            minWidth: 300, 
                            fontSize: 14,
                            border: "1px solid #e5e7eb",
                            borderRadius: "10px"
                          }} 
                          value={search} 
                          onChange={(e) => setSearch(e.target.value)} 
                          placeholder="Search by name, ID, email..." 
                        />
                      </div>
                    </div>

                    {/* Accounts Table/List */}
                    {loadingList ? (
                      <div className="text-center py-5">
                        <div className="spinner-border mb-3" role="status" style={{ width: 50, height: 50, color: "#374151" }}>
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted fs-6 mb-0">Loading administrator accounts...</p>
                      </div>
                    ) : filteredAdmins.length === 0 ? (
                      <div className="text-center py-5">
                        <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3" style={{ 
                          width: 64, 
                          height: 64, 
                          background: "#f3f4f6"
                        }}>
                          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                          </svg>
                        </div>
                        <h5 className="fw-semibold mb-2" style={{ color: "#6b7280" }}>No accounts found</h5>
                        <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                          {search ? "Try adjusting your search criteria" : "Create your first admin account to get started"}
                        </p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table align-middle mb-0">
                          <thead>
                            <tr style={{ borderBottom: "2px solid #f1f5f9", background: "#f9fafb" }}>
                              <th className="fw-bold py-3 px-3" style={{ fontSize: 13, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Account Details</th>
                              <th className="fw-bold py-3 px-3" style={{ fontSize: 13, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</th>
                              <th className="fw-bold py-3 px-3" style={{ fontSize: 13, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                              <th className="fw-bold py-3 px-3 text-center" style={{ fontSize: 13, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAdmins.map((admin) => (
                              <tr 
                                key={admin.id} 
                                className={admin.is_archived ? "opacity-50" : ""}
                                style={{ 
                                  borderBottom: "1px solid #f1f5f9",
                                  transition: "background 0.2s"
                                }}
                                onMouseEnter={(e) => !admin.is_archived && (e.currentTarget.style.background = "#fafafa")}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                              >
                                <td className="py-3 px-3">
                                  <div className="d-flex align-items-center gap-3">
                                    <div 
                                      className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" 
                                      style={{ 
                                        width: 40, 
                                        height: 40, 
                                        background: admin.role === "principal" 
                                          ? "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)" 
                                          : admin.role === "registrar"
                                          ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                                          : admin.role === "teacher_coordinator"
                                          ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                                          : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                        color: "#fff",
                                        fontWeight: "bold",
                                        fontSize: 14
                                      }}
                                    >
                                      {admin.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="fw-semibold mb-1" style={{ fontSize: 14, color: "#1f2937" }}>{admin.full_name}</div>
                                      <div className="text-muted d-flex align-items-center gap-2" style={{ fontSize: 12 }}>
                                        <span className="badge px-2 py-1" style={{ background: "#f3f4f6", color: "#6b7280", fontWeight: "normal" }}>
                                          {admin.admin_id}
                                        </span>
                                        <span>•</span>
                                        <span>{admin.email}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <span 
                                    className="badge text-capitalize fw-semibold px-3 py-2" 
                                    style={{ 
                                      fontSize: 12,
                                      background: admin.role === "principal" 
                                        ? "#f3f4f6" 
                                        : admin.role === "registrar"
                                        ? "#eff6ff"
                                        : admin.role === "teacher_coordinator"
                                        ? "#f5f3ff"
                                        : "#f0fdf4",
                                      color: admin.role === "principal" 
                                        ? "#374151" 
                                        : admin.role === "registrar"
                                        ? "#2563eb"
                                        : admin.role === "teacher_coordinator"
                                        ? "#7c3aed"
                                        : "#16a34a",
                                      borderRadius: "6px"
                                    }}
                                  >
                                    {admin.role === "teacher_coordinator" ? "Teacher Coordinator" : admin.role}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  {admin.is_archived ? (
                                    <span className="badge fw-semibold px-3 py-2 d-inline-flex align-items-center gap-2" style={{ 
                                      fontSize: 12, 
                                      background: "#f1f5f9", 
                                      color: "#64748b",
                                      borderRadius: "6px"
                                    }}>
                                      <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                                      </svg>
                                      Archived
                                    </span>
                                  ) : (
                                    <span className="badge fw-semibold px-3 py-2 d-inline-flex align-items-center gap-2" style={{ 
                                      fontSize: 12, 
                                      background: "#dcfce7", 
                                      color: "#16a34a",
                                      borderRadius: "6px"
                                    }}>
                                      <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                      </svg>
                                      Active
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="d-flex gap-2 justify-content-center">
                                    <button 
                                      type="button" 
                                      className="btn btn-sm px-3 py-2 d-inline-flex align-items-center gap-2" 
                                      onClick={() => startEdit(admin)} 
                                      style={{ 
                                        fontSize: 13, 
                                        background: "#eff6ff", 
                                        color: "#2563eb", 
                                        border: "none",
                                        borderRadius: "6px",
                                        fontWeight: 500
                                      }}
                                    >
                                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                      </svg>
                                      Edit
                                    </button>
                                    <button 
                                      type="button" 
                                      className="btn btn-sm px-3 py-2 d-inline-flex align-items-center gap-2" 
                                      onClick={() => handleArchive(admin)} 
                                      style={{ 
                                        fontSize: 13, 
                                        background: "#fffbeb", 
                                        color: "#d97706", 
                                        border: "none",
                                        borderRadius: "6px",
                                        fontWeight: 500
                                      }}
                                    >
                                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        {admin.is_archived ? (
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                        ) : (
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                                        )}
                                      </svg>
                                      {admin.is_archived ? "Restore" : "Archive"}
                                    </button>
                                    <button 
                                      type="button" 
                                      className="btn btn-sm px-3 py-2 d-inline-flex align-items-center gap-2" 
                                      onClick={() => handleDelete(admin)} 
                                      style={{ 
                                        fontSize: 13, 
                                        background: "#f3f4f6", 
                                        color: "#374151", 
                                        border: "none",
                                        borderRadius: "6px",
                                        fontWeight: 500
                                      }}
                                    >
                                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                      </svg>
                                      Delete
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
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className="d-lg-none">
        <div className="min-vh-100" style={{ background: "#f5f5f5" }}>
          <header style={{ background: "#374151", padding: "24px 0", position: "relative" }}>
            <button className="btn position-absolute top-0 start-0 m-3" onClick={() => setShowSidebar(true)} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }}>
              <Icon name="menu" size={20} />
            </button>
            <div className="container-fluid px-4" style={{ paddingTop: 40 }}>
              <h3 className="mb-0 fw-bold text-white" style={{ fontSize: "1.3rem" }}>Manage Accounts</h3>
              <p className="mb-0" style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>Create and edit administrators</p>
            </div>
          </header>

          <main className="container-fluid px-3 py-4">
            <div className="row g-3 mb-4">
              <div className="col-4">
                <div className="card border-0 shadow-sm rounded-3" style={{ overflow:"hidden" }}>
                  <div className="card-body p-2">
                    <p className="text-muted mb-1 fw-semibold" style={{ fontSize: 10 }}>Total</p>
                    <h3 className="mb-0 fw-bold" style={{ fontSize: 24, color: "#374151", lineHeight: 1 }}>{admins.length}</h3>
                  </div>
                  <div style={{ height:2, background:"#374151" }} />
                </div>
              </div>
              <div className="col-4">
                <div className="card border-0 shadow-sm rounded-3" style={{ overflow:"hidden" }}>
                  <div className="card-body p-2">
                    <p className="text-muted mb-1 fw-semibold" style={{ fontSize: 10 }}>Active</p>
                    <h3 className="mb-0 fw-bold" style={{ fontSize: 24, color: "#374151", lineHeight: 1 }}>{admins.filter(a => !a.is_archived).length}</h3>
                  </div>
                  <div style={{ height:2, background:"#374151" }} />
                </div>
              </div>
              <div className="col-4">
                <div className="card border-0 shadow-sm rounded-3" style={{ overflow:"hidden" }}>
                  <div className="card-body p-2">
                    <p className="text-muted mb-1 fw-semibold" style={{ fontSize: 10 }}>Archived</p>
                    <h3 className="mb-0 fw-bold" style={{ fontSize: 24, color: "#374151", lineHeight: 1 }}>{admins.filter(a => a.is_archived).length}</h3>
                  </div>
                  <div style={{ height:2, background:"#374151" }} />
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-3 mb-3">
              <div className="card-body p-3">
                <h4 className="fw-bold mb-3" style={{ color: "#374151", fontSize: "1rem" }}>{editingId ? "Edit Account" : "Create Account"}</h4>
                {error && <div className="alert alert-danger border-0 p-2 mb-2" style={{ background:"#f3f4f6", color:"#374151", fontSize: "0.8rem" }}>{error}</div>}
                {success && <div className="alert alert-success border-0 p-2 mb-2" style={{ background:"#f0fdf4", color:"#16a34a", fontSize: "0.8rem" }}>{success}</div>}
                <form onSubmit={handleSubmit} className="row g-2">
                  <div className="col-6">
                    <label className="form-label fw-semibold small mb-1">Admin ID</label>
                    <input type="text" className="form-control" value={form.admin_id} onChange={(e) => setForm({ ...form, admin_id: e.target.value })} disabled={!!editingId} placeholder="PRINCIPAL01" required style={{ fontSize: "0.85rem" }} />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold small mb-1">Role</label>
                    <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)} style={{ fontSize: "0.85rem" }}>
                      <option value="principal">Principal</option>
                      <option value="registrar">Registrar</option>
                      <option value="accounting">Accounting</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small mb-1">Full Name</label>
                    <input type="text" className="form-control" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Maria Santos" required style={{ fontSize: "0.85rem" }} />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small mb-1">Email</label>
                    <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="principal@school.edu" required style={{ fontSize: "0.85rem" }} />
                  </div>
                  {!editingId && (
                    <div className="col-12">
                      <label className="form-label fw-semibold small mb-1">Password</label>
                      <input type="password" className="form-control" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" minLength={8} required style={{ fontSize: "0.85rem" }} />
                    </div>
                  )}
                  <div className="col-12 d-flex gap-2">
                    <button type="submit" className="btn flex-grow-1 py-2 fw-semibold text-white" disabled={loading} style={{ fontSize: "0.85rem", background: "#374151", border: "none" }}>
                      {loading ? "Saving..." : editingId ? "Save" : "Create"}
                    </button>
                    {editingId && (
                      <button type="button" className="btn btn-outline-secondary py-2 px-3" onClick={resetForm} style={{ fontSize: "0.85rem" }}>Cancel</button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="fw-bold mb-0" style={{ color: "#374151", fontSize: "1rem" }}>Accounts</h4>
                  <input type="search" className="form-control w-auto" style={{ fontSize: "0.8rem" }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
                </div>
                {loadingList ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm" style={{ color:"#374151" }} />
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {filteredAdmins.map((admin) => (
                      <div key={admin.id} className="p-2 rounded" style={{ background:"#f8fafc", fontSize: "0.8rem" }}>
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <div className="flex-grow-1">
                            <div className="fw-bold">{admin.full_name}</div>
                            <div className="text-muted small">{admin.admin_id}</div>
                          </div>
                          <span className="badge px-2 py-1" style={{ 
                            background: "#f3f4f6",
                            color: admin.role === "principal" ? "#374151" : admin.role === "registrar" ? "#4b5563" : admin.role === "teacher_coordinator" ? "#8b5cf6" : "#6b7280",
                            fontSize:"0.65rem"
                          }}>{admin.role === "teacher_coordinator" ? "Teacher Coordinator" : admin.role}</span>
                        </div>
                        <div className="d-flex gap-1">
                          <button type="button" className="btn btn-sm flex-grow-1 py-1" onClick={() => startEdit(admin)} style={{ fontSize: "0.7rem", background:"#f3f4f6", color:"#374151", border:"none" }}>Edit</button>
                          <button type="button" className="btn btn-sm flex-grow-1 py-1" onClick={() => handleArchive(admin)} style={{ fontSize: "0.7rem", background:"#fffbeb", color:"#d97706", border:"none" }}>
                            {admin.is_archived ? "Restore" : "Archive"}
                          </button>
                          <button type="button" className="btn btn-sm py-1 px-2" onClick={() => handleDelete(admin)} style={{ fontSize: "0.7rem", background:"#f3f4f6", color:"#374151", border:"none" }}>Del</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
