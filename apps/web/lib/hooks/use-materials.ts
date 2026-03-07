import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';

export interface StudyMaterial {
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    fileType: string;
    course: { name: string; code: string };
    faculty: { name: string };
    createdAt: string;
}

export function useMaterials() {
    const { user } = useAuthStore();
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const materialRes = await api.get('/materials');
            setMaterials(materialRes.data);

            // Also fetch courses the faculty is assigned to
            const courseRes = await api.get('/faculty/courses');
            setCourses(courseRes.data);
        } catch (err: any) {
            console.error('Failed to fetch materials:', err);
            setError(err.response?.data?.error || 'Failed to load materials');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchMaterials();
    }, [user]);

    const uploadMaterial = async (data: any) => {
        const response = await api.post('/materials', data);
        setMaterials(prev => [...prev, response.data]);
        return response.data;
    };

    const deleteMaterial = async (id: string) => {
        await api.delete(`/materials/${id}`);
        setMaterials(prev => prev.filter(m => m.id !== id));
    };

    return { materials, courses, loading, error, refreshMaterials: fetchMaterials, uploadMaterial, deleteMaterial };
}
