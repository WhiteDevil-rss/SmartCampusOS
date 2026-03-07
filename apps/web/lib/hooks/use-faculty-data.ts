import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';

export interface FacultyStats {
    totalSubjects: number;
    lecturesToday: number;
    totalStudents: number;
    pendingAssignments: number;
    unreadMessages: number;
    todaySchedule: any[];
}

export function useFacultyData() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<FacultyStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'FACULTY') return;

        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await api.get('/faculty/stats');
                setStats(response.data);
            } catch (err: any) {
                console.error('Failed to fetch faculty stats:', err);
                setError(err.response?.data?.error || 'Failed to load faculty stats');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    return { stats, loading, error };
}
