"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useHostDashboardReviewsQuery, useFlagReviewMutation } from "@/hooks/useReviewHooks";

export default function HostReviewsDashboardPage() {
  const { data, isLoading, isError, refetch } = useHostDashboardReviewsQuery();
  const flagMutation = useFlagReviewMutation();
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const metrics = data?.metrics || {
    averageRating: null,
    totalReviews: 0,
    satisfactionRate: null,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    percentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  const allReviews = data?.reviews || [];
  const displayedReviews = filterRating
    ? allReviews.filter((r) => r.rating === filterRating)
    : allReviews;

  const handleFlagReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to flag this review for administrator review?")) {
      return;
    }

    try {
      setFlaggingId(reviewId);
      await flagMutation.mutateAsync({ reviewId, reason: "Flagged by host from dashboard" });
      await refetch();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to flag review. Please try again.");
    } finally {
      setFlaggingId(null);
    }
  };

  return (
    <div className="flex-1 w-full px-[20px] lg:px-[40px] py-[24px] lg:py-[32px] flex flex-col gap-[28px] animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
            Reviews &amp; Ratings
          </h1>
          <p className="font-sans text-xs sm:text-sm text-text-muted mt-1">
            Genuine verified feedback and ratings submitted by prize winners of your competitions.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-surface border border-border hover:border-primary/50 text-xs font-heading font-bold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          ↻ Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border rounded-2xl shadow-card">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="font-sans text-xs text-text-muted">Loading your received reviews...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 bg-surface border border-red-500/30 rounded-2xl p-6 text-center shadow-card">
          <p className="font-sans text-sm font-semibold text-red-400">
            Failed to load reviews. Please refresh the page.
          </p>
        </div>
      ) : (
        <>
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Average Rating */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-card flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-sans text-xs font-bold text-text-muted uppercase tracking-wider">
                  Host Rating
                </span>
                <span className="font-heading font-black text-2xl lg:text-3xl text-primary">
                  {metrics.averageRating !== null ? `${Number(metrics.averageRating).toFixed(1)} / 5.0` : "—"}
                </span>
                <span className="font-sans text-[11px] text-text-muted">
                  {metrics.totalReviews > 0 ? `Based on ${metrics.totalReviews} winner reviews` : "No reviews yet"}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-elevated border border-border flex items-center justify-center text-xl text-primary">
                ★
              </div>
            </div>

            {/* Total Reviews */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-card flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-sans text-xs font-bold text-text-muted uppercase tracking-wider">
                  Total Reviews
                </span>
                <span className="font-heading font-black text-2xl lg:text-3xl text-text-primary">
                  {metrics.totalReviews}
                </span>
                <span className="font-sans text-[11px] text-emerald-400 font-semibold">
                  100% Verified Prize Entrants
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-elevated border border-border flex items-center justify-center text-xl text-emerald-400">
                ✓
              </div>
            </div>

            {/* Satisfaction Rate */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-card flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-sans text-xs font-bold text-text-muted uppercase tracking-wider">
                  Satisfaction Rate
                </span>
                <span className="font-heading font-black text-2xl lg:text-3xl text-text-primary">
                  {metrics.satisfactionRate !== null ? `${metrics.satisfactionRate}%` : "—"}
                </span>
                <span className="font-sans text-[11px] text-text-muted">
                  4 &amp; 5-star positive responses
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-elevated border border-border flex items-center justify-center text-xl text-[#D4AF37]">
                🏆
              </div>
            </div>
          </div>

          {/* Star Distribution Progress Bars */}
          {metrics.totalReviews > 0 && (
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-black text-sm uppercase tracking-wide text-text-primary">
                  Rating Breakdown
                </h3>
                {filterRating && (
                  <button
                    onClick={() => setFilterRating(null)}
                    className="font-sans text-xs text-primary hover:underline font-semibold cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = metrics.breakdown[star as 1 | 2 | 3 | 4 | 5] || 0;
                  const pct = metrics.percentages[star as 1 | 2 | 3 | 4 | 5] || 0;
                  const isSelected = filterRating === star;

                  return (
                    <button
                      key={star}
                      onClick={() => setFilterRating(isSelected ? null : star)}
                      className={`flex flex-col gap-1.5 p-3 rounded-xl border transition-all text-left cursor-pointer ${
                        isSelected
                          ? "bg-elevated border-primary shadow-xs"
                          : "bg-surface border-border hover:bg-elevated/70"
                      }`}
                    >
                      <div className="flex items-center justify-between font-sans text-xs font-bold text-text-primary">
                        <span>{star} ★</span>
                        <span className="text-text-muted font-mono">{pct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-elevated border border-border overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-sans text-[10px] text-text-muted">
                        {count} review{count === 1 ? "" : "s"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
                Winner Feedback {filterRating ? `(${filterRating} Stars)` : ""}
              </h2>
              <span className="font-sans text-xs text-text-muted">
                Showing {displayedReviews.length} of {allReviews.length}
              </span>
            </div>

            {allReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-2xl border border-dashed border-border bg-surface shadow-card">
                <div className="w-16 h-16 rounded-2xl bg-elevated border border-border flex items-center justify-center text-3xl mb-4 text-primary">
                  ⭐
                </div>
                <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight mb-2">
                  No Winner Reviews Received Yet
                </h3>
                <p className="font-sans text-xs text-text-muted max-w-md leading-relaxed">
                  Only verified ticket buyers who win your competition draws or instant prizes are eligible to leave reviews. Once winners review their prizes, they will be listed here.
                </p>
              </div>
            ) : displayedReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-border bg-surface shadow-card">
                <p className="font-sans text-xs text-text-muted mb-4">
                  No reviews found matching the {filterRating}-star filter.
                </p>
                <button
                  onClick={() => setFilterRating(null)}
                  className="btn-gold-metallic px-4 py-2 rounded-xl font-heading text-xs uppercase tracking-wider text-black font-bold"
                >
                  View All Reviews
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedReviews.map((rev) => {
                  const isFlagged = rev.status === "FLAGGED";

                  return (
                    <div
                      key={rev.id}
                      className="flex flex-col justify-between gap-4 p-5 rounded-2xl border border-border bg-surface shadow-card hover:border-primary/40 transition-colors"
                    >
                      <div className="flex flex-col gap-3">
                        {/* Header: Reviewer & Date & Rating */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-elevated border border-border flex items-center justify-center overflow-hidden shrink-0">
                              {rev.reviewerAvatar ? (
                                <img
                                  src={rev.reviewerAvatar}
                                  alt={rev.reviewerName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="font-heading font-black text-xs text-primary">
                                  {rev.reviewerName.substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-sans text-xs font-bold text-text-primary">
                                {rev.reviewerName}
                              </span>
                              <span className="font-sans text-[10px] text-text-muted">
                                {new Date(rev.createdAt).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 text-xs text-primary">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={i < rev.rating ? "text-primary" : "text-border"}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Competition & Prize Info */}
                        <div className="p-2.5 rounded-xl bg-elevated border border-border flex items-center gap-2">
                          <span className="text-sm">🏆</span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-sans text-[10px] text-text-muted font-bold uppercase tracking-wider">
                              Won: {rev.prizeWon}
                            </span>
                            <Link
                              href={`/live-raffles/${rev.competitionSlug}`}
                              className="font-heading font-bold text-xs text-primary hover:underline truncate"
                            >
                              {rev.competitionTitle}
                            </Link>
                          </div>
                        </div>

                        {/* Comment */}
                        {rev.comment && (
                          <p className="font-sans text-xs text-text-secondary leading-relaxed italic">
                            "{rev.comment}"
                          </p>
                        )}
                      </div>

                      {/* Footer: Status badge & Moderation */}
                      <div className="flex items-center justify-between pt-3 border-t border-divider text-[10px]">
                        <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Verified Winner Entry
                        </span>

                        {isFlagged ? (
                          <span className="font-bold text-amber-400 uppercase tracking-wider">
                            Flagged for Moderation
                          </span>
                        ) : (
                          <button
                            onClick={() => handleFlagReview(rev.id)}
                            disabled={flaggingId === rev.id}
                            className="font-sans text-text-muted hover:text-red-400 font-semibold cursor-pointer transition-colors"
                          >
                            {flaggingId === rev.id ? "Flagging..." : "Flag Review"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
