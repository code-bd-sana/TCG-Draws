import { NavLink, SocialLink } from "../types/common.types";

export const BRAND_NAME = "Fairway Draws";

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
  { platform: "Facebook", href: "https://www.facebook.com/share/p/1CgGzyPthk/", iconName: "facebook" },
  { platform: "Instagram", href: "https://www.instagram.com/fairwaydrawsltd?stkn=N3dwcTA5a3AycHJq&utm_source=qr", iconName: "instagram" },
];

export const FOOTER_SECTIONS = [
  {
    title: "Competitions",
    links: [
      { label: "All Live Draws", href: "/live-raffles" },
      { label: "Drivers & Woods", href: "/live-raffles?category=drivers" },
      { label: "Iron Sets & Wedges", href: "/live-raffles?category=irons" },
      { label: "Putters & Accessories", href: "/live-raffles?category=putters" },
      { label: "VIP Golf Experiences", href: "/live-raffles?category=experiences" },
    ],
  },
  {
    title: "For Hosts",
    links: [
      { label: "Start Hosting", href: "/#host-info" },
      { label: "Pricing & Fees", href: "/pricing" },
      { label: "Verified Hosts", href: "/verified-hosts" },
    ],
  },
  {
    title: "Support & Legal",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Contact Support", href: "/contact" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "Free Entry Method", href: "/terms#free-entry" },
    ],
  },
];
