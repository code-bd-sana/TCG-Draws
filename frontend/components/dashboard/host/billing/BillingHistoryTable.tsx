"use client";

import React, { useState } from "react";
import { BillingHistoryItem } from "../../../../types/host-dashboard.types";
import InvoiceReceiptModal from "./InvoiceReceiptModal";

interface Props {
  history: BillingHistoryItem[];
}

export default function BillingHistoryTable({ history }: Props) {
  const [selectedItem, setSelectedItem] = useState<BillingHistoryItem | null>(null);

  return (
    <div className="w-full bg-surface border border-border rounded-card overflow-hidden flex flex-col shadow-card">
      
      {/* Header */}
      <div className="p-6 lg:p-8 border-b border-divider bg-surface">
        <h3 className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">
          Billing History
        </h3>
      </div>

      {/* Table Content */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-divider bg-elevated/70">
              <th className="py-4 px-6 lg:px-8 text-left font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                Date
              </th>
              <th className="py-4 px-6 lg:px-8 text-left font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                Description
              </th>
              <th className="py-4 px-6 lg:px-8 text-left font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                Amount
              </th>
              <th className="py-4 px-6 lg:px-8 text-left font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                Invoice / Reference
              </th>
              <th className="py-4 px-6 lg:px-8 text-right font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                Receipt
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr 
                key={item.id} 
                className={`
                  hover:bg-elevated/60 transition-colors
                  ${index !== history.length - 1 ? 'border-b border-divider' : ''}
                `}
              >
                <td className="py-5 px-6 lg:px-8 font-sans font-semibold text-xs text-text-muted">
                  {item.date}
                </td>
                <td className="py-5 px-6 lg:px-8 font-sans font-medium text-xs text-text-primary">
                  {item.description}
                </td>
                <td className="py-5 px-6 lg:px-8 font-heading font-bold text-sm text-text-brand">
                  £{item.amount.toFixed(2)}
                </td>
                <td className="py-5 px-6 lg:px-8 font-sans font-medium text-xs text-text-muted font-mono">
                  {item.invoice || item.id}
                </td>
                <td className="py-5 px-6 lg:px-8 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-accent-bg hover:bg-primary hover:text-white text-text-brand font-sans font-bold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    <span>View Receipt</span>
                  </button>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center font-sans text-sm text-text-muted">
                  No billing history recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <InvoiceReceiptModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
      
    </div>
  );
}
