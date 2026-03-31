'use client';

/**
 * Career Intelligence Panel — v1.0.0
 * The primary interface for students to interact with the AI Advisor.
 * Displays the Growth Orbit and actionable industry insights.
 */

import React, { useState, useEffect } from 'react';
import { 
    BrainCircuit, 
    Sparkles, 
    Terminal, 
    ArrowUpRight, 
    RefreshCw,
    ShieldCheck,
    Zap,
    ChevronRight,
    MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { GlassCard } from '@/components/v2/shared/cards';
import { IndustrialButton } from '@/components/v2/shared/inputs';
import { GrowthOrbit } from './growth-orbit';
import { Skeleton } from '@/components/ui/skeleton';

interface CareerPlan {
    careerTrack: string;
    optimalityScore: number;
    skillGap: string[];
    nextMilestone: {
        title: string;
        difficulty: string;
    };
    growthOrbit: any[];
    context: {
        sgpa: number;
        attendance: string;
    };
}

export function CareerIntelligencePanel() {
    const [plan, setPlan] = useState<CareerPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);

    const fetchPlan = async () => {
        try {
            setRegenerating(true);
            const response = await api.get('/career-planner/plan');
            setPlan(response.data);
        } catch (error) {
            console.error('Failed to fetch career plan:', error);
        } finally {
            setLoading(false);
            setRegenerating(false);
        }
    };

    useEffect(() => {
        fetchPlan();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Skeleton className="aspect-square bg-white/5 rounded-[3rem]" />
                <div className="space-y-6">
                    <Skeleton className="h-12 w-3/4 bg-white/5" />
                    <Skeleton className="h-40 w-full bg-white/5" />
                    <Skeleton className="h-40 w-full bg-white/5" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Header / Meta */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" /> AI Strategic Analysis
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Locally Encrypted
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tight font-space-grotesk">
                        Growth Intelligence
                    </h1>
                </div>
                
                <IndustrialButton 
                    variant="outline" 
                    onClick={fetchPlan}
                    disabled={regenerating}
                    className="rounded-2xl h-14 px-8 uppercase font-black tracking-widest text-[10px]"
                >
                    {regenerating ? <RefreshCw className="mr-2 w-4 h-4 animate-spin" /> : <RefreshCw className="mr-2 w-4 h-4" />}
                    Recalibrate Orbit
                </IndustrialButton>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Visual: Growth Orbit */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={plan?.careerTrack}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                    >
                        <GrowthOrbit 
                            careerTrack={plan?.careerTrack || 'General Tech'}
                            orbitData={plan?.growthOrbit || []}
                            optimalityScore={plan?.optimalityScore || 0}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Content: Insights Grid */}
                <div className="space-y-8">
                    {/* Primary Insight Card */}
                    <GlassCard className="p-8 border-primary/20 bg-primary/5 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BrainCircuit className="w-24 h-24 text-primary" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2 mb-4">
                                <Terminal className="w-5 h-5 text-primary" /> Track Archetype
                            </h3>
                            <div className="text-3xl font-black text-primary mb-4 font-space-grotesk">{plan?.careerTrack}</div>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                Your academic trajectory indicates a high aptitude for <span className="text-white">{plan?.careerTrack}</span>. 
                                We've detected consistent excellence in <span className="text-primary/80 italic font-bold">Systems Logic</span> and <span className="text-primary/80 italic font-bold">Algorithmic Engineering</span>.
                            </p>
                        </div>
                    </GlassCard>

                    {/* Secondary Insights Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Skill Gaps */}
                        <GlassCard className="p-6 rounded-[2rem] border-white/5">
                            <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                <Zap className="w-3 h-3 text-amber-500" /> Neural Gaps
                            </h4>
                            <div className="space-y-2">
                                {plan?.skillGap.map((skill, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                                        <span className="text-xs font-bold text-slate-300">{skill}</span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Next Milestone */}
                        <GlassCard className="p-6 rounded-[2rem] border-white/5 bg-emerald-500/[0.02]">
                            <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-emerald-500" /> Immediate Objective
                            </h4>
                            <div className="text-sm font-black text-white mb-1">{plan?.nextMilestone.title}</div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold uppercase tracking-tighter border border-emerald-500/20">
                                    {plan?.nextMilestone.difficulty} Effort
                                </span>
                                <ArrowUpRight className="w-4 h-4 text-emerald-500 opacity-50" />
                            </div>
                        </GlassCard>
                    </div>

                    <IndustrialButton 
                        className="w-full h-16 rounded-2xl bg-white/5 border-white/10 hover:border-primary/40 uppercase font-black tracking-widest text-xs"
                    >
                        Explore Detailed AI Roadmap <ChevronRight className="ml-2 w-4 h-4" />
                    </IndustrialButton>
                </div>
            </div>
        </div>
    );
}
