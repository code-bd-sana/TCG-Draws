import React from "react";
import AdminDrawsManager from "../../../../components/dashboard/admin/draws/AdminDrawsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Draws | Admin Dashboard",
  description: "Manage upcoming, live, and completed competition draws.",
};

export default function AdminDrawsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
          Live Competition Draws & Provably Fair Audit
        </h1>
        <p className="font-sans text-xs text-text-muted">
          Manage automated draw schedules, trigger manual winner selection pools, and verify provably fair random seeds.
        </p>
      </div>

      <AdminDrawsManager />
    </div>
  );
}
