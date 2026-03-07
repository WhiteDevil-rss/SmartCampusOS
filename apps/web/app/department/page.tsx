'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuUsers, LuBookOpen, LuCalendar, LuCircleAlert, LuArrowRight, LuBadgeCheck, LuClock, LuFileText } from 'react-icons/lu';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/store/useAuthStore';

import { DEPT_ADMIN_NAV } from '@/lib/constants/nav-config';

interface Timetable {
    id: string;
    slots: Record<string, unknown>[];
}

export default function DeptAdminDashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({ faculty: 0, courses: 0, batches: 0, students: 0 });
    const [pendingActions, setPendingActions] = useState({ requests: 0, complaints: 0, leaves: 0 });
    const [loading, setLoading] = useState(true);
    const [latestTimetable, setLatestTimetable] = useState<Timetable | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [facRes, crsRes, bchRes, stuRes, ttRes, pendingRes] = await Promise.all([
                api.get(`/faculty`),
                api.get(`/courses`),
                api.get(`/batches`),
                api.get(`/v2/student?departmentId=${user!.entityId}`),
                api.get(`/departments/${user!.entityId}/timetables/latest`).catch(() => ({ data: null })),
                api.get(`/v2/service-requests/admin?universityId=${user?.universityId}&departmentId=${user?.entityId}`).catch(() => ({ data: { length: 0 } })),
            ]);

            // For simplicity, we'll fetch complaints and flags too
            const [compRes, flagRes] = await Promise.all([
                api.get(`/v2/complaints/admin?universityId=${user?.universityId}`).catch(() => ({ data: [] })),
                api.get(`/v2/student/attendance/flags/admin?universityId=${user?.universityId}&departmentId=${user?.entityId}`).catch(() => ({ data: [] }))
            ]);

            setStats({
                faculty: facRes.data.length,
                courses: crsRes.data.length,
                batches: bchRes.data.length,
                students: stuRes.data.length,
            });

            setPendingActions({
                requests: Array.isArray(pendingRes.data) ? pendingRes.data.filter((r: any) => r.status === 'PENDING').length : 0,
                complaints: Array.isArray(compRes.data) ? compRes.data.filter((c: any) => c.status === 'OPEN').length : 0,
                leaves: Array.isArray(flagRes.data) ? flagRes.data.filter((f: any) => f.status === 'PENDING').length : 0
            });
            if (ttRes.data) {
                setLatestTimetable(ttRes.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user?.entityId) {
            fetchData();
        }
    }, [user?.entityId, fetchData]);

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN']}>
            <DashboardLayout navItems={DEPT_ADMIN_NAV} title={`Welcome, ${user?.username || 'User'}`}>
                {loading ? (
                    <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent animate-spin rounded-full"></div></div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="glass-card hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.2)] dark:hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.3)] transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden border-slate-200 dark:border-border-hover">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 dark:from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                                    <CardTitle className="text-sm font-semibold text-slate-600 dark:text-text-muted">Department Faculty</CardTitle>
                                    <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/20 dark:group-hover:bg-indigo-500/30 transition-colors">
                                        <LuUsers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <div className="text-3xl font-extrabold text-slate-900 dark:text-text-primary tracking-tight">{stats.faculty}</div>
                                </CardContent>
                            </Card>

                            <Card className="glass-card hover:shadow-[0_8px_32px_0_rgba(168,85,247,0.2)] dark:hover:shadow-[0_8px_32px_0_rgba(168,85,247,0.3)] transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden border-slate-200 dark:border-border-hover">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 dark:from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                                    <CardTitle className="text-sm font-semibold text-slate-600 dark:text-text-muted">Department Subjects</CardTitle>
                                    <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl group-hover:bg-purple-500/20 dark:group-hover:bg-purple-500/30 transition-colors">
                                        <LuBookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <div className="text-3xl font-extrabold text-slate-900 dark:text-text-primary tracking-tight">{stats.courses}</div>
                                </CardContent>
                            </Card>

                            <Card className="glass-card hover:shadow-[0_8px_32px_0_rgba(16,185,129,0.2)] dark:hover:shadow-[0_8px_32px_0_rgba(16,185,129,0.3)] transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden border-slate-200 dark:border-border-hover">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 dark:from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                                    <CardTitle className="text-sm font-semibold text-slate-600 dark:text-text-muted">Active Batches</CardTitle>
                                    <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-500/30 transition-colors">
                                        <LuUsers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <div className="text-3xl font-extrabold text-slate-900 dark:text-text-primary tracking-tight">{stats.batches}</div>
                                </CardContent>
                            </Card>

                            <Card className="glass-card hover:shadow-[0_8px_32px_0_rgba(249,115,22,0.2)] dark:hover:shadow-[0_8px_32px_0_rgba(249,115,22,0.3)] transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden border-slate-200 dark:border-border-hover transition-all cursor-pointer"
                                onClick={() => window.location.href = '/department/students'}>
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 dark:from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                                    <CardTitle className="text-sm font-semibold text-slate-600 dark:text-text-muted">Total Students</CardTitle>
                                    <div className="p-2 bg-orange-500/10 dark:bg-orange-500/20 rounded-xl group-hover:bg-orange-500/20 dark:group-hover:bg-orange-500/30 transition-colors">
                                        <LuUsers className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <div className="text-3xl font-extrabold text-slate-900 dark:text-text-primary tracking-tight">{stats.students}</div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                            <Card className="lg:col-span-2 glass-card border-slate-200 dark:border-border-hover">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                                            <LuCircleAlert className="text-amber-500" />
                                            Pending Administrative Actions
                                        </CardTitle>
                                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                                            {pendingActions.requests + pendingActions.complaints + pendingActions.leaves} Priority Items
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border dark:border-border flex flex-col justify-between h-32 hover:border-indigo-500/50 transition-colors cursor-pointer"
                                            onClick={() => window.location.href = '/department/helpdesk'}>
                                            <div className="flex justify-between items-start">
                                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600"><LuFileText className="w-4 h-4" /></div>
                                                <LuArrowRight className="w-4 h-4 text-text-muted" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold">{pendingActions.requests}</div>
                                                <div className="text-xs text-text-secondary font-medium">Service Requests</div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border dark:border-border flex flex-col justify-between h-32 hover:border-rose-500/50 transition-colors cursor-pointer"
                                            onClick={() => window.location.href = '/department/helpdesk'}>
                                            <div className="flex justify-between items-start">
                                                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-600"><LuCircleAlert className="w-4 h-4" /></div>
                                                <LuArrowRight className="w-4 h-4 text-text-muted" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold">{pendingActions.complaints}</div>
                                                <div className="text-xs text-text-secondary font-medium">Student Grievances</div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border dark:border-border flex flex-col justify-between h-32 hover:border-emerald-500/50 transition-colors cursor-pointer"
                                            onClick={() => window.location.href = '/department/leave'}>
                                            <div className="flex justify-between items-start">
                                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600"><LuClock className="w-4 h-4" /></div>
                                                <LuArrowRight className="w-4 h-4 text-text-muted" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold">{pendingActions.leaves}</div>
                                                <div className="text-xs text-text-secondary font-medium">Attendance Flags</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="glass-card border-slate-200 dark:border-border-hover">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold">Quick Operations</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl group" onClick={() => window.location.href = '/department/timetables'}>
                                        <LuCalendar className="mr-3 h-5 w-5 text-indigo-500" />
                                        <span>Update Timetable</span>
                                        <LuArrowRight className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl group" onClick={() => window.location.href = '/department/finance'}>
                                        <LuBadgeCheck className="mr-3 h-5 w-5 text-emerald-500" />
                                        <span>Verify Collections</span>
                                        <LuArrowRight className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start h-12 rounded-xl group" onClick={() => window.location.href = '/department/students/risk'}>
                                        <LuCircleAlert className="mr-3 h-5 w-5 text-rose-500" />
                                        <span>Risk Analytics</span>
                                        <LuArrowRight className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>


                        <div className="mt-8">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-text-primary mb-4">Latest Schedule Overview</h2>
                            {!latestTimetable && (
                                <Card className="glass-card border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center p-8 text-text-secondary dark:text-text-muted">
                                        <LuCalendar className="w-12 h-12 text-text-muted dark:text-slate-600 mb-3" />
                                        <p>No active timetable generated yet.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
