"use client";

import React from "react";
import NotificationsView from "../../../../components/dashboard/shared/notifications/NotificationsView";

export default function UserNotificationsPage() {
  return (
    <NotificationsView
      portalTitle="My Notifications"
      portalSubtitle="Stay informed about your ticket purchases, main draws, instant win prizes, and platform updates."
    />
  );
}
