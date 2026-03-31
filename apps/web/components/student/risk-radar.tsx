'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
    Activity, 
    ShieldAlert, 
    ShieldCheck, 
    TrendingDown, 
    TrendingUp,
    Zap
} from 'lucide-react';

interface Factor {
    label: string;
    impact: 'POSITIVE' | 'NEGATIVE';
    description: string;
}

interface RiskRadarProps {
    score: number;
    level: 'SAFE' | 'AT_RISK' | 'CRITICAL';
    factors: Factor[];
}

export function RiskRadar({ score, level, factors }: RiskRadarProps) {
    const isCrisis = level === 'CRITICAL';
    const isWarning = level === 'AT_RISK';

    const levelColor = isCrisis 
        ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' 
        : isWarning 
            ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' 
            : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';

    return (
        <Card className="glass-card p-8 border-slate-200 dark:border-white/5 bg-white/40 dark:bg-black/20 overflow-hidden relative">
            {/* Background Glows */}
            <div className={cn(
                "absolute -top-20 -right-20 w-64 h-64 blur-[100px] rounded-full transition-colors duration-1000",
                isCrisis ? "bg-rose-500/20" : isWarning ? "bg-amber-500/20" : "bg-emerald-500/20"
            )} />

            <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                {/* Circular Sentinel Gauge */}
                <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="relative w-48 h-48">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="transparent"
                                className="text-slate-100 dark:text-white/5"
                            />
                            <motion.circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={552}
                                initial={{ strokeDashoffset: 552 }}
                                animate={{ strokeDashoffset: 552 - (552 * score) / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className={cn(
                                    isCrisis ? "text-rose-500" : isWarning ? "text-amber-500" : "text-emerald-500",
                                    "drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                                )}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white italic">{score}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Risk Index</span>
                        </div>
                    </div>

                    <div className={cn(
                        "px-4 py-2 rounded-full border subpixel-antialiased flex items-center gap-2",
                        levelColor
                    )}>
                        {isCrisis ? <ShieldAlert className="w-4 h-4" /> : isWarning ? <Activity className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        <span className="text-xs font-black uppercase tracking-widest">{level} STATUS</span>
                    </div>
                </div>

                {/* Risk Factors Breakdown */}
                <div className="flex-grow space-y-8">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white italic flex items-center gap-2">
                            Academic Sentinel Intelligence
                            <Zap className="w-4 h-4 text-indigo-400" />
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Momentum & Risk Breakdown</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {factors.map((f, idx) => (
                            <motion.div 
                                key={f.label}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + idx * 0.1 }}
                                className="p-4 rounded-2xl bg-white/20 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-indigo-500/20 transition-all group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-indigo-400 transition-colors">
                                        {f.label}
                                    </span>
                                    {f.impact === 'POSITIVE' ? (
                                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3 text-rose-500" />
                                    )}
                                </div>
                                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                    {f.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}
