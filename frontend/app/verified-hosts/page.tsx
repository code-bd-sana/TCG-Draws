import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import VerifiedHostsList from "../../components/website/verified-hosts/VerifiedHostsList";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";

export const metadata: Metadata = {
  title: "Verified Card Shops & Hosts | TCG Draws",
  description: "Browse verified card shops and breakers hosting authentic Pokémon TCG draws.",
};

export default async function VerifiedHostsPage() {
  let verifiedHosts = [];
  try {
    const apiUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1';
    const res = await fetch(`${apiUrl}/hosts/verified`, {
      cache: 'no-store'
    });

    if (res.ok) {
      const json = await res.json();
      const rawHosts = json.data || json;
      if (Array.isArray(rawHosts)) {
        verifiedHosts = rawHosts.filter(
          (host: any) => host && host.isVerified === true && !host.isBlocked
        );
      }
    }
  } catch (err) {
    console.error("Failed to fetch verified hosts", err);
  }

  return (
    <>
      <WebsiteNavbar />
      <main className="flex-grow bg-[#090A0E]">
        <section className="relative isolate overflow-hidden border-b border-[rgba(212,175,55,0.2)] bg-[#090A0E] pt-28 pb-14 sm:pt-32 md:pb-16">
          {/* Ambient Lighting */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#141722_1px,transparent_1px),linear-gradient(to_bottom,#141722_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-35" />
            <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-[90px]" />
            <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(163,123,36,0.12)_0%,transparent_70%)] blur-[100px]" />
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#090A0E] to-transparent" />
          </div>

          <div className="container-custom relative z-10">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.35)] bg-[#12151F]/90 px-4 py-2 font-sans text-[10px] font-black uppercase tracking-[0.18em] text-[#F4EBD9] shadow-[0_0_20px_rgba(212,175,55,0.1)] backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_8px_#D4AF37]" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#F5E5C0]">
                  VETTED BREAKERS &amp; CARD SHOPS
                </span>
              </span>
              <h1 className="mt-4 font-heading text-4xl sm:text-5xl md:text-6xl font-black leading-[0.95] tracking-[-0.04em] text-[#F4EBD9] uppercase">
                MEET OUR VERIFIED{" "}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D4] via-[#D4AF37] to-[#B39042] drop-shadow-[0_2px_15px_rgba(212,175,55,0.3)]">
                  CARD HOSTS
                </span>
              </h1>
              <p className="mt-4 max-w-2xl rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#12151F]/70 p-4 font-sans text-xs sm:text-sm font-medium leading-relaxed text-[#D6CEBC] shadow-lg backdrop-blur-md">
                Explore the fully vetted card shops, trusted live breakers, and vintage Pokémon specialists hosting transparent competitions on TCG Draws.
              </p>
            </div>
          </div>
        </section>
        <section className="relative py-14">
          <div className="container-custom relative z-10">
            <VerifiedHostsList hosts={verifiedHosts} />
          </div>
        </section>
      </main>
      <WebsiteFooter />
    </>
  );
}
