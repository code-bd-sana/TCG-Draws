"use client";

import React, { useState } from "react";
import { useProcessRefundMutation } from "../../../hooks/useAdminHooks";
import { OrderData } from "../../../services/admin.service";

export type { OrderData };

interface ProcessRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderData | null;
}

export default function ProcessRefundModal({ isOpen, onClose, order }: ProcessRefundModalProps) {
  const [reason, setReason] = useState("");
  const { mutate: processRefund, isPending } = useProcessRefundMutation();

  if (!isOpen || !order) return null;

  const handleRefund = () => {
    processRefund(
      { transactionId: order.id, reason },
      {
        onSuccess: () => {
          setReason("");
          onClose();
        },
      }
    );
  };

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
            Process Customer Refund
          </h2>
          <button 
            onClick={onClose}
            disabled={isPending}
            className="text-text-muted hover:text-text-primary transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Order Info Box */}
        <div className="w-full bg-elevated border border-border-medium rounded-xl p-4 mb-6 flex flex-col gap-1">
          <span className="font-mono font-bold text-xs text-text-brand">Order #{order.orderId}</span>
          <span className="font-heading font-bold text-base text-text-primary">
            {order.buyerName} — £{order.amount.toFixed(2)}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {/* Refund Amount Input */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-bold text-xs text-text-muted">Refund Amount (Fixed Total)</label>
            <input 
              type="text" 
              readOnly
              value={`£${order.amount.toFixed(2)}`}
              className="h-11 bg-elevated border border-border-medium rounded-xl px-4 text-text-muted font-heading font-black text-sm outline-none cursor-not-allowed"
            />
          </div>

          {/* Reason Input */}
          <div className="flex flex-col gap-1.5 mb-2">
            <label className="font-sans font-bold text-xs text-text-muted">Reason for Refund (Optional)</label>
            <input 
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isPending}
              placeholder="e.g. Customer requested cancellation before draw"
              className="h-11 bg-elevated border border-border-medium rounded-xl px-4 text-text-primary font-sans text-xs outline-none focus:border-primary transition-colors disabled:opacity-50"
            />
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleRefund}
            disabled={isPending}
            className="btn-glossy-red w-full h-11 rounded-xl text-white font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-98 cursor-pointer"
          >
            {isPending ? "Processing Refund..." : "Confirm & Process Refund"}
          </button>
        </div>

      </div>
    </>
  );
}
