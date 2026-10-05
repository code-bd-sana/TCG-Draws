import React from "react";
import LiveRaffleCard from "../live-raffles/LiveRaffleCard";
import RelatedRafflesFallback from "./RelatedRafflesFallback";

interface RelatedRafflesSectionProps {
  currentRaffleId: string;
  currentSlug?: string;
  category?: string;
}

async function fetchRealRaffles(): Promise<any[]> {
  try {
    const apiUrl =
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:5000/api/v1";
    const res = await fetch(`${apiUrl}/raffles?statusFilter=Live&limit=24`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`Failed to fetch related raffles on server: status ${res.status}`);
      return [];
    }
    const json = await res.json();
    if (Array.isArray(json.data)) return json.data;
    if (Array.isArray(json)) return json;
    return [];
  } catch (err) {
    console.error("Error in fetchRealRaffles on server:", err);
    return [];
  }
}

/**
 * Related Raffles recommendations section ("You Might Also Like").
 * Reuses the listing page LiveRaffleCard component for code reuse and consistency.
 * Fetches real active competitions from the backend API.
 */
export default async function RelatedRafflesSection({
  currentRaffleId,
  currentSlug,
  category,
}: RelatedRafflesSectionProps) {
  const allRaffles = await fetchRealRaffles();

  // If server-side fetch couldn't reach backend, fall back to client-side API fetching
  if (allRaffles.length === 0) {
    return (
      <RelatedRafflesFallback
        currentRaffleId={currentRaffleId}
        currentSlug={currentSlug}
        category={category}
      />
    );
  }

  // Filter out the currently viewed competition and ensure status is strictly ACTIVE
  const otherRaffles = allRaffles.filter((draw: any) => {
    if (draw.status !== 'ACTIVE') return false;
    const matchId =
      currentRaffleId &&
      (draw.id === currentRaffleId || draw.slug === currentRaffleId);
    const matchSlug =
      currentSlug &&
      (draw.slug === currentSlug || draw.id === currentSlug);
    return !matchId && !matchSlug;
  });

  // 1. Prioritize draws in the same category if available
  let related: any[] = [];
  if (category && typeof category === "string" && category.trim().length > 0) {
    const targetCat = category.toLowerCase().trim();
    related = otherRaffles
      .filter((draw: any) => {
        if (!draw.category || typeof draw.category !== "string") return false;
        return draw.category.toLowerCase().trim() === targetCat;
      })
      .slice(0, 3);
  }

  // 2. If fewer than 3, fill with other active draws
  if (related.length < 3) {
    const filler = otherRaffles
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

  if (related.length === 0) return null;

  return (
    <section className="py-20 bg-surface border-t border-divider">
      <div className="container-custom">
        {/* Section Title */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-text-primary">
            You Might Also Like
          </h2>
        </div>

        {/* Drawings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {related.map((draw) => (
            <LiveRaffleCard key={draw.id} raffle={draw} viewMode="grid" />
          ))}
        </div>
      </div>
    </section>
  );
}
