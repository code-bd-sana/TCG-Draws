"use client";

import React from "react";

interface UserSupportTopicCardsProps {
  onSelectTopic: (topicValue: string) => void;
}

export const UserSupportTopicCards: React.FC<UserSupportTopicCardsProps> = ({
  onSelectTopic,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1. Prize Claims & Delivery */}
      <div
        onClick={() => onSelectTopic("Prize Claim & Delivery")}
        className="art-deco-card p-5 rounded-2xl relative overflow-hidden group cursor-pointer hover:border-[#D4AF37] transition-all hover:-translate-y-1"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Prize Claims
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.004 0V5.625c0-.621-.504-1.125-1.125-1.125h-4.25c-.621 0-1.125.504-1.125 1.125v8.625m6.5 0h-6.5" />
            </svg>
          </div>
        </div>
        <h4 className="text-sm font-heading font-black text-text-primary uppercase group-hover:text-[#D4AF37] transition-colors">
          Dispatch &amp; Delivery
        </h4>
        <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
          Tracking inquiries, delivery address updates, or bank transfer claims.
        </p>
      </div>

      {/* 2. Questions about a Draw */}
      <div
        onClick={() => onSelectTopic("Questions about a Draw")}
        className="art-deco-card p-5 rounded-2xl relative overflow-hidden group cursor-pointer hover:border-[#D4AF37] transition-all hover:-translate-y-1"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Live Competitions
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-[#D4AF37]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h4 className="text-sm font-heading font-black text-text-primary uppercase group-hover:text-[#D4AF37] transition-colors">
          Draw Rules &amp; RNG
        </h4>
        <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
          Questions regarding draw dates, live video broadcasts, or ticket limits.
        </p>
      </div>

      {/* 3. Payment & Transactions */}
      <div
        onClick={() => onSelectTopic("Payment & Transaction Issue")}
        className="art-deco-card p-5 rounded-2xl relative overflow-hidden group cursor-pointer hover:border-[#D4AF37] transition-all hover:-translate-y-1"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Billing &amp; Checkout
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 002.25 19.5z" />
            </svg>
          </div>
        </div>
        <h4 className="text-sm font-heading font-black text-text-primary uppercase group-hover:text-emerald-400 transition-colors">
          Payments &amp; Orders
        </h4>
        <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
          Pending order resolution, invoice statements, and payment gateways.
        </p>
      </div>

      {/* 4. Live WhatsApp Concierge */}
      <a
        href="https://wa.me/447466347548?text=Hello%20TCG%20Draws%20Support%2C%20I%20need%20assistance%20with%20my%20account"
        target="_blank"
        rel="noopener noreferrer"
        className="art-deco-card p-5 rounded-2xl relative overflow-hidden group cursor-pointer hover:border-[#25D366] transition-all hover:-translate-y-1 block"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#25D366]/15 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Instant Help
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366]">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.285-.143-1.685-.832-1.944-.927-.258-.094-.447-.143-.636.143-.189.285-.733.927-.899 1.116-.165.189-.33.214-.615.071-2.034-1.021-3.376-1.815-4.717-4.116-.356-.612.356-.568.955-1.764.107-.214.054-.403-.027-.546-.081-.143-.636-1.534-.871-2.096-.229-.547-.462-.473-.636-.482-.165-.008-.354-.01-.543-.01s-.497.071-.757.356c-.26.285-1.002.979-1.002 2.387 0 1.408 1.025 2.769 1.168 2.96.143.189 2.018 3.081 4.889 4.321 2.871 1.24 2.871.827 3.39.771.519-.057 1.685-.688 1.921-1.354.236-.665.236-1.236.165-1.354-.071-.118-.26-.189-.545-.332z"/>
            </svg>
          </div>
        </div>
        <h4 className="text-sm font-heading font-black text-[#25D366] uppercase">
          Live WhatsApp Desk
        </h4>
        <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
          Fast-track communication via official WhatsApp concierge at 07466 347548.
        </p>
      </a>
    </div>
  );
};
