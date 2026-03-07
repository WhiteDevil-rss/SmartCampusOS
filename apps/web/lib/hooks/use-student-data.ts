import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';

export interface StudentStats {
    attendancePercentage: number;
    currentSGPA: number;
    overallCGPA: number;
    pendingAssignments: number;
    creditsEarned: number;
}

export interface StudentProfile {
    id: string;
    enrollmentNo: string;
    name: string;
    email: string;
    batchId: string;
    departmentId: string;
    universityId: string;
    program: { name: string };
    batch: { name: string };
    department: { name: string };
}

export function useStudentData() {
    const { user } = useAuthStore();
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [stats, setStats] = useState<StudentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [profileRes, statsRes] = await Promise.all([
                    api.get('/v2/student/me'),
                    api.get('/v2/student/stats')
                ]);
                setProfile(profileRes.data);
                setStats(statsRes.data);
            } catch (err: any) {
                console.error('Failed to fetch student data:', err);
                setError(err.response?.data?.error || 'Failed to load student data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    return { profile, stats, loading, error };
}
