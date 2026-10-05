"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "../../hooks/useNotificationHooks";
import { NotificationItem } from "../../services/notification.service";

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  portalPrefix?: string; // '/dashboard/host' or '/dashboard/user'
}

function formatTimeAgo(dateString: string): string {
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return past.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch {
    return "recently";
  }
}

export default function NotificationsDropdown({
  isOpen,
  onClose,
  portalPrefix = "/dashboard/user",
}: NotificationsDropdownProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");

  const filterParams = React.useMemo(() => {
    switch (activeFilter) {
      case "Unread":
        return { isRead: false, limit: 15 };
      case "Wins":
        return { type: "WIN", limit: 15 };
      case "Purchases":
        return { type: "PURCHASE", limit: 15 };
      case "Draws":
        return { type: "RAFFLE", limit: 15 };
      default:
        return { limit: 15 };
    }
  }, [activeFilter]);

  const { data, isLoading } = useNotificationsQuery(filterParams, isOpen);
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  if (!isOpen) return null;

  const notifications: NotificationItem[] = data?.notifications || [];
  const filters = ["All", "Unread", "Wins", "Purchases", "Draws"];

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markReadMutation.mutate(item.id);
    }
    if (item.link) {
      router.push(item.link);
      onClose();
    }
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllReadMutation.mutate();
  };

  const getIconForType = (type: string) => {
    switch (type.toUpperCase()) {
      case "WIN":
      case "INSTANT_WIN":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
          </svg>
        );
      case "PURCHASE":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        );
      case "RAFFLE":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        );
    }
  };

  const getIconColors = (type: string) => {
    switch (type.toUpperCase()) {
      case "WIN":
      case "INSTANT_WIN":
        return "text-[#15803D] bg-[#DCFCE7] border border-[#BBF7D0]";
      case "PURCHASE":
        return "text-text-brand bg-accent-bg border border-primary/30";
      case "RAFFLE":
        return "text-[#D97706] bg-[#FEF3C7] border border-[#FDE68A]";
      default:
        return "text-text-primary bg-elevated border border-border";
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-transparent" 
        onClick={onClose} 
      />
      <div className="absolute top-[52px] right-0 w-[440px] max-w-[calc(100vw-40px)] bg-surface border border-border rounded-card shadow-card flex flex-col z-50 animate-fadeIn overflow-hidden">
        
        {/* Header Row */}
        <div className="flex items-center justify-between p-4 border-b border-divider bg-surface">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-full text-[11px] font-sans font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === filter 
                    ? "bg-accent-bg border border-primary/40 text-text-brand shadow-xs" 
                    : "bg-elevated border border-border-medium text-text-muted hover:text-text-primary"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <button 
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
            className="text-[11px] font-sans font-bold text-text-brand hover:underline transition-all whitespace-nowrap ml-3 shrink-0 cursor-pointer disabled:opacity-50"
          >
            Mark all as read
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex flex-col max-h-[460px] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-text-muted text-xs font-sans">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-center gap-2 text-text-muted">
              <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              <span className="text-xs font-bold font-heading">No notifications</span>
              <span className="text-[11px] font-sans">You are all caught up!</span>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex items-start gap-3.5 p-4 border-b border-divider hover:bg-elevated/60 transition-colors cursor-pointer relative ${
                  !notification.isRead 
                    ? "border-l-4 border-l-primary bg-accent-bg/25" 
                    : "border-l-4 border-l-transparent"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${getIconColors(notification.type)}`}>
                  {getIconForType(notification.type)}
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading font-bold text-xs text-text-primary leading-tight truncate">
                      {notification.title}
                    </span>
                    <span className="font-sans font-medium text-[10px] text-text-muted shrink-0">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  <span className={`font-sans text-[11px] line-clamp-2 ${
                    notification.type === "WIN" || notification.type === "INSTANT_WIN"
                      ? "text-text-brand font-semibold" 
                      : "text-text-muted"
                  } leading-snug`}>
                    {notification.message}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: View Full Notification History */}
        <div className="p-3 border-t border-divider bg-surface flex items-center justify-center">
          <Link
            href={`${portalPrefix}/notifications`}
            onClick={onClose}
            className="text-xs font-heading font-bold text-text-primary hover:text-text-brand transition-colors flex items-center gap-1.5"
          >
            <span>View All Notifications</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

      </div>
    </>
  );
}
