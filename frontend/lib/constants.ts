import { NavLink, SocialLink } from "../types/common.types";

export const BRAND_NAME = "TCG DRAWS";

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Competitions", href: "/live-raffles" },
  { label: "Winners", href: "/winners" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Verified Hosts", href: "/verified-hosts" },
  { label: "Contact", href: "/contact" },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: "Facebook", href: "https://www.facebook.com/tcgdraws", iconName: "facebook" },
  { platform: "Instagram", href: "https://www.instagram.com/tcgdraws", iconName: "instagram" },
];

export const FOOTER_SECTIONS = [
  {
    title: "Draw Categories",
    links: [
      { label: "All Live Draws", href: "/live-raffles" },
      { label: "Graded Slabs (PSA / BGS)", href: "/live-raffles?category=slabs" },
      { label: "Vintage Booster Packs", href: "/live-raffles?category=vintage" },
      { label: "Sealed Booster Boxes", href: "/live-raffles?category=booster-boxes" },
      { label: "Alternate Arts & Grails", href: "/live-raffles?category=grails" },
    ],
  },
  {
    title: "For Hosts & Breakers",
    links: [
      { label: "Start Hosting", href: "/host/register" },
      { label: "Host Pricing & Fees", href: "/pricing" },
      { label: "Verified Card Shops", href: "/verified-hosts" },
    ],
  },
  {
    title: "Support & Trust",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Contact Support", href: "/contact" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "Free Postal Entry", href: "/terms#free-entry" },
    ],
  },
];
