"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuthUser } from "../../../hooks/useAuthHooks";
import { paymentService } from "../../../services/payment.service";
import { userService, UnclaimedInstantWin } from "../../../services/user.service";
import { useBasket } from "../../../features/basket/BasketContext";
import WinAnimationModal, { WinPrizeItem } from "../../ui/WinAnimationModal";
import { toast } from "sonner";

export default function HomepagePaymentAndInstantWinModal() {
  const { data: user } = useAuthUser();
  const { clearBasket } = useBasket();
  const [prizes, setPrizes] = useState<WinPrizeItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const paymentProcessedRef = useRef(false);

  // Fetch unclaimed instant wins from backend
  const checkUnclaimedWins = useCallback(async () => {
    try {
      const unclaimed = await userService.getUnclaimedInstantWins();
      if (unclaimed && unclaimed.length > 0) {
        const formattedPrizes: WinPrizeItem[] = unclaimed.map((win: UnclaimedInstantWin) => ({
          id: win.id,
          title: win.prizeName || win.title || "Instant Win Prize",
          ticketNumber: win.ticketNumber,
          rrpValue: win.rrpValue,
          prizeImage: win.prizeImage,
        }));
        setPrizes(formattedPrizes);
        setIsModalOpen(true);
      }
    } catch (err) {
      // User might be unauthenticated or network error - ignore silently
      console.debug("Checking unclaimed wins:", err);
    }
  }, []);

  // Handle URL payment confirmation parameters on mount
  useEffect(() => {
    if (typeof window === "undefined" || paymentProcessedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const orderNumber = params.get("ordernumber") || params.get("orderNumber");
    const paymentJobRef = params.get("paymentJobRef");

    if (paymentStatus === "success" || orderNumber || paymentJobRef) {
      paymentProcessedRef.current = true;
      const toastId = toast.loading("Confirming your ticket purchase...");

      paymentService
        .confirmPayment({
          orderNumber: orderNumber || undefined,
          paymentJobRef: paymentJobRef || undefined,
        })
        .then(async (res) => {
          // Clean the query parameters from the URL
          window.history.replaceState({}, document.title, window.location.pathname);
          toast.dismiss(toastId);
          clearBasket();
          try {
            localStorage.removeItem("fairway_basket_v1");
            localStorage.setItem("fairway_basket_v1", "[]");
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("fairway_basket_cleared"));
            }
          } catch {}

          if (res.tickets && res.tickets.length > 0) {
            toast.success(`Purchase confirmed! ${res.tickets.length} ticket(s) allocated.`);
          } else {
            toast.success("Payment confirmed successfully!");
          }

          // Check if instant wins returned directly from payment
          if (res.instantWins && res.instantWins.length > 0) {
            const instantPrizes: WinPrizeItem[] = res.instantWins.map((iw: any) => {
              const matchedTicket = (res.tickets || []).find((t: any) => t.id === iw.ticketId);
              return {
                id: iw.id,
                title: iw.prizeName || iw.title || "Instant Win Prize",
                ticketNumber: matchedTicket?.ticketNumber || iw.ticketNumber || 0,
                rrpValue: iw.rrpValue,
                prizeImage: iw.prizeImage || iw.image,
              };
            });
            setPrizes(instantPrizes);
            setIsModalOpen(true);
          } else {
            // Check unclaimed wins from DB
            await checkUnclaimedWins();
          }
        })
        .catch((err) => {
          console.error("Payment confirmation error:", err);
          window.history.replaceState({}, document.title, window.location.pathname);
          toast.dismiss(toastId);
          toast.error(err?.response?.data?.message || "Failed to confirm payment status.");
          // Still check if any instant wins were recorded
          checkUnclaimedWins();
        });
    }
  }, [checkUnclaimedWins]);

  // When user logs in or page loads with authenticated user, check for unclaimed instant wins
  useEffect(() => {
    if (user && !paymentProcessedRef.current) {
      checkUnclaimedWins();
    }
  }, [user, checkUnclaimedWins]);

  // Handle user clicking "Claim Prize"
  const handleClaim = async () => {
    try {
      const winnerIds = prizes.map((p) => p.id).filter((id): id is string => !!id);
      await userService.claimInstantWins(winnerIds.length > 0 ? winnerIds : undefined);
      toast.success("Prize claimed successfully! View your wins in your profile.");
      setIsModalOpen(false);
      setPrizes([]);
    } catch (err: any) {
      console.error("Claim error:", err);
      toast.error(err?.response?.data?.message || "Failed to claim prize. Please try again.");
    }
  };

  return (
    <WinAnimationModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onClaim={handleClaim}
      prizes={prizes}
    />
  );
}
