"use client";

import React, { useState } from "react";
import { useCreateReviewMutation, useUpdateReviewMutation } from "@/hooks/useReviewHooks";
import { useDraggableModal } from "@/hooks/useDraggableModal";

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

  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    resetKey: winnerId,
    onClose,
  });

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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Draggable Modal Container */}
      <div
        ref={modalRef}
        style={modalStyle}
        className={`fixed top-1/2 left-1/2 w-[94vw] sm:w-[90vw] max-w-lg max-h-[92vh] art-deco-card rounded-2xl z-50 animate-fadeIn flex flex-col font-sans overflow-hidden transition-shadow ${
          isDragging
            ? "shadow-2xl ring-2 ring-[#D4AF37]/50 select-none cursor-grabbing"
            : "shadow-2xl border border-[rgba(212,175,55,0.35)]"
        }`}
      >
        {/* Top Gold Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent pointer-events-none" />

        {/* Drag Handle Header */}
        <div
          {...dragHandleProps}
          title="Click and drag to move window • Double-click to re-center"
          className={`flex items-center justify-between px-6 py-4 border-b border-[rgba(212,175,55,0.15)] bg-[#090A0E]/80 cursor-grab active:cursor-grabbing select-none touch-none transition-colors ${
            isDragging ? "bg-[#090A0E]" : ""
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="p-1 text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors shrink-0" title="Drag to move">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6h16.5" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-heading font-black tracking-widest uppercase text-emerald-400">
                  ★ Verified Winner Review
                </span>
                {isMoved && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetPosition();
                    }}
                    className="text-[9px] font-mono uppercase text-[#D4AF37] hover:underline tracking-wider cursor-pointer px-1.5 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20"
                    title="Double-click header or click to re-center"
                  >
                    (Reset)
                  </button>
                )}
              </div>
              <h2 className="text-base font-heading font-black text-text-primary uppercase tracking-wide truncate max-w-[280px] sm:max-w-[360px]">
                {isEditing ? "Edit Your Review" : "Leave Prize Review"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-[#1C202B] border border-transparent hover:border-[rgba(212,175,55,0.2)] transition-all cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          {/* Target Prize Summary */}
          <div className="p-3.5 rounded-xl bg-[#090A0E]/60 border border-[rgba(212,175,55,0.2)] space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block">
              Reviewing Prize Outcome
            </span>
            <p className="text-sm font-heading font-black text-[#F5E5C0] truncate">
              {prizeName}
            </p>
            <p className="text-xs font-mono text-text-muted">
              Hosted by <strong className="text-[#D4AF37]">{hostName}</strong> • {competitionTitle}
            </p>
          </div>

          {/* Feedback Toast */}
          {toastMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <span>✓</span> {toastMessage}
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span> {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Interactive Star Selection */}
            <div className="flex flex-col gap-2">
              <label className="font-heading font-black text-xs uppercase tracking-wider text-text-primary">
                Your Rating (1 to 5 Stars) <span className="text-[#D4AF37]">*</span>
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
                      <span className={filled ? "text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" : "text-white/20"}>
                        ★
                      </span>
                    </button>
                  );
                })}
                <span className="font-mono font-black text-sm text-[#D4AF37] ml-2">
                  {hoverRating || rating} / 5
                </span>
              </div>
            </div>

            {/* Feedback Textarea */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
                  Collector Feedback (Optional)
                </label>
                <span className="font-mono text-[10px] text-text-muted">
                  {comment.length} / 500
                </span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                rows={4}
                placeholder="Share your experience regarding host communication, prize condition, packaging and dispatch speed..."
                className="input-obsidian w-full p-3.5 text-xs rounded-xl focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(212,175,55,0.15)]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#141720] text-xs font-heading font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold-metallic px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] shadow-md hover:scale-105 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Submitting..." : isEditing ? "Update Review" : "Publish Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
