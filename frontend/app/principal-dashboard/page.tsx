"use client";

import dynamic from "next/dynamic";

const AdminDashboardPage = dynamic(
  () => import("../components/AdminDashboardShell").then(mod => ({ default: mod.AdminDashboardPage })),
  { ssr: false, loading: () => <div style={{ padding: "2rem", textAlign: "center" }}>Loading dashboard...</div> }
);

export default function PrincipalDashboardPage() {
  return <AdminDashboardPage 
    hideBanner={false}
    hideTopbarControls={false}
    role="principal"
  />;
}
