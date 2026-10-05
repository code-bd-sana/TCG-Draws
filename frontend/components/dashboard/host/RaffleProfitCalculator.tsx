"use client";

import React, { useState } from "react";
import { cn } from "../../../lib/utils";

export default function RaffleProfitCalculator() {
  const [ticketPrice, setTicketPrice] = useState("5");
  const [totalTickets, setTotalTickets] = useState("500");
  const [costOfPrize, setCostOfPrize] = useState("350");
  const [commissionRate, setCommissionRate] = useState("10");

  const [grossRevenue, setGrossRevenue] = useState<number | null>(null);
  const [netProfit, setNetProfit] = useState<number | null>(null);

  const handleCalculate = () => {
    const price = parseFloat(ticketPrice) || 0;
    const tickets = parseFloat(totalTickets) || 0;
    const prize = parseFloat(costOfPrize) || 0;
    const commission = parseFloat(commissionRate) || 0;

    const gross = price * tickets;
    const commissionAmount = gross * (commission / 100);
    const net = gross - prize - commissionAmount;

    setGrossRevenue(gross);
    setNetProfit(net);
  };

  return (
    <div className="bg-surface border border-border rounded-card p-6 w-full flex flex-col gap-4 h-[380px] shrink-0 xl:w-[635px] shadow-card">
      <div className="w-full">
        <h2 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
          Competition Profit Calculator
        </h2>
      </div>

      <div className="w-full flex flex-col gap-3">
        {/* Row 1 */}
        <div className="flex gap-3 items-center">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="font-sans font-bold text-[10px] tracking-wider uppercase text-text-muted">
              Ticket Price (£)
            </label>
            <input
              type="text"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(e.target.value)}
              className="bg-elevated border border-border-medium rounded-xl h-[42px] px-[13px] font-sans font-bold text-sm text-text-primary outline-none focus:border-primary focus:bg-surface transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="font-sans font-bold text-[10px] tracking-wider uppercase text-text-muted">
              Total Tickets
            </label>
            <input
              type="text"
              value={totalTickets}
              onChange={(e) => setTotalTickets(e.target.value)}
              className="bg-elevated border border-border-medium rounded-xl h-[42px] px-[13px] font-sans font-bold text-sm text-text-primary outline-none focus:border-primary focus:bg-surface transition-all"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex gap-3 items-center">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="font-sans font-bold text-[10px] tracking-wider uppercase text-text-muted">
              Cost of Prize (£)
            </label>
            <input
              type="text"
              value={costOfPrize}
              onChange={(e) => setCostOfPrize(e.target.value)}
              className="bg-elevated border border-border-medium rounded-xl h-[42px] px-[13px] font-sans font-bold text-sm text-text-primary outline-none focus:border-primary focus:bg-surface transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="font-sans font-bold text-[10px] tracking-wider uppercase text-text-muted">
              Commission Rate (%)
            </label>
            <input
              type="text"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="bg-elevated border border-border-medium rounded-xl h-[42px] px-[13px] font-sans font-bold text-sm text-text-primary outline-none focus:border-primary focus:bg-surface transition-all"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleCalculate}
        className="w-full bg-primary hover:bg-primary-hover text-white transition-all h-[44px] rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-md active:scale-98 cursor-pointer"
      >
        <span className="font-heading font-bold text-sm tracking-wider uppercase">
          Calculate Profit
        </span>
      </button>

      <div className="border-t border-divider mt-auto pt-3 flex gap-4 items-center">
        <div className="flex flex-col flex-1 justify-between">
          <span className="font-sans font-bold text-[10px] tracking-wider uppercase text-text-muted">
            Gross Revenue
          </span>
          <span className="font-heading font-black text-xl text-text-primary">
            {grossRevenue !== null ? `£${grossRevenue.toLocaleString()}` : "—"}
          </span>
        </div>
        <div className="flex flex-col flex-1 justify-between">
          <span className="font-sans font-bold text-[10px] tracking-wider uppercase text-text-muted">
            Est. Net Profit
          </span>
          <span className="font-heading font-black text-xl text-text-brand">
            {netProfit !== null ? `£${netProfit.toLocaleString()}` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
