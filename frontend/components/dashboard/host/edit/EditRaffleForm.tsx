"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetRaffleById, useUpdateRaffle } from "../../../../hooks/useRaffleHooks";
import { usePublicCategories } from "../../../../hooks/useCategoryHooks";
import { cn } from "../../../../lib/utils";
import { toast } from "sonner";
import { parseUkDateTimeToUtc, formatUtcToUkInputString } from "../../../../lib/uk-time";

interface Props {
  raffleId: string;
}

const DEFAULT_CATEGORIES = [
  "Golf Drivers",
  "Golf Irons",
  "Golf Putters",
  "Golf Bags & Apparel",
  "Rangefinders & Tech",
  "Experiences & Bundles",
];

export default function EditRaffleForm({ raffleId }: Props) {
  const router = useRouter();
  const { data: raffle, isLoading } = useGetRaffleById(raffleId);
  const { data: dbCategories } = usePublicCategories();
  const updateMutation = useUpdateRaffle();

  const categoryOptions = (dbCategories && dbCategories.length > 0)
    ? dbCategories.map((c) => c.name)
    : DEFAULT_CATEGORIES;

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (raffle) {
      setFormData({
        title: raffle.title || "",
        category: (raffle as any).category || "Golf Drivers",
        description: raffle.description || "",
        prizeName: raffle.prizeName || "",
        mainPrizeValue: (raffle as any).mainPrizeValue ?? "",
        totalTickets: raffle.totalTickets || "",
        pricePerTicket: raffle.pricePerTicket || "",
        minTickets: (raffle as any).minTickets ?? 1,
        maxTickets: (raffle as any).maxTickets ?? "",
        startDate: formatUtcToUkInputString(raffle.startDate),
        endDate: formatUtcToUkInputString(raffle.endDate),
        isAutoDraw: raffle.isAutoDraw ?? true,
        autoDrawDate: raffle.autoDrawDate ?? true,
        autoDrawSoldOut: raffle.autoDrawSoldOut ?? false,
      });
    }
  }, [raffle]);

  const hasSoldTickets = (raffle?.ticketsSold ?? 0) > 0;

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      
      // Convert dates from UK local input to UTC ISO string
      if (payload.startDate) {
        const utcStart = parseUkDateTimeToUtc(payload.startDate);
        if (!utcStart || isNaN(utcStart.getTime())) {
          toast.error("Please enter a valid start date & time (UK Time).");
          return;
        }
        payload.startDate = utcStart.toISOString();
      }
      if (payload.endDate) {
        const utcEnd = parseUkDateTimeToUtc(payload.endDate);
        if (!utcEnd || isNaN(utcEnd.getTime())) {
          toast.error("Please enter a valid draw date & time (UK Time).");
          return;
        }
        payload.endDate = utcEnd.toISOString();
      }
      if (payload.startDate && payload.endDate && new Date(payload.endDate) <= new Date(payload.startDate)) {
        toast.error("Draw date must be strictly after the start date (UK Time).");
        return;
      }
      
      // Convert numbers
      if (payload.totalTickets) payload.totalTickets = Number(payload.totalTickets);
      if (payload.pricePerTicket) payload.pricePerTicket = Number(payload.pricePerTicket);
      if (payload.mainPrizeValue !== undefined && payload.mainPrizeValue !== "") {
        payload.mainPrizeValue = Number(payload.mainPrizeValue);
      } else {
        payload.mainPrizeValue = null;
      }

      payload.minTickets =
        payload.minTickets !== undefined && payload.minTickets !== ""
          ? Math.max(1, Number(payload.minTickets))
          : 1;

      payload.maxTickets =
        payload.maxTickets !== undefined && payload.maxTickets !== ""
          ? Number(payload.maxTickets)
          : null;

      if (payload.maxTickets !== null) {
        if (payload.maxTickets < payload.minTickets) {
          toast.error("Maximum tickets per person must be greater than or equal to minimum tickets.");
          return;
        }
        const effectiveTotal = payload.totalTickets || raffle?.totalTickets;
        if (effectiveTotal && payload.maxTickets > effectiveTotal) {
          toast.error("Maximum tickets per person cannot exceed total tickets.");
          return;
        }
      }

      await updateMutation.mutateAsync({ id: raffleId, data: payload });
      toast.success("Competition updated successfully!");
      router.push("/dashboard/host/competitions");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update competition.");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-surface border border-divider rounded-card p-10 flex flex-col items-center justify-center text-center gap-3 animate-pulse">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-sans font-semibold text-sm text-text-secondary">Loading competition details...</p>
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="w-full bg-surface border border-divider rounded-card p-10 flex flex-col items-center justify-center text-center gap-4">
        <p className="font-sans font-bold text-base text-red-500">Competition not found.</p>
        <Link
          href="/dashboard/host/competitions"
          className="font-heading font-bold text-xs uppercase tracking-wider text-primary hover:underline"
        >
          &larr; Back to Competitions
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Header with Back Link */}
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/host/competitions"
          className="inline-flex items-center gap-1.5 font-sans font-semibold text-xs text-text-secondary hover:text-text-primary transition-colors w-fit select-none"
        >
          &larr; Back to Competitions
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-divider">
          <div>
            <h1 className="font-heading font-black text-2xl md:text-3xl text-text-primary uppercase tracking-tight">
              Edit Competition {raffle?.title ? <span className="text-text-muted font-normal text-lg md:text-xl block sm:inline sm:ml-2">({raffle.title})</span> : null}
            </h1>
            <p className="font-sans text-xs md:text-sm text-text-secondary mt-1">
              Update competition details and draw settings for your entrants.
            </p>
          </div>
          {/* {hasSoldTickets && (
            <div className="bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-badge flex items-center gap-2 select-none shrink-0 w-fit">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="font-sans font-semibold text-xs text-amber-700 dark:text-amber-400">
                Tickets Sold ({raffle.ticketsSold}) — Ticket counts &amp; pricing locked
              </span>
            </div>
          )} */}
        </div>
      </div>

      {/* Main Form Card */}
      <div className="w-full bg-surface border border-divider rounded-card p-6 md:p-8 shadow-card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Section 1: Basic Information */}
          <div className="flex flex-col gap-4">
            <h2 className="font-heading font-bold text-sm text-text-brand uppercase tracking-wider border-b border-divider/60 pb-2">
              1. Competition Description
            </h2>

            {/* Title - Commented out per client request (host cannot change title) */}
            {/* <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="font-sans font-medium text-xs md:text-sm text-text-primary">
                Competition Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
                required
                placeholder="e.g. Brand New TaylorMade Qi10 Driver"
                className="w-full h-[46px] bg-bg border border-border rounded-button px-4 font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div> */}

            {/* Category - Commented out per client request */}
            {/* <div className="flex flex-col gap-1.5">
              <label htmlFor="category" className="font-sans font-medium text-xs md:text-sm text-text-primary">
                Category *
              </label>
              <select
                id="category"
                value={formData.category || (categoryOptions[0] ?? "Golf Drivers")}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full h-[46px] bg-bg border border-border rounded-button px-4 font-sans text-xs md:text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div> */}

            {/* Prize Name - Commented out per client request */}
            {/* <div className="flex flex-col gap-1.5">
              <label htmlFor="prizeName" className="font-sans font-medium text-xs md:text-sm text-text-primary">
                Main Prize Name
              </label>
              <input
                id="prizeName"
                type="text"
                value={formData.prizeName || ""}
                onChange={(e) => handleChange("prizeName", e.target.value)}
                placeholder="e.g. TaylorMade Qi10 Driver Stiff Shaft"
                className="w-full h-[46px] bg-bg border border-border rounded-button px-4 font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div> */}

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="font-sans font-medium text-xs md:text-sm text-text-primary">
                Full Description
              </label>
              <textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={5}
                placeholder="Describe the prize specs, condition, and terms..."
                className="w-full p-4 bg-bg border border-border rounded-button font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
              />
            </div>
          </div>

          {/* Section 2: Tickets & Pricing - Commented out per client request (Cannot change ticket number and price) */}
          {/* <div className="flex flex-col gap-4 pt-4 border-t border-divider/60">
            <h2 className="font-heading font-bold text-sm text-text-brand uppercase tracking-wider border-b border-divider/60 pb-2">
              2. Ticket Allocation &amp; Pricing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="mainPrizeValue" className="font-sans font-medium text-xs md:text-sm text-text-primary">
                  Main Prize Value (£)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-heading font-bold text-xs text-text-brand">
                    £
                  </span>
                  <input
                    id="mainPrizeValue"
                    type="number"
                    step="0.01"
                    value={formData.mainPrizeValue || ""}
                    onChange={(e) => handleChange("mainPrizeValue", e.target.value)}
                    placeholder="e.g. 1500.00"
                    className="w-full h-[46px] bg-bg border border-border rounded-button pl-7 pr-4 font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="totalTickets" className="font-sans font-medium text-xs md:text-sm text-text-primary">
                    Total Tickets
                  </label>
                  {hasSoldTickets && (
                    <span className="font-sans text-[11px] font-bold text-red-500 select-none">
                      🔒 Locked
                    </span>
                  )}
                </div>
                <input
                  id="totalTickets"
                  type="number"
                  value={formData.totalTickets || ""}
                  onChange={(e) => handleChange("totalTickets", e.target.value)}
                  disabled={hasSoldTickets}
                  placeholder="e.g. 500"
                  className={cn(
                    "w-full h-[46px] bg-bg border border-border rounded-button px-4 font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all",
                    hasSoldTickets && "opacity-60 bg-surface/60 cursor-not-allowed border-divider"
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="pricePerTicket" className="font-sans font-medium text-xs md:text-sm text-text-primary">
                    Price per Ticket (£)
                  </label>
                  {hasSoldTickets && (
                    <span className="font-sans text-[11px] font-bold text-red-500 select-none">
                      🔒 Locked
                    </span>
                  )}
                </div>
                <input
                  id="pricePerTicket"
                  type="number"
                  step="0.01"
                  value={formData.pricePerTicket || ""}
                  onChange={(e) => handleChange("pricePerTicket", e.target.value)}
                  disabled={hasSoldTickets}
                  placeholder="e.g. 2.99"
                  className={cn(
                    "w-full h-[46px] bg-bg border border-border rounded-button px-4 font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all",
                    hasSoldTickets && "opacity-60 bg-surface/60 cursor-not-allowed border-divider"
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="minTickets" className="font-sans font-medium text-xs md:text-sm text-text-primary">
                  Minimum Tickets Per Person (Optional)
                </label>
                <input
                  id="minTickets"
                  type="number"
                  min="1"
                  value={formData.minTickets ?? 1}
                  onChange={(e) => handleChange("minTickets", e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full h-[46px] bg-bg border border-border rounded-button px-4 font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
                <span className="font-sans text-[11px] text-text-muted">
                  Minimum tickets an entrant must buy per order (default: 1).
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="maxTickets" className="font-sans font-medium text-xs md:text-sm text-text-primary">
                  Maximum Tickets Per Person (Optional)
                </label>
                <input
                  id="maxTickets"
                  type="number"
                  min="1"
                  value={formData.maxTickets ?? ""}
                  onChange={(e) => handleChange("maxTickets", e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full h-[46px] bg-bg border border-border rounded-button px-4 font-sans text-xs md:text-sm text-text-primary placeholder:text-text-muted/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
                <span className="font-sans text-[11px] text-text-muted">
                  Cap the total tickets any single person can buy across all orders.
                </span>
              </div>
            </div>
          </div> */}

          {/* Section 3: Dates & Schedule - Commented out per client request (Cannot change times) */}
          {/* <div className="flex flex-col gap-4 pt-4 border-t border-divider/60">
            <div className="flex items-center justify-between border-b border-divider/60 pb-2">
              <h2 className="font-heading font-bold text-sm text-text-brand uppercase tracking-wider">
                3. Competition Schedule
              </h2>
              <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2.5 py-0.5 rounded-full">
                UK Time (GMT/BST)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="startDate" className="font-sans font-medium text-xs md:text-sm text-text-primary flex items-center justify-between">
                  <span>Start Date &amp; Time (UK Time)</span>
                  <span className="text-[11px] text-text-muted">UK GMT/BST</span>
                </label>
                <input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate || ""}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="w-full h-[46px] bg-bg border border-border rounded-button px-4 font-sans text-xs md:text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer [color-scheme:light]"
                />
                <span className="font-sans text-[11px] text-text-muted">
                  Hidden on public site until this UK start time is reached.
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="endDate" className="font-sans font-medium text-xs md:text-sm text-text-primary flex items-center justify-between">
                  <span>End / Draw Date &amp; Time (UK Time)</span>
                  <span className="text-[11px] text-text-muted">UK GMT/BST</span>
                </label>
                <input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate || ""}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className="w-full h-[46px] bg-bg border border-border rounded-button px-4 font-sans text-xs md:text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer [color-scheme:light]"
                />
                <span className="font-sans text-[11px] text-text-muted">
                  Draw closes and winner is drawn at this UK time.
                </span>
              </div>
            </div>
          </div> */}

          {/* Section 4: Draw Mechanism */}
          <div className="flex flex-col gap-4 pt-4 border-t border-divider/60">
            <h2 className="font-heading font-bold text-sm text-text-brand uppercase tracking-wider border-b border-divider/60 pb-2">
              2. Winner Selection Strategy
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
              {/* Live Draw Option */}
              <div
                onClick={() => setFormData((prev: any) => ({ ...prev, isAutoDraw: false, autoDrawDate: false, autoDrawSoldOut: false }))}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-button border cursor-pointer transition-all duration-200",
                  !formData.isAutoDraw
                    ? "bg-accent-bg border-primary text-text-brand shadow-glow"
                    : "bg-bg border-border text-text-secondary hover:text-text-primary hover:border-border-medium"
                )}
              >
                <input 
                  type="radio"
                  id="liveDraw"
                  name="drawType"
                  checked={!formData.isAutoDraw}
                  onChange={() => {}}
                  className="mt-1 w-4 h-4 text-primary focus:ring-primary accent-[#0b4d35] cursor-pointer"
                />
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-xs md:text-sm text-text-primary uppercase tracking-wide">
                      Live Draw
                    </span>
                    <span className="bg-primary/10 text-primary border border-primary/20 font-sans font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Recommended
                    </span>
                  </div>
                  <span className="font-sans text-[11px] md:text-xs text-text-secondary leading-normal">
                    You will manually trigger the random draw from your host portal (e.g. live stream).
                  </span>
                </div>
              </div>

              {/* Auto Draw Option */}
              <div
                onClick={() => setFormData((prev: any) => ({ ...prev, isAutoDraw: true, autoDrawDate: true, autoDrawSoldOut: true }))}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-button border cursor-pointer transition-all duration-200",
                  formData.isAutoDraw
                    ? "bg-accent-bg border-primary text-text-brand shadow-glow"
                    : "bg-bg border-border text-text-secondary hover:text-text-primary hover:border-border-medium"
                )}
              >
                <input 
                  type="radio"
                  id="autoDraw"
                  name="drawType"
                  checked={formData.isAutoDraw}
                  onChange={() => {}}
                  className="mt-1 w-4 h-4 text-primary focus:ring-primary accent-[#0b4d35] cursor-pointer"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="font-heading font-bold text-xs md:text-sm text-text-primary uppercase tracking-wide">
                    Automatic Draw
                  </span>
                  <span className="font-sans text-[11px] md:text-xs text-text-secondary leading-normal">
                    System automatically draws a winner when tickets sell out or end date is reached.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t border-divider mt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/host/competitions")}
              className="bg-surface border border-divider hover:border-border-medium text-text-secondary hover:text-text-primary font-heading font-bold text-xs uppercase tracking-wider h-[46px] px-6 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn-glossy-red h-[46px] px-8 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {updateMutation.isPending ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
