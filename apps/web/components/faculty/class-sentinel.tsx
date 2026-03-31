import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { GlassCard } from '@/components/v2/shared/cards';
import { IndustrialButton } from '@/components/v2/shared/inputs';
import { 
    AlertCircle, 
    TrendingUp, 
    Sparkles, 
    ChevronRight, 
    CheckCircle2,
    BarChart3,
    Zap,
    Users,
    Lightbulb,
    Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BulkInterventionModal } from '@/components/v2/dashboard/bulk-intervention-modal';
import { PolicySimulator } from './policy-simulator';

interface ClassSentinelProps {
    courseId: string;
    courseName: string;
}

export function ClassSentinel({ courseId, courseName }: ClassSentinelProps) {
    const [insights, setInsights] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('CRITICAL');
    const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);

    const fetchInsights = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/v2/analytics/faculty/class-insights/${courseId}`);
            setInsights(res.data);
            // Default to CRITICAL if exists, otherwise HIGH, etc.
            const levels = ['CRITICAL', 'HIGH', 'MEDIUM', 'SAFE'];
            const firstActive = levels.find(l => res.data.analytics.riskDistribution[l] > 0);
            if (firstActive) setSelectedRiskLevel(firstActive);
        } catch (error) {
            console.error('Failed to fetch class insights:', error);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchInsights();
    }, [fetchInsights]);

    if (loading) {
        return <Skeleton className="h-[400px] w-full rounded-[3rem] bg-white/5" />;
    }

    if (!insights) return null;

    const { analytics, aiInsights } = insights;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-100 flex items-center gap-3">
                        <BarChart3 className="w-6 h-6 text-primary" />
                        Class Sentinel: {courseName}
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">
                        Neural Performance Audit • {analytics.totalStudents} Cadets Enrolled
                    </p>
                </div>
                
                <Badge className={cn(
                    "px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest",
                    aiInsights.urgency === 'HIGH' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                    aiInsights.urgency === 'MEDIUM' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                )}>
                    Urgency: {aiInsights.urgency}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Risk Distribution Heatmap */}
                <GlassCard className="p-8 border-white/5 bg-white/2 overflow-hidden flex flex-col justify-between">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Risk Distribution</span>
                        </div>
                        
                        <div className="space-y-4">
                            {Object.entries(analytics.riskDistribution).map(([level, count]: [string, any]) => (
                                <button 
                                    key={level} 
                                    onClick={() => setSelectedRiskLevel(level)}
                                    className={cn(
                                        "w-full text-left space-y-1.5 p-2 rounded-xl transition-all",
                                        selectedRiskLevel === level ? "bg-white/5 ring-1 ring-white/10" : "hover:bg-white/2"
                                    )}
                                >
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                                        <span className={cn(
                                            level === 'CRITICAL' ? 'text-rose-500' :
                                            level === 'HIGH' ? 'text-orange-500' :
                                            level === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'
                                        )}>{level}</span>
                                        <span className="text-slate-400">{count} Students</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(count / analytics.totalStudents) * 100}%` }}
                                            className={cn(
                                                "h-full rounded-full shadow-[0_0_10px]",
                                                level === 'CRITICAL' ? 'bg-rose-500 shadow-rose-500/50' :
                                                level === 'HIGH' ? 'bg-orange-500 shadow-orange-500/50' :
                                                level === 'MEDIUM' ? 'bg-amber-500 shadow-amber-500/50' : 'bg-emerald-500 shadow-emerald-500/50'
                                            )}
                                        />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 space-y-3">
                        <div className="flex items-center justify-between px-2">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Selected Segment</p>
                            <Badge variant="outline" className="text-[9px] border-white/10 text-slate-400 font-black">
                                {analytics.riskDistribution[selectedRiskLevel]} TARGETS
                            </Badge>
                        </div>
                        <IndustrialButton 
                            variant="primary" 
                            size="md" 
                            className="w-full rounded-xl uppercase font-black text-[10px] tracking-widest shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]"
                            onClick={() => setIsInterventionModalOpen(true)}
                            disabled={!analytics.riskSegments?.[selectedRiskLevel]?.length}
                        >
                            Segmented Broadcast <Send className="ml-2 w-3 h-3" />
                        </IndustrialButton>
                    </div>
                </GlassCard>

                {/* AI Pedagogical Prescriptions */}
                <GlassCard className="lg:col-span-2 p-8 border-primary/20 bg-primary/[0.02] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] pointer-events-none" />
                    
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <h4 className="text-lg font-black uppercase tracking-tighter text-slate-100">AI Pedagogical Navigator</h4>
                        </div>

                        <p className="text-sm font-medium text-slate-400 leading-relaxed italic">
                            "{aiInsights.summary}"
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {aiInsights.strategies.map((strategy: any, i: number) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-xl bg-primary/10 text-primary mt-1">
                                            <Lightbulb className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-200 group-hover:text-primary transition-colors">
                                                {strategy.title}
                                            </h5>
                                            <p className="text-[10px] font-medium text-slate-500 mt-2 leading-relaxed">
                                                {strategy.description}
                                            </p>
                                            <div className="mt-3 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                <span className="text-[9px] font-black uppercase tracking-tighter text-emerald-500/80">
                                                    Target: {strategy.impact}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            </div>

            <PolicySimulator 
                classId={courseId}
                initialData={{
                    SAFE: analytics.riskDistribution.SAFE || 0,
                    AT_RISK: analytics.riskDistribution.AT_RISK || ((analytics.riskDistribution.HIGH || 0) + (analytics.riskDistribution.MEDIUM || 0)),
                    CRITICAL: analytics.riskDistribution.CRITICAL || 0
                }}
            />

            <BulkInterventionModal 
                isOpen={isInterventionModalOpen}
                onClose={() => setIsInterventionModalOpen(false)}
                studentIds={analytics.riskSegments?.[selectedRiskLevel] || []}
                riskLevel={selectedRiskLevel}
                courseName={courseName}
            />
        </div>
    );
}
