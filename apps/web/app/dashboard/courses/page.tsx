'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuPlus, LuTrash2, LuPencil, LuSearch, LuFilter, LuBookOpen } from 'react-icons/lu';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog, useConfirm } from '@/components/ui/confirm-dialog';
import { Toast, useToast } from '@/components/ui/toast-alert';
import { UNI_ADMIN_NAV } from '@/lib/constants/nav-config';

const emptyForm = { name: '', code: '', program: '', semester: 0, credits: 4, weeklyHrs: 4, type: 'Theory', isElective: false, departmentId: '' };
type CourseForm = typeof emptyForm;

interface Program {
    id: string;
    name: string;
    shortName: string;
}

interface Department {
    id: string;
    name: string;
    shortName: string;
}

interface Course {
    id: string;
    name: string;
    code: string;
    program?: string;
    semester?: number;
    credits: number;
    type: string;
    isElective: boolean;
    departmentId: string;
}

function CourseFormFields({
    form, setForm, error, programs, departments
}: {
    form: CourseForm; setForm: (f: CourseForm) => void; error: string; programs: Program[]; departments: Department[];
}) {
    return (
        <div className="space-y-4 py-4">
            {error && <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm">{error}</div>}

            <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Hosting Department</label>
                <select
                    className="w-full h-10 rounded-md border border-border bg-background text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                >
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.shortName})</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Course Name</label>
                <Input
                    placeholder="e.g. Advanced Operating Systems"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-background border-border text-white placeholder:text-muted/50"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Course Code</label>
                    <Input
                        placeholder="e.g. CS-401"
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                        className="bg-background border-border text-white placeholder:text-muted/50"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Course Type</label>
                    <select
                        className="w-full h-10 rounded-md border border-border bg-background text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                        <option value="Theory">Theory</option>
                        <option value="Lab">Lab / Practical</option>
                        <option value="Theory+Lab">Theory + Lab</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Parent Program</label>
                    <select
                        className="w-full h-10 rounded-md border border-border bg-background text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={form.program}
                        onChange={(e) => setForm({ ...form, program: e.target.value })}
                    >
                        <option value="">No program / General</option>
                        {programs.map(p => <option key={p.id} value={p.shortName}>{p.name} ({p.shortName})</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Semester</label>
                    <select
                        className="w-full h-10 rounded-md border border-border bg-background text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={form.semester}
                        onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) })}
                    >
                        <option value={0}>Not specified</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(s => (
                            <option key={s} value={s}>Semester {s}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Credits</label>
                <Input
                    type="number" min="1" max="10"
                    value={form.credits}
                    onChange={(e) => {
                        const c = parseInt(e.target.value) || 1;
                        setForm({ ...form, credits: c, weeklyHrs: c });
                    }}
                    className="bg-background border-border text-white"
                />
            </div>

            <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background">
                <input
                    type="checkbox"
                    id="isElective"
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-surface"
                    checked={form.isElective}
                    onChange={(e) => setForm({ ...form, isElective: e.target.checked })}
                />
                <label htmlFor="isElective" className="text-sm font-medium text-white cursor-pointer">
                    Mark as Elective Course
                </label>
            </div>
        </div>
    );
}

const typeColor: Record<string, string> = {
    Theory: 'bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold',
    Lab: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold',
    'Theory+Lab': 'bg-purple-500/10 text-purple-400 border-purple-500/20 font-bold',
};

