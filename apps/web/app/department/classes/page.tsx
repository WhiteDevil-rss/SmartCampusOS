'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import {
    LuBookOpen, LuPlus, LuTrash2, LuPencil,
    LuSearch, LuTriangleAlert, LuUsers, LuUser, LuLayers, LuInfo
} from 'react-icons/lu';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DEPT_ADMIN_NAV } from '@/lib/constants/nav-config';
import { Badge } from '@/components/ui/badge';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Subject {
    id: string;
    name: string;
    code: string;
}

interface Faculty {
    id: string;
    user: { name: string };
}

interface Division {
    id: string;
    name: string;
    batch: { name: string };
}

interface ClassRecord {
    id: string;
    subjectId: string;
    facultyId: string;
    divisionId: string;
    subject: Subject;
    faculty: Faculty;
    division: Division;
}

export default function DeptClassesPage() {
    const { user } = useAuthStore();
    const [classes, setClasses] = useState<ClassRecord[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Dialog state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [error, setError] = useState('');

    // Form state
    const [form, setForm] = useState({
        subjectId: '',
        facultyId: '',
        divisionId: ''
    });

    const fetchData = useCallback(async () => {
        if (!user?.entityId) return;
        setLoading(true);
        try {
            const [classRes, subRes, facRes, divRes] = await Promise.all([
                api.get('/v2/classes'),
                api.get('/subjects'),
                api.get('/faculty'),
                api.get('/v2/divisions')
            ]);
            setClasses(classRes.data);
            setSubjects(subRes.data);
            setFaculties(facRes.data);
            setDivisions(divRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [user?.entityId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCreate = async () => {
        try {
            setError('');
            await api.post('/v2/classes', {
                ...form,
                departmentId: user?.entityId
            });
            setIsAddOpen(false);
            fetchData();
        } catch (e: any) {
            setError(e.response?.data?.error || 'Failed to create class assignment');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? Removing this class will also delete any related timetable slots.')) return;
        try {
            await api.delete(`/v2/classes/${id}`);
            fetchData();
        } catch (e: any) {
            alert(e.response?.data?.error || 'Failed to delete class');
        }
    };

    const filteredClasses = classes.filter(c =>
        c.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.faculty.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.division.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN']}>
            <DashboardLayout navItems={DEPT_ADMIN_NAV} title="Academic Classes">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Academic Assignments</h2>
                        <p className="text-slate-500 dark:text-slate-400">Map subjects and faculty to specific divisions.</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-72">
                            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search subject or faculty..."
                                className="pl-10 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => {
                            setForm({ subjectId: '', facultyId: '', divisionId: '' });
                            setError('');
                            setIsAddOpen(true);
                        }} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 shrink-0">
                            <LuPlus className="w-5 h-5 mr-2" /> New Assignment
                        </Button>
                    </div>
                </div>

                <Card className="mb-6 bg-blue-50/50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20">
                    <CardContent className="py-4 flex gap-3">
                        <LuInfo className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Note on Scheduling:</strong> These assignments form the basis of your timetable. 
                            When you add a slot in the Timetable Builder, you select from these pre-approved Class Assignments.
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-24 space-y-4">
                        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClasses.map((cls) => (
                            <Card key={cls.id} className="group overflow-hidden border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all shadow-sm hover:shadow-lg">
                                <div className="p-1 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Assignment ID: {cls.id.slice(-6)}</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-500 hover:bg-red-50"
                                        onClick={() => handleDelete(cls.id)}>
                                        <LuTrash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <CardContent className="pt-6">
                                    <div className="mb-4">
                                        <div className="text-xs font-bold text-primary uppercase tracking-tighter mb-1">{cls.subject.code}</div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{cls.subject.name}</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600">
                                                <LuUser className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase">Faculty</div>
                                                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{cls.faculty.user.name}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                                                <LuLayers className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase">Division & Batch</div>
                                                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                    {cls.division.batch.name} — Div {cls.division.name}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {filteredClasses.length === 0 && (
                            <div className="col-span-full py-20 text-center glass-card border-dashed">
                                <LuBookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-600 uppercase tracking-wide">No Class assignments found</h3>
                                <p className="text-sm text-slate-500 mt-2">Map your subjects and faculty to divisions to start building the timetable.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Add Dialog ─────────────────────────────────────────────── */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="sm:max-w-md dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">New Class Assignment</DialogTitle>
                            <DialogDescription>Link a subject and faculty to a specific section.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-6">
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm animate-shake">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Subject</label>
                                <select 
                                    className="w-full h-11 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={form.subjectId}
                                    onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                                >
                                    <option value="">Select subject...</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Faculty</label>
                                <select 
                                    className="w-full h-11 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={form.facultyId}
                                    onChange={(e) => setForm({ ...form, facultyId: e.target.value })}
                                >
                                    <option value="">Select faculty member...</option>
                                    {faculties.map(f => <option key={f.id} value={f.id}>{f.user.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Target Division</label>
                                <select 
                                    className="w-full h-11 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={form.divisionId}
                                    onChange={(e) => setForm({ ...form, divisionId: e.target.value })}
                                >
                                    <option value="">Select target division...</option>
                                    {divisions.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.batch.name} — Div {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button 
                                className="bg-primary hover:bg-primary/90 text-white min-w-[120px]" 
                                onClick={handleCreate}
                                disabled={!form.subjectId || !form.facultyId || !form.divisionId}
                            >
                                Assign Class
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
