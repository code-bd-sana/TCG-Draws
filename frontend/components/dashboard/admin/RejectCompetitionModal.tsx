"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRejectRaffle } from "../../../hooks/useRaffleHooks";

interface RejectCompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitionData: { id: string; title: string } | null;
}

export default function RejectCompetitionModal({
  isOpen,
  onClose,
  competitionData,
}: RejectCompetitionModalProps) {
  const [reason, setReason] = useState("");
  const rejectMutation = useRejectRaffle();

  // Reset reason when modal opens for a new competition
  useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen, competitionData?.id]);

  if (!isOpen || !competitionData) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!competitionData?.id || rejectMutation.isPending) return;

    try {
      await rejectMutation.mutateAsync({
        id: competitionData.id,
        reason: reason.trim() || undefined,
      });
      toast.success("Competition rejected. Feedback sent to host.");
      setReason("");
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to reject competition"
      );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!rejectMutation.isPending) onClose();
        }}
      />

      {/* Modal Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[560px] bg-surface border border-border rounded-card shadow-card z-50 animate-fadeIn flex flex-col p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">
            Reason for Rejection
          </h2>
          <button
            onClick={onClose}
            disabled={rejectMutation.isPending}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Subtitle */}
        <div className="flex items-center gap-1.5 mb-5 bg-elevated border border-border-medium rounded-xl p-3.5">
          <span className="font-sans font-bold text-xs text-text-muted shrink-0">
            Rejecting Competition:
          </span>
          <span className="font-heading font-bold text-xs text-text-primary truncate">
            {competitionData.title}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Textarea */}
          <div className="w-full mb-6">
            <textarea
              rows={5}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={rejectMutation.isPending}
              placeholder="Describe the issue and what the host should change before resubmitting..."
              className="w-full bg-elevated border border-border-medium rounded-xl p-4 text-text-primary font-sans text-xs placeholder:text-text-muted outline-none focus:border-primary resize-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={rejectMutation.isPending}
              className="flex-1 h-11 rounded-xl border border-border bg-elevated hover:bg-surface text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rejectMutation.isPending}
              className="btn-glossy-red flex-1 h-11 rounded-xl text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {rejectMutation.isPending ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Sending Feedback...</span>
                </>
              ) : (
                "Send Feedback & Request Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
