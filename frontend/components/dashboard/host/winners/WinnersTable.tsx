"use client";

import React, { useState } from "react";
import { cn } from "../../../../lib/utils";
import { useHostRaffles } from "../../../../hooks/useRaffleHooks";
import WinnerDetailsModal from "./WinnerDetailsModal";

export default function WinnersTable() {
  const [activeFilter, setActiveFilter] = useState<"All" | "ACTIVE" | "ENDED">("All");
  const [selectedDrawToView, setSelectedDrawToView] = useState<any | null>(null);
  
  const { data: response, isLoading } = useHostRaffles();
  const raffles = response?.data || [];

  const filteredDraws = raffles.filter((r: any) => {
    if (activeFilter === "All") return true;
    return r.status === activeFilter;
  });

  if (isLoading) {
    return (
      <div className="w-full bg-surface border border-border rounded-card overflow-hidden flex flex-col mt-6 shadow-card animate-in fade-in duration-300">
        <div className="p-6 border-b border-divider flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="h-6 w-36 bg-elevated rounded animate-pulse mb-2"></div>
            <div className="h-4 w-60 bg-elevated rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-52 bg-elevated rounded-xl animate-pulse"></div>
        </div>
        <div className="w-full overflow-x-auto min-h-[350px]">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="border-b border-divider bg-elevated/70">
                <th className="py-4 px-6"><div className="h-3.5 w-20 bg-elevated rounded animate-pulse"></div></th>
                <th className="py-4 px-6"><div className="h-3.5 w-20 bg-elevated rounded animate-pulse"></div></th>
                <th className="py-4 px-6"><div className="h-3.5 w-20 bg-elevated rounded animate-pulse"></div></th>
                <th className="py-4 px-6 flex justify-end"><div className="h-3.5 w-20 bg-elevated rounded animate-pulse"></div></th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-divider last:border-0">
                  <td className="py-5 px-6">
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-44 bg-elevated rounded animate-pulse"></div>
                      <div className="h-3.5 w-24 bg-elevated rounded animate-pulse"></div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="h-4 w-20 bg-elevated rounded animate-pulse"></div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="h-4 w-16 bg-elevated rounded animate-pulse"></div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="h-9 w-32 bg-accent-bg rounded-xl animate-pulse ml-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface border border-border rounded-card overflow-hidden flex flex-col mt-6 shadow-card">
      
      {/* Header & Filter Tabs */}
      <div className="p-6 lg:p-8 border-b border-divider flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface">
        <div>
          <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
            Competition Winners &amp; Deliveries
          </h3>
          <p className="font-sans text-xs text-text-muted">
            View winners (Instant Wins &amp; Main Draw) and update prize delivery status.
          </p>
        </div>
        
        <div className="flex items-center gap-1 bg-elevated p-1 rounded-xl border border-border-medium">
          {(["All", "ACTIVE", "ENDED"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-1.5 rounded-lg font-sans font-bold text-xs transition-all cursor-pointer",
                activeFilter === filter
                  ? "bg-surface text-text-brand border border-border shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              {filter === "All" ? "All Competitions" : filter === "ACTIVE" ? "Active" : "Completed"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto min-h-[350px]">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <thead>
            <tr className="border-b border-divider bg-elevated/70">
              <th className="py-4 px-6 font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                Competition Name
              </th>
              <th className="py-4 px-6 font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                Draw Date
              </th>
              <th className="py-4 px-6 font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                Tickets Sold
              </th>
              <th className="py-4 px-6 text-right font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDraws.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-text-muted font-sans text-sm">
                  No competitions found matching criteria.
                </td>
              </tr>
            ) : (
              filteredDraws.map((draw: any, index: number) => (
                <tr 
                  key={draw.id}
                  className={cn(
                    "group transition-colors hover:bg-elevated/60",
                    index !== filteredDraws.length - 1 && "border-b border-divider"
                  )}
                >
                  <td className="py-5 px-6">
                    <div className="flex flex-col gap-1">
                      <span className="font-heading font-bold text-sm text-text-primary">
                        {draw.title}
                      </span>
                      <span className="font-sans text-xs text-text-muted">
                        Status: <strong className="text-text-brand font-bold uppercase">{draw.status}</strong>
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="font-sans font-semibold text-xs text-text-muted">
                      {draw.endDate ? new Date(draw.endDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <span className="font-sans font-semibold text-xs text-text-muted">
                      {draw.ticketsSold} / {draw.totalTickets}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <button 
                      onClick={() => setSelectedDrawToView(draw)}
                      className="h-[36px] px-4 bg-accent-bg border border-primary/30 text-text-brand hover:bg-primary hover:text-white transition-all rounded-xl inline-flex items-center justify-center font-heading font-bold text-xs uppercase tracking-wider cursor-pointer shadow-xs"
                    >
                      🏆 View Winners &amp; Delivery
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedDrawToView && (
        <WinnerDetailsModal
          isOpen={!!selectedDrawToView}
          onClose={() => setSelectedDrawToView(null)}
          raffle={selectedDrawToView}
        />
      )}
    </div>
  );
}
