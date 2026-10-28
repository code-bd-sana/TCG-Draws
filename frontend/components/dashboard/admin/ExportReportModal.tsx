"use client";

import React, { useState } from "react";
import { AdminReportsData } from "../../../services/admin.service";
import { useDraggableModal } from "../../../hooks/useDraggableModal";
import { toast } from "sonner";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AdminReportsData | undefined;
  timeFilter: string;
}

export default function ExportReportModal({
  isOpen,
  onClose,
  data,
  timeFilter,
}: ExportReportModalProps) {
  const [reportType, setReportType] = useState<string>("all");

  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    resetKey: timeFilter,
    onClose,
  });

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!data) {
      toast.error("No report data available to export");
      return;
    }

    let csvContent = "";
    const timestamp = new Date().toISOString().slice(0, 10);
    let filename = `tcg_draws_report_${timeFilter.toLowerCase()}_${timestamp}.csv`;

    if (reportType === "revenue" || reportType === "all") {
      csvContent += "=== REVENUE TREND ===\nDate,Gross Revenue (£)\n";
      (data.revenueTrend || []).forEach((item) => {
        csvContent += `"${item.name}",${item.value}\n`;
      });
      csvContent += "\n";
    }

    if (reportType === "category" || reportType === "all") {
      csvContent += "=== CATEGORY SALES BREAKDOWN ===\nCategory,Percentage Share (%)\n";
      (data.categorySales || []).forEach((item) => {
        csvContent += `"${item.name}",${item.value}%\n`;
      });
      csvContent += "\n";
    }

    if (reportType === "competitions" || reportType === "all") {
      csvContent += "=== MOST POPULAR COMPETITIONS ===\nCompetition Title,Tickets / Entries Sold\n";
      (data.popularCompetitions || []).forEach((item) => {
        csvContent += `"${item.name.replace(/"/g, '""')}",${item.value}\n`;
      });
      csvContent += "\n";
    }

    if (reportType === "users" || reportType === "all") {
      csvContent += "=== USER REGISTRATION GROWTH ===\nTimeline,Cumulative Registered Users\n";
      (data.userGrowth || []).forEach((item) => {
        csvContent += `"${item.name}",${item.users}\n`;
      });
      csvContent += "\n";
    }

    if (reportType === "hosts" || reportType === "all") {
      csvContent += "=== HOST PERFORMANCE RANKINGS ===\nHost / Operator,Volume Share (%)\n";
      (data.hostPerformance || []).forEach((item) => {
        csvContent += `"${item.name}",${item.percent}%\n`;
      });
      csvContent += "\n";
    }

    if (reportType === "geo" || reportType === "all") {
      csvContent += "=== GEOGRAPHIC ENTRY DISTRIBUTION ===\nRegion / Location,Distribution Percentage (%)\n";
      (data.geographicDistribution || []).forEach((item) => {
        csvContent += `"${item.name}",${item.value}%\n`;
      });
      csvContent += "\n";
    }

    if (reportType !== "all") {
      filename = `tcg_draws_${reportType}_${timeFilter.toLowerCase()}_${timestamp}.csv`;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Analytics report downloaded successfully!");
    onClose();
  };

  const reportOptions = [
    { id: "all", title: "Complete Platform Executive Summary", desc: "All 6 datasets aggregated into a multi-section audit CSV" },
    { id: "revenue", title: "Revenue Trend Data", desc: "Historical revenue timeline with daily/monthly gross amounts" },
    { id: "category", title: "Category Sales Breakdown", desc: "Percentage revenue distribution across TCG competition categories" },
    { id: "competitions", title: "Popular Competitions by Volume", desc: "Raffle entry rankings and ticket distribution numbers" },
    { id: "users", title: "User Growth Timeline", desc: "Historical user acquisition rates across the selected period" },
    { id: "hosts", title: "Host Performance Quotas", desc: "Operator sales volume contributions and percentage shares" },
    { id: "geo", title: "Geographic Distribution", desc: "Regional entry analytics and user location breakdown" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Draggable Modal Container */}
      <div
        ref={modalRef}
        style={modalStyle}
        className={`fixed top-1/2 left-1/2 w-[94vw] sm:w-[90vw] max-w-[560px] max-h-[92vh] art-deco-card rounded-card z-50 animate-fadeIn flex flex-col font-sans overflow-hidden transition-shadow select-none ${
          isDragging
            ? "shadow-2xl ring-2 ring-primary/40 select-none cursor-grabbing"
            : "shadow-2xl border border-primary/30"
        }`}
      >
        {/* Header - Drag Bar */}
        <div
          {...dragHandleProps}
          title="Click and drag to move window • Double-click to re-center"
          className={`flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-border bg-accent-bg/40 shrink-0 cursor-grab active:cursor-grabbing select-none touch-none transition-colors ${
            isDragging ? "bg-accent-bg/70" : ""
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <svg
              className="w-4 h-4 text-text-muted opacity-70 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
            </svg>
            <h2 className="font-heading font-black text-sm sm:text-base text-text-primary uppercase tracking-tight truncate">
              Export Analytics &amp; Reports
            </h2>
            {isMoved && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetPosition();
                }}
                className="text-[10px] font-mono text-text-brand hover:underline cursor-pointer ml-1.5 shrink-0 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20"
                title="Reset to center"
              >
                (Reset)
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-border bg-surface hover:bg-elevated text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Period Banner */}
          <div className="p-4 rounded-xl bg-surface/80 border border-primary/20 flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="font-sans text-[10px] uppercase tracking-wider text-text-muted font-bold">
                Selected Reporting Window
              </span>
              <span className="font-heading font-black text-sm text-text-primary">
                Period: {timeFilter === "7D" ? "Last 7 Days" : timeFilter === "1M" ? "Past 30 Days" : timeFilter === "3M" ? "Past Quarter (90 Days)" : "Past 12 Months"}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-mono font-bold text-xs uppercase">
              {timeFilter} Active
            </span>
          </div>

          {/* Dataset selection */}
          <div className="space-y-2">
            <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted block">
              Select Dataset to Export
            </label>
            <div className="space-y-2">
              {reportOptions.map((opt) => {
                const isSelected = reportType === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setReportType(opt.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? "bg-accent-bg/40 border-primary/60 shadow-sm"
                        : "bg-surface/60 border-border hover:border-border-medium hover:bg-surface"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-text-muted/40 bg-surface"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#090A0E]" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-heading font-bold text-xs text-text-primary">
                        {opt.title}
                      </span>
                      <span className="font-sans text-[11px] text-text-muted">
                        {opt.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-border bg-accent-bg/20 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-dark-metallic h-9 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="btn-gold-metallic h-9 px-5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Download CSV Export</span>
          </button>
        </div>
      </div>
    </>
  );
}
