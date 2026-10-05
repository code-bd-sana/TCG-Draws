"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DashboardAccount } from "../../types/dashboard.types";
import { dashboardNavigation } from "../../config/dashboard-navigation.config";
import { cn } from "../../lib/utils";
import Image from "next/image";
import FairwayDrawsLogo from "../website/shared/FairwayDrawsLogo";
import { useLogout } from "../../hooks/useAuthHooks";

interface MobileDashboardMenuProps {
  account: DashboardAccount;
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileDashboardMenu({ account, isOpen, onClose }: MobileDashboardMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = dashboardNavigation.filter(item => item.roles.includes(account.role));

  const logout = useLogout();

  const handleLogout = async () => {
    await logout();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-50 lg:hidden animate-fadeIn backdrop-blur-sm"
        onClick={onClose}
      />

      <div className={cn(
        "fixed inset-y-0 left-0 w-[280px] bg-surface border-r border-border z-50 flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden shadow-card",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-[88px] flex items-center justify-between px-6 border-b border-border shrink-0">
          <div onClick={onClose}>
            <FairwayDrawsLogo variant="light" size="sm" href="/dashboard" priority />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary rounded-xl hover:bg-elevated transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide flex flex-col gap-1 w-full">
          {/* Quick 1-Tap Switch to Public Website */}
          <Link
            href="/live-raffles"
            onClick={onClose}
            className="btn-glossy-red w-full py-3 px-4 rounded-xl text-white text-xs font-bold font-sans uppercase flex items-center justify-center gap-2 mb-3 shadow-sm active:scale-95 transition-all"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m-17.432-6A8.959 8.959 0 0 0 3 12c0 .778.099 1.533.284 2.253" />
            </svg>
            <span>Exit to Public Website</span>
          </Link>

          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href) && item.href !== "/dashboard/host");
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-[12px] h-[42px] pl-[16px] pr-[16px] rounded-[10px] transition-all duration-200 group font-sans w-full",
                  isActive
                    ? "bg-accent-bg border-l-4 border-primary text-text-brand font-bold shadow-xs"
                    : "bg-transparent border-l-4 border-transparent text-text-muted hover:text-text-primary hover:bg-elevated"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-primary" : "text-text-muted group-hover:text-text-primary")} />
                <span className={cn(
                  "text-[14px] font-medium leading-[normal] truncate",
                  isActive ? "text-text-brand font-bold" : "text-text-muted group-hover:text-text-primary"
                )}>
                  {item.label}
                </span>

                {item.badge && (
                  <span className={cn(
                    "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-xs",
                    isActive ? "bg-primary text-white" : "bg-elevated text-text-brand border border-border-medium"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="w-full px-2 pt-2">
            <div className="h-px bg-divider w-full" />
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-[12px] h-[40px] px-[16px] rounded-[10px] transition-colors duration-200 w-full text-[#dc2626] hover:bg-[#FEE2E2]/60 group font-medium cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0 text-[#dc2626]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            <span className="text-[14px] font-bold ml-1">Log Out</span>
          </button>
        </nav>

        <div className="border-t border-border w-full shrink-0 bg-surface">
          <div className="flex items-center gap-[12px] pb-[17px] pt-[16px] px-[20px] w-full">
            <div className="w-[42px] h-[42px] shrink-0 rounded-full border border-border-medium bg-accent-bg flex items-center justify-center overflow-hidden shadow-xs">
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
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-heading font-bold text-[14px] text-text-primary truncate leading-tight">
                {account.name}
              </span>
              <div className="mt-1">
                <span className="inline-flex items-center justify-center px-[8px] h-[18px] rounded-full border border-primary/30 bg-accent-bg text-text-brand text-[10px] font-bold font-sans uppercase tracking-wide">
                  {account.role === "host" ? "Premium Host" : `${account.role} Account`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
