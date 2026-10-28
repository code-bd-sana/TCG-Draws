"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAdminUsers, useToggleUserBlockMutation } from "../../../hooks/useAdminHooks";
import { format } from "date-fns";
import ConfirmBlockModal from "./ConfirmBlockModal";
import UserDetailsModal from "./UserDetailsModal";
import { User } from "../../../services/admin.service";
import { Pagination } from "../../ui/Pagination";
import { toast } from "sonner";

export default function UsersTable() {
  const [activeFilter, setActiveFilter] = useState<"All" | "Active" | "Blocked">("All");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [blockModalUser, setBlockModalUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Debounce search to prevent query spamming
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isFetching, refetch } = useAdminUsers({
    page,
    limit,
    search: debouncedSearch,
    role: roleFilter === "All" ? undefined : roleFilter,
  });

  const toggleBlock = useToggleUserBlockMutation();

  const users = data?.users || [];
  const totalItems = data?.total || users.length;
  const totalPages = data?.totalPages || 1;

  // Filter client-side by active/blocked status
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Active") return !user.isBlocked;
      if (activeFilter === "Blocked") return user.isBlocked;
      return true;
    });
  }, [users, activeFilter]);

  // Counts for status pills
  const counts = useMemo(() => {
    const active = users.filter((u) => !u.isBlocked).length;
    const blocked = users.filter((u) => u.isBlocked).length;
    return { all: users.length, active, blocked };
  }, [users]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      toast.info("No user records available to export.");
      return;
    }
    const headers = [
      "User ID",
      "Full Name",
      "Email Address",
      "Role",
      "Email Verified",
      "Joined Date",
      "Tickets Count",
      "Total Spent (£)",
      "Phone",
      "Location",
      "Account Status"
    ];

    const rows = filteredUsers.map((u) => [
      u.id,
      `${u.firstName || ""} ${u.lastName || ""}`.trim() || "N/A",
      u.email,
      u.role,
      u.isEmailVerified ? "Verified" : "Unverified",
      u.createdAt,
      u.ticketsCount || 0,
      (u.totalSpent || 0).toFixed(2),
      u.phone || "N/A",
      u.location || "N/A",
      u.isBlocked ? "Blocked" : "Active",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tcg_users_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("User directory exported as CSV");
  };

  const getInitials = (firstName: string | null, lastName: string | null, email: string) => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName[0].toUpperCase();
    return email[0].toUpperCase();
  };

  const getRoleBadge = (role: string) => {
    const formatted = (role || "USER").toUpperCase();
    switch (formatted) {
      case "ADMIN":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/40 text-text-brand font-heading font-black text-[10px] tracking-wider uppercase shadow-xs">
            Admin
          </span>
        );
      case "HOST":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-heading font-bold text-[10px] tracking-wider uppercase shadow-xs">
            Host
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-elevated border border-border text-text-muted font-sans font-semibold text-[10px] tracking-wider uppercase">
            Player
          </span>
        );
    }
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        
        {/* Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface border border-border rounded-card p-4 shadow-card">
          
          {/* Left: Search Bar & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 flex-wrap">
            
            {/* Search Input */}
            <div className="relative flex items-center h-10 w-full sm:w-[320px] bg-elevated border border-border-medium rounded-xl px-3 focus-within:border-primary focus-within:shadow-[0_0_12px_rgba(212,175,55,0.2)] transition-all">
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
                placeholder="Search by name, email or ID..." 
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

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-elevated border border-border rounded-xl">
              {(["All", "Active", "Blocked"] as const).map((filter) => {
                const isSelected = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => { setActiveFilter(filter); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-heading font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected 
                        ? 'bg-primary text-[#090A0E] shadow-sm font-black' 
                        : 'text-text-muted hover:text-text-primary hover:bg-surface/60'
                    }`}
                  >
                    {filter === "Active" && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#090A0E]' : 'bg-emerald-400'}`} />
                    )}
                    {filter === "Blocked" && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#090A0E]' : 'bg-rose-400'}`} />
                    )}
                    <span>{filter}</span>
                    {counts[filter.toLowerCase() as keyof typeof counts] !== undefined && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                        isSelected 
                          ? 'bg-[#090A0E]/20 text-[#090A0E]' 
                          : 'bg-surface text-text-muted border border-border'
                      }`}>
                        {counts[filter.toLowerCase() as keyof typeof counts]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Role Filter Selector */}
            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="h-10 px-3 bg-elevated border border-border-medium rounded-xl text-text-primary text-xs font-sans font-bold uppercase tracking-wider focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="USER">Player Only</option>
                <option value="HOST">Host Only</option>
                <option value="ADMIN">Admin Only</option>
              </select>
            </div>

          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Refresh Button */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh users list"
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
              disabled={filteredUsers.length === 0}
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
            <table className="w-full min-w-[960px] text-left border-collapse">
              <thead>
                <tr className="border-b border-divider bg-elevated/70">
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[32%]">
                    User Details
                  </th>
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[12%]">
                    Role
                  </th>
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[14%]">
                    Joined Date
                  </th>
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[12%] text-center">
                    Tickets
                  </th>
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[14%] text-center">
                    Total Spent
                  </th>
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[16%]">
                    Account Status
                  </th>
                  <th className="py-4 px-6 font-heading text-[10px] font-black text-text-muted uppercase tracking-wider w-[10%] text-right">
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
                          <div className="w-10 h-10 rounded-full bg-elevated shrink-0" />
                          <div className="flex flex-col gap-2">
                            <div className="h-4 w-32 bg-elevated rounded" />
                            <div className="h-3 w-40 bg-elevated rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6"><div className="h-5 w-16 bg-elevated rounded-full" /></td>
                      <td className="py-4 px-6"><div className="h-4 w-24 bg-elevated rounded" /></td>
                      <td className="py-4 px-6 text-center"><div className="h-4 w-10 bg-elevated rounded mx-auto" /></td>
                      <td className="py-4 px-6 text-center"><div className="h-4 w-14 bg-elevated rounded mx-auto" /></td>
                      <td className="py-4 px-6"><div className="h-6 w-20 bg-elevated rounded-full" /></td>
                      <td className="py-4 px-6 text-right"><div className="h-6 w-12 bg-elevated rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-elevated border border-border flex items-center justify-center text-text-muted">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                          </svg>
                        </div>
                        <span className="font-heading font-bold text-sm text-text-primary">
                          No matching users found
                        </span>
                        <p className="font-sans text-xs text-text-muted max-w-sm">
                          {searchTerm || activeFilter !== "All" || roleFilter !== "All"
                            ? "Try adjusting your search criteria or resetting filters."
                            : "There are currently no registered users in this directory."}
                        </p>
                        {(searchTerm || activeFilter !== "All" || roleFilter !== "All") && (
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setActiveFilter("All");
                              setRoleFilter("All");
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
                  filteredUsers.map((user) => {
                    const fullName = user.firstName 
                      ? `${user.firstName} ${user.lastName || ''}`.trim() 
                      : 'No Name Provided';

                    return (
                      <tr 
                        key={user.id} 
                        className="hover:bg-elevated/40 transition-colors group"
                      >
                        {/* User Identity */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            {user.avatarUrl ? (
                              <img 
                                src={user.avatarUrl} 
                                alt={fullName} 
                                className="w-10 h-10 rounded-full object-cover border border-primary/40 shrink-0 shadow-xs" 
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-linear-to-b from-[#2A2315] to-[#12151F] border border-primary/40 flex items-center justify-center shrink-0 shadow-xs">
                                <span className="font-heading font-black text-xs text-text-brand tracking-wider">
                                  {getInitials(user.firstName, user.lastName, user.email)}
                                </span>
                              </div>
                            )}

                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-heading font-bold text-xs sm:text-sm text-text-primary truncate group-hover:text-text-brand transition-colors">
                                  {fullName}
                                </span>
                                {user.isEmailVerified && (
                                  <span title="Email Verified">
                                    <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                )}
                              </div>
                              <span className="font-sans text-xs text-text-muted truncate">
                                {user.email}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleCopy(user.id, "User ID")}
                                  className="font-mono text-[10px] text-text-muted/70 hover:text-text-brand transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Click to copy User ID"
                                >
                                  <span>#{user.id.slice(0, 8)}...</span>
                                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-4 px-6">
                          {getRoleBadge(user.role)}
                        </td>

                        {/* Joined Date */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-sans font-semibold text-xs text-text-primary">
                              {format(new Date(user.createdAt), 'dd MMM yyyy')}
                            </span>
                            <span className="font-sans text-[10px] text-text-muted">
                              {format(new Date(user.createdAt), 'HH:mm')}
                            </span>
                          </div>
                        </td>

                        {/* Tickets */}
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-elevated border border-border text-xs font-heading font-black text-text-primary shadow-xs">
                            <svg className="w-3 h-3 text-text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                            </svg>
                            {user.ticketsCount || 0}
                          </span>
                        </td>

                        {/* Total Spent */}
                        <td className="py-4 px-6 text-center">
                          <span className="font-heading font-black text-xs sm:text-sm text-text-brand tracking-tight">
                            £{(user.totalSpent || 0).toFixed(2)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          {user.isBlocked ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-heading font-bold text-[10px] uppercase tracking-wider shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              Blocked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-heading font-bold text-[10px] uppercase tracking-wider shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Active
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Details Button */}
                            <button 
                              onClick={() => { setSelectedUser(user); setIsDetailsOpen(true); }}
                              className="h-8 px-2.5 rounded-lg bg-surface border border-border hover:border-primary/50 text-text-muted hover:text-text-brand hover:bg-elevated transition-all flex items-center gap-1.5 text-xs font-sans font-semibold cursor-pointer shadow-xs" 
                              title="View user details"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                              </svg>
                              <span className="hidden sm:inline text-[11px]">View</span>
                            </button>

                            {/* Block / Unblock Toggle */}
                            {user.isBlocked ? (
                              <button 
                                onClick={() => setBlockModalUser(user)}
                                disabled={toggleBlock.isPending}
                                className="h-8 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1 text-[11px] font-sans font-bold" 
                                title="Unblock user account"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                </svg>
                                <span className="hidden sm:inline">Unblock</span>
                              </button>
                            ) : (
                              <button 
                                onClick={() => setBlockModalUser(user)}
                                disabled={toggleBlock.isPending}
                                className="h-8 px-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1 text-[11px] font-sans font-bold" 
                                title="Block user account"
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
              Showing <strong className="text-text-primary">{filteredUsers.length}</strong> of{" "}
              <strong className="text-text-primary">{totalItems}</strong> user accounts
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

      {/* Confirmation Block/Unblock Modal */}
      <ConfirmBlockModal 
        isOpen={!!blockModalUser}
        onClose={() => setBlockModalUser(null)}
        onConfirm={() => {
          if (blockModalUser) {
            toggleBlock.mutate(blockModalUser.id, {
              onSuccess: () => {
                toast.success(
                  blockModalUser.isBlocked 
                    ? `Unblocked user ${blockModalUser.email}` 
                    : `Blocked user ${blockModalUser.email}`
                );
                setBlockModalUser(null);
              },
              onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Failed to update account security status");
              }
            });
          }
        }}
        isLoading={toggleBlock.isPending}
        isBlocked={blockModalUser?.isBlocked ?? false}
        userIdentifier={blockModalUser?.email || blockModalUser?.firstName || "this user"}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setSelectedUser(null); }}
        user={selectedUser}
        onToggleBlock={(user) => {
          setIsDetailsOpen(false);
          setBlockModalUser(user);
        }}
      />
    </>
  );
}
