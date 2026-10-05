import React from "react";
import ReportsAnalyticsDashboard from "../../../../components/dashboard/admin/ReportsAnalyticsDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports & Analytics | Admin Dashboard",
  description: "View platform statistics, revenue trends, and demographics.",
};

export default function AdminReportsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
          System Reports & Platform Analytics
        </h1>
        <p className="font-sans text-xs text-text-muted">
          Analyze sales performance, user growth trends, popular competition categories, and geographical entry distributions.
        </p>
      </div>

      <ReportsAnalyticsDashboard />
    </div>
  );
}
