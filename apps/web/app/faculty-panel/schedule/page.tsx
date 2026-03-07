'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuUser, LuCalendar } from 'react-icons/lu';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { TimetableGrid } from '@/components/timetable/timetable-grid';
import { FACULTY_NAV } from '@/lib/constants/nav-config';

export default function FacultySchedulePage() {
    const { user } = useAuthStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [latestTimetable, setLatestTimetable] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchSchedule = useCallback(async () => {
        try {
            // Fetch the faculty profile to get their associated departmentId
            const facultyRes = await api.get(`/faculty/${user!.entityId}`);
            const departmentId = facultyRes.data.departmentId;

            // Now fetch the department's latest timetable
            const response = await api.get(`/departments/${departmentId}/timetables/latest?facultyId=${user!.entityId}`);
            setLatestTimetable(response.data);
        } catch (e) { // eslint-disable-line @typescript-eslint/no-unused-vars
            console.log("No active schedule found for you.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        // We only load if the user is authenticated and is a faculty member with an entityId
        if (user?.role === 'FACULTY' && user?.entityId) {
            fetchSchedule();
        }
    }, [user, fetchSchedule]);

    const navItems = FACULTY_NAV;
    // [
    //     { title: 'My Profile', href: '/faculty-panel', icon: <LuUser className="w-5 h-5" /> },
    //     { title: 'My Schedule', href: '/faculty-panel/schedule', icon: <LuCalendar className="w-5 h-5 text-indigo-500" /> },
    // ];

    return (
        <ProtectedRoute allowedRoles={['FACULTY']}>
            <DashboardLayout navItems={navItems} title="My Schedule">
                {loading ? (
                    <div className="flex justify-center p-12"><div className="w-8 h-8 rounded-full border-4 border-indigo-600 dark:border-neon-cyan border-t-transparent animate-spin" /></div>
                ) : latestTimetable ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-900/40 border border-border backdrop-blur-md p-8 rounded-[1.5rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 blur-[40px] rounded-full group-hover:bg-neon-cyan/15 transition-all duration-500" />
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-white glow-sm tracking-tight">Active Schedule Matrix</h3>
                                <p className="text-sm text-text-muted font-medium mt-1">
                                    Generated Dynamic Matrix: {new Date(latestTimetable.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <TimetableGrid
                            slots={latestTimetable.slots}
                            config={latestTimetable.configJson}
                            viewMode="faculty"
                            facultyId={user!.entityId!}
                        />
                    </div>
                ) : (
                    <div className="text-center p-20 border border-dashed rounded-[2rem] bg-slate-900/20 border-border-hover backdrop-blur-sm">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <LuCalendar className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 tracking-tight">Vortex Sync Pending</h3>
                        <p className="text-text-secondary font-medium max-w-sm mx-auto">Your specific department has not generated or published an active timetable matrix yet. Please stand by for synchronization.</p>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
