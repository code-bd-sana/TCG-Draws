import React from "react";
import AdminCompetitionsTable from "../../../../components/dashboard/admin/AdminCompetitionsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Competitions | Admin Dashboard",
  description: "Manage all competitions across the platform.",
};

export default function AdminCompetitionsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
          Platform Competition Audit & Draws
        </h1>
        <p className="font-sans text-xs text-text-muted">
          Review live raffles, audit ticket sales progress, trigger draw winner selections, and manage competition status.
        </p>
      </div>

      <AdminCompetitionsTable />
    </div>
  );
}
