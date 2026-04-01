import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';

export interface FacultyStats {
    totalSubjects: number;
    lecturesToday: number;
    totalStudents: number;
    pendingAssignments: number;
    unreadMessages: number;
    pendingReviews: number;
    todaySchedule: any[];
}

export interface FacultyProfile {
    id: string;
    name: string;
    email: string;
    designation: string;
}

export function useFacultyData() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<FacultyStats | null>(null);
    const [profile, setProfile] = useState<FacultyProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'FACULTY') return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsRes, profileRes] = await Promise.all([
                    api.get('/faculty/stats'),
                    api.get(`/faculty/${user.entityId}`)
                ]);
                setStats(statsRes.data);
                setProfile(profileRes.data);
            } catch (err: any) {
                console.error('Failed to fetch faculty data:', err);
                setError(err.response?.data?.error || 'Failed to load faculty data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    return { stats, profile, loading, error };
}
