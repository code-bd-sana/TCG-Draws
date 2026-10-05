"use client";

import React from "react";
import { useHostRaffles } from "../../../hooks/useRaffleHooks";
import Link from "next/link";

interface HostActiveRafflesProps {
  raffles?: any[];
  isLoading?: boolean;
}

export default function HostActiveRaffles({ raffles, isLoading: propIsLoading }: HostActiveRafflesProps) {
  const { data: response, isLoading: queryIsLoading } = useHostRaffles({ limit: 5, status: "Live" });
  const activeRaffles = raffles ?? (response?.data || []);
  const isLoading = propIsLoading ?? queryIsLoading;

  return (
    <div className="bg-surface border border-border rounded-card p-6 w-full flex flex-col min-h-[330px] shadow-card">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
          Active Competitions
        </h2>
        <Link href="/dashboard/host/competitions" className="text-text-brand hover:text-primary-hover font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1">
          <span>View All</span>
          <span>→</span>
        </Link>
      </div>

      <div className="flex flex-col w-full gap-1">
        {isLoading && (
          <div className="flex flex-col gap-[12px]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-[12px] h-[52px] animate-pulse">
                <div className="w-[36px] h-[36px] rounded-xl bg-elevated shrink-0"></div>
                <div className="flex-1 h-[14px] bg-elevated rounded"></div>
                <div className="w-[50px] h-[14px] bg-elevated rounded shrink-0"></div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && activeRaffles.length === 0 && (
          <div className="py-12 text-center text-text-muted font-sans text-sm bg-bg rounded-xl border border-dashed border-border-medium">
            No active competitions currently live.
          </div>
        )}

        {!isLoading && activeRaffles.map((comp: any) => {
          const progress = Math.min(Math.round((comp.ticketsSold / comp.totalTickets) * 100), 100);
          const isEndingSoon = false;
          const imageUrl = comp.images && comp.images.length > 0 ? comp.images[0] : "https://placehold.co/100x100/ecf5ee/0b4d35?text=Raffle";

          return (
            <Link 
              href={`/dashboard/host/competitions`}
              key={comp.id} 
              className="flex items-center gap-[14px] py-2.5 border-b border-divider last:border-0 hover:bg-elevated transition-colors px-3 -mx-3 rounded-xl cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-elevated border border-border-medium shrink-0 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={comp.title} className="w-full h-full object-cover" />
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-sm text-text-primary truncate">
                  {comp.title}
                </p>
                <p className="font-sans text-[11px] text-text-muted">
                  {comp.ticketsSold} / {comp.totalTickets} tickets sold
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-[70px] h-[6px] bg-elevated border border-divider rounded-full overflow-hidden shrink-0 hidden sm:block">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }} 
                />
              </div>

              {/* Price */}
              <div className="w-[60px] shrink-0 text-right">
                <p className="font-heading font-bold text-sm text-text-brand">
                  £{Number(comp.pricePerTicket || 0).toFixed(2)}
                </p>
              </div>

              {/* Status Pill */}
              <div className={`h-[24px] px-2.5 rounded-full flex items-center justify-center shrink-0 border ${
                isEndingSoon ? "bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]" : "bg-success-bg border-[#BBF7D0] text-success-text"
              }`}>
                <span className="font-sans font-bold text-[10px] uppercase tracking-wide">
                  {isEndingSoon ? "Ending Soon" : "Live"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
