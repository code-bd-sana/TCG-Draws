"use client";

import React from "react";

export default function PaymentMethodCard() {
  return (
    <div className="w-full bg-surface border border-border rounded-card p-6 lg:p-8 flex flex-col gap-6 shadow-card">
      
      <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
        Payment Method
      </h3>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Card Details */}
        <div className="flex items-center gap-4">
          {/* Card Icon Container */}
          <div className="w-12 h-8 bg-accent-bg border border-border-medium rounded-lg flex items-center justify-center shadow-xs">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="font-heading font-bold text-sm text-text-primary tracking-widest">
              •••• •••• •••• 4242
            </span>
            <span className="font-sans font-medium text-xs text-text-muted">
              Expires 12/26
            </span>
          </div>
        </div>

        {/* Action */}
        <button className="h-[40px] px-5 bg-elevated border border-border hover:bg-surface text-text-primary font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all shrink-0 w-fit cursor-pointer">
          Update Card
        </button>

      </div>
      
    </div>
  );
}
