"use client";

import React, { useState } from "react";
import DrawOverviewTab from "./DrawOverviewTab";
import DrawEntriesTab from "./DrawEntriesTab";
import DrawAuditLogTab from "./DrawAuditLogTab";
import { format } from "date-fns";
import { Raffle } from "../../../../services/raffle.service";

import ManualWinnerSelectModal from "../../shared/ManualWinnerSelectModal";

interface DrawDetailsPanelProps {
  draw: Raffle;
  onClose: () => void;
}

export default function DrawDetailsPanel({ draw, onClose }: DrawDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "entries" | "audit">("overview");
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);

  const getStatusString = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL": return "Pending Approval";
      case "DRAFT": return "Draft";
      case "ENDED": return "Completed";
      case "ACTIVE": return "In Progress";
      case "CANCELLED": return "Cancelled";
      default: return status;
    }
  };

  const getDrawType = (d: Raffle) => {
    if (!d.isAutoDraw) return "Manual (Host)";
    if (d.isAutoDraw && d.autoDrawSoldOut) return "Auto (Sold Out)";
    return "Auto (Date)";
  };

  const hostName = draw.host?.businessName || "Unknown Host";
  const statusString = getStatusString(draw.status);
  const drawType = getDrawType(draw);
  const scheduledTime = draw.endDate ? format(new Date(draw.endDate), "dd MMM yyyy HH:mm") : "N/A";

  return (
    <div className="w-full bg-surface border border-border rounded-card flex flex-col mt-6 animate-fadeIn overflow-hidden shadow-card">
      
      {/* Header Area */}
      <div className="flex flex-col p-6 pb-0 border-b border-divider bg-elevated">
        
        {/* Title & Actions */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">{draw.title}</h2>
            {/* Status Pills */}
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full border border-primary/30 bg-accent-bg text-text-brand font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">
                {statusString}
              </span>
              <span className="px-3 py-1 rounded-full border border-border-medium bg-surface text-text-secondary font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">
                {drawType}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(() => {
              const hasWinner = Boolean(
                (draw as any).winners?.some((w: any) => w.winType === 'MAIN_DRAW')
              );
              const isSoldOut = (draw.ticketsSold || 0) >= (draw.totalTickets || 1);
              const isExpired = draw.endDate ? new Date(draw.endDate) <= new Date() : false;
              const canDraw = !hasWinner && (isSoldOut || isExpired);

              if (hasWinner) {
                return (
                  <span className="px-3.5 py-2 rounded-xl border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D] font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                    <span>✓</span> Winner Selected
                  </span>
                );
              }

              if (canDraw) {
                return (
                  <button
                    onClick={() => setIsWinnerModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>🏆</span>
                    <span>Select Winner</span>
                  </button>
                );
              }

              return (
                <span className="px-3.5 py-2 rounded-xl border border-border-medium bg-surface text-text-muted font-sans font-bold text-xs uppercase tracking-wider">
                  Live Draw
                </span>
              );
            })()}
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface border border-transparent hover:border-border transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Subtitle */}
        <div className="font-sans text-xs text-text-muted font-semibold mb-6">
          Host: <strong className="text-text-primary font-bold">{hostName}</strong> | End Date: <strong className="text-text-primary font-bold">{scheduledTime}</strong>
        </div>

        {/* 4 Stat Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface border border-border-medium rounded-xl p-4 flex flex-col gap-1 shadow-xs hover:border-primary/40 transition-colors">
            <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Total Tickets</span>
            <span className="font-heading font-black text-2xl text-text-primary">{draw.totalTickets}</span>
          </div>
          <div className="bg-surface border border-border-medium rounded-xl p-4 flex flex-col gap-1 shadow-xs hover:border-primary/40 transition-colors">
            <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Sold Tickets</span>
            <span className="font-heading font-black text-2xl text-text-brand">{draw.ticketsSold || 0}</span>
          </div>
          <div className="bg-surface border border-border-medium rounded-xl p-4 flex flex-col gap-1 shadow-xs hover:border-primary/40 transition-colors">
            <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Price Per Ticket</span>
            <span className="font-heading font-black text-2xl text-text-primary">£{Number(draw.pricePerTicket).toFixed(2)}</span>
          </div>
          <div className="bg-surface border border-border-medium rounded-xl p-4 flex flex-col gap-1 shadow-xs hover:border-primary/40 transition-colors">
            <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Draw Type</span>
            <span className="font-heading font-black text-2xl text-text-primary">{drawType}</span>
          </div>
        </div>

        {/* Segmented Control Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-surface border border-border-medium rounded-xl mb-6 shadow-xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-2.5 rounded-lg font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-accent-bg border border-primary/30 text-text-brand shadow-xs"
                : "text-text-muted hover:text-text-primary hover:bg-elevated"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("entries")}
            className={`flex-1 py-2.5 rounded-lg font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "entries"
                ? "bg-accent-bg border border-primary/30 text-text-brand shadow-xs"
                : "text-text-muted hover:text-text-primary hover:bg-elevated"
            }`}
          >
            Ticket Entries
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex-1 py-2.5 rounded-lg font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "audit"
                ? "bg-accent-bg border border-primary/30 text-text-brand shadow-xs"
                : "text-text-muted hover:text-text-primary hover:bg-elevated"
            }`}
          >
            Audit Log
          </button>
        </div>

      </div>

      {/* Tab Content Area */}
      <div className="p-6 lg:p-8">
        {activeTab === "overview" && <DrawOverviewTab draw={draw} />}
        {activeTab === "entries" && <DrawEntriesTab draw={draw} />}
        {activeTab === "audit" && <DrawAuditLogTab draw={draw} />}
      </div>

      {isWinnerModalOpen && (
        <ManualWinnerSelectModal
          isOpen={isWinnerModalOpen}
          onClose={() => setIsWinnerModalOpen(false)}
          raffle={draw}
          isAdmin={true}
        />
      )}

    </div>
  );
}
