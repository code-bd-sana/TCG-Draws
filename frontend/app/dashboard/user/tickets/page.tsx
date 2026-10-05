"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import TicketsTable, { Ticket } from "@/components/dashboard/TicketsTable";
import { useMyTicketsQuery, useMyPendingOrdersQuery, usePayPendingOrderMutation } from "../../../../hooks/useTicketHooks";
import { format } from "date-fns";
import { toast } from "sonner";

export default function UserTicketsPage() {
  const [activeTab, setActiveTab] = useState<"tickets" | "pending">("tickets");
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  const { data: ticketsData, isLoading: isTicketsLoading, isError: isTicketsError } = useMyTicketsQuery();
  const { data: pendingOrdersData, isLoading: isPendingLoading } = useMyPendingOrdersQuery();
  const payOrderMutation = usePayPendingOrderMutation();

  const backendTickets = ticketsData || [];
  const pendingOrders: any[] = pendingOrdersData || [];

  const handlePayOrder = async (orderId: string) => {
    setPayingOrderId(orderId);
    try {
      const res = await payOrderMutation.mutateAsync(orderId);
      if (res?.url) {
        toast.success("Redirecting to secure payment checkout...");
        window.location.href = res.url;
      } else {
        toast.success("Payment confirmed! Tickets allocated to your account.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setPayingOrderId(null);
    }
  };

  if (isTicketsLoading && isPendingLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] gap-3">
        <div className="w-9 h-9 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-sans text-xs font-semibold text-text-muted animate-pulse">
          Loading your tickets and orders...
        </p>
      </div>
    );
  }

  if (isTicketsError) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 font-sans text-sm font-semibold max-w-lg mx-auto my-12">
        Failed to load tickets. Please refresh the page or try again later.
      </div>
    );
  }

  const formattedTickets: Ticket[] = backendTickets.map((t: any) => {
    let status: Ticket["status"] = "live";
    if (t.raffle.status === "ENDED") {
      const hasWon = t.winners && t.winners.length > 0;
      status = hasWon ? "drawn-won" : "drawn-lost";
    } else {
      const hasInstantWin = t.winners?.some((w: any) => w.winType === 'INSTANT_WIN');
      if (hasInstantWin) {
        status = "instant-win";
      }
    }
    return {
      id: t.id,
      ticketId: `#TKT-${t.ticketNumber}`,
      competitionName: t.raffle.title,
      purchaseDate: format(new Date(t.createdAt), "dd MMM yyyy"),
      pricePaid: "Paid",
      status,
      raw: t,
    };
  });

  const totalOwned = formattedTickets.length;
  const activeTickets = formattedTickets.filter((t) => t.status === "live" || t.status === "instant-win").length;
  const wonTickets = formattedTickets.filter((t) => t.status === "drawn-won" || t.status === "instant-win").length;
  const unpaidOrdersCount = pendingOrders.length;

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-divider">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-2xs">
              🎟️
            </div>
            <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
              My Tickets &amp; Orders
            </h1>
          </div>
          <p className="font-sans text-xs text-text-muted">
            View all your confirmed ticket numbers, pending checkout orders, and competition outcomes.
          </p>
        </div>
      </div>

      {/* Warning notification banner if there are unpaid orders */}
      {unpaidOrdersCount > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 lg:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-950 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0 shadow-2xs">
              ⏳
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-heading font-black text-sm text-amber-950 uppercase tracking-tight">
                Attention Required ({unpaidOrdersCount} Unpaid {unpaidOrdersCount === 1 ? 'Order' : 'Orders'})
              </span>
              <span className="font-sans text-xs text-amber-900 font-medium">
                You have <strong className="font-bold text-amber-950 underline decoration-amber-600">{unpaidOrdersCount} pending order(s)</strong> waiting for checkout. Complete payment before tickets sell out!
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("pending")}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-md hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-0"
          >
            Review Unpaid Orders →
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full">
        
        {/* Total Tickets Owned */}
        <div className="bg-surface border border-border hover:border-border-medium rounded-2xl p-5 sm:p-6 flex flex-col gap-3 shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Confirmed Tickets
            </p>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 text-sm">
              🎟️
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-heading font-black text-3xl lg:text-4xl leading-none text-text-primary">
              {totalOwned}
            </p>
            <span className="font-sans font-semibold text-xs text-text-muted bg-elevated border border-border px-2.5 py-0.5 rounded-full">
              Lifetime entries
            </span>
          </div>
        </div>

        {/* Active Tickets */}
        <div className="bg-surface border border-border hover:border-border-medium rounded-2xl p-5 sm:p-6 flex flex-col gap-3 shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Live Draw Tickets
            </p>
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm">
              🎯
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-heading font-black text-3xl lg:text-4xl leading-none text-text-primary">
              {activeTickets}
            </p>
            <span className="font-sans font-bold text-xs text-text-brand bg-accent-bg border border-primary/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Awaiting draw
            </span>
          </div>
        </div>

        {/* Tickets in Won Competitions */}
        <div className="bg-surface border border-border hover:border-border-medium rounded-2xl p-5 sm:p-6 flex flex-col gap-3 shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Won Prizes
            </p>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 text-sm">
              🏆
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-heading font-black text-3xl lg:text-4xl leading-none text-text-primary">
              {wonTickets}
            </p>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-900 font-sans font-bold text-[11px]">
              🏆 {wonTickets} winning {wonTickets === 1 ? 'entry' : 'entries'}
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className={`bg-surface border rounded-2xl p-5 sm:p-6 flex flex-col gap-3 shadow-xs hover:shadow-card transition-all ${
          unpaidOrdersCount > 0 ? 'border-amber-500/40 bg-amber-500/10' : 'border-border hover:border-border-medium'
        }`}>
          <div className="flex items-center justify-between">
            <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Unpaid Orders
            </p>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 text-sm">
              ⏳
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <p className={`font-heading font-black text-3xl lg:text-4xl leading-none ${
              unpaidOrdersCount > 0 ? 'text-amber-800' : 'text-text-primary'
            }`}>
              {unpaidOrdersCount}
            </p>
            <span className={`font-sans font-bold text-xs px-2.5 py-0.5 rounded-full ${
              unpaidOrdersCount > 0 
                ? 'bg-amber-200 border border-amber-400 text-amber-950 font-black animate-pulse'
                : 'bg-elevated border border-border text-text-muted'
            }`}>
              {unpaidOrdersCount > 0 ? "⚠️ Payment Pending" : "✓ All Paid"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-divider gap-2 sm:gap-4 mt-3 select-none">
        <button
          onClick={() => setActiveTab("tickets")}
          className={`py-3.5 px-5 text-xs sm:text-sm font-heading font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2.5 focus:outline-none focus-visible:outline-none focus:ring-0 ${
            activeTab === "tickets"
              ? "border-primary text-text-brand bg-accent-bg/50 rounded-t-xl"
              : "border-transparent text-text-muted hover:text-text-primary hover:bg-elevated/40 rounded-t-xl"
          }`}
        >
          <span>🎟️ Confirmed Tickets</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            activeTab === "tickets"
              ? "bg-primary text-white"
              : "bg-elevated border border-border text-text-muted"
          }`}>
            {totalOwned}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("pending")}
          className={`py-3.5 px-5 text-xs sm:text-sm font-heading font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2.5 focus:outline-none focus-visible:outline-none focus:ring-0 ${
            activeTab === "pending"
              ? "border-amber-500 text-amber-900 bg-amber-500/10 rounded-t-xl"
              : "border-transparent text-text-muted hover:text-text-primary hover:bg-elevated/40 rounded-t-xl"
          }`}
        >
          <span className="flex items-center gap-1.5">
            ⏳ Pending / Unpaid Orders
            {unpaidOrdersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
            )}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              unpaidOrdersCount > 0
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-elevated border border-border text-text-muted"
            }`}
          >
            {unpaidOrdersCount}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "tickets" ? (
        <TicketsTable tickets={formattedTickets} />
      ) : (
        /* PENDING ORDERS TAB */
        <div className="flex flex-col gap-5">
          {pendingOrders.length === 0 ? (
            <div className="w-full bg-surface border border-border rounded-2xl p-12 lg:p-16 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl mb-1 shadow-2xs">
                🎉
              </div>
              <p className="font-heading font-bold text-lg text-text-primary">
                No Pending Orders
              </p>
              <p className="font-sans text-xs text-text-muted max-w-md leading-relaxed">
                You do not have any pending checkout orders. When you select tickets for a competition, any unpaid orders will safely be saved here.
              </p>
              <Link
                href="/live-raffles"
                className="mt-3 px-5 py-2.5 rounded-xl bg-primary text-white font-heading font-bold text-xs uppercase tracking-wider hover:bg-primary-hover transition-all shadow-md active:scale-95"
              >
                Browse Competitions
              </Link>
            </div>
          ) : (
            pendingOrders.map((order) => {
              const hasSoldOut = order.items.some((i: any) => i.isSoldOut);
              const hasExpired = order.items.some((i: any) => i.isExpired);
              const canPay = order.canPay && !hasSoldOut && !hasExpired;

              return (
                <div
                  key={order.id}
                  className="bg-surface border border-border hover:border-border-medium rounded-2xl p-5 sm:p-7 shadow-card flex flex-col gap-5 transition-all"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-divider">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="font-mono font-bold text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl shadow-2xs">
                        #{order.orderNumber ? order.orderNumber.slice(0, 16) : order.id.slice(0, 8)}
                      </span>
                      <span className="font-sans text-xs text-text-muted flex items-center gap-1">
                        📅 Initiated {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-amber-200 border border-amber-400 text-amber-950 font-sans font-black text-[10px] uppercase tracking-wider shadow-2xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                        ⏳ Awaiting Payment
                      </span>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-5 pt-2 md:pt-0 border-t md:border-t-0 border-divider">
                      <div className="text-left md:text-right">
                        <span className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider block">Total Due</span>
                        <span className="font-heading font-black text-2xl text-text-primary">
                          £{Number(order.amount).toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => handlePayOrder(order.id)}
                        disabled={!canPay || payingOrderId === order.id}
                        className={`h-[44px] px-6 rounded-xl font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer focus:outline-none focus:ring-0 ${
                          canPay
                            ? "btn-glossy-red text-white hover:scale-102 active:scale-98 shadow-md"
                            : "bg-elevated border border-border text-text-muted cursor-not-allowed opacity-60"
                        }`}
                      >
                        {payingOrderId === order.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : canPay ? (
                          <>
                            <span>💳 Pay Now</span>
                          </>
                        ) : hasSoldOut ? (
                          <span>🚫 Sold Out</span>
                        ) : (
                          <span>⛔ Expired</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="flex flex-col gap-3">
                    {order.items.map((item: any) => (
                      <div
                        key={item.raffleId}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-elevated/70 border border-divider hover:bg-elevated transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface shrink-0 border border-border-medium shadow-2xs">
                            <Image
                              src={item.raffleImage || "https://placehold.co/400x300/1a230a/8cb34a?text=Draw"}
                              alt={item.raffleTitle}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>

                          <div className="flex flex-col min-w-0 gap-0.5">
                            <h4 className="font-heading font-bold text-sm sm:text-base text-text-primary truncate" title={item.raffleTitle}>
                              {item.raffleTitle}
                            </h4>
                            <span className="font-sans font-semibold text-xs text-text-secondary">
                              {item.quantity} {item.quantity === 1 ? "ticket" : "tickets"} × £{Number(item.pricePerTicket).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Status Guard & High-Contrast Badges for this item */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-divider">
                          {item.isSoldOut ? (
                            <span className="px-3.5 py-1.5 rounded-full bg-red-100 text-red-950 border border-red-300 font-sans font-black text-xs flex items-center gap-1.5 shadow-2xs">
                              <span>🚫</span>
                              <span>SOLD OUT! Capacity reached.</span>
                            </span>
                          ) : item.isExpired ? (
                            <span className="px-3.5 py-1.5 rounded-full bg-red-100 text-red-950 border border-red-300 font-sans font-black text-xs flex items-center gap-1.5 shadow-2xs">
                              <span>⛔</span>
                              <span>Draw Ended</span>
                            </span>
                          ) : item.remainingTickets < item.quantity ? (
                            <span className="px-3.5 py-1.5 rounded-full bg-amber-200 text-amber-950 border border-amber-400 font-sans font-black text-xs flex items-center gap-1.5 shadow-2xs">
                              <span>⚠️</span>
                              <span>Only {item.remainingTickets} tickets left</span>
                            </span>
                          ) : (
                            <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 font-sans font-black text-xs flex items-center gap-1.5 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-700" />
                              <span>Tickets Available ({item.remainingTickets} left)</span>
                            </span>
                          )}

                          <span className="font-heading font-black text-base text-text-primary min-w-[70px] text-right">
                            £{Number(item.subtotal).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Informational warning if sold out */}
                  {hasSoldOut && (
                    <div className="p-3.5 rounded-xl bg-red-100 border border-red-300 text-red-950 text-xs flex items-center gap-2.5 font-bold">
                      <span className="text-base shrink-0">⚠️</span>
                      <span>
                        One or more competitions in this pending order reached capacity before payment was completed. You cannot checkout sold-out items.
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

