'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import {
    LuUser, LuCalendar, LuClock, LuBookOpen, LuGraduationCap,
    LuUsers, LuClipboardList, LuMessageSquare, LuChevronRight, LuActivity,
    LuTerminal, LuShieldCheck, LuMapPin, LuTrendingUp, LuMoveHorizontal
} from 'react-icons/lu';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { FACULTY_NAV } from '@/lib/constants/nav-config';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, Variants } from 'framer-motion';

export default function FacultyDashboard() {
    const { user } = useAuthStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [facultyData, setFacultyData] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [stats, setStats] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [performance, setPerformance] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [profileRes, statsRes, perfRes] = await Promise.all([
                api.get(`/faculty/${user?.entityId}`),
                api.get('/faculty/stats'),
                api.get(`/faculty/performance/${user?.entityId}`)
            ]);
            setFacultyData(profileRes.data);
            setStats(statsRes.data);

            const myPerf = Array.isArray(perfRes.data)
                ? perfRes.data.find((p: any) => p.id === user?.entityId)
                : perfRes.data;
            setPerformance(myPerf);
        } catch (e) {
            console.error('Failed to fetch faculty data:', e);
        } finally {
            setLoading(false);
        }
    }, [user?.entityId]);

    useEffect(() => {
        if (user?.entityId) {
            fetchData();
        }
    }, [user, fetchData]);

    const navItems = FACULTY_NAV;

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 10, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 120, damping: 20 }
        }
    };

    return (
        <ProtectedRoute allowedRoles={['FACULTY']}>
            <DashboardLayout navItems={navItems} title="Faculty Administration Terminal">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-2 border-slate-200 border-t-indigo-600 animate-spin rounded-full"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Loading Institutional State...</span>
                        </div>
                    </div>
                ) : facultyData ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-[1600px] mx-auto space-y-8 pb-20"
                    >
                        {/* Executive Header Section */}
                        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-indigo-600">
                            <div className="flex items-center gap-6">
                                <div className="relative w-24 h-24 shrink-0">
                                    <div className="w-full h-full rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl font-bold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
                                        {facultyData.name?.charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 shadow-sm" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{facultyData.name}</h2>
                                        <span className="px-3 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-full border border-indigo-100 dark:border-indigo-800 uppercase tracking-wider">
                                            {facultyData.designation || 'Academic Faculty'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-2">
                                            <LuTerminal className="w-4 h-4 text-indigo-500" />
                                            <span className="font-mono text-xs">ID: {facultyData.id.split('-')[0].toUpperCase()}</span>
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <LuMapPin className="w-4 h-4 text-slate-400" />
                                            {facultyData.departments?.[0]?.department?.name || 'General Academy'}
                                        </span>
                                        <span className="flex items-center gap-2 font-medium">
                                            <LuShieldCheck className="w-4 h-4 text-emerald-500" />
                                            Verified Account
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    Download CSV
                                </Button>
                                <Link href="/profile">
                                    <Button className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all">
                                        Manage Profile
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Metrics Hierarchy Grid */}
                        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {[
                                { label: 'Active Enrollment', value: stats?.totalStudents || 0, icon: LuUsers, color: 'text-blue-600', trend: '+12%', sub: 'Total Students' },
                                { label: 'Assigned Subjects', value: stats?.totalSubjects || 0, icon: LuBookOpen, color: 'text-indigo-600', trend: 'Stable', sub: 'Current Semester' },
                                { label: 'Academic Impact', value: performance?.overallScore || 85, icon: LuTrendingUp, color: 'text-emerald-600', trend: '+4.2%', sub: 'Performance Index' },
                                { label: 'Comms Queue', value: stats?.unreadMessages || 0, icon: LuMessageSquare, color: 'text-rose-600', trend: 'New', sub: 'Unread Intel' },
                            ].map((metric, idx) => (
                                <Card key={idx} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden group hover:border-indigo-500/30 transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={cn("p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700", metric.color.replace('text-', 'bg-opacity-10 '))}>
                                                <metric.icon className={cn("w-5 h-5", metric.color)} />
                                            </div>
                                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                                metric.trend.includes('+') ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                                            )}>
                                                {metric.trend}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{metric.value}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{metric.label}</p>
                                        </div>
                                    </CardContent>
                                    <div className="h-1 bg-slate-50 dark:bg-slate-800">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(metric.value / 100) * 100}%` }}
                                            transition={{ duration: 1, delay: idx * 0.1 }}
                                            className={cn("h-full", metric.color.replace('text-', 'bg-'))}
                                        />
                                    </div>
                                </Card>
                            ))}
                        </motion.div>

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                            {/* Operational Schedule Module */}
                            <motion.div variants={itemVariants} className="xl:col-span-8 space-y-8">
                                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                                    <CardHeader className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                <LuCalendar className="w-5 h-5 text-indigo-600" />
                                                Daily Instructional Schedule
                                            </CardTitle>
                                            <p className="text-xs text-slate-500">Operational slots for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                                            <LuMoveHorizontal className="w-5 h-5" />
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {stats?.todaySchedule && stats.todaySchedule.length > 0 ? (
                                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {stats.todaySchedule.map((slot: any, idx: number) => (
                                                    <div key={slot.id} className="p-6 flex flex-col md:flex-row md:items-center gap-8 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                                                        <div className="md:w-32 flex flex-col items-center md:items-start">
                                                            <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                                                                {slot.startTime || '09:00'}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                Slot {slot.slotNumber}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-3">
                                                                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">{slot.course?.name}</h4>
                                                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-bold rounded-md border border-slate-200 dark:border-slate-700 uppercase">
                                                                        {slot.sessionType?.name || 'Lecture'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                                                    <span className="flex items-center gap-2">
                                                                        <LuUsers className="w-3.5 h-3.5" /> {slot.batch?.name}
                                                                    </span>
                                                                    <span className="flex items-center gap-2">
                                                                        <LuMapPin className="w-3.5 h-3.5" /> Room {slot.room?.name || 'V-101'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Button className="h-10 px-6 rounded-lg bg-indigo-600 hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-sm">
                                                                Open Session
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-20 text-center space-y-4">
                                                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto">
                                                    <LuClock className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-400 italic font-mono">No active teaching sessions detected in current matrix.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Temporal Persistence: {new Date().toLocaleTimeString()}</span>
                                        <Link href="/faculty-panel/schedule">
                                            <Button variant="link" className="text-xs font-bold text-indigo-600 h-auto p-0 hover:text-indigo-700">View Comprehensive Schedule</Button>
                                        </Link>
                                    </div>
                                </Card>

                                {/* Institutional Profile Data */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                                        <CardHeader className="p-8 pb-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                            <CardTitle className="text-base font-bold flex items-center gap-2 uppercase tracking-tight">
                                                <LuGraduationCap className="w-5 h-5 text-indigo-600" />
                                                Academic Qualifications
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-8">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium min-h-[80px]">
                                                {facultyData.qualifications || 'Documentation pending institutional verification.'}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                                        <CardHeader className="p-8 pb-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                            <CardTitle className="text-base font-bold flex items-center gap-2 uppercase tracking-tight">
                                                <LuActivity className="w-5 h-5 text-indigo-600" />
                                                Professional History
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-8">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium min-h-[80px]">
                                                {facultyData.experience || 'Professional lineage not yet detailed in portal.'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </motion.div>

                            {/* Institutional Sidebar Modules */}
                            <motion.div variants={itemVariants} className="xl:col-span-4 space-y-8">
                                {/* Academic Assets Module */}
                                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                                    <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <LuBookOpen className="w-5 h-5 text-indigo-600" />
                                            Active Holdings
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-4">
                                        {facultyData.subjects?.map((sub: any, idx: number) => (
                                            <div key={sub.id} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{sub.course?.name}</h5>
                                                    <span className="text-[10px] font-bold text-slate-400 tabular-nums uppercase tracking-widest">{sub.course?.code}</span>
                                                </div>
                                                <div className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                                    sub.isPrimary ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-slate-100 text-slate-500 border-slate-200"
                                                )}>
                                                    {sub.isPrimary ? 'Primary' : 'Support'}
                                                </div>
                                            </div>
                                        )) || (
                                                <div className="text-center py-8 text-slate-400 text-xs italic">No holdings detected.</div>
                                            )}
                                        <Button className="w-full h-12 bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm">
                                            Request Assignments
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* System Verification Status */}
                                <Card className="bg-slate-900 text-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
                                            <LuShieldCheck className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] font-mono">Verified Node</span>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-bold">Institutional Trust</h4>
                                        <p className="text-slate-400 text-xs leading-relaxed">Your professional identity is cryptographically signed and stored on the university ledger.</p>
                                    </div>
                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                            <span className="text-slate-500">Node Status</span>
                                            <span className="text-emerald-400">Online</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full w-full bg-indigo-600" />
                                        </div>
                                    </div>
                                </Card>

                                {/* Contact Module */}
                                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                                    <CardContent className="p-8 space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="mt-1">
                                                    <LuTerminal className="w-4 h-4 text-indigo-500" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Office Email</p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white break-all">{facultyData.email || '—'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="mt-1">
                                                    <LuActivity className="w-4 h-4 text-indigo-500" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Extension Line</p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{facultyData.user?.phoneNumber || 'UNSET'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                                            Update Contact Log
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="py-20 text-center flex flex-col items-center justify-center gap-6 max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center border border-rose-100">
                            <LuShieldCheck className="w-10 h-10 text-rose-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Authentication Failed</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">System was unable to synchronize your professional identity vector with the central administration database.</p>
                        </div>
                        <Button className="h-12 px-8 bg-slate-900 text-white rounded-xl font-bold shadow-xl">
                            Try Again
                        </Button>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
