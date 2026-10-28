"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import ExportReportModal from "./ExportReportModal";

const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="art-deco-card rounded-xl p-3 shadow-2xl border border-primary/40 font-sans backdrop-blur-md">
        <p className="text-[11px] font-bold text-text-muted mb-0.5">{label}</p>
        <p className="font-heading font-black text-sm text-text-brand">
          {prefix}{typeof payload[0].value === "number" ? payload[0].value.toLocaleString() : payload[0].value}{suffix}
        </p>
      </div>
    );
  }
  return null;
};

export default function ReportsAnalyticsDashboard() {
  const [timeFilter, setTimeFilter] = useState("3M");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const filters = [
    { id: "7D", label: "7 Days" },
    { id: "1M", label: "30 Days" },
    { id: "3M", label: "Quarter (3M)" },
    { id: "1Y", label: "1 Year" },
  ];

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-reports", timeFilter],
    queryFn: () => adminService.getReports(timeFilter),
  });

  const revenueData = data?.revenueTrend || [];
  const categoryData = data?.categorySales || [];
  const popularCompetitions = data?.popularCompetitions || [];
  const userGrowthData = data?.userGrowth || [];
  const hostPerformance = data?.hostPerformance || [];
  const geographicData = data?.geographicDistribution || [];

  // Summary Metrics calculations
  const totalRevenue = useMemo(() => {
    return revenueData.reduce((acc, curr) => acc + (curr.value || 0), 0);
  }, [revenueData]);

  const totalEntries = useMemo(() => {
    return popularCompetitions.reduce((acc, curr) => acc + (curr.value || 0), 0);
  }, [popularCompetitions]);

  const latestUsersCount = useMemo(() => {
    if (userGrowthData.length === 0) return 0;
    return userGrowthData[userGrowthData.length - 1]?.users || 0;
  }, [userGrowthData]);

  const topCategory = useMemo(() => {
    if (categoryData.length === 0) return null;
    return [...categoryData].sort((a, b) => b.value - a.value)[0];
  }, [categoryData]);

  const maxPopularValue = Math.max(...popularCompetitions.map((c) => c.value), 1);

  // Luxury Art-Deco colors palette for category donut chart
  const artDecoColors = ["#D4AF37", "#E5C158", "#997A35", "#38BDF8", "#A78BFA", "#F472B6"];

  return (
    <div className="flex flex-col w-full animate-fadeIn gap-8">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Metric 1: Gross Period Revenue */}
        <div className="art-deco-card rounded-card p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] group group-hover:border-primary/40">
          <div className="flex items-start justify-between gap-3">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
              Gross Period Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 group-hover:border-primary/40 transition-colors shadow-inner">
              <svg className="w-5 h-5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 1 0 0 8.488M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary tracking-tight leading-none">
              {isLoading ? "..." : `£${totalRevenue.toLocaleString()}`}
            </span>
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="font-sans text-xs text-text-muted">Ticket revenue in period</span>
              <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-sans font-bold text-[10px] uppercase tracking-wider">
                {timeFilter} Scope
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Popular Competition Volume */}
        <div className="art-deco-card rounded-card p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] group group-hover:border-emerald-500/40">
          <div className="flex items-start justify-between gap-3">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
              Total Recorded Entries
            </span>
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 group-hover:border-emerald-500/40 transition-colors shadow-inner">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary tracking-tight leading-none">
              {isLoading ? "..." : totalEntries.toLocaleString()}
            </span>
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="font-sans text-xs text-text-muted">Entries in top draws</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                Active Entries
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Player Registrations */}
        <div className="art-deco-card rounded-card p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] group group-hover:border-primary/40">
          <div className="flex items-start justify-between gap-3">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
              Cumulative Players
            </span>
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 group-hover:border-primary/40 transition-colors shadow-inner">
              <svg className="w-5 h-5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary tracking-tight leading-none">
              {isLoading ? "..." : latestUsersCount.toLocaleString()}
            </span>
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="font-sans text-xs text-text-muted">Registered platform accounts</span>
              <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-sans font-bold text-[10px] uppercase tracking-wider">
                Audited Base
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Top Category */}
        <div className="art-deco-card rounded-card p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] group group-hover:border-amber-500/40">
          <div className="flex items-start justify-between gap-3">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
              Dominant Category
            </span>
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 group-hover:border-amber-500/40 transition-colors shadow-inner">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.496m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.496 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492c.981.142 1.953.316 2.916.52a6.003 6.003 0 0 1-5.405 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <span className="font-heading font-black text-2xl lg:text-3xl text-text-primary tracking-tight leading-none truncate">
              {isLoading ? "..." : (topCategory ? topCategory.name : "N/A")}
            </span>
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="font-sans text-xs text-text-muted">Top sales share</span>
              {topCategory && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                  {topCategory.value}% Share
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        {/* Time Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-heading font-bold text-text-muted uppercase tracking-wider mr-1 hidden sm:inline">
            Window:
          </span>
          {filters.map((f) => {
            const isActive = timeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setTimeFilter(f.id)}
                className={`px-4 py-1.5 rounded-full font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-[#090A0E] font-black shadow-lg shadow-primary/20 border border-primary"
                    : "bg-surface border border-border text-text-muted hover:text-text-primary hover:border-border-medium"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Actions: Refresh & Export Modal */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-dark-metallic h-9 px-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            title="Refresh analytics data"
          >
            <svg
              className={`w-4 h-4 text-text-muted ${isFetching ? "animate-spin text-text-brand" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary hidden sm:inline">
              Refresh
            </span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="btn-gold-metallic h-9 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            title="Export reports and analytics dataset"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="font-heading font-black text-xs uppercase tracking-wider">
              Export Analytics
            </span>
          </button>
        </div>
      </div>

      {/* 6 Art-Deco Chart Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Chart 1: Revenue Trend */}
        <div className="art-deco-card rounded-card p-6 flex flex-col h-[340px] shadow-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-black text-base text-text-primary uppercase tracking-tight">
              Gross Revenue Trend
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-mono font-bold text-[10px] uppercase">
              Financial Curve
            </span>
          </div>
          <div className="flex-1 w-full min-h-0">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-elevated/40 rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F5E5C0" />
                      <stop offset="50%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#997A35" />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#A69B82", fontSize: 11, fontFamily: "inherit" }} 
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip prefix="£" />} cursor={{ stroke: "rgba(212,175,55,0.4)", strokeWidth: 1 }} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={2.5} 
                    dot={false}
                    activeDot={{ r: 6, fill: "#D4AF37", stroke: "#090A0E", strokeWidth: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Sales by Category */}
        <div className="art-deco-card rounded-card p-6 flex flex-col h-[340px] shadow-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading font-black text-base text-text-primary uppercase tracking-tight">
              Sales by Category
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-mono font-bold text-[10px] uppercase">
              Donut Share
            </span>
          </div>
          <div className="flex-1 w-full flex items-center justify-center relative min-h-0">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-elevated/40 rounded-xl" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="35%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      stroke="none"
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color || artDecoColors[index % artDecoColors.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip suffix="%" />} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Custom Art-Deco Legend */}
                <div className="absolute right-[2%] top-1/2 -translate-y-1/2 flex flex-col gap-2.5 max-w-[130px]">
                  {categoryData.map((cat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
                        style={{ backgroundColor: cat.color || artDecoColors[i % artDecoColors.length] }} 
                      />
                      <span className="font-sans font-semibold text-xs text-text-muted truncate flex-1">
                        {cat.name}
                      </span>
                      <span className="font-mono font-black text-xs text-text-primary shrink-0">
                        {cat.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chart 3: Most Popular Competitions */}
        <div className="art-deco-card rounded-card p-6 flex flex-col h-[340px] shadow-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-black text-base text-text-primary uppercase tracking-tight">
              Popular Competitions
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-mono font-bold text-[10px] uppercase">
              Top Entries
            </span>
          </div>
          <div className="flex flex-col gap-3.5 flex-1 justify-center overflow-y-auto no-scrollbar">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-elevated/40 rounded-xl" />
            ) : popularCompetitions.length === 0 ? (
              <span className="text-center text-xs text-text-muted">No competition entry records in this range</span>
            ) : (
              popularCompetitions.map((comp, i) => {
                const width = Math.max((comp.value / maxPopularValue) * 100, 5);
                return (
                  <div key={i} className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="font-mono font-bold text-[10px] text-text-brand">#{i + 1}</span>
                        <span className="font-sans font-semibold text-xs text-text-primary truncate max-w-[180px]">
                          {comp.name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs text-text-brand shrink-0">
                        {comp.value.toLocaleString()} <span className="font-sans text-[10px] text-text-muted">entries</span>
                      </span>
                    </div>
                    <div className="w-full bg-elevated h-2 rounded-full overflow-hidden border border-border">
                      <div 
                        className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-500" 
                        style={{ width: `${width}%` }} 
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chart 4: User Growth Over Time */}
        <div className="art-deco-card rounded-card p-6 flex flex-col h-[340px] shadow-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-black text-base text-text-primary uppercase tracking-tight">
              User Registration Growth
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-mono font-bold text-[10px] uppercase">
              Player Curve
            </span>
          </div>
          <div className="flex-1 w-full min-h-0">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-elevated/40 rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#A69B82", fontSize: 11, fontFamily: "inherit" }} 
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip prefix="Users: " />} cursor={{ stroke: "rgba(212,175,55,0.4)", strokeWidth: 1 }} />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#D4AF37" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#areaGradient)" 
                    activeDot={{ r: 6, fill: "#D4AF37", stroke: "#090A0E", strokeWidth: 2 }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 5: Host Performance */}
        <div className="art-deco-card rounded-card p-6 flex flex-col h-[340px] shadow-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-black text-base text-text-primary uppercase tracking-tight">
              Host Performance Quotas
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-mono font-bold text-[10px] uppercase">
              Operator Share
            </span>
          </div>
          <div className="flex flex-col flex-1 justify-center gap-3 overflow-y-auto no-scrollbar">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-elevated/40 rounded-xl" />
            ) : hostPerformance.length === 0 ? (
              <span className="text-center text-xs text-text-muted">No active host data in period</span>
            ) : (
              hostPerformance.map((host, i) => (
                <div key={i} className="flex items-center gap-3 w-full">
                  <div className="w-7 h-7 rounded-lg bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0">
                    <span className="font-heading font-bold text-[10px] text-text-brand">
                      {host.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-sans font-semibold text-xs text-text-muted w-[95px] truncate shrink-0">
                    {host.name}
                  </span>
                  <div className="flex-1 h-5 bg-elevated border border-border rounded-lg overflow-hidden flex items-center">
                    <div 
                      className="h-full bg-gradient-to-r from-primary/70 to-primary rounded-lg transition-all duration-500 ease-out" 
                      style={{ width: `${Math.max(host.percent, 4)}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-xs text-text-primary shrink-0 w-10 text-right">
                    {host.percent}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chart 6: Geographic Entry Distribution */}
        <div className="art-deco-card rounded-card p-6 flex flex-col h-[340px] shadow-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-black text-base text-text-primary uppercase tracking-tight">
              Geographic Distribution
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-mono font-bold text-[10px] uppercase">
              Player Region
            </span>
          </div>
          <div className="flex flex-col gap-3.5 flex-1 justify-center overflow-y-auto no-scrollbar">
            {isLoading ? (
              <div className="w-full h-full animate-pulse bg-elevated/40 rounded-xl" />
            ) : geographicData.length === 0 ? (
              <span className="text-center text-xs text-text-muted">No demographic data found</span>
            ) : (
              geographicData.map((geo, i) => {
                const width = Math.max(geo.value, 2);
                return (
                  <div key={i} className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        <span className="font-sans font-semibold text-xs text-text-primary">
                          {geo.name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs text-text-brand">
                        {geo.value}%
                      </span>
                    </div>
                    <div className="w-full bg-elevated h-2 rounded-full overflow-hidden border border-border">
                      <div 
                        className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-500" 
                        style={{ width: `${width}%` }} 
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Draggable Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={data}
        timeFilter={timeFilter}
      />
    </div>
  );
}
