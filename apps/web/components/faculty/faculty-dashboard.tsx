'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacultyData } from '@/lib/hooks/use-faculty-data';
import { LuUsers, LuBookOpen, LuClock, LuCalendar, LuArrowRight, LuFileText, LuMessageSquare } from 'react-icons/lu';
import Link from 'next/link';
import { Button } from '../ui/button';

export function FacultyDashboard() {
    const { stats, loading, error } = useFacultyData();

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-3xl bg-surface" />
                    ))}
                </div>
                <Skeleton className="h-96 rounded-3xl bg-surface" />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-8 border-rose-500/20 bg-rose-500/5 text-rose-500 text-center">
                <p className="font-bold">{error}</p>
            </Card>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 glass-card border-primary/20 bg-primary/5 hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <LuBookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Assigned Subjects</p>
                            <p className="text-3xl font-black text-text-primary">{stats?.totalSubjects || 0}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 glass-card border-emerald-500/20 bg-emerald-500/5 hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                            <LuClock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Lectures Today</p>
                            <p className="text-3xl font-black text-text-primary">{stats?.lecturesToday || 0}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 glass-card border-amber-500/20 bg-amber-500/5 hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                            <LuFileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Assignments Due</p>
                            <p className="text-3xl font-black text-text-primary">{stats?.pendingAssignments || 0}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 glass-card border-indigo-500/20 bg-indigo-500/5 hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                            <LuMessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Unread Messages</p>
                            <p className="text-3xl font-black text-text-primary">{stats?.unreadMessages || 0}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Today's Schedule & Action Center */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Schedule List */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-3">
                        <LuCalendar className="text-primary" />
                        Today's Sessions
                    </h3>
                    <div className="space-y-4">
                        {stats?.todaySchedule && stats.todaySchedule.length > 0 ? (
                            stats.todaySchedule.map((slot: any) => (
                                <div key={slot.id} className="p-6 rounded-3xl bg-surface/50 border border-border hover:border-primary/20 transition-all group flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="text-center min-w-[80px]">
                                            <p className="text-xs font-black text-primary uppercase">{slot.startTime}</p>
                                            <div className="h-8 w-[1px] bg-surface-hover mx-auto my-1" />
                                            <p className="text-xs font-bold text-text-muted">{slot.endTime}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">{slot.course.name}</h4>
                                            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{slot.batch.name} • {slot.slotType}</p>
                                        </div>
                                    </div>
                                    <Link href={`/faculty/attendance?slot=${slot.id}`}>
                                        <Button className="rounded-2xl gap-2 font-bold px-6">
                                            Mark Attendance
                                            <LuArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 rounded-3xl border border-dashed border-border-hover text-center">
                                <p className="text-text-muted font-medium">No sessions scheduled for today. Take a break!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Actions & Notifications */}
                <div className="space-y-8">
                    <Card className="p-6 glass-card border-indigo-500/20 bg-indigo-500/5">
                        <h4 className="text-lg font-bold text-text-primary mb-4">Quick Links</h4>
                        <div className="space-y-3">
                            {[
                                { title: 'Exam Duties', href: '#', icon: <LuCalendar className="w-4 h-4" /> },
                                { title: 'Syllabus Tracker', href: '#', icon: <LuBookOpen className="w-4 h-4" /> },
                                { title: 'Leave Application', href: '#', icon: <LuClock className="w-4 h-4" /> },
                            ].map((link, idx) => (
                                <Link key={idx} href={link.href} className="flex items-center justify-between p-4 rounded-2xl bg-surface hover:bg-surface-hover transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="text-indigo-400">{link.icon}</div>
                                        <span className="text-sm font-bold text-text-secondary group-hover:text-text-primary transition-colors">{link.title}</span>
                                    </div>
                                    <LuArrowRight className="w-4 h-4 text-text-muted" />
                                </Link>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6 glass-card border-rose-500/20 bg-rose-500/5">
                        <h4 className="text-lg font-bold text-text-primary mb-4">Pending Approvals</h4>
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-3">
                                <LuUsers className="w-6 h-6" />
                            </div>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">No pending student requests</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