export default function UniversityCourses() {
    const { user } = useAuthStore();
    const [courses, setCourses] = useState<Course[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    const [loading, setLoading] = useState(true);
    const [filterProgram, setFilterProgram] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [addForm, setAddForm] = useState<CourseForm>({ ...emptyForm });
    const [editForm, setEditForm] = useState<CourseForm>({ ...emptyForm });
    const [error, setError] = useState('');
    const { confirmState, closeConfirm, askConfirm } = useConfirm();
    const { toast, showToast, hideToast } = useToast();

    const fetchData = useCallback(async () => {
        if (!user?.universityId) return;
        setLoading(true);
        try {
            const [coursesRes, programsRes, deptsRes] = await Promise.all([
                api.get('/courses'),
                api.get('/programs'),
                api.get(`/universities/${user.universityId}/departments`),
            ]);
            setCourses(coursesRes.data);
            setPrograms(programsRes.data);
            setDepartments(deptsRes.data);
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to synchronize academic data');
        } finally {
            setLoading(false);
        }
    }, [user?.universityId, showToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = courses.filter(c => {
        const matchesProgram = !filterProgram || c.program === filterProgram;
        const matchesSearch = !searchTerm ||
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.code.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesProgram && matchesSearch;
    });

    const handleCreate = async () => {
        setError('');
        if (!addForm.departmentId) {
            setError('Please assign a primary hosting department');
            return;
        }
        try {
            await api.post('/courses', {
                ...addForm,
                universityId: user?.universityId,
            });
            setIsAddOpen(false);
            setAddForm({ ...emptyForm });
            fetchData();
            showToast('success', 'Course added to university catalog');
        } catch (e) {
            setError((e as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to register course.');
        }
    };

    const handleEdit = async () => {
        if (!selectedId) return;
        setError('');
        try {
            await api.put(`/courses/${selectedId}`, editForm);
            setIsEditOpen(false);
            fetchData();
            showToast('success', 'Course configurations updated');
        } catch (e) {
            setError((e as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to update course.');
        }
    };

    const handleDelete = (id: string) => {
        askConfirm({
            title: 'Decommission Course',
            message: 'Permanently remove this course from the global catalog? Current faculty links and student assignments will be severed. This action cannot be undone.',
            requireTypedConfirm: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/courses/${id}`);
                    fetchData();
                    showToast('success', 'Course decommissioned');
                } catch (e) {
                    showToast('error', (e as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to delete course.');
                }
            },
        });
    };

    return (
        <ProtectedRoute allowedRoles={['UNI_ADMIN']}>
            <DashboardLayout navItems={UNI_ADMIN_NAV} title="Academic Catalog">
                <ConfirmDialog state={confirmState} onClose={closeConfirm} />
                <Toast toast={toast} onClose={hideToast} />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white font-heading font-black">Global Courses Directory</h2>
                        <p className="text-muted border-none">Manage all academic courses and subjects across all university departments.</p>
                    </div>
                    <Button onClick={() => { setError(''); setAddForm({ ...emptyForm }); setIsAddOpen(true); }} className="bg-primary shadow-md hover:bg-primary/90 shrink-0 text-primary-foreground font-bold">
                        <LuPlus className="w-4 h-4 mr-2" /> Register Course
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 shadow-sm w-full max-w-sm">
                        <LuFilter className="w-4 h-4 text-muted shrink-0" />
                        <select
                            className="flex-1 text-sm bg-transparent outline-none text-white focus:ring-0"
                            value={filterProgram}
                            onChange={(e) => setFilterProgram(e.target.value)}
                        >
                            <option value="">All Programs</option>
                            {programs.map(p => <option key={p.id} value={p.shortName}>{p.name} ({p.shortName})</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 shadow-sm w-full max-w-sm">
                        <LuSearch className="w-4 h-4 text-muted shrink-0" />
                        <Input
                            placeholder="Search by name or course code..."
                            className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm placeholder:text-muted/50 text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(course => (
                            <Card key={course.id} className="bg-surface shadow-sm border-border hover:border-primary/50 transition-colors overflow-hidden group">
                                <CardHeader className="pb-3 border-b bg-surface-hover border-border p-5">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="min-w-0 pr-2">
                                            <CardTitle className="text-base font-bold text-white font-heading line-clamp-2 leading-tight">{course.name}</CardTitle>
                                            <CardDescription className="font-mono font-bold text-sm mt-1 text-primary">{course.code}</CardDescription>
                                        </div>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border shrink-0 ${typeColor[course.type] || 'bg-surface border-border text-muted'}`}>
                                            {course.type}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-5 pb-5 px-5">
                                    <div className="grid grid-cols-3 gap-2 mb-5 text-center">
                                        <div className="bg-background rounded-lg p-2 border border-border">
                                            <div className="text-[10px] text-muted font-bold uppercase tracking-wider">Program</div>
                                            <div className="text-sm font-bold text-primary truncate">{course.program || '—'}</div>
                                        </div>
                                        <div className="bg-background rounded-lg p-2 border border-border">
                                            <div className="text-[10px] text-muted font-bold uppercase tracking-wider">Credits</div>
                                            <div className="text-sm font-bold text-emerald-400">{course.credits}</div>
                                        </div>
                                        <div className="bg-background rounded-lg p-2 border border-border">
                                            <div className="text-[10px] text-muted font-bold uppercase tracking-wider">Semester</div>
                                            <div className="text-sm font-bold text-amber-400">{course.semester ? `Sem ${course.semester}` : '—'}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" size="sm" className="w-1/2 text-muted hover:text-white border-border hover:bg-surface-hover font-bold font-heading bg-transparent"
                                            onClick={() => {
                                                setSelectedId(course.id);
                                                setEditForm({
                                                    name: course.name,
                                                    code: course.code,
                                                    program: course.program || '',
                                                    semester: course.semester ?? 0,
                                                    credits: course.credits,
                                                    weeklyHrs: course.credits,
                                                    type: course.type,
                                                    isElective: course.isElective,
                                                    departmentId: course.departmentId
                                                });
                                                setError('');
                                                setIsEditOpen(true);
                                            }}>
                                            <LuPencil className="w-4 h-4 mr-1.5" /> Edit
                                        </Button>
                                        <Button variant="outline" size="sm" className="w-1/2 text-red-500 border-red-500/20 hover:bg-red-500/10 hover:text-red-400 font-bold font-heading bg-transparent"
                                            onClick={() => handleDelete(course.id)}>
                                            <LuTrash2 className="w-4 h-4 mr-1.5" /> Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {filtered.length === 0 && (
                            <div className="col-span-full py-16 text-center text-muted bg-surface rounded-xl border-dashed border-2 border-border/50">
                                <LuBookOpen className="w-12 h-12 text-muted/30 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-white">{filterProgram ? `No courses for ${filterProgram}` : 'No courses registered in catalog'}</h3>
                                <p className="text-sm mt-1">Populate the academic registry to enable institutional-wide scheduling.</p>
                            </div>
                        )}
                    </div>
                )}

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-surface border-border">
                        <DialogHeader><DialogTitle className="text-white font-heading font-black">Register New Course</DialogTitle></DialogHeader>
                        <CourseFormFields form={addForm} setForm={setAddForm} error={error} programs={programs} departments={departments} />
                        <DialogFooter className="border-t border-border pt-4">
                            <Button variant="outline" className="border-border text-muted hover:bg-surface-hover hover:text-white" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleCreate} disabled={!addForm.name || !addForm.code || !addForm.departmentId}>Add to Catalog</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-surface border-border">
                        <DialogHeader><DialogTitle className="text-white font-heading font-black">Edit Course Configuration</DialogTitle></DialogHeader>
                        <CourseFormFields form={editForm} setForm={setEditForm} error={error} programs={programs} departments={departments} />
                        <DialogFooter className="border-t border-border pt-4">
                            <Button variant="outline" className="border-border text-muted hover:bg-surface-hover hover:text-white" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold" onClick={handleEdit} disabled={!editForm.name || !editForm.code}>Save Revisions</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
