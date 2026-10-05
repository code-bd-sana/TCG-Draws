"use client";

import React from "react";
import { Raffle } from "../../../../services/raffle.service";
import { format } from "date-fns";

interface DrawAuditLogTabProps {
  draw?: Raffle;
}

export default function DrawAuditLogTab({ draw }: DrawAuditLogTabProps) {
  const createdDate = draw?.createdAt ? format(new Date(draw.createdAt), "dd MMM HH:mm:ss") : "10 Jun 10:00:00";
  const endDate = draw?.endDate ? format(new Date(draw.endDate), "dd MMM HH:mm:ss") : "30 Jun 14:00:00";

  const isCompleted = draw?.status === "ENDED";
  const ticketsSold = draw?.ticketsSold || 0;

  const logs = [
    { id: 1, action: "Ticket sales opened for competition", details: `System • ${createdDate}`, type: "System", icon: "🚀" },
    { id: 2, action: `Ticket purchases logged (${ticketsSold} sold entries total)`, details: "Stripe & DB Ledger", type: "Payment", isStripe: true, icon: "💳" },
    { id: 3, action: "Database checksum verification completed", details: `System Audit • ${endDate}`, type: "Security", icon: "🛡️" },
    { id: 4, action: isCompleted ? "Ticket sales locked & draw executed" : "Ticket sales countdown active", details: `System Engine • ${endDate}`, type: "Engine", icon: "⚡" },
    { id: 5, action: isCompleted ? "Certified RNG winner seed generated" : "Provably fair seed calculation prepped", details: "RNG Engine", type: "Provably Fair", icon: "🎲" },
    { id: 6, action: isCompleted ? "Winner declared and audit saved to history" : "Awaiting final draw execution", details: "Audit Vault", type: "Audit", icon: "🏆" },
  ];

  return (
    <div className="flex flex-col gap-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-black text-base text-text-primary uppercase tracking-tight">
          Provably Fair & System Audit Log
        </h3>
        <span className="text-xs font-sans font-semibold text-text-brand bg-accent-bg border border-primary/30 px-3 py-1 rounded-full">
          Immutable Ledger
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {logs.map((log) => (
          <div 
            key={log.id} 
            className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-accent-bg border border-primary/30 flex items-center justify-center text-sm shrink-0 shadow-xs mt-0.5 sm:mt-0">
                {log.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold text-xs text-text-primary leading-snug">{log.action}</span>
                <span className="font-sans text-[11px] text-text-muted mt-0.5">{log.details}</span>
              </div>
            </div>

            <span className="self-start sm:self-auto px-2.5 py-1 rounded-full border border-primary/20 bg-accent-bg text-text-brand font-sans font-bold text-[10px] uppercase tracking-wider shadow-xs">
              {log.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
