import React from "react";
import WinnersStatsCards from "../../../../components/dashboard/admin/WinnersStatsCards";
import WinnersTrackingTable from "../../../../components/dashboard/admin/WinnersTrackingTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Winners | Admin Dashboard",
  description: "Track competition winners, prize delivery, and verifications.",
};

export default function AdminTrackingPage() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
          Competition Winners & Claims Verification
        </h1>
        <p className="font-sans text-xs text-text-muted">
          Track official winner claims, perform ID & ticket verification audits, and publish winner announcements.
        </p>
      </div>
      
      <WinnersStatsCards />
      <WinnersTrackingTable />
    </div>
  );
}
