import React from "react";

interface SalesMetricsData {
  totalGrossRevenue: number;
  totalNetRevenue: number;
  totalTicketsSold: number;
  activeCompetitions: number;
  totalCompetitions: number;
  avgRevenuePerRaffle: number;
  commissionRate?: number;
  netPercentage?: number;
}

interface Props {
  metrics?: SalesMetricsData;
}

export default function SalesMetricsCards({ metrics }: Props) {
  const commissionRate = metrics?.commissionRate ?? 15;
  const netPercentage = metrics?.netPercentage ?? (100 - commissionRate);

  const cards = [
    {
      id: "gross",
      label: "Total Gross Sales",
      value: `£${(metrics?.totalGrossRevenue || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Total ticket value",
      badge: "Gross",
      badgeColor: "bg-surface text-text-brand border-border",
    },
    {
      id: "net",
      label: `Net Earnings (${netPercentage}%)`,
      value: `£${(metrics?.totalNetRevenue || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `After ${commissionRate}% platform fee`,
      badge: "Net Payout",
      badgeColor: "bg-success-bg border-[#BBF7D0] text-success-text",
    },
    {
      id: "tickets",
      label: "Tickets Sold",
      value: (metrics?.totalTicketsSold || 0).toLocaleString("en-GB"),
      subtitle: "Across all competitions",
      badge: "Entries",
      badgeColor: "bg-accent-bg border border-primary/30 text-text-brand",
    },
    {
      id: "competitions",
      label: "Active Competitions",
      value: (metrics?.activeCompetitions || 0).toString(),
      subtitle: `Out of ${metrics?.totalCompetitions || 0} total`,
      badge: "Live Draws",
      badgeColor: "bg-surface text-text-primary border-border",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div 
          key={card.id}
          className="flex flex-col p-6 bg-surface border border-border rounded-card hover:border-border-medium transition-all shadow-card justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans font-bold text-xs uppercase tracking-wider text-text-muted">
              {card.label}
            </span>
            <span className={`font-sans font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
              {card.badge}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-heading font-black text-2xl lg:text-3xl text-text-primary leading-none">
              {card.value}
            </span>
            <span className="font-sans text-[11px] text-text-muted">
              {card.subtitle}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
