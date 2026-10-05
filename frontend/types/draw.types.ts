export type DrawStatus = "upcoming" | "live" | "ended" | "sold_out";

/**
 * Interface representing a competition or prize draw.
 * Built to easily consume API response values in the future.
 */
export interface Draw {
  id: string;
  title: string;
  description?: string;
  image: string;
  ticketPrice: number;
  totalTickets: number;
  soldTickets: number;
  endDate: string; // String format for display (e.g., "Ends in 3d 14h" or ISO Date string)
  rawEndDate?: string;
  status: DrawStatus;
  isFeatured?: boolean;
  category: string; // e.g. "drivers", "irons", "putters", "experiences", "apparel", "cash", "luxury"
  worthPrice?: number; // Valuation of the prize (e.g. 1200)
  mainPrizeValue?: number; // Declared value of the main prize
  prizeName?: string; // Declared name of main prize
  slug?: string; // Optional SEO-friendly URL slug (e.g. 'callaway-paradym-ai-smoke-driver')
  instantWinsCount?: number; // For Instant Win draws (e.g. 3)
  isInstantWin?: boolean; // Flag to separate standard draws from instant win draws
  badgeText?: string; // Optional label badge on the card (e.g., "ALMOST GONE", "NEW")
}
