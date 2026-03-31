'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import {
    LuArrowRightLeft, LuArrowRight, LuCheck, LuHistory,
    LuSearch, LuTriangleAlert, LuUserCheck, LuUsers, LuClock, LuCalendar, LuUser
} from 'react-icons/lu';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DEPT_ADMIN_NAV } from '@/lib/constants/nav-config';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Student {
    id: string;
    name: string;
    rollNumber: string | null;
    email: string;
}

interface Division {
    id: string;
    name: string;
    batch: { name: string };
    students: { studentId: string; student: Student }[];
}

interface TransferLog {
    id: string;
    createdAt: string;
    reason: string;
    student: { name: string; rollNumber: string | null };
    fromDivision: { name: string; batch: { name: string } } | null;
    toDivision: { name: string; batch: { name: string } };
    actionBy: { name: string };
}

export default function DeptTransfersPage() {
    const { user } = useAuthStore();
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [transferLogs, setTransferLogs] = useState<TransferLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Selection State
    const [sourceDivId, setSourceDivId] = useState('');
    const [targetDivId, setTargetDivId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user?.entityId) return;
        setLoading(true);
        try {
            const [divRes, logRes] = await Promise.all([
                api.get('/v2/divisions'),
                api.get('/v2/student-transfers/logs')
            ]);
            setDivisions(divRes.data);
            setTransferLogs(logRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [user?.entityId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const sourceDiv = divisions.find(d => d.id === sourceDivId);
    const targetDiv = divisions.find(d => d.id === targetDivId);

    const handleTransfer = async () => {
        if (!selectedStudentId || !targetDivId || !reason) {
            return setError('Please select a student, target division, and provide a reason.');
        }
        setIsTransferring(true);
        setError('');
        setSuccess('');

        try {
            await api.post('/v2/student-transfers', {
                studentId: selectedStudentId,
                targetDivisionId: targetDivId,
                reason
            });
            setSuccess('Student transferred successfully!');
            setReason('');
            setSelectedStudentId('');
            fetchData();
        } catch (e: any) {
            setError(e.response?.data?.error || 'Transfer failed');
        } finally {
            setIsTransferring(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN']}>
            <DashboardLayout navItems={DEPT_ADMIN_NAV} title="Student Transfers">
                <div className="flex flex-col mb-8">
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Student Transfer Management</h2>
                    <p className="text-slate-500 dark:text-slate-400">Move students securely between divisions with internal audit logging.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ── Transfer Control ────────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                            <CardHeader className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <LuArrowRightLeft className="text-primary w-5 h-5" />
                                    New Transfer Request
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    {/* Source */}
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                            <label className="text-xs font-black uppercase text-slate-400 mb-3 block">1. Source Division</label>
                                            <select 
                                                className="w-full h-11 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm outline-primary"
                                                value={sourceDivId}
                                                onChange={(e) => {
                                                    setSourceDivId(e.target.value);
                                                    setSelectedStudentId('');
                                                }}
                                            >
                                                <option value="">Select source division...</option>
                                                {divisions.map(d => <option key={d.id} value={d.id}>Div {d.name} — {d.batch.name}</option>)}
                                            </select>

                                            {sourceDiv && (
                                                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                    {sourceDiv.students.length === 0 ? (
                                                        <div className="text-xs text-slate-400 py-4 text-center">No students in this division.</div>
                                                    ) : (
                                                        sourceDiv.students.map(({ student }) => (
                                                            <div 
                                                                key={student.id} 
                                                                className={cn(
                                                                    "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                                                                    selectedStudentId === student.id 
                                                                        ? "bg-primary/10 border-primary shadow-sm" 
                                                                        : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:border-primary/30"
                                                                )}
                                                                onClick={() => setSelectedStudentId(student.id)}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <LuUserCheck className={cn("w-4 h-4", selectedStudentId === student.id ? "text-primary" : "text-slate-300")} />
                                                                    <div>
                                                                        <div className="text-sm font-semibold">{student.name}</div>
                                                                        <div className="text-[10px] text-slate-400 font-bold uppercase">{student.rollNumber || 'NO ROLL'}</div>
                                                                    </div>
                                                                </div>
                                                                {selectedStudentId === student.id && <LuCheck className="w-4 h-4 text-primary" />}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center pt-10 hidden md:flex">
                                        <LuArrowRight className="w-10 h-10 text-slate-200 animate-pulse" />
                                    </div>

                                    {/* Target */}
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20">
                                            <label className="text-xs font-black uppercase text-indigo-400 mb-3 block">2. Target Division</label>
                                            <select 
                                                className="w-full h-11 rounded-lg border border-indigo-200 dark:border-indigo-500/30 bg-white dark:bg-slate-950 px-3 text-sm outline-primary"
                                                value={targetDivId}
                                                onChange={(e) => setTargetDivId(e.target.value)}
                                            >
                                                <option value="">Select target division...</option>
                                                {divisions.filter(d => d.id !== sourceDivId).map(d => <option key={d.id} value={d.id}>Div {d.name} — {d.batch.name}</option>)}
                                            </select>
                                            {targetDiv && (
                                                <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
                                                    <div className="text-xs font-bold text-indigo-500 uppercase flex items-center gap-2 mb-2">
                                                        <LuUsers className="w-3 h-3" /> Division Health
                                                    </div>
                                                    <div className="text-sm font-semibold">{targetDiv.students.length} students currently</div>
                                                    <div className="text-xs text-slate-400 mt-1">Batch: {targetDiv.batch.name}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Reason for Transfer (Audit Log Required)</label>
                                        <Input 
                                            placeholder="e.g. Elective alignment, request by student, overflow handling..."
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="h-12 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                        />
                                    </div>

                                    {(error || success) && (
                                        <div className={cn(
                                            "p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in zoom-in duration-300",
                                            error ? "bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-100 dark:border-red-500/20" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20"
                                        )}>
                                            {error ? <LuTriangleAlert className="w-5 h-5 shrink-0" /> : <LuCheck className="w-5 h-5 shrink-0" />}
                                            <span className="font-medium">{error || success}</span>
                                        </div>
                                    )}

                                    <Button 
                                        onClick={handleTransfer}
                                        disabled={isTransferring || !selectedStudentId || !targetDivId || !reason}
                                        className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 rounded-xl"
                                    >
                                        {isTransferring ? (
                                            <span className="flex items-center gap-2"><LuClock className="animate-spin" /> Finalizing Transfer...</span>
                                        ) : 'Complete Student Transfer'}
                                    </Button>
                                    <p className="text-center text-[10px] text-slate-400 uppercase font-black tracking-widest">Action will be recorded for security compliance</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Audit Logs ─────────────────────────────────────────── */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-black uppercase text-sm tracking-widest">
                            <LuHistory className="w-4 h-4 text-primary" /> Recent History
                        </div>
                        
                        <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                            {transferLogs.length === 0 ? (
                                <div className="text-center py-12 glass-card opacity-50 border-dashed">
                                    <LuClock className="w-10 h-10 mx-auto mb-2" />
                                    <div className="text-xs font-bold">No transfer history</div>
                                </div>
                            ) : (
                                transferLogs.map((log) => (
                                    <div key={log.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Badge variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-950 font-bold">AUDITED</Badge>
                                        </div>
                                        <div className="text-xs font-black text-primary mb-1">{log.student.name}</div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                            <span className="font-bold text-slate-700 dark:text-slate-300">
                                                {log.fromDivision ? `Div ${log.fromDivision.name}` : 'NEW INITIAL'}
                                            </span>
                                            <LuArrowRight className="w-3 h-3" />
                                            <span className="font-bold text-slate-700 dark:text-slate-300">Div {log.toDivision.name}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 italic mb-3 leading-tight">&quot;{log.reason}&quot;</div>
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                                <LuUser className="w-3 h-3 text-indigo-500/50" /> {log.actionBy?.name || 'System Admin'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                                <LuCalendar className="w-3 h-3" /> {format(new Date(log.createdAt), 'MMM dd, HH:mm')}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
