import { StatItem } from "../../types/homepage.types";

export interface TrustBenefit {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export const trustStatsData: StatItem[] = [
  {
    id: "trust-stat-1",
    value: "2,400+",
    label: "Draws Completed",
  },
  {
    id: "trust-stat-2",
    value: "£350,000+",
    label: "Grails Delivered",
  },
  {
    id: "trust-stat-3",
    value: "14,500+",
    label: "Active Collectors",
  },
];

export const trustBenefitsData: TrustBenefit[] = [
  {
    id: "benefit-1",
    title: "100% Authenticated Cards",
    description: "Every single slab in our draws is graded and certified genuine by PSA, BGS, or CGC with online verification.",
    iconName: "ShieldCheckIcon",
  },
  {
    id: "benefit-2",
    title: "Fast Next-Day Payouts",
    description: "Verified card shops and pack breakers receive prompt escrow payouts immediately following draw completion.",
    iconName: "LockClosedIcon",
  },
  {
    id: "benefit-3",
    title: "Provably Fair Live Streams",
    description: "All draws are conducted live on stream with independent third-party random number generation for full transparency.",
    iconName: "SparklesIcon",
  },
];
