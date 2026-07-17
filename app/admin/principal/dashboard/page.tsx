"use client";

import { useRouter } from "next/navigation";
import AdminDashboardPage from "../../dashboard/page";

export default function PrincipalDashboardPage() {
  const router = useRouter();

  // Principal should reuse the full Admin dashboard UI.
  // We only add a small banner override on top via a wrapper.
  return (
    <div className="min-vh-100">
      <div
        className="w-100"
        style={{
          background: "linear-gradient(135deg, rgba(220,38,38,0.12), rgba(245,158,11,0.10), rgba(251,191,36,0.08))",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="container py-3">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <div className="small text-uppercase fw-semibold" style={{ letterSpacing: "0.08em", color: "#dc2626" }}>
                Principal Portal
              </div>
              <h2 className="fw-black" style={{ color: "#111827", marginBottom: 0 }}>
                Welcome back, Principal
              </h2>
            </div>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => router.push("/admin/login")}>
              Switch Account
            </button>
          </div>
        </div>
      </div>

      {/* Reuse existing admin dashboard */}
      <div>
        {/* Importing AdminDashboardPage directly keeps behavior identical.
            Route change is the only difference. */}
        <AdminDashboardPage />
      </div>
    </div>
  );
}

// NOTE: import inside same file would create circular imports in some bundlers,
// so we re-export via dynamic module loading is not used here.
// We reuse the existing component from the admin route by importing below.


