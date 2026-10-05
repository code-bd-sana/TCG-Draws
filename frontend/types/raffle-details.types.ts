export type RaffleStatus = "live" | "ending_soon" | "sold_out" | "ended";

export type RaffleTabId = "details" | "how-to-enter" | "terms";

export interface InstantWinPrize {
  id: string;
  title: string;
  image: string | null;
  ticketNumber: number;
  isClaimed: boolean;
}

export interface RaffleDetail {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: RaffleStatus;
  images: string[];
  ticketPrice: number;
  worthPrice?: number;
  mainPrizeValue?: number;
  prizeName?: string;
  totalPoolValue: number; // Value of main prize + instant wins
  minimumTickets?: number;
  minTickets?: number;
  maximumTicketsPerOrder?: number;
  maxTickets?: number;
  totalTickets: number;
  soldTickets: number;
  remainingTickets: number;
  drawEndDate: string;
  endDate?: string;
  description: string;
  highlights: string[];
  terms: string[];
  instantWinPrizes: InstantWinPrize[];
  isFeatured: boolean;
  hostId?: string;
  hostUserId?: string;
  hostName?: string;
  hostSlug?: string;
  hostLogo?: string;
  hostDrawsCount?: number;
  hostVerified?: boolean;
  isAutoDraw?: boolean;
}

export interface RaffleTab {
  id: RaffleTabId;
  label: string;
}
