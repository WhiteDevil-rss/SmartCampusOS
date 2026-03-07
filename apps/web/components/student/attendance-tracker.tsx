'use client';

import { useStudentData } from '@/lib/hooks/use-student-data';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LuCheck, LuX, LuInfo, LuArrowRight, LuCalendarDays } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { AttendanceFlagModal } from './attendance-flag-modal';

interface SubjectSummary {
    id: string;
    name: string;
    code: string;
    present: number;
    total: number;
    percentage: number;
    warningText: string;
    warningStatus: 'SAFE' | 'WARNING' | 'DANGER';
}

interface HeatmapDay {
    date: string;
    count: number;
}

interface DashboardData {
    overall: {
        totalClasses: number;
        presentClasses: number;
        percentage: number;
    };
    subjects: SubjectSummary[];
    heatmap: HeatmapDay[];
}

export function AttendanceTracker() {
    const { profile, loading: profileLoading } = useStudentData();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile) return;

        const fetchDashboard = async () => {
            try {
                const res = await api.get(`/v2/student/attendance/dashboard`);
                setData(res.data);
            } catch (err) {
                console.error('Failed to fetch attendance dashboard:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [profile]);

    if (profileLoading || loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-40 rounded-[2rem] bg-surface" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-3xl bg-surface" />)}
                </div>
                <Skeleton className="h-64 rounded-[2rem] bg-surface" />
            </div>
        );
    }

    // Heatmap config
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Overall Summary Card */}
            <Card className="relative overflow-hidden glass-card p-8 border-border flex flex-col md:flex-row items-center justify-between gap-8 group">
                <div className="z-10 relative">
                    <h2 className="text-3xl font-black text-text-primary tracking-tight">Cumulative Attendance</h2>
                    <p className="text-text-secondary mt-2 font-medium mb-6">
                        You have attended <strong className="text-primary">{data?.overall.presentClasses}</strong> out of <strong className="text-text-primary">{data?.overall.totalClasses}</strong> scheduled sessions.
                    </p>
                    <AttendanceFlagModal />
                </div>

                {/* Radial Chart alternative using pure CSS logic */}
                <div className="relative flex items-center justify-center w-36 h-36 shrink-0 z-10">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="72" cy="72" r="60" stroke="currentColor" strokeWidth="8" fill="transparent"
                            className="text-text-primary/5" />
                        <circle cx="72" cy="72" r="60" stroke="currentColor" strokeWidth="8" fill="transparent"
                            strokeDasharray="376.99"
                            strokeDashoffset={376.99 - (376.99 * (data?.overall.percentage || 0)) / 100}
                            className={cn(
                                "transition-all duration-1000 ease-out",
                                (data?.overall.percentage || 0) >= 75 ? "text-emerald-500" : "text-amber-500"
                            )} />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-text-primary">{data?.overall.percentage}%</span>
                    </div>
                </div>

                <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            </Card>

            {/* Subject-wise Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.subjects.map((subject, i) => (
                    <Card key={i} className="p-6 glass-card border-border hover:border-primary/20 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-text-primary transition-colors line-clamp-1">{subject.name}</h3>
                                <p className="text-[10px] text-primary/80 mt-1 font-black uppercase tracking-widest bg-primary/10 inline-block px-2 py-0.5 rounded-full">
                                    {subject.code}
                                </p>
                            </div>
                            <div className={cn(
                                "text-xl font-black",
                                subject.warningStatus === 'SAFE' ? "text-emerald-500" :
                                    subject.warningStatus === 'WARNING' ? "text-amber-500" : "text-rose-500"
                            )}>
                                {subject.percentage}%
                            </div>
                        </div>

                        <Progress
                            value={subject.percentage}
                            className="h-1.5 bg-surface"
                            indicatorClassName={
                                subject.warningStatus === 'SAFE' ? 'bg-emerald-500' :
                                    subject.warningStatus === 'WARNING' ? 'bg-amber-500' : 'bg-rose-500'
                            }
                        />

                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-xs text-text-muted font-bold">
                                {subject.present} / {subject.total} Sessions
                            </p>
                            <p className={cn(
                                "text-[10px] font-black uppercase tracking-wide px-2 py-1 rounded-md",
                                subject.warningStatus === 'SAFE' ? "bg-emerald-500/10 text-emerald-500" :
                                    subject.warningStatus === 'WARNING' ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                            )}>
                                {subject.warningText}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Heatmap Section */}
            <Card className="p-8 glass-card border-border">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <LuCalendarDays className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-text-primary">Daily Attendance Heatmap</h2>
                </div>

                <div className="heatmap-container overflow-hidden">
                    <CalendarHeatmap
                        startDate={sixMonthsAgo}
                        endDate={today}
                        values={data?.heatmap || []}
                        classForValue={(value) => {
                            if (!value) {
                                return 'color-empty';
                            }
                            if (value.count === 1) return 'color-scale-1';
                            if (value.count === 2) return 'color-scale-2';
                            if (value.count >= 3) return 'color-scale-3';
                            return 'color-empty';
                        }}
                        tooltipDataAttrs={(value?: { date?: string, count?: number }) => {
                            if (!value || !value.date) {
                                return { 'data-tooltip': 'No scheduled classes this day' } as any;
                            }
                            return {
                                'data-tooltip': `${value.date}: Attended ${value.count} classes`
                            } as any;
                        }}
                        showWeekdayLabels={true}
                    />
                </div>

                {/* Heatmap Custom Styles overriding the library defaults to match dark UI */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .heatmap-container rect { rx: 3px; ry: 3px; }
                    .react-calendar-heatmap .color-empty { fill: rgba(255,255,255,0.03); }
                    .react-calendar-heatmap .color-scale-1 { fill: rgba(16, 185, 129, 0.4); } 
                    .react-calendar-heatmap .color-scale-2 { fill: rgba(16, 185, 129, 0.7); } 
                    .react-calendar-heatmap .color-scale-3 { fill: rgba(16, 185, 129, 1); }
                    .react-calendar-heatmap text { fill: rgba(255,255,255,0.4); font-size: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;}
                `}} />
            </Card>
        </div>
    );
}
