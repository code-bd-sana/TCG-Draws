"use client";

import React, { useState } from "react";
import { useCreateReviewMutation, useUpdateReviewMutation } from "@/hooks/useReviewHooks";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  winnerId: string;
  prizeName: string;
  competitionTitle: string;
  hostName: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
  onSuccess?: () => void;
}

export default function WinnerReviewModal({
  isOpen,
  onClose,
  winnerId,
  prizeName,
  competitionTitle,
  hostName,
  existingReview,
  onSuccess,
}: ReviewModalProps) {
  const isEditing = !!existingReview;
  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(existingReview?.comment || "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const createMutation = useCreateReviewMutation();
  const updateMutation = useUpdateReviewMutation();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (rating < 1 || rating > 5) {
      setErrorMessage("Please select a star rating between 1 and 5.");
      return;
    }

    try {
      if (isEditing && existingReview) {
        await updateMutation.mutateAsync({
          reviewId: existingReview.id,
          payload: {
            rating,
            comment: comment.trim() || undefined,
          },
        });
        setToastMessage("Review updated successfully! Thank you.");
      } else {
        await createMutation.mutateAsync({
          winnerId,
          rating,
          comment: comment.trim() || undefined,
        });
        setToastMessage("Review submitted successfully! Thank you.");
      }

      setTimeout(() => {
        setToastMessage(null);
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit review. Please try again.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-[rgba(212,175,55,0.3)] bg-[#12151F] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Glow ambient */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-2xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 text-[#A69B82] hover:text-[#F4EBD9] p-1.5 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1 mb-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-400 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Verified Winner
            </span>
          </div>

          <h2 className="font-heading text-xl sm:text-2xl font-black text-[#F4EBD9] uppercase tracking-tight mt-1">
            {isEditing ? "Edit Your Review" : "Leave a Winner Review"}
          </h2>

          <p className="font-sans text-xs text-[#A69B82]">
            For prize: <strong className="text-[#F4EBD9]">{prizeName}</strong> hosted by{" "}
            <span className="text-[#D4AF37] font-semibold">{hostName}</span>
          </p>
        </div>

        {/* Feedback Toast */}
        {toastMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <span>✓</span> {toastMessage}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span> {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Interactive Star Selection */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#D6CEBC]">
              Rating (1 to 5 Stars) <span className="text-[#D4AF37]">*</span>
            </label>
            <div className="flex items-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl sm:text-3xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    aria-label={`${star} star`}
                  >
                    <span className={filled ? "text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" : "text-[#3A4052]"}>
                      ★
                    </span>
                  </button>
                );
              })}
              <span className="font-heading font-black text-sm text-[#D4AF37] ml-2">
                {hoverRating || rating} / 5
              </span>
            </div>
          </div>

          {/* Feedback Textarea */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#D6CEBC]">
                Your Feedback (Optional)
              </label>
              <span className="font-sans text-[10px] text-[#A69B82]">
                {comment.length} / 500
              </span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              rows={4}
              placeholder="How was your experience with this host, prize condition, and delivery dispatch?"
              className="w-full rounded-xl border border-[rgba(212,175,55,0.25)] bg-[#181C28] p-3 text-xs text-[#F4EBD9] placeholder:text-[#6D6555] focus:border-[#D4AF37] focus:outline-none transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(212,175,55,0.15)] mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#181C28] text-xs font-heading font-bold uppercase tracking-wider text-[#A69B82] hover:text-[#F4EBD9] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold-metallic px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] shadow-md hover:scale-105 active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
