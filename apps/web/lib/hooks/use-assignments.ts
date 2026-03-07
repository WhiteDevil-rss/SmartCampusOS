import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';

export interface Assignment {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    maxMarks: number;
    course: { name: string; code: string };
    batch?: { name: string };
    submissions?: any[];
    _count?: { submissions: number };
}

export function useAssignments() {
    const { user } = useAuthStore();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const assignmentRes = await api.get('/assignments');
            setAssignments(assignmentRes.data);

            const courseRes = await api.get('/faculty/courses');
            const batchRes = await api.get('/faculty/batches');
            setCourses(courseRes.data);
            setBatches(batchRes.data);
        } catch (err: any) {
            console.error('Failed to fetch assignments:', err);
            setError(err.response?.data?.error || 'Failed to load assignments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchAssignments();
    }, [user]);

    const addAssignment = async (data: any) => {
        const response = await api.post('/assignments', data);
        setAssignments(prev => [...prev, response.data]);
        return response.data;
    };

    return { assignments, courses, batches, loading, error, refreshAssignments: fetchAssignments, addAssignment };
}
