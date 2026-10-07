"use client";

import React from "react";
import { cn } from "../../../lib/utils";

interface WinnersFilterBarProps {
  activeTab: "all" | "month" | "week";
  setActiveTab: (tab: "all" | "month" | "week") => void;
  sortBy: "newest" | "oldest";
  setSortBy: (sort: "newest" | "oldest") => void;
}

/**
 * Filter bar for Winners page.
 * Manages timeline capsule selections (All Time, This Month, This Week) and sort order in TCG Draws luxury style.
 */
export default function WinnersFilterBar({
  activeTab,
  setActiveTab,
  sortBy,
  setSortBy,
}: WinnersFilterBarProps) {
  return (
    <div className="select-none border-y border-[rgba(212,175,55,0.18)] bg-[#090A0E]/95 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
      <div className="container-custom flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Timeline Toggles */}
        <div className="flex gap-2 items-center">
          {[
            { label: "All Time", value: "all" },
            { label: "This Month", value: "month" },
            { label: "This Week", value: "week" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={cn(
                "px-4 py-2 rounded-xl border font-heading text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none",
                activeTab === tab.value
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#B39042] border-[#D4AF37] text-[#090A0E] shadow-[0_0_12px_rgba(212,175,55,0.35)]"
                  : "border-[rgba(212,175,55,0.2)] bg-[#12151F] text-[#A69B82] hover:border-[#D4AF37]/50 hover:text-[#F4EBD9]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown Selector */}
        <div className="relative w-full sm:w-48">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
            className="w-full appearance-none rounded-xl border border-[rgba(212,175,55,0.25)] bg-[#12151F] px-4 py-2.5 font-sans text-xs font-semibold text-[#F4EBD9] transition-colors duration-200 hover:border-[#D4AF37]/60 cursor-pointer outline-none"
            aria-label="Sort Winner Records"
          >
            <option value="newest" className="bg-[#12151F]">Newest First</option>
            <option value="oldest" className="bg-[#12151F]">Oldest First</option>
          </select>

          {/* Custom Select Chevron Icon */}
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#D4AF37]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-3.5 h-3.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
