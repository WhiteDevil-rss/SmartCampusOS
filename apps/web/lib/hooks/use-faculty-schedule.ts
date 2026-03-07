import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';

export interface FacultyScheduleSlot {
    id: string;
    dayOfWeek: number;
    slotNumber: number;
    startTime: string;
    endTime: string;
    course: { name: string; code: string };
    batch: { name: string; semester: number; division: string };
    room: { name: string; building: string };
    block: { name: string };
    sessionType: { name: string };
}

export function useFacultySchedule() {
    const { user } = useAuthStore();
    const [schedule, setSchedule] = useState<FacultyScheduleSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'FACULTY') return;

        const fetchSchedule = async () => {
            try {
                setLoading(true);
                const response = await api.get('/faculty/schedule');
                setSchedule(response.data);
            } catch (err: any) {
                console.error('Failed to fetch faculty schedule:', err);
                setError(err.response?.data?.error || 'Failed to load schedule');
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [user]);

    return { schedule, loading, error };
}
