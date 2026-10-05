"use client";

import React from "react";
import HostStatCard from "./HostStatCard";
import HostRevenueChart from "./HostRevenueChart";
import HostActiveRaffles from "./HostActiveRaffles";
import HostUpcomingDraws from "./HostUpcomingDraws";
import HostRecentActivity from "./HostRecentActivity";
import { useHostDashboardOverview } from "../../../hooks/useHostWalletHooks";

export default function HostDashboardOverview() {
  const { data: dashboardData, isLoading } = useHostDashboardOverview();

  const kpiStats = [
    {
      id: "net-revenue",
      label: "Total Net Revenue",
      value: isLoading
        ? "..."
        : `£${(dashboardData?.kpiStats?.totalNetRevenue || 0).toLocaleString('en-GB', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      change: `${dashboardData?.kpiStats?.commissionRate ?? 15}% Platform Fee`,
      trend: "up" as const,
    },
    {
      id: "available-balance",
      label: "Available Balance",
      value: isLoading
        ? "..."
        : `£${(dashboardData?.kpiStats?.availableBalance || 0).toLocaleString('en-GB', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      change: "Ready to Payout",
      trend: "up" as const,
    },
    {
      id: "active-competitions",
      label: "Active Competitions",
      value: isLoading ? "..." : `${dashboardData?.kpiStats?.activeCompetitionsCount || 0}`,
      change: `${dashboardData?.kpiStats?.totalCompetitionsCount || 0} Total`,
      trend: "up" as const,
    },
    {
      id: "tickets-sold",
      label: "Total Tickets Sold",
      value: isLoading
        ? "..."
        : `${(dashboardData?.kpiStats?.totalTicketsSold || 0).toLocaleString()}`,
      change: `${dashboardData?.kpiStats?.totalWinnersCount || 0} Winners`,
      trend: "up" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-[20px] w-full max-w-[1660px] mx-auto p-4 sm:p-6 lg:p-8">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px] w-full">
        {kpiStats.map((stat) => (
          <HostStatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col xl:flex-row gap-[20px] w-full items-start">
        {/* Left Column (Earnings + Active Raffles) */}
        <div className="flex flex-col gap-[20px] w-full xl:flex-1 min-w-0">
          <HostRevenueChart totalRevenue={dashboardData?.kpiStats?.totalNetRevenue} />
          <HostActiveRaffles raffles={dashboardData?.activeRaffles} isLoading={isLoading} />
        </div>

        {/* Right Column (Upcoming Draws) */}
        <div className="flex flex-col gap-[20px] w-full xl:w-[420px] 2xl:w-[500px] shrink-0 min-w-0">
          <HostUpcomingDraws draws={dashboardData?.upcomingDraws} isLoading={isLoading} />
        </div>
      </div>

      {/* Bottom Row (Recent Activity) */}
      <HostRecentActivity activities={dashboardData?.recentActivity} isLoading={isLoading} />
    </div>
  );
}
