"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminDashboardPage } from "../../../components/AdminDashboardShell";

export default function PrincipalDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("inform_role");
    if (role !== "principal") {
      router.replace("/login");
    }
  }, [router]);

  return <AdminDashboardPage role="principal" />;
}
