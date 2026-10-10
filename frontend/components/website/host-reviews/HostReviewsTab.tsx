"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useHostReviewsQuery } from "@/hooks/useReviewHooks";
import { HostReviewStats, HostReviewItem } from "@/types/review.types";

interface HostReviewsTabProps {
  hostId: string;
  hostName: string;
  initialStats?: HostReviewStats | null;
  initialReviews?: HostReviewItem[];
}

export default function HostReviewsTab({
  hostId,
  hostName,
  initialStats,
  initialReviews = [],
}: HostReviewsTabProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);

  const { data, isLoading } = useHostReviewsQuery(hostId, {
    page,
    limit: 10,
    rating: selectedRating || undefined,
  });

  const stats = data?.stats || initialStats || {
    averageRating: null,
    totalReviews: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    percentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  const reviews = data?.reviews || (selectedRating === null ? initialReviews : []);
  const totalReviewsCount = stats.totalReviews || 0;
  const hasZeroReviews = totalReviewsCount === 0;

  const handleFilterClick = (rating: number | null) => {
    setSelectedRating(rating);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      {/* 1. Score Overview Card */}
      <div className="rounded-2xl border border-[rgba(212,175,55,0.25)] bg-[#12151F] p-6 sm:p-8 shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Big Average Rating Display */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#181C28] border-2 border-[rgba(212,175,55,0.35)] flex flex-col items-center justify-center text-center shadow-inner shrink-0 p-2">
              <span className="font-heading font-black text-3xl sm:text-4xl text-[#D4AF37] tracking-tight">
                {stats.averageRating !== null ? Number(stats.averageRating).toFixed(1) : "—"}
              </span>
              <span className="font-sans text-[10px] font-bold text-[#A69B82] uppercase tracking-wider">
                / 5.0
              </span>
              <div className="flex items-center gap-0.5 text-xs text-[#D4AF37] mt-1">
                {stats.averageRating !== null
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < Math.round(stats.averageRating || 0)
                            ? "text-[#D4AF37]"
                            : "text-[#3A4052]"
                        }
                      >
                        ★
                      </span>
                    ))
                  : Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-[#3A4052]">★</span>
                    ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="inline-flex items-center gap-2 self-center sm:self-start bg-[#181C28] border border-emerald-500/35 px-3 py-1 rounded-full text-emerald-400 font-sans text-[10px] font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                100% Verified Winner Reviews
              </div>

              <h2 className="font-heading text-xl sm:text-2xl font-black text-[#F4EBD9] uppercase tracking-tight">
                {stats.averageRating !== null
                  ? `${stats.averageRating.toFixed(1)} Host Rating`
                  : "No Reviews Yet"}
              </h2>

              <p className="font-sans text-xs text-[#A69B82] max-w-sm leading-relaxed">
                {totalReviewsCount > 0
                  ? `Based on ${totalReviewsCount} verified prize winners and audited competition completions.`
                  : "Only verified ticket entrants who have won competition prizes can leave reviews."}
              </p>
            </div>
          </div>

          {/* Interactive 1-5 Star Distribution Progress Bars */}
          <div className="flex flex-col gap-2 w-full max-w-md">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.breakdown[star as 1 | 2 | 3 | 4 | 5] || 0;
              const percentage = stats.percentages[star as 1 | 2 | 3 | 4 | 5] || 0;
              const isSelected = selectedRating === star;

              return (
                <button
                  key={star}
                  onClick={() => handleFilterClick(isSelected ? null : star)}
                  disabled={hasZeroReviews}
                  className={`group flex items-center gap-3 w-full py-1 px-2 rounded-lg transition-colors text-left cursor-pointer ${
                    isSelected ? "bg-[#181C28] border border-[rgba(212,175,55,0.4)]" : "hover:bg-[#181C28]/60"
                  }`}
                >
                  <span className="font-sans text-xs font-bold text-[#F4EBD9] w-8 shrink-0 flex items-center gap-1">
                    {star} <span className="text-[#D4AF37]">★</span>
                  </span>

                  {/* Bar */}
                  <div className="relative flex-1 h-2.5 rounded-full bg-[#181C28] overflow-hidden border border-[rgba(212,175,55,0.15)]">
                    <div
                      className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#D4AF37] to-[#B39042] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="font-mono text-xs text-[#A69B82] w-14 text-right shrink-0">
                    {percentage}% ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Filter Pills */}
      {!hasZeroReviews && (
        <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(212,175,55,0.15)] pb-4">
          <button
            onClick={() => handleFilterClick(null)}
            className={`h-[36px] px-4 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedRating === null
                ? "bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] shadow-[0_0_12px_rgba(212,175,55,0.35)]"
                : "border border-[rgba(212,175,55,0.2)] bg-[#12151F] text-[#A69B82] hover:border-[#D4AF37]/50 hover:text-[#F4EBD9]"
            }`}
          >
            All Reviews ({totalReviewsCount})
          </button>

          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.breakdown[star as 1 | 2 | 3 | 4 | 5] || 0;
            const isSelected = selectedRating === star;

            return (
              <button
                key={star}
                onClick={() => handleFilterClick(isSelected ? null : star)}
                className={`h-[36px] px-3.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] shadow-[0_0_12px_rgba(212,175,55,0.35)]"
                    : "border border-[rgba(212,175,55,0.2)] bg-[#12151F] text-[#A69B82] hover:border-[#D4AF37]/50 hover:text-[#F4EBD9]"
                }`}
              >
                <span>{star} ★</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Review Cards & Empty States */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#12151F] rounded-2xl border border-[rgba(212,175,55,0.2)]">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="font-sans text-xs text-[#A69B82]">Loading verified host reviews...</p>
        </div>
      ) : hasZeroReviews ? (
        /* Empty State: 0 total reviews */
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F] shadow-lg max-w-xl mx-auto w-full">
          <div className="w-16 h-16 rounded-2xl bg-[#181C28] border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-3xl mb-4 text-[#D4AF37] shadow-inner">
            ⭐
          </div>
          <h3 className="font-heading font-black text-xl sm:text-2xl text-[#F4EBD9] uppercase tracking-tight mb-2">
            No Host Reviews Yet
          </h3>
          <p className="font-sans text-xs sm:text-sm text-[#A69B82] leading-relaxed max-w-md">
            <strong className="text-[#F4EBD9]">{hostName}</strong> does not have any reviews yet. Only verified users who win competitions or instant prizes from this host are eligible to leave authentic ratings.
          </p>
        </div>
      ) : reviews.length === 0 ? (
        /* Empty State: 0 reviews matching selected star filter */
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F] shadow-lg max-w-md mx-auto w-full">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="font-heading font-black text-lg text-[#F4EBD9] uppercase tracking-tight mb-1">
            No {selectedRating}-Star Reviews
          </h3>
          <p className="font-sans text-xs text-[#A69B82] mb-5">
            There are currently no reviews matching this star rating filter.
          </p>
          <button
            onClick={() => handleFilterClick(null)}
            className="btn-gold-metallic px-5 py-2 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] cursor-pointer hover:scale-105 transition-all"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        /* Review Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((rev) => {
            const formattedDate = rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Recently";

            const initials = rev.reviewerName
              ? rev.reviewerName
                  .split(" ")
                  .filter(Boolean)
                  .map((w) => w[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()
              : "VW";

            return (
              <div
                key={rev.id}
                className="flex flex-col justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F] shadow-md transition-all hover:border-[#D4AF37]/50"
              >
                <div className="flex flex-col gap-3">
                  {/* Top: Avatar, Name, Date, Rating */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#181C28] border border-[rgba(212,175,55,0.3)] flex items-center justify-center overflow-hidden shrink-0">
                        {rev.reviewerAvatar ? (
                          <img
                            src={rev.reviewerAvatar}
                            alt={rev.reviewerName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-heading font-black text-xs text-[#D4AF37]">
                            {initials}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <span className="font-sans text-xs sm:text-sm font-bold text-[#F4EBD9]">
                          {rev.reviewerName}
                        </span>
                        <span className="font-sans text-[10px] text-[#A69B82]">
                          {formattedDate}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating Visual */}
                    <div className="flex items-center gap-0.5 text-xs text-[#D4AF37]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < rev.rating ? "text-[#D4AF37]" : "text-[#3A4052]"}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Prize Won & Competition Title */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#181C28]/80 border border-[rgba(212,175,55,0.15)]">
                    <span className="text-sm">🏆</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-sans text-[10px] text-[#A69B82] uppercase font-bold tracking-wider">
                        Won Prize:
                      </span>
                      <span className="font-heading font-bold text-xs text-[#D4AF37] truncate">
                        {rev.prizeWon}
                      </span>
                    </div>
                  </div>

                  {/* Review Comment */}
                  {rev.comment && (
                    <p className="font-sans text-xs sm:text-sm text-[#D6CEBC] leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  )}
                </div>

                {/* Footer: Verified Winner Badge */}
                <div className="flex items-center justify-between pt-3 border-t border-[rgba(212,175,55,0.1)] text-[10px]">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Verified Winner Entry
                  </span>

                  <span className="font-mono text-[#A69B82]">
                    Draw: {rev.competitionTitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
