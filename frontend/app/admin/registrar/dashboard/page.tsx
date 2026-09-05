"use client";

import { useEffect } from "react";

export default function RegistrarDashboardPage() {
  useEffect(() => {
    window.location.replace("/registrar-dashboard");
  }, []);

  return null;
}
