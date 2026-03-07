'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { STUDENT_NAV } from '@/lib/constants/nav-config';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    LuCompass, LuSparkles, LuLoader, LuTarget,
    LuTrendingUp, LuBriefcase, LuCheck, LuArrowRight
} from 'react-icons/lu';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

interface RoadmapItem {
    phase: string;
    focus: string;
    milestone: string;
}

interface CareerPlan {
    careerTrack: string;
    overview: string;
    recommendedSkills: string[];
    roadmap: RoadmapItem[];
}

export default function CareerPlannerPage() {
    const { user } = useAuthStore();
    const [plan, setPlan] = useState<CareerPlan | null>(null);
    const [loading, setLoading] = useState(false);

    const generatePlan = async () => {
        setLoading(true);
        try {
            const res = await api.get('/v2/career-planner/plan');
            setPlan(res.data);
        } catch (error) {
            console.error('Failed to generate career plan', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['STUDENT']}>
            <DashboardLayout navItems={STUDENT_NAV} title="AI Career & Study Planner">
                <div className="max-w-5xl mx-auto space-y-8">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <LuCompass className="w-6 h-6" />
                                </div>
                                Career Navigator
                            </h1>
                            <p className="text-text-secondary dark:text-text-muted mt-2 font-medium">
                                Let our AI analyze your structural path and suggest optimized skill learning and career tracks.
                            </p>
                        </div>

                        {!plan && (
                            <Button
                                onClick={generatePlan}
                                disabled={loading}
                                size="lg"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 gap-2 font-bold transition-all hover:scale-105 active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <LuLoader className="w-5 h-5 animate-spin" />
                                        Computing Path...
                                    </>
                                ) : (
                                    <>
                                        <LuSparkles className="w-5 h-5" />
                                        Generate AI Roadmap
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="min-h-[400px] flex items-center justify-center"
                            >
                                <div className="flex flex-col items-center gap-6 glass-card p-12 rounded-3xl shrink-0">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse" />
                                        <LuCompass className="w-16 h-16 text-indigo-500 animate-[spin_3s_linear_infinite] relative z-10" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">Analyzing Academic standing</h3>
                                        <p className="text-sm text-text-secondary dark:text-text-muted">Evaluating SGPA, Program Trajectory, and Market Trends...</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {plan && !loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid md:grid-cols-12 gap-6"
                            >
                                {/* Left Column: Overview & Skills */}
                                <div className="md:col-span-5 space-y-6">
                                    <Card className="glass-card border-indigo-100 dark:border-indigo-500/20 shadow-md">
                                        <CardHeader className="bg-indigo-50/50 dark:bg-indigo-950/30 pb-4 border-b border-indigo-100 dark:border-border-hover">
                                            <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                                                <LuTarget className="w-5 h-5 text-indigo-500" />
                                                Suggested Track
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="text-2xl font-black text-slate-900 dark:text-white mb-4">
                                                {plan.careerTrack}
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                                                {plan.overview}
                                            </p>

                                            <div className="space-y-3">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                                    <LuTrendingUp className="w-4 h-4 text-emerald-500" />
                                                    High-Priority Skills
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {plan.recommendedSkills.map((skill, idx) => (
                                                        <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 py-1.5 px-3">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Button
                                        variant="outline"
                                        className="w-full gap-2 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-bold"
                                        onClick={generatePlan}
                                    >
                                        <LuSparkles className="w-4 h-4" />
                                        Regenerate Roadmap
                                    </Button>
                                </div>

                                {/* Right Column: The Timeline */}
                                <div className="md:col-span-7">
                                    <Card className="glass-card shadow-lg overflow-hidden border-slate-200 dark:border-border-hover h-full">
                                        <CardHeader className="bg-slate-50 border-b border-slate-100 dark:bg-[#0a0a0c]/50 dark:border-border-hover">
                                            <CardTitle className="flex items-center gap-2">
                                                <LuBriefcase className="w-5 h-5 text-text-secondary dark:text-text-muted" />
                                                Execution Timeline
                                            </CardTitle>
                                            <CardDescription>Follow these milestones to achieve your target role.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-8 pb-8 px-8 relative">
                                            {/* Vertical Line */}
                                            <div className="absolute left-10 top-8 bottom-8 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/50 to-transparent" />

                                            <div className="space-y-10 relative z-10">
                                                {plan.roadmap.map((step, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.1 * idx }}
                                                        className="flex gap-6 relative"
                                                    >
                                                        {/* Timeline Dot */}
                                                        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-500 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_10px_rgba(99,102,241,0.5)] z-20">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                                                        </div>

                                                        {/* Content Block */}
                                                        <div className="flex-1 pb-2">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-none">
                                                                    {step.phase}
                                                                </h3>
                                                            </div>
                                                            <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-border p-4 rounded-xl shadow-sm mb-3">
                                                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                                                    {step.focus}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-start gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                                                <LuCheck className="w-5 h-5 shrink-0" />
                                                                <span>Milestone: {step.milestone}</span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
