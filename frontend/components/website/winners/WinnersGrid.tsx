"use client";

import React, { useState } from "react";
import { usePublicWinnersList } from "../../../hooks/useRaffleHooks";
import WinnersFilterBar from "./WinnersFilterBar";
import WinnerCard from "./WinnerCard";
import { cn } from "../../../lib/utils";

/**
 * Grid layout and controller managing state for pagination, sorting, and time range filters in TCG Draws style.
 */
export default function WinnersGrid() {
  const [activeTab, setActiveTab] = useState<"all" | "month" | "week">("all");
  const [winnerTypeFilter, setWinnerTypeFilter] = useState<"all" | "instant" | "main_draw">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  const { data: winnersResponse, isLoading } = usePublicWinnersList({
    activeTab,
    winnerType: winnerTypeFilter,
    sortBy,
    page: currentPage,
    limit: itemsPerPage,
  });

  const visibleWinners = winnersResponse?.data || [];
  const totalPages = winnersResponse?.meta?.totalPages || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      const gridElement = document.getElementById("winners-listing-grid");
      if (gridElement) {
        gridElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleTabChange = (tab: "all" | "month" | "week") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <section id="winners-listing-grid" className="relative flex-grow scroll-mt-20 bg-[#090A0E] py-14">
      {/* Background Subtle Gradient & Grid Texture */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-70" />

      {/* Dynamic Filters Header bar */}
      <WinnersFilterBar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <div className="container-custom relative mt-10 z-10">
        {/* Winner Type Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10 max-w-3xl mx-auto">
          {[
            { label: "All Winners", value: "all" },
            { label: "Main Draw Slabs", value: "main_draw" },
            { label: "Instant Wins", value: "instant" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setWinnerTypeFilter(tab.value as any); setCurrentPage(1); }}
              className={cn(
                "font-heading font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer select-none",
                winnerTypeFilter === tab.value
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#B39042] border-[#D4AF37] text-[#090A0E] shadow-[0_0_15px_rgba(212,175,55,0.35)]"
                  : "bg-[#12151F] border-[rgba(212,175,55,0.2)] text-[#A69B82] hover:text-[#F4EBD9] hover:border-[#D4AF37]/50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-[400px] gap-4 text-[#A69B82]">
            <div className="animate-spin h-10 w-10 border-4 border-[#D4AF37] border-t-transparent rounded-full" />
            <p className="font-heading text-xs uppercase tracking-widest text-[#D4AF37]">
              Loading verified winners...
            </p>
          </div>
        ) : visibleWinners.length > 0 ? (
          <>
            {/* Grid of Winner Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleWinners.map((winner) => (
                <WinnerCard key={winner.id} winner={winner} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 pt-8 border-t border-[rgba(212,175,55,0.15)] select-none font-sans">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(activePage - 1)}
                  disabled={activePage === 1}
                  className="px-4 py-2 border border-[rgba(212,175,55,0.3)] text-[#F4EBD9] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#D4AF37] hover:text-[#090A0E] hover:border-[#D4AF37] rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer bg-[#12151F]"
                >
                  ← Prev
                </button>

                {/* Page Index Numbers */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNumber = idx + 1;
                  const isActive = pageNumber === activePage;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center font-heading text-xs font-bold transition-all duration-200 cursor-pointer select-none",
                        isActive
                          ? "bg-gradient-to-r from-[#D4AF37] to-[#B39042] border border-[#D4AF37] text-[#090A0E] shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                          : "bg-[#12151F] border border-[rgba(212,175,55,0.25)] text-[#A69B82] hover:bg-[#1A1E2B] hover:text-[#F4EBD9] hover:border-[#D4AF37]/50"
                      )}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(activePage + 1)}
                  disabled={activePage === totalPages}
                  className="px-4 py-2 border border-[rgba(212,175,55,0.3)] text-[#F4EBD9] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#D4AF37] hover:text-[#090A0E] hover:border-[#D4AF37] rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer bg-[#12151F]"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="py-24 text-center select-none bg-[#12151F] border border-[rgba(212,175,55,0.25)] border-dashed rounded-2xl max-w-lg mx-auto p-8 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-[#181C28] border border-[rgba(212,175,55,0.3)] flex items-center justify-center mx-auto mb-4 text-[#D4AF37]">
              🏆
            </div>
            <h3 className="font-heading font-black text-xl text-[#F4EBD9] uppercase tracking-wide">
              No Winners Found
            </h3>
            <p className="font-sans text-xs text-[#A69B82] mt-2 max-w-sm mx-auto">
              We couldn&apos;t find any winner records matching this filter selection. Check back after upcoming live draws!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
