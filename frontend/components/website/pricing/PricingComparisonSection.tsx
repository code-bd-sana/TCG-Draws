import React from "react";
import { COMPARISON_ROWS } from "../../../data/pricing/pricing-comparison.data";

/**
 * Tabular comparison matrix for Free, Premium, and Pro features.
 * Features clean alternate row coloring, check/dash status indicators, and mobile scroll support.
 */
export default function PricingComparisonSection() {
  // Renders cell value helper: boolean checks or string labels
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
            className="w-5 h-5 text-primary shrink-0"
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
            className="w-4 h-4 text-text-muted/30 shrink-0"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </div>
      );
    }
    return <span className="font-sans text-xs md:text-sm text-text-brand font-medium">{value}</span>;
  };

  return (
    <section className="relative w-full border-b border-[#bcd5b8] bg-[#cfdfcb] py-20 before:absolute before:inset-0 before:bg-[radial-gradient(#0b4d3520_1px,transparent_1px)] before:bg-[size:28px_28px]">
      <div className="container-custom relative">
        {/* Header Title */}
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-2xl md:text-4xl text-text-primary tracking-tight">
            Compare Hosting Plans & Features
          </h2>
        </div>

        {/* Scrollable Comparison Table Frame */}
        <div className="mx-auto w-full max-w-5xl overflow-x-auto rounded-[18px] border border-[#bdd3ba] bg-[#edf5e9] shadow-[0_12px_28px_rgba(11,77,53,.12)]">
          <table className="w-full min-w-[650px] border-collapse text-left">
            
            {/* Table Header */}
            <thead>
              <tr className="h-[58px] border-b border-[#bdd3ba] bg-[#0b4d35]">
                <th className="w-2/5 px-6 font-heading text-xs font-bold tracking-wider text-white uppercase md:text-sm">
                  Feature
                </th>
                <th className="w-1/5 px-6 text-center font-heading text-xs font-bold tracking-wider text-white uppercase md:text-sm">
                  Free
                </th>
                <th className="w-1/5 px-6 text-center font-heading text-xs font-bold tracking-wider text-white uppercase md:text-sm">
                  Premium
                </th>
                <th className="w-1/5 px-6 text-center font-heading text-xs font-bold tracking-wider text-white uppercase md:text-sm">
                  Pro
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {COMPARISON_ROWS.map((row, index) => (
                <tr
                  key={row.featureName}
                  className={index % 2 === 0 ? "bg-[#edf5e9]" : "bg-[#e3efdf]"}
                >
                  {/* Feature Label Name */}
                  <td className="font-sans font-medium text-xs md:text-sm text-text-muted px-6 py-4.5">
                    {row.featureName}
                  </td>

                  {/* Free Value */}
                  <td className="text-center px-6 py-4.5 border-l border-divider/50">
                    {renderCell(row.freeValue)}
                  </td>
                  
                  {/* Premium Value */}
                  <td className="text-center px-6 py-4.5 border-l border-divider/50">
                    {renderCell(row.premiumValue)}
                  </td>
                  
                  {/* Pro Value */}
                  <td className="text-center px-6 py-4.5 border-l border-divider/50">
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


