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
  RefreshCcw,
  Siren,
  UserCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { 
  StatCard, 
  GlassCard, 
  GlassCardHeader, 
  GlassCardContent 
} from '@/components/v2/shared/cards';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { GreetingCard } from '@/components/v2/shared/greeting-card';
import { cn } from '@/lib/utils';
import { CampusPulse } from '@/components/v2/dashboard/campus-pulse';

interface Timetable {
    id: string;
    slots: Record<string, unknown>[];
}

interface DepartmentDashboardData {
    stats: {
        faculty: number;
        courses: number;
        batches: number;
        students: number;
        applications: number;
        approved: number;
        pending: number;
        reviewed: number;
    };
    pendingActions: {
        requests: number;
        complaints: number;
        leaves: number;
    };
    recentApplications: Array<{
        id: string;
        applicantName: string;
        email: string;
        status: string;
        appliedAt: string;
        program?: { name?: string | null } | null;
    }>;
    latestTimetable: Timetable | null;
    updatedAt: string;
}

const statusTone: Record<string, string> = {
    PENDING: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    UNDER_REVIEW: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    REVIEWED: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    APPROVED: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    ACCEPTED: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    REJECTED: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    WAITLISTED: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20',
    ENROLLED: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
};

const formatStatus = (value?: string | null) => (value || 'UNKNOWN').replace(/_/g, ' ');

