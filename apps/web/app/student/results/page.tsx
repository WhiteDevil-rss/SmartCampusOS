'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { STUDENT_NAV } from '@/lib/constants/nav-config';
import { LuLayoutDashboard, LuCalendar, LuCheck, LuCreditCard, LuLibrary, LuBriefcase, LuUser, LuCircleHelp, LuCircleCheck, LuTrendingUp, LuBookOpen, LuRotateCcw, LuMessageSquare, LuShieldCheck, LuCopy, LuFileText } from 'react-icons/lu';
import { Badge } from '@/components/ui/badge';
import { useToast, Toast } from '@/components/ui/toast-alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

export default function StudentResultsPage() {
    const { user } = useAuthStore();
    const { toast: toastState, showToast, hideToast } = useToast();
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchResults = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/v2/student/results');
            setResults(data);
        } catch (e: any) {
            if (e.message === 'Network Error') {
                console.warn('Results: Backend unreachable');
            } else {
                console.error('Failed to load results:', e);
            }
            showToast('error', 'Failed to load your results');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    const handleComplaint = async (subjectResultId: string) => {
        const reason = prompt('Please enter the reason for your complaint:');
        if (!reason) return;
        setSubmitting(true);
        try {
            await api.post('/v2/marks/student/complaint', { subjectResultId, reason });
            showToast('success', 'Complaint raised successfully');
        } catch (e) {
            showToast('error', 'Failed to raise complaint');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReassessment = async (subjectResultId: string) => {
        if (!confirm('Apply for reassessment? Standard fees may apply.')) return;
        setSubmitting(true);
        try {
            await api.post('/v2/marks/student/reassessment', { subjectResultId });
            showToast('success', 'Reassessment request submitted');
        } catch (e) {
            showToast('error', 'Failed to submit reassessment request');
        } finally {
            setSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('success', 'Verification hash copied to clipboard');
    };

    return (
        <ProtectedRoute allowedRoles={['STUDENT']}>
            <DashboardLayout navItems={STUDENT_NAV} title="Academic Performance">
                <Toast toast={toastState} onClose={hideToast} />
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* CGPA Header */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2 rounded-[2rem] border-0 bg-indigo-600 p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-700 opacity-90" />
                            <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-700" />
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 h-full">
                                <div className="space-y-2">
                                    <p className="text-indigo-100 font-black tracking-[0.2em] uppercase text-xs">Total Academic Progress</p>
                                    <h2 className="text-4xl font-black tracking-tighter">Cumulative Performance Index</h2>
                                    <p className="text-indigo-100/80 font-medium max-w-sm">Your overall academic standing across all completed semesters.</p>
                                </div>
                                <div className="text-center md:text-right bg-white/10 backdrop-blur-xl p-8 rounded-[1.5rem] border border-white/20 min-w-40 shadow-inner">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-1">Current CGPA</p>
                                    <div className="text-6xl font-black tabular-nums tracking-tighter">
                                        {results.length > 0 ? (results.reduce((acc, r) => acc + (r.sgpa || 0), 0) / results.length).toFixed(2) : '0.00'}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-[2rem] border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] p-8 bg-white shadow-xl flex flex-col justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
                                <LuShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Verified Results</h3>
                                <p className="text-slate-500 font-medium text-sm">All published results are cryptographically signed and verifiable via the secure portal.</p>
                            </div>
                            <Link href="/verify" target="_blank">
                                <Button className="mt-6 w-full rounded-2xl h-12 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">Verify Records Portal</Button>
                            </Link>
                        </Card>
                    </div>

                    {/* Semester-wise results */}
                    <div className="space-y-12">
                        {results.map((res: any) => (
                            <div key={res.id} className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Semester {res.semester}</h3>
                                        <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold border-indigo-100 dark:border-indigo-800">SGPA: {res.sgpa?.toFixed(2) || '0.00'}</Badge>
                                    </div>
                                    {res.resultHash && (
                                        <div className="flex items-center gap-2 p-2 px-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-border-hover max-w-md">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Verification Hash</p>
                                                <p className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 truncate">{res.resultHash}</p>
                                            </div>
                                            <button 
                                                onClick={() => copyToClipboard(res.resultHash)}
                                                className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-indigo-600"
                                                title="Copy Hash"
                                            >
                                                <LuCopy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <Card className="rounded-[2rem] border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] overflow-hidden shadow-sm">
                                    <Table>
                                        <TableHeader className="bg-slate-50/50 dark:bg-white/[0.01] border-b dark:border-border-hover">
                                            <TableRow>
                                                <TableHead className="font-bold py-6 pl-10 text-xs uppercase tracking-widest text-slate-500">Subject</TableHead>
                                                <TableHead className="font-bold py-6 text-center text-xs uppercase tracking-widest text-slate-500">Internal</TableHead>
                                                <TableHead className="font-bold py-6 text-center text-xs uppercase tracking-widest text-slate-500">External</TableHead>
                                                <TableHead className="font-bold py-6 text-center text-xs uppercase tracking-widest text-slate-500">Grade</TableHead>
                                                <TableHead className="font-bold py-6 text-right pr-10 text-xs uppercase tracking-widest text-slate-500">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {res.subjectResults.map((sub: any) => (
                                                <TableRow key={sub.id} className="border-b dark:border-border-hover/50 hover:bg-slate-50/30 transition-colors last:border-0">
                                                    <TableCell className="pl-10 py-6">
                                                        <div className="font-black text-slate-900 dark:text-white text-base">{sub.course.name}</div>
                                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{sub.course.code} • {sub.course.credits} Credits</div>
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-slate-600 dark:text-slate-400">
                                                        {(sub.internalMarks || 0) + (sub.midTermMarks || 0)}
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-slate-600 dark:text-slate-400">{sub.externalMarks || 0}</TableCell>
                                                    <TableCell className="text-center">
                                                        <div className={
                                                            `inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg shadow-sm border ${
                                                                ['O', 'A+','A','B+'].includes(sub.grade) ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                                                                ['B','C','P'].includes(sub.grade) ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                                                                'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
                                                            }`
                                                        }>
                                                            {sub.grade || 'F'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-10">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button 
                                                                size="sm" 
                                                                variant="ghost" 
                                                                className="rounded-xl h-9 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group"
                                                                title="Raise Query"
                                                                onClick={() => handleComplaint(sub.id)}
                                                                disabled={submitting}
                                                            >
                                                                <LuMessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="ghost" 
                                                                className="rounded-xl h-9 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 group"
                                                                title="Apply for Reassessment"
                                                                onClick={() => handleReassessment(sub.id)}
                                                                disabled={submitting}
                                                            >
                                                                <LuRotateCcw className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>
                        ))}

                        {results.length === 0 && !loading && (
                            <Card className="rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] h-96 flex flex-col items-center justify-center text-center p-12 bg-slate-50/20">
                                <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6">
                                    <LuFileText className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">No Published Results Yet</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm">Your results for the current academic session are still under processing. Check back later after official university notification.</p>
                            </Card>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
