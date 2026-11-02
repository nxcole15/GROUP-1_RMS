/**
 * hooks/useNotifications.ts
 * Custom React hook for real-time notification polling
 */
"use client";

import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

interface Notification {
  id: number;
  type: string;
  message: string;
  title?: string;
  time: string;
  read: boolean;
  link_url?: string | null;
  reference_id?: string | null;
  reference_type?: string | null;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
  isLoading: boolean;
}

/**
 * Hook for fetching and managing staff notifications
 * @param role - User role (principal, registrar, teacher, accounting, admin)
 * @param enabled - Whether polling is enabled (default: true)
 * @param pollInterval - Polling interval in milliseconds (default: 30000 = 30 seconds)
 */
export function useStaffNotifications(
  role?: string | null,
  enabled: boolean = true,
  pollInterval: number = 30000
): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!role || !enabled) return;

    try {
      const token = 
        localStorage.getItem("inform_admin_token") || 
        localStorage.getItem("inform_teacher_token") ||
        localStorage.getItem("inform_token");

      if (!token) return;

      const response = await fetch(`${API_BASE}/api/staff-notifications`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: "include",
      });

      if (!response.ok) return;

      const data = await response.json();

      if (data?.notifications) {
        const formatted = data.notifications.map((n: any) => ({
          id: n.id,
          type: n.type || 'info',
          message: n.message,
          title: n.title,
          time: formatNotificationTime(n.created_at),
          read: !!n.is_read,
          link_url: n.link_url,
          reference_id: n.reference_id,
          reference_type: n.reference_type,
        }));

        setNotifications(formatted);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching staff notifications:', error);
    }
  }, [role, enabled]);

  const markAsRead = useCallback(async (id: number) => {
    // Optimistically update UI
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      const token = 
        localStorage.getItem("inform_admin_token") || 
        localStorage.getItem("inform_teacher_token") ||
        localStorage.getItem("inform_token");

      if (!token) return;

      await fetch(`${API_BASE}/api/staff-notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: "include",
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert on error
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: false } : n)
      );
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const previousNotifs = [...notifications];
    const previousCount = unreadCount;

    // Optimistically update UI
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      const token = 
        localStorage.getItem("inform_admin_token") || 
        localStorage.getItem("inform_teacher_token") ||
        localStorage.getItem("inform_token");

      if (!token) return;

      await fetch(`${API_BASE}/api/staff-notifications/read`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: "include",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert on error
      setNotifications(previousNotifs);
      setUnreadCount(previousCount);
    }
  }, [notifications, unreadCount]);

  // Initial fetch
  useEffect(() => {
    if (enabled && role) {
      setIsLoading(true);
      fetchNotifications().finally(() => setIsLoading(false));
    }
  }, [enabled, role, fetchNotifications]);

  // Polling
  useEffect(() => {
    if (!enabled || !role) return;

    const interval = setInterval(fetchNotifications, pollInterval);
    return () => clearInterval(interval);
  }, [enabled, role, pollInterval, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
    isLoading,
  };
}

/**
 * Hook for fetching and managing student notifications
 */
export function useStudentNotifications(
  enabled: boolean = true,
  pollInterval: number = 30000
): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;

    try {
      const token = localStorage.getItem("inform_token");
      if (!token) return;

      const response = await fetch(`${API_BASE}/api/notifications`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: "include",
      });

      if (!response.ok) return;

      const data = await response.json();

      if (data?.notifications) {
        const formatted = data.notifications.map((n: any) => ({
          id: n.id,
          type: n.type || 'info',
          message: n.message,
          title: getNotificationTitle(n.type),
          time: formatNotificationTime(n.created_at),
          read: !!n.is_read,
          link_url: n.link_url,
        }));

        setNotifications(formatted);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching student notifications:', error);
    }
  }, [enabled]);

  const markAsRead = useCallback(async (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      const token = localStorage.getItem("inform_token");
      if (!token) return;

      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: "include",
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const previousNotifs = [...notifications];
    const previousCount = unreadCount;

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      const token = localStorage.getItem("inform_token");
      if (!token) return;

      await fetch(`${API_BASE}/api/notifications/read`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: "include",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setNotifications(previousNotifs);
      setUnreadCount(previousCount);
    }
  }, [notifications, unreadCount]);

  useEffect(() => {
    if (enabled) {
      setIsLoading(true);
      fetchNotifications().finally(() => setIsLoading(false));
    }
  }, [enabled, fetchNotifications]);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(fetchNotifications, pollInterval);
    return () => clearInterval(interval);
  }, [enabled, pollInterval, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
    isLoading,
  };
}

// Helper functions

function formatNotificationTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-PH', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

function getNotificationTitle(type: string): string {
  const titles: Record<string, string> = {
    grade_submitted: 'Grade Submitted',
    grade_approved: 'Grade Approved',
    grade_rejected: 'Grade Revision Required',
    grade_request: 'Grade Request',
    document_request: 'Document Request',
    document_ready: 'Document Ready',
    enrollment_approved: 'Enrollment Approved',
    enrollment: 'New Enrollment',
    payment_received: 'Payment Received',
    payment: 'New Payment',
    fee_assigned: 'Fees Assigned',
    balance_due: 'Payment Reminder',
    info: 'Notification',
  };

  return titles[type] || 'Notification';
}
