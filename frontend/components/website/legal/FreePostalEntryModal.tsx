"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { POSTAL_ENTRY_RULES } from "../../../config/postal-entry-rules.config";

interface FreePostalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  raffleTitle?: string;
}

export default function FreePostalEntryModal({
  isOpen,
  onClose,
  raffleTitle,
}: FreePostalEntryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const {
    title,
    subtitle,
    promoterName,
    promoterAddress,
    postcardDetails,
    rulesList,
    noticeText,
  } = POSTAL_ENTRY_RULES;

  const fullAddressString = `${promoterName}, ${promoterAddress.line1}, ${promoterAddress.line2}, ${promoterAddress.city}, ${promoterAddress.postcode}, ${promoterAddress.country}`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(fullAddressString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-surface border border-border rounded-card w-full max-w-[620px] overflow-hidden shadow-card flex flex-col z-[10000]">
        
        {/* Glow Header Accent */}
        <div className="h-1.5 w-full bg-primary" />

        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-divider bg-surface flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0 shadow-xs text-2xl">
              ✉️
            </div>
            <div>
              <h2 className="font-heading font-black text-xl sm:text-2xl text-text-primary uppercase tracking-tight leading-tight">
                {title}
              </h2>
              <p className="font-sans text-xs text-text-brand mt-0.5 font-bold">
                {raffleTitle ? (
                  <>Entering: <span className="text-text-primary underline font-bold">{raffleTitle}</span></>
                ) : (
                  "Free Postal Entry Route (UK Compliant)"
                )}
              </p>
            </div>
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

        {/* Body Scroll Area */}
        <div className="p-6 sm:p-7 space-y-5 overflow-y-auto max-h-[70vh] text-xs leading-relaxed text-text-secondary">
          
          {/* Legal Subtitle Banner */}
          <div className="bg-accent-bg border border-primary/30 rounded-xl p-4 text-text-primary font-medium">
            <p>{subtitle}</p>
          </div>

          {/* Postal Address Card */}
          <div className="bg-elevated border border-border-medium rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-text-brand">
                📬 Send Postal Entries To:
              </h3>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="px-3 py-1 rounded-lg bg-surface border border-border text-text-brand font-heading font-bold text-[11px] hover:bg-elevated transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copied ? "✓ Address Copied!" : "📋 Copy Address"}
              </button>
            </div>

            <div className="font-mono text-xs text-text-primary bg-surface p-4 rounded-xl border border-border space-y-1">
              <p className="font-bold text-text-brand">{promoterName}</p>
              <p>{promoterAddress.line1}</p>
              <p>{promoterAddress.line2}</p>
              <p>{promoterAddress.city}</p>
              <p className="font-bold">{promoterAddress.postcode}</p>
              <p className="text-text-muted">{promoterAddress.country}</p>
            </div>
          </div>

          {/* Required Postcard Details */}
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-text-brand">
              📝 Required Postcard Details:
            </h3>
            <p className="text-text-muted">
              Write the following details clearly on your postcard:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {postcardDetails.map((item, idx) => (
                <div key={idx} className="bg-surface border border-border p-2.5 rounded-xl flex items-center gap-2 text-xs font-sans font-semibold text-text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Postal Rules & Regulations */}
          <div className="space-y-2.5">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-text-brand">
              📜 Terms & Rules:
            </h3>
            <ul className="space-y-2">
              {rulesList.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-text-secondary">
                  <span className="font-bold text-text-brand">{idx + 1}.</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Notice Callout */}
          <div className="bg-elevated border border-border-medium rounded-xl p-4 text-[11px] text-text-muted font-medium">
            ℹ️ <strong>Notice:</strong> {noticeText}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-divider bg-elevated flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
          >
            I Understand & Close
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
