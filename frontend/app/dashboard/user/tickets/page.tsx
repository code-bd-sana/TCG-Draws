"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { useMyTicketsQuery, useMyPendingOrdersQuery, usePayPendingOrderMutation } from "../../../../hooks/useTicketHooks";
import { Ticket } from "@/components/dashboard/TicketsTable";
import { UserTicketStatsCards } from "@/components/dashboard/user/UserTicketStatsCards";
import { UserTicketsTable } from "@/components/dashboard/user/UserTicketsTable";
import { UserTicketDetailsModal } from "@/components/dashboard/user/UserTicketDetailsModal";

export default function UserTicketsPage() {
  const [activeTab, setActiveTab] = useState<"tickets" | "pending">("tickets");
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  // Modal State
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: ticketsData,
    isLoading: isTicketsLoading,
    isError: isTicketsError,
    refetch: refetchTickets,
  } = useMyTicketsQuery();

  const {
    data: pendingOrdersData,
    isLoading: isPendingLoading,
    refetch: refetchPendingOrders,
  } = useMyPendingOrdersQuery();

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

  const formattedTickets: Ticket[] = backendTickets.map((t: any) => {
    let status: Ticket["status"] = "live";
    if (t.raffle?.status === "ENDED") {
      const hasWon = t.winners && t.winners.length > 0;
      status = hasWon ? "drawn-won" : "drawn-lost";
    } else {
      const hasInstantWin = t.winners?.some((w: any) => w.winType === "INSTANT_WIN");
      if (hasInstantWin) {
        status = "instant-win";
      }
    }
    const isAdminManual = t.transaction?.paymentGateway === "ADMIN_MANUAL";
    return {
      id: t.id,
      ticketId: `#TKT-${t.ticketNumber}`,
      competitionName: t.raffle?.title || "Exclusive Draw",
      purchaseDate: t.createdAt ? format(new Date(t.createdAt), "dd MMM yyyy") : "Recent",
      pricePaid: isAdminManual ? "Admin Assigned" : "Paid",
      status,
      raw: t,
    };
  });

  const totalOwned = formattedTickets.length;
  const activeTickets = formattedTickets.filter((t) => t.status === "live" || t.status === "instant-win").length;
  const wonTickets = formattedTickets.filter((t) => t.status === "drawn-won" || t.status === "instant-win").length;
  const unpaidOrdersCount = pendingOrders.length;

  const handleRefresh = () => {
    refetchTickets();
    refetchPendingOrders();
    toast.success("Tickets and pending orders synchronized");
  };

  return (
    <div className="relative flex flex-col gap-8 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn min-h-screen">
      {/* Ambient Art-Deco Lighting Background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Breadcrumb Navigation & Live Sync Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(212,175,55,0.15)] pb-5">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-muted">
          <Link href="/dashboard/user" className="hover:text-[#D4AF37] transition-colors">
            Dashboard
          </Link>
          <span className="text-[#D4AF37]/40">/</span>
          <span className="text-text-muted">User</span>
          <span className="text-[#D4AF37]/40">/</span>
          <span className="text-[#D4AF37]">Tickets & Orders</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Cryptographic Ledger Active</span>
          </div>

          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#141720] text-text-muted hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all cursor-pointer"
            title="Refresh Ledger"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
            Collector Allocation Ledger
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-text-primary uppercase tracking-tight mt-1">
            My Tickets &amp; Orders
          </h1>
          <p className="font-sans text-xs sm:text-sm text-text-muted mt-1 max-w-2xl">
            Track confirmed ticket certificates, inspect real-time draw countdowns, and settle pending checkout allocations.
          </p>
        </div>

        <Link href="/dashboard/user/competitions">
          <button className="btn-gold-metallic px-5 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">
            <span>Browse Competitions</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </Link>
      </div>

      {/* Warning Notification Banner for Unpaid Orders */}
      {unpaidOrdersCount > 0 && (
        <div className="art-deco-card p-5 rounded-2xl border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-[#141720] to-[#090A0E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl shrink-0">
              ⏳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  Payment Attention Required
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px]">
                  {unpaidOrdersCount} Pending
                </span>
              </div>
              <h3 className="text-sm font-heading font-black uppercase text-[#F5E5C0] mt-0.5">
                You have pending checkout allocations waiting for payment
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Complete your checkout before the competitions sell out and allocations expire.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("pending")}
            className="btn-gold-metallic px-5 py-2.5 rounded-xl text-xs font-heading font-black uppercase tracking-wider text-[#090A0E] shrink-0 cursor-pointer shadow-md"
          >
            Review Pending Orders →
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <UserTicketStatsCards
        totalOwned={totalOwned}
        activeTickets={activeTickets}
        wonTickets={wonTickets}
        unpaidOrdersCount={unpaidOrdersCount}
        onViewUnpaid={() => setActiveTab("pending")}
      />

      {/* Tab Switcher */}
      <div className="flex border-b border-[rgba(212,175,55,0.15)] gap-3 select-none">
        <button
          onClick={() => setActiveTab("tickets")}
          className={`py-3.5 px-5 text-xs sm:text-sm font-heading font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2.5 ${
            activeTab === "tickets"
              ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5 rounded-t-xl"
              : "border-transparent text-text-muted hover:text-text-primary hover:bg-white/5 rounded-t-xl"
          }`}
        >
          <span>🎟️ Confirmed Tickets</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
              activeTab === "tickets"
                ? "bg-[#D4AF37] text-[#090A0E]"
                : "bg-[#141720] border border-white/10 text-text-muted"
            }`}
          >
            {totalOwned}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("pending")}
          className={`py-3.5 px-5 text-xs sm:text-sm font-heading font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2.5 ${
            activeTab === "pending"
              ? "border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-xl"
              : "border-transparent text-text-muted hover:text-text-primary hover:bg-white/5 rounded-t-xl"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span>⏳ Pending / Unpaid Orders</span>
            {unpaidOrdersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
              unpaidOrdersCount > 0
                ? "bg-amber-500 text-[#090A0E] shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                : "bg-[#141720] border border-white/10 text-text-muted"
            }`}
          >
            {unpaidOrdersCount}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {isTicketsLoading && isPendingLoading ? (
        <div className="art-deco-card p-16 rounded-2xl flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="font-heading font-bold text-xs uppercase tracking-widest text-[#D4AF37] animate-pulse">
            Synchronizing Ticket Ledger...
          </p>
        </div>
      ) : isTicketsError ? (
        <div className="art-deco-card p-12 text-center rounded-2xl flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-heading font-black uppercase text-text-primary">
              Failed to load tickets ledger
            </h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm">
              An error occurred connecting to the ticket distribution ledger. Please retry.
            </p>
          </div>
          <button
            onClick={() => refetchTickets()}
            className="btn-gold-metallic px-6 py-2.5 rounded-xl text-xs font-heading font-black uppercase tracking-wider cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : activeTab === "tickets" ? (
        /* CONFIRMED TICKETS TAB */
        <UserTicketsTable
          tickets={formattedTickets}
          onSelectTicket={(ticket) => {
            setSelectedTicket(ticket);
            setIsModalOpen(true);
          }}
        />
      ) : (
        /* PENDING ORDERS TAB */
        <div className="flex flex-col gap-5">
          {pendingOrders.length === 0 ? (
            <div className="art-deco-card rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 text-3xl">
                ✓
              </div>
              <h3 className="font-heading font-black text-xl text-text-primary uppercase tracking-wide">
                No Pending Orders
              </h3>
              <p className="font-sans text-xs text-text-muted max-w-md leading-relaxed">
                You do not have any pending checkout allocations. When you select tickets for a competition, any unpaid reservations will safely appear here.
              </p>
              <Link href="/dashboard/user/competitions" className="mt-3">
                <button className="btn-gold-metallic px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] cursor-pointer">
                  Browse Competitions
                </button>
              </Link>
            </div>
          ) : (
            pendingOrders.map((order) => {
              const hasSoldOut = order.items?.some((i: any) => i.isSoldOut);
              const hasExpired = order.items?.some((i: any) => i.isExpired);
              const canPay = order.canPay && !hasSoldOut && !hasExpired;

              return (
                <div
                  key={order.id}
                  className="art-deco-card rounded-2xl p-5 sm:p-7 flex flex-col gap-5 shadow-xl transition-all"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(212,175,55,0.15)]">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono font-black text-xs text-[#D4AF37] bg-[#D4AF37]/10 border border-[rgba(212,175,55,0.25)] px-3 py-1.5 rounded-xl">
                        #{order.orderNumber ? order.orderNumber.slice(0, 16) : order.id.slice(0, 8)}
                      </span>
                      <span className="font-mono text-xs text-text-muted">
                        Initiated {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] uppercase font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Awaiting Payment
                      </span>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                      <div className="text-left md:text-right">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted block">
                          Total Due
                        </span>
                        <span className="font-heading font-black text-2xl text-[#D4AF37]">
                          £{Number(order.amount).toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => handlePayOrder(order.id)}
                        disabled={!canPay || payingOrderId === order.id}
                        className={`h-11 px-6 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          canPay
                            ? "btn-gold-metallic text-[#090A0E] shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]"
                            : "bg-[#141720] border border-white/10 text-text-muted cursor-not-allowed opacity-60"
                        }`}
                      >
                        {payingOrderId === order.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-[#090A0E] border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : canPay ? (
                          <>
                            <span>💳 Settle &amp; Checkout</span>
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
                    {order.items?.map((item: any) => (
                      <div
                        key={item.raffleId}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#090A0E]/60 border border-white/5 hover:border-[rgba(212,175,55,0.2)] transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#141720] shrink-0 border border-[rgba(212,175,55,0.2)]">
                            <Image
                              src={item.raffleImage || "/coming-soon-hero.jpg"}
                              alt={item.raffleTitle}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>

                          <div className="flex flex-col min-w-0">
                            <h4 className="font-heading font-black text-sm text-text-primary truncate">
                              {item.raffleTitle}
                            </h4>
                            <span className="font-mono text-xs text-text-muted">
                              {item.quantity} {item.quantity === 1 ? "ticket" : "tickets"} × £{Number(item.pricePerTicket).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Status Guard Badges */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                          {item.isSoldOut ? (
                            <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono font-bold text-xs">
                              🚫 Sold Out
                            </span>
                          ) : item.isExpired ? (
                            <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono font-bold text-xs">
                              ⛔ Draw Ended
                            </span>
                          ) : item.remainingTickets < item.quantity ? (
                            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold text-xs">
                              ⚠️ Only {item.remainingTickets} left
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-bold text-xs flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>Allocated ({item.remainingTickets} left)</span>
                            </span>
                          )}

                          <span className="font-heading font-black text-base text-[#F5E5C0] min-w-[70px] text-right">
                            £{Number(item.subtotal).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Informational Warning if Sold Out */}
                  {hasSoldOut && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                      <span className="text-base shrink-0">⚠️</span>
                      <span>
                        One or more competitions in this pending order reached total sellout capacity before checkout was completed.
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Draggable Ticket Certificate Details Modal */}
      <UserTicketDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        allTickets={formattedTickets}
      />
    </div>
  );
}
