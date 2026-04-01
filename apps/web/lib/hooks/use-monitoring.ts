import { useCallback, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';

export interface SystemMetrics {
    cpuUsage: number;
    memoryUsage: {
        total: number;
        used: number;
        percentage: number;
    };
    uptime: number;
    throughput: number;
    totalRequestsInWindow: number;
    timestamp: string;
    ai?: {
        reachable: boolean;
        status: string;
        metrics: {
            total_solves: number;
            avg_solve_time_ms: number;
            last_solve_time_ms: number;
            uptime_requests: number;
            error_count: number;
        } | null;
        version: string;
    };
}

export const useMonitoring = () => {
    const { user } = useAuthStore();
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
    const [history, setHistory] = useState<SystemMetrics[]>([]);

    const appendMetrics = useCallback((data: SystemMetrics) => {
        setMetrics(data);
        setHistory((prev) => {
            const nextHistory = [...prev, data];
            if (nextHistory.length > 20) {
                return nextHistory.slice(nextHistory.length - 20);
            }
            return nextHistory;
        });
    }, []);

    const fetchSnapshot = useCallback(async () => {
        const response = await api.get('/v2/monitoring/metrics');
        return response.data as SystemMetrics;
    }, []);

    useEffect(() => {
        if (!user || user.role !== 'SUPERADMIN') return;

        let socket: Socket | undefined;
        let isActive = true;
        let pollTimer: ReturnType<typeof setInterval> | undefined;

        const disconnectSocket = () => {
            if (socket) {
                socket.disconnect();
                socket = undefined;
            }
        };

        const refreshSnapshot = async () => {
            try {
                const snapshot = await fetchSnapshot();
                if (!isActive) return;
                appendMetrics(snapshot);
            } catch (error) {
                if (!isActive) return;
                console.error('[Monitoring] Failed to fetch metrics snapshot:', error);
            }
        };

        void refreshSnapshot();
        pollTimer = setInterval(() => {
            void refreshSnapshot();
        }, 10000);

        // Listen for ID token changes from Firebase
        const unsubscribe = auth.onIdTokenChanged(async () => {
            try {
                await auth.authStateReady();
                if (!isActive) return;

                const token = await auth.currentUser?.getIdToken();
                const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

                if (!token) {
                    disconnectSocket();
                    return;
                }

                // If socket exists, don't re-init unless we disconnected
                if (socket?.connected) return;

                console.log(`[Monitoring] Connecting to ${socketUrl}/notifications...`);

                socket = io(`${socketUrl}/notifications`, {
                    auth: { token },
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionAttempts: 5
                });

                socket.on('connect', () => {
                    console.log('[Monitoring] Telemetry socket connected');
                });

                socket.on('system_metrics', (data: SystemMetrics) => {
                    console.debug('[Monitoring] Received metrics heartbeat');
                    appendMetrics(data);
                });

                socket.on('connect_error', (err) => {
                    console.error('[Monitoring] Socket Connection Error:', err.message);
                });

                socket.on('error', (err) => {
                    console.error('[Monitoring] Socket Error:', err);
                });

            } catch (err) {
                console.error('[Monitoring] Error fetching token for telemetry:', err);
            }
        });

        return () => {
            isActive = false;
            unsubscribe();
            if (pollTimer) clearInterval(pollTimer);
            disconnectSocket();
        };
    }, [appendMetrics, fetchSnapshot, user]);

    return { metrics, history };
};
