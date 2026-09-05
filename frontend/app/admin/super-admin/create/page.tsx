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
      const res = await fetch("/api/admin/admins", { credentials: "include" });
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
      if (editingId) {
        const res = await fetch(`/api/admin/admins/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
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
        const res = await fetch("/api/admin/create-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`/api/admin/admins/${admin.id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: "DELETE",
        credentials: "include",
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
    <div className="min-vh-100" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)" }}>
      <div className="container-fluid px-0">
        <div className="row g-0 min-vh-100">
          <aside className="col-lg-3 border-end bg-slate-900 text-white p-4" style={{ background: "#0f172a" }}>
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: 44, height: 44, background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>S</div>
              <div>
                <div className="text-uppercase small text-primary-emphasis">System</div>
                <h5 className="mb-0">Super Admin</h5>
              </div>
            </div>

            <nav className="nav flex-column gap-2">
              <button className="btn btn-primary text-start">Admin Accounts</button>
              <button className="btn btn-outline-light text-start" onClick={() => router.push("/admin/dashboard")}>Back to dashboard</button>
              <button className="btn btn-outline-light text-start" onClick={() => {
                localStorage.removeItem("inform_token");
                localStorage.removeItem("inform_role");
                localStorage.removeItem("inform_user");
                localStorage.removeItem("inform_admin_token");
                router.push("/login");
              }}>Logout</button>
            </nav>
          </aside>

          <main className="col-lg-9 p-4 p-xl-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <div>
                <div className="text-uppercase small text-primary fw-bold" style={{ letterSpacing: "0.12em" }}>Management</div>
                <h1 className="h2 mb-0 text-dark">Administrative Accounts</h1>
              </div>
              <div className="text-muted">{admins.length} total accounts</div>
            </div>

            <div className="row g-4 align-items-start">
              <div className="col-xl-5">
                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h2 className="h5 mb-0">{editingId ? "Edit admin account" : "Create admin account"}</h2>
                      {editingId && (
                        <button className="btn btn-sm btn-outline-secondary" type="button" onClick={resetForm}>Cancel</button>
                      )}
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit} className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Admin ID</label>
                        <input
                          type="text"
                          className="form-control"
                          value={form.admin_id}
                          onChange={(e) => setForm({ ...form, admin_id: e.target.value })}
                          disabled={!!editingId}
                          placeholder="e.g. PRINCIPAL01"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Role</label>
                        <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                          <option value="principal">Principal</option>
                          <option value="registrar">Registrar</option>
                          <option value="accounting">Accounting</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={form.full_name}
                          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                          placeholder="e.g. Maria Santos"
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="principal@school.edu"
                          required
                        />
                      </div>

                      {!editingId && (
                        <div className="col-12">
                          <label className="form-label">Temporary Password</label>
                          <input
                            type="password"
                            className="form-control"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="Minimum 8 characters"
                            minLength={8}
                            required
                          />
                        </div>
                      )}

                      <div className="col-12 pt-2">
                        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                          {loading ? (editingId ? "Saving changes..." : "Creating account...") : editingId ? "Save changes" : `Create ${role} account`}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-xl-7">
                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                      <h2 className="h5 mb-0">Created accounts</h2>
                      <input
                        type="search"
                        className="form-control w-auto"
                        style={{ minWidth: 220 }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search accounts"
                      />
                    </div>

                    {loadingList ? (
                      <div className="text-muted">Loading accounts...</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table align-middle">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Role</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAdmins.length ? filteredAdmins.map((admin) => (
                              <tr key={admin.id} className={admin.is_archived ? "table-secondary" : ""}>
                                <td>
                                  <div className="fw-semibold">{admin.admin_id}</div>
                                  <div className="small text-muted">{admin.email}</div>
                                </td>
                                <td>{admin.full_name}</td>
                                <td><span className="badge bg-primary-subtle text-primary-emphasis text-capitalize">{admin.role}</span></td>
                                <td>
                                  <span className={`badge ${admin.is_archived ? "bg-secondary" : "bg-success"}`}>
                                    {admin.is_archived ? "Archived" : "Active"}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex gap-2 flex-wrap">
                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => startEdit(admin)}>Edit</button>
                                    <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => handleArchive(admin)}>
                                      {admin.is_archived ? "Restore" : "Archive"}
                                    </button>
                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(admin)}>Delete</button>
                                  </div>
                                </td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={5} className="text-center text-muted py-4">No accounts match your search.</td>
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
