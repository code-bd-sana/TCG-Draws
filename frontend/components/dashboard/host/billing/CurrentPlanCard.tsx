"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useMySubscription, useCancelSubscriptionMutation } from "../../../../hooks/useSubscriptionHooks";

export default function CurrentPlanCard() {
  const { data: subscription, isLoading, refetch } = useMySubscription();
  const cancelMutation = useCancelSubscriptionMutation();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    if (confirm("Are you sure you want to cancel your subscription?")) {
      setIsCancelling(true);
      try {
        await cancelMutation.mutateAsync();
        toast.success('Subscription cancelled successfully.');
        refetch();
      } catch (err) {
        toast.error('Failed to cancel subscription.');
      } finally {
        setIsCancelling(false);
      }
    }
  };

  if (isLoading) {
    return <div className="p-6 bg-surface border border-border rounded-card text-text-muted font-sans text-sm animate-pulse">Loading subscription status...</div>;
  }

  if (!subscription || subscription.status !== 'ACTIVE') {
    return (
      <div className="w-full bg-surface border border-border rounded-card p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-card">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">
            No Active Subscription
          </h2>
          <p className="font-sans font-semibold text-xs text-[#DC2626]">
            {subscription?.status === 'CANCELLED' ? 'Your subscription was cancelled.' : 'You do not have an active host plan.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href="/pricing" 
            className="btn-glossy-red h-[42px] flex items-center justify-center px-6 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white transition-all shadow-md active:scale-98"
          >
            Subscribe Now
          </a>
        </div>
      </div>
    );
  }

  const endDate = new Date(subscription.endDate);
  const startDate = new Date(subscription.startDate);
  const formattedEndDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(endDate);
  const formattedStartDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(startDate);
  const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
  const tx = subscription.transaction;

  return (
    <div className="w-full bg-surface border border-border rounded-card p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-card">
      
      {/* Plan Details */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h2 className="font-heading font-black text-xl text-text-primary uppercase tracking-tight">
            Current Plan: {subscription.plan.name}
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-success-bg border border-[#BBF7D0] text-success-text font-bold text-[10px] uppercase">
            Active
          </span>
        </div>
        <p className="font-heading font-bold text-sm text-text-brand">
          £{subscription.plan.price}/month · Renews {formattedEndDate} ({remainingDays} days remaining)
        </p>
        <div className="font-sans text-xs text-text-muted mt-2 space-y-1">
          <p><strong className="text-text-primary">Start Date:</strong> {formattedStartDate}</p>
          <p><strong className="text-text-primary">Payment Status:</strong> <span className="text-text-brand font-bold">{tx?.status || 'COMPLETED'}</span></p>
          {tx?.gatewayTransactionId && <p><strong className="text-text-primary">Transaction ID:</strong> {tx.gatewayTransactionId}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 shrink-0">
        <button 
          onClick={handleCancel} 
          disabled={isCancelling}
          className="font-sans font-bold text-xs uppercase tracking-wider text-[#DC2626] hover:text-[#B91C1C] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
        </button>
      </div>
      
    </div>
  );
}
