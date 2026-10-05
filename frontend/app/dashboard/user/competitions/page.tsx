"use client";

import React, { useState } from "react";
import Image from "next/image";
import { usePublicRaffles } from "@/hooks/useRaffleHooks";
import { Pagination } from "@/components/ui/Pagination";
import Link from "next/link";

export default function UserRafflesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Competitions");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Latest");

  const { data, isLoading, isError } = usePublicRaffles({
    page,
    limit: 12,
    search,
    statusFilter: statusFilter === "All Competitions" ? undefined : statusFilter,
    category,
    sort,
  });

  const raffles = data?.data || [];
  const meta = data?.meta;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1660px] mx-auto w-full animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-black text-2xl lg:text-3xl text-text-primary uppercase tracking-tight">
          Browse Competitions
        </h1>
        <p className="font-sans text-xs text-text-muted">
          Explore all active, upcoming, and featured draws across all hosts.
        </p>
      </div>

      {/* Search & Filters Section */}
      <div className="flex flex-col gap-4 w-full">
        <form onSubmit={handleSearch} className="w-full max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search competitions by keyword or brand..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-11 bg-surface border border-border rounded-xl px-4 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all shadow-xs"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {["All Competitions", "Live", "Upcoming", "Past"].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-4 py-1.5 rounded-full font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === status
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface border border-border text-text-muted hover:text-text-primary"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          <div className="flex flex-wrap items-center gap-2">
            {["All", "Drivers", "Irons", "Putters", "Experiences", "Apparel & Bags", "Accessories"].map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                className={`px-3.5 py-1 rounded-full font-sans font-bold text-xs transition-all border cursor-pointer ${
                  category === cat
                    ? "bg-accent-bg border-primary/40 text-text-brand"
                    : "bg-elevated border-border-medium text-text-muted hover:text-text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-surface border border-border text-text-muted font-heading font-bold text-xs uppercase tracking-wider hover:text-text-primary transition-all cursor-pointer shadow-xs">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
              </svg>
              Sort by: {sort}
              <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-surface border border-border rounded-xl shadow-card overflow-hidden z-10 w-[180px]">
              {["Latest", "Ending Soon", "Price: Low to High", "Price: High to Low"].map((s) => (
                <button
                  key={s}
                  onClick={() => { setSort(s); setPage(1); }}
                  className="px-4 py-2 text-left text-xs font-heading font-bold text-text-muted hover:bg-elevated hover:text-text-primary transition-colors w-full cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full mt-2">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-surface border border-border rounded-card overflow-hidden flex flex-col gap-4 pb-5 shadow-card"
            >
              <div className="w-full aspect-square bg-elevated animate-pulse relative" />
              <div className="px-5 flex flex-col gap-4 flex-1">
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-full bg-elevated rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-elevated rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex justify-center py-20">
          <p className="text-[#DC2626] font-sans font-bold text-sm">Failed to load competitions. Please try again.</p>
        </div>
      ) : raffles.length === 0 ? (
        <div className="flex justify-center py-20">
          <p className="text-text-muted font-sans font-bold text-sm">No competitions found matching your active filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full mt-2">
            {raffles.map((raffle: any) => {
              const progressPercentage = Math.min((raffle.ticketsSold / raffle.totalTickets) * 100, 100);
              
              const now = new Date();
              const startDate = new Date(raffle.startDate);
              const endDate = new Date(raffle.endDate);
              const isLive = startDate <= now && endDate >= now;
              
              const timeDiff = endDate.getTime() - now.getTime();
              const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
              const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
              const drawsIn = timeDiff > 0 ? `${days}d ${hours}h` : 'Ended';

              return (
                <div
                  key={raffle.id}
                  className="bg-surface border border-border rounded-card overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="relative w-full aspect-square bg-elevated flex items-center justify-center overflow-hidden">
                    <Image
                      src={raffle.mainImage || "/coming-soon-hero.jpg"}
                      alt={raffle.title}
                      fill
                      className="object-cover transition-opacity hover:opacity-90"
                      unoptimized
                    />

                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <div className="px-3 py-1 rounded-full bg-surface/90 backdrop-blur-sm border border-border shadow-xs">
                        <span className="font-sans text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          {raffle.category || 'General'}
                        </span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-surface/90 backdrop-blur-sm border border-border shadow-xs">
                        <span className="font-heading font-black text-xs text-text-brand">
                          £{Number(raffle.pricePerTicket).toFixed(2)}/tkt
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col gap-4 flex-1">
                    <h3 className="font-heading font-black text-sm text-text-primary line-clamp-2 min-h-[44px]">
                      {raffle.title}
                    </h3>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center w-full">
                        <span className="font-sans text-xs font-semibold text-text-muted">{raffle.ticketsSold} sold</span>
                        <span className="font-sans text-xs font-bold text-text-primary">{raffle.totalTickets} max</span>
                      </div>
                      <div className="w-full h-2 bg-elevated border border-border-medium rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center w-full mt-1">
                      <div className="flex items-center gap-1.5 text-text-muted">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <span className="font-sans font-semibold text-xs text-text-muted">Draws in {drawsIn}</span>
                      </div>
                      
                      {isLive && (
                        <div className="px-2.5 py-0.5 rounded-full bg-success-bg border border-[#BBF7D0]">
                          <span className="font-sans font-bold text-[10px] text-success-text uppercase tracking-wide">Live</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 w-full">
                      {isLive ? (
                        <Link href={`/live-raffles/${raffle.slug}`} className="w-full">
                          <button className="btn-glossy-red w-full h-[38px] rounded-xl text-white font-heading font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center cursor-pointer">
                            Buy Tickets
                          </button>
                        </Link>
                      ) : (
                        <button disabled className="w-full h-[38px] rounded-xl bg-elevated border border-border-medium text-text-muted font-heading font-bold text-xs uppercase tracking-wider opacity-60 cursor-not-allowed flex items-center justify-center">
                          Not Live
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {meta && meta.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={meta.totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </>
      )}
    </div>
  );
}
