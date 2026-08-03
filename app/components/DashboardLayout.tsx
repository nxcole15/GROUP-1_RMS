"use client";

import type { ReactNode } from "react";

type DashboardLayoutProps = {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
  sidebarExpanded: boolean;
};

export function DashboardLayout({ sidebar, topbar, children, sidebarExpanded }: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      {sidebar}
      <div className="dashboard-main" style={{ marginLeft: sidebarExpanded ? 256 : 80 }}>
        {topbar}
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
