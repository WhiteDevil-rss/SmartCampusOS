'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuPlus, LuTrash2, LuPencil, LuSearch, LuGraduationCap, LuUsers } from 'react-icons/lu';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ConfirmDialog, useConfirm } from '@/components/ui/confirm-dialog';
import { Toast, useToast } from '@/components/ui/toast-alert';

import { DEPT_ADMIN_NAV } from '@/lib/constants/nav-config';

interface Batch {
    id: string;
    name: string;
    division?: string;
}

interface Program {
    id: string;
    name: string;
    shortName: string;
}

interface Student {
    id: string;
    enrollmentNo: string;
    name: string;
    email: string;
    phone?: string;
    admissionYear?: string;
    batchId?: string;
    programId?: string;
    batch?: Batch;
    program?: Program;
}

export default function DeptStudentDashboard() {
    const { user } = useAuthStore();
    const [students, setStudents] = useState<Student[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const { confirmState, closeConfirm, askConfirm } = useConfirm();
    const { toast, showToast, hideToast } = useToast();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const [form, setForm] = useState({
        enrollmentNo: '',
        name: '',
        email: '',
        phone: '',
        admissionYear: new Date().getFullYear().toString(),
        batchId: '',
        programId: ''
    });

    const fetchData = useCallback(async () => {
        if (!user?.entityId) return;
        try {
            const params = new URLSearchParams();
            params.set('departmentId', user.entityId);

            const [stuRes, batchRes, progRes] = await Promise.all([
                api.get(`/v2/student?${params.toString()}`),
                api.get(`/batches?departmentId=${user.entityId}`),
                api.get(`/programs`)
            ]);
            setStudents(stuRes.data);
            setBatches(batchRes.data);
            setPrograms(progRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [user?.entityId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filtered = students.filter(s =>
        !searchTerm ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateStudent = async () => {
        try {
            const payload = {
                ...form,
                departmentId: user?.entityId,
                universityId: user?.universityId
            };
            await api.post(`/v2/student`, payload);
            setIsAddOpen(false);
            setForm({ enrollmentNo: '', name: '', email: '', phone: '', admissionYear: new Date().getFullYear().toString(), batchId: '', programId: '' });
            fetchData();
            showToast('success', 'Student registered successfully!');
        } catch (e) {
            const errorMsg = (e as any).response?.data?.error || 'Failed to register student.';
            showToast('error', errorMsg);
        }
    };

    const handleEditStudent = async () => {
        if (!selectedStudentId) return;
        try {
            await api.put(`/v2/student/${selectedStudentId}`, form);
            setIsEditOpen(false);
            fetchData();
            showToast('success', 'Student record updated!');
        } catch (e) {
            const errorMsg = (e as any).response?.data?.error || 'Failed to update student.';
            showToast('error', errorMsg);
        }
    };

    const handleDeleteStudent = (id: string) => {
        askConfirm({
            title: 'Delete Student',
            message: 'Are you sure you want to remove this student? This action is permanent.',
            requireTypedConfirm: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/v2/student/${id}`);
                    fetchData();
                    showToast('success', 'Student removed.');
                } catch {
                    showToast('error', 'Failed to delete student.');
                }
            },
        });
    };

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN']}>
            <DashboardLayout navItems={DEPT_ADMIN_NAV} title="Department Students">
                <ConfirmDialog state={confirmState} onClose={closeConfirm} />
                <Toast toast={toast} onClose={hideToast} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-text-primary">Student Records</h2>
                        <p className="text-text-secondary dark:text-text-muted">Manage enrollment data and academic assignments for students in your department.</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-2 glass border rounded-lg px-3 py-2 shadow-sm w-full sm:w-64">
                            <LuSearch className="w-4 h-4 text-text-muted dark:text-text-secondary shrink-0" />
                            <Input
                                placeholder="Search by name, email or ID..."
                                className="border-0 bg-transparent p-0 flex-1 w-full outline-none focus:outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-sm dark:text-text-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => {
                            setForm({ enrollmentNo: '', name: '', email: '', phone: '', admissionYear: new Date().getFullYear().toString(), batchId: '', programId: '' });
                            setIsAddOpen(true);
                        }} className="bg-primary text-text-primary shadow-md hover:bg-primary/90">
                            <LuPlus className="w-4 h-4 mr-2" /> Register Student
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(stu => (
                            <Card key={stu.id} className="glass-card shadow-sm border-slate-200 dark:border-border-hover hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-text-muted hover:text-indigo-600 dark:hover:text-indigo-400"
                                            onClick={() => {
                                                setSelectedStudentId(stu.id);
                                                setForm({
                                                    enrollmentNo: stu.enrollmentNo,
                                                    name: stu.name,
                                                    email: stu.email,
                                                    phone: stu.phone || '',
                                                    admissionYear: stu.admissionYear || '',
                                                    batchId: stu.batchId || '',
                                                    programId: stu.programId || ''
                                                });
                                                setIsEditOpen(true);
                                            }}>
                                            <LuPencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-text-muted hover:text-rose-600"
                                            onClick={() => handleDeleteStudent(stu.id)}>
                                            <LuTrash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <LuGraduationCap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold text-slate-800 dark:text-text-primary">{stu.name}</CardTitle>
                                            <CardDescription className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{stu.enrollmentNo}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-1">
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="space-y-1">
                                            <span className="text-text-muted font-medium block">Program</span>
                                            <span className="text-slate-700 dark:text-slate-200 font-bold truncate block">{stu.program?.shortName || 'N/A'}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-text-muted font-medium block">Batch</span>
                                            <span className="text-slate-700 dark:text-slate-200 font-bold truncate block">{stu.batch?.name || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t dark:border-border space-y-2">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-text-muted">Email</span>
                                            <span className="text-slate-600 dark:text-text-muted font-medium">{stu.email}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-text-muted">Admission Year</span>
                                            <span className="text-slate-600 dark:text-text-muted font-medium">{stu.admissionYear || 'N/A'}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {filtered.length === 0 && (
                            <div className="col-span-full py-20 text-center glass-card border-dashed border-2 border-slate-200 dark:border-border-hover rounded-2xl">
                                <LuUsers className="w-12 h-12 text-text-muted dark:text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-800 dark:text-text-primary">No Students Found</h3>
                                <p className="text-sm text-text-secondary max-w-xs mx-auto mt-2">No student records match your current search.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Add Dialog */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="sm:max-w-lg glass-card dark:border-border-hover">
                        <DialogHeader>
                            <DialogTitle>Register New Student</DialogTitle>
                            <DialogDescription>Provision a new student account for your department.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Enrollment No</label>
                                    <Input value={form.enrollmentNo} onChange={e => setForm({ ...form, enrollmentNo: e.target.value })} placeholder="e.g. MCA2024001" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="student@example.com" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone Number</label>
                                    <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Admission Year</label>
                                    <Input value={form.admissionYear} onChange={e => setForm({ ...form, admissionYear: e.target.value })} placeholder="e.g. 2024" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Program</label>
                                    <select className="w-full h-10 rounded-md border dark:border-border-hover bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                                        value={form.programId} onChange={e => setForm({ ...form, programId: e.target.value })}>
                                        <option value="">Select Program</option>
                                        {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Batch</label>
                                    <select className="w-full h-10 rounded-md border dark:border-border-hover bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                                        value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })}>
                                        <option value="">Select Batch</option>
                                        {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button className="bg-primary hover:bg-primary/90 text-text-primary" onClick={handleCreateStudent}
                                disabled={!form.name || !form.email || !form.enrollmentNo}>
                                Create Record
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-lg glass-card dark:border-border-hover">
                        <DialogHeader>
                            <DialogTitle>Edit Student Profile</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Enrollment No</label>
                                    <Input value={form.enrollmentNo} onChange={e => setForm({ ...form, enrollmentNo: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone Number</label>
                                    <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Admission Year</label>
                                    <Input value={form.admissionYear} onChange={e => setForm({ ...form, admissionYear: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Program</label>
                                    <select className="w-full h-10 rounded-md border dark:border-border-hover bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                                        value={form.programId} onChange={e => setForm({ ...form, programId: e.target.value })}>
                                        <option value="">Select Program</option>
                                        {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Batch</label>
                                    <select className="w-full h-10 rounded-md border dark:border-border-hover bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                                        value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })}>
                                        <option value="">Select Batch</option>
                                        {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button className="bg-primary hover:bg-primary/90 text-text-primary" onClick={handleEditStudent}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </DashboardLayout>
        </ProtectedRoute>
    );
}
