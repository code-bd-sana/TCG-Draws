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
    <div className="flex items-center border border-[rgba(212,175,55,0.25)] rounded-xl overflow-hidden h-9 bg-[#181C28] shadow-inner">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isDecrementDisabled}
        className="w-8 h-full flex items-center justify-center text-[#D4AF37] font-black text-sm hover:bg-[#12151F] transition-colors cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed select-none"
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
        className="w-12 sm:w-14 h-full text-center font-heading font-black text-xs text-[#F4EBD9] border-x border-[rgba(212,175,55,0.2)] bg-transparent focus:outline-none focus:bg-[#12151F] transition-colors tabular-nums"
        aria-label={`Quantity for ${item.title}`}
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={isIncrementDisabled}
        className="w-8 h-full flex items-center justify-center text-[#D4AF37] font-black text-sm hover:bg-[#12151F] transition-colors cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed select-none"
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
    <div className="min-h-screen flex flex-col bg-[#090A0E]">
      <WebsiteNavbar />

      <main className="relative isolate flex-1 pt-28 pb-20 sm:pt-32 md:pb-24 overflow-hidden">
        {/* Ambient Luxury Lighting */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#141722_1px,transparent_1px),linear-gradient(to_bottom,#141722_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_70%,transparent_100%)] opacity-35" />
          <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-[90px]" />
          <div className="absolute top-1/2 right-10 h-[450px] w-[450px] bg-[radial-gradient(circle,rgba(163,123,36,0.12)_0%,transparent_70%)] blur-[100px]" />
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#090A0E] to-transparent" />
        </div>

        <div className="container-custom max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 font-sans text-xs font-semibold text-[#A69B82] mb-6">
            <Link href="/" className="hover:text-[#D4AF37] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/live-raffles" className="hover:text-[#D4AF37] transition-colors">
              Competitions
            </Link>
            <span>/</span>
            <span className="text-[#F4EBD9] font-bold">Basket</span>
          </nav>

          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[rgba(212,175,55,0.2)]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.35)] bg-[#12151F]/90 px-3.5 py-1.5 font-sans text-[10px] font-black uppercase tracking-[0.16em] text-[#D4AF37] mb-2 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                VERIFIED COMPETITION ENTRY VAULT
              </span>
              <h1 className="font-heading font-black text-3xl sm:text-4xl text-[#F4EBD9] uppercase tracking-tight">
                YOUR{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#B39042] drop-shadow-[0_2px_12px_rgba(212,175,55,0.3)]">
                  BASKET
                </span>
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#A69B82] mt-1.5">
                Review your active ticket entries before proceeding to 256-bit encrypted checkout.
              </p>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={clearBasket}
                className="self-start sm:self-auto text-xs font-sans font-semibold text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 bg-red-950/25 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Clear Entire Basket
              </button>
            )}
          </div>

          {!isInitialized ? (
            <div className="bg-[#12151F] border border-[rgba(212,175,55,0.2)] rounded-3xl p-16 text-center shadow-2xl">
              <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-sans text-xs font-semibold text-[#A69B82]">Loading your basket...</p>
            </div>
          ) : items.length === 0 ? (
            /* Empty State */
            <div className="relative isolate overflow-hidden bg-[#12151F] border border-[rgba(212,175,55,0.25)] rounded-3xl p-12 sm:p-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center max-w-lg mx-auto">
              <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-2xl" />

              <div className="w-20 h-20 rounded-2xl bg-[#181C28] border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-[#D4AF37] mb-5 shadow-inner">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-10 h-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                  />
                </svg>
              </div>

              <h2 className="font-heading font-black text-2xl text-[#F4EBD9] uppercase tracking-wider mb-2">
                Your basket is empty
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#A69B82] max-w-sm mb-8 leading-relaxed">
                You haven&apos;t added any competition entries yet. Browse active draws and win PSA 10 slabs &amp; vintage packs!
              </p>
              <Link
                href="/live-raffles"
                className="btn-gold-metallic px-8 py-3.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:scale-105 transition-all"
              >
                Browse Live Draws →
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
                      className="group relative overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.22)] bg-[#12151F] p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-300 hover:border-[#D4AF37]/50 hover:shadow-[0_15px_35px_rgba(212,175,55,0.15)]"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#090A0E] shrink-0 border border-[rgba(212,175,55,0.3)] shadow-inner">
                        <Image
                          src={item.image || "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=800&auto=format&fit=crop"}
                          alt={item.title}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        {item.category && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#181C28] border border-[rgba(212,175,55,0.3)] text-[#D4AF37] font-sans font-bold text-[9px] uppercase tracking-wider mb-1.5">
                            {item.category}
                          </span>
                        )}
                        <Link
                          href={`/live-raffles/${item.slug}`}
                          className="font-heading font-black text-sm sm:text-base text-[#F4EBD9] hover:text-[#D4AF37] line-clamp-1 transition-colors uppercase tracking-tight"
                        >
                          {item.title}
                        </Link>
                        <p className="font-sans text-xs text-[#A69B82] mt-1 font-medium">
                          £{item.pricePerTicket.toFixed(2)} per ticket
                        </p>
                        {item.maxTickets && (
                          <span className="font-sans text-[10px] text-[#A69B82] block mt-0.5">
                            Max {item.maxTickets} tickets per person
                          </span>
                        )}
                        {remaining < 20 && (
                          <span className="inline-flex items-center gap-1 font-sans text-[10px] text-amber-400 font-bold mt-1">
                            <span>🔥</span> Only {remaining} left!
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
                        <div className="text-right min-w-[75px]">
                          <span className="font-heading font-black text-sm sm:text-base text-[#D4AF37] block">
                            £{itemSubtotal.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-sans text-[#A69B82]">
                            ({item.quantity} {item.quantity === 1 ? "ticket" : "tickets"})
                          </span>
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.raffleId)}
                          className="p-2 text-[#A69B82] hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/40 rounded-xl transition-all cursor-pointer"
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
                    className="inline-flex items-center gap-2 text-xs font-heading font-bold text-[#D4AF37] hover:text-[#FFF0D4] transition-colors uppercase tracking-wider"
                  >
                    <span>←</span> Continue exploring competitions
                  </Link>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-4 bg-[#12151F] border border-[rgba(212,175,55,0.25)] rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.7)] sticky top-28">
                <div className="flex items-center justify-between pb-3.5 border-b border-[rgba(212,175,55,0.18)] mb-4">
                  <h3 className="font-heading font-black text-sm uppercase tracking-wider text-[#F4EBD9]">
                    Basket Summary
                  </h3>
                  <span className="text-[10px] font-heading font-black px-2.5 py-0.5 rounded-full bg-[#181C28] border border-[rgba(212,175,55,0.3)] text-[#D4AF37]">
                    {itemCount} {itemCount === 1 ? "DRAW" : "DRAWS"}
                  </span>
                </div>

                <div className="flex flex-col gap-3 text-xs font-sans">
                  <div className="flex items-center justify-between text-[#A69B82]">
                    <span>Active Competitions</span>
                    <span className="font-semibold text-[#F4EBD9]">{itemCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#A69B82]">
                    <span>Total Ticket Entries</span>
                    <span className="font-semibold text-[#F4EBD9]">{totalTickets}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#A69B82]">
                    <span>Ticket Allocation</span>
                    <span className="font-semibold text-[#D4AF37]">Instant Digital</span>
                  </div>
                  <div className="flex items-center justify-between text-[#A69B82]">
                    <span>Delivery &amp; Courier</span>
                    <span className="font-bold text-emerald-400">FREE TRACKED</span>
                  </div>

                  <div className="pt-3.5 border-t border-[rgba(212,175,55,0.18)] flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-[#F4EBD9] uppercase tracking-wide">
                      Total Payable
                    </span>
                    <span className="font-heading font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#B39042] drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]">
                      £{totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="btn-gold-metallic mt-6 w-full h-12 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-[#090A0E] shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <span>→</span>
                </Link>

                <div className="mt-5 pt-5 border-t border-[rgba(212,175,55,0.15)] flex flex-col gap-2.5 text-[10px] text-[#A69B82]">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-xs">✓</span>
                    <span>100% fair and certified transparent draws</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-xs">✓</span>
                    <span>Automated random ticket number assignment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-xs">✓</span>
                    <span>Instant win prize notifications &amp; live streams</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-xs">✓</span>
                    <span>256-Bit SSL Encrypted Vault Checkout</span>
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
