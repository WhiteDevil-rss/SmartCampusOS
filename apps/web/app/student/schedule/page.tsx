'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { V2DashboardLayout } from '@/components/v2/layout/dashboard-layout';
import { LuCalendar } from 'react-icons/lu';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { TimetableGrid } from '@/components/timetable/timetable-grid';

export default function StudentSchedulePage() {
    const { user } = useAuthStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [latestTimetable, setLatestTimetable] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSchedule = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // 1. Fetch student profile to get division assignment (using V2 endpoint)
            const studentRes = await api.get('/v2/student/me');
            const student = studentRes.data;
            
            // 2. Get active division ID
            const activeAssignment = student.divisionAssignments?.find((a: any) => a.status === 'ACTIVE');
            
            if (!activeAssignment) {
                setError("You are not currently assigned to any division. Please contact your department.");
                return;
            }

            const divisionId = activeAssignment.divisionId;
            const departmentId = student.departmentId;

            // 3. Fetch the department's latest timetable filtered by division (using V1 as timetable is v1 as per app.ts)
            const response = await api.get(`/v1/departments/${departmentId}/timetables/latest?divisionId=${divisionId}`);
            setLatestTimetable(response.data);
        } catch (e: any) {
            console.error("Schedule Fetch Error:", e);
            setError("No active schedule found for your division.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.role === 'STUDENT') {
            fetchSchedule();
        }
    }, [user, fetchSchedule]);

    return (
        <ProtectedRoute allowedRoles={['STUDENT']}>
            <V2DashboardLayout title="My Schedule">
                <div className="max-w-[1400px] mx-auto space-y-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-24 space-y-4">
                            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest animate-pulse">Loading your schedule...</p>
                        </div>
                    ) : error || !latestTimetable ? (
                        <div className="text-center p-20 border border-dashed rounded-[2rem] bg-white/5 border-white/10 backdrop-blur-xl">
                            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/20">
                                <LuCalendar className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
                                {error ? "Schedule Unavailable" : "No Schedule Published"}
                            </h3>
                            <p className="text-slate-400 font-medium max-w-sm mx-auto text-sm leading-relaxed">
                                {error || "Your timetable hasn't been published yet. Check back later or contact your department."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl relative overflow-hidden group hover:border-primary/30 transition-colors duration-200">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
                                <div className="relative z-10 space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Published</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-white tracking-tight">Weekly Timetable</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                                        Updated: {new Date(latestTimetable.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="px-6 py-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 backdrop-blur-md">
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">
                                        Status: Active
                                    </span>
                                </div>
                            </div>

                            <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-white/10 via-transparent to-white/5 border border-white/5 shadow-2xl shadow-black/50 overflow-hidden">
                                <div className="bg-[#0a1120]/80 backdrop-blur-2xl rounded-[2.4rem] p-4 md:p-8">
                                    <TimetableGrid
                                        slots={latestTimetable.slots}
                                        config={latestTimetable.configJson}
                                        viewMode="admin"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </V2DashboardLayout>
        </ProtectedRoute>
    );
}
