'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuPlus, LuTrash2, LuPencil, LuSearch, LuGraduationCap, LuUsers, LuKeyRound } from 'react-icons/lu';
import { UserListView } from '@/components/users/user-list-view';
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
    const [refreshKey, setRefreshKey] = useState(0);
    const triggerRefresh = () => setRefreshKey(prev => prev + 1);
    
    const [batches, setBatches] = useState<Batch[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
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
            const [batchRes, progRes] = await Promise.all([
                api.get(`/batches?departmentId=${user.entityId}`),
                api.get(`/programs`)
            ]);
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
            triggerRefresh();
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
            triggerRefresh();
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
                    triggerRefresh();
                    showToast('success', 'Student removed.');
                } catch {
                    showToast('error', 'Failed to delete student.');
                }
            },
        });
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.patch(`/users/${id}/status`, { isActive: !currentStatus });
            triggerRefresh();
        } catch {
            showToast('error', 'Failed to update access status');
        }
    };

    const handleResetPassword = (id: string) => {
        setSelectedStudentId(id);
        setIsResetPasswordOpen(true);
    };

    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const handleResetPasswordSubmit = async () => {
        try {
            await api.post(`/users/${selectedStudentId}/reset-password`, { password: newPassword });
            setIsResetPasswordOpen(false);
            setNewPassword('');
            showToast('success', 'Password reset successfully');
        } catch {
            showToast('error', 'Failed to reset password');
        }
    };

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN']}>
            <DashboardLayout navItems={DEPT_ADMIN_NAV} title="Department Students">
                <ConfirmDialog state={confirmState} onClose={closeConfirm} />
                <Toast toast={toast} onClose={hideToast} />

                <UserListView 
                    key={refreshKey}
                    title="Student Registry"
                    description="Institutional directory of enrolled students and their academic batches."
                    initialFilters={{ 
                        universityId: user?.universityId || undefined,
                        departmentId: user?.entityId || undefined
                    }}
                    onEdit={(u: any) => {
                        const s = u.student;
                        if (!s) return;
                        setSelectedStudentId(s.id);
                        setForm({
                            enrollmentNo: s.enrollmentNo,
                            name: s.name,
                            email: s.email,
                            phone: s.phone || u.phoneNumber || '',
                            admissionYear: s.admissionYear || '',
                            batchId: s.batchId || '',
                            programId: s.programId || ''
                        });
                        setIsEditOpen(true);
                    }}
                    onToggleStatus={(u: any) => handleToggleStatus(u.id, u.isActive)}
                    onResetPassword={(u: any) => handleResetPassword(u.id)}
                />

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

                {/* Reset Password Dialog */}
                <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
                    <DialogContent className="sm:max-w-md glass-card dark:border-border-hover shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center">
                                <LuKeyRound className="w-5 h-5 mr-3 text-amber-500" /> Administrative Password Reset
                            </DialogTitle>
                            <DialogDescription>Generate a new secure identity signature for this student account.</DialogDescription>
                        </DialogHeader>
                        <div className="py-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-text-muted tracking-widest ml-1">New Signature Pattern</label>
                                <Input 
                                    type="password" 
                                    className="h-12 bg-slate-50 dark:bg-surface border-border rounded-xl font-bold"
                                    placeholder="Enter new master key..." 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={() => setIsResetPasswordOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                            <Button onClick={handleResetPasswordSubmit} disabled={!newPassword} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20">Update Identity Signature</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <div className="fixed bottom-8 right-8 z-50">
                    <Button 
                        onClick={() => {
                            setForm({ enrollmentNo: '', name: '', email: '', phone: '', admissionYear: new Date().getFullYear().toString(), batchId: '', programId: '' });
                            setIsAddOpen(true);
                        }} 
                        className="bg-primary hover:bg-primary/90 text-text-primary h-14 w-14 rounded-full shadow-[0_0_30px_rgba(57,193,239,0.3)] border-4 border-white dark:border-slate-900 group transition-all hover:scale-110"
                    >
                        <LuPlus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    </Button>
                </div>

            </DashboardLayout>
        </ProtectedRoute>
    );
}
