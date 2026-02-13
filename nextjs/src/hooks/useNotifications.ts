"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getUnreadCount, getNotifications, markAsRead, markAllAsRead } from "@/lib/cam/notification-service";
import type { Notification } from "@/lib/types/database";

const POLL_INTERVAL = 30_000; // 30 seconds

export function useNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCount = useCallback(async () => {
    if (!user) return;
    const count = await getUnreadCount();
    setUnreadCount(count);
  }, [user]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [notifs, count] = await Promise.all([getNotifications(), getUnreadCount()]);
    setNotifications(notifs);
    setUnreadCount(count);
    setLoading(false);
  }, [user]);

  const markRead = useCallback(async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Poll for unread count
  useEffect(() => {
    if (!user) return;
    refreshCount();
    const interval = setInterval(refreshCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [user, refreshCount]);

  return {
    unreadCount,
    notifications,
    loading,
    fetchAll,
    markRead,
    markAllRead,
  };
}
