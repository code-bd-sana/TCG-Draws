import React from "react";
import OrdersStatsCards from "../../../../components/dashboard/admin/OrdersStatsCards";
import AdminOrdersTable from "../../../../components/dashboard/admin/AdminOrdersTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ticket / Order Overview | Admin Dashboard",
  description: "View all tickets, orders, and manage refunds.",
};

export default function AdminOrdersPage() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
          Ticket Orders & Transactions
        </h1>
        <p className="font-sans text-xs text-text-muted">
          Monitor platform ticket purchasing logs, audit order payment amounts, and process buyer refunds.
        </p>
      </div>

      <OrdersStatsCards />
      <AdminOrdersTable />
    </div>
  );
}
