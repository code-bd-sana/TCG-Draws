"use client";

import React, { useEffect, useState } from "react";
import { raffleService } from "../../../services/raffle.service";
import LiveRaffleCard from "../live-raffles/LiveRaffleCard";

interface RelatedRafflesFallbackProps {
  currentRaffleId: string;
  currentSlug?: string;
  category?: string;
}

/**
 * Client-side fallback for recommendations when server-side fetch returns empty
 * or during client-side hydration. Fetches real active raffles from public API.
 */
export default function RelatedRafflesFallback({
  currentRaffleId,
  currentSlug,
  category,
}: RelatedRafflesFallbackProps) {
  const [relatedDraws, setRelatedDraws] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRealDraws() {
      try {
        const response = await raffleService.getPublicRaffles({ statusFilter: 'Live', limit: 24 });
        if (!isMounted) return;

        const allDraws = response?.data || [];

        // Exclude the currently viewed competition and ensure status is strictly ACTIVE
        const otherDraws = allDraws.filter((draw: any) => {
          if (draw.status !== 'ACTIVE') return false;
          const matchId =
            currentRaffleId &&
            (draw.id === currentRaffleId || draw.slug === currentRaffleId);
          const matchSlug =
            currentSlug &&
            (draw.slug === currentSlug || draw.id === currentSlug);
          return !matchId && !matchSlug;
        });

        // 1. Try finding up to 3 draws in the same category
        let related: any[] = [];
        if (category && typeof category === "string" && category.trim().length > 0) {
          const targetCat = category.toLowerCase().trim();
          related = otherDraws
            .filter((draw: any) => {
              if (!draw.category || typeof draw.category !== "string") return false;
              return draw.category.toLowerCase().trim() === targetCat;
            })
            .slice(0, 3);
        }

        // 2. If fewer than 3, fill with other active draws
        if (related.length < 3) {
          const filler = otherDraws
            .filter(
              (draw: any) =>
                !related.some(
                  (r: any) =>
                    r.id === draw.id || (r.slug && r.slug === draw.slug)
                )
            )
            .slice(0, 3 - related.length);
          related = [...related, ...filler];
        }

        setRelatedDraws(related);
      } catch (error) {
        console.error("Error loading related raffles on client fallback:", error);
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    }

    loadRealDraws();

    return () => {
      isMounted = false;
    };
  }, [currentRaffleId, currentSlug, category]);

  if (!isLoaded || relatedDraws.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-[#090A0E] border-t border-[rgba(212,175,55,0.2)] relative isolate overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[radial-gradient(circle,rgba(212,175,55,0.06)_0%,transparent_70%)] blur-[90px] pointer-events-none" />

      <div className="container-custom relative z-10">
        {/* Section Title */}
        <div className="text-center mb-10 md:mb-12">
          <span className="font-heading text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
            ⚡ CURATED DRAWS
          </span>
          <h2 className="mt-2 font-heading font-black text-2xl sm:text-3xl md:text-4xl text-[#F4EBD9] uppercase tracking-tight">
            You Might Also Like
          </h2>
        </div>

        {/* Drawings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {relatedDraws.map((draw) => (
            <LiveRaffleCard key={draw.id} raffle={draw} viewMode="grid" />
          ))}
        </div>
      </div>
    </section>
  );
}
