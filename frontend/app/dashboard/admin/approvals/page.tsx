import React from "react";
import CompetitionApprovalQueue from "../../../../components/dashboard/admin/CompetitionApprovalQueue";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Approval Queue | Admin Dashboard",
  description: "Review and approve pending competitions.",
};

export default function AdminApprovalsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
          Competition Approval Queue
        </h1>
        <p className="font-sans text-xs text-text-muted">
          Review host raffle submissions, audit prize details & ticket rules, and publish approved competitions.
        </p>
      </div>

      <CompetitionApprovalQueue />
    </div>
  );
}
