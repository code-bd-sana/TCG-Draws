"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BillingHistoryItem } from "../../../../types/host-dashboard.types";
import { useAuthUser } from "../../../../hooks/useAuthHooks";

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BillingHistoryItem | null;
}

export default function InvoiceReceiptModal({
  isOpen,
  onClose,
  item,
}: InvoiceReceiptModalProps) {
  const [mounted, setMounted] = useState(false);
  const { data: user } = useAuthUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = item.invoice || `INV-${item.id.substring(0, 8).toUpperCase()}`;
  const hostFullName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Host Partner'
    : 'Host Partner';

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-receipt-content, #invoice-receipt-content * {
            visibility: visible;
          }
          #invoice-receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: #111827 !important;
            border: none !important;
            box-shadow: none !important;
            padding: 32px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-surface border border-border rounded-card w-full max-w-[620px] overflow-hidden shadow-card flex flex-col z-[10000] max-h-[90vh]">
        {/* Modal Toolbar (Non-printable) */}
        <div className="p-4 border-b border-divider flex items-center justify-between bg-elevated/70 no-print">
          <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-muted">
            Invoice Receipt Preview
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-glossy-red h-8 px-4 rounded-lg font-heading font-bold text-xs uppercase tracking-wider text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
              </svg>
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors p-1.5 rounded-lg hover:bg-surface cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Printable Receipt Container */}
        <div id="invoice-receipt-content" className="p-8 space-y-6 overflow-y-auto bg-surface text-text-primary">
          {/* Header & Fairway Draws Branding */}
          <div className="flex items-start justify-between border-b border-divider pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-2xl text-text-primary uppercase tracking-tight">
                  Fairway<span className="text-primary">Draws</span>
                </span>
              </div>
              <p className="font-sans text-xs text-text-muted mt-1">
                Official Golf Competitions &amp; Host Management
              </p>
              <p className="font-sans text-[11px] text-text-muted mt-0.5">
                Fairway Draws Ltd &bull; 124 Golf Links Way &bull; info@fairwaydraws.com
              </p>
            </div>

            <div className="text-right flex flex-col items-end gap-1">
              <span className="font-heading font-black text-xl text-text-brand uppercase tracking-tight">
                Receipt / Invoice
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success-bg border border-[#BBF7D0] text-success-text">
                ✓ PAID
              </span>
            </div>
          </div>

          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-2 gap-6 text-xs font-sans">
            <div>
              <span className="font-bold text-text-muted uppercase tracking-wider text-[10px] block mb-1">
                Billed To
              </span>
              <p className="font-heading font-bold text-sm text-text-primary">{hostFullName}</p>
              <p className="text-text-muted">{user?.email || 'Registered Host Member'}</p>
              <p className="text-text-muted">United Kingdom</p>
            </div>

            <div className="text-right space-y-1">
              <div>
                <span className="text-text-muted">Invoice No: </span>
                <strong className="font-mono text-text-primary">{invoiceNumber}</strong>
              </div>
              <div>
                <span className="text-text-muted">Issue Date: </span>
                <strong className="text-text-primary">{item.date}</strong>
              </div>
              <div>
                <span className="text-text-muted">Payment Method: </span>
                <span className="text-text-primary font-medium">Cashflows Checkout</span>
              </div>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-elevated border-b border-divider font-sans font-bold text-[11px] text-text-muted uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-4 text-center">Period</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider font-sans">
                <tr>
                  <td className="py-4 px-4 font-medium text-text-primary">
                    <p className="font-bold">{item.description}</p>
                    <p className="text-[11px] text-text-muted">Monthly access to reduced platform fees and host features</p>
                  </td>
                  <td className="py-4 px-4 text-center text-text-muted">
                    1 Month
                  </td>
                  <td className="py-4 px-4 text-right font-heading font-bold text-text-primary">
                    £{item.amount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-xs font-sans">
              <div className="flex justify-between text-text-muted">
                <span>Subtotal:</span>
                <span className="font-bold text-text-primary">£{item.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>VAT (0.0%):</span>
                <span>£0.00</span>
              </div>
              <div className="pt-2 border-t border-divider flex justify-between text-sm font-bold">
                <span className="font-heading uppercase text-text-primary">Total Paid:</span>
                <span className="font-heading font-black text-text-brand text-base">£{item.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Receipt Footer Note */}
          <div className="border-t border-divider pt-4 text-center text-[11px] font-sans text-text-muted">
            <p>Thank you for partnering with Fairway Draws. This document acts as an official payment receipt.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
