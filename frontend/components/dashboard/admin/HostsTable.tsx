"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService, HostData } from "../../../services/admin.service";
import ReviewHostModal, { HostApplicationData } from "./ReviewHostModal";
import ConfirmBlockModal from "./ConfirmBlockModal";
import { Pagination } from "../../ui/Pagination";
import { toast } from "sonner";
import Link from "next/link";

export default function HostsTable() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHost, setSelectedHost] = useState<HostApplicationData | null>(null);
  const [blockModalHost, setBlockModalHost] = useState<HostData | null>(null);

  const queryClient = useQueryClient();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-hosts', page, activeFilter, debouncedSearch],
    queryFn: () => adminService.getHosts({
      page,
      limit: 10,
      search: debouncedSearch,
      status: activeFilter
    }),
  });

  const toggleBlockMutation = useMutation({
    mutationFn: (userId: string) => adminService.toggleBlockStatus(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hosts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-hosts-stats'] });
      queryClient.invalidateQueries({ queryKey: ['verified-hosts'] });
      toast.success(
        blockModalHost?.isBlocked 
          ? `Unblocked host "${blockModalHost.businessName || blockModalHost.email}"`
          : `Blocked host "${blockModalHost?.businessName || blockModalHost?.email}"`
      );
      setBlockModalHost(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update host security status");
    }
  });

  const approveHostMutation = useMutation({
    mutationFn: (hostId: string) => adminService.approveHost(hostId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hosts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-hosts-stats'] });
      queryClient.invalidateQueries({ queryKey: ['verified-hosts'] });
      toast.success("Host operator verified and approved successfully");
      setIsModalOpen(false);
      setSelectedHost(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to approve host");
    }
  });

  const rejectHostMutation = useMutation({
    mutationFn: (hostId: string) => adminService.rejectHost(hostId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hosts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-hosts-stats'] });
      queryClient.invalidateQueries({ queryKey: ['verified-hosts'] });
      toast.success("Host application rejected");
      setIsModalOpen(false);
      setSelectedHost(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to reject host");
    }
  });

  const hosts = data?.hosts || [];
  const totalItems = data?.total || hosts.length;
  const totalPages = data?.totalPages || 1;

  // Filter counts
  const counts = useMemo(() => {
    const active = hosts.filter((h: HostData) => !h.isBlocked && h.isVerified).length;
    const pending = hosts.filter((h: HostData) => !h.isVerified).length;
    const blocked = hosts.filter((h: HostData) => h.isBlocked).length;
    return { all: hosts.length, active, pending, blocked };
  }, [hosts]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  const handleExportCSV = () => {
    if (hosts.length === 0) {
      toast.info("No host operator records available to export.");
      return;
    }

    const headers = [
      "Host ID",
      "Business Name",
      "Email Address",
      "Plan Tier",
      "Active Raffles",
      "Revenue (£)",
      "Account Status",
      "Verification Status"
    ];

    const rows = hosts.map((host: HostData) => [
      host.id,
      host.businessName || "N/A",
      host.email,
      host.plan || "Free",
      host.raffles || 0,
      (host.revenue || 0).toFixed(2),
      host.isBlocked ? "Blocked" : "Active",
      host.isVerified ? "Verified" : "Pending"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tcg_hosts_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Host directory exported as CSV");
  };

  const handleReview = async (host: HostData) => {
    setSelectedHost(host);
    setIsModalOpen(true);

    // Fetch full enriched host details in background
    try {
      const detailedHost = await adminService.getHostById(host.id);
      if (detailedHost) {
        setSelectedHost(detailedHost);
      }
    } catch {
      // Keep existing host data
    }
  };

  const getPlanPill = (plan: string) => {
    if (plan === "Pending Approval") {
      return (
        <span className="px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-heading font-bold text-[10px] uppercase tracking-wider shadow-xs">
          {plan}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full border border-primary/30 bg-accent-bg text-text-brand font-heading font-black text-[10px] uppercase tracking-wider shadow-xs">
        {plan || "Free"}
      </span>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        
        {/* Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface border border-border rounded-card p-4 shadow-card">
          
          {/* Left: Search Bar & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 flex-wrap">
            
            {/* Search Input */}
            <div className="relative flex items-center h-10 w-full sm:w-[340px] bg-elevated border border-border-medium rounded-xl px-3 focus-within:border-primary focus-within:shadow-[0_0_12px_rgba(212,175,55,0.2)] transition-all">
              <svg 
                className="w-4 h-4 text-text-muted shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search host brand or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-text-primary text-xs placeholder:text-text-muted/60 w-full ml-2 font-sans font-semibold"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-text-muted hover:text-text-primary p-1 rounded transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-elevated border border-border rounded-xl overflow-x-auto no-scrollbar">
              {(["All", "Active", "Pending", "Blocked"] as const).map((filter) => {
                const isSelected = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => { setActiveFilter(filter); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-heading font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      isSelected 
                        ? 'bg-primary text-[#090A0E] shadow-sm font-black' 
                        : 'text-text-muted hover:text-text-primary hover:bg-surface/60'
                    }`}
                  >
                    {filter === "Active" && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#090A0E]' : 'bg-emerald-400'}`} />
                    )}
                    {filter === "Pending" && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#090A0E]' : 'bg-amber-400'}`} />
                    )}
                    {filter === "Blocked" && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#090A0E]' : 'bg-rose-400'}`} />
                    )}
                    <span>{filter}</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Refresh Button */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh hosts list"
              className="h-10 w-10 rounded-xl bg-surface border border-border hover:bg-elevated text-text-muted hover:text-text-brand flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
            >
              <svg 
                className={`w-4 h-4 ${isFetching ? 'animate-spin text-text-brand' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>

            {/* Export CSV Button */}
            <button 
              onClick={handleExportCSV}
              disabled={hosts.length === 0}
              className="btn-dark-metallic h-10 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-4 h-4 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
                Export Directory
              </span>
            </button>
          </div>

        </div>

        {/* Table Container */}
        <div className="art-deco-card rounded-card overflow-hidden shadow-card border border-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead>
                <tr className="border-b border-divider bg-elevated/70">
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[28%]">
                    Host Operator
                  </th>
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[20%]">
                    Email &amp; Contact
                  </th>
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[12%] text-center">
                    Plan / Tier
                  </th>
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[12%] text-center">
                    Active Draws
                  </th>
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[12%] text-center">
                    Revenue
                  </th>
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[12%] text-center">
                    Status
                  </th>
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[14%] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-elevated shrink-0" />
                          <div className="flex flex-col gap-2">
                            <div className="h-4 w-32 bg-elevated rounded" />
                            <div className="h-3 w-20 bg-elevated rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6"><div className="h-4 w-36 bg-elevated rounded" /></td>
                      <td className="py-4 px-6 text-center"><div className="h-6 w-20 bg-elevated rounded-full mx-auto" /></td>
                      <td className="py-4 px-6 text-center"><div className="h-4 w-10 bg-elevated rounded mx-auto" /></td>
                      <td className="py-4 px-6 text-center"><div className="h-4 w-16 bg-elevated rounded mx-auto" /></td>
                      <td className="py-4 px-6 text-center"><div className="h-6 w-16 bg-elevated rounded-full mx-auto" /></td>
                      <td className="py-4 px-6 text-right"><div className="h-6 w-16 bg-elevated rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : hosts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-elevated border border-border flex items-center justify-center text-text-muted">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72m-13.5 8.65h.008v.008H4.5v-.008Zm0 3h.008v.008H4.5v-.008Zm2.25-3h.008v.008H6.75v-.008Zm0 3h.008v.008H6.75v-.008Zm2.25-3h.008v.008H9v-.008Zm0 3h.008v.008H9v-.008Zm2.25-3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                          </svg>
                        </div>
                        <span className="font-heading font-bold text-sm text-text-primary">
                          No matching host operators found
                        </span>
                        <p className="font-sans text-xs text-text-muted max-w-sm">
                          {searchTerm || activeFilter !== "All"
                            ? "Try adjusting your search criteria or resetting filters."
                            : "There are currently no host merchant accounts registered."}
                        </p>
                        {(searchTerm || activeFilter !== "All") && (
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setActiveFilter("All");
                            }}
                            className="mt-2 px-4 py-2 rounded-xl bg-elevated border border-border hover:border-primary/40 text-text-brand text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Reset All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  hosts.map((host: HostData) => {
                    const businessTitle = host.businessName || "Registered Host";

                    return (
                      <tr 
                        key={host.id} 
                        className="hover:bg-elevated/40 transition-colors group"
                      >
                        {/* Host Operator */}
                        <td className="py-4 px-6">
                          <div 
                            onClick={() => handleReview(host)}
                            className="flex items-center gap-3.5 cursor-pointer group/item w-fit"
                            title="Click to view full host audit & credentials"
                          >
                            <div className="w-10 h-10 rounded-xl bg-linear-to-b from-[#2A2315] to-[#12151F] border border-primary/40 flex items-center justify-center shrink-0 shadow-xs overflow-hidden relative">
                              {host.avatarUrl ? (
                                <img
                                  src={host.avatarUrl}
                                  alt={businessTitle}
                                  className="w-full h-full object-cover group-hover/item:scale-105 transition-transform"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : null}
                              <span className={`font-heading font-black text-xs text-text-brand tracking-wider ${host.avatarUrl ? 'absolute -z-10' : ''}`}>
                                {businessTitle.substring(0, 2).toUpperCase()}
                              </span>
                            </div>

                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-heading font-bold text-xs sm:text-sm text-text-primary truncate group-hover/item:text-text-brand transition-colors">
                                  {businessTitle}
                                </span>
                                {host.isVerified && (
                                  <span title="Verified Operator">
                                    <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                )}
                              </div>
                              {host.slug && (
                                <Link
                                  href={`/hosts/${host.slug}`}
                                  target="_blank"
                                  onClick={(e) => e.stopPropagation()}
                                  className="font-sans text-[11px] text-text-muted hover:text-text-brand hover:underline flex items-center gap-1 w-fit"
                                >
                                  <span>@{host.slug}</span>
                                  <svg className="w-2.5 h-2.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                  </svg>
                                </Link>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email & Contact */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-sans font-semibold text-xs text-text-primary truncate max-w-[200px]">
                                {host.email}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(host.email, "Email")}
                                className="text-text-muted hover:text-text-brand transition-colors p-0.5 cursor-pointer"
                                title="Copy Email"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                                </svg>
                              </button>
                            </div>
                            {host.location && (
                              <span className="font-sans text-[10px] text-text-muted">
                                {host.location}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="py-4 px-6 text-center">
                          {getPlanPill(host.plan || "Free")}
                        </td>

                        {/* Active Draws */}
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-elevated border border-border text-xs font-heading font-black text-text-primary shadow-xs">
                            <svg className="w-3 h-3 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                            </svg>
                            {host.raffles || 0}
                          </span>
                        </td>

                        {/* Revenue */}
                        <td className="py-4 px-6 text-center">
                          <span className="font-heading font-black text-xs sm:text-sm text-text-brand tracking-tight">
                            £{(host.revenue || 0).toFixed(2)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 text-center">
                          {host.isBlocked ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-heading font-bold text-[10px] uppercase tracking-wider shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              Blocked
                            </span>
                          ) : !host.isVerified ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-heading font-bold text-[10px] uppercase tracking-wider shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-heading font-bold text-[10px] uppercase tracking-wider shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Active
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Fast Approve / Reject if unverified */}
                            {!host.isVerified && (
                              <>
                                <button 
                                  onClick={() => approveHostMutation.mutate(host.id)}
                                  disabled={approveHostMutation.isPending || rejectHostMutation.isPending}
                                  className="h-8 px-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50" 
                                  title="Approve Host Application"
                                >
                                  {approveHostMutation.isPending && approveHostMutation.variables === host.id ? (
                                    <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                  )}
                                </button>

                                <button 
                                  onClick={() => rejectHostMutation.mutate(host.id)}
                                  disabled={approveHostMutation.isPending || rejectHostMutation.isPending}
                                  className="h-8 px-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50" 
                                  title="Reject Host Application"
                                >
                                  {rejectHostMutation.isPending && rejectHostMutation.variables === host.id ? (
                                    <div className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                  )}
                                </button>
                              </>
                            )}

                            {/* View Audit Details Button */}
                            <button 
                              onClick={() => handleReview(host)}
                              className="h-8 px-2.5 rounded-lg bg-surface border border-border hover:border-primary/50 text-text-muted hover:text-text-brand hover:bg-elevated transition-all flex items-center gap-1.5 text-xs font-sans font-semibold cursor-pointer shadow-xs" 
                              title="View full host credentials"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                              </svg>
                              <span className="hidden sm:inline text-[11px]">Audit</span>
                            </button>

                            {/* Block / Unblock Toggle */}
                            {host.isBlocked ? (
                              <button 
                                onClick={() => setBlockModalHost(host)}
                                disabled={toggleBlockMutation.isPending}
                                className="h-8 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1 text-[11px] font-sans font-bold" 
                                title="Unblock Host Account"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                </svg>
                                <span className="hidden sm:inline">Unblock</span>
                              </button>
                            ) : (
                              <button 
                                onClick={() => setBlockModalHost(host)}
                                disabled={toggleBlockMutation.isPending}
                                className="h-8 px-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1 text-[11px] font-sans font-bold" 
                                title="Block Host Account"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                <span className="hidden sm:inline">Block</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-divider bg-elevated/40">
            <span className="font-sans text-xs text-text-muted">
              Showing <strong className="text-text-primary">{hosts.length}</strong> of{" "}
              <strong className="text-text-primary">{totalItems}</strong> host operators
            </span>

            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </div>
        </div>

      </div>

      {/* Review Host Details Modal */}
      <ReviewHostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={selectedHost} 
        onApprove={(hostId) => approveHostMutation.mutate(hostId)}
        isApproveLoading={approveHostMutation.isPending}
        onReject={(hostId) => rejectHostMutation.mutate(hostId)}
        isRejectLoading={rejectHostMutation.isPending}
      />

      {/* Confirmation Block/Unblock Modal */}
      <ConfirmBlockModal 
        isOpen={!!blockModalHost}
        onClose={() => setBlockModalHost(null)}
        onConfirm={() => blockModalHost && toggleBlockMutation.mutate(blockModalHost.userId)}
        isLoading={toggleBlockMutation.isPending}
        isBlocked={blockModalHost?.isBlocked ?? false}
        userIdentifier={blockModalHost?.businessName || blockModalHost?.email || ""}
      />
    </>
  );
}
