"use client";

import React, { useState } from "react";
import { Winner, winnerService } from "../../../services/winner.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface VerifyWinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  winner: Winner | null;
}

export default function VerifyWinnerModal({ isOpen, onClose, winner }: VerifyWinnerModalProps) {
  const queryClient = useQueryClient();
  const [isPublishing, setIsPublishing] = useState(true);

  const mutation = useMutation({
    mutationFn: () => winnerService.verifyWinner(winner!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminWinners'] });
      queryClient.invalidateQueries({ queryKey: ['adminWinnersStats'] });
      onClose();
    },
  });

  if (!isOpen || !winner) return null;

  const name = `${winner.user?.firstName || ''} ${winner.user?.lastName || ''}`.trim() || 'Unknown';

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[500px] bg-surface border border-border rounded-card shadow-card z-50 animate-fadeIn flex flex-col p-6 lg:p-8 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">
            Verify & Publish Winner
          </h2>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors disabled:opacity-50 cursor-pointer"
            disabled={mutation.isPending}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Winner Info Box */}
        <div className="w-full bg-elevated border border-border-medium rounded-xl p-4 mb-6 flex flex-col gap-1">
          <span className="font-sans font-bold text-xs text-text-muted">Verified Winner</span>
          <span className="font-heading font-bold text-base text-text-primary">
            {name} — Ticket #{winner.ticket?.ticketNumber || 'N/A'}
          </span>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between mb-6 bg-surface border border-border rounded-xl p-4 shadow-xs">
          <span className="font-sans font-bold text-xs text-text-primary">Publish to Public Winners Leaderboard</span>
          {/* Custom Toggle Switch */}
          <div 
            onClick={() => setIsPublishing(!isPublishing)}
            className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors flex items-center px-0.5 ${isPublishing ? 'bg-primary' : 'bg-border-medium'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white absolute shadow-xs transform transition-transform ${isPublishing ? 'right-0.5' : 'left-0.5'}`} />
          </div>
        </div>

        {/* Submit Button */}
        <button 
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer active:scale-98"
        >
          {mutation.isPending ? 'Verifying & Publishing...' : 'Confirm & Publish Winner'}
        </button>

      </div>
    </>
  );
}
