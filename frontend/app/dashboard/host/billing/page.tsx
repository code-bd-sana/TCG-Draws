"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import CurrentPlanCard from "../../../../components/dashboard/host/billing/CurrentPlanCard";
import BillingHistoryTable from "../../../../components/dashboard/host/billing/BillingHistoryTable";
import { useMyBillingHistory, useMySubscription } from "../../../../hooks/useSubscriptionHooks";
import { paymentService } from "../../../../services/payment.service";
import { toast } from "sonner";

export default function SubscriptionBillingPage() {
  const searchParams = useSearchParams();
  const { data: rawHistory, isLoading, refetch: refetchHistory } = useMyBillingHistory();
  const { refetch: refetchSub } = useMySubscription();

  useEffect(() => {
    const status = searchParams.get("status");
    const orderNumber = searchParams.get("ordernumber") || searchParams.get("orderNumber");
    const paymentJobRef = searchParams.get("paymentJobReference") || searchParams.get("paymentJobRef");

    if (status === "success" || orderNumber || paymentJobRef) {
      paymentService
        .confirmPayment({ orderNumber: orderNumber || undefined, paymentJobRef: paymentJobRef || undefined })
        .then(() => {
          toast.success("Payment successful! Your subscription is now active.");
          refetchHistory();
          refetchSub();
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((err) => {
          console.error("Subscription payment confirmation error:", err);
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    } else if (status === "cancel") {
      toast.error("Payment was cancelled.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams, refetchHistory, refetchSub]);


  const history = rawHistory?.map((tx: any) => ({
    id: tx.id,
    date: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(tx.createdAt)),
    description: tx.type === 'SUBSCRIPTION_FEE' ? 'Subscription Payment' : tx.type,
    amount: Number(tx.amount),
    invoice: tx.gatewayTransactionId,
    status: (tx.status === 'COMPLETED' ? 'Paid' : tx.status === 'FAILED' ? 'Failed' : 'Pending') as 'Paid' | 'Pending' | 'Failed'
  })) || [];

  return (
    <div className="flex-1 w-full px-[20px] lg:px-[40px] py-[24px] lg:py-[32px] flex flex-col gap-[24px] animate-in fade-in zoom-in-95 duration-300">
      <CurrentPlanCard />
      {isLoading ? (
        <div className="p-8 bg-surface border border-border rounded-card text-text-muted font-sans text-sm animate-pulse shadow-card">
          Loading billing transaction history...
        </div>
      ) : (
        <BillingHistoryTable history={history} />
      )}
    </div>
  );
}
