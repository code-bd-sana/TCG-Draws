import React from "react";
import LogsActivityTable from "../../../../components/dashboard/admin/LogsActivityTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logs & Activity | Admin Dashboard",
  description: "Monitor system events, admin actions, and user activities.",
};

export default function AdminLogsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
          System Audit & Activity Logs
        </h1>
        <p className="font-sans text-xs text-text-muted">
          Comprehensive real-time audit trail of platform events, administrative actions, security flags, and user activity.
        </p>
      </div>
      
      <LogsActivityTable />
    </div>
  );
}
