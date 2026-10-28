"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useDraggableModal } from "@/hooks/useDraggableModal";

interface SupportTicketSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  email: string;
  subject: string;
}

export const SupportTicketSuccessModal: React.FC<SupportTicketSuccessModalProps> = ({
  isOpen,
  onClose,
  ticketId,
  email,
  subject,
}) => {
  const [copied, setCopied] = useState(false);

  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    resetKey: ticketId,
    onClose,
  });

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    toast.success("Ticket reference copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
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
        {/* Top Gold Line */}
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
                  ✓ Ticket Dispatched
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
                Support Reference
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-[#1C202B] border border-transparent hover:border-[rgba(212,175,55,0.2)] transition-all cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          {/* Main Success Graphic Card */}
          <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-[#090A0E] to-[#141720] border border-emerald-500/30 space-y-2 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl mx-auto shadow-sm">
              ✓
            </div>

            <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight mt-2">
              Ticket Logged Successfully
            </h3>

            <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
              Your inquiry has been queued with the collector support desk. A verification copy has been routed to your registered email.
            </p>
          </div>

          {/* Reference Card */}
          <div className="p-4 rounded-xl bg-[#090A0E]/70 border border-[rgba(212,175,55,0.2)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                Ticket Reference
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-mono text-[#D4AF37] hover:underline cursor-pointer"
              >
                {copied ? "✓ Copied" : "Copy Reference"}
              </button>
            </div>

            <div className="p-3 rounded-lg bg-[#141720] border border-white/5 font-mono font-bold text-sm text-[#F5E5C0] flex items-center justify-between">
              <span>{ticketId}</span>
              <span className="text-[10px] font-mono text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded">
                Active
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-text-muted">
                <span>Inquiry Topic:</span>
                <span className="text-text-primary font-medium">{subject}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Confirmation To:</span>
                <span className="text-text-primary font-medium">{email}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Expected Response:</span>
                <span className="text-[#D4AF37] font-semibold">Under 24 Hours</span>
              </div>
            </div>
          </div>

          {/* Urgent WhatsApp Escalation */}
          <div className="p-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] text-xl shrink-0">
                💬
              </div>
              <div>
                <h4 className="text-xs font-heading font-black uppercase text-[#F5E5C0]">
                  Urgent Draw Inquiry?
                </h4>
                <p className="text-[11px] text-text-muted">
                  Connect instantly with our on-call WhatsApp concierge desk.
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/447466347548?text=Hello%20TCG%20Draws%20Support%2C%20I%20have%20an%20urgent%20inquiry%20regarding%20ticket%20"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#25D366] text-[#090A0E] font-heading font-black text-xs uppercase tracking-wider shrink-0 cursor-pointer shadow-sm hover:opacity-90"
            >
              WhatsApp
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-[rgba(212,175,55,0.15)] bg-[#090A0E]/90 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-gold-metallic px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] cursor-pointer shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
};
