"use client";

import { useState } from "react";
import AdminDashboardPage from "../../dashboard/page";

export default function PrincipalDashboardPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className="min-vh-100">
      {/* Welcome banner — shifts with sidebar */}
      <div
        style={{
          marginLeft: sidebarExpanded ? 256 : 80,
          background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #2563eb 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "1.5rem 1.5rem",
          transition: "margin-left 0.3s ease",
        }}
      >
        <div className="small text-uppercase fw-semibold mb-1" style={{ letterSpacing: "0.12em", color: "rgba(255,255,255,0.6)" }}>
          Principal Portal
        </div>
        <h1 className="fw-black mb-0" style={{ color: "#ffffff", fontSize: "1.5rem", lineHeight: 1.2 }}>
          Welcome back, Principal
        </h1>
      </div>

      {/* Admin dashboard — banner hidden, sidebar expand tracked */}
      <AdminDashboardPage hideBanner onSidebarExpandChange={setSidebarExpanded} />
    </div>
  );
}
