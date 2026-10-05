"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useAdminOverviewStats } from "../../../hooks/useAdminHooks";
import { adminService } from "../../../services/admin.service";

export default function AdminDashboardPage() {
  const [timeFilter, setTimeFilter] = useState("1M");
  const { data: overview, isLoading } = useAdminOverviewStats();
  const { data: reports, isLoading: isReportsLoading } = useQuery({
    queryKey: ['adminReports', timeFilter],
    queryFn: () => adminService.getReports(timeFilter),
  });

  const revenueData = reports?.revenueTrend || [];
  const growthData = reports?.growthData || [];
  const topHosts = overview?.topHosts || [];

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
          System Admin Overview
        </h1>
        <p className="font-sans text-xs text-text-muted">
          Platform performance metrics, host verification queue, revenue breakdown, and growth analytics.
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        
        {/* Total Users */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Total Users
          </span>
          <div className="flex flex-col gap-1 mt-1">
            <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
              {isLoading ? "..." : overview?.stats.totalUsers ?? 0}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="px-2.5 py-0.5 rounded-full bg-success-bg border border-[#BBF7D0] flex items-center justify-center">
                <span className="font-sans font-bold text-[10px] text-success-text">Registered Members</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Hosts */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Active Hosts
          </span>
          <div className="flex flex-col gap-1 mt-1">
            <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
              {isLoading ? "..." : overview?.stats.activeHosts ?? 0}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="font-sans font-bold text-xs text-text-brand">Verified Operators</span>
            </div>
          </div>
        </div>

        {/* Live Raffles */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Live Raffles
          </span>
          <div className="flex flex-col gap-1 mt-1">
            <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
              {isLoading ? "..." : overview?.stats.liveRaffles ?? 0}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="px-2.5 py-0.5 rounded-full bg-success-bg border border-[#BBF7D0] flex items-center justify-center">
                <span className="font-sans font-bold text-[10px] text-success-text">Active Draws</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-2 shadow-card">
          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Total Revenue
          </span>
          <div className="flex flex-col gap-1 mt-1">
            <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary leading-none">
              {isLoading ? "..." : `£${(overview?.stats.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="font-sans font-semibold text-xs text-text-muted">Ticket Sales</span>
            </div>
          </div>
        </div>

      </div>

      {/* Middle Grid (Revenue Chart & Awaiting Review) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Platform Revenue Chart */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-card p-6 flex flex-col shadow-card">
          <div className="flex items-start justify-between mb-6">
            <div className="flex flex-col gap-1">
              <span className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">Platform Revenue</span>
              <div className="flex items-center gap-3">
                <span className="font-heading font-black text-2xl lg:text-3xl text-text-primary">
                  {isLoading ? "..." : `£${(overview?.stats.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
                <div className="px-2.5 py-0.5 rounded-full bg-success-bg border border-[#BBF7D0] flex items-center justify-center gap-1">
                  <svg className="w-3 h-3 text-success-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                  </svg>
                  <span className="font-sans font-bold text-[10px] text-success-text">Live</span>
                </div>
              </div>
            </div>
            
            {/* Chart Filters */}
            <div className="flex items-center gap-1 bg-elevated border border-border-medium rounded-xl p-1">
              {['7D', '1M', '6M', '1Y'].map((filter) => (
                <button 
                  key={filter} 
                  onClick={() => setTimeFilter(filter)}
                  className={`px-3 py-1 rounded-lg font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    timeFilter === filter ? 'bg-primary text-white shadow-xs' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-full h-[240px]">
            {isReportsLoading ? (
              <div className="w-full h-full flex items-center justify-center text-text-muted font-sans text-xs">
                Loading revenue data...
              </div>
            ) : revenueData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-text-muted font-sans text-xs">
                No revenue recorded for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0b4d35" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0b4d35" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#717D6E', fontSize: 10, fontFamily: 'sans-serif' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#717D6E', fontSize: 10, fontFamily: 'sans-serif' }}
                    tickFormatter={(val) => `£${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2EADF', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    itemStyle={{ color: '#101811', fontWeight: 600 }}
                    formatter={(val: any) => [`£${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#0b4d35" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Awaiting Your Review */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
              Awaiting Review
            </h3>
            <div className="w-6 h-6 rounded-full bg-[#dc2626] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="font-heading font-bold text-xs">
                {isLoading ? "..." : overview?.awaitingReview.count ?? 0}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 flex-1">
            {isLoading ? (
              <div className="py-8 text-center text-text-muted font-sans text-xs animate-pulse">Loading review items...</div>
            ) : overview?.awaitingReview.list.length === 0 ? (
              <div className="py-8 text-center text-text-muted font-sans text-xs">No items pending review.</div>
            ) : (
              overview?.awaitingReview.list.map((item) => (
                <div key={item.id} className="flex items-center justify-between pb-3 border-b border-divider last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0 text-primary font-bold text-xs">
                      {item.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-heading font-bold text-xs text-text-primary">{item.title}</span>
                      <span className="font-sans text-xs text-text-muted">{item.sub}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <Link href="/dashboard/admin/raffles" className="w-full mt-4 h-10 rounded-xl bg-elevated border border-border-medium hover:bg-surface text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer shadow-xs">
            Review All Approvals →
          </Link>
        </div>

      </div>

      {/* Lower Grid (Growth Chart & Top Hosts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* User & Host Growth Chart */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
              User &amp; Host Growth
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="font-sans font-semibold text-xs text-text-muted">Users</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#8cb34a]" />
                <span className="font-sans font-semibold text-xs text-text-muted">Hosts</span>
              </div>
            </div>
          </div>
          
          <div className="w-full h-[220px]">
            {isReportsLoading ? (
              <div className="w-full h-full flex items-center justify-center text-text-muted font-sans text-xs">
                Loading growth data...
              </div>
            ) : growthData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-text-muted font-sans text-xs">
                No growth data recorded for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#717D6E', fontSize: 10, fontFamily: 'sans-serif' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#717D6E', fontSize: 10, fontFamily: 'sans-serif' }}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2EADF', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    itemStyle={{ color: '#101811', fontWeight: 600 }}
                    cursor={{ fill: '#F1F5EE' }}
                  />
                  <Bar dataKey="Users" fill="#0b4d35" radius={[6, 6, 0, 0]} barSize={16} />
                  <Bar dataKey="Hosts" fill="#8cb34a" radius={[6, 6, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Hosts This Month */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
              Top Hosts This Month
            </h3>
            <Link href="/dashboard/admin/hosts" className="font-sans font-bold text-xs text-text-brand hover:underline transition-all cursor-pointer">
              View All →
            </Link>
          </div>
          
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <div className="py-8 text-center text-text-muted font-sans text-xs animate-pulse">Loading top hosts...</div>
            ) : topHosts.length === 0 ? (
              <div className="py-8 text-center text-text-muted font-sans text-xs">No host sales recorded yet.</div>
            ) : (
              topHosts.map((host) => (
                <div key={host.id || host.rank} className="flex items-center justify-between py-1.5 border-b border-divider last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-text-muted w-4 text-right">
                      {host.rank}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0 shadow-xs">
                      <span className="font-sans font-bold text-xs text-text-brand">{host.initials}</span>
                    </div>
                    <span className="font-heading font-bold text-xs text-text-primary">{host.name}</span>
                  </div>
                  <span className="font-heading font-black text-xs text-text-brand">
                    {host.revenue}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Recent Activity Footer */}
      <div className="w-full bg-surface border border-border rounded-card p-6 flex flex-col gap-4 overflow-hidden shadow-card">
        <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
          Recent Activity Logs
        </h3>
        
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
          {isLoading ? (
            <div className="py-4 text-center text-text-muted font-sans text-xs animate-pulse">Loading recent activity...</div>
          ) : overview?.recentActivity.length === 0 ? (
            <div className="py-4 text-center text-text-muted font-sans text-xs">No recent activity.</div>
          ) : (
            overview?.recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 shrink-0 min-w-[280px] p-3 rounded-xl bg-elevated border border-border-medium">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                  activity.highlight ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]' :
                  activity.alert ? 'bg-[#FEE2E2] border-[#FECACA] text-[#DC2626]' :
                  'bg-success-bg border-[#BBF7D0] text-success-text'
                }`}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className={`font-sans font-bold text-xs truncate ${
                    activity.highlight ? 'text-[#D97706]' :
                    activity.alert ? 'text-[#DC2626]' :
                    'text-text-primary'
                  }`}>
                    {activity.text}
                  </span>
                  <span className="font-sans font-semibold text-[10px] text-text-muted mt-0.5">{activity.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
