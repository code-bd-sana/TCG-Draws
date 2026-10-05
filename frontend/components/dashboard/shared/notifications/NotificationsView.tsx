"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "../../../../hooks/useNotificationHooks";
import { NotificationItem } from "../../../../services/notification.service";

interface NotificationsViewProps {
  portalTitle?: string;
  portalSubtitle?: string;
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
    return past.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "recently";
  }
}

export default function NotificationsView({
  portalTitle = "Notifications Center",
  portalSubtitle = "Stay updated with real-time alerts about purchases, draws, wins, and platform activity.",
}: NotificationsViewProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(1);

  const filterParams = React.useMemo(() => {
    const base: any = { page, limit: 15 };
    switch (activeFilter) {
      case "Unread":
        base.isRead = false;
        break;
      case "Wins":
        base.type = "WIN";
        break;
      case "Purchases":
        base.type = "PURCHASE";
        break;
      case "Draws":
        base.type = "RAFFLE";
        break;
      case "System":
        base.type = "SYSTEM";
        break;
      default:
        break;
    }
    return base;
  }, [activeFilter, page]);

  const { data, isLoading } = useNotificationsQuery(filterParams);
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const notifications: NotificationItem[] = data?.notifications || [];
  const total = data?.total || 0;
  const unreadCount = data?.unreadCount || 0;
  const totalPages = data?.totalPages || 1;

  const filters = ["All", "Unread", "Wins", "Purchases", "Draws", "System"];

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setPage(1);
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markReadMutation.mutate(item.id);
    }
    if (item.link) {
      router.push(item.link);
    }
  };

  const getIconForType = (type: string) => {
    switch (type.toUpperCase()) {
      case "WIN":
      case "INSTANT_WIN":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
          </svg>
        );
      case "PURCHASE":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        );
      case "RAFFLE":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
    <div className="w-full px-[20px] lg:px-[40px] py-[24px] lg:py-[32px] flex flex-col gap-6 animate-fadeIn max-w-6xl mx-auto">
      
      {/* Top Header Card */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-card">
        <div>
          <h1 className="font-heading font-black text-2xl text-text-primary uppercase tracking-tight">
            {portalTitle}
          </h1>
          <p className="font-sans text-xs text-text-muted mt-1 max-w-xl">
            {portalSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {unreadCount > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold font-sans bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]/60 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              {unreadCount} Unread
            </span>
          )}

          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || unreadCount === 0}
            className="px-4 py-2 rounded-xl text-xs font-bold font-sans bg-accent-bg border border-primary/30 text-text-brand hover:bg-primary hover:text-white transition-all shadow-xs disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterChange(filter)}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === filter
                ? "bg-accent-bg border border-primary/50 text-text-brand shadow-xs"
                : "bg-surface border border-border text-text-muted hover:text-text-primary hover:bg-elevated"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Notifications Feed */}
      <div className="bg-surface border border-border rounded-card shadow-card overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-16 text-center text-text-muted text-sm font-sans flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span>Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center gap-3 text-text-muted">
            <div className="w-16 h-16 rounded-full bg-elevated border border-border-medium flex items-center justify-center text-text-muted">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            </div>
            <span className="text-base font-heading font-bold text-text-primary">No notifications found</span>
            <p className="text-xs font-sans max-w-sm">
              {activeFilter === "All"
                ? "You have no notifications yet. Activity updates will appear here automatically."
                : `No notifications matching the "${activeFilter}" filter.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-divider">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleItemClick(notification)}
                className={`p-5 flex items-start gap-4 transition-colors cursor-pointer hover:bg-elevated/60 ${
                  !notification.isRead
                    ? "border-l-4 border-l-primary bg-accent-bg/15"
                    : "border-l-4 border-l-transparent"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs ${getIconColors(notification.type)}`}>
                  {getIconForType(notification.type)}
                </div>

                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-sm text-text-primary">
                        {notification.title}
                      </span>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <span className="font-sans font-medium text-xs text-text-muted shrink-0">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>

                  <p className="font-sans text-xs text-text-muted leading-relaxed">
                    {notification.message}
                  </p>

                  {notification.link && (
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold font-sans text-text-brand hover:underline">
                        <span>View details</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    </div>
                  )}
                </div>

                {!notification.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markReadMutation.mutate(notification.id);
                    }}
                    title="Mark as read"
                    className="p-1.5 rounded-lg text-text-muted hover:text-text-brand hover:bg-accent-bg transition-colors shrink-0 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-divider bg-surface flex items-center justify-between">
            <span className="font-sans text-xs text-text-muted">
              Showing page {page} of {totalPages} ({total} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold font-sans bg-elevated border border-border text-text-primary hover:bg-accent-bg disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-bold font-sans bg-elevated border border-border text-text-primary hover:bg-accent-bg disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
