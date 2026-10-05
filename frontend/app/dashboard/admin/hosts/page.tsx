import React from "react";
import HostsStatsCards from "../../../../components/dashboard/admin/HostsStatsCards";
import HostsTable from "../../../../components/dashboard/admin/HostsTable";

export default function AdminHostsManagementPage() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
          Host Operator Management
        </h1>
        <p className="font-sans text-xs text-text-muted">
          Review host merchant registrations, verify operator credentials, and monitor platform competition performance.
        </p>
      </div>

      <HostsStatsCards />
      <HostsTable />
    </div>
  );
}
