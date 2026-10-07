import React from "react";
import { COMPARISON_ROWS } from "../../../data/pricing/pricing-comparison.data";

/**
 * Tabular comparison matrix for Free, Premium, and Pro features in TCG Draws luxury style.
 */
export default function PricingComparisonSection() {
  const renderCell = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <div className="flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="w-5 h-5 text-[#D4AF37] shrink-0"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
      ) : (
        <div className="flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4 text-[#6E6655] shrink-0"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </div>
      );
    }
    return <span className="font-heading text-xs md:text-sm text-[#D4AF37] font-bold">{value}</span>;
  };

  return (
    <section className="relative w-full border-b border-[rgba(212,175,55,0.2)] bg-[#090A0E] py-20">
      <div className="container-custom relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-heading font-black text-2xl md:text-4xl text-[#F4EBD9] uppercase tracking-tight">
            Compare Hosting Plans &amp; Features
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#A69B82] mt-2">
            Detailed breakdown of fees, tools, and priority benefits across tiers.
          </p>
        </div>

        {/* Scrollable Comparison Table Frame */}
        <div className="mx-auto w-full max-w-5xl overflow-x-auto rounded-2xl border border-[rgba(212,175,55,0.25)] bg-[#12151F] shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
          <table className="w-full min-w-[650px] border-collapse text-left">
            <thead>
              <tr className="h-[58px] border-b border-[rgba(212,175,55,0.2)] bg-[#181C28]">
                <th className="w-2/5 px-6 font-heading text-xs font-black tracking-wider text-[#F4EBD9] uppercase md:text-sm">
                  Feature
                </th>
                <th className="w-1/5 px-6 text-center font-heading text-xs font-black tracking-wider text-[#A69B82] uppercase md:text-sm">
                  Free
                </th>
                <th className="w-1/5 px-6 text-center font-heading text-xs font-black tracking-wider text-[#D4AF37] uppercase md:text-sm">
                  Premium
                </th>
                <th className="w-1/5 px-6 text-center font-heading text-xs font-black tracking-wider text-[#F5E5C0] uppercase md:text-sm">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, index) => (
                <tr
                  key={row.featureName}
                  className={index % 2 === 0 ? "bg-[#12151F]" : "bg-[#181C28]/60"}
                >
                  <td className="px-6 py-4 font-sans text-xs md:text-sm font-medium text-[#F4EBD9] border-b border-[rgba(212,175,55,0.1)]">
                    {row.featureName}
                  </td>
                  <td className="px-6 py-4 text-center border-b border-[rgba(212,175,55,0.1)]">
                    {renderCell(row.freeValue)}
                  </td>
                  <td className="px-6 py-4 text-center border-b border-[rgba(212,175,55,0.1)]">
                    {renderCell(row.premiumValue)}
                  </td>
                  <td className="px-6 py-4 text-center border-b border-[rgba(212,175,55,0.1)]">
                    {renderCell(row.proValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
