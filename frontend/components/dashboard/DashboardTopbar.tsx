"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardAccount } from "../../types/dashboard.types";
import { cn } from "../../lib/utils";
import NotificationsDropdown from "./NotificationsDropdown";
import { useLogout } from "../../hooks/useAuthHooks";
import { useUnreadNotificationCountQuery } from "../../hooks/useNotificationHooks";

interface DashboardTopbarProps {
  account: DashboardAccount;
  onMenuClick: () => void;
  title?: string;
  subtitle?: string;
}

export default function DashboardTopbar({ account, onMenuClick, title = "Dashboard Overview", subtitle = "Host Portal / Dashboard Overview" }: DashboardTopbarProps) {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { data: unreadData } = useUnreadNotificationCountQuery();
  const unreadCount = unreadData?.count || 0;

  const logout = useLogout();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="h-[88px] w-full bg-surface border-b border-border flex items-center justify-between px-[20px] lg:px-[40px] shrink-0 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-text-primary hover:bg-elevated rounded-xl transition-colors cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* 1-Tap Quick Switcher to Public Website */}
        <Link
          href="/live-raffles"
          className="btn-glossy-red flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold font-sans tracking-wide uppercase transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m-17.432-6A8.959 8.959 0 0 0 3 12c0 .778.099 1.533.284 2.253" />
          </svg>
          <span className="whitespace-nowrap">Public Site</span>
        </Link>

        {/* Page Title & Subtitle */}
        <div className="flex flex-col">
          <h1 className="font-heading font-black text-[22px] text-text-primary uppercase tracking-tight leading-tight m-0 p-0 hidden md:block">
            {title}
          </h1>
          <p className="font-sans font-medium text-[13px] text-text-muted leading-none m-0 p-0 hidden md:block mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-[16px]">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative w-[42px] h-[42px] bg-elevated border border-border rounded-xl flex items-center justify-center shrink-0 hover:bg-accent-bg transition-colors cursor-pointer"
          >
            <svg className="w-[18px] h-[18px] text-text-secondary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            {/* Dynamic Notification Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#dc2626] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm ring-2 ring-surface animate-fadeIn">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <NotificationsDropdown
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            portalPrefix={account.role === "host" ? "/dashboard/host" : "/dashboard/user"}
          />
        </div>

        {/* Divider */}
        <div className="w-[1px] h-[32px] bg-divider shrink-0" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-[10px] hover:opacity-90 transition-opacity cursor-pointer p-1 rounded-xl hover:bg-elevated"
          >
            <div className="w-[34px] h-[34px] shrink-0 rounded-full border border-border-medium bg-accent-bg flex items-center justify-center overflow-hidden shadow-xs">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img
                 src={account.avatar}
                 alt="Profile"
                 className="w-full h-full object-cover"
                 onError={(e) => {
                   (e.currentTarget as HTMLElement).style.display = 'none';
                 }}
               />
            </div>
            <span className="font-sans font-bold text-[14px] text-text-primary hidden lg:block">
              {account.name}
            </span>
            <svg className="w-[14px] h-[14px] text-text-muted hidden lg:block" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-surface border border-border rounded-card shadow-card py-1.5 z-50">
              <div className="px-4 py-2.5 border-b border-divider lg:hidden">
                <p className="text-sm font-bold text-text-primary truncate">{account.name}</p>
                <p className="text-xs text-text-muted truncate capitalize">{account.role} Account</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#dc2626] hover:bg-[#FEE2E2]/60 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
