"use client";

import React from "react";
import { format } from "date-fns";
import { Raffle } from "../../../../services/raffle.service";

interface DrawOverviewTabProps {
  draw?: Raffle;
}

export default function DrawOverviewTab({ draw }: DrawOverviewTabProps) {
  if (!draw) return null;

  const isCompleted = draw.status === "ENDED";
  const isCancelled = draw.status === "CANCELLED";
  const isAuto = draw.isAutoDraw;
  
  const createdDate = draw.createdAt ? format(new Date(draw.createdAt), "dd MMM yyyy HH:mm") : "N/A";
  const startDate = draw.startDate ? format(new Date(draw.startDate), "dd MMM yyyy HH:mm") : "N/A";
  const endDate = draw.endDate ? format(new Date(draw.endDate), "dd MMM yyyy HH:mm") : "N/A";

  const winners = (draw as any).winners || [];
  const mainWinner = winners.find((w: any) => w.winType === "MAIN_DRAW");

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="w-full bg-accent-bg border border-primary/30 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h4 className="font-heading font-black text-base text-text-primary uppercase tracking-tight">
              {isCompleted ? "Draw Completed & Closed" : isCancelled ? "Draw Cancelled" : isAuto ? "Automated Draw Engine Scheduled" : "Manual Draw Selection Active"}
            </h4>
            <span className="font-sans text-xs text-text-brand font-semibold mt-0.5">
              {isCompleted
                ? `Winner finalized on ${endDate}`
                : isCancelled
                ? "This competition draw was cancelled by host or admin."
                : isAuto
                ? `Scheduled to execute automatically on ${endDate}`
                : `Host or admin manual trigger enabled. Target end date: ${endDate}`}
            </span>
          </div>
        </div>

        {mainWinner && (
          <div className="flex items-center gap-2 bg-surface border border-primary/40 px-3.5 py-2 rounded-xl shadow-xs shrink-0">
            <span className="text-lg">🏆</span>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-[10px] text-text-muted uppercase">Declared Winner</span>
              <span className="font-heading font-bold text-xs text-text-brand">
                {mainWinner.user?.firstName
                  ? `${mainWinner.user.firstName} ${mainWinner.user.lastName || ""}`
                  : `Ticket #${mainWinner.ticketNumber || "N/A"}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Details & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Draw Timeline (2 cols) */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6 shadow-xs">
          <h3 className="font-heading font-bold text-sm text-text-primary uppercase tracking-wider mb-6 pb-3 border-b border-divider flex items-center justify-between">
            <span>Competition & Draw Timeline</span>
            <span className="font-sans font-semibold text-xs text-text-muted uppercase tracking-normal">Status: {draw.status}</span>
          </h3>

          <div className="flex flex-col relative before:absolute before:inset-0 before:ml-[11px] before:w-[2px] before:bg-border-medium">
            
            {/* Step 1: Approved */}
            <div className="relative flex items-start gap-4 mb-6">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div className="flex flex-col -mt-0.5">
                <span className="font-sans font-bold text-xs text-text-primary">Competition Approved & Published</span>
                <span className="font-sans text-[11px] text-text-muted mt-0.5">{createdDate}</span>
              </div>
            </div>

            {/* Step 2: Sales Started */}
            <div className="relative flex items-start gap-4 mb-6">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div className="flex flex-col -mt-0.5">
                <span className="font-sans font-bold text-xs text-text-primary">Ticket Sales Opened</span>
                <span className="font-sans text-[11px] text-text-muted mt-0.5">{startDate}</span>
              </div>
            </div>

            {/* Step 3: Sales Closing */}
            <div className="relative flex items-start gap-4 mb-6">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                isCompleted || new Date(draw.endDate) <= new Date()
                  ? "bg-primary text-white"
                  : "bg-accent-bg border-2 border-primary text-text-brand"
              }`}>
                {isCompleted || new Date(draw.endDate) <= new Date() ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                )}
              </div>
              <div className="flex flex-col -mt-0.5">
                <span className="font-sans font-bold text-xs text-text-primary">Ticket Sales Closing & Lock</span>
                <span className="font-sans text-[11px] text-text-muted mt-0.5">{endDate}</span>
              </div>
            </div>

            {/* Step 4: Draw Execution */}
            <div className="relative flex items-start gap-4 mb-6">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                isCompleted
                  ? "bg-primary text-white"
                  : "bg-surface border-2 border-border-medium text-text-muted"
              }`}>
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted"></span>
                )}
              </div>
              <div className="flex flex-col -mt-0.5">
                <span className="font-sans font-bold text-xs text-text-primary">Winner Selection & Randomization</span>
                <span className="font-sans text-[11px] text-text-muted mt-0.5">
                  {isCompleted ? "Completed" : isAuto ? "Scheduled Automated RNG" : "Pending Manual Selection"}
                </span>
              </div>
            </div>

            {/* Step 5: Audit & Notification */}
            <div className="relative flex items-start gap-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                isCompleted
                  ? "bg-primary text-white"
                  : "bg-surface border-2 border-border-medium text-text-muted"
              }`}>
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted"></span>
                )}
              </div>
              <div className="flex flex-col -mt-0.5">
                <span className="font-sans font-bold text-xs text-text-primary">Audit Recorded & Winner Notified</span>
                <span className="font-sans text-[11px] text-text-muted mt-0.5">
                  {isCompleted ? "Results published to audit log" : "Awaiting draw conclusion"}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Host & Prize Specs Card (1 col) */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-xs flex flex-col gap-5">
          <h3 className="font-heading font-bold text-sm text-text-primary uppercase tracking-wider pb-3 border-b border-divider">
            Host & Prize Summary
          </h3>

          <div className="flex flex-col gap-4 text-xs font-sans">
            <div className="flex flex-col gap-1 p-3 bg-elevated border border-border-medium rounded-xl">
              <span className="text-[10px] font-bold text-text-muted uppercase">Host Operator</span>
              <span className="font-heading font-bold text-sm text-text-primary">
                {draw.host?.businessName || "Unknown Host"}
              </span>
              <span className="text-text-muted text-[11px]">Email: {draw.host?.user?.email || "N/A"}</span>
            </div>

            <div className="flex flex-col gap-1 p-3 bg-elevated border border-border-medium rounded-xl">
              <span className="text-[10px] font-bold text-text-muted uppercase">Prize Name & Details</span>
              <span className="font-heading font-bold text-sm text-text-brand">
                {draw.prizeName || draw.title}
              </span>
              <span className="text-text-muted text-[11px] truncate">
                {draw.description || "Standard Fairway Competition"}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-3 bg-elevated border border-border-medium rounded-xl">
              <span className="text-[10px] font-bold text-text-muted uppercase">Sales Metrics</span>
              <div className="flex justify-between items-center mt-1">
                <span className="text-text-muted">Tickets Sold:</span>
                <strong className="text-text-primary">{draw.ticketsSold || 0} / {draw.totalTickets}</strong>
              </div>
              <div className="w-full bg-border h-2 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round(((draw.ticketsSold || 0) / (draw.totalTickets || 1)) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
