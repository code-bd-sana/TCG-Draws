import React from "react";
import { RaffleFormData } from "./CreateRaffleWizard";
import { cn } from "../../../../lib/utils";

interface Props {
  formData: RaffleFormData;
  onPrev: () => void;
  onPublish: () => void;
  isSubmitting?: boolean;
  commissionRate?: number;
}

export default function CreateRaffleStep6({
  formData,
  onPrev,
  onPublish,
  isSubmitting = false,
  commissionRate = 15,
}: Props) {
  // Calculate potential earnings
  const tickets = parseInt(formData.totalTickets) || 0;
  const price = parseFloat(formData.ticketPrice) || 0;
  const gross = tickets * price;
  const platformFee = gross * (commissionRate / 100);
  const net = gross - platformFee;

  return (
    <div className="flex flex-col w-full animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="font-heading font-black text-2xl text-text-primary uppercase tracking-tight">
          Review &amp; Publish
        </h2>
        <p className="font-sans text-sm text-text-muted">
          Review your competition details carefully before publishing live.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Basic Details Summary */}
        <div className="flex flex-col p-6 bg-elevated border border-border-medium rounded-card gap-4 shadow-xs">
          <h3 className="font-heading font-bold text-base text-text-primary uppercase tracking-tight border-b border-divider pb-2.5">
            Basic Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-sans font-bold text-[10px] uppercase tracking-wider text-text-muted">Title</span>
              <span className="font-heading font-bold text-sm text-text-primary">{formData.title || "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans font-bold text-[10px] uppercase tracking-wider text-text-muted">Category</span>
              <span className="font-sans font-semibold text-sm text-text-brand">{formData.category || "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans font-bold text-[10px] uppercase tracking-wider text-text-muted">Main Prize RRP Value</span>
              <span className="font-heading font-bold text-sm text-text-primary">{formData.mainPrizeValue ? `£${formData.mainPrizeValue}` : "—"}</span>
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <span className="font-sans font-bold text-[10px] uppercase tracking-wider text-text-muted">Description</span>
              <p className="font-sans text-xs text-text-muted leading-relaxed whitespace-pre-wrap">{formData.description || "—"}</p>
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="flex flex-col p-6 bg-elevated border border-border-medium rounded-card gap-4 shadow-xs">
          <h3 className="font-heading font-bold text-base text-text-primary uppercase tracking-tight border-b border-divider pb-2.5">
            Pricing &amp; Projections
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-sans font-bold text-[10px] uppercase tracking-wider text-text-muted">Total Tickets</span>
              <span className="font-heading font-bold text-base text-text-primary">{formData.totalTickets || "0"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans font-bold text-[10px] uppercase tracking-wider text-text-muted">Ticket Price</span>
              <span className="font-heading font-bold text-base text-text-primary">£{price.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans font-bold text-[10px] uppercase tracking-wider text-text-muted">Est. Platform Fee ({commissionRate}%)</span>
              <span className="font-heading font-bold text-base text-[#dc2626]">-£{platformFee.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans font-bold text-[10px] uppercase tracking-wider text-text-muted">Est. Net Earnings</span>
              <span className="font-heading font-black text-xl text-text-brand">£{net.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Schedule Summary */}
        <div className="flex flex-col p-6 bg-elevated border border-border-medium rounded-card gap-4 shadow-xs">
          <h3 className="font-heading font-bold text-base text-text-primary uppercase tracking-tight border-b border-divider pb-2.5">
            Schedule &amp; Rules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-sans font-bold text-[10px] uppercase tracking-wider text-text-muted">Start Date</span>
              <span className="font-sans font-medium text-xs text-text-primary">
                {formData.startDate ? new Date(formData.startDate).toLocaleString() : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans font-bold text-[10px] uppercase tracking-wider text-text-muted">Draw Date</span>
              <span className="font-sans font-medium text-xs text-text-primary">
                {formData.endDate ? new Date(formData.endDate).toLocaleString() : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-sans font-bold text-[10px] uppercase tracking-wider text-text-muted">Draw Mechanism</span>
              <span className={cn("font-heading font-bold text-xs uppercase", formData.isAutoDraw ? "text-text-brand" : "text-text-muted")}>
                {formData.isAutoDraw ? "Automatic Draw" : "Live Draw"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-divider">
        <button
          onClick={onPrev}
          className="h-[46px] px-6 bg-elevated border border-border hover:bg-surface text-text-primary transition-all rounded-xl font-heading font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          ← Back
        </button>
        <button
          onClick={onPublish}
          disabled={isSubmitting}
          className="btn-glossy-red h-[48px] px-8 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
        >
          <span>{isSubmitting ? "Publishing..." : "Publish Competition"}</span>
          {!isSubmitting && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
