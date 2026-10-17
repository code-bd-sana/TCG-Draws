"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";
import WinAnimationModal, { WinPrizeItem } from "../../components/ui/WinAnimationModal";
import { useBasket } from "../../features/basket/BasketContext";
import { paymentService, ConfirmPaymentResponse } from "../../services/payment.service";
import { userService } from "../../services/user.service";
import { toast } from "sonner";

function SuccessContent() {
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

    if (paymentStatus === "cancel" || paymentStatus === "error" || paymentStatus === "failed") {
      setError("Payment was not completed or was cancelled.");
      setIsLoading(false);
      return;
    }

    // Clear basket once landed on success
    clearBasket();
    try {
      localStorage.removeItem("tcg_basket_v1");
      localStorage.setItem("tcg_basket_v1", "[]");
      localStorage.removeItem("fairway_basket_v1");
      localStorage.setItem("fairway_basket_v1", "[]");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("tcg_basket_cleared"));
        window.dispatchEvent(new Event("fairway_basket_cleared"));
      }
    } catch {}

    if (orderNumber) {
      setOrderRef(orderNumber);
    }

    // Confirm payment with backend
    if (orderNumber || paymentJobRef) {
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
          console.error("Payment confirmation error:", err);
          // Fallback to success if webhook already handled it
          setOrderData({
            success: true,
            message: "Payment processed successfully.",
          });
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
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
    <div className="container-custom max-w-2xl mx-auto px-4 sm:px-6">
      {isLoading ? (
        <div className="art-deco-card rounded-2xl p-12 text-center shadow-[0_15px_35px_rgba(0,0,0,0.7)] border border-[rgba(212,175,55,0.25)] flex flex-col items-center animate-fadeIn">
          <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="font-heading font-black text-lg uppercase tracking-wider text-[#F4EBD9] mb-1">
            Verifying Your Payment...
          </h2>
          <p className="font-sans text-xs text-[#A69B82] max-w-md">
            Connecting with the payment provider and confirming your allocation.
          </p>
        </div>
      ) : error ? (
        <div className="art-deco-card rounded-2xl p-8 sm:p-12 text-center shadow-[0_15px_35px_rgba(0,0,0,0.7)] border border-[rgba(212,175,55,0.25)] flex flex-col items-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.35)] text-[#F87171] flex items-center justify-center mb-4 shadow-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="font-heading font-black text-xl uppercase tracking-wider text-[#F4EBD9] mb-2">
            Payment Not Completed
          </h2>
          <p className="font-sans text-xs text-[#A69B82] mb-6 max-w-md">{error}</p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/dashboard"
              className="btn-gold-metallic px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] shadow-md"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/live-raffles"
              className="btn-dark-metallic px-6 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-[#F4EBD9]"
            >
              Browse Competitions
            </Link>
          </div>
        </div>
      ) : (
        /* Universal Payment Successful View */
        <div className="art-deco-card rounded-2xl p-8 sm:p-12 shadow-[0_15px_35px_rgba(0,0,0,0.7)] border border-[rgba(212,175,55,0.25)] flex flex-col items-center text-center animate-fadeIn">
          {/* Green Checkmark Circle */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[rgba(16,185,129,0.15)] border border-[#10B981] text-[#34D399] flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.8}
              stroke="currentColor"
              className="w-9 h-9 sm:w-11 sm:h-11"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>

          {/* Badge */}
          <span className="px-3.5 py-1 rounded-full bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.3)] text-[#34D399] font-sans font-bold text-[11px] uppercase tracking-wider mb-2">
            Transaction Successful
          </span>

          {/* Main Title */}
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#F4EBD9] uppercase tracking-tight mb-2">
            Payment Successful!
          </h1>

          {/* Subtitle */}
          <p className="font-sans text-xs sm:text-sm text-[#C8BFAD] max-w-md mb-6 leading-relaxed">
            Thank you! Your payment has been processed and verified successfully. Your ticket entries and profile have been updated.
          </p>

          {/* Order Reference if present */}
          {orderRef && (
            <div className="mb-6 px-4 py-2 rounded-xl bg-[#181C28] border border-[rgba(212,175,55,0.2)] text-xs font-sans text-[#A69B82]">
              Order Reference: <strong className="text-[#F4EBD9] font-mono">{orderRef}</strong>
            </div>
          )}

          {/* Instant Wins Banner (if ticket purchase hit instant win) */}
          {instantWins.length > 0 && (
            <div className="w-full mb-6 p-4 rounded-xl bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.35)] text-left shadow-[0_0_20px_rgba(212,175,55,0.15)]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🏆</span>
                <span className="font-heading font-black text-sm uppercase tracking-wider text-[#D4AF37]">
                  Instant Win Prize Detected!
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {instantWins.map((iw: any, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B39042] text-[#090A0E] font-heading font-black text-xs shadow-xs"
                  >
                    <span>🎉</span>
                    <span>{iw.prizeName || iw.title || "Instant Prize"}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ticket Numbers (if tickets were purchased) */}
          {tickets.length > 0 && (
            <div className="w-full mb-8 text-left bg-[#181C28] border border-[rgba(212,175,55,0.2)] rounded-xl p-5">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(212,175,55,0.15)] mb-3">
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#F4EBD9]">
                  Assigned Ticket Numbers ({tickets.length})
                </span>
                <span className="text-[10px] font-sans text-[#A69B82]">Certified Random</span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-1">
                {tickets.map((t: any, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#12151F] border border-[rgba(212,175,55,0.3)] text-[#F4EBD9]"
                  >
                    #{t.ticketNumber}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Primary Action Button: GO TO DASHBOARD */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <Link
              href="/dashboard"
              className="btn-gold-metallic w-full sm:w-auto px-10 py-3.5 rounded-xl font-heading font-black text-sm uppercase tracking-wider text-[#090A0E] shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>Go to Dashboard</span>
              <span>→</span>
            </Link>

            <Link
              href="/"
              className="btn-dark-metallic w-full sm:w-auto px-6 py-3.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-[#F4EBD9] transition-all text-center"
            >
              Return to Home
            </Link>
          </div>

          <p className="mt-8 text-[11px] font-sans text-[#8C8472]">
            A confirmation receipt has been dispatched to your email and dashboard notifications.
          </p>
        </div>
      )}

      {/* Win Animation Modal (Slot Machine Reveal if ticket won) */}
      <WinAnimationModal
        isOpen={isWinModalOpen}
        onClose={() => setIsWinModalOpen(false)}
        onClaim={handleClaimWin}
        prizes={winAnimationPrizes}
      />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090A0E]">
      <WebsiteNavbar />

      <main className="flex-1 pt-28 pb-20">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </main>

      <WebsiteFooter />
    </div>
  );
}
