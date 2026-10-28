"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";
import { useAuthUser } from "@/hooks/useAuthHooks";
import { useMyWinnersQuery } from "@/hooks/useUserHooks";
import { useMyTicketsQuery, useMyTransactionsQuery } from "@/hooks/useTicketHooks";
import { UserWinner } from "@/services/user.service";
import UserWinDetailsModal from "@/components/dashboard/user/UserWinDetailsModal";

export default function UserDashboardPage() {
  const { data: user } = useAuthUser();
  const { data: winners, isLoading: isWinnersLoading } = useMyWinnersQuery();
  const { data: rawTickets, isLoading: isTicketsLoading } = useMyTicketsQuery();
  const { data: rawTransactions, isLoading: isTransactionsLoading } = useMyTransactionsQuery();

  const [timeframe, setTimeframe] = useState<"7D" | "1M" | "3M" | "1Y">("1M");
  const [selectedWin, setSelectedWin] = useState<UserWinner | null>(null);
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);

  const allWinners: UserWinner[] = useMemo(() => winners || [], [winners]);
  const instantWinsCount = useMemo(
    () => allWinners.filter((w) => w.winType === "INSTANT_WIN").length,
    [allWinners]
  );
  const mainDrawWinsCount = useMemo(
    () => allWinners.filter((w) => w.winType === "MAIN_DRAW").length,
    [allWinners]
  );
  const totalWins = allWinners.length;
  const recentWins = useMemo(() => allWinners.slice(0, 5), [allWinners]);

  const allTickets: any[] = useMemo(() => rawTickets || [], [rawTickets]);
  const activeTickets = useMemo(
    () => allTickets.filter((t: any) => t.raffle && t.raffle.status === "ACTIVE"),
    [allTickets]
  );

  // Group active tickets by competition
  const activeCompetitions = useMemo(() => {
    const map = new Map<string, { raffle: any; ticketCount: number; latestDate: string }>();
    activeTickets.forEach((t: any) => {
      const r = t.raffle;
      if (!r) return;
      const existing = map.get(r.id);
      if (existing) {
        existing.ticketCount += 1;
        if (new Date(t.createdAt) > new Date(existing.latestDate)) {
          existing.latestDate = t.createdAt;
        }
      } else {
        map.set(r.id, {
          raffle: r,
          ticketCount: 1,
          latestDate: t.createdAt,
        });
      }
    });
    return Array.from(map.values()).slice(0, 5);
  }, [activeTickets]);

  // Transactions & Total Spend
  const transactions: any[] = useMemo(() => rawTransactions || [], [rawTransactions]);
  const totalLifetimeSpent = useMemo(() => {
    const completed = transactions.filter(
      (t: any) => (t.status || "").toUpperCase() === "COMPLETED"
    );
    if (completed.length > 0) {
      return completed.reduce((sum: number, t: any) => {
        const val =
          parseFloat(String(t.amount || "0").replace(/[^0-9.-]+/g, "")) || 0;
        return sum + val;
      }, 0);
    }
    // Fallback: sum of all tickets purchased
    return allTickets.reduce((sum: number, t: any) => {
      const price = Number(t.raffle?.pricePerTicket || 0);
      return sum + price;
    }, 0);
  }, [transactions, allTickets]);

  const spendChartData = useMemo(() => {
    const now = new Date();
    const completedTx = transactions.filter(
      (t: any) => !t.status || t.status.toUpperCase() === "COMPLETED" || t.status.toUpperCase() === "PAID"
    );

    if (timeframe === "7D") {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const days = [];
      const map = new Map<string, number>();

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = `${dayNames[d.getDay()]} ${d.getDate()}`;
        days.push(key);
        map.set(key, 0);
      }

      completedTx.forEach((t: any) => {
        const txDate = new Date(t.date || t.createdAt);
        const diffDays = Math.floor((now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          const key = `${dayNames[txDate.getDay()]} ${txDate.getDate()}`;
          const amt = parseFloat(String(t.amount || "0").replace(/[^0-9.-]+/g, "")) || 0;
          if (map.has(key)) {
            map.set(key, (map.get(key) || 0) + amt);
          }
        }
      });

      return days.map((name) => ({ name, spend: Number((map.get(name) || 0).toFixed(2)) }));
    }

    if (timeframe === "1M") {
      const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
      const map = new Map<string, number>();
      weeks.forEach((w) => map.set(w, 0));

      completedTx.forEach((t: any) => {
        const txDate = new Date(t.date || t.createdAt);
        const diffDays = Math.floor((now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 30) {
          const weekIdx = Math.min(3, Math.floor((29 - diffDays) / 7.5));
          const key = weeks[weekIdx];
          const amt = parseFloat(String(t.amount || "0").replace(/[^0-9.-]+/g, "")) || 0;
          map.set(key, (map.get(key) || 0) + amt);
        }
      });

      return weeks.map((name) => ({ name, spend: Number((map.get(name) || 0).toFixed(2)) }));
    }

    if (timeframe === "3M") {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const months = [];
      const map = new Map<string, number>();

      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = monthNames[d.getMonth()];
        months.push(key);
        map.set(key, 0);
      }

      completedTx.forEach((t: any) => {
        const txDate = new Date(t.date || t.createdAt);
        const key = monthNames[txDate.getMonth()];
        if (map.has(key)) {
          const amt = parseFloat(String(t.amount || "0").replace(/[^0-9.-]+/g, "")) || 0;
          map.set(key, (map.get(key) || 0) + amt);
        }
      });

      return months.map((name) => ({ name, spend: Number((map.get(name) || 0).toFixed(2)) }));
    }

    // "1Y"
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const months = [];
    const map = new Map<string, number>();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthNames[d.getMonth()];
      months.push(key);
      map.set(key, 0);
    }

    completedTx.forEach((t: any) => {
      const txDate = new Date(t.date || t.createdAt);
      const key = monthNames[txDate.getMonth()];
      if (map.has(key)) {
        const amt = parseFloat(String(t.amount || "0").replace(/[^0-9.-]+/g, "")) || 0;
        map.set(key, (map.get(key) || 0) + amt);
      }
    });

    return months.map((name) => ({ name, spend: Number((map.get(name) || 0).toFixed(2)) }));
  }, [transactions, timeframe]);

  const firstName = user?.firstName || "Player";

  const handleOpenWinModal = (win: UserWinner) => {
    setSelectedWin(win);
    setIsWinModalOpen(true);
  };

  return (
    <div className="relative flex flex-col gap-8 p-4 sm:p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn font-sans">
      {/* Background ambient lighting for luxury Art-Deco aesthetic */}
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
              href="/dashboard/user" 
              className="hover:text-text-primary transition-colors flex items-center gap-1"
            >
              <span>Dashboard</span>
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-text-brand font-semibold">Player Hub</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
              Player Hub &amp; Live Entries
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-heading font-bold text-[11px] uppercase tracking-wider">
              Player Lounge
            </span>
          </div>

          <p className="font-sans text-xs sm:text-sm text-text-muted max-w-2xl leading-relaxed">
            Welcome back, {firstName}! Monitor your active competition entries, historical prize winnings, ticket allocation ledgers, and transaction spend.
          </p>
        </div>

        {/* Live Session Badge & Quick Actions */}
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface border border-border text-xs font-sans shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-bold text-text-primary text-[11px] tracking-wide uppercase font-heading">
              Player Session Active
            </span>
          </div>

          <Link
            href="/dashboard/user/winners"
            className="btn-dark-metallic h-10 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <span>🏆</span> My Winnings ({totalWins})
          </Link>

          <Link
            href="/live-raffles"
            className="btn-gold-metallic h-10 px-5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <span>🎯</span> Browse Live Draws
          </Link>
        </div>
      </div>

      {/* 4 Art-Deco KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
        {/* Total Tickets */}
        <div className="art-deco-card rounded-card p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] group group-hover:border-primary/40">
          <div className="flex items-start justify-between gap-3">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
              Total Tickets Purchased
            </span>
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 group-hover:border-primary/40 transition-colors shadow-inner">
              <svg className="w-5 h-5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary tracking-tight leading-none">
              {isTicketsLoading ? "..." : allTickets.length.toLocaleString()}
            </span>
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="font-sans text-xs text-text-muted">Lifetime draw entries</span>
              <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-sans font-bold text-[10px] uppercase tracking-wider">
                {allTickets.length > 0 ? "Active Player" : "No Entries"}
              </span>
            </div>
          </div>
        </div>

        {/* Active Entries */}
        <div className="art-deco-card rounded-card p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] group group-hover:border-emerald-500/40">
          <div className="flex items-start justify-between gap-3">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
              Live Competition Entries
            </span>
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 group-hover:border-emerald-500/40 transition-colors shadow-inner">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary tracking-tight leading-none">
              {isTicketsLoading ? "..." : activeTickets.length.toLocaleString()}
            </span>
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="font-sans text-xs text-text-muted">In pending draws</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                {activeCompetitions.length} Live Draw{activeCompetitions.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        {/* Won Prizes & Drops */}
        <div className="art-deco-card rounded-card p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] group group-hover:border-primary/40">
          <div className="flex items-start justify-between gap-3">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
              Prizes &amp; Drops Won
            </span>
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 group-hover:border-primary/40 transition-colors shadow-inner">
              <svg className="w-5 h-5 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.496m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.496 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492c.981.142 1.953.316 2.916.52a6.003 6.003 0 0 1-5.405 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary tracking-tight leading-none">
              {isWinnersLoading ? "..." : totalWins.toLocaleString()}
            </span>
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="font-sans text-xs text-text-muted">Total claimed prizes</span>
              <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-sans font-bold text-[10px] uppercase tracking-wider">
                {instantWinsCount > 0 ? `⚡ ${instantWinsCount} Instant` : `🏆 ${totalWins} Won`}
              </span>
            </div>
          </div>
        </div>

        {/* Total Lifetime Spent */}
        <div className="art-deco-card rounded-card p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] group group-hover:border-amber-500/40">
          <div className="flex items-start justify-between gap-3">
            <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
              Lifetime Ticket Spend
            </span>
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 group-hover:border-amber-500/40 transition-colors shadow-inner">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 1 0 0 8.488M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary tracking-tight leading-none">
              {isTransactionsLoading && isTicketsLoading
                ? "..."
                : `£${totalLifetimeSpent.toFixed(2)}`}
            </span>
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="font-sans text-xs text-text-muted">All verified purchases</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-sans font-bold text-[10px] uppercase tracking-wider">
                Audited Capital
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Ticket Spend Overview Chart */}
      <div className="art-deco-card rounded-card p-6 flex flex-col min-h-[340px] shadow-card border border-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 pb-4 border-b border-border/80">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="font-heading font-black text-2xl lg:text-3xl text-text-primary leading-none">
                £{spendChartData.reduce((acc, curr) => acc + curr.spend, 0).toFixed(2)}
              </span>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30">
                <span className="font-sans text-[11px] font-bold text-text-brand">
                  Period Ledger
                </span>
              </div>
            </div>
            <span className="font-sans text-xs text-text-muted mt-1">
              Ticket Spend ({timeframe}) • Total Lifetime: £{totalLifetimeSpent.toFixed(2)}
            </span>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-border">
            {(["7D", "1M", "3M", "1Y"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1 rounded-lg font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  timeframe === period
                    ? "bg-primary text-[#090A0E] font-black shadow-sm border border-primary"
                    : "border border-transparent text-text-muted hover:text-text-primary"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex-1 w-full relative min-h-[220px]">
          {isTransactionsLoading ? (
            <div className="w-full h-full min-h-[200px] flex items-center justify-center text-text-muted font-sans text-xs animate-pulse">
              Loading spend telemetry...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={spendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUserSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
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
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#A69B82", fontSize: 11, fontFamily: "inherit" }}
                  tickFormatter={(val) => `£${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                />
                <RechartsTooltip
                  cursor={{ stroke: "rgba(212, 175, 55, 0.4)", strokeWidth: 1, strokeDasharray: "4 4" }}
                  contentStyle={{ 
                    backgroundColor: "#141720", 
                    borderColor: "rgba(212, 175, 55, 0.4)", 
                    borderRadius: "12px",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.7)",
                    fontFamily: "inherit"
                  }}
                  itemStyle={{ color: "#D4AF37", fontWeight: "bold" }}
                  formatter={(val: any) => [
                    `£${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
                    "Ticket Spend"
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="spend" 
                  stroke="#D4AF37" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorUserSpend)" 
                  activeDot={{ r: 6, fill: "#D4AF37", stroke: "#090A0E", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 3: Active Entries & Recent Wins */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full items-start">
        {/* My Active Entries */}
        <div className="xl:col-span-6 art-deco-card rounded-card p-6 flex flex-col shadow-card border border-border">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-border/80">
            <div>
              <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
                My Active Entries
              </h3>
              <p className="font-sans text-[11px] text-text-muted">
                Competitions you are currently participating in
              </p>
            </div>
            <Link
              href="/dashboard/user/tickets"
              className="flex items-center gap-1 font-heading font-bold text-xs uppercase tracking-wider text-text-brand hover:underline transition-all cursor-pointer"
            >
              View All
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>

          {isTicketsLoading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
              <span className="font-sans text-xs text-text-muted">Loading active entries...</span>
            </div>
          ) : activeCompetitions.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-14 h-14 bg-accent-bg rounded-2xl border border-primary/30 flex items-center justify-center mb-3 text-2xl shadow-inner">
                🎟️
              </div>
              <h4 className="font-heading font-bold text-sm text-text-primary mb-1">
                No active entries found
              </h4>
              <p className="font-sans text-xs text-text-muted max-w-[280px] mb-4">
                You do not have any tickets in active draws. Browse live Pokémon competitions to participate!
              </p>
              <Link
                href="/live-raffles"
                className="btn-gold-metallic px-4 py-2 rounded-xl text-[#090A0E] font-heading font-black text-xs uppercase tracking-wider shadow-sm"
              >
                Browse Live Draws
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/40">
              {activeCompetitions.map((item) => (
                <div
                  key={item.raffle.id}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-accent-bg/30 px-2 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface shrink-0 border border-primary/30 shadow-xs">
                      <Image
                        src={
                          item.raffle.images?.[0] ||
                          item.raffle.mainImage ||
                          "https://placehold.co/400x300/12151F/D4AF37?text=TCG+Draw"
                        }
                        alt={item.raffle.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <Link
                        href={`/live-raffles/${item.raffle.slug || item.raffle.id}`}
                        className="font-heading font-black text-xs text-text-primary truncate hover:text-text-brand transition-colors"
                      >
                        {item.raffle.title}
                      </Link>
                      <span className="font-sans text-[11px] text-text-muted truncate">
                        Hosted by {item.raffle.host?.businessName || "TCG Draws Host"}
                      </span>
                      <span className="font-sans text-[10px] text-text-muted mt-0.5">
                        Draw Date:{" "}
                        {item.raffle.endDate
                          ? format(new Date(item.raffle.endDate), "dd MMM yyyy")
                          : "TBA"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="px-3 py-1 bg-accent-bg border border-primary/30 rounded-lg text-center shadow-xs">
                      <span className="font-mono font-bold text-xs text-text-brand">
                        {item.ticketCount} {item.ticketCount === 1 ? "ticket" : "tickets"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Wins */}
        <div className="xl:col-span-6 art-deco-card rounded-card p-6 flex flex-col shadow-card border border-border">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-border/80">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
                  Recent Wins
                </h3>
                {instantWinsCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-sans font-bold text-[9px] uppercase tracking-wider">
                    ⚡ {instantWinsCount} Instant Win{instantWinsCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <p className="font-sans text-[11px] text-text-muted">
                Your recent Instant Win prizes and Competition victories
              </p>
            </div>
            <Link
              href="/dashboard/user/winners"
              className="flex items-center gap-1 font-heading font-bold text-xs uppercase tracking-wider text-text-brand hover:underline transition-all cursor-pointer"
            >
              View All ({totalWins})
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </div>

          {isWinnersLoading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
              <span className="font-sans text-xs text-text-muted">Loading your winning records...</span>
            </div>
          ) : recentWins.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-14 h-14 bg-accent-bg rounded-2xl border border-primary/30 flex items-center justify-center mb-3 text-2xl shadow-inner">
                🏆
              </div>
              <h4 className="font-heading font-bold text-sm text-text-primary mb-1">
                No wins recorded yet
              </h4>
              <p className="font-sans text-xs text-text-muted max-w-[280px] mb-4">
                Enter active competitions for your chance to win instant prizes, graded PSA slabs, and booster boxes.
              </p>
              <Link
                href="/dashboard/user/competitions"
                className="btn-gold-metallic px-4 py-2 rounded-xl text-[#090A0E] font-heading font-black text-xs uppercase tracking-wider shadow-sm"
              >
                Explore Competitions
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/40">
              {recentWins.map((win) => (
                <div
                  key={win.id}
                  onClick={() => handleOpenWinModal(win)}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-accent-bg/30 px-2 rounded-xl transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface shrink-0 border border-primary/30 shadow-xs">
                      <Image
                        src={
                          win.prizeImage ||
                          win.raffle?.mainImage ||
                          "https://placehold.co/400x300/12151F/D4AF37?text=Prize"
                        }
                        alt={win.prizeName}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-heading font-black text-xs text-text-primary truncate group-hover:text-text-brand transition-colors">
                          {win.prizeName}
                        </span>
                        {win.winType === "INSTANT_WIN" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-sans font-bold text-[9px] uppercase tracking-wider">
                            ⚡ Instant Win
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-sans font-bold text-[9px] uppercase tracking-wider">
                            🏆 Main Draw
                          </span>
                        )}
                      </div>

                      <p className="font-sans text-[11px] text-text-muted truncate">
                        {win.raffle?.title || "TCG Draws Competition"}
                      </p>

                      <div className="flex items-center gap-2 mt-0.5 text-[10px] font-sans text-text-muted">
                        <span className="font-mono font-bold text-text-brand">
                          Ticket #{win.ticketNumber}
                        </span>
                        {win.rrpValue ? (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-text-primary">
                              Value: £{Number(win.rrpValue).toFixed(2)}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1.5">
                    <span className="font-sans text-[10px] text-text-muted">
                      {win.createdAt ? format(new Date(win.createdAt), "dd MMM yyyy") : ""}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider ${
                        win.deliveryStatus === "DELIVERED"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : win.deliveryStatus === "SHIPPED"
                          ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {win.deliveryStatus === "DELIVERED"
                        ? "Delivered"
                        : win.deliveryStatus === "SHIPPED"
                        ? "Shipped"
                        : "Won / Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Draggable User Win Details Modal */}
      <UserWinDetailsModal
        isOpen={isWinModalOpen}
        onClose={() => {
          setIsWinModalOpen(false);
          setSelectedWin(null);
        }}
        win={selectedWin}
      />
    </div>
  );
}
