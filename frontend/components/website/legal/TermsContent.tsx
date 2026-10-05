"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "../../../lib/utils";

const SECTIONS = [
  { id: "promoter", title: "1. The Promoter" },
  { id: "competition", title: "2. The Competition" },
  { id: "how-to-enter", title: "3. How to Enter" },
  { id: "free-entry", title: "3.11. Free Postal Entry Route" },
  { id: "choosing-winner", title: "4. Choosing a Winner" },
  { id: "eligibility", title: "5. Eligibility" },
  { id: "prize", title: "6. The Prize" },
  { id: "winners", title: "7. Winners" },
  { id: "claiming-prize", title: "8. Claiming the Prize" },
  { id: "liability", title: "9. Limitation of Liability" },
  { id: "data-protection", title: "10. Data Protection & Publicity" },
  { id: "general", title: "11. General Terms" },
  { id: "aml-policy", title: "12. Anti-Money Laundering (AML)" },
  { id: "fair-play", title: "13. Fair Play & One Account Policy" },
];

export default function TermsContent() {
  const [activeSection, setActiveSection] = useState("promoter");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="legal-campaign w-full pt-24 pb-20">
      
      {/* Top Banner */}
      <div className="border-b border-[#2D3C13] bg-[#111210]/60 backdrop-blur-md py-12 mb-12">
        <div className="container-custom max-w-6xl mx-auto px-4">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A230A] border border-[#43581E] text-[#8CB34A] text-xs font-semibold w-fit">
              <span>📜 Official Legal Documentation</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#E8EDD4] tracking-tight">
              Terms & Conditions
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#72943A] max-w-2xl">
              Official rules governing all prize competitions, free postal entries, eligibility, anti-money laundering policies, and fair play on Fairway Draws.
            </p>
            <div className="flex items-center gap-4 text-xs font-sans text-[#5A752A] pt-2">
              <span>Last Updated: July 2026</span>
              <span>•</span>
              <span>Effective Version: 2.4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sticky Toc + Content */}
      <div className="container-custom max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Table of Contents */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-28 bg-[#edf5e9] border border-[#bdd3ba] rounded-2xl p-5 space-y-2 shadow-[0_10px_25px_rgba(11,77,53,0.09)]">
              <h3 className="font-heading font-bold text-xs text-[#073826] uppercase tracking-wider mb-3 px-2">
                Table of Contents
              </h3>
              <nav className="flex flex-col space-y-1">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={cn(
                      "text-left px-3 py-2 rounded-xl text-xs font-sans transition-all duration-200 truncate cursor-pointer",
                      activeSection === sec.id
                        ? "bg-[#0b4d35] text-white font-semibold border-l-2 border-[#147a54] pl-3 shadow-sm"
                        : "text-[#426256] hover:bg-[#dcebd8] hover:text-[#073826]"
                    )}
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>
              
              <div className="pt-4 border-t border-[#bdd3ba] mt-4">
                <Link
                  href="/contact"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0b4d35] hover:bg-[#073826] border border-[#0b4d35] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  ✉️ Need Legal Help? Contact Us
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Main Text Content */}
          <main className="lg:col-span-8 space-y-12 text-sm leading-relaxed text-[#426256]">
            
            {/* 1. The Promoter */}
            <section id="promoter" className="bg-[#edf5e9] border border-[#bdd3ba] rounded-2xl p-6 sm:p-8 space-y-4 shadow-[0_10px_25px_rgba(11,77,53,0.09)]">
              <h2 className="font-heading font-bold text-xl text-[#073826] border-b border-[#bdd3ba] pb-3">
                1. The Promoter
              </h2>
              <p>
                1.1. The Promoter is: <strong className="text-[#073826]">Fairway Draws Ltd — Company No. 17396815</strong> ("Fairway Draws") whose registered office is at Synergy House, Lawson Street, North Shields NE29 6TG.
              </p>
              <p>
                1.2. Our correspondence address is: <span className="text-[#073826] font-medium">Synergy House, Lawson Street, North Shields NE29 6TG</span>.
              </p>
              <p>
                1.3. If you wish to contact us for any reason, please email us at{" "}
                <a
                  href="mailto:info@fairwaydraws.com"
                  className="text-[#0b4d35] font-semibold underline underline-offset-4 decoration-[#0b4d35]/60 hover:text-[#073826] hover:decoration-[#073826] transition-colors"
                >
                  info@fairwaydraws.com
                </a>.
              </p>
            </section>

            {/* 2. The Competition */}
            <section id="competition" className="bg-[#edf5e9] border border-[#bdd3ba] rounded-2xl p-6 sm:p-8 space-y-4 shadow-[0_10px_25px_rgba(11,77,53,0.09)]">
              <h2 className="font-heading font-bold text-xl text-[#073826] border-b border-[#bdd3ba] pb-3">
                2. The Competition
              </h2>
              <p>
                2.1. These terms and conditions apply to all competitions listed on the Promoter’s website at{" "}
                <a
                  href="https://fairwaydraws.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0b4d35] font-semibold underline underline-offset-4 decoration-[#0b4d35]/60 hover:text-[#073826] hover:decoration-[#073826] transition-colors"
                >
                  https://fairwaydraws.com
                </a>{" "}
                (the “Website”).
              </p>
              <p>
                2.2. All competitions listed on the Website operate as prize draws. Entry fees for online entries are payable each time you enter. A free postal entry route is available for every competition.
              </p>
              <p>
                2.3. To enter a competition and be in with a chance of winning, each participant (an “Entrant”) must purchase ticket entries online via the Website or submit a free entry via the postal route in accordance with these terms.
              </p>
            </section>

            {/* 3. How to Enter */}
            <section id="how-to-enter" className="bg-[#edf5e9] border border-[#bdd3ba] rounded-2xl p-6 sm:p-8 space-y-4 shadow-[0_10px_25px_rgba(11,77,53,0.09)]">
              <h2 className="font-heading font-bold text-xl text-[#073826] border-b border-[#bdd3ba] pb-3">
                3. How to Enter
              </h2>
              <p>
                3.1. The competition will run from and including the opening and closing dates specified on the Website. These dates shall be referred to as the “Opening Date” and “Closing Date” respectively. All times and dates referred to are London, England time (GMT/BST).
              </p>
              <p>
                3.2. If it is absolutely necessary to do so, the Promoter reserves the right to change the Opening and Closing Dates. If the Promoter does change dates, the new details will be displayed on the Website. The Promoter will not extend the Closing Date simply to sell more entries.
              </p>
              <p>
                3.3. All competition entries must be received by the Promoter no later than the specified time on the Closing Date. Entries received after the specified time may be disqualified without a refund.
              </p>
              <p>
                3.4. The maximum number of entries to the competition will be stated on the Website. The number of entries you are able to make may be limited if the maximum number of entries is reached.
              </p>
              <p>
                3.5. Entrants can enter each competition as many times as they wish until the maximum per-user ticket limit is reached.
              </p>
              <p>
                3.6. To enter online: (a) view the Competition on the Website; (b) select your desired ticket quantity; (c) complete checkout payment to receive your order confirmation and allocated ticket number(s).
              </p>

              {/* Free Postal Entry Box */}
              <div id="free-entry" className="mt-6 bg-[#e2efde] border border-[#c4d9c1] rounded-xl p-5 space-y-3">
                <h3 className="font-heading font-bold text-base text-[#073826] flex items-center gap-2">
                  <span>✉️ 3.11. Free Postal Entry Route Method</span>
                </h3>
                <p className="text-xs leading-relaxed text-[#426256]">
                  You may enter any competition for free by post by complying with the following conditions:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-[#233830] pl-2">
                  <li>Send your entry on an unenclosed postcard by 1st or 2nd class post to: <strong className="text-[#073826]">Fairway Draws Ltd, Synergy House, Lawson Street, North Shields NE29 6TG</strong>.</li>
                  <li>Include your full name, postal address, contact phone number, email address, and the exact Competition Name.</li>
                  <li><strong className="text-[#073826]">Mandatory Requirement:</strong> You MUST have created a free registered account on the Website for the free entry to be processed. Details on the postcard MUST correspond exactly to your registered account.</li>
                  <li>Each free entry must be posted separately on an individual postcard. Bulk entries in an envelope will count as only one single entry.</li>
                  <li>Entries must be received prior to the Closing Date.</li>
                </ul>
              </div>
            </section>

            {/* 4. Choosing a Winner */}
            <section id="choosing-winner" className="bg-[#edf5e9] border border-[#bdd3ba] rounded-2xl p-6 sm:p-8 space-y-4 shadow-[0_10px_25px_rgba(11,77,53,0.09)]">
              <h2 className="font-heading font-bold text-xl text-[#073826] border-b border-[#bdd3ba] pb-3">
                4. Choosing a Winner
              </h2>
              <p>
                4.1. All valid Entrants will be placed into a draw and the winner will be chosen by a secure random number generator (RNG) live draw within 7 days of the Closing Date (“Draw Date”).
              </p>
              <p>
                4.2. All Entrants will have their names and entry numbers included in an entry spreadsheet published on the Website during the live draw. If you wish to censor your name on the live spreadsheet, notify us at{" "}
                <a
                  href="mailto:info@fairwaydraws.com"
                  className="text-[#0b4d35] font-semibold underline underline-offset-4 decoration-[#0b4d35]/60 hover:text-[#073826] hover:decoration-[#073826] transition-colors"
                >
                  info@fairwaydraws.com
                </a>{" "}
                at least 48 hours prior to the draw.
              </p>
              <p>
                4.3. <strong className="text-[#073826]">Instant Win Draws:</strong> Where a competition includes Instant Win prizes, ticket numbers are randomly allocated upon completed ticket purchase. If an allocated ticket number matches a pre-determined Instant Win prize number, the Entrant is automatically notified and wins the corresponding Instant Win prize immediately.
              </p>
            </section>

            {/* 5. Eligibility */}
            <section id="eligibility" className="bg-[#edf5e9] border border-[#bdd3ba] rounded-2xl p-6 sm:p-8 space-y-4 shadow-[0_10px_25px_rgba(11,77,53,0.09)]">
              <h2 className="font-heading font-bold text-xl text-[#073826] border-b border-[#bdd3ba] pb-3">
                5. Eligibility
              </h2>
              <p>
                5.1. Competitions are open to residents in the United Kingdom aged <strong className="text-[#073826]">18 years or over</strong>, except employees of Fairway Draws, their immediate families, or agents directly connected with competition administration.
              </p>
              <p>
                5.2. Proof of age and UK residency will be required prior to releasing any major prize.
              </p>
              <p>
                5.3. Fraudulent activity, hacking, site interference, or abusive behavior toward staff or hosts will result in immediate disqualification and account termination.
              </p>
            </section>

            {/* 6. The Prize */}
            <section id="prize" className="bg-[#edf5e9] border border-[#bdd3ba] rounded-2xl p-6 sm:p-8 space-y-4 shadow-[0_10px_25px_rgba(11,77,53,0.09)]">
              <h2 className="font-heading font-bold text-xl text-[#073826] border-b border-[#bdd3ba] pb-3">
                6. The Prize
              </h2>
              <p>
                6.1. The prize details are described on the Website. Prizes are non-transferable and subject to availability.
              </p>
              <p>
                6.2. Physical, Vehicle & Experience Prizes: Winners are solely responsible for ensuring appropriate safety precautions, valid insurance (where applicable for vehicle or equipment prizes), and lawful usage on public or private property. For experience prizes, winners are responsible for their own travel arrangements and adhering to venue regulations.
              </p>
              <p>
                6.3. Fairway Draws reserves the right to substitute a prize with an equivalent cash alternative if circumstances beyond reasonable control make it necessary.
              </p>
            </section>

            {/* 7. Winners */}
            <section id="winners" className="bg-[#edf5e9] border border-[#bdd3ba] rounded-2xl p-6 sm:p-8 space-y-4 shadow-[0_10px_25px_rgba(11,77,53,0.09)]">
              <h2 className="font-heading font-bold text-xl text-[#073826] border-b border-[#bdd3ba] pb-3">
                7. Winners
              </h2>
              <p>
                7.1. Winners will be contacted personally via phone or email within 7 days of the Draw Date.
              </p>
              <p>
                7.2. All winners will be announced publicly on the Website and our official communication channels following draw verification.
              </p>
            </section>

            {/* 8. Claiming the Prize */}
            <section id="claiming-prize" className="bg-[#edf5e9] border border-[#bdd3ba] rounded-2xl p-6 sm:p-8 space-y-4 shadow-[0_10px_25px_rgba(11,77,53,0.09)]">
              <h2 className="font-heading font-bold text-xl text-[#073826] border-b border-[#bdd3ba] pb-3">
                8. Claiming the Prize
              </h2>
              <p>
                8.1. <strong className="text-[#073826]">21-Day Claim Limit:</strong> Winners have 21 days from notification to claim their prize. If uncontactable after 21 days or if a winner fails to provide required verification details, an alternate winner will be selected via random redraw.
              </p>
              <p>
                8.2. Cash prizes will be transferred directly to the winner's verified UK bank account. The winner must prove sole or joint beneficiary ownership of the account.
              </p>
              <p>
                8.3. Physical prizes will be dispatched via tracked courier to the UK address associated with the winner's verified account within 14 days of successful verification.
              </p>
            </section>

            {/* 9. Limitation of Liability */}
            <section id="liability" className="bg-[#edf5e9] border border-[#bdd3ba] rounded-2xl p-6 sm:p-8 space-y-4 shadow-[0_10px_25px_rgba(11,77,53,0.09)]">
              <h2 className="font-heading font-bold text-xl text-[#073826] border-b border-[#bdd3ba] pb-3">
                9. Limitation of Liability
              </h2>
              <p>
                9.1. Fairway Draws accepts no liability for technical failures, network outages, payment gateway delays, or lost postal entries.
              </p>
              <p>
                9.2. To the fullest extent permitted by law, Fairway Draws and its registered hosts shall not be liable for any loss, damage, personal injury, or death resulting from participation in any draw or the use of any prize, except where caused by negligence.
              </p>
            </section>

            {/* 10. Data Protection & Publicity */}
            <section id="data-protection" className="bg-[#edf5e9] border border-[#bdd3ba] rounded-2xl p-6 sm:p-8 space-y-4 shadow-[0_10px_25px_rgba(11,77,53,0.09)]">
              <h2 className="font-heading font-bold text-xl text-[#073826] border-b border-[#bdd3ba] pb-3">
                10. Data Protection & Publicity
              </h2>
              <p>
                10.1. Personal information provided will be processed strictly in accordance with our{" "}
                <Link
                  href="/privacy"
                  className="text-[#0b4d35] font-semibold underline underline-offset-4 decoration-[#0b4d35]/60 hover:text-[#073826] hover:decoration-[#073826] transition-colors"
                >
                  Privacy Policy
                </Link>{" "}
                and UK GDPR regulations.
              </p>
              <p>
                10.2. Winners consent to the publication of their first name, surname initial, and general town or county for statutory Advertising Standards Authority (ASA) compliance and public draw verification proof.
              </p>
            </section>

            {/* 11. General Terms */}
            <section id="general" className="bg-[#edf5e9] border border-[#bdd3ba] rounded-2xl p-6 sm:p-8 space-y-4 shadow-[0_10px_25px_rgba(11,77,53,0.09)]">
              <h2 className="font-heading font-bold text-xl text-[#073826] border-b border-[#bdd3ba] pb-3">
                11. General Terms & Governing Law
              </h2>
              <p>
                11.1. Competitions are governed by English Law and the exclusive jurisdiction of the courts of England & Wales.
              </p>
              <p>
                11.2. Competitions on Fairway Draws are in no way sponsored, endorsed, or administered by Meta (Facebook/Instagram) or any golf equipment manufacturer or venue unless explicitly stated.
              </p>
            </section>

            {/* 12. AML Policy */}
            <section id="aml-policy" className="bg-[#edf5e9] border border-[#bdd3ba] rounded-2xl p-6 sm:p-8 space-y-4 shadow-[0_10px_25px_rgba(11,77,53,0.09)]">
              <h2 className="font-heading font-bold text-xl text-[#073826] border-b border-[#bdd3ba] pb-3">
                12. Anti-Money Laundering (AML) Policy
              </h2>
              <p>
                12.1. Fairway Draws enforces strict anti-money laundering measures under UK regulations and the Gambling Act 2005.
              </p>
              <p>
                12.2. A designated Money Laundering Reporting Officer (MLRO) oversees platform compliance.
              </p>
              <p>
                12.3. Anonymous accounts, cash payments, or registrations under 18 years of age are strictly prohibited. Refunds & prize transfers are executed back to the original funding route.
              </p>
            </section>

            {/* 13. Fair Play */}
            <section id="fair-play" className="bg-[#edf5e9] border border-[#bdd3ba] rounded-2xl p-6 sm:p-8 space-y-4 shadow-[0_10px_25px_rgba(11,77,53,0.09)]">
              <h2 className="font-heading font-bold text-xl text-[#073826] border-b border-[#bdd3ba] pb-3">
                13. Fair Play & Strict One Account Policy
              </h2>
              <p>
                13.1. <strong className="text-[#073826]">One Account Per Person:</strong> Each participant is strictly limited to one user account on Fairway Draws.
              </p>
              <p>
                13.2. Creating duplicate accounts to gain an unfair advantage in free giveaways or bypass ticket limits is strictly forbidden.
              </p>
              <p>
                13.3. If duplicate accounts are detected, all entries will be rendered void and forfeited without refund, and offending accounts will be permanently banned.
              </p>
            </section>

          </main>

        </div>
      </div>
    </div>
  );
}
