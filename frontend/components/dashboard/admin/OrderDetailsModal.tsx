"use client";

import React from "react";
import { createPortal } from "react-dom";
import { OrderData } from "../../../services/admin.service";
import { format } from "date-fns";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderData | null;
  onOpenRefund?: (order: OrderData) => void;
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  onOpenRefund,
}: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  const formattedDate = order.date
    ? format(new Date(order.date), "dd MMM yyyy HH:mm")
    : "N/A";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <span className="px-3 py-1 rounded-full border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D] font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">
            Paid
          </span>
        );
      case "Refunded":
        return (
          <span className="px-3 py-1 rounded-full border border-[#FECACA] bg-[#FEE2E2] text-[#DC2626] font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">
            Refunded
          </span>
        );
      case "Failed":
        return (
          <span className="px-3 py-1 rounded-full border border-[#FECACA] bg-[#FEE2E2] text-[#DC2626] font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full border border-border bg-elevated text-text-muted font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">
            {status}
          </span>
        );
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[580px] bg-surface border border-border rounded-card shadow-card z-10 flex flex-col p-6 lg:p-8 font-sans animate-fadeIn max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-divider mb-5">
          <div className="flex items-center gap-3">
            <h2 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">
              Order Details
            </h2>
            {getStatusBadge(order.status)}
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-elevated transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Order ID & Date Banner */}
        <div className="flex items-center justify-between p-4 bg-elevated border border-border-medium rounded-xl mb-5 shadow-xs">
          <div className="flex flex-col">
            <span className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider">Transaction Order ID</span>
            <span className="font-mono font-bold text-sm text-text-brand">#{order.orderId}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider">Purchase Date</span>
            <span className="font-sans font-semibold text-xs text-text-primary">{formattedDate}</span>
          </div>
        </div>

        {/* Buyer Profile Section */}
        <div className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl mb-5 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-accent-bg border-2 border-primary flex items-center justify-center shrink-0 shadow-xs">
            <span className="font-sans font-bold text-base text-text-brand">
              {order.buyerInitials || "U"}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <h3 className="font-heading font-bold text-sm text-text-primary truncate">
              {order.buyerName}
            </h3>
            {order.buyerEmail && (
              <span className="font-sans text-xs text-text-muted truncate">{order.buyerEmail}</span>
            )}
            {order.buyerPhone && order.buyerPhone !== "N/A" && (
              <span className="font-sans text-[11px] text-text-muted">Phone: {order.buyerPhone}</span>
            )}
          </div>
        </div>

        {/* Order Breakdown Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-surface border border-border-medium rounded-xl p-3.5 flex flex-col gap-1 shadow-xs">
            <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Competition</span>
            <span className="font-heading font-bold text-xs text-text-primary truncate" title={order.competition}>
              {order.competition}
            </span>
          </div>

          <div className="bg-surface border border-border-medium rounded-xl p-3.5 flex flex-col gap-1 shadow-xs">
            <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Amount Paid</span>
            <span className="font-heading font-black text-base text-text-brand">
              £{order.amount.toFixed(2)}
            </span>
          </div>

          <div className="bg-surface border border-border-medium rounded-xl p-3.5 flex flex-col gap-1 shadow-xs">
            <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Payment Method</span>
            <span className="font-sans font-semibold text-xs text-text-primary">
              {order.payment}
            </span>
          </div>

          <div className="bg-surface border border-border-medium rounded-xl p-3.5 flex flex-col gap-1 shadow-xs">
            <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">Tickets Count</span>
            <span className="font-heading font-bold text-sm text-text-primary">
              {order.tickets} Ticket{order.tickets === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* Ticket Numbers List */}
        {order.ticketNumbers && order.ticketNumbers.length > 0 && (
          <div className="flex flex-col gap-2 mb-6 bg-elevated border border-border-medium rounded-xl p-4">
            <span className="font-sans font-bold text-[10px] text-text-muted uppercase tracking-wider">
              Issued Ticket Numbers ({order.ticketNumbers.length})
            </span>
            <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
              {order.ticketNumbers.map((tNum, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-accent-bg border border-primary/20 text-text-brand font-mono font-bold text-xs shadow-xs"
                >
                  {tNum}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center gap-3 pt-2">
          {order.status === "Paid" && onOpenRefund && (
            <button
              onClick={() => {
                onClose();
                onOpenRefund(order);
              }}
              className="btn-glossy-red flex-1 h-11 rounded-xl text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer"
            >
              Refund Order
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl bg-surface border border-border hover:bg-elevated text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modalContent, document.body);
}
