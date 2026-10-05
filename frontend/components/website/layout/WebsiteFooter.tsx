import React from "react";
import Link from "next/link";
import { FOOTER_SECTIONS, BRAND_NAME, SOCIAL_LINKS } from "../../../lib/constants";
import FairwayDrawsLogo from "../shared/FairwayDrawsLogo";

/**
 * Premium Fairway Draws website footer — light theme, golf branding.
 */
export default function WebsiteFooter() {
  const renderSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" /></svg>;
      case "twitter":
        return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
      case "instagram":
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" /></svg>;
      case "discord":
        return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" /></svg>;
      default: return null;
    }
  };

  return (
    <footer className="bg-[#F8FAF6] border-t border-[#EFF4ED] pt-16 pb-10 mt-auto">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">

          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <FairwayDrawsLogo variant="light" size="lg" />

            <p className="font-sans text-xs text-[#5e766c] leading-relaxed max-w-xs">
              The premier platform for luxury golf prize competitions. Win top-tier equipment, club memberships &amp; PGA tournament access — all for a fraction of the price.
            </p>

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-[#0b4d35]/15 rounded-xl text-[10px] font-bold text-[#0b4d35] self-start shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              100% Secure · UK Raffle Compliant
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 mt-1">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.platform}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-[#0b4d35]/15 text-[#5e766c] hover:text-[#0b4d35] hover:border-[#0b4d35]/35 hover:shadow-md transition-all duration-200"
                  aria-label={`${link.platform} Profile`}
                >
                  {renderSocialIcon(link.platform)}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-4">
              <h4 className="font-sans font-black text-xs text-[#0b4d35] uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-sans text-xs text-[#5e766c] hover:text-[#0b4d35] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#EFF4ED] pt-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 text-[10px] text-[#5e766c] leading-relaxed">
          <div className="max-w-3xl">
            <p className="mb-1.5 font-semibold">
              © {new Date().getFullYear()} {BRAND_NAME} Ltd. All rights reserved. Registered in England &amp; Wales.
            </p>
            <p>
              Prize draws are operated in accordance with the UK Gambling Act 2005 as compliant prize competitions. Participation is limited to individuals aged 18 or older. Ticket purchases are final and non-refundable.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#0b4d35]/15 px-4 py-2.5 rounded-xl text-[10px] text-[#0b4d35] font-bold whitespace-nowrap shadow-sm shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            SSL Secured Payments
          </div>
        </div>
      </div>
    </footer>
  );
}
