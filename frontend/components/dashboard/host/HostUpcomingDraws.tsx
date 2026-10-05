"use client";

import React from "react";
import { useHostRaffles } from "../../../hooks/useRaffleHooks";
import Link from "next/link";

interface HostUpcomingDrawsProps {
  draws?: any[];
  isLoading?: boolean;
}

export default function HostUpcomingDraws({ draws, isLoading: propIsLoading }: HostUpcomingDrawsProps) {
  const { data: response, isLoading: queryIsLoading } = useHostRaffles({ limit: 10, status: "Live" });
  
  const upcomingDraws = draws ?? (response?.data || [])
    .sort((a: any, b: any) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 5);

  const isLoading = propIsLoading ?? queryIsLoading;

  return (
    <div className="bg-surface border border-border rounded-card p-6 w-full flex flex-col min-h-[330px] shadow-card">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
          Upcoming Draws
        </h2>
        <Link href="/dashboard/host/winners" className="text-text-brand hover:text-primary-hover font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1">
          <span>View All</span>
          <span>→</span>
        </Link>
      </div>

      <div className="flex flex-col w-full gap-2">
        {isLoading && (
          <div className="flex flex-col gap-[16px]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-[12px] animate-pulse">
                <div className="w-[36px] h-[36px] rounded-xl bg-elevated shrink-0"></div>
                <div className="flex flex-col flex-1 gap-2">
                  <div className="h-[12px] bg-elevated rounded w-3/4"></div>
                  <div className="h-[10px] bg-elevated rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && upcomingDraws.length === 0 && (
          <div className="py-12 text-center text-text-muted font-sans text-sm bg-bg rounded-xl border border-dashed border-border-medium">
            No upcoming draws scheduled.
          </div>
        )}

        {!isLoading && upcomingDraws.map((draw: any) => {
          const dateObj = new Date(draw.endDate);
          const dayNumber = dateObj.getDate();
          
          return (
            <Link 
              href="/dashboard/host/winners"
              key={draw.id} 
              className="flex items-center gap-[12px] hover:bg-elevated py-2.5 px-3 -mx-3 rounded-xl transition-colors cursor-pointer"
            >
              {/* Date Badge */}
              <div className="w-10 h-10 rounded-xl border border-border-medium bg-accent-bg flex items-center justify-center shrink-0 shadow-xs">
                <span className="font-heading font-black text-sm text-text-brand">
                  {dayNumber}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 min-w-0">
                <p className="font-heading font-bold text-sm text-text-primary truncate">
                  {draw.title}
                </p>
                <p className="font-sans text-[11px] text-text-muted truncate">
                  {draw.ticketsSold} / {draw.totalTickets} tickets sold • Ends {dateObj.toLocaleDateString()}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