export default function DeptAdminDashboard() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [dashboard, setDashboard] = useState<DepartmentDashboardData>({
        stats: { faculty: 0, courses: 0, batches: 0, students: 0, applications: 0, approved: 0, pending: 0, reviewed: 0 },
        pendingActions: { requests: 0, complaints: 0, leaves: 0 },
        recentApplications: [],
        latestTimetable: null,
        updatedAt: '',
    });
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!user?.entityId) return;

        try {
            setLoading(true);
            const [facRes, crsRes, bchRes, stuRes, ttRes, pendingRes, admissionsRes] = await Promise.all([
                api.get(`/faculty`, { params: { departmentId: user.entityId } }).catch(() => ({ data: [] })),
                api.get(`/courses`, { params: { departmentId: user.entityId } }).catch(() => ({ data: [] })),
                api.get(`/batches`, { params: { departmentId: user.entityId } }).catch(() => ({ data: [] })),
                api.get(`/v2/student`, { params: { departmentId: user.entityId } }).catch(() => ({ data: [] })),
                api.get(`/departments/${user.entityId}/timetables/latest`).catch(() => ({ data: null })),
                api.get(`/v2/service-requests/admin?universityId=${user.universityId}&departmentId=${user.entityId}`).catch(() => ({ data: [] })),
                api.get(`/v2/admissions/department/${user.entityId}`, { params: { limit: 6 } }).catch(() => ({
                    data: { applications: [], total: 0, pagination: { page: 1, limit: 6, totalPages: 0 } },
                })),
            ]);

            const [compRes, flagRes] = await Promise.all([
                api.get(`/v2/complaints/admin?universityId=${user.universityId}`).catch(() => ({ data: [] })),
                api.get(`/v2/student/attendance/flags/admin?universityId=${user.universityId}&departmentId=${user.entityId}`).catch(() => ({ data: [] }))
            ]);

            const applications = Array.isArray(admissionsRes.data?.applications) ? admissionsRes.data.applications : [];
            const totalApplications = typeof admissionsRes.data?.total === 'number' ? admissionsRes.data.total : applications.length;
            const approved = applications.filter((application: any) => ['APPROVED', 'ACCEPTED', 'ENROLLED'].includes(application.status)).length;
            const pending = applications.filter((application: any) => application.status === 'PENDING').length;
            const reviewed = applications.filter((application: any) => ['UNDER_REVIEW', 'REVIEWED', 'WAITLISTED'].includes(application.status)).length;

            setDashboard({
                stats: {
                    faculty: Array.isArray(facRes.data) ? facRes.data.length : 0,
                    courses: Array.isArray(crsRes.data) ? crsRes.data.length : 0,
                    batches: Array.isArray(bchRes.data) ? bchRes.data.length : 0,
                    students: Array.isArray(stuRes.data) ? stuRes.data.length : 0,
                    applications: totalApplications,
                    approved,
                    pending,
                    reviewed,
                },
                pendingActions: {
                    requests: Array.isArray(pendingRes.data) ? pendingRes.data.filter((r: any) => r.status === 'PENDING').length : 0,
                    complaints: Array.isArray(compRes.data) ? compRes.data.filter((c: any) => c.status === 'OPEN').length : 0,
                    leaves: Array.isArray(flagRes.data) ? flagRes.data.filter((f: any) => f.status === 'PENDING').length : 0,
                },
                recentApplications: applications,
                latestTimetable: ttRes.data ?? null,
                updatedAt: new Date().toISOString(),
            });
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

    useEffect(() => {
        if (!user?.entityId) return;
        const intervalId = window.setInterval(fetchData, 30_000);
        return () => window.clearInterval(intervalId);
    }, [user?.entityId, fetchData]);

    const totalPendingActions = dashboard.pendingActions.requests + dashboard.pendingActions.complaints + dashboard.pendingActions.leaves;
    const lastUpdatedLabel = dashboard.updatedAt
        ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dashboard.updatedAt))
        : 'Syncing...';

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN']}>
            <V2DashboardLayout title={`Department Administration: ${user?.username || 'Administrator'}`}>
                <div className="space-y-10 pb-24">
                    {/* Department Greeting */}
                    <GreetingCard 
                        name={user?.username || 'Administrator'}
                        role="Department Admin"
                        stats={[
                            { label: "Active Faculty", value: dashboard.stats.faculty, icon: Users },
                            { label: "Pending Actions", value: totalPendingActions, icon: Activity }
                        ]}
                        quickAction={{
                            label: "Refresh Live Feed",
                            onClick: fetchData
                        }}
                    />

                    <div className="flex flex-col gap-3 rounded-[2rem] border border-white/5 bg-white/[0.02] px-6 py-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Department live operations</p>
                            <h2 className="mt-2 text-2xl font-black font-space-grotesk text-slate-100">Real-time admission and delivery snapshot</h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                                Last updated {lastUpdatedLabel}
                            </div>
                            <button
                                onClick={fetchData}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                            >
                                <RefreshCcw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                                Refresh dashboard
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            title="Faculty Strength" 
                            value={dashboard.stats.faculty} 
                            icon={Users} 
                            changeDescription="department educators"
                        />
                        <StatCard 
                            title="Course Catalog" 
                            value={dashboard.stats.courses} 
                            icon={BookOpen} 
                            changeDescription="courses and subjects"
                        />
                        <StatCard 
                            title="Academic Segments" 
                            value={dashboard.stats.batches} 
                            icon={Layers} 
                            changeDescription="stable cohorts"
                        />
                        <StatCard 
                            title="Student Population"
                            value={dashboard.stats.students} 
                            icon={Users} 
                            changeDescription="verified accounts"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <StatCard title="Applications" value={dashboard.stats.applications} icon={FileText} changeDescription="department pipeline" />
                        <StatCard title="Pending Review" value={dashboard.stats.pending} icon={Clock} changeDescription="needs first action" />
                        <StatCard title="Under Review" value={dashboard.stats.reviewed} icon={Siren} changeDescription="mid-process" />
                        <StatCard title="Approved / Enrolled" value={dashboard.stats.approved} icon={UserCheck} changeDescription="cleared candidates" />
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
                                        { label: 'Support Tickets', value: dashboard.pendingActions.requests, icon: FileText, color: 'text-blue-500', href: '/department/helpdesk' },
                                        { label: 'Student Concerns', value: dashboard.pendingActions.complaints, icon: AlertCircle, color: 'text-primary', href: '/department/helpdesk' },
                                        { label: 'Presence Alerts', value: dashboard.pendingActions.leaves, icon: Clock, color: 'text-emerald-500', href: '/department/leave' },
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

                    <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-10">
                        <GlassCard className="rounded-[3rem] border-primary/10">
                            <GlassCardHeader className="p-8 pb-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-2xl font-black font-space-grotesk text-slate-100">Recent Applications</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Latest department admissions in motion</p>
                                    </div>
                                    <button
                                        onClick={() => router.push('/department/admissions')}
                                        className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                                    >
                                        Open admissions
                                    </button>
                                </div>
                            </GlassCardHeader>
                            <GlassCardContent className="p-8 pt-2">
                                {dashboard.recentApplications.length === 0 ? (
                                    <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
                                        <p className="text-sm font-bold text-slate-200">No applications available yet</p>
                                        <p className="mt-2 text-sm text-slate-500">New department applications will appear here as soon as they are created.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {dashboard.recentApplications.map((application) => (
                                            <div
                                                key={application.id}
                                                className="flex flex-col gap-4 rounded-[2rem] border border-white/5 bg-white/[0.03] px-5 py-5 transition hover:border-primary/20 hover:bg-primary/[0.03] md:flex-row md:items-center md:justify-between"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-base font-black text-slate-100">{application.applicantName}</p>
                                                    <p className="truncate text-sm text-slate-500">{application.email}</p>
                                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                        <span>{application.program?.name || 'Program pending'}</span>
                                                        <span className="text-slate-700">•</span>
                                                        <span>{new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(application.appliedAt))}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={cn("rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest", statusTone[application.status] || 'bg-white/5 text-slate-300 border-white/10')}>
                                                        {formatStatus(application.status)}
                                                    </span>
                                                    <button
                                                        onClick={() => router.push('/department/admissions')}
                                                        className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                                                    >
                                                        Review
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </GlassCardContent>
                        </GlassCard>

                        <GlassCard className="rounded-[3rem] border-primary/10">
                            <GlassCardHeader className="p-8 pb-4">
                                <h3 className="text-2xl font-black font-space-grotesk text-slate-100">Operations Snapshot</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Department readiness at a glance</p>
                            </GlassCardHeader>
                            <GlassCardContent className="p-8 pt-2">
                                <div className="space-y-4">
                                    {[
                                        { label: 'Active timetable', value: dashboard.latestTimetable ? 'Live' : 'Pending generation', tone: dashboard.latestTimetable ? 'text-emerald-300' : 'text-amber-300' },
                                        { label: 'Admission pipeline', value: `${dashboard.stats.pending + dashboard.stats.reviewed} in progress`, tone: 'text-sky-300' },
                                        { label: 'Action queue', value: `${totalPendingActions} outstanding`, tone: totalPendingActions > 0 ? 'text-rose-300' : 'text-emerald-300' },
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-[2rem] border border-white/5 bg-white/[0.03] px-5 py-5">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                                            <p className={cn("mt-2 text-lg font-black font-space-grotesk", item.tone)}>{item.value}</p>
                                        </div>
                                    ))}
                                </div>
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
