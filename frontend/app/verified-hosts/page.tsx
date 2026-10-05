import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import VerifiedHostsList from "../../components/website/verified-hosts/VerifiedHostsList";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";

export const metadata: Metadata = {
  title: "Verified Hosts | Fairway Draws",
  description: "Browse verified hosts running premium golf competitions.",
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
      <main className="flex-grow bg-[#cfdfcb]">
        <section className="relative isolate overflow-hidden border-b border-[#174f36] bg-[#073826] pt-28 pb-14 sm:pt-32 md:pb-16">
          <Image src="/hero-banner.jpg" alt="Golf course at golden hour" fill priority className="-z-20 object-cover object-[68%_center] opacity-90" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#032b1d]/95 via-[#06452f]/72 to-[#073826]/18" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f8faf6]/82 to-transparent" />
          <div className="container-custom relative">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#073826]/85 px-4 py-2 font-sans text-[10px] font-black tracking-[.16em] text-white uppercase shadow-lg backdrop-blur-sm"><span className="h-1.5 w-1.5 rounded-full bg-[#dc2626]" /> Trusted partners</span>
              <h1 className="mt-5 font-heading text-4xl font-black leading-[.9] tracking-[-.055em] text-white uppercase [text-shadow:0_5px_18px_rgba(0,0,0,.3)] sm:text-5xl md:text-6xl">Meet our verified<br />golf hosts</h1>
              <p className="mt-5 max-w-2xl rounded-2xl border border-white/15 bg-[#042d1e]/58 p-3.5 font-sans text-sm font-medium leading-relaxed text-white/85 shadow-xl backdrop-blur-sm sm:text-base">Explore the fully vetted clubs, brands, and golf specialists running transparent Fairway Draws competitions.</p>
            </div>
          </div>
        </section>
        <section className="relative py-12 before:absolute before:inset-0 before:bg-[radial-gradient(#0b4d3520_1px,transparent_1px)] before:bg-[size:28px_28px] md:py-16"><div className="container-custom relative"><VerifiedHostsList hosts={verifiedHosts} /></div></section>
      </main>
      <WebsiteFooter />
    </>
  );
}
