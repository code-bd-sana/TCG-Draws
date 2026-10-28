"use client";

import React, { useState } from "react";
import { useDraggableModal } from "../../../../hooks/useDraggableModal";
import { toast } from "sonner";

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TwoFactorSetupModal({
  isOpen,
  onClose,
}: TwoFactorSetupModalProps) {
  const [code, setCode] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const mockSecret = "JBSWY3DPEHPK3PXP";

  const {
    modalRef,
    isDragging,
    isMoved,
    dragHandleProps,
    modalStyle,
    resetPosition,
  } = useDraggableModal(isOpen, {
    onClose,
  });

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(mockSecret);
    setCopiedKey(true);
    toast.success("Secret key copied to clipboard");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      toast.success("Two-Factor Authentication activated successfully!");
      onClose();
    }, 1000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Draggable Modal Container */}
      <div
        ref={modalRef}
        style={modalStyle}
        className={`fixed top-1/2 left-1/2 w-[94vw] sm:w-[90vw] max-w-[500px] max-h-[92vh] art-deco-card rounded-card z-50 animate-fadeIn flex flex-col font-sans overflow-hidden transition-shadow select-none ${
          isDragging
            ? "shadow-2xl ring-2 ring-primary/40 select-none cursor-grabbing"
            : "shadow-2xl border border-primary/30"
        }`}
      >
        {/* Header - Drag Bar */}
        <div
          {...dragHandleProps}
          title="Click and drag to move window • Double-click to re-center"
          className={`flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-border bg-accent-bg/40 shrink-0 cursor-grab active:cursor-grabbing select-none touch-none transition-colors ${
            isDragging ? "bg-accent-bg/70" : ""
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <svg
              className="w-4 h-4 text-text-muted opacity-70 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
            </svg>
            <h2 className="font-heading font-black text-sm sm:text-base text-text-primary uppercase tracking-tight truncate">
              Two-Factor Authentication Setup
            </h2>
            {isMoved && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetPosition();
                }}
                className="text-[10px] font-mono text-text-brand hover:underline cursor-pointer ml-1.5 shrink-0 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20"
                title="Reset to center"
              >
                (Reset)
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-border bg-surface hover:bg-elevated text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleVerify} className="flex flex-col min-h-0 flex-1">
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
            <p className="font-sans text-xs text-text-muted leading-relaxed">
              Scan this QR code with your authenticator app (Google Authenticator, 1Password, Authy), then enter the 6-digit confirmation code below.
            </p>

            {/* QR Mock Card */}
            <div className="p-4 rounded-xl bg-surface/90 border border-border flex flex-col items-center justify-center gap-3">
              <div className="w-36 h-36 bg-white rounded-lg p-2 flex items-center justify-center shadow-md">
                {/* SVG QR Code pattern */}
                <svg className="w-32 h-32 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm12 0h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4-6h6v2h-6v-2z" />
                </svg>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-sans text-text-muted">Manual Key:</span>
                <span className="font-mono font-bold text-text-brand">{mockSecret}</span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="text-[10px] font-bold text-text-brand hover:underline cursor-pointer"
                >
                  {copiedKey ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* 6-Digit Code Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
                Authenticator 6-Digit Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="123456"
                className="input-obsidian w-full h-11 px-4 text-center tracking-[0.5em] font-mono text-base font-bold text-text-primary placeholder:text-text-muted focus:outline-none transition-all shadow-sm"
                required
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-border bg-accent-bg/20 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              className="btn-dark-metallic h-9 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || code.length !== 6}
              className="btn-gold-metallic h-9 px-5 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
            >
              {isVerifying ? "Verifying..." : "Verify & Activate 2FA"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
