"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="min-vh-100 position-relative overflow-hidden" style={{ 
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
    }}>
      {/* Animated background effects */}
      <div className="position-absolute w-100 h-100" style={{ opacity: 0.1, pointerEvents: "none" }}>
        <div className="position-absolute rounded-circle" style={{ 
          width: 400, height: 400, top: -100, right: -100,
          background: "radial-gradient(circle, #ffd700 0%, transparent 70%)",
          animation: "pulse 4s ease-in-out infinite"
        }} />
        <div className="position-absolute rounded-circle" style={{ 
          width: 300, height: 300, bottom: -50, left: -50,
          background: "radial-gradient(circle, #ff6b6b 0%, transparent 70%)",
          animation: "pulse 6s ease-in-out infinite"
        }} />
        <div className="position-absolute rounded-circle" style={{ 
          width: 250, height: 250, top: "40%", right: "20%",
          background: "radial-gradient(circle, #4ecdc4 0%, transparent 70%)",
          animation: "pulse 5s ease-in-out infinite"
        }} />
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.15; }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .shimmer-effect {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
      `}</style>

      <div className="container-fluid px-0 position-relative">
        <div className="row g-0 min-vh-100">
          <aside className="col-lg-3 border-end p-4 position-relative" style={{ 
            background: "linear-gradient(180deg, rgba(255,215,0,0.15) 0%, rgba(138,43,226,0.15) 100%)",
            borderRight: "2px solid rgba(255,215,0,0.3) !important",
            backdropFilter: "blur(10px)"
          }}>
            <div className="d-flex align-items-center gap-3 mb-5 p-3 rounded-4" style={{
              background: "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,105,180,0.2))",
              border: "2px solid rgba(255,215,0,0.4)",
              boxShadow: "0 8px 32px rgba(255,215,0,0.2)"
            }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold position-relative" style={{ 
                width: 60, height: 60, 
                background: "linear-gradient(135deg, #ffd700, #ff6b6b, #4ecdc4)",
                fontSize: "1.5rem",
                boxShadow: "0 0 30px rgba(255,215,0,0.6), inset 0 0 20px rgba(255,255,255,0.3)",
                border: "3px solid rgba(255,255,255,0.5)"
              }}>
                <span style={{ textShadow: "0 0 10px rgba(0,0,0,0.5)" }}>S</span>
              </div>
              <div>
                <div className="text-uppercase small fw-bold" style={{ 
                  color: "#ffd700",
                  letterSpacing: "0.15em",
                  textShadow: "0 0 10px rgba(255,215,0,0.5)"
                }}>SYSTEM</div>
                <h5 className="mb-0 text-white fw-bold" style={{
                  fontSize: "1.3rem",
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)"
                }}>Super Admin</h5>
              </div>
            </div>

            <nav className="nav flex-column gap-3">
              <button className="btn text-start py-3 px-4 fw-bold position-relative overflow-hidden" style={{
                background: "linear-gradient(135deg, #ffd700, #ffed4e)",
                color: "#1a1a2e",
                border: "2px solid rgba(255,255,255,0.5)",
                borderRadius: "15px",
                boxShadow: "0 8px 20px rgba(255,215,0,0.4), inset 0 2px 10px rgba(255,255,255,0.3)",
                fontSize: "1.05rem"
              }}>
                <span style={{ position: "relative", zIndex: 1 }}>Admin Accounts</span>
              </button>
              
              <button className="btn text-start py-3 px-4 fw-semibold" style={{
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "2px solid rgba(255,255,255,0.3)",
                borderRadius: "15px",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                e.currentTarget.style.borderColor = "rgba(255,215,0,0.5)";
                e.currentTarget.style.transform = "translateX(5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
              onClick={() => {
                localStorage.removeItem("inform_token");
                localStorage.removeItem("inform_role");
                localStorage.removeItem("inform_user");
                localStorage.removeItem("inform_admin_token");
                router.push("/login");
              }}>Logout</button>
            </nav>
          </aside>

          <main className="col-lg-9 p-4 p-xl-5 position-relative">
            <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
              <div>
                <div className="text-uppercase small fw-bold mb-2" style={{ 
                  color: "#ffd700",
                  letterSpacing: "0.2em",
                  textShadow: "0 0 10px rgba(255,215,0,0.5)"
                }}>MANAGEMENT CONSOLE</div>
                <h1 className="mb-0 fw-bold" style={{
                  fontSize: "2.5rem",
                  background: "linear-gradient(135deg, #ffd700, #ffffff, #4ecdc4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 2px 20px rgba(255,215,0,0.3)"
                }}>Administrative Accounts</h1>
              </div>
              <div className="px-4 py-2 rounded-pill fw-bold" style={{
                background: "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,105,180,0.2))",
                border: "2px solid rgba(255,215,0,0.5)",
                color: "#ffd700",
                fontSize: "1.1rem",
                boxShadow: "0 4px 15px rgba(255,215,0,0.3)"
              }}>
                {admins.length} total accounts
              </div>
            </div>

            <div className="row g-4 align-items-start">
              <div className="col-xl-5">
                <div className="card border-0 rounded-4 position-relative overflow-hidden" style={{
                  background: "rgba(255,255,255,0.95)",
                  boxShadow: "0 20px 60px rgba(255,215,0,0.3), 0 0 0 1px rgba(255,215,0,0.2)",
                  backdropFilter: "blur(20px)"
                }}>
                  <div className="position-absolute top-0 start-0 w-100 h-100 shimmer-effect" style={{ pointerEvents: "none" }} />
                  <div className="card-body p-4 position-relative">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h2 className="h4 mb-0 fw-bold" style={{
                        background: "linear-gradient(135deg, #ffd700, #ff6b6b)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                      }}>
                        {editingId ? "Edit admin account" : "Create admin account"}
                      </h2>
                      {editingId && (
                        <button className="btn btn-sm px-3 py-2 fw-semibold" type="button" onClick={resetForm} style={{
                          background: "rgba(255,215,0,0.2)",
                          border: "2px solid rgba(255,215,0,0.5)",
                          borderRadius: "10px",
                          color: "#1a1a2e"
                        }}>Cancel</button>
                      )}
                    </div>

                    {error && <div className="alert alert-danger border-0 rounded-3" style={{
                      background: "rgba(255,107,107,0.15)",
                      border: "2px solid rgba(255,107,107,0.5) !important",
                      color: "#dc3545"
                    }}>{error}</div>}
                    {success && <div className="alert alert-success border-0 rounded-3" style={{
                      background: "rgba(78,205,196,0.15)",
                      border: "2px solid rgba(78,205,196,0.5) !important",
                      color: "#198754"
                    }}>{success}</div>}

                    <form onSubmit={handleSubmit} className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">Admin ID</label>
                        <input
                          type="text"
                          className="form-control py-3 px-3 border-2"
                          style={{
                            borderRadius: "12px",
                            borderColor: "rgba(255,215,0,0.3)",
                            background: "rgba(255,255,255,0.8)"
                          }}
                          value={form.admin_id}
                          onChange={(e) => setForm({ ...form, admin_id: e.target.value })}
                          disabled={!!editingId}
                          placeholder="e.g. PRINCIPAL01"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">Role</label>
                        <select className="form-select py-3 px-3 border-2" style={{
                          borderRadius: "12px",
                          borderColor: "rgba(255,215,0,0.3)",
                          background: "rgba(255,255,255,0.8)"
                        }} value={role} onChange={(e) => setRole(e.target.value)}>
                          <option value="principal">Principal</option>
                          <option value="registrar">Registrar</option>
                          <option value="accounting">Accounting</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold text-dark">Full Name</label>
                        <input
                          type="text"
                          className="form-control py-3 px-3 border-2"
                          style={{
                            borderRadius: "12px",
                            borderColor: "rgba(255,215,0,0.3)",
                            background: "rgba(255,255,255,0.8)"
                          }}
                          value={form.full_name}
                          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                          placeholder="e.g. Maria Santos"
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold text-dark">Email</label>
                        <input
                          type="email"
                          className="form-control py-3 px-3 border-2"
                          style={{
                            borderRadius: "12px",
                            borderColor: "rgba(255,215,0,0.3)",
                            background: "rgba(255,255,255,0.8)"
                          }}
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="principal@school.edu"
                          required
                        />
                      </div>

                      {!editingId && (
                        <div className="col-12">
                          <label className="form-label fw-semibold text-dark">Temporary Password</label>
                          <input
                            type="password"
                            className="form-control py-3 px-3 border-2"
                            style={{
                              borderRadius: "12px",
                              borderColor: "rgba(255,215,0,0.3)",
                              background: "rgba(255,255,255,0.8)"
                            }}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="Minimum 8 characters"
                            minLength={8}
                            required
                          />
                        </div>
                      )}

                      <div className="col-12 pt-2">
                        <button type="submit" className="btn w-100 py-3 fw-bold text-dark position-relative overflow-hidden" disabled={loading} style={{
                          background: "linear-gradient(135deg, #ffd700, #ffed4e)",
                          border: "2px solid rgba(255,255,255,0.5)",
                          borderRadius: "12px",
                          boxShadow: "0 8px 25px rgba(255,215,0,0.4)",
                          fontSize: "1.05rem",
                          transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 12px 35px rgba(255,215,0,0.5)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 8px 25px rgba(255,215,0,0.4)";
                        }}>
                          {loading ? (editingId ? "Saving changes..." : "Creating account...") : editingId ? "Save changes" : `Create ${role} account`}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-xl-7">
                <div className="card border-0 rounded-4 position-relative overflow-hidden" style={{
                  background: "rgba(255,255,255,0.95)",
                  boxShadow: "0 20px 60px rgba(255,215,0,0.3), 0 0 0 1px rgba(255,215,0,0.2)",
                  backdropFilter: "blur(20px)"
                }}>
                  <div className="position-absolute top-0 start-0 w-100 h-100 shimmer-effect" style={{ pointerEvents: "none" }} />
                  <div className="card-body p-4 position-relative">
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                      <h2 className="h4 mb-0 fw-bold" style={{
                        background: "linear-gradient(135deg, #ffd700, #4ecdc4)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                      }}>Created accounts</h2>
                      <input
                        type="search"
                        className="form-control w-auto py-2 px-3 border-2"
                        style={{ 
                          minWidth: 220,
                          borderRadius: "12px",
                          borderColor: "rgba(255,215,0,0.3)",
                          background: "rgba(255,255,255,0.8)"
                        }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search accounts"
                      />
                    </div>

                    {loadingList ? (
                      <div className="text-center py-5">
                        <div className="spinner-border" style={{ color: "#ffd700" }} role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <div className="mt-3 fw-semibold" style={{ color: "#ffd700" }}>Loading accounts...</div>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table align-middle">
                          <thead>
                            <tr style={{ borderBottom: "2px solid rgba(255,215,0,0.3)" }}>
                              <th className="fw-bold text-dark">ID</th>
                              <th className="fw-bold text-dark">Name</th>
                              <th className="fw-bold text-dark">Role</th>
                              <th className="fw-bold text-dark">Status</th>
                              <th className="fw-bold text-dark">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAdmins.length ? filteredAdmins.map((admin) => (
                              <tr key={admin.id} className={admin.is_archived ? "opacity-50" : ""} style={{
                                borderBottom: "1px solid rgba(0,0,0,0.05)"
                              }}>
                                <td>
                                  <div className="fw-semibold text-dark">{admin.admin_id}</div>
                                  <div className="small text-muted">{admin.email}</div>
                                </td>
                                <td className="fw-medium">{admin.full_name}</td>
                                <td>
                                  <span className="badge px-3 py-2 text-capitalize fw-semibold" style={{
                                    background: "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(78,205,196,0.2))",
                                    color: "#1a1a2e",
                                    border: "1px solid rgba(255,215,0,0.4)",
                                    borderRadius: "8px"
                                  }}>{admin.role}</span>
                                </td>
                                <td>
                                  <span className={`badge px-3 py-2 fw-semibold`} style={{
                                    background: admin.is_archived ? "rgba(108,117,125,0.2)" : "rgba(78,205,196,0.2)",
                                    color: admin.is_archived ? "#6c757d" : "#198754",
                                    border: admin.is_archived ? "1px solid rgba(108,117,125,0.4)" : "1px solid rgba(78,205,196,0.4)",
                                    borderRadius: "8px"
                                  }}>
                                    {admin.is_archived ? "Archived" : "Active"}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex gap-2 flex-wrap">
                                    <button type="button" className="btn btn-sm px-3 py-1 fw-semibold" onClick={() => startEdit(admin)} style={{
                                      background: "rgba(78,205,196,0.2)",
                                      border: "1px solid rgba(78,205,196,0.5)",
                                      borderRadius: "8px",
                                      color: "#0c7c72"
                                    }}>Edit</button>
                                    <button type="button" className="btn btn-sm px-3 py-1 fw-semibold" onClick={() => handleArchive(admin)} style={{
                                      background: "rgba(255,193,7,0.2)",
                                      border: "1px solid rgba(255,193,7,0.5)",
                                      borderRadius: "8px",
                                      color: "#997404"
                                    }}>
                                      {admin.is_archived ? "Restore" : "Archive"}
                                    </button>
                                    <button type="button" className="btn btn-sm px-3 py-1 fw-semibold" onClick={() => handleDelete(admin)} style={{
                                      background: "rgba(255,107,107,0.2)",
                                      border: "1px solid rgba(255,107,107,0.5)",
                                      borderRadius: "8px",
                                      color: "#c82333"
                                    }}>Delete</button>
                                  </div>
                                </td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={5} className="text-center py-5">
                                  <div className="text-muted fw-semibold">No accounts match your search.</div>
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
    </div>
  );
}
