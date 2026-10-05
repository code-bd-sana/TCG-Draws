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
  badgeText: "PREMIUM GOLF COMPETITIONS",
  headingText: "Win Premium Golf Gear For Less",
  paragraphText: "Enter premium golf draws from just £1 per ticket. Fair, transparent & fully verified. Over £180k in luxury prizes already won by our community.",
  primaryCtaLabel: "Browse Live Draws",
  primaryCtaHref: "#live-draws",
  secondaryCtaLabel: "How It Works",
  secondaryCtaHref: "#how-it-works",
  stats: [
    {
      id: "hero-stat-1",
      value: "2,400",
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
    title: "TaylorMade Stealth 2 Driver + Full Iron Set",
    description: "Worth £1,400. Brand-new TaylorMade Stealth 2 driver bundle including full iron set, premium golf bag, and rangefinder.",
    image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=800&auto=format&fit=crop",
    ticketPrice: 2.50,
    totalTickets: 500,
    soldTickets: 342,
    endDate: "Ends in 2d 4h",
    status: "live",
    category: "equipment",
    worthPrice: 1400,
    isFeatured: true,
  },
};

//   s = {tt, th, hh, ht}
//  a complimant = 1/4
//  e = 1 - 1/4 = 3/4
