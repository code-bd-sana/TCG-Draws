import React from "react";
import { RaffleFormData } from "./CreateRaffleWizard";

interface Props {
  formData: RaffleFormData;
  updateForm: (data: Partial<RaffleFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function CreateRaffleStep2({ formData, updateForm, onNext, onPrev }: Props) {
  return (
    <div className="flex flex-col w-full animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="font-heading font-black text-2xl text-text-primary uppercase tracking-tight">
          Tickets &amp; Pricing
        </h2>
        <p className="font-sans text-sm text-text-muted">
          Set the parameters for your competition tickets and expected revenue.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Main Prize Value */}
        <div className="flex flex-col gap-2">
          <label className="font-sans font-bold text-xs uppercase tracking-wider text-text-muted">
            Main Prize Value (£)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-heading font-bold text-sm text-text-brand">
              £
            </span>
            <input
              type="number"
              step="0.01"
              value={formData.mainPrizeValue}
              onChange={(e) => updateForm({ mainPrizeValue: e.target.value })}
              placeholder="e.g. 1500.00"
              className="w-full h-[48px] pl-9 pr-4 bg-elevated border border-border-medium rounded-xl font-sans font-medium text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:bg-surface transition-all"
            />
          </div>
        </div>

        {/* Total Tickets */}
        <div className="flex flex-col gap-2">
          <label className="font-sans font-bold text-xs uppercase tracking-wider text-text-muted">
            Total Number of Tickets
          </label>
          <input
            type="number"
            value={formData.totalTickets}
            onChange={(e) => updateForm({ totalTickets: e.target.value })}
            placeholder="e.g. 500"
            className="h-[48px] px-4 bg-elevated border border-border-medium rounded-xl font-sans font-medium text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:bg-surface transition-all"
          />
        </div>

        {/* Ticket Price */}
        <div className="flex flex-col gap-2">
          <label className="font-sans font-bold text-xs uppercase tracking-wider text-text-muted">
            Ticket Price (£)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-heading font-bold text-sm text-text-brand">
              £
            </span>
            <input
              type="number"
              step="0.01"
              value={formData.ticketPrice}
              onChange={(e) => updateForm({ ticketPrice: e.target.value })}
              placeholder="e.g. 2.50"
              className="w-full h-[48px] pl-9 pr-4 bg-elevated border border-border-medium rounded-xl font-sans font-medium text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:bg-surface transition-all"
            />
          </div>
        </div>

        {/* Ticket Limits (Min & Max Per Person) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Minimum Tickets */}
          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-xs uppercase tracking-wider text-text-muted">
              Minimum Tickets Per Person (Optional)
            </label>
            <input
              type="number"
              min="1"
              value={formData.minTickets}
              onChange={(e) => updateForm({ minTickets: e.target.value })}
              placeholder="e.g. 1"
              className="h-[48px] px-4 bg-elevated border border-border-medium rounded-xl font-sans font-medium text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:bg-surface transition-all"
            />
            <span className="font-sans text-[11px] text-text-muted">
              Minimum tickets an entrant must buy per order (default: 1).
            </span>
          </div>

          {/* Maximum Tickets */}
          <div className="flex flex-col gap-2">
            <label className="font-sans font-bold text-xs uppercase tracking-wider text-text-muted">
              Maximum Tickets Per Person (Optional)
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxTickets || ""}
              onChange={(e) => updateForm({ maxTickets: e.target.value })}
              placeholder="e.g. 50"
              className="h-[48px] px-4 bg-elevated border border-border-medium rounded-xl font-sans font-medium text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:bg-surface transition-all"
            />
            <span className="font-sans text-[11px] text-text-muted">
              Cap the total tickets any single person can buy across all orders.
            </span>
          </div>
        </div>

        {formData.maxTickets &&
          formData.minTickets &&
          Number(formData.maxTickets) < Number(formData.minTickets) && (
            <p className="font-sans text-xs text-red-500 font-semibold">
              Maximum tickets per person cannot be less than the minimum tickets requirement.
            </p>
          )}

        {formData.maxTickets &&
          formData.totalTickets &&
          Number(formData.maxTickets) > Number(formData.totalTickets) && (
            <p className="font-sans text-xs text-red-500 font-semibold">
              Maximum tickets per person cannot exceed the total tickets available.
            </p>
          )}
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
          onClick={onNext}
          disabled={
            !formData.totalTickets ||
            !formData.ticketPrice ||
            (!!formData.maxTickets &&
              !!formData.minTickets &&
              Number(formData.maxTickets) < Number(formData.minTickets)) ||
            (!!formData.maxTickets &&
              !!formData.totalTickets &&
              Number(formData.maxTickets) > Number(formData.totalTickets))
          }
          className="btn-glossy-red h-[46px] px-8 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Next Step →</span>
        </button>
      </div>
    </div>
  );
}
