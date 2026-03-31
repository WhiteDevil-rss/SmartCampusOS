'use client';

import { 
  Calendar, 
  CheckCircle2, 
  BookOpen, 
  CreditCard, 
  Bell, 
  ChevronRight, 
  Clock,
  Zap,
  LayoutDashboard,
  BrainCircuit,
  GraduationCap,
  History,
  Activity,
  ArrowRight,
  User,
  MapPin
} from 'lucide-react';
import { GlassCard, StatCard } from '@/components/v2/shared/cards';
import { IndustrialButton } from '@/components/v2/shared/inputs';
import { cn } from '@/lib/utils';
import { useStudentData } from '@/lib/hooks/use-student-data';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { GreetingCard } from '@/components/v2/shared/greeting-card';
import { LuSparkles } from 'react-icons/lu';
import { CareerIntelligencePanel } from '@/components/v2/student/career-intelligence-panel';
import { FinancialLedger } from '@/components/student/financial-ledger';
import { GrantMatcher } from '@/components/student/grant-matcher';
import { SentinelPanel } from '@/components/student/sentinel-panel';
import { StudyHub } from '@/components/student/study-hub';

export function StudentDashboard() {
    const { profile, stats, loading: dataLoading } = useStudentData();
    const router = useRouter();
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

    if (dataLoading) {
        return (
            <div className="space-y-10">
                <Skeleton className="h-64 md:h-80 w-full bg-[#0a1120]/50 rounded-[3rem] border border-white/5" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 bg-[#0a1120]/50 rounded-[24px] border border-white/5" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <Skeleton className="lg:col-span-2 h-96 bg-[#0a1120]/50 rounded-[32px] border border-white/5" />
                    <Skeleton className="h-96 bg-[#0a1120]/50 rounded-[32px] border border-white/5" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-24">
            {/* Greeting Command Center */}
            <GreetingCard 
                name={profile?.name || 'Academic'}
                role="Student"
                stats={[
                    { label: "Today's Sessions", value: todaySchedule.length || 0, icon: Clock },
                    { label: "Pending Coursework", value: stats?.pendingAssignments || 0, icon: BookOpen }
                ]}
                quickAction={{
                    label: "Launch AI Assistant",
                    onClick: () => router.push('/student/assistant')
                }}
            />

            {/* Humanized Stats Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Campus Presence"
                    value={stats?.attendancePercentage || 0}
                    suffix="%"
                    icon={Calendar}
                    change={2.4}
                    changeDescription="vs last month"
                />
                <StatCard
                    title="Academic Standing"
                    value={stats?.currentSGPA || 0}
                    precision={2}
                    icon={GraduationCap}
                    change={0.12}
                    changeDescription="performance delta"
                />
                <StatCard
                    title="Course Progression"
                    value={Number(stats?.creditsEarned) || 0}
                    icon={BrainCircuit}
                    change={0}
                    changeDescription="verified credits"
                />
                <StatCard
                    title="Upcoming Deadlines"
                    value={Number(stats?.pendingAssignments) || 0}
                    icon={History}
                    change={-1}
                    changeDescription="unresolved items"
                />
            </div>

            <div className="relative z-10">
                <CareerIntelligencePanel />
            </div>

            {/* AI Academic Sentinel Portal */}
            <div className="relative z-10">
                <SentinelPanel />
            </div>

            <div className="relative z-10">
                <StudyHub />
            </div>

            {/* AI Financial Intelligence Hub */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                        <CreditCard className="w-4 h-4 text-indigo-500" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tighter text-slate-100">
                        Financial Intelligence Hub
                    </h2>
                </div>
                <FinancialLedger />
                <div className="pt-4">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                        <LuSparkles className="w-4 h-4 text-indigo-400" />
                        AI-Curated Grant Matches
                    </h3>
                    <GrantMatcher />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main: "My Day at a Glance" */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                <Clock className="w-4 h-4 text-primary" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tighter text-slate-100">
                                My Day at a Glance
                            </h2>
                        </div>
                        <Link href="/student/schedule">
                            <IndustrialButton variant="secondary" size="sm" className="hidden sm:flex text-[9px] uppercase font-black tracking-widest">
                                Full Timetable <ChevronRight className="ml-1 w-3 h-3" />
                            </IndustrialButton>
                        </Link>
                    </div>

                    <GlassCard className="p-2 border-primary/10">
                        <div className="space-y-1">
                            {loadingSchedule ? (
                                [1, 2].map(i => <Skeleton key={i} className="h-24 bg-white/5 rounded-2xl" />)
                            ) : todaySchedule.length > 0 ? (
                                todaySchedule.map((slot, i) => (
                                    <div 
                                        key={i} 
                                        className={cn(
                                            "group p-5 rounded-3xl border border-transparent hover:border-primary/20 hover:bg-primary/[0.03] transition-all duration-300 flex items-center justify-between",
                                            slot.isBreak ? "opacity-30 grayscale pointer-events-none" : "cursor-pointer"
                                        )}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 shadow-xl group-hover:border-primary/40 transition-all duration-300 shrink-0">
                                                <span className="text-2xl font-black font-space-grotesk text-primary leading-none">{slot.startTime.split(':')[0]}</span>
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">{slot.startTime.split(':')[1]}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-100 group-hover:text-primary transition-all duration-300 flex items-center gap-2">
                                                    {slot.isBreak ? 'Interval Period' : slot.course?.name}
                                                    {!slot.isBreak && <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-emerald-500/20">Direct</span>}
                                                </h3>
                                                {!slot.isBreak && (
                                                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                            <User className="w-3 h-3" /> {slot.faculty?.name}
                                                        </span>
                                                        <div className="w-1 h-1 rounded-full bg-slate-800" />
                                                        <span className="text-[9px] font-black text-primary/80 bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/20 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" /> Hall: {slot.room?.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {!slot.isBreak && (
                                            <IndustrialButton 
                                                variant="outline" 
                                                size="sm" 
                                                className="opacity-0 group-hover:opacity-100 transition-all shrink-0 rounded-xl uppercase font-black tracking-widest text-[9px]"
                                                onClick={() => router.push(`/student/attendance?slot=${slot.id}`)}
                                            >
                                                Initialize Presence
                                            </IndustrialButton>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-24 text-center flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 animate-float">
                                        <Zap className="w-10 h-10 text-slate-700" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-300 uppercase tracking-tighter">Campus Silence</h3>
                                    <p className="text-sm text-slate-500 max-w-[320px] mx-auto mt-2 font-medium">Your current sector has no active sessions. Enjoy the focused deep work time.</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar: "My Campus Services" */}
                <div className="space-y-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <Activity className="w-4 h-4 text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-100">
                                Hub Shortcuts
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                             {[
                                { title: 'Verified Records', href: '/student/results', icon: CheckCircle2, label: 'Performance Review' },
                                { title: 'Financial Ledger', href: '/student/fees', icon: CreditCard, label: 'Tuition & Grants' },
                                { title: 'Learning Matrix', href: '/student/academics', icon: BookOpen, label: 'Course Catalog' },
                            ].map((item, idx) => (
                                <Link key={idx} href={item.href} className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 group cursor-pointer shadow-lg shadow-black/20">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-white/5 text-slate-500 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-300">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-primary/70 transition-colors">{item.title}</span>
                                            <span className="text-base font-black text-slate-300 group-hover:text-white transition-colors duration-200 font-space-grotesk">{item.label}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-primary transition-all duration-300 group-hover:translate-x-1" />
                                </Link>
                            ))}
                        </div>

                        <Link href="/helpdesk" className="block w-full">
                            <IndustrialButton variant="secondary" className="w-full h-14 uppercase tracking-[0.2em] text-[10px] font-black rounded-2xl border-white/5 hover:border-primary/20">
                                Access Control Center
                            </IndustrialButton>
                        </Link>
                    </div>

                    {/* Pro AI Assistant Card */}
                    <GlassCard className="p-10 relative overflow-hidden group border-primary/30 bg-primary/[0.05] rounded-[3rem]">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/20 blur-[60px] rounded-full pointer-events-none group-hover:bg-primary/30 transition-all duration-500" />
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white mb-6 shadow-xl shadow-primary/30 group-hover:scale-110 transition-transform duration-500">
                                <BrainCircuit className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-slate-100 mb-2 font-space-grotesk">Campus AI</h3>
                            <p className="text-sm text-slate-400 mb-8 leading-relaxed font-medium">Your personal academic liaison. Ask anything about your schedule, grades, or faculty feedback.</p>
                            <IndustrialButton 
                                className="w-full glow-button uppercase font-black tracking-widest text-[10px] h-14 rounded-2xl"
                                onClick={() => router.push('/student/assistant')}
                            >
                                Initiate Inquiry <ArrowRight className="ml-2 w-4 h-4" />
                            </IndustrialButton>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
