"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { raffleService } from "../../../services/raffle.service";
import { format } from "date-fns";
import { toast } from "sonner";

export interface TicketDetail {
  id: string;
  ticketNumber: number;
  raffleId: string;
  raffleTitle?: string;
  raffleCategory?: string;
  pricePerTicket?: number;
  buyerName?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userLocation?: string;
  transactionId?: string;
  gatewayTransactionId?: string;
  paymentGateway?: string;
  paymentStatus?: string;
  winStatus?: string;
  createdAt?: string;
}

export interface PendingOrderDetail {
  id: string;
  orderNumber: string;
  raffleId: string;
  raffleTitle: string;
  quantity: number;
  pricePerTicket: number;
  amount: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  paymentGateway: string;
  status: string;
  createdAt: string;
}

interface ViewSoldTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  raffle: {
    id: string;
    title: string;
    totalTickets: number;
    ticketsSold?: number;
    pricePerTicket?: number;
    category?: string;
  } | null;
}

export default function ViewSoldTicketsModal({
  isOpen,
  onClose,
  raffle,
}: ViewSoldTicketsModalProps) {
  const [activeTab, setActiveTab] = useState<"sold" | "pending">("sold");
  const [tickets, setTickets] = useState<TicketDetail[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrderDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Fetch sold tickets and pending orders when modal opens
  useEffect(() => {
    if (!isOpen || !raffle?.id) {
      setTickets([]);
      setPendingOrders([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      raffleService.getSoldTickets(raffle.id).catch(() => []),
      raffleService.getPendingOrders(raffle.id).catch(() => []),
    ])
      .then(([soldData, pendingData]) => {
        if (!isMounted) return;
        const mapped: TicketDetail[] = (soldData || []).map((t: any) => ({
          id: t.id,
          ticketNumber: t.ticketNumber,
          raffleId: t.raffleId || raffle.id,
          raffleTitle: t.raffleTitle || raffle.title,
          raffleCategory: t.raffleCategory || raffle.category,
          pricePerTicket: t.pricePerTicket || raffle.pricePerTicket,
          buyerName: t.buyerName || t.userName || (t.user ? `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() : 'N/A'),
          userName: t.userName || t.buyerName || (t.user ? `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() : 'N/A'),
          userEmail: t.userEmail || t.user?.email || 'N/A',
          userPhone: t.userPhone || t.user?.phone || 'N/A',
          userLocation: t.userLocation || t.user?.location || 'N/A',
          transactionId: t.transactionId || 'N/A',
          gatewayTransactionId: t.gatewayTransactionId || 'N/A',
          paymentGateway: t.paymentGateway || 'N/A',
          paymentStatus: t.paymentStatus || 'COMPLETED',
          winStatus: t.winStatus || (t.winners?.some((w: any) => w.winType === 'MAIN_DRAW') ? 'Main Winner' : t.winners?.some((w: any) => w.winType === 'INSTANT_WIN') ? 'Instant Winner' : 'Regular Entry'),
          createdAt: t.createdAt,
        }));
        setTickets(mapped);
        setPendingOrders(pendingData || []);
      })
      .catch(() => {
        if (!isMounted) return;
        toast.error("Failed to load tickets for this competition.");
        setTickets([]);
        setPendingOrders([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, raffle?.id]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !raffle) return null;

  const filteredTickets = tickets.filter((t) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const ticketNumStr = `#${t.ticketNumber}`.toLowerCase();
    const name = (t.buyerName || t.userName || "").toLowerCase();
    const email = (t.userEmail || "").toLowerCase();
    const tx = (t.transactionId || "").toLowerCase();
    return (
      ticketNumStr.includes(q) ||
      t.ticketNumber.toString().includes(q) ||
      name.includes(q) ||
      email.includes(q) ||
      tx.includes(q)
    );
  });

  const filteredPending = pendingOrders.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.orderNumber || "").toLowerCase().includes(q) ||
      (p.buyerName || "").toLowerCase().includes(q) ||
      (p.buyerEmail || "").toLowerCase().includes(q) ||
      (p.buyerPhone || "").toLowerCase().includes(q) ||
      (p.buyerAddress || "").toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    if (activeTab === "sold") {
      if (tickets.length === 0) {
        toast.info("No sold tickets to export.");
        return;
      }

      const headers = [
        "Ticket Number",
        "Competition Title",
        "Category",
        "Buyer / Client Name",
        "Buyer Email",
        "Buyer Phone",
        "Buyer Location",
        "Ticket Price (£)",
        "Win Status",
        "Transaction ID",
        "Gateway Transaction ID",
        "Payment Gateway",
        "Payment Status",
        "Purchase Date & Time"
      ];

      const rows = tickets.map((t) => {
        const ticketNum = `#${t.ticketNumber}`;
        const raffleTitle = t.raffleTitle || raffle.title || "N/A";
        const category = t.raffleCategory || raffle.category || "N/A";
        const buyerName = t.buyerName || t.userName || "N/A";
        const buyerEmail = t.userEmail || "N/A";
        const phone = t.userPhone || "N/A";
        const location = t.userLocation || "N/A";
        const price = Number(t.pricePerTicket || raffle.pricePerTicket || 0).toFixed(2);
        const winStatus = t.winStatus || "Regular Entry";
        const txId = t.transactionId || "N/A";
        const gatewayTxId = t.gatewayTransactionId || "N/A";
        const gateway = t.paymentGateway || "N/A";
        const payStatus = t.paymentStatus || "COMPLETED";
        const purchaseDate = t.createdAt ? format(new Date(t.createdAt), "dd MMM yyyy HH:mm:ss") : "N/A";

        return [
          ticketNum,
          raffleTitle,
          category,
          buyerName,
          buyerEmail,
          phone,
          location,
          price,
          winStatus,
          txId,
          gatewayTxId,
          gateway,
          payStatus,
          purchaseDate
        ];
      });

      const csvContent = [
        headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(","),
        ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);

      const safeTitle = String(raffle.title).toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
      link.setAttribute("download", `tickets_${safeTitle}_${new Date().toISOString().slice(0, 10)}.csv`);

      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${tickets.length} tickets successfully!`);
    } else {
      if (pendingOrders.length === 0) {
        toast.info("No pending entries to export.");
        return;
      }

      const headers = [
        "Order Reference",
        "Competition Title",
        "Buyer Name",
        "Buyer Email",
        "Buyer Phone",
        "Shipping Address",
        "Quantity",
        "Price Per Ticket (£)",
        "Total Amount (£)",
        "Payment Gateway",
        "Status",
        "Created Date & Time"
      ];

      const rows = pendingOrders.map((p) => {
        const orderRef = p.orderNumber || p.id;
        const title = p.raffleTitle || raffle.title;
        const name = p.buyerName || "N/A";
        const email = p.buyerEmail || "N/A";
        const phone = p.buyerPhone || "N/A";
        const address = p.buyerAddress || "N/A";
        const qty = p.quantity;
        const price = Number(p.pricePerTicket || raffle.pricePerTicket || 0).toFixed(2);
        const amount = Number(p.amount || 0).toFixed(2);
        const gateway = p.paymentGateway || "CASHFLOWS";
        const status = p.status || "PENDING";
        const date = p.createdAt ? format(new Date(p.createdAt), "dd MMM yyyy HH:mm:ss") : "N/A";

        return [
          orderRef,
          title,
          name,
          email,
          phone,
          address,
          qty,
          price,
          amount,
          gateway,
          status,
          date
        ];
      });

      const csvContent = [
        headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(","),
        ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);

      const safeTitle = String(raffle.title).toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
      link.setAttribute("download", `pending_orders_${safeTitle}_${new Date().toISOString().slice(0, 10)}.csv`);

      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${pendingOrders.length} pending orders successfully!`);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] bg-surface border border-border rounded-2xl sm:rounded-card shadow-card flex flex-col overflow-hidden text-text-primary z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-divider bg-surface">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-sans font-bold bg-accent-bg border border-primary/30 text-text-brand flex items-center gap-1 shrink-0">
                <span>🎟️</span>
                <span>Competition Entries</span>
              </span>
              <h2 className="font-heading font-black text-base sm:text-xl text-text-primary uppercase tracking-tight truncate max-w-full sm:max-w-[450px]" title={raffle.title}>
                {raffle.title}
              </h2>
            </div>
            <p className="font-sans text-[11px] sm:text-xs text-text-muted leading-relaxed">
              Total Confirmed Sold: <strong className="text-text-primary font-bold">{tickets.length}</strong> / {raffle.totalTickets} tickets
              {raffle.pricePerTicket && ` • £${Number(raffle.pricePerTicket).toFixed(2)} per ticket`}
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-divider">
            <button
              onClick={handleExportCSV}
              disabled={activeTab === "sold" ? tickets.length === 0 : pendingOrders.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-elevated border border-border-medium hover:bg-surface text-text-primary font-heading font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>Export {activeTab === "sold" ? "Tickets" : "Pending"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-elevated transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-divider bg-surface px-4 sm:px-6 gap-3">
          <button
            onClick={() => setActiveTab("sold")}
            className={`py-3 px-3 sm:px-4 text-xs font-heading font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "sold"
                ? "border-primary text-text-brand"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <span>Confirmed Sold</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-accent-bg border border-primary/20 text-text-brand font-bold">
              {tickets.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`py-3 px-3 sm:px-4 text-xs font-heading font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "pending"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <span>Pending / Unpaid</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                pendingOrders.length > 0
                  ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 font-bold"
                  : "bg-elevated text-text-muted"
              }`}
            >
              {pendingOrders.length}
            </span>
          </button>
        </div>

        {/* Toolbar (Search & View Toggle) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 px-4 sm:px-6 py-3 border-b border-divider bg-elevated">
          <div className="flex items-center h-[38px] w-full sm:w-[340px] bg-surface border border-border-medium rounded-xl px-3 focus-within:border-primary transition-all">
            <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder={activeTab === "sold" ? "Search ticket #, buyer name, email..." : "Search order ref, buyer name, email, address..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-text-primary text-xs placeholder:text-text-muted w-full ml-2 font-sans font-semibold"
            />
          </div>

          {activeTab === "sold" && (
            <div className="w-full sm:w-auto flex items-center justify-center gap-1 bg-surface p-1 rounded-xl border border-border">
              <button
                onClick={() => setViewMode("table")}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
                  viewMode === "table"
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                📋 Table View
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
                  viewMode === "grid"
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                🔢 Ticket Badges
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-h-[60vh] custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="font-sans text-xs text-text-muted">Loading competition entries...</p>
            </div>
          ) : activeTab === "sold" ? (
            /* SOLD TICKETS TAB CONTENT */
            filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-3xl mb-2">🎟️</span>
                <p className="font-heading font-bold text-sm text-text-primary mb-1">
                  {tickets.length === 0 ? "No tickets have been sold yet" : "No matching tickets found"}
                </p>
                <p className="font-sans text-xs text-text-muted">
                  {tickets.length === 0 ? "Tickets will appear here as soon as buyers enter this raffle." : "Try adjusting your search criteria."}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              /* Badges Grid View */
              <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-2.5">
                {filteredTickets.map((t) => {
                  const isMainWin = t.winStatus?.includes("Main");
                  const isInstantWin = t.winStatus?.includes("Instant");

                  let badgeColor = "bg-elevated border-border-medium text-text-primary hover:border-primary";
                  if (isMainWin) {
                    badgeColor = "bg-[#DCFCE7] border-[#BBF7D0] text-[#15803D] font-bold shadow-xs";
                  } else if (isInstantWin) {
                    badgeColor = "bg-[#FEF3C7] border-[#FDE68A] text-[#D97706] font-bold shadow-xs";
                  }

                  return (
                    <div
                      key={t.id}
                      title={`${t.buyerName || t.userName} (${t.userEmail})\nStatus: ${t.winStatus}`}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all hover:scale-105 cursor-pointer ${badgeColor}`}
                    >
                      <span className="font-sans font-bold text-xs">#{t.ticketNumber}</span>
                      <span className="font-sans text-[10px] text-text-muted truncate max-w-full">
                        {t.buyerName?.split(" ")[0] || "User"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Full Table View */
              <div className="w-full border border-border rounded-xl overflow-x-auto shadow-xs">
                <table className="w-full min-w-[650px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-divider bg-elevated text-text-muted font-sans font-bold text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-4">TICKET #</th>
                      <th className="py-3 px-4">BUYER / CLIENT NAME</th>
                      <th className="py-3 px-4">BUYER EMAIL</th>
                      <th className="py-3 px-4">PHONE</th>
                      <th className="py-3 px-4 text-center">WIN STATUS</th>
                      <th className="py-3 px-4 text-right">PURCHASE DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((t, idx) => {
                      const isMainWin = t.winStatus?.includes("Main");
                      const isInstantWin = t.winStatus?.includes("Instant");

                      return (
                        <tr
                          key={t.id}
                          className={`${idx !== filteredTickets.length - 1 ? "border-b border-divider" : ""} hover:bg-elevated/40 transition-colors`}
                        >
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-accent-bg border border-primary/30 text-text-brand font-mono font-bold text-[11px]">
                              #{t.ticketNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-text-primary">
                            {t.buyerName || t.userName || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-text-muted font-sans">
                            {t.userEmail || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-text-muted font-sans">
                            {t.userPhone || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isMainWin ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] text-[10px] font-bold shadow-xs">
                                🏆 Main Winner
                              </span>
                            ) : isInstantWin ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] text-[10px] font-bold shadow-xs">
                                ⚡ Instant Winner
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-elevated border border-border text-text-muted text-[10px] font-semibold">
                                Regular Entry
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right text-text-muted font-sans font-semibold">
                            {t.createdAt ? format(new Date(t.createdAt), "dd MMM yyyy HH:mm") : "N/A"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* PENDING / UNPAID TAB CONTENT */
            <div className="flex flex-col gap-4">
              {/* Notice Banner */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5 leading-relaxed">
                <span className="text-base shrink-0">⏳</span>
                <div>
                  <strong className="font-bold">Pending Payment Entries:</strong> These buyers have placed an order but have not completed payment yet. 
                  They are <strong className="underline">NOT counted</strong> towards total sold tickets ({tickets.length} / {raffle.totalTickets}). 
                  If this competition reaches 100% capacity or ends before they pay, their pending orders will be blocked from checkout.
                </div>
              </div>

              {filteredPending.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="text-3xl mb-2">✅</span>
                  <p className="font-heading font-bold text-sm text-text-primary mb-1">
                    {pendingOrders.length === 0 ? "No pending / unpaid entries" : "No matching pending entries found"}
                  </p>
                  <p className="font-sans text-xs text-text-muted">
                    {pendingOrders.length === 0
                      ? "All initiated orders for this competition have either completed payment or there are no uncompleted checkouts."
                      : "Try adjusting your search criteria."}
                  </p>
                </div>
              ) : (
                <div className="w-full border border-border rounded-xl overflow-x-auto shadow-xs">
                  <table className="w-full min-w-[700px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-divider bg-elevated text-text-muted font-sans font-bold text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-4">ORDER REF</th>
                        <th className="py-3 px-4">BUYER</th>
                        <th className="py-3 px-4">CONTACT & ADDRESS</th>
                        <th className="py-3 px-4 text-center">TICKETS</th>
                        <th className="py-3 px-4 text-right">AMOUNT</th>
                        <th className="py-3 px-4 text-center">PAYMENT STATUS</th>
                        <th className="py-3 px-4 text-right">INITIATED AT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPending.map((p, idx) => (
                        <tr
                          key={p.id}
                          className={`${idx !== filteredPending.length - 1 ? "border-b border-divider" : ""} hover:bg-elevated/40 transition-colors`}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-[11px] text-text-brand">
                            #{p.orderNumber ? p.orderNumber.slice(0, 14) : p.id.slice(0, 8)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-text-primary">{p.buyerName}</div>
                            <div className="text-[11px] text-text-muted">{p.buyerEmail}</div>
                          </td>
                          <td className="py-3 px-4 text-text-muted font-sans">
                            <div>{p.buyerPhone || "No phone"}</div>
                            <div className="text-[10px] text-text-muted truncate max-w-[200px]" title={p.buyerAddress}>
                              {p.buyerAddress || "No address provided"}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2.5 py-1 rounded-lg bg-elevated border border-border font-bold text-text-primary text-xs">
                              {p.quantity} {p.quantity === 1 ? "ticket" : "tickets"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-heading font-black text-text-primary">
                            £{Number(p.amount).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                              ⏳ Pending Payment
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-text-muted font-sans font-semibold">
                            {p.createdAt ? format(new Date(p.createdAt), "dd MMM yyyy HH:mm") : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-t border-divider bg-elevated">
          <p className="font-sans text-[11px] sm:text-xs text-text-muted">
            {activeTab === "sold" ? (
              <>
                Showing <span className="text-text-primary font-bold">{filteredTickets.length}</span> of {tickets.length} confirmed sold tickets
              </>
            ) : (
              <>
                Showing <span className="text-text-primary font-bold">{filteredPending.length}</span> of {pendingOrders.length} pending orders (not counted in sold tickets)
              </>
            )}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface border border-border hover:bg-elevated text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modalContent, document.body);
}
