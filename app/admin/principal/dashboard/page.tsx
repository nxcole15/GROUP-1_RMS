"use client";

import { useEffect } from "react";

export default function PrincipalDashboardPage() {
  useEffect(() => {
    window.location.replace("/principal-dashboard");
  }, []);

  return null;
}
