"use client";

import React, { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePublicCategories } from "../../../hooks/useCategoryHooks";
import { usePublicRaffles } from "../../../hooks/useRaffleHooks";
import LiveRaffleCard from "./LiveRaffleCard";
import LiveRafflesFilterBar from "./LiveRafflesFilterBar";
import LiveRafflesEmptyState from "./LiveRafflesEmptyState";
import LiveRafflesPagination from "./LiveRafflesPagination";

export default function LiveRaffleGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Filters State (activeCategory is derived from URL parameters)
  const activeCategory = searchParams.get("category") || "all";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: dbCategories } = usePublicCategories();

  // Resolve activeCategory to canonical category name stored in DB
  const resolvedCategory = React.useMemo(() => {
    if (!activeCategory || activeCategory === "all") return undefined;
    if (!dbCategories || dbCategories.length === 0) return activeCategory;

    const act = activeCategory.toLowerCase().trim();
    // 1. Direct match with name
    const matchByName = dbCategories.find(
      (c) => c.name.toLowerCase() === act
    );
    if (matchByName) return matchByName.name;

    // 2. Match with slug
    const matchBySlug = dbCategories.find(
      (c) => c.slug?.toLowerCase() === act
    );
    if (matchBySlug) return matchBySlug.name;

    // 3. Match singular/plural
    const singular = act.endsWith("s") ? act.slice(0, -1) : act;
    const matchBySingular = dbCategories.find(
      (c) =>
        c.name.toLowerCase() === singular ||
        c.name.toLowerCase().startsWith(singular) ||
        c.slug?.toLowerCase() === singular
    );
    if (matchBySingular) return matchBySingular.name;

    return activeCategory;
  }, [activeCategory, dbCategories]);

  // Handle Category Filter change & update URL query parameters optionally
  const handleCategoryChange = (category: string) => {
    setCurrentPage(1);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (category === "all") {
        params.delete("category");
      } else {
        params.set("category", category);
      }
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  // Handle Search Input Change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Handle Sort Change
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  // Use the API hook
  const { data: rafflesResponse, isLoading } = usePublicRaffles({
    search: searchQuery,
    page: currentPage,
    limit: 9,
    category: resolvedCategory,
    sort: sortBy,
  });

  const filteredRaffles = rafflesResponse?.data || [];
  const totalPages = rafflesResponse?.meta?.totalPages || 1;

  const resetFilters = () => {
    setSearchQuery("");
    setSortBy("featured");
    setCurrentPage(1);
    router.push("?", { scroll: false });
  };

  return (
    <section className="relative flex-grow bg-[#090A0E] py-14">
      {/* Background Subtle Gradient & Grid Texture */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-70" />

      <div className="container-custom relative z-10">
        {/* Filter controls bar */}
        <LiveRafflesFilterBar
          activeCategory={activeCategory}
          setActiveCategory={handleCategoryChange}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          sortBy={sortBy}
          setSortBy={handleSortChange}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Content Area */}
        <div className="mt-10 min-h-[450px]">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-[400px] gap-4 text-[#A69B82]">
              <div className="animate-spin h-10 w-10 border-4 border-[#D4AF37] border-t-transparent rounded-full" />
              <p className="font-heading text-xs uppercase tracking-widest text-[#D4AF37]">
                Loading Pokémon Competitions...
              </p>
            </div>
          ) : filteredRaffles.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  : "flex flex-col gap-6"
              }
            >
              {filteredRaffles.map((raffle: any) => (
                <LiveRaffleCard key={raffle.id} raffle={raffle} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <LiveRafflesEmptyState onReset={resetFilters} />
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <LiveRafflesPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </section>
  );
}
