'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { STUDENT_NAV } from '@/lib/constants/nav-config';
import { api } from '@/lib/api';
import { 
    GlassCard, GlassCardHeader, GlassCardTitle, 
    GlassCardDescription, GlassCardContent 
} from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    LuCompass, LuSparkles, LuLoader, LuTarget,
    LuTrendingUp, LuBriefcase, LuCheck, LuZap,
    LuActivity, LuBrain, LuCpu, LuRadar
} from 'react-icons/lu';
import { 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, 
    PolarRadiusAxis, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, Tooltip
} from 'recharts';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RoadmapItem {
    phase: string;
    focus: string;
    badge: string;
}

interface CareerIntelligence {
    careerTrack: string;
    optimalityScore: number;
    skillGap: string[];
    nextMilestone: {
        title: string;
        difficulty: string;
    };
    growthOrbit: RoadmapItem[];
}

interface ReadinessData {
    current: {
        technical: number;
        behavioral: number;
        experience: number;
        collaboration: number;
        innovation: number;
        overall: number;
        gapAnalysis: string;
    };
    radarData: any[];
    history: any[];
}

export default function CareerPlannerPage() {
    const { user } = useAuthStore();
    const [intelligence, setIntelligence] = useState<CareerIntelligence | null>(null);
    const [readiness, setReadiness] = useState<ReadinessData | null>(null);
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchReadiness();
        }
    }, [user?.id]);

    const fetchReadiness = async () => {
        try {
            const res = await api.get(`/v2/career-intelligence/${user?.id}/readiness-breakdown`);
            setReadiness(res.data.data);
        } catch (err) {
            console.error('Failed to fetch readiness', err);
        }
    };

    const runFullAudit = async () => {
        setLoading(true);
        setIsScanning(true);
        try {
            // Trigger the AI Intelligence Audit
            const res = await api.post('/v2/career-intelligence/audit', { studentId: user?.id });
            setIntelligence(res.data.data);
            
            // Refresh readiness
            await fetchReadiness();
        } catch (error) {
            console.error('Failed to generate career intelligence', error);
        } finally {
            setLoading(false);
            // Artificial delay for scanning animation effect
            setTimeout(() => setIsScanning(false), 2000);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['STUDENT']}>
            <DashboardLayout navItems={STUDENT_NAV} title="AI Career Command Center">
                <div className="max-w-7xl mx-auto space-y-8 pb-12">
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-1"
                        >
                            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                                <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                    Career Navigator
                                </span>
                                <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-mono">v3.0 Intelligence</Badge>
                            </h1>
                            <p className="text-text-muted font-medium text-lg max-w-2xl">
                                System diagnostics for your professional trajectory. Powered by high-fidelity constraint solving and industry trend mapping.
                            </p>
                        </motion.div>

                        <Button
                            onClick={runFullAudit}
                            disabled={loading || isScanning}
                            size="lg"
                            className={cn(
                                "relative overflow-hidden bg-white text-black hover:bg-white/90 font-black px-8 py-7 rounded-2xl shadow-2xl transition-all",
                                "before:absolute before:inset-0 before:bg-gradient-to-r before:from-indigo-500/20 before:to-purple-500/20 before:opacity-0 hover:before:opacity-100",
                                (loading || isScanning) && "animate-pulse cursor-wait"
                            )}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                {isScanning ? <LuLoader className="w-6 h-6 animate-spin" /> : <LuZap className="w-6 h-6 fill-current" />}
                                {isScanning ? "SYNCHRONIZING..." : "INITIATE SYSTEM AUDIT"}
                            </div>
                        </Button>
                    </div>

                    {/* Scanning Overlay Animation */}
                    <AnimatePresence>
                        {isScanning && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
                            >
                                <motion.div 
                                    animate={{ y: ["0vh", "100vh"] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="h-1 w-full bg-indigo-500 shadow-[0_0_50px_rgba(99,102,241,1)] blur-sm"
                                />
                                <div className="absolute inset-0 bg-indigo-950/20 backdrop-blur-[2px]" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Analytics Grid */}
                    <div className="grid lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Left: Readiness Radar */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-5"
                        >
                            <GlassCard className="h-full border-indigo-500/30 bg-indigo-500/5">
                                <GlassCardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                                                <LuRadar className="w-6 h-6" />
                                            </div>
                                            <GlassCardTitle>Industry Readiness Index</GlassCardTitle>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-indigo-400">
                                                {readiness?.current.overall || 0}%
                                            </div>
                                            <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Optimality</div>
                                        </div>
                                    </div>
                                </GlassCardHeader>
                                <GlassCardContent className="h-[400px] mt-4">
                                    {readiness ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={readiness.radarData}>
                                                <PolarGrid stroke="#312e81" strokeWidth={1} />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                <Radar
                                                    name="Student"
                                                    dataKey="A"
                                                    stroke="#6366f1"
                                                    fill="#6366f1"
                                                    fillOpacity={0.6}
                                                    animationDuration={2000}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center opacity-20">
                                            <LuActivity className="w-12 h-12 animate-pulse" />
                                        </div>
                                    )}
                                </GlassCardContent>
                                <div className="px-5 pb-8">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                                            <LuBrain className="w-4 h-4" />
                                            Diagnostic Summary
                                        </h4>
                                        <p className="text-sm text-white/70 leading-relaxed italic">
                                            "{readiness?.current.gapAnalysis || 'Initiate an audit to receive your tactical gap analysis.'}"
                                        </p>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>

                        {/* Right: Growth Orbit & Audit Results */}
                        <div className="lg:col-span-7 space-y-8">
                            
                            {/* Intelligence Cards */}
                            <AnimatePresence mode="wait">
                                {intelligence ? (
                                    <motion.div 
                                        key="results"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="grid md:grid-cols-2 gap-6"
                                    >
                                        <GlassCard className="py-6 border-emerald-500/30 bg-emerald-500/5">
                                            <GlassCardHeader className="pb-2">
                                                <div className="flex items-center gap-2 text-emerald-400">
                                                    <LuTarget className="w-5 h-5" />
                                                    <span className="text-xs font-black uppercase tracking-widest">Recommended Track</span>
                                                </div>
                                            </GlassCardHeader>
                                            <GlassCardContent>
                                                <div className="text-2xl font-black mb-4 group cursor-default">
                                                    {intelligence.careerTrack}
                                                    <div className="h-1 w-0 group-hover:w-full bg-emerald-400 transition-all duration-500" />
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {intelligence.skillGap.map((skill, i) => (
                                                        <Badge key={i} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </GlassCardContent>
                                        </GlassCard>

                                        <GlassCard className="py-6 border-sky-500/30 bg-sky-500/5">
                                            <GlassCardHeader className="pb-2">
                                                <div className="flex items-center gap-2 text-sky-400">
                                                    <LuActivity className="w-5 h-5" />
                                                    <span className="text-xs font-black uppercase tracking-widest">Next Milestone</span>
                                                </div>
                                            </GlassCardHeader>
                                            <GlassCardContent>
                                                <div className="text-xl font-bold mb-2">{intelligence.nextMilestone.title}</div>
                                                <Badge variant="outline" className="border-sky-500/40 text-sky-400 px-3">
                                                    Difficulty: {intelligence.nextMilestone.difficulty}
                                                </Badge>
                                            </GlassCardContent>
                                        </GlassCard>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-12 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4"
                                    >
                                        <div className="p-4 bg-white/5 rounded-full ring-8 ring-white/5">
                                            <LuCpu className="w-10 h-10 text-white/40" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white/80">Intelligence Engine Dormant</h3>
                                            <p className="text-sm text-white/40">Run a full audit to compute your career Growth Orbit.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Growth Orbit Timeline */}
                            <GlassCard className="bg-surface/10">
                                <GlassCardHeader className="border-b border-white/5 pb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                            <LuTrendingUp className="w-6 h-6" />
                                        </div>
                                        <GlassCardTitle>Growth Orbit Timeline</GlassCardTitle>
                                    </div>
                                </GlassCardHeader>
                                <GlassCardContent className="pt-10 pb-10 px-10 relative">
                                    {/* Timeline Connector */}
                                    <div className="absolute left-[51px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent opacity-30" />

                                    <div className="space-y-12">
                                        {(intelligence?.growthOrbit || [
                                            { phase: 'Semester 1-2', focus: 'Foundation Systems & Logic', badge: 'book' },
                                            { phase: 'Semester 3-4', focus: 'Complexity Analysis & Full Stack Architecture', badge: 'code' },
                                            { phase: 'Semester 5-6', focus: 'Industrial Integration & AI Specialization', badge: 'zap' }
                                        ]).map((node, idx) => (
                                            <motion.div 
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="relative flex items-start gap-8"
                                            >
                                                {/* Node Marker */}
                                                <div className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full bg-surface border-2 border-indigo-500 mt-1 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-xs font-black text-indigo-400 uppercase tracking-widest leading-none">
                                                        {node.phase}
                                                    </div>
                                                    <div className="text-lg font-bold text-white/90">
                                                        {node.focus}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-white/40 font-medium">
                                                        <LuCheck className="w-4 h-4 text-emerald-500" />
                                                        Target Milestone: Professional Certification
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </GlassCardContent>
                            </GlassCard>

                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
