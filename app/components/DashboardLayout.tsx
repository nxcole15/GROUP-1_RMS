"use client";

import { type ReactNode } from "react";

type DashboardLayoutProps = {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
  sidebarExpanded: boolean;
};

export function DashboardLayout({ sidebar, topbar, children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      {sidebar}
      <div
        className="dashboard-main"
        style={{ marginLeft: 256 }}
      >
        {topbar}
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
