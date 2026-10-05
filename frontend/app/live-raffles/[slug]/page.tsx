import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import WebsiteNavbar from "../../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../../components/website/layout/WebsiteFooter";
import RaffleImageGallery from "../../../components/website/raffle-details/RaffleImageGallery";
import RaffleEntryCard from "../../../components/website/raffle-details/RaffleEntryCard";
import RaffleDetailsTabs from "../../../components/website/raffle-details/RaffleDetailsTabs";
import RelatedRafflesSection from "../../../components/website/raffle-details/RelatedRafflesSection";
import RaffleDetailsEmptyState from "../../../components/website/raffle-details/RaffleDetailsEmptyState";
import FreePostalEntryButton from "../../../components/website/legal/FreePostalEntryButton";
import { RaffleDetail } from "../../../types/raffle-details.types";
import { cn } from "../../../lib/utils";
import { formatUkDateTime } from "../../../lib/uk-time";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getRaffle(slug: string): Promise<RaffleDetail | undefined> {
  try {
    const apiUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1';
    const cleanSlug = typeof slug === 'string' ? slug.trim() : String(slug);
    const res = await fetch(`${apiUrl}/raffles/public/${encodeURIComponent(cleanSlug)}`, {
      cache: 'no-store' // or next: { revalidate: 60 }
    });
    if (!res.ok) {
      console.error(`getRaffle failed for slug "${slug}" at ${apiUrl}/raffles/public/${cleanSlug}: status ${res.status}`);
      return undefined;
    }

    const json = await res.json();
    const draw = json.data || json; // Handle wrapped response
    if (!draw || !draw.id) return undefined;

    const declaredMainPrize =
      draw.mainPrizeValue !== undefined && draw.mainPrizeValue !== null && draw.mainPrizeValue !== ""
        ? Number(draw.mainPrizeValue)
        : (draw.worthPrice ? Number(draw.worthPrice) : 0);

    const instantWinsTotal =
      Array.isArray(draw.instantWins)
        ? draw.instantWins.reduce((sum: number, iw: any) => sum + (Number(iw.rrpValue) || 0), 0)
        : 0;

    const totalPool = declaredMainPrize > 0
      ? (declaredMainPrize + instantWinsTotal)
      : (instantWinsTotal > 0 ? instantWinsTotal : 0);

    const worth = declaredMainPrize > 0 ? declaredMainPrize : (totalPool > 0 ? totalPool : undefined);

    const now = Date.now();
    const endMs = draw.endDate ? new Date(draw.endDate).getTime() : NaN;
    const isPast =
      draw.status === "ENDED" ||
      draw.status === "COMPLETED" ||
      draw.status === "CANCELLED" ||
      draw.status === "ended" ||
      (!isNaN(endMs) && endMs <= now) ||
      (Number(draw.totalTickets || 0) > 0 && (Number(draw.ticketsSold || 0)) >= Number(draw.totalTickets));

    const catStr =
      typeof draw.category === "object" && draw.category !== null
        ? (draw.category.name || draw.category.slug || "Drivers")
        : (typeof draw.category === "string" ? draw.category : "Drivers");

    return {
      id: draw.id,
      title: draw.title || "Golf Competition",
      slug: draw.slug || draw.id,
      category: catStr,
      status: isPast ? "ended" : (draw.status === "ACTIVE" ? "live" : "ending_soon"),
      images: Array.isArray(draw.images) && draw.images.length > 0
        ? draw.images
        : [draw.mainImage || "https://placehold.co/800x600/1a230a/8cb34a?text=No+Image"],
      ticketPrice: Number(draw.pricePerTicket || 0),
      worthPrice: worth,
      totalPoolValue: totalPool,
      mainPrizeValue: declaredMainPrize > 0 ? declaredMainPrize : undefined,
      prizeName: draw.prizeName || draw.title,
      minimumTickets: draw.minTickets ? Number(draw.minTickets) : 1,
      minTickets: draw.minTickets ? Number(draw.minTickets) : 1,
      maximumTicketsPerOrder: draw.maxTickets ? Number(draw.maxTickets) : undefined,
      maxTickets: draw.maxTickets ? Number(draw.maxTickets) : undefined,
      totalTickets: Number(draw.totalTickets || 0),
      soldTickets: Number(draw.ticketsSold || 0),
      remainingTickets: Math.max(Number(draw.totalTickets || 0) - Number(draw.ticketsSold || 0), 0),
      drawEndDate: draw.endDate ? formatUkDateTime(draw.endDate) : "Closing Soon",
      endDate: draw.endDate,
      description: draw.description || `Enter this premium draw for a chance to win the ${draw.title || 'competition'}! Premium gear, fast shipping, and live draw.`,
      highlights: [
        `Main Prize: ${draw.prizeName || draw.title || 'Competition Prize'}`,
        `Ticket Price: £${Number(draw.pricePerTicket || 0).toFixed(2)}`,
        declaredMainPrize > 0 ? `Main Prize Value: £${declaredMainPrize.toLocaleString()}` : null,
        `Total Tickets: ${Number(draw.totalTickets || 0).toLocaleString()}`,
        draw.maxTickets ? `Max Per Person: ${Number(draw.maxTickets)} tickets` : null,
        `Fast Track Delivery: Fully tracked and insured shipping included.`,
      ].filter(Boolean) as string[],
      terms: [
        "This competition is open to UK residents aged 18 and over.",
        "One entry per ticket purchased.",
        "The promoter reserves the right to substitute any prize of equal or greater value.",
        "All winners will be contacted by email within 48 hours of the draw.",
        "Prizes are non-transferable and no cash alternative is offered.",
        "By entering you agree to be bound by these terms and conditions.",
        "Free postal entry: send your name and address on a postcard to: Fairway Draws, PO Box 99, Manchester, M1 1AA."
      ],
      instantWinPrizes: Array.isArray(draw.instantWins) ? draw.instantWins.map((iw: any) => ({
        id: iw.id,
        title: iw.prizeName,
        image: iw.image,
        ticketNumber: iw.ticketNumber,
        isClaimed: iw.isClaimed
      })) : [],
      isFeatured: false,
      hostId: draw.hostId || draw.host?.id,
      hostUserId: draw.host?.userId || draw.host?.user?.id,
      hostName: draw.host?.businessName?.trim() || (draw.host?.user ? `${draw.host.user.firstName || ''} ${draw.host.user.lastName || ''}`.trim() : "Fairway Draws Host"),
      hostLogo: draw.host?.user?.avatarUrl || draw.host?.businessName?.trim()?.[0] || draw.host?.user?.firstName?.[0] || "FD",
      hostSlug: draw.host?.slug || draw.host?.id,
      hostDrawsCount: 1,
      hostVerified: true,
      isAutoDraw: Boolean(draw.isAutoDraw),
    };
  } catch (e) {
    console.error("Error in getRaffle:", e);
    return undefined;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const raffle = await getRaffle(slug);
  return {
    title: raffle ? `${raffle.title} | Fairway Draws` : "Competition Not Found | Fairway Draws",
    description: raffle?.description || "Browse and enter active premium golf draws.",
  };
}

/**
 * Dynamic Live Raffle Details page route: `/live-raffles/[slug]`
 * Coordinates SSR details fetching, two-column responsive desktop layout, and recommended collections.
 */
export default async function LiveRaffleDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Search details by active slug or ID
  const raffle = await getRaffle(slug);

  // Fallback screen if drawing does not exist
  if (!raffle) {
    return (
      <>
        <WebsiteNavbar />
        <RaffleDetailsEmptyState />
        <WebsiteFooter />
      </>
    );
  }

  const soldPercent = raffle.totalTickets > 0 ? (raffle.soldTickets / raffle.totalTickets) : 0;
  const badgeText = soldPercent > 0.9 ? "ALMOST GONE" : "HOT";

  const getBadgeStyle = (text: string) => {
    switch (text.toUpperCase()) {
      case "ALMOST GONE":
        return "bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]";
      case "HOT":
        return "bg-[#FEE2E2] border-[#FECACA] text-[#DC2626]";
      default:
        return "bg-elevated border-border-medium text-text-muted";
    }
  };

  const fireIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#D97706]">
      <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-3.66-2.61-6.72-6.07-7.39.37.76.57 1.62.57 2.53 0 1.95-1.07 3.65-2.67 4.54l-.06.03c.53-2.14-.17-4.47-1.78-6.1l-.32-.33c-.09.33-.14.67-.14 1.02 0 2.27 1.34 4.22 3.28 5.11l.08.04c-1.61-.31-3.23.36-4.13 1.73A7.514 7.514 0 0 0 7 17.5c0 4.14 3.36 7.5 7.5 7.5s7.5-3.36 7.5-7.5c0-1.65-.54-3.18-1.57-4.52z" />
    </svg>
  );

  return (
    <>
      {/* Sticky top navbar */}
      <WebsiteNavbar />

      <main className="min-h-screen flex flex-col bg-[#cfdfcb] pt-20 md:pt-[68px]">
        {/* Main Details Section */}
        <section className="py-10 md:py-14 flex-grow">
          <div className="container-custom">

            {/* Grid Layout: two-column desktop, single-column stacked mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">

              {/* LEFT COLUMN: Image, Title, Tabs, Instant Wins, Host Info */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6 w-full">

                {/* Main product Image Gallery */}
                <RaffleImageGallery
                  images={raffle.images}
                  title={raffle.title}
                  instantWinCount={raffle.instantWinPrizes.length}
                  endDate={raffle.endDate}
                  hostName={raffle.hostName}
                />

                {/* Title & Badges */}
                <div className="flex flex-col gap-3 mt-2">
                  <h1 className="font-heading font-black text-3xl md:text-4xl text-text-primary tracking-tight">
                    {raffle.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {raffle.status === 'ended' ? (
                      <span className="bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] px-3 py-1 rounded-full text-xs font-sans font-bold uppercase tracking-wider shadow-xs">
                        DRAW CLOSED
                      </span>
                    ) : raffle.status === 'live' ? (
                      <span className="bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] px-3 py-1 rounded-full text-xs font-sans font-bold uppercase tracking-wider shadow-xs">
                        LIVE
                      </span>
                    ) : (
                      <span className="bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] px-3 py-1 rounded-full text-xs font-sans font-bold uppercase tracking-wider shadow-xs">
                        ENDING SOON
                      </span>
                    )}

                    {badgeText && (
                      <span className={cn("inline-flex items-center gap-1 border px-3 py-1 rounded-full text-xs font-sans font-bold tracking-wider uppercase shadow-xs", getBadgeStyle(badgeText))}>
                        {badgeText === "ALMOST GONE" && fireIcon}
                        <span>{badgeText}</span>
                      </span>
                    )}
                    
                    {raffle.isAutoDraw && (
                      <span className="bg-accent-bg border border-primary/30 text-text-brand px-3 py-1 rounded-full text-xs font-sans font-bold uppercase tracking-wider shadow-xs">
                        AUTO DRAW
                      </span>
                    )}

                    {raffle.instantWinPrizes.length > 0 && (
                      <span className="text-xs font-sans text-text-muted select-none font-medium">
                        • {raffle.instantWinPrizes.length} instant wins
                      </span>
                    )}

                    {/* Highly visible UK-compliant Free Postal Entry button */}
                    <FreePostalEntryButton raffleTitle={raffle.title} variant="badge" />
                  </div>
                </div>

                {/* Interactive Details, How-to, and T&Cs Tabs */}
                <RaffleDetailsTabs raffle={raffle} />

              </div>

              {/* RIGHT COLUMN: Entry Card (Sticky on desktop viewports) */}
              <div className="lg:col-span-5 xl:col-span-4 w-full lg:sticky lg:top-24 mt-4 lg:mt-0 flex justify-center lg:justify-end">
                <RaffleEntryCard raffle={raffle} />
              </div>

            </div>

          </div>
        </section>

        {/* You Might Also Like Section */}
        <Suspense fallback={<div className="py-20 text-center text-text-muted font-sans">Loading related competitions...</div>}>
          <RelatedRafflesSection currentRaffleId={raffle.id} currentSlug={raffle.slug} category={raffle.category} />
        </Suspense>
      </main>

      {/* Global website footer */}
      <WebsiteFooter />
    </>
  );
}
