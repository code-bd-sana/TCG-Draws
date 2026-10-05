import React from "react";
import SubscriptionStatsCards from "../../../../components/dashboard/admin/SubscriptionStatsCards";
import PlanDistributionChart from "../../../../components/dashboard/admin/PlanDistributionChart";
import SubscriptionTable from "../../../../components/dashboard/admin/SubscriptionTable";

export default function AdminSubscriptionsManagementPage() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
          Host Subscriptions & Billing
        </h1>
        <p className="font-sans text-xs text-text-muted">
          Monitor host merchant plan distribution, recurring subscription revenue (MRR), and active billing renewals.
        </p>
      </div>

      {/* Top Stats Cards */}
      <SubscriptionStatsCards />

      {/* Middle Layout: Donut Chart & Table */}
      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] items-start gap-6">
        <PlanDistributionChart />
        <SubscriptionTable />
      </div>
    </div>
  );
}
