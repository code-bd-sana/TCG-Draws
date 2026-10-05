"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

export interface BasketItem {
  raffleId: string;
  slug: string;
  title: string;
  image: string;
  pricePerTicket: number;
  quantity: number;
  totalTickets: number;
  ticketsSold: number;
  category?: string;
  minTickets?: number;
  maxTickets?: number;
}

interface BasketContextType {
  items: BasketItem[];
  itemCount: number;
  totalTickets: number;
  totalPrice: number;
  addItem: (item: Omit<BasketItem, "quantity">, quantity?: number) => void;
  removeItem: (raffleId: string) => void;
  updateQuantity: (raffleId: string, quantity: number) => void;
  clearBasket: () => void;
  isInitialized: boolean;
}

const STORAGE_KEY = "fairway_basket_v1";

const BasketContext = createContext<BasketContextType | undefined>(undefined);

export const BasketProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load basket from localStorage", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage on change (once initialized)
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save basket to localStorage", e);
    }
  }, [items, isInitialized]);

  // Listen for clear events and cross-tab/window storage updates
  useEffect(() => {
    const handleCleared = () => {
      setItems([]);
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const val = e.newValue ? JSON.parse(e.newValue) : [];
          setItems(Array.isArray(val) ? val : []);
        } catch {
          setItems([]);
        }
      }
    };
    window.addEventListener("fairway_basket_cleared", handleCleared);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("fairway_basket_cleared", handleCleared);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const addItem = useCallback((item: Omit<BasketItem, "quantity">, quantity = 1) => {
    if (quantity <= 0) return;

    setItems((prev) => {
      const remaining = Math.max(0, item.totalTickets - item.ticketsSold);
      const minTickets = item.minTickets && item.minTickets > 0 ? item.minTickets : 1;
      const maxTickets = item.maxTickets && item.maxTickets > 0 ? item.maxTickets : Infinity;
      const effectiveCap = Math.min(remaining, maxTickets);

      const existingIndex = prev.findIndex((i) => i.raffleId === item.raffleId);

      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const targetQty = currentQty + quantity;
        const newQty = Math.min(targetQty, effectiveCap);

        if (newQty <= currentQty && effectiveCap <= currentQty) {
          if (maxTickets < remaining && currentQty >= maxTickets) {
            toast.error(`Maximum ticket limit of ${maxTickets} reached for "${item.title}"`);
          } else {
            toast.error(`Only ${remaining} tickets remaining for "${item.title}"`);
          }
          return prev;
        }

        const updated = [...prev];
        updated[existingIndex] = {
          ...prev[existingIndex],
          ...item,
          quantity: newQty,
        };
        toast.success(`Updated basket: ${newQty} tickets for "${item.title}"`);
        return updated;
      }

      if (quantity < minTickets) {
        toast.error(`Minimum ${minTickets} tickets required for "${item.title}"`);
        return prev;
      }

      const initialQty = Math.min(quantity, effectiveCap);
      if (initialQty <= 0) {
        toast.error(`"${item.title}" is currently sold out.`);
        return prev;
      }

      toast.success(`Added ${initialQty} ticket(s) to basket!`);
      return [...prev, { ...item, quantity: initialQty }];
    });
  }, []);

  const removeItem = useCallback((raffleId: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.raffleId === raffleId);
      if (target) {
        toast.info(`Removed "${target.title}" from basket`);
      }
      return prev.filter((i) => i.raffleId !== raffleId);
    });
  }, []);

  const updateQuantity = useCallback((raffleId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.raffleId !== raffleId);
      }

      return prev.map((item) => {
        if (item.raffleId !== raffleId) return item;
        const remaining = Math.max(0, item.totalTickets - item.ticketsSold);
        const minTickets = item.minTickets && item.minTickets > 0 ? item.minTickets : 1;
        const maxTickets = item.maxTickets && item.maxTickets > 0 ? item.maxTickets : Infinity;
        const effectiveCap = Math.min(remaining, maxTickets);

        if (quantity < minTickets) {
          toast.error(`Minimum ${minTickets} tickets required for "${item.title}"`);
          return item;
        }

        const clampedQty = Math.min(quantity, effectiveCap);
        if (clampedQty < quantity) {
          if (maxTickets < remaining && clampedQty === maxTickets) {
            toast.error(`Maximum ticket limit is ${maxTickets} for "${item.title}"`);
          } else {
            toast.error(`Only ${remaining} tickets left for "${item.title}"`);
          }
        }
        return {
          ...item,
          quantity: clampedQty,
        };
      });
    });
  }, []);

  const clearBasket = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("fairway_basket_cleared"));
      }
    } catch (e) {
      console.error("Failed to clear basket storage", e);
    }
  }, []);

  const itemCount = items.length;
  const totalTickets = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.pricePerTicket,
    0,
  );

  return (
    <BasketContext.Provider
      value={{
        items,
        itemCount,
        totalTickets,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearBasket,
        isInitialized,
      }}
    >
      {children}
    </BasketContext.Provider>
  );
};

export const useBasket = () => {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return context;
};
