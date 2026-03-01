'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuUser, LuCalendar, LuClock, LuBookOpen, LuGraduationCap } from 'react-icons/lu';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { FACULTY_NAV } from '@/lib/constants/nav-config';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function FacultyDashboard() {
    const { user } = useAuthStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [facultyData, setFacultyData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const { data } = await api.get(`/faculty/${user?.entityId}`);
            setFacultyData(data);
        } catch (e) {
            console.error(e);
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

    return (
        <ProtectedRoute allowedRoles={['FACULTY']}>
            <DashboardLayout navItems={navItems} title={`Welcome, ${user?.username || 'User'}`}>
                {loading ? (
                    <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-indigo-600 dark:border-neon-cyan border-t-transparent animate-spin rounded-full"></div></div>
                ) : facultyData ? (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Header Profile Section */}
                        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0a0a12] border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-90" />
                            <div className="relative px-8 pb-8 pt-16 flex flex-col md:flex-row items-end gap-6">
                                <div className="w-32 h-32 rounded-3xl bg-white dark:bg-[#121220] p-1.5 shadow-2xl relative z-10 -mt-16 border-4 border-white dark:border-[#0a0a12]">
                                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-inner">
                                        {facultyData.name?.charAt(0)}
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2 mb-2">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{facultyData.name}</h2>
                                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                                            {facultyData.designation || 'Faculty'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                                            <LuUser className="w-4 h-4 text-indigo-500" /> ID: {facultyData.id.slice(0, 8).toUpperCase()}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                                            <LuBookOpen className="w-4 h-4 text-purple-500" />
                                            {facultyData.departments?.[0]?.department?.name || 'Academic Faculty'}
                                        </span>
                                    </div>
                                </div>
                                <Link href="/profile" className="mb-2">
                                    <Button className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl font-bold group px-6">
                                        Edit Profile
                                        <LuUser className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Detailed Info Cards */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Academic & Professional section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="rounded-3xl border-slate-200/60 dark:border-white/10 dark:bg-[#0a0a0c] shadow-lg shadow-slate-100/50 dark:shadow-none transition-all hover:border-indigo-500/30">
                                        <CardHeader className="pb-3 border-b dark:border-white/5 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-2">
                                                <LuGraduationCap className="w-5 h-5 text-orange-500" />
                                            </div>
                                            <CardTitle className="text-lg font-bold">Qualifications</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed min-h-[60px]">
                                                {facultyData.qualifications || 'Information not provided yet.'}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-3xl border-slate-200/60 dark:border-white/10 dark:bg-[#0a0a0c] shadow-lg shadow-slate-100/50 dark:shadow-none transition-all hover:border-purple-500/30">
                                        <CardHeader className="pb-3 border-b dark:border-white/5 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-2">
                                                <LuClock className="w-5 h-5 text-purple-500" />
                                            </div>
                                            <CardTitle className="text-lg font-bold">Experience</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed min-h-[60px]">
                                                {facultyData.experience || 'Professional history not updated.'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Subjects and Schedule Overview */}
                                <Card className="rounded-3xl border-slate-200/60 dark:border-white/10 dark:bg-[#0a0a0c] shadow-lg shadow-slate-100/50 dark:shadow-none overflow-hidden">
                                    <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b dark:border-white/10 px-8 py-5">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                <LuBookOpen className="w-6 h-6 text-indigo-500" />
                                                Assigned Subjects
                                            </CardTitle>
                                            <Link href="/faculty-panel/schedule">
                                                <Button variant="ghost" className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-bold">View full schedule</Button>
                                            </Link>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        {facultyData.subjects && facultyData.subjects.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {facultyData.subjects.map((sub: any) => (
                                                    <div key={sub.id} className="group relative p-5 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.05] transition-all hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/30">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 shadow-sm border border-slate-100 dark:border-white/10">
                                                                <LuCalendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                            </div>
                                                            <span className={cn(
                                                                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                                sub.isPrimary ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                            )}>
                                                                {sub.isPrimary ? 'Primary' : 'Secondary'}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">{sub.course?.name}</h4>
                                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-500">Course Code: {sub.course?.code}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-white/10 rounded-2xl bg-slate-50/30 dark:bg-white/[0.01]">
                                                <LuBookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
                                                <p className="text-slate-500 font-medium">No subjects assigned for this semester.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Contact Sidebar */}
                            <div className="space-y-8">
                                <Card className="rounded-3xl border-slate-200/60 dark:border-white/10 dark:bg-[#0a0a0c] shadow-lg shadow-slate-100/50 dark:shadow-none overflow-hidden">
                                    <div className="h-2 bg-indigo-600" />
                                    <CardHeader className="px-6 pt-6 pb-2">
                                        <CardTitle className="text-lg font-bold">Contact Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-8 space-y-6">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</span>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white break-all">{facultyData.email || '—'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Number</span>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{facultyData.user?.phoneNumber || facultyData.phone || '—'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Office Address</span>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">{facultyData.user?.address || 'Department Office'}</p>
                                        </div>

                                        <div className="pt-4 border-t dark:border-white/5">
                                            <Link href="/profile">
                                                <Button variant="outline" className="w-full rounded-xl border-slate-200 dark:border-white/10 font-bold hover:bg-slate-50 dark:hover:bg-white/5">Update Info</Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 text-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-500/20 rounded-lg">Failed to load profile data.</div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
