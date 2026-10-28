import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import UsersStatsCards from "../../../../components/dashboard/admin/UsersStatsCards";
import UsersTable from "../../../../components/dashboard/admin/UsersTable";

export const metadata: Metadata = {
  title: "User Management | Admin Dashboard | TCG Draws",
  description: "Monitor registered player accounts, audit ticket purchase activity, and manage security access.",
};

export default function AdminUsersManagementPage() {
  return (
    <div className="relative flex flex-col gap-8 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      {/* Background ambient lighting for luxury feel */}
      <div 
        className="pointer-events-none absolute -top-24 right-1/4 w-[500px] h-[300px] bg-[radial-gradient(ellipse_at_center,_var(--color-accent-bg)_0%,_transparent_70%)] blur-3xl opacity-60" 
        aria-hidden="true" 
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-divider pb-6">
        <div className="flex flex-col gap-2">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-sans text-text-muted">
            <Link 
              href="/dashboard/admin" 
              className="hover:text-text-primary transition-colors flex items-center gap-1"
            >
              <span>Admin Hub</span>
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-text-brand font-semibold">User Management</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
              User Account Directory
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-heading font-bold text-[11px] uppercase tracking-wider">
              Platform Members
            </span>
          </div>

          <p className="font-sans text-xs sm:text-sm text-text-muted max-w-2xl leading-relaxed">
            Audit player profiles, review ticket purchase volumes, and maintain account security access controls across the platform.
          </p>
        </div>

        {/* Live System Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface border border-border text-xs font-sans shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-bold text-text-primary text-[11px] tracking-wide uppercase font-heading">
              Directory Live
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <section aria-label="User Account Statistics">
        <UsersStatsCards />
      </section>

      {/* Main Table Section */}
      <section aria-label="User Management Table">
        <UsersTable />
      </section>
    </div>
  );
}
