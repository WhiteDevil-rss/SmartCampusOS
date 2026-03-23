'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DEPT_ADMIN_NAV } from '@/lib/constants/nav-config';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LuCircleCheck, LuEye, LuSend, LuCircleAlert, LuSearch, LuShieldCheck } from 'react-icons/lu';
import { Badge } from '@/components/ui/badge';
import { useToast, Toast } from '@/components/ui/toast-alert';
import { Input } from '@/components/ui/input';

export default function DeptMarksPage() {
    const { user } = useAuthStore();
    const { toast: toastState, showToast, hideToast } = useToast();
    const [pendingMarks, setPendingMarks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPending = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/v2/marks/dept/pending');
            setPendingMarks(data);
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to load pending marks');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    const approveMarks = async (subjectResultIds: string[]) => {
        if (!confirm(`Are you sure you want to approve ${subjectResultIds.length} mark records?`)) return;
        setProcessing(true);
        try {
            await api.post('/v2/marks/dept/approve', { subjectResultIds });
            showToast('success', 'Marks approved and forwarded to Approval Department');
            fetchPending();
        } catch (e) {
            showToast('error', 'Failed to approve marks');
        } finally {
            setProcessing(false);
        }
    };

    const filteredMarks = pendingMarks.filter(m => 
        m.result.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.result.student.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Grouping by course for better UI
    const groupedMarks = filteredMarks.reduce((acc: any, curr: any) => {
        if (!acc[curr.course.id]) {
            acc[curr.course.id] = {
                course: curr.course,
                marks: []
            };
        }
        acc[curr.course.id].marks.push(curr);
        return acc;
    }, {});

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN']}>
            <DashboardLayout navItems={DEPT_ADMIN_NAV} title="Department Marks Review">
                <Toast toast={toastState} onClose={hideToast} />
                <div className="space-y-6">
                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0c] p-6 rounded-3xl border border-slate-200 dark:border-border-hover shadow-sm">
                        <div className="relative flex-1 max-w-md">
                            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <Input 
                                placeholder="Search by student, enrollment, or subject..." 
                                className="pl-12 h-12 rounded-2xl border-slate-200 focus:ring-indigo-500 bg-slate-50/50 dark:bg-white/5"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="px-4 py-2 rounded-xl border-indigo-100 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold">
                                {pendingMarks.length} Pending Records
                            </Badge>
                            <Button 
                                onClick={() => approveMarks(pendingMarks.map(m => m.id))}
                                disabled={processing || pendingMarks.length === 0}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold px-6 h-12 shadow-lg shadow-indigo-100 dark:shadow-none"
                            >
                                <LuCircleCheck className="w-5 h-5 mr-2" /> Approve All
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full"></div></div>
                    ) : Object.keys(groupedMarks).length > 0 ? (
                        <div className="space-y-8">
                            {Object.values(groupedMarks).map((group: any) => (
                                <Card key={group.course.id} className="rounded-3xl border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] overflow-hidden shadow-sm">
                                    <CardHeader className="bg-slate-50/50 dark:bg-white/[0.02] border-b dark:border-border-hover py-4 px-8 flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-bold">{group.course.name}</CardTitle>
                                            <p className="text-xs text-slate-500 font-medium">{group.course.code} • {group.marks.length} Students</p>
                                        </div>
                                        <Button 
                                            size="sm"
                                            onClick={() => approveMarks(group.marks.map((m: any) => m.id))}
                                            disabled={processing}
                                            className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-xl font-bold shadow-sm"
                                        >
                                            Approve Class
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader className="bg-slate-50/30 dark:bg-white/[0.01]">
                                                <TableRow>
                                                    <TableHead className="font-bold py-4 pl-8 text-xs uppercase tracking-wider text-slate-500">Student</TableHead>
                                                    <TableHead className="font-bold py-4 text-xs uppercase tracking-wider text-slate-500 text-center">Mid-Term</TableHead>
                                                    <TableHead className="font-bold py-4 text-xs uppercase tracking-wider text-slate-500 text-center">Internal</TableHead>
                                                    <TableHead className="font-bold py-4 text-xs uppercase tracking-wider text-slate-500 text-center">Total</TableHead>
                                                    <TableHead className="font-bold py-4 text-xs uppercase tracking-wider text-slate-500 text-right pr-8">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {group.marks.map((m: any) => (
                                                    <TableRow key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                                        <TableCell className="pl-8">
                                                            <div>
                                                                <p className="font-bold text-sm text-slate-900 dark:text-white">{m.result.student.name}</p>
                                                                <p className="text-[11px] font-medium text-slate-400">{m.result.student.enrollmentNo}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center font-bold text-slate-600 dark:text-slate-400">{m.midTermMarks || 0}</TableCell>
                                                        <TableCell className="text-center font-bold text-slate-600 dark:text-slate-400">{m.internalMarks || 0}</TableCell>
                                                        <TableCell className="text-center">
                                                            <span className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-black text-sm">
                                                                {(m.midTermMarks || 0) + (m.internalMarks || 0)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right pr-8">
                                                            <Button 
                                                                size="sm" 
                                                                variant="ghost" 
                                                                className="rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-indigo-600 dark:text-indigo-400"
                                                                onClick={() => approveMarks([m.id])}
                                                            >
                                                                Approve
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="rounded-3xl border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] h-96 flex flex-col items-center justify-center text-center p-8 bg-slate-50/20 border-dashed">
                            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-6">
                                <LuShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <CardTitle className="text-2xl font-black mb-2 tracking-tight text-slate-900 dark:text-white">All Clear!</CardTitle>
                            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm">There are no marks pending review for your department at this time.</p>
                        </Card>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
