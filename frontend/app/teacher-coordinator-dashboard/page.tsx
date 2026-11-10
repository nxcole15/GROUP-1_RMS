"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const AdminDashboardPage = dynamic(
  () => import("../components/AdminDashboardShell").then(mod => ({ default: mod.AdminDashboardPage })),
  { ssr: false, loading: () => <div style={{ padding: "2rem", textAlign: "center" }}>Loading dashboard...</div> }
);

export default function TeacherCoordinatorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("inform_admin_token");
    const role = localStorage.getItem("inform_role");
    
    if (!token || role !== "teacher_coordinator") {
      router.push("/login");
      return;
    }
    
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboardPage 
      role="teacher_coordinator"
      hideBanner={false}
      hideTopbarControls={false}
    />
  );
}
