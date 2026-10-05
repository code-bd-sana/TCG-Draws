"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";
import { useBasket, BasketItem } from "../../features/basket/BasketContext";
import { toast } from "sonner";

interface BasketQuantityControlProps {
  item: BasketItem;
  remaining: number;
  updateQuantity: (raffleId: string, quantity: number) => void;
}

function BasketQuantityControl({
  item,
  remaining,
  updateQuantity,
}: BasketQuantityControlProps) {
  const minAllowed = item.minTickets && item.minTickets > 0 ? item.minTickets : 1;
  const maxPerPerson = item.maxTickets && item.maxTickets > 0 ? item.maxTickets : Infinity;
  const maxAllowed = Math.min(remaining, maxPerPerson);

  const [inputValue, setInputValue] = useState<string>(String(item.quantity));
  const [prevQuantity, setPrevQuantity] = useState<number>(item.quantity);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal state with context quantity when not focused/typing
  if (item.quantity !== prevQuantity) {
    setPrevQuantity(item.quantity);
    if (!isFocused) {
      setInputValue(String(item.quantity));
    }
  }

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const commitValue = (valToCommit: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const parsed = parseInt(valToCommit, 10);

    if (isNaN(parsed) || parsed < minAllowed) {
      if (!isNaN(parsed) && parsed < minAllowed && parsed > 0) {
        toast.error(`Minimum ${minAllowed} tickets required for "${item.title}"`);
      }
      setInputValue(String(item.quantity));
      return;
    }

    if (parsed > maxAllowed) {
      if (item.maxTickets && maxAllowed === item.maxTickets) {
        toast.error(`Maximum ticket limit is ${item.maxTickets} for "${item.title}"`);
      } else {
        toast.error(`Only ${remaining} tickets left for "${item.title}"`);
      }
      setInputValue(String(maxAllowed));
      if (item.quantity !== maxAllowed) {
        updateQuantity(item.raffleId, maxAllowed);
      }
      return;
    }

    setInputValue(String(parsed));
    if (item.quantity !== parsed) {
      updateQuantity(item.raffleId, parsed);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    // Allow empty string or digits only
    if (raw !== "" && !/^\d+$/.test(raw)) return;

    setInputValue(raw);

    // If valid number within bounds, auto-commit with debounce so total updates smoothly
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (raw !== "") {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= minAllowed && parsed <= maxAllowed) {
        debounceTimerRef.current = setTimeout(() => {
          if (parsed !== item.quantity) {
            updateQuantity(item.raffleId, parsed);
          }
        }, 500);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    commitValue(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const handleIncrement = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const parsed = parseInt(inputValue, 10);
    const base = isNaN(parsed) ? item.quantity : parsed;
    const next = Math.min(base + 1, maxAllowed);
    setInputValue(String(next));
    updateQuantity(item.raffleId, next);
  };

  const handleDecrement = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const parsed = parseInt(inputValue, 10);
    const base = isNaN(parsed) ? item.quantity : parsed;
    const next = Math.max(base - 1, minAllowed);
    setInputValue(String(next));
    updateQuantity(item.raffleId, next);
  };

  const currentNum = parseInt(inputValue, 10);
  const effectiveQty = isNaN(currentNum) ? item.quantity : currentNum;
  const isDecrementDisabled = effectiveQty <= minAllowed;
  const isIncrementDisabled = effectiveQty >= maxAllowed;

  return (
    <div className="flex items-center border border-border-medium rounded-xl overflow-hidden h-9 bg-surface">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isDecrementDisabled}
        className="w-8 h-full flex items-center justify-center text-text-primary font-bold hover:bg-elevated transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none"
        aria-label="Decrease quantity"
      >
        -
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        onChange={handleChange}
        onFocus={(e) => {
          setIsFocused(true);
          e.target.select();
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-12 sm:w-14 h-full text-center font-heading font-bold text-xs text-text-primary border-x border-border-medium bg-transparent focus:outline-none focus:bg-elevated/60 transition-colors tabular-nums"
        aria-label={`Quantity for ${item.title}`}
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={isIncrementDisabled}
        className="w-8 h-full flex items-center justify-center text-text-primary font-bold hover:bg-elevated transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export default function BasketPage() {
  const {
    items,
    itemCount,
    totalTickets,
    totalPrice,
    updateQuantity,
    removeItem,
    clearBasket,
    isInitialized,
  } = useBasket();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf6]">
      <WebsiteNavbar />

      <main className="flex-1 pt-28 pb-20">
        <div className="container-custom max-w-5xl mx-auto px-4 sm:px-6">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#e2eadf]">
            <div>
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-text-primary uppercase tracking-tight">
                Your Basket
              </h1>
              <p className="font-sans text-xs text-text-muted mt-1">
                Review your competition entries before proceeding to secure checkout.
              </p>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={clearBasket}
                className="self-start sm:self-auto text-xs font-sans text-red-600 hover:text-red-700 underline transition-colors cursor-pointer"
              >
                Clear Entire Basket
              </button>
            )}
          </div>

          {!isInitialized ? (
            <div className="bg-surface border border-border rounded-card p-12 text-center shadow-card">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="font-sans text-xs text-text-muted">Loading your basket...</p>
            </div>
          ) : items.length === 0 ? (
            /* Empty State */
            <div className="bg-surface border border-border rounded-card p-12 text-center shadow-card flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#ecf5ee] flex items-center justify-center text-[#15803d] mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                  />
                </svg>
              </div>
              <h2 className="font-heading font-bold text-lg text-text-primary uppercase tracking-wider mb-2">
                Your basket is empty
              </h2>
              <p className="font-sans text-xs text-text-muted max-w-md mb-6">
                You haven&apos;t added any competition entries yet. Browse active draws and win premium golf gear!
              </p>
              <Link
                href="/live-raffles"
                className="btn-glossy-red px-6 py-3 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white shadow-md active:scale-98 transition-all"
              >
                Browse Live Draws
              </Link>
            </div>
          ) : (
            /* Active Basket Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Items List */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                {items.map((item) => {
                  const remaining = Math.max(0, item.totalTickets - item.ticketsSold);
                  const itemSubtotal = item.quantity * item.pricePerTicket;

                  return (
                    <div
                      key={item.raffleId}
                      className="bg-surface border border-border rounded-card p-4 sm:p-5 shadow-card flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:border-border-medium"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-bg shrink-0 border border-divider">
                        <Image
                          src={item.image || "https://placehold.co/400x300/1a230a/8cb34a?text=Draw"}
                          alt={item.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        {item.category && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-[#ecf5ee] text-[#15803d] font-sans font-bold text-[9px] uppercase tracking-wider mb-1">
                            {item.category}
                          </span>
                        )}
                        <Link
                          href={`/live-raffles/${item.slug}`}
                          className="font-heading font-bold text-sm sm:text-base text-text-primary hover:text-text-brand line-clamp-1 transition-colors"
                        >
                          {item.title}
                        </Link>
                        <p className="font-sans text-xs text-text-muted mt-0.5">
                          £{item.pricePerTicket.toFixed(2)} per ticket
                        </p>
                        {item.maxTickets && (
                          <span className="font-sans text-[10px] text-text-muted block mt-0.5">
                            Max {item.maxTickets} tickets per person
                          </span>
                        )}
                        {remaining < 20 && (
                          <span className="font-sans text-[10px] text-amber-700 font-semibold block">
                            Only {remaining} left!
                          </span>
                        )}
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <BasketQuantityControl
                          item={item}
                          remaining={remaining}
                          updateQuantity={updateQuantity}
                        />

                        {/* Price Subtotal */}
                        <div className="text-right min-w-[70px]">
                          <span className="font-heading font-black text-sm text-text-primary block">
                            £{itemSubtotal.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-sans text-text-muted">
                            ({item.quantity} {item.quantity === 1 ? "ticket" : "tickets"})
                          </span>
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.raffleId)}
                          className="p-1.5 text-text-muted hover:text-red-600 transition-colors cursor-pointer rounded-lg hover:bg-red-50"
                          aria-label={`Remove ${item.title} from basket`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Continue Shopping Link */}
                <div className="pt-2">
                  <Link
                    href="/live-raffles"
                    className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-text-brand hover:underline uppercase tracking-wider"
                  >
                    ← Continue exploring competitions
                  </Link>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-4 bg-surface border border-border rounded-card p-6 shadow-card sticky top-24">
                <h3 className="font-heading font-black text-sm uppercase tracking-wider text-text-primary pb-3 border-b border-divider mb-4">
                  Basket Summary
                </h3>

                <div className="flex flex-col gap-3 text-xs font-sans">
                  <div className="flex items-center justify-between text-text-muted">
                    <span>Active Competitions</span>
                    <span className="font-semibold text-text-primary">{itemCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-muted">
                    <span>Total Ticket Entries</span>
                    <span className="font-semibold text-text-primary">{totalTickets}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-muted">
                    <span>Delivery & Shipping</span>
                    <span className="font-bold text-[#15803d]">FREE TRACKED</span>
                  </div>
                  <div className="pt-3 border-t border-divider flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-text-primary uppercase">
                      Total Payable
                    </span>
                    <span className="font-heading font-black text-xl text-text-brand">
                      £{totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="mt-6 w-full h-12 rounded-xl btn-glossy-red font-heading font-bold text-xs uppercase tracking-wider text-white shadow-md active:scale-98 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <span>→</span>
                </Link>

                <div className="mt-4 pt-4 border-t border-divider flex flex-col gap-2 text-[10px] text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#15803d] font-bold">✓</span>
                    <span>100% fair and transparent certified draws</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#15803d] font-bold">✓</span>
                    <span>Automated ticket number assignment</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#15803d] font-bold">✓</span>
                    <span>Instant win prize notifications</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <WebsiteFooter />
    </div>
  );
}
