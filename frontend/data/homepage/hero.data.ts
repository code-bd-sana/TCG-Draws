import { StatItem } from "../../types/homepage.types";
import { Draw } from "../../types/draw.types";

export interface HeroData {
  badgeText: string;
  headingText: string;
  paragraphText: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  stats: StatItem[];
  featuredDraw: Draw;
}

export const heroData: HeroData = {
  badgeText: "PREMIUM TCG COMPETITIONS",
  headingText: "Win Certified Rare Cards & Slabs",
  paragraphText: "Enter premium trading card competitions from just £1 per ticket. Fair, transparent & fully verified. Over £180k in certified vintage booster boxes & PSA 10 slabs won by our community.",
  primaryCtaLabel: "Browse Live Draws",
  primaryCtaHref: "#live-draws",
  secondaryCtaLabel: "How It Works",
  secondaryCtaHref: "#how-it-works",
  stats: [
    {
      id: "hero-stat-1",
      value: "2,400+",
      label: "Draws Completed",
    },
    {
      id: "hero-stat-3",
      value: "Verified",
      label: "Fair Draws",
    },
  ],
  featuredDraw: {
    id: "hero-feat-1",
    title: "1st Edition Shadowless Charizard Holo PSA 10",
    description: "Worth £8,500. The iconic grail in pristine Gem Mint condition with tamper-evident PSA certified acrylic casing and insured express courier delivery.",
    image: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=800&auto=format&fit=crop",
    ticketPrice: 2.50,
    totalTickets: 500,
    soldTickets: 342,
    endDate: "Ends in 2d 4h",
    status: "live",
    category: "slabs",
    worthPrice: 8500,
    isFeatured: true,
  },
};
