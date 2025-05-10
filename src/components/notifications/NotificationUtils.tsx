// src/components/notifications/NotificationUtils.tsx
import { IconBell, IconHash, IconHeart, IconInfoCircle, IconMessageCircle, IconRepeat, IconUser } from "@tabler/icons-react";
import { Notification } from "misskey-js/entities.js";
import React from "react";

// 通知タイプごとのアイコンを取得
export const getNotificationIcon = (notification: Notification) => {
    switch (notification.type) {
        case 'follow':
            return <IconUser size={18} color="#3498db" />;
        case 'mention':
        case 'reply':
            return <IconMessageCircle size={18} color="#2ecc71" />;
        case 'renote':
        case 'quote':
            return <IconRepeat size={18} color="#9b59b6" />;
        case 'reaction':
            return <IconHeart size={18} color="#e74c3c" />;
        case 'pollEnded':
            return <IconHash size={18} color="#f39c12" />;
        case 'roleAssigned':
            return <IconInfoCircle size={18} color="#1abc9c" />;
        default:
            return <IconBell size={18} color="#7f8c8d" />;
    }
};

// 通知タイプごとの背景色とボーダー色を取得
export const getNotificationStyle = (type: string) => {
    switch (type) {
        case 'reaction':
            return {
                bg: 'rgba(231, 76, 60, 0.05)',
                border: 'rgba(231, 76, 60, 0.5)'
            };
        case 'renote':
        case 'quote':
            return {
                bg: 'rgba(155, 89, 182, 0.05)',
                border: 'rgba(155, 89, 182, 0.5)'
            };
        case 'mention':
        case 'reply':
            return {
                bg: 'rgba(46, 204, 113, 0.05)',
                border: 'rgba(46, 204, 113, 0.5)'
            };
        default:
            return {
                bg: 'rgba(0, 0, 0, 0.03)',
                border: 'rgba(0, 0, 0, 0.1)'
            };
    }
};

// ユーザーアバターを表示するかどうかを判定
export const hasUserAvatar = (notification: Notification) => {
    return ['follow', 'mention', 'reply', 'renote', 'reaction', 'quote', 'user'].includes(notification.type);
};

// ノートテキストを表示するかどうかを判定
export const hasNoteText = (notification: Notification) => {
    return notification.type === 'mention' || notification.type === 'reply' || notification.type === 'quote';
};