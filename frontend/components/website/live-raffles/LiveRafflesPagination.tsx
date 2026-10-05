"use client";

import React from "react";
import { cn } from "../../../lib/utils";

interface LiveRafflesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Pagination component for live draws grid navigation matching brand design scheme.
 */
export default function LiveRafflesPagination({
  currentPage = 1,
  totalPages = 3,
  onPageChange,
}: LiveRafflesPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 py-8 mt-12 border-t border-divider/50 font-sans">
      {/* Prev Button */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "px-4 py-2 text-xs font-bold rounded-full border select-none transition-all duration-200 cursor-pointer shadow-xs",
          currentPage === 1
            ? "border-[#bdd3ba]/40 text-text-muted/40 bg-surface/50 cursor-not-allowed"
            : "border-[#bdd3ba] text-[#0b4d35] hover:bg-[#0b4d35] hover:text-white hover:border-[#0b4d35] bg-surface"
        )}
      >
        ← Prev
      </button>

      {/* Pages list */}
      <div className="flex items-center gap-2 select-none">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              "w-9 h-9 text-xs font-bold rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer select-none",
              currentPage === p
                ? "bg-[#0b4d35] border-[#0b4d35] text-white shadow-sm"
                : "bg-surface border-[#bdd3ba] text-[#0b4d35] hover:bg-[#0b4d35] hover:text-white hover:border-[#0b4d35]"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "px-4 py-2 text-xs font-bold rounded-full border select-none transition-all duration-200 cursor-pointer shadow-xs",
          currentPage === totalPages
            ? "border-[#bdd3ba]/40 text-text-muted/40 bg-surface/50 cursor-not-allowed"
            : "border-[#bdd3ba] text-[#0b4d35] hover:bg-[#0b4d35] hover:text-white hover:border-[#0b4d35] bg-surface"
        )}
      >
        Next →
      </button>
    </div>
  );
}
