import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';

export interface SemesterResult {
    id: string;
    semester: number;
    academicYear: string;
    sgpa: number;
    cgpa: number;
    status: string;
}

export interface GradedAssignment {
    id: string;
    title: string;
    course: string;
    grade: number;
    maxMarks: number;
    date: string;
}

export interface QuizAttempt {
    id: string;
    title: string;
    course: string;
    score: number;
    date: string;
}

export interface PerformanceData {
    semesterResults: SemesterResult[];
    assignments: GradedAssignment[];
    quizzes: QuizAttempt[];
}

export function useStudentPerformance() {
    const { user } = useAuthStore();
    const [performance, setPerformance] = useState<PerformanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchPerformance = async () => {
            try {
                setLoading(true);
                const response = await api.get('/v2/student/performance/me');
                setPerformance(response.data);
            } catch (err: any) {
                console.error('Failed to fetch student performance:', err);
                setError(err.response?.data?.error || 'Failed to load performance data');
            } finally {
                setLoading(false);
            }
        };

        fetchPerformance();
    }, [user]);

    return { performance, loading, error };
}
