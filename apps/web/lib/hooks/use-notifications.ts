'use client';

import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuthStore } from '../store/useAuthStore';
import { io, Socket } from 'socket.io-client';

import { syncService } from '../services/sync-service';

export interface Notification {
    id: string;
    title: string;
    message: string;
    category: 'ACADEMIC' | 'ATTENDANCE' | 'FEES' | 'SYSTEM';
    isRead: boolean;
    link?: string;
    createdAt: string;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuthStore();

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const response = await api.get('/v2/notifications');
            setNotifications(response.data);
            setUnreadCount(response.data.filter((n: Notification) => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;

        fetchNotifications();
        syncService.startSync();

        let socket: Socket | null = null;

        const setupSocket = async () => {
            const { auth } = await import('../firebase');
            await auth.authStateReady();
            const firebaseUser = auth.currentUser;

            if (firebaseUser) {
                const token = await firebaseUser.getIdToken();
                socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/notifications`, {
                    auth: { token }
                });

                socket.on('notification:received', async (newNotification: Notification) => {
                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);

                    // Log to Offline Store
                    await syncService.logLocalMessage({
                        message_id: newNotification.id,
                        subject: newNotification.title,
                        body: newNotification.message,
                        category: newNotification.category,
                        type: 'received',
                        priority: 'medium', // Default priority
                        recipient_id: user.id,
                        status: 'delivered'
                    });

                    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
                        new window.Notification(newNotification.title, {
                            body: newNotification.message,
                        });
                    }
                });
            }
        };

        setupSocket();

        return () => {
            if (socket) socket.disconnect();
            syncService.stopSync();
        };
    }, [user]);

    const markAsRead = async (ids?: string[]) => {
        try {
            await api.post('/v2/notifications/read', { notificationIds: ids });
            setNotifications(prev =>
                prev.map(n => (!ids || ids.includes(n.id)) ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => ids ? Math.max(0, prev - ids.length) : 0);
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await api.delete(`/v2/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
            setUnreadCount(prev => {
                const n = notifications.find(notif => notif.id === id);
                return (n && !n.isRead) ? prev - 1 : prev;
            });
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    return {
        notifications,
        loading,
        unreadCount,
        markAsRead,
        deleteNotification,
        refresh: fetchNotifications
    };
}
