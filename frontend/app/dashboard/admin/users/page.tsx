import React from "react";
import UsersStatsCards from "../../../../components/dashboard/admin/UsersStatsCards";
import UsersTable from "../../../../components/dashboard/admin/UsersTable";

export default function AdminUsersManagementPage() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
          User Account Management
        </h1>
        <p className="font-sans text-xs text-text-muted">
          View registered player accounts, audit ticket purchase activity, and manage account security status.
        </p>
      </div>

      <UsersStatsCards />
      <UsersTable />
    </div>
  );
}
