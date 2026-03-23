'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { APPROVAL_ADMIN_NAV } from '@/lib/constants/nav-config';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LuCircleCheck, LuShieldCheck, LuSearch, LuTriangleAlert } from 'react-icons/lu';
import { Badge } from '@/components/ui/badge';
import { useToast, Toast } from '@/components/ui/toast-alert';
import { Input } from '@/components/ui/input';

export default function ApprovalMarksPage() {
    const { user } = useAuthStore();
    const { toast: toastState, showToast, hideToast } = useToast();
    const [pendingMarks, setPendingMarks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPending = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/v2/marks/approval/pending');
            setPendingMarks(data);
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to load pending approvals');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    const approveMarks = async (subjectResultIds: string[]) => {
        if (!confirm(`Perform final approval for ${subjectResultIds.length} records?`)) return;
        setProcessing(true);
        try {
            await api.post('/v2/marks/approval/approve', { subjectResultIds });
            showToast('success', 'Marks finalized and submitted to University');
            fetchPending();
        } catch (e) {
            showToast('error', 'Failed to finalize marks');
        } finally {
            setProcessing(false);
        }
    };

    const filteredMarks = pendingMarks.filter(m => 
        m.result.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.result.student.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['APPROVAL_ADMIN']}>
            <DashboardLayout navItems={APPROVAL_ADMIN_NAV} title="Final Marks Verification">
                <Toast toast={toastState} onClose={hideToast} />
                <div className="space-y-6">
                    <Card className="rounded-3xl border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none bg-gradient-to-br from-white to-slate-50 dark:from-[#0a0a0c] dark:to-[#0f0f1a]">
                        <CardHeader className="p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 dark:border-amber-800">Final Verification Stage</Badge>
                                    <CardTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Review Pending Marks</CardTitle>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Validate and finalize department-approved marks for result generation.</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button 
                                        onClick={() => approveMarks(pendingMarks.map(m => m.id))}
                                        disabled={processing || pendingMarks.length === 0}
                                        className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-2xl font-black px-8 h-14 shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0"
                                    >
                                        <LuShieldCheck className="w-5 h-5 mr-3" /> Approve All Records
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1">
                            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <Input 
                                placeholder="Search by student, enrollment, or course code..." 
                                className="pl-12 h-14 rounded-2xl border-slate-200 dark:border-border-hover bg-white dark:bg-[#0a0a0c] shadow-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-20"><div className="w-12 h-12 border-4 border-slate-900 dark:border-white border-t-transparent animate-spin rounded-full"></div></div>
                    ) : (
                        <Card className="rounded-3xl border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-slate-50/50 dark:bg-white/[0.02] border-b dark:border-border-hover">
                                    <TableRow>
                                        <TableHead className="font-bold py-6 pl-8">Course & Student</TableHead>
                                        <TableHead className="font-bold py-6 text-center">Mid (20)</TableHead>
                                        <TableHead className="font-bold py-6 text-center">Int (30)</TableHead>
                                        <TableHead className="font-bold py-6 text-center">Total (50)</TableHead>
                                        <TableHead className="font-bold py-6 text-right pr-8">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredMarks.map((m) => (
                                        <TableRow key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors border-b dark:border-border-hover/50 last:border-0">
                                            <TableCell className="pl-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center font-bold text-slate-500">
                                                        {m.course.code.slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white leading-tight">{m.result.student.name}</p>
                                                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{m.course.name} • {m.result.student.enrollmentNo}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-slate-600 dark:text-slate-400">{m.midTermMarks}</TableCell>
                                            <TableCell className="text-center font-bold text-slate-600 dark:text-slate-400">{m.internalMarks}</TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center justify-center w-12 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-extrabold shadow-sm border border-indigo-100 dark:border-indigo-800">
                                                    {(m.midTermMarks || 0) + (m.internalMarks || 0)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <Button 
                                                    size="sm"
                                                    disabled={processing}
                                                    onClick={() => approveMarks([m.id])}
                                                    className="rounded-xl font-bold bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm transition-all"
                                                >
                                                    Finalize
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {filteredMarks.length === 0 && (
                                <div className="text-center py-20 flex flex-col items-center bg-slate-50/50 dark:bg-white/[0.01]">
                                    <LuCircleCheck className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-4" />
                                    <p className="text-slate-400 font-bold italic tracking-tight">No records found matching your criteria.</p>
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
