'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { V2DashboardLayout } from '@/components/v2/layout/dashboard-layout';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  AlertCircle, 
  ArrowRight, 
  BadgeCheck, 
  Clock, 
  FileText,
  Activity,
  Zap,
  ShieldAlert,
  Layers,
  ArrowRightLeft,
  ChevronRight,
  TrendingUp,
  History
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { 
  StatCard, 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardDescription, 
  GlassCardContent 
} from '@/components/v2/shared/cards';
import { IndustrialButton } from '@/components/v2/shared/inputs';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { GreetingCard } from '@/components/v2/shared/greeting-card';
import { cn } from '@/lib/utils';
import { CampusPulse } from '@/components/v2/dashboard/campus-pulse';

interface Timetable {
    id: string;
    slots: Record<string, unknown>[];
}

export default function DeptAdminDashboard() {
    const { user } = useAuthStore();
    const router = useRouter();
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
            <V2DashboardLayout title={`Department Administration: ${user?.username || 'Administrator'}`}>
                <div className="space-y-10 pb-24">
                    {/* Department Greeting */}
                    <GreetingCard 
                        name={user?.username || 'Administrator'}
                        role="Department Admin"
                        stats={[
                            { label: "Active Faculty", value: stats.faculty, icon: Users },
                            { label: "Pending Actions", value: pendingActions.requests + pendingActions.complaints + pendingActions.leaves, icon: Activity }
                        ]}
                        quickAction={{
                            label: "Update Timetable",
                            onClick: () => router.push('/department/timetables')
                        }}
                    />

                    {/* Humanized Department Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            title="Faculty Strength" 
                            value={stats.faculty} 
                            change={2} 
                            icon={Users} 
                            changeDescription="active educators"
                        />
                        <StatCard 
                            title="Course Catalog" 
                            value={stats.courses} 
                            change={5} 
                            icon={BookOpen} 
                            changeDescription="registry verified"
                        />
                        <StatCard 
                            title="Academic Segments" 
                            value={stats.batches} 
                            change={0} 
                            icon={Layers} 
                            changeDescription="stable cohorts"
                        />
                        <StatCard 
                            title="Student Population" 
                            value={stats.students} 
                            change={14} 
                            icon={Users} 
                            changeDescription="verified accounts"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Pending Actions Feed */}
                        <GlassCard className="lg:col-span-2 rounded-[3rem] border-primary/10">
                            <GlassCardHeader className="p-8 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black font-space-grotesk text-slate-100 flex items-center gap-3">
                                            <ShieldAlert className="text-primary w-6 h-6" />
                                            Pending Actions
                                        </h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Items requiring administrative verification</p>
                                    </div>
                                </div>
                            </GlassCardHeader>
                            <GlassCardContent className="p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Support Tickets', value: pendingActions.requests, icon: FileText, color: 'text-blue-500', href: '/department/helpdesk' },
                                        { label: 'Student Concerns', value: pendingActions.complaints, icon: AlertCircle, color: 'text-primary', href: '/department/helpdesk' },
                                        { label: 'Presence Alerts', value: pendingActions.leaves, icon: Clock, color: 'text-emerald-500', href: '/department/leave' },
                                    ].map((action) => (
                                        <div 
                                            key={action.label}
                                            onClick={() => router.push(action.href)}
                                            className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 cursor-pointer group shadow-lg shadow-black/20"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`p-3 bg-white/5 rounded-2xl ${action.color} group-hover:bg-primary/10 transition-all`}>
                                                    <action.icon className="w-5 h-5" />
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-slate-700 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                            </div>
                                            <div>
                                                <div className="text-3xl font-black text-slate-100 tracking-tighter font-space-grotesk">{action.value}</div>
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{action.label}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCardContent>
                        </GlassCard>

                        {/* Department Services */}
                        <GlassCard className="rounded-[3rem] border-primary/10">
                            <GlassCardHeader className="p-8 pb-4">
                                <h3 className="text-2xl font-black font-space-grotesk text-slate-100">Department Services</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Frequent administrative modules</p>
                            </GlassCardHeader>
                            <GlassCardContent className="p-8 space-y-4">
                                {[
                                    { label: 'Modify Timetable', icon: Calendar, color: 'text-indigo-500', href: '/department/timetables' },
                                    { label: 'Verify Finance', icon: BadgeCheck, color: 'text-emerald-500', href: '/department/finance' },
                                    { label: 'Student Logistics', icon: ArrowRightLeft, color: 'text-primary', href: '/department/student-transfers' },
                                    { label: 'Active Classes', icon: BookOpen, color: 'text-blue-500', href: '/department/classes' },
                                    { label: 'Risk Analytics', icon: ShieldAlert, color: 'text-rose-500', href: '/department/students/risk' },
                                ].map((op) => (
                                    <button 
                                        key={op.label}
                                        onClick={() => router.push(op.href)}
                                        className="w-full flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-primary/[0.03] hover:border-primary/20 transition-all duration-300 group shadow-md"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn("p-2 rounded-xl bg-white/5", op.color)}>
                                                <op.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-100 transition-colors">{op.label}</span>
                                        </div>
                                        <ChevronRight className="w-3 h-3 text-slate-700 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                                    </button>
                                ))}
                            </GlassCardContent>
                        </GlassCard>
                    </div>

                    {/* Institutional Pulse - Real-time Risk Telemetry */}
                    <CampusPulse departmentId={user?.entityId ?? undefined} className="mt-10" />
                </div>
            </V2DashboardLayout>
        </ProtectedRoute>
    );
}
