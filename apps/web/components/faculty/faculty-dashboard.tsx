'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacultyData } from '@/lib/hooks/use-faculty-data';
import { ClassSentinel } from './class-sentinel';
import { 
  Users, 
  BookOpen, 
  Clock, 
  Calendar, 
  ArrowRight, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle,
  GraduationCap,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  History,
  MemoryStick,
  Activity,
  MessagesSquare,
  Sparkles,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { GlassCard, StatCard } from '@/components/v2/shared/cards';
import { IndustrialButton } from '@/components/v2/shared/inputs';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GreetingCard } from '@/components/v2/shared/greeting-card';

export function FacultyDashboard() {
    const { stats, loading, error, profile } = useFacultyData() as any;
    const router = useRouter();

    if (loading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-64 md:h-80 w-full bg-[#0a1120]/50 rounded-[3rem] border border-white/5" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-3xl bg-[#0a1120]/50 border border-white/5" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="lg:col-span-2 h-[500px] rounded-3xl bg-[#0a1120]/50 border border-white/5" />
                    <Skeleton className="h-[500px] rounded-3xl bg-[#0a1120]/50 border border-white/5" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <GlassCard className="p-12 border-rose-500/20 bg-rose-500/5 text-center rounded-[3rem]">
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-rose-500/10 text-rose-500">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Sync Interrupt</h3>
                        <p className="text-rose-400 font-medium max-w-md mx-auto text-sm">{error}</p>
                    </div>
                    <IndustrialButton variant="outline" className="mt-4 rounded-xl px-8" onClick={() => router.refresh()}>
                        Retry Connection
                    </IndustrialButton>
                </div>
            </GlassCard>
        );
    }

    return (
        <div className="space-y-10 pb-24">
            {/* Command Greeting */}
            <GreetingCard 
                name={profile?.name || 'Professor'}
                role="Faculty"
                stats={[
                    { label: "Sessions Today", value: stats?.lecturesToday || 0, icon: Clock },
                    { label: "Unread Updates", value: stats?.unreadMessages || 0, icon: MessagesSquare }
                ]}
                quickAction={{
                    label: "View Gradebook",
                    onClick: () => router.push('/faculty-panel/marks')
                }}
            />

            {/* Humanized Faculty Stats */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <StatCard 
                    title="Active Courses" 
                    value={stats?.totalSubjects || 0} 
                    change={0}
                    changeDescription="Current Semester"
                    icon={BookOpen}
                />
                <StatCard 
                    title="Time in Hall" 
                    value={stats?.lecturesToday || 0} 
                    suffix=" Sessions"
                    change={12}
                    changeDescription="utilization"
                    icon={Clock}
                />
                <StatCard 
                    title="Pending Reviews" 
                    value={stats?.pendingAssignments || 0} 
                    change={-5}
                    changeDescription="progress"
                    icon={ClipboardCheck}
                />
                <StatCard 
                    title="Inbox Status" 
                    value={stats?.unreadMessages || 0} 
                    change={0}
                    icon={MessageSquare}
                />
            </motion.div>

            {/* Phase 16: Class Sentinel - Integrated Oversight */}
            {stats?.todaySchedule?.[0] && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <ClassSentinel 
                        courseId={stats.todaySchedule[0].courseId} 
                        courseName={stats.todaySchedule[0].course.name} 
                    />
                </motion.div>
            )}

            {/* Primary Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Schedule Hub */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                <CalendarDays className="w-4 h-4 text-primary" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tighter text-slate-100">
                                Today&apos;s Teaching Schedule
                            </h2>
                        </div>
                        <Link href="/faculty-panel/schedule">
                            <IndustrialButton variant="secondary" size="sm" className="hidden sm:flex text-[9px] uppercase font-black tracking-widest">
                                Full View <ChevronRight className="ml-1 w-3 h-3" />
                            </IndustrialButton>
                        </Link>
                    </div>

                    <GlassCard className="p-2 border-primary/10">
                        <div className="space-y-1">
                            {stats?.todaySchedule && stats.todaySchedule.length > 0 ? (
                                stats.todaySchedule.map((slot: any, idx: number) => (
                                    <div key={slot.id} className="group p-6 rounded-3xl border border-transparent hover:border-primary/20 hover:bg-primary/[0.03] transition-all duration-300 flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 shadow-xl group-hover:border-primary/40 transition-all duration-300 shrink-0">
                                                <span className="text-xl font-black font-space-grotesk text-primary leading-none uppercase">{slot.startTime.split(':')[0]}</span>
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">{slot.startTime.split(':')[1]}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-slate-100 group-hover:text-primary transition-all duration-300 flex items-center gap-2">
                                                    {slot.course.name}
                                                    {idx === 0 && <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                                                </h4>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1.5">
                                                    {slot.batch.name} • <span className="text-primary/70">{slot.slotType}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <Link href={`/faculty-panel/attendance?slot=${slot.id}`}>
                                            <IndustrialButton 
                                                variant="outline" 
                                                size="sm" 
                                                className="opacity-0 group-hover:opacity-100 transition-all shrink-0 rounded-xl uppercase font-black tracking-widest text-[9px]"
                                            >
                                                Mark Presence <ArrowRight className="ml-2 w-3 h-3" />
                                            </IndustrialButton>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="py-24 text-center flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 animate-float">
                                        <History className="w-10 h-10 text-slate-700" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-300 uppercase tracking-tighter">Teaching Clearance</h3>
                                    <p className="text-sm text-slate-500 max-w-[320px] mx-auto mt-2 font-medium">No sessions scheduled for the current deployment window. Your research awaits.</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Services Hub */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-8"
                >
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <Activity className="w-4 h-4 text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-100">
                                Faculty Services
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { title: 'Exam Registry', href: '/faculty-panel/exams', icon: GraduationCap, label: 'Manage Assessments' },
                                { title: 'Grade Ledger', href: '/faculty-panel/marks', icon: FileText, label: 'Performance Records' },
                                { title: 'Academic Trends', href: '/faculty-panel/analytics', icon: TrendingUp, label: 'Student Analytics' },
                                { title: 'Time Off', href: '/faculty-panel/leave', icon: Clock, label: 'Absence Portal' },
                            ].map((item, idx) => (
                                <Link key={idx} href={item.href} className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 group cursor-pointer shadow-lg shadow-black/20">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-white/5 text-slate-500 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-300">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-primary/70 transition-colors">{item.title}</span>
                                            <span className="text-base font-black text-slate-300 group-hover:text-white transition-colors duration-200 font-space-grotesk">{item.label}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-primary transition-all duration-300 group-hover:translate-x-1" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* AI Orchestration Hub */}
                    <GlassCard className="p-10 relative overflow-hidden group border-primary/20 bg-primary/[0.03] rounded-[3rem]">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-all duration-500" />
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-100 font-space-grotesk">Neural Alignment</h3>
                                <div className="text-xl font-black text-primary italic">98.2%</div>
                            </div>
                            <p className="text-sm text-slate-400 mb-8 leading-relaxed font-medium">
                                Your current assignment is optimized for peak pedagogy. 
                                <span className="text-primary/70"> Zero constraint violations detected by CP-SAT solver.</span>
                            </p>
                            <div className="space-y-4">
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: '98.2%' }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-primary shadow-[0_0_15px_rgba(57,193,239,0.5)]"
                                    />
                                </div>
                                <IndustrialButton 
                                    variant="primary"
                                    className="w-full uppercase font-black tracking-widest text-[10px] h-14 rounded-2xl shadow-[0_0_30px_rgba(57,193,239,0.2)]"
                                >
                                    View Optimality Insights <Zap className="ml-2 w-4 h-4 fill-current" />
                                </IndustrialButton>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Student Action/Requests Card */}
                    <GlassCard className="p-10 relative overflow-hidden group border-emerald-500/20 bg-emerald-500/[0.03] rounded-[3rem]">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform duration-500">
                                <Users className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-slate-100 mb-2 font-space-grotesk">Student Actions</h3>
                            <p className="text-sm text-slate-400 mb-8 leading-relaxed font-medium">All student requests are currently synchronized. No urgent authorizations detected.</p>
                            <IndustrialButton 
                                variant="outline"
                                className="w-full uppercase font-black tracking-widest text-[10px] h-14 rounded-2xl border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5 text-emerald-500"
                            >
                                Batch Resolve <ArrowRight className="ml-2 w-4 h-4" />
                            </IndustrialButton>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    );
}
