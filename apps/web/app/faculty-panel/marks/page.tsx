'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { FACULTY_NAV } from '@/lib/constants/nav-config';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LuSave, LuSend, LuCircleCheck, LuBookOpen, LuChevronRight } from 'react-icons/lu';
import { Badge } from '@/components/ui/badge';
import { useToast, Toast } from '@/components/ui/toast-alert';

export default function FacultyMarksPage() {
    const { user } = useAuthStore();
    const { toast: toastState, showToast, hideToast } = useToast();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [marks, setMarks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchSubjects = useCallback(async () => {
        try {
            const { data } = await api.get('/v2/marks/faculty/subjects');
            setSubjects(data);
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to load subjects');
        }
    }, [showToast]);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    const fetchMarks = async (subjectId: string) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/v2/marks/course/${subjectId}/students`);
            setMarks(data);
            setSelectedSubject(subjects.find(s => s.course.id === subjectId));
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to load student marks');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (id: string, field: string, value: string) => {
        setMarks(prev => prev.map(m => m.id === id ? { ...m, [field]: parseFloat(value) || 0 } : m));
    };

    const saveDraft = async () => {
        setSaving(true);
        try {
            const payload = marks.map(m => ({
                subjectResultId: m.id,
                internalMarks: m.internalMarks,
                midTermMarks: m.midTermMarks
            }));
            await api.post('/v2/marks/faculty/upload', { marks: payload });
            showToast('success', 'Marks saved as draft');
            fetchMarks(selectedSubject.course.id);
        } catch (e) {
            showToast('error', 'Failed to save marks');
        } finally {
            setSaving(false);
        }
    };

    const submitToDept = async () => {
        if (!confirm('Are you sure you want to submit marks to the department? You won\'t be able to edit them afterwards.')) return;
        setSaving(true);
        try {
            const ids = marks.map(m => m.id);
            await api.post('/v2/marks/faculty/submit', { subjectResultIds: ids });
            showToast('success', 'Marks submitted to department');
            fetchMarks(selectedSubject.course.id);
        } catch (e) {
            showToast('error', 'Failed to submit marks');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['FACULTY']}>
            <DashboardLayout navItems={FACULTY_NAV} title="Internal Marks Management">
                <Toast toast={toastState} onClose={hideToast} />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Subject Selector Sidebar */}
                    <div className="lg:col-span-3 space-y-4">
                        <Card className="rounded-2xl border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c]">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">My Subjects</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 space-y-1">
                                {subjects.map((sub) => (
                                    <button
                                        key={sub.course.id}
                                        onClick={() => fetchMarks(sub.course.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${
                                            selectedSubject?.course.id === sub.course.id
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                                : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <LuBookOpen className={`w-4 h-4 ${selectedSubject?.course.id === sub.course.id ? 'text-white' : 'text-indigo-500'}`} />
                                            <div className="overflow-hidden">
                                                <p className="font-bold truncate text-sm">{sub.course.name}</p>
                                                <p className={`text-[10px] uppercase font-medium ${selectedSubject?.course.id === sub.course.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                    {sub.course.code}
                                                </p>
                                            </div>
                                        </div>
                                        <LuChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${selectedSubject?.course.id === sub.course.id ? 'text-white' : 'text-slate-300'}`} />
                                    </button>
                                ))}
                                {subjects.length === 0 && <p className="text-center py-4 text-xs text-slate-400 font-medium">No subjects assigned</p>}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Marks Entry Table */}
                    <div className="lg:col-span-9 space-y-6">
                        {loading ? (
                            <Card className="rounded-2xl border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] h-64 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full"></div>
                            </Card>
                        ) : selectedSubject ? (
                            <Card className="rounded-2xl border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between border-b dark:border-border-hover bg-slate-50/50 dark:bg-white/[0.02]">
                                    <div>
                                        <CardTitle className="text-xl font-bold">{selectedSubject.course.name}</CardTitle>
                                        <p className="text-xs text-slate-500 font-medium">{selectedSubject.course.code} • Batch: 2024</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button 
                                            onClick={saveDraft} 
                                            disabled={saving}
                                            variant="outline" 
                                            className="rounded-xl font-bold gap-2"
                                        >
                                            <LuSave className="w-4 h-4" /> Save Draft
                                        </Button>
                                        <Button 
                                            onClick={submitToDept} 
                                            disabled={saving}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
                                        >
                                            <LuSend className="w-4 h-4" /> Submit to Dept
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-slate-100/50 dark:bg-white/[0.02]">
                                            <TableRow>
                                                <TableHead className="font-bold py-4">Student Info</TableHead>
                                                <TableHead className="font-bold py-4">Status</TableHead>
                                                <TableHead className="font-bold py-4">Mid-Term (20)</TableHead>
                                                <TableHead className="font-bold py-4">Internal (30)</TableHead>
                                                <TableHead className="font-bold py-4">Total (50)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {marks.map((m) => (
                                                <TableRow key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-bold text-sm text-slate-900 dark:text-white">{m.result.student.name}</p>
                                                            <p className="text-[11px] font-medium text-slate-400">{m.result.student.enrollmentNo}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={
                                                            m.status === 'DRAFT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                            m.status === 'SUBMITTED_TO_DEPT' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        }>
                                                            {m.status.replace(/_/g, ' ')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input 
                                                            type="number" 
                                                            max="20"
                                                            value={m.midTermMarks || ''}
                                                            onChange={(e) => handleMarkChange(m.id, 'midTermMarks', e.target.value)}
                                                            disabled={m.status !== 'DRAFT'}
                                                            className="w-20 rounded-lg text-center font-bold h-9"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input 
                                                            type="number" 
                                                            max="30"
                                                            value={m.internalMarks || ''}
                                                            onChange={(e) => handleMarkChange(m.id, 'internalMarks', e.target.value)}
                                                            disabled={m.status !== 'DRAFT'}
                                                            className="w-20 rounded-lg text-center font-bold h-9"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                                                            {(m.midTermMarks || 0) + (m.internalMarks || 0)}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    {marks.length === 0 && (
                                        <div className="text-center py-20 flex flex-col items-center">
                                            <LuCircleCheck className="w-12 h-12 text-slate-200 mb-4" />
                                            <p className="text-slate-400 font-medium italic">No student records found for this course.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="rounded-2xl border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] h-96 flex flex-col items-center justify-center text-center p-8 bg-slate-50/20">
                                <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6">
                                    <LuBookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <CardTitle className="text-2xl font-black mb-2 tracking-tight">Select a Subject to Begin</CardTitle>
                                <p className="text-slate-500 font-medium max-w-sm">Choose a subject from the left panel to record internal assessment marks for your students.</p>
                            </Card>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
