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
      <div className={`position-fixed top-0 start-0 h-100 d-flex flex-column flex-shrink-0 ${showSidebar ? "" : "d-none d-lg-flex"}`} style={{ width: 256, zIndex: 1045, background: "linear-gradient(180deg,#1e3a8a 0%,#1e40af 100%)", overflowY: "auto" }}>
        <div className="p-4 d-flex flex-column align-items-center border-bottom border-white border-opacity-10">
          <Image src="/cfei-logo.jpg" alt="CFEI" className="rounded-circle mb-3" width={80} height={80} />
          <div className="text-center">
            <div className="text-white fw-bold" style={{ fontSize: "1.1rem" }}>Super Admin</div>
            <div className="text-white-50 small">System Control Panel</div>
          </div>
        </div>

        <nav className="flex-grow-1 px-3 py-3 d-flex flex-column gap-2">
          <button onClick={() => router.push("/admin/super-admin/dashboard")} className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0" style={{ color: "rgba(255,255,255,0.7)", background: "transparent" }}>
            <Icon name="activity" size={20} />
            <span>Overview</span>
          </button>
          <button className="btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 small fw-medium border-0" style={{ color: "#fff", background: "#3b82f6" }}>
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
    <div className="min-vh-100" style={{ background: "#f5f5f5" }}>
      <header style={{ background: "linear-gradient(135deg,#3b82f6 0%,#60a5fa 100%)", padding: "24px 0" }}>
        <div className="container-fluid px-4">
          <div>
            <h3 className="mb-0 fw-bold text-white">Manage Admin Accounts</h3>
            <p className="mb-0 text-white-50" style={{ fontSize: 15 }}>Create, edit, and manage administrators</p>
          </div>
        </div>
      </header>

      <main className="container-fluid px-4 py-4">
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 className="fw-bold mb-1" style={{ color: "#3b82f6" }}>{editingId ? "Edit Admin Account" : "Create Admin Account"}</h4>
                    <p className="text-muted mb-0" style={{ fontSize: 15 }}>Enter account details below</p>
                  </div>
                  {editingId && (
                    <button className="btn btn-outline-secondary px-3" type="button" onClick={resetForm}>Cancel</button>
                  )}
                </div>

                {error && <div className="alert alert-danger border-0" style={{ background:"#fef2f2", color:"#dc2626" }}>{error}</div>}
                {success && <div className="alert alert-success border-0" style={{ background:"#f0fdf4", color:"#16a34a" }}>{success}</div>}

                <form onSubmit={handleSubmit} className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: 15 }}>Admin ID</label>
                    <input type="text" className="form-control form-control-lg" value={form.admin_id} onChange={(e) => setForm({ ...form, admin_id: e.target.value })} disabled={!!editingId} placeholder="e.g. PRINCIPAL01" required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: 15 }}>Role</label>
                    <select className="form-select form-select-lg" value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="principal">Principal</option>
                      <option value="registrar">Registrar</option>
                      <option value="accounting">Accounting</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: 15 }}>Full Name</label>
                    <input type="text" className="form-control form-control-lg" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="e.g. Maria Santos" required />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: 15 }}>Email</label>
                    <input type="email" className="form-control form-control-lg" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="principal@school.edu" required />
                  </div>

                  {!editingId && (
                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: 15 }}>Temporary Password</label>
                      <input type="password" className="form-control form-control-lg" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 8 characters" minLength={8} required />
                    </div>
                  )}

                  <div className="col-12 pt-2">
                    <button type="submit" className="btn w-100 py-3 fw-semibold text-white" disabled={loading} style={{ fontSize: 16, background: "linear-gradient(135deg,#3b82f6,#60a5fa)", border: "none" }}>
                      {loading ? (editingId ? "Saving changes..." : "Creating account...") : editingId ? "Save Changes" : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                  <div>
                    <h4 className="fw-bold mb-1" style={{ color: "#3b82f6" }}>Admin Accounts</h4>
                    <p className="text-muted mb-0" style={{ fontSize: 15 }}>View and manage all admin accounts</p>
                  </div>
                  <input type="search" className="form-control form-control-lg" style={{ minWidth: 300, maxWidth: 400 }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search accounts..." />
                </div>

                {loadingList ? (
                  <div className="text-center py-5">
                    <div className="spinner-border mb-3" role="status" style={{ width: 50, height: 50, color: "#3b82f6" }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted fs-5">Loading accounts...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: 15 }}>
                      <thead>
                        <tr style={{ borderBottom:"2px solid #f1f5f9" }}>
                          <th className="fw-bold py-3 text-dark" style={{ fontSize: 15 }}>ID / Email</th>
                          <th className="fw-bold py-3 text-dark" style={{ fontSize: 15 }}>Name</th>
                          <th className="fw-bold py-3 text-dark" style={{ fontSize: 15 }}>Role</th>
                          <th className="fw-bold py-3 text-dark" style={{ fontSize: 15 }}>Status</th>
                          <th className="fw-bold py-3 text-dark" style={{ fontSize: 15 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAdmins.length ? filteredAdmins.map((admin) => (
                          <tr key={admin.id} className={admin.is_archived ? "opacity-50" : ""} style={{ borderBottom:"1px solid #f8fafc" }}>
                            <td className="py-3">
                              <div className="fw-semibold text-dark">{admin.admin_id}</div>
                              <div className="text-muted" style={{ fontSize: 13 }}>{admin.email}</div>
                            </td>
                            <td className="fw-medium py-3">{admin.full_name}</td>
                            <td className="py-3">
                              <span className="badge text-capitalize fw-semibold px-3 py-2" style={{ 
                                fontSize: 14,
                                background: admin.role === "principal" ? "#eff6ff" : admin.role === "registrar" ? "#f5f3ff" : "#ecfeff",
                                color: admin.role === "principal" ? "#3b82f6" : admin.role === "registrar" ? "#8b5cf6" : "#06b6d4"
                              }}>{admin.role}</span>
                            </td>
                            <td className="py-3">
                              {admin.is_archived ? (
                                <span className="badge fw-semibold px-3 py-2" style={{ fontSize: 14, background:"#f1f5f9", color:"#64748b" }}>Archived</span>
                              ) : (
                                <span className="badge fw-semibold px-3 py-2" style={{ fontSize: 14, background:"#dcfce7", color:"#16a34a" }}>Active</span>
                              )}
                            </td>
                            <td className="py-3">
                              <div className="d-flex gap-2 flex-wrap align-items-center">
                                <button type="button" className="btn btn-sm fw-semibold px-3" onClick={() => startEdit(admin)} style={{ fontSize: 14, background:"#eff6ff", color:"#2563eb", border:"1px solid #dbeafe" }}>Edit</button>
                                <button type="button" className="btn btn-sm fw-semibold px-3" onClick={() => handleArchive(admin)} style={{ fontSize: 14, background:"#fffbeb", color:"#d97706", border:"1px solid #fef3c7" }}>
                                  {admin.is_archived ? "Restore" : "Archive"}
                                </button>
                                <button type="button" className="btn btn-sm fw-semibold px-3" onClick={() => handleDelete(admin)} style={{ fontSize: 14, background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca" }}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="text-center py-5">
                              <p className="text-muted mb-0 fs-5">No accounts match your search</p>
                            </td>
                          </tr>
                        )}
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
          <header style={{ background: "linear-gradient(135deg,#3b82f6 0%,#60a5fa 100%)", padding: "24px 0", position: "relative" }}>
            <button className="btn position-absolute top-0 start-0 m-3" onClick={() => setShowSidebar(true)} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }}>
              <Icon name="menu" size={20} />
            </button>
            <div className="container-fluid px-4" style={{ paddingTop: 40 }}>
              <h3 className="mb-0 fw-bold text-white" style={{ fontSize: "1.3rem" }}>Manage Accounts</h3>
              <p className="mb-0 text-white-50" style={{ fontSize: 14 }}>Create and edit administrators</p>
            </div>
          </header>

          <main className="container-fluid px-3 py-4">
            <div className="row g-3 mb-4">
              <div className="col-4">
                <div className="card border-0 shadow-sm rounded-3" style={{ overflow:"hidden" }}>
                  <div className="card-body p-2">
                    <p className="text-muted mb-1 fw-semibold" style={{ fontSize: 10 }}>Total</p>
                    <h3 className="mb-0 fw-bold" style={{ fontSize: 24, color: "#3b82f6", lineHeight: 1 }}>{admins.length}</h3>
                  </div>
                  <div style={{ height:2, background:"linear-gradient(135deg,#3b82f6,#60a5fa)" }} />
                </div>
              </div>
              <div className="col-4">
                <div className="card border-0 shadow-sm rounded-3" style={{ overflow:"hidden" }}>
                  <div className="card-body p-2">
                    <p className="text-muted mb-1 fw-semibold" style={{ fontSize: 10 }}>Active</p>
                    <h3 className="mb-0 fw-bold" style={{ fontSize: 24, color: "#8b5cf6", lineHeight: 1 }}>{admins.filter(a => !a.is_archived).length}</h3>
                  </div>
                  <div style={{ height:2, background:"linear-gradient(135deg,#8b5cf6,#a78bfa)" }} />
                </div>
              </div>
              <div className="col-4">
                <div className="card border-0 shadow-sm rounded-3" style={{ overflow:"hidden" }}>
                  <div className="card-body p-2">
                    <p className="text-muted mb-1 fw-semibold" style={{ fontSize: 10 }}>Archived</p>
                    <h3 className="mb-0 fw-bold" style={{ fontSize: 24, color: "#06b6d4", lineHeight: 1 }}>{admins.filter(a => a.is_archived).length}</h3>
                  </div>
                  <div style={{ height:2, background:"linear-gradient(135deg,#06b6d4,#22d3ee)" }} />
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-3 mb-3">
              <div className="card-body p-3">
                <h4 className="fw-bold mb-3" style={{ color: "#3b82f6", fontSize: "1rem" }}>{editingId ? "Edit Account" : "Create Account"}</h4>
                {error && <div className="alert alert-danger border-0 p-2 mb-2" style={{ background:"#fef2f2", color:"#dc2626", fontSize: "0.8rem" }}>{error}</div>}
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
                    <button type="submit" className="btn flex-grow-1 py-2 fw-semibold text-white" disabled={loading} style={{ fontSize: "0.85rem", background: "linear-gradient(135deg,#3b82f6,#60a5fa)", border: "none" }}>
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
                  <h4 className="fw-bold mb-0" style={{ color: "#3b82f6", fontSize: "1rem" }}>Accounts</h4>
                  <input type="search" className="form-control w-auto" style={{ fontSize: "0.8rem" }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
                </div>
                {loadingList ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm" style={{ color:"#3b82f6" }} />
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
                            background: admin.role === "principal" ? "#eff6ff" : admin.role === "registrar" ? "#f5f3ff" : "#ecfeff",
                            color: admin.role === "principal" ? "#3b82f6" : admin.role === "registrar" ? "#8b5cf6" : "#06b6d4",
                            fontSize:"0.65rem"
                          }}>{admin.role}</span>
                        </div>
                        <div className="d-flex gap-1">
                          <button type="button" className="btn btn-sm flex-grow-1 py-1" onClick={() => startEdit(admin)} style={{ fontSize: "0.7rem", background:"#eff6ff", color:"#3b82f6", border:"none" }}>Edit</button>
                          <button type="button" className="btn btn-sm flex-grow-1 py-1" onClick={() => handleArchive(admin)} style={{ fontSize: "0.7rem", background:"#f5f3ff", color:"#8b5cf6", border:"none" }}>
                            {admin.is_archived ? "Restore" : "Archive"}
                          </button>
                          <button type="button" className="btn btn-sm py-1 px-2" onClick={() => handleDelete(admin)} style={{ fontSize: "0.7rem", background:"#fef2f2", color:"#dc2626", border:"none" }}>Del</button>
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
