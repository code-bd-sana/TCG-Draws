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

export default function UserDashboardPage() {
  const { data: user } = useAuthUser();
  const { data: winners, isLoading: isWinnersLoading } = useMyWinnersQuery();
  const { data: rawTickets, isLoading: isTicketsLoading } = useMyTicketsQuery();
  const { data: rawTransactions, isLoading: isTransactionsLoading } = useMyTransactionsQuery();

  const [timeframe, setTimeframe] = useState<"7D" | "1M" | "3M" | "1Y">("1M");

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

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
            Player Dashboard
          </h1>
          <p className="font-sans text-xs text-text-muted">
            Welcome back, {firstName}! Track your active competition entries, ticket spend, and recent prize wins.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/user/winners"
            className="px-4 py-2 rounded-xl bg-surface border border-border hover:bg-elevated text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>🏆</span> My Winnings ({totalWins})
          </Link>
          <Link
            href="/live-raffles"
            className="btn-glossy-red px-4 py-2 rounded-xl text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md active:scale-98 transition-all flex items-center gap-1.5"
          >
            <span>🎯</span> Browse Draws
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
        {/* Total Tickets */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-3 shadow-card">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Total Tickets Purchased
          </p>
          <p className="font-heading font-black text-3xl lg:text-4xl leading-tight text-text-primary">
            {isTicketsLoading ? "..." : allTickets.length}
          </p>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-success-bg border border-[#BBF7D0] w-fit">
            <span className="font-sans text-[10px] font-bold text-success-text">
              {allTickets.length > 0 ? "Lifetime entries" : "No entries yet"}
            </span>
          </div>
        </div>

        {/* Active Entries */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-3 shadow-card">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Active Entries
          </p>
          <p className="font-heading font-black text-3xl lg:text-4xl leading-tight text-text-primary">
            {isTicketsLoading ? "..." : activeTickets.length}
          </p>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 w-fit">
            <span className="font-sans text-[10px] font-bold text-text-brand">
              {activeCompetitions.length} live draw{activeCompetitions.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* Won Competitions / Prizes */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-3 shadow-card">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Won Prizes
          </p>
          <p className="font-heading font-black text-3xl lg:text-4xl leading-tight text-text-primary">
            {isWinnersLoading ? "..." : totalWins}
          </p>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-success-bg border border-[#BBF7D0] w-fit">
            <span className="font-sans text-[10px] font-bold text-success-text">
              {instantWinsCount > 0 ? `⚡ ${instantWinsCount} Instant Win(s)` : `🏆 ${totalWins} Total Prize(s)`}
            </span>
          </div>
        </div>

        {/* Total Lifetime Spent */}
        <div className="bg-surface border border-border rounded-card p-6 flex flex-col gap-3 shadow-card">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Total Lifetime Spent
          </p>
          <p className="font-heading font-black text-3xl lg:text-4xl leading-tight text-text-primary">
            {isTransactionsLoading && isTicketsLoading
              ? "..."
              : `£${totalLifetimeSpent.toFixed(2)}`}
          </p>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-elevated border border-border-medium w-fit">
            <span className="font-sans text-[10px] font-bold text-text-muted">
              Lifetime purchases
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Ticket Spend Overview Chart */}
      <div className="w-full">
        <div className="w-full bg-surface border border-border rounded-card p-6 flex flex-col min-h-[320px] shadow-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 sm:gap-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="font-heading font-black text-2xl lg:text-3xl text-text-primary leading-none">
                  £{spendChartData.reduce((acc, curr) => acc + curr.spend, 0).toFixed(2)}
                </span>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-success-bg border border-[#BBF7D0]">
                  <span className="font-sans text-[11px] font-bold text-success-text">
                    Audited Transactions
                  </span>
                </div>
              </div>
              <span className="font-sans text-xs text-text-muted mt-1">
                Ticket Spend ({timeframe}) • Lifetime: £{totalLifetimeSpent.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-elevated p-1 rounded-xl border border-border-medium">
              {(["7D", "1M", "3M", "1Y"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-3 py-1 rounded-lg font-heading font-bold text-xs transition-all cursor-pointer ${
                    timeframe === period
                      ? "border border-border bg-surface text-text-brand shadow-xs"
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
                Loading spend overview...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={spendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUserSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0b4d35" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0b4d35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#717D6E", fontSize: 11, fontFamily: "sans-serif" }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#717D6E", fontSize: 11, fontFamily: "sans-serif" }}
                    tickFormatter={(val) => `£${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                  />
                  <RechartsTooltip
                    cursor={{ stroke: "#E2EADF", strokeWidth: 1, strokeDasharray: "4 4" }}
                    contentStyle={{ 
                      backgroundColor: "#FFFFFF", 
                      borderColor: "#E2EADF", 
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      fontFamily: "sans-serif"
                    }}
                    itemStyle={{ color: "#0b4d35", fontWeight: "bold" }}
                    formatter={(val: any) => [
                      `£${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
                      "Ticket Spend"
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="spend" 
                    stroke="#0b4d35" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorUserSpend)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Active Entries & Recent Wins */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full items-start">
        {/* My Active Entries */}
        <div className="xl:col-span-6 bg-surface border border-border rounded-card p-6 flex flex-col shadow-card">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-divider">
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
              className="flex items-center gap-1 font-sans font-bold text-xs text-text-brand hover:underline transition-all cursor-pointer"
            >
              View All
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
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
              <div className="w-14 h-14 bg-accent-bg rounded-full border border-primary/30 flex items-center justify-center mb-3 text-primary">
                🎟️
              </div>
              <h4 className="font-heading font-bold text-sm text-text-primary mb-1">
                No active entries found
              </h4>
              <p className="font-sans text-xs text-text-muted max-w-[280px] mb-4">
                You do not have any tickets in active draws. Browse live competitions to participate!
              </p>
              <Link
                href="/live-raffles"
                className="btn-glossy-red px-4 py-2 rounded-xl text-white font-heading font-bold text-xs uppercase tracking-wider shadow-sm"
              >
                Browse Live Draws
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-divider">
              {activeCompetitions.map((item) => (
                <div
                  key={item.raffle.id}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-elevated/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-accent-bg shrink-0 border border-border">
                      <Image
                        src={
                          item.raffle.images?.[0] ||
                          item.raffle.mainImage ||
                          "https://placehold.co/400x300/1a230a/8cb34a?text=Draw"
                        }
                        alt={item.raffle.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <Link
                        href={`/live-raffles/${item.raffle.slug || item.raffle.id}`}
                        className="font-heading font-bold text-xs text-text-primary truncate hover:text-text-brand"
                      >
                        {item.raffle.title}
                      </Link>
                      <span className="font-sans text-[11px] text-text-muted truncate">
                        Hosted by {item.raffle.host?.businessName || "Fairway Draws Host"}
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
                    <div className="px-3 py-1 bg-elevated border border-border-medium rounded-lg text-center">
                      <span className="font-sans font-bold text-xs text-text-brand">
                        {item.ticketCount} {item.ticketCount === 1 ? "ticket" : "tickets"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Wins (Instant Wins & Main Draw Wins) */}
        <div className="xl:col-span-6 bg-surface border border-border rounded-card p-6 flex flex-col shadow-card">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-divider">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
                  Recent Wins
                </h3>
                {instantWinsCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] font-sans font-bold text-[9px] uppercase tracking-wider">
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
              className="flex items-center gap-1 font-sans font-bold text-xs text-text-brand hover:underline transition-all cursor-pointer"
            >
              View All ({totalWins})
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
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
              <div className="w-14 h-14 bg-accent-bg rounded-full border border-primary/30 flex items-center justify-center mb-3 text-primary shadow-xs">
                🏆
              </div>
              <h4 className="font-heading font-bold text-sm text-text-primary mb-1">
                No wins recorded yet
              </h4>
              <p className="font-sans text-xs text-text-muted max-w-[280px] mb-4">
                Enter active competitions for your chance to win instant prizes and premium golf equipment.
              </p>
              <Link
                href="/dashboard/user/competitions"
                className="btn-glossy-red px-4 py-2 rounded-xl text-white font-heading font-bold text-xs uppercase tracking-wider shadow-sm"
              >
                Explore Competitions
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-divider">
              {recentWins.map((win) => (
                <div
                  key={win.id}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-elevated/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-accent-bg shrink-0 border border-border">
                      <Image
                        src={
                          win.prizeImage ||
                          win.raffle?.mainImage ||
                          "https://placehold.co/400x300/1a230a/8cb34a?text=Prize"
                        }
                        alt={win.prizeName}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-heading font-bold text-xs text-text-primary truncate">
                          {win.prizeName}
                        </span>
                        {win.winType === "INSTANT_WIN" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] font-sans font-bold text-[9px] uppercase tracking-wider">
                            ⚡ Instant Win
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] font-sans font-bold text-[9px] uppercase tracking-wider">
                            🏆 Main Draw
                          </span>
                        )}
                      </div>

                      <p className="font-sans text-[11px] text-text-muted truncate">
                        {win.raffle?.title || "Fairway Draws Competition"}
                      </p>

                      <div className="flex items-center gap-2 mt-0.5 text-[10px] font-sans text-text-muted">
                        <span className="font-mono font-semibold text-text-primary">
                          Ticket #{win.ticketNumber}
                        </span>
                        {win.rrpValue ? (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-[#15803d]">
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
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : win.deliveryStatus === "SHIPPED"
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
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
    </div>
  );
}
