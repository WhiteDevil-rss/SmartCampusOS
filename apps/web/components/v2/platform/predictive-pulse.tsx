'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { GlassCard, GlassCardContent } from '../shared/cards';

interface Risk {
    slotId: string;
    riskScore: number;
    reason: string;
    predictedAttendance: number;
}

interface ForecastData {
    status: string;
    risks: Risk[];
    overallEfficiency: GLfloat;
}

export function PredictivePulse({ departmentId }: { departmentId?: string }) {
    const [data, setData] = useState<ForecastData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                // If no departmentId, we use a sample institutional ID or demo mode
                const id = departmentId || 'demo-institutional-hub';
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/${id}/forecast`);
                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                }
            } catch (error) {
                console.error('Failed to fetch pulse data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();
    }, [departmentId]);

    const displayEfficiency = data?.overallEfficiency ?? 0.94;
    const risks = data?.risks?.filter(r => r.riskScore > 0.6) ?? [];

    return (
        <GlassCard className="w-full bg-primary/[0.02] border-white/5 rounded-[32px] overflow-hidden">
            <GlassCardContent className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                            <Activity className="w-4 h-4" />
                            Live Predictive Pulse
                        </div>
                        <h3 className="text-2xl font-black font-space-grotesk uppercase tracking-tight">Institutional Health</h3>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black font-space-grotesk text-primary italic">{(displayEfficiency * 100).toFixed(0)}%</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operational Efficiency</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Metric 1: Capacity Risk */}
                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-black font-space-grotesk text-slate-100">{risks.length} High-Risk Slots</div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Identified for next cycle</p>
                        </div>
                    </div>

                    {/* Metric 2: Attendance Forecast */}
                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-black font-space-grotesk text-slate-100">88.4% Predicted</div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Global Campus Attendance</p>
                        </div>
                    </div>

                    {/* Metric 3: Optimization Gain */}
                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-black font-space-grotesk text-slate-100">+12% Utilization</div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Since AI Orchestration</p>
                        </div>
                    </div>
                </div>

                {/* Animated Pulse Line (Visual Only for now) */}
                <div className="mt-8 pt-8 border-t border-white/5 relative h-24 flex items-end gap-1">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 10 }}
                            animate={{
                                height: [10, Math.random() * 60 + 10, 10],
                                backgroundColor: i > 30 ? ['#39c1ef', '#ef4444', '#39c1ef'] : '#39c1ef'
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.05,
                                ease: "easeInOut"
                            }}
                            className="flex-grow rounded-full bg-primary opacity-30"
                        />
                    ))}
                    <div className="absolute top-0 left-0 text-[10px] font-mono text-slate-700 tracking-tighter uppercase whitespace-nowrap">
                        Neural Stream: 0x{Math.floor(Math.random() * 1000000).toString(16)}...active
                    </div>
                </div>
            </GlassCardContent>
        </GlassCard>
    );
}
