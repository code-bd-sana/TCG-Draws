"use client";

import React from "react";
import NotificationsView from "../../../../components/dashboard/shared/notifications/NotificationsView";

export default function HostNotificationsPage() {
  return (
    <NotificationsView
      portalTitle="Host Notifications"
      portalSubtitle="Activity updates for your competitions, ticket sales, revenue credits, and instant win claims."
    />
  );
}
