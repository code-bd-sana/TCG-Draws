"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRequestWithdrawalMutation } from "../../../../hooks/useHostWalletHooks";
import { cn } from "../../../../lib/utils";

interface RequestWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  commissionRate?: number;
}

export default function RequestWithdrawalModal({
  isOpen,
  onClose,
  availableBalance,
  commissionRate = 15,
}: RequestWithdrawalModalProps) {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Bank transfer details
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [sortCode, setSortCode] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const withdrawMutation = useRequestWithdrawalMutation();

  if (!isOpen || !mounted) return null;

  const numAmount = parseFloat(amount) || 0;
  const feeAmount = numAmount * (commissionRate / 100);
  const netAmount = numAmount - feeAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (numAmount < 10) {
      setErrorMessage("Minimum withdrawal amount is £10.00");
      return;
    }

    if (numAmount > availableBalance) {
      setErrorMessage(`Cannot withdraw more than your available balance (£${availableBalance.toFixed(2)})`);
      return;
    }

    if (!accountHolderName.trim() || !bankName.trim() || !accountNumber.trim()) {
      setErrorMessage("Please complete all required bank account fields.");
      return;
    }

    const payoutDetails = {
      accountHolderName: accountHolderName.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      sortCode: sortCode.trim(),
    };

    withdrawMutation.mutate(
      {
        amount: numAmount,
        payoutMethod: "BANK_TRANSFER",
        payoutDetails,
      },
      {
        onSuccess: () => {
          setSuccessMessage("Withdrawal request submitted successfully! Your payout is now in processing.");
          setTimeout(() => {
            setSuccessMessage(null);
            onClose();
          }, 2000);
        },
        onError: (err: any) => {
          setErrorMessage(err.response?.data?.message || err.message || "Failed to submit withdrawal request.");
        },
      }
    );
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-card w-full max-w-[540px] overflow-hidden shadow-card flex flex-col z-[10000]">
        
        {/* Header */}
        <div className="p-6 border-b border-divider flex items-center justify-between bg-surface">
          <div>
            <h3 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">
              Request Payout Withdrawal
            </h3>
            <p className="font-sans text-xs text-text-muted mt-0.5">
              Available Balance: <strong className="text-text-brand font-bold">£{availableBalance.toFixed(2)}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-xl hover:bg-elevated cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-xs font-sans font-semibold">
              ⚠️ {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] text-xs font-sans font-semibold">
              ✅ {successMessage}
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-sans font-bold text-text-muted uppercase tracking-wider">
              Withdrawal Amount (£)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-lg">£</span>
              <input
                type="number"
                step="0.01"
                min="10"
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-12 pl-9 pr-20 bg-elevated border border-border-medium rounded-xl text-text-primary font-heading text-lg font-bold focus:outline-none focus:border-primary transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setAmount(availableBalance.toString())}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-sans font-bold bg-accent-bg text-text-brand border border-primary/30 rounded-lg hover:bg-primary hover:text-white transition-all cursor-pointer"
              >
                Max
              </button>
            </div>
          </div>

          {/* Fee Breakdown Card */}
          <div className="bg-accent-bg border border-primary/30 rounded-xl p-4 space-y-2 text-xs font-sans">
            <div className="flex justify-between text-text-muted">
              <span>Requested Gross Amount:</span>
              <span className="font-bold text-text-primary">£{numAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#dc2626]">
              <span>Platform Fee ({commissionRate}%):</span>
              <span className="font-bold">-£{feeAmount.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-primary/20 flex justify-between text-sm font-bold">
              <span className="text-text-primary">Net Amount You Receive:</span>
              <span className="text-text-brand">£{netAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payout Method */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-sans font-bold text-text-muted uppercase tracking-wider">
              Payout Method
            </label>
            <div className="p-3.5 rounded-xl border-2 border-primary bg-surface text-text-brand shadow-xs font-sans text-xs font-bold flex items-center gap-2">
              <span>🏦</span>
              <span>Bank Transfer (Direct Settlement)</span>
            </div>
          </div>

          {/* Bank Transfer Details */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1 font-sans">Account Holder Name *</label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="e.g. John Doe / Business Ltd"
                className="w-full h-10 px-3.5 bg-elevated border border-border-medium rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1 font-sans">Bank Name *</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Barclays / HSBC"
                  className="w-full h-10 px-3.5 bg-elevated border border-border-medium rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1 font-sans">Sort Code / Routing</label>
                <input
                  type="text"
                  value={sortCode}
                  onChange={(e) => setSortCode(e.target.value)}
                  placeholder="e.g. 12-34-56"
                  className="w-full h-10 px-3.5 bg-elevated border border-border-medium rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted mb-1 font-sans">Account Number / IBAN *</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 12345678 or GB82 WEST 1234 5678"
                className="w-full h-10 px-3.5 bg-elevated border border-border-medium rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-divider">
            <button
              type="button"
              onClick={onClose}
              className="h-[42px] px-5 rounded-xl border border-border bg-elevated hover:bg-surface text-xs font-heading font-bold uppercase tracking-wider text-text-primary transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={withdrawMutation.isPending || numAmount <= 0}
              className="btn-glossy-red h-[42px] px-6 rounded-xl text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {withdrawMutation.isPending ? "Submitting..." : `Confirm & Withdraw £${netAmount.toFixed(2)}`}
            </button>
          </div>

        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
