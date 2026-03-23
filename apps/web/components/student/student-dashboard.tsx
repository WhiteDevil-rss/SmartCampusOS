'use client';

import { LuCalendar, LuCheck, LuBookOpen, LuCreditCard, LuBell, LuChevronRight, LuCalendarDays } from 'react-icons/lu';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStudentData } from '@/lib/hooks/use-student-data';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export function StudentDashboard() {
    const { profile, stats, loading: dataLoading } = useStudentData();
    const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
    const [loadingSchedule, setLoadingSchedule] = useState(true);

    useEffect(() => {
        if (!profile) return;

        const fetchTodaySchedule = async () => {
            try {
                const res = await api.get('/v2/student/timetable/today');
                setTodaySchedule(res.data?.slots || []);
            } catch (err) {
                console.error('Failed to fetch today schedule:', err);
            } finally {
                setLoadingSchedule(false);
            }
        };

        fetchTodaySchedule();
    }, [profile]);

    const studentStats = [
        { label: 'Attendance', value: `${stats?.attendancePercentage || 0}%`, icon: <LuCalendarDays />, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
        { label: 'Current SGPA', value: stats?.currentSGPA.toFixed(2) || '0.00', icon: <LuCheck />, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        { label: 'Credits', value: stats?.creditsEarned || '0', icon: <LuBookOpen />, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        { label: 'Assignments', value: stats?.pendingAssignments || '0', icon: <LuCreditCard />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    ];

    if (dataLoading) {
        return (
            <div className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 bg-surface rounded-[24px]" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <Skeleton className="lg:col-span-2 h-96 bg-surface rounded-[32px]" />
                    <Skeleton className="h-96 bg-surface rounded-[32px]" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in pb-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {studentStats.map((stat, i) => (
                    <div key={i} className="p-6 glass-morphism rounded-[24px] group transition-all duration-500 border hover:border-border-hover relative overflow-hidden">
                        <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] opacity-20 transition-opacity group-hover:opacity-40", stat.bg)} />
                        <div className="flex items-center gap-5 relative z-10">
                            <div className={cn("p-4 rounded-[16px] transition-transform group-hover:scale-110 duration-500 border", stat.bg, stat.color, stat.border)}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">{stat.label}</p>
                                <p className="text-3xl font-bold font-space-grotesk text-text-primary mt-1 tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Upcoming Classes */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold font-space-grotesk text-text-primary tracking-tight flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <LuCalendar className="text-primary w-4 h-4" />
                            </div>
                            Today's Schedule
                        </h2>
                        <Link href="/student/timetable">
                            <Button variant="ghost" className="text-text-muted hover:text-text-primary hover:bg-surface-hover font-bold rounded-xl transition-all">
                                View Full Timetable <LuChevronRight className="ml-1" />
                            </Button>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {loadingSchedule ? (
                            [1, 2].map(i => <Skeleton key={i} className="h-28 bg-surface rounded-[24px]" />)
                        ) : todaySchedule.length > 0 ? (
                            todaySchedule.map((slot, i) => (
                                <div key={i} className={cn("p-6 glass-morphism rounded-[24px] flex items-center justify-between group cursor-pointer border hover:border-primary/30 transition-all duration-300", slot.isBreak ? "opacity-60 grayscale" : "")}>
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-center justify-center w-20 h-20 rounded-[18px] bg-black/40 border border-border shadow-inner">
                                            <span className="text-2xl font-bold font-space-grotesk text-primary tracking-tighter">{slot.startTime.split(':')[0]}</span>
                                            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest leading-none mt-1">{slot.startTime.split(':')[1]}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold font-space-grotesk text-text-primary group-hover:text-primary transition-colors">
                                                {slot.isBreak ? 'Break' : slot.course?.name}
                                            </h3>
                                            {!slot.isBreak && (
                                                <p className="text-text-muted text-sm mt-1 flex items-center gap-2">
                                                    <span className="font-medium text-text-muted">{slot.faculty?.name}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                                    <span className="text-primary/80 font-mono text-xs bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">{slot.room?.name}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {!slot.isBreak && (
                                        <div className="hidden sm:block">
                                            <Button variant="outline" className="rounded-xl border-border-hover hover:bg-surface-hover hover:border-border-hover text-text-muted transition-all glow-button">
                                                Track Session
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-12 glass-morphism rounded-[32px] text-center border-dashed border-border-hover flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
                                    <LuCalendar className="w-8 h-8 text-text-secondary" />
                                </div>
                                <h3 className="text-xl font-bold font-space-grotesk text-text-primary mb-2">Clear Schedule</h3>
                                <p className="text-text-secondary">No active academic protocol nodes scheduled for today.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-10 lg:pl-4">
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold font-space-grotesk text-text-primary tracking-tight flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <LuBell className="text-amber-500 w-4 h-4" />
                            </div>
                            System Alerts
                        </h2>
                        <div className="space-y-4">
                            <div className="p-5 rounded-[20px] bg-black/40 border border-border hover:border-border-hover transition-all cursor-pointer group shadow-inner">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-1 rounded-md">Academic</span>
                                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Today</span>
                                </div>
                                <p className="text-sm font-bold text-text-muted group-hover:text-text-primary transition-colors leading-relaxed">
                                    New neural network assignment uploaded for AI & ML track. Ensure submission before deadline.
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" className="w-full text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-[16px] font-bold border border-border hover:border-border-hover transition-all h-12">
                            Access Alert Center
                        </Button>
                    </div>

                    <div className="glass-morphism rounded-[32px] p-8 mt-10 border border-border relative overflow-hidden group">
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 blur-[50px] rounded-full group-hover:scale-150 transition-transform duration-700" />
                        <h3 className="text-xl font-bold font-space-grotesk text-text-primary mb-2 relative z-10">AI Copilot</h3>
                        <p className="text-sm text-text-muted mb-6 relative z-10 relative z-10">Your institutional intelligence assistant is ready.</p>
                        <Button className="w-full glow-button bg-primary text-text-primary font-bold rounded-xl h-12 relative z-10">
                            Initialize Query
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

