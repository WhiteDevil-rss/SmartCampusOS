'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { APPROVAL_ADMIN_NAV } from '@/lib/constants/nav-config';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LuShieldCheck, LuUsers, LuBookOpen, LuArrowRight, LuLayoutDashboard } from 'react-icons/lu';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function ApprovalDashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({ pendingRecords: 0, pendingSubjects: 0 });
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const { data } = await api.get('/v2/marks/approval/pending');
            const subjects = new Set(data.map((m: any) => m.course.id)).size;
            setStats({
                pendingRecords: data.length,
                pendingSubjects: subjects
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <ProtectedRoute allowedRoles={['APPROVAL_ADMIN']}>
            <DashboardLayout navItems={APPROVAL_ADMIN_NAV} title={`Welcome, ${user?.username || 'Approval Admin'}`}>
                {loading ? (
                    <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-slate-900 border-t-transparent animate-spin rounded-full"></div></div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Hero Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="rounded-3xl border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] p-10 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-2xl overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-500" />
                                <div className="relative z-10 space-y-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                        <LuShieldCheck className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black mb-2 tracking-tight">{stats.pendingRecords}</h2>
                                        <p className="text-indigo-100 font-bold tracking-widest uppercase text-xs opacity-80">Pending Final Approvals</p>
                                    </div>
                                    <Link href="/approval/marks">
                                        <button className="px-6 py-3 bg-white text-indigo-700 rounded-xl font-black text-sm shadow-lg hover:shadow-white/20 transition-all hover:-translate-y-1 active:translate-y-0">
                                            Start Verification
                                        </button>
                                    </Link>
                                </div>
                            </Card>

                            <Card className="rounded-3xl border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] p-10 bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-border shadow-xl relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 dark:bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
                                <div className="relative z-10 space-y-6">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-border">
                                        <LuBookOpen className="w-8 h-8 text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black mb-2 tracking-tight text-slate-900 dark:text-white">{stats.pendingSubjects}</h2>
                                        <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Subjects Awaiting Review</p>
                                    </div>
                                    <Link href="/approval/marks">
                                        <button className="px-6 py-3 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-xl font-black text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                                            View Subjects
                                        </button>
                                    </Link>
                                </div>
                            </Card>
                        </div>

                        {/* Recent Activity or Quick Links */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                           <Card className="lg:col-span-2 rounded-3xl border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] shadow-sm overflow-hidden">
                                <CardHeader className="p-8 border-b dark:border-border-hover/50 bg-slate-50/50 dark:bg-white/5">
                                    <CardTitle className="text-xl font-black flex items-center gap-3">
                                        <LuLayoutDashboard className="w-6 h-6 text-indigo-600" />
                                        System Workflow Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex items-start gap-6">
                                        <div className="w-1.5 h-16 bg-emerald-500 rounded-full mt-1 shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-900 dark:text-white">Department Processing</p>
                                            <p className="text-sm text-slate-500 font-medium leading-relaxed">Most departments have submitted their internal marks. High compliance rate observed for current semester.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-6">
                                        <div className="w-1.5 h-16 bg-amber-500 rounded-full mt-1 shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-900 dark:text-white">Final Review Phase</p>
                                            <p className="text-sm text-slate-500 font-medium leading-relaxed">Your department is responsible for ensuring the integrity of marks before they are released to the University for result processing.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] p-8 shadow-sm">
                                <CardTitle className="text-lg font-black mb-6">Quick Actions</CardTitle>
                                <div className="space-y-3">
                                    <Link href="/approval/marks" className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-border-hover hover:border-indigo-500/50 transition-all group group bg-slate-50/50 dark:bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <LuShieldCheck className="w-5 h-5 text-indigo-500" />
                                            <span className="text-sm font-bold">Approve Marks</span>
                                        </div>
                                        <LuArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link href="/profile" className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-border-hover hover:border-indigo-500/50 transition-all group group bg-slate-50/50 dark:bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <LuUsers className="w-5 h-5 text-purple-500" />
                                            <span className="text-sm font-bold">My Profile</span>
                                        </div>
                                        <LuArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
