'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Target, 
    Rocket, 
    ChevronRight, 
    AlertCircle, 
    Award, 
    Zap, 
    Briefcase,
    Activity,
    BrainCircuit,
    ShieldCheck,
    Cpu
} from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Toast, useToast } from '@/components/ui/toast-alert';

interface Milestone {
    title: string;
    difficulty: string;
}

interface OrbitPhase {
    phase: string;
    focus: string;
    badge: string;
}

interface CareerAudit {
    id: string;
    careerTrack: string;
    optimalityScore: number;
    skillGap: string[];
    nextMilestone: Milestone;
    growthOrbit: OrbitPhase[];
    createdAt: string;
}

interface ReadinessIndex {
    technical: number;
    behavioral: number;
    experience: number;
    overall: number;
    gapAnalysis: string;
}

export function CareerOrbit({ studentId }: { studentId: string }) {
    const [audit, setAudit] = useState<CareerAudit | null>(null);
    const [readiness, setReadiness] = useState<ReadinessIndex | null>(null);
    const [loading, setLoading] = useState(true);
    const [isTriggering, setIsTriggering] = useState(false);
    const { toast: toastData, showToast, hideToast } = useToast();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [auditRes, readinessRes] = await Promise.all([
                axios.get(`/api/v2/career-intelligence/${studentId}/audit-history`),
                axios.get(`/api/v2/career-intelligence/${studentId}/readiness`)
            ]);

            if (auditRes.data.success && auditRes.data.data.length > 0) {
                setAudit(auditRes.data.data[0]);
            }
            if (readinessRes.data.success) {
                setReadiness(readinessRes.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch career data:', error);
            showToast('error', "Could not retrieve your latest career intelligence.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [studentId]);

    const handleTriggerAudit = async () => {
        try {
            setIsTriggering(true);
            const res = await axios.post('/api/v2/career-intelligence/audit', { studentId });
            if (res.data.success) {
                setAudit(res.data.data);
                showToast('success', `New career track identified: ${res.data.data.careerTrack}`);
            }
        } catch (error) {
            showToast('error', "AI generation failed. Please try again later.");
        } finally {
            setIsTriggering(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                    <Rocket className="w-12 h-12 text-cyan-400 opacity-50" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4">
            <Toast toast={toastData} onClose={hideToast} />
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                        Career Orbit
                    </h1>
                    <p className="text-slate-400">AI-driven industrial readiness & growth pathing</p>
                </div>
                <Button 
                    onClick={handleTriggerAudit} 
                    disabled={isTriggering}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full px-8 py-6 h-auto transition-all transform hover:scale-105"
                >
                    {isTriggering ? (
                        <>
                            <Activity className="mr-2 h-5 w-5 animate-spin" />
                            Calculating...
                        </>
                    ) : (
                        <>
                            <BrainCircuit className="mr-2 h-5 w-5" />
                            Trigger AI Career Audit
                        </>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Readiness Index Card */}
                <Card className="lg:col-span-1 bg-slate-900/50 backdrop-blur-2xl border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                            <Target className="w-6 h-6 text-cyan-400" />
                            Readiness Index
                        </CardTitle>
                        <CardDescription>Multi-dimensional industry alignment</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 relative z-10">
                        {readiness && (
                            <>
                                <div className="flex flex-col items-center">
                                    <div className="relative w-48 h-48 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="96"
                                                cy="96"
                                                r="80"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                fill="transparent"
                                                className="text-slate-800"
                                            />
                                            <motion.circle
                                                cx="96"
                                                cy="96"
                                                r="80"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                fill="transparent"
                                                strokeDasharray={502.4}
                                                initial={{ strokeDashoffset: 502.4 }}
                                                animate={{ strokeDashoffset: 502.4 - (502.4 * readiness.overall) / 100 }}
                                                transition={{ duration: 2, ease: "easeOut" }}
                                                className="text-cyan-500"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center">
                                            <span className="text-4xl font-black text-white">{readiness.overall}%</span>
                                            <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">Industry Ready</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400 flex items-center gap-2">
                                                <Cpu className="w-4 h-4" /> Technical Score
                                            </span>
                                            <span className="text-white font-medium">{readiness.technical}%</span>
                                        </div>
                                        <Progress value={readiness.technical} className="h-2 bg-slate-800" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400 flex items-center gap-2">
                                                <Zap className="w-4 h-4" /> Behavioral
                                            </span>
                                            <span className="text-white font-medium">{readiness.behavioral}%</span>
                                        </div>
                                        <Progress value={readiness.behavioral} className="h-2 bg-slate-800" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4" /> Experience
                                            </span>
                                            <span className="text-white font-medium">{readiness.experience}%</span>
                                        </div>
                                        <Progress value={readiness.experience} className="h-2 bg-slate-800" />
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
                                    <p className="text-sm text-cyan-200/80 leading-relaxed italic">
                                        "{readiness.gapAnalysis}"
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Career Growth Orbit Card */}
                <Card className="lg:col-span-2 bg-slate-900/50 backdrop-blur-2xl border-white/5 rounded-[2.5rem] shadow-2xl relative">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                                <Rocket className="w-6 h-6 text-purple-400" />
                                Growth Orbit
                            </CardTitle>
                            <CardDescription>Recommended pathway for your profile</CardDescription>
                        </div>
                        {audit && <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-1">
                            {audit.careerTrack}
                        </Badge>}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {audit ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-slate-800/40 border border-white/5">
                                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-4">Immediate Milestone</h3>
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
                                                <Award className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-white">{audit.nextMilestone.title}</h4>
                                                <Badge className="mt-1 bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                                    {audit.nextMilestone.difficulty} Difficulty
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-widest">Skill Gaps to Address</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {audit.skillGap.map((skill, idx) => (
                                                <Badge key={idx} variant="outline" className="px-4 py-1.5 rounded-full border-white/10 bg-white/5 text-slate-300 font-normal">
                                                    <AlertCircle className="w-3 h-3 mr-2 text-red-400" />
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 relative">
                                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-widest px-2">Path Milestones</h3>
                                    <div className="space-y-0 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-purple-500 before:via-cyan-500 before:to-transparent">
                                        {audit.growthOrbit.map((step, idx) => (
                                            <motion.div 
                                                key={idx}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="relative pl-16 py-4"
                                            >
                                                <div className="absolute left-[26px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-900 border-2 border-cyan-400 z-10 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{step.phase}</span>
                                                        <Badge variant="outline" className="text-[10px] uppercase font-bold border-cyan-500/30 text-cyan-400 px-2 py-0">
                                                            {step.badge}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-300 font-medium">{step.focus}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                                <ShieldCheck className="w-16 h-16 text-slate-700 mb-4" />
                                <h3 className="text-lg font-medium text-slate-400">No Career Path Found</h3>
                                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                    Trigger an AI career audit to discover your optimal industry track and growth trajectory.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
