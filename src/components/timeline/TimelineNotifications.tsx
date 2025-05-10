// src/components/timeline/TimelineNotifications.tsx
import React from "react";
import NotificationList from "@/components/notifications/NotificationList";

const TimelineNotifications: React.FC = () => {
    // コンテナなしで表示するように設定
    return <NotificationList withContainer={false} />;
};

export default TimelineNotifications;