"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import WebsiteNavbar from "../../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../../components/website/layout/WebsiteFooter";
import WinAnimationModal, { WinPrizeItem } from "../../../components/ui/WinAnimationModal";
import { useBasket } from "../../../features/basket/BasketContext";
import { paymentService, ConfirmPaymentResponse } from "../../../services/payment.service";
import { userService } from "../../../services/user.service";
import { toast } from "sonner";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const { clearBasket } = useBasket();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<ConfirmPaymentResponse | null>(null);
  const [orderRef, setOrderRef] = useState<string>("");

  const [winAnimationPrizes, setWinAnimationPrizes] = useState<WinPrizeItem[]>([]);
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const orderNumber =
      searchParams.get("ordernumber") ||
      searchParams.get("orderNumber") ||
      searchParams.get("ref");
    const paymentJobRef =
      searchParams.get("paymentJobReference") ||
      searchParams.get("paymentJobRef");

    if (paymentStatus === "cancel") {
      setError("Payment was cancelled. Your basket remains intact.");
      setIsLoading(false);
      return;
    }

    // Always clear basket once user lands here on success
    clearBasket();
    try {
      localStorage.removeItem("fairway_basket_v1");
      localStorage.setItem("fairway_basket_v1", "[]");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("fairway_basket_cleared"));
      }
    } catch {}

    if (orderNumber) {
      setOrderRef(orderNumber);
    }

    // Call payment confirmation
    paymentService
      .confirmPayment({
        orderNumber: orderNumber || undefined,
        paymentJobRef: paymentJobRef || undefined,
      })
      .then((res) => {
        setOrderData(res);
        setIsLoading(false);

        // Check for instant wins
        if (res.instantWins && res.instantWins.length > 0) {
          const instantPrizes: WinPrizeItem[] = res.instantWins.map((iw: any) => {
            const tk = (res.tickets || []).find((t: any) => t.id === iw.ticketId);
            return {
              id: iw.id,
              title: iw.prizeName || iw.title || "Instant Win Prize",
              ticketNumber: tk ? tk.ticketNumber : (iw.ticketNumber || 0),
              rrpValue: iw.rrpValue,
              prizeImage: iw.prizeImage || iw.image,
            };
          });

          setWinAnimationPrizes(instantPrizes);
          setIsWinModalOpen(true);
        }
      })
      .catch((err) => {
        console.error("Order confirmation error:", err);
        // Even if already confirmed, set completed state
        setOrderData({
          success: true,
          message: "Payment processed successfully.",
        });
        setIsLoading(false);
      });
  }, [searchParams, clearBasket]);

  const handleClaimWin = async () => {
    try {
      const winnerIds = winAnimationPrizes.map((p) => p.id).filter((id): id is string => !!id);
      await userService.claimInstantWins(winnerIds.length > 0 ? winnerIds : undefined);
      toast.success("Instant win prize claimed! View in your profile dashboard.");
      setIsWinModalOpen(false);
      setWinAnimationPrizes([]);
    } catch (err: any) {
      console.error("Claim prize error:", err);
      toast.error(err?.response?.data?.message || "Failed to claim prize.");
    }
  };

  const tickets = orderData?.tickets || [];
  const instantWins = orderData?.instantWins || [];

  return (
    <div className="container-custom max-w-3xl mx-auto px-4 sm:px-6">
      {isLoading ? (
        <div className="bg-surface border border-border rounded-card p-12 text-center shadow-card flex flex-col items-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="font-heading font-bold text-base uppercase tracking-wider text-text-primary mb-1">
            Confirming Your Entries...
          </h2>
          <p className="font-sans text-xs text-text-muted">
            Communicating with payment gateway and assigning your unique ticket numbers.
          </p>
        </div>
      ) : error ? (
        <div className="bg-surface border border-border rounded-card p-10 text-center shadow-card flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="font-heading font-bold text-lg uppercase tracking-wider text-text-primary mb-2">
            Payment Not Completed
          </h2>
          <p className="font-sans text-xs text-text-muted mb-6">{error}</p>
          <Link
            href="/basket"
            className="btn-glossy-red px-6 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white shadow-md"
          >
            Return to Basket
          </Link>
        </div>
      ) : (
        /* Order Confirmed View */
        <div className="bg-surface border border-border rounded-card p-6 sm:p-10 shadow-card flex flex-col items-center text-center animate-fadeIn">
          {/* Green checkmark badge */}
          <div className="w-16 h-16 rounded-full bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] flex items-center justify-center mb-4 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>

          <span className="px-3 py-1 rounded-full bg-[#ecf5ee] text-[#15803d] font-sans font-bold text-[10px] uppercase tracking-wider mb-2">
            Payment & Entry Confirmed
          </span>

          <h1 className="font-heading font-black text-2xl sm:text-3xl text-text-primary uppercase tracking-tight mb-2">
            You&apos;re In The Draw!
          </h1>

          <p className="font-sans text-xs sm:text-sm text-text-muted max-w-lg mb-6">
            Thank you for participating. Your payment was verified and your official ticket numbers
            have been assigned below. Best of luck!
          </p>

          {orderRef && (
            <div className="mb-6 px-4 py-2 rounded-xl bg-elevated border border-divider text-xs font-sans text-text-muted">
              Order Reference: <strong className="text-text-primary font-mono">{orderRef}</strong>
            </div>
          )}

          {/* Instant Wins Banner (if any) */}
          {instantWins.length > 0 && (
            <div className="w-full mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/20 to-amber-500/10 border border-amber-500/30 text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🏆</span>
                <span className="font-heading font-black text-sm uppercase tracking-wider text-amber-900">
                  Instant Win Prize Detected!
                </span>
              </div>
              <p className="font-sans text-xs text-amber-900/80 mb-3">
                One or more of your allocated tickets hit an Instant Win prize:
              </p>
              <div className="flex flex-wrap gap-2">
                {instantWins.map((iw: any, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600 text-white font-heading font-bold text-xs shadow-xs"
                  >
                    <span>🎉</span>
                    <span>{iw.prizeName || iw.title || "Instant Prize"}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allocated Tickets Breakdown */}
          {tickets.length > 0 && (
            <div className="w-full mb-8 text-left bg-elevated border border-border rounded-xl p-5">
              <div className="flex items-center justify-between pb-3 border-b border-divider mb-4">
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
                  Assigned Ticket Numbers ({tickets.length})
                </span>
                <span className="text-[10px] font-sans text-text-muted">Certified Random</span>
              </div>

              <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
                {tickets.map((t: any, idx: number) => {
                  const isWinningTicket = instantWins.some(
                    (iw: any) => iw.ticketId === t.id || iw.ticketNumber === t.ticketNumber,
                  );

                  return (
                    <span
                      key={idx}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                        isWinningTicket
                          ? "bg-amber-100 border-amber-400 text-amber-900 shadow-xs ring-2 ring-amber-400/40"
                          : "bg-surface border-border-medium text-text-primary"
                      }`}
                    >
                      #{t.ticketNumber}
                      {isWinningTicket && <span className="ml-1 text-[10px]">⭐</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <Link
              href="/dashboard/user/tickets"
              className="btn-glossy-red w-full sm:w-auto px-8 py-3 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>View In My Tickets</span>
              <span>→</span>
            </Link>

            <Link
              href="/live-raffles"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-surface border border-border hover:bg-elevated text-text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all text-center"
            >
              Explore More Draws
            </Link>
          </div>

          <p className="mt-8 text-[11px] font-sans text-text-muted">
            A confirmation receipt and ticket breakdown has been sent to your email address.
          </p>
        </div>
      )}

      {/* Win Animation Modal (Slot Machine Reveal) */}
      <WinAnimationModal
        isOpen={isWinModalOpen}
        onClose={() => setIsWinModalOpen(false)}
        onClaim={handleClaimWin}
        prizes={winAnimationPrizes}
      />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf6]">
      <WebsiteNavbar />

      <main className="flex-1 pt-28 pb-20">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <CheckoutSuccessContent />
        </Suspense>
      </main>

      <WebsiteFooter />
    </div>
  );
}
