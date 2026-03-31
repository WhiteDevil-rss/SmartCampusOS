'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    LuQuote, 
    LuSparkles, 
    LuHandHeart, 
    LuCircleCheck, 
    LuCircleAlert, 
    LuTrendingUp,
    LuTrophy,
    LuArrowRight
} from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast, Toast } from '@/components/ui/toast-alert';

interface Scholarship {
    id: string;
    name: string;
    provider: string;
    amount: number;
    description: string;
    aiMatch: {
        matchScore: number;
        matchingCriteria: string[];
        missingCriteria: string[];
        recommendation: string;
    } | null;
}

export function GrantMatcher() {
    const [scholarships, setScholarships] = useState<Scholarship[]>([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<string | null>(null);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        fetchGrants();
    }, []);

    const fetchGrants = async () => {
        try {
            const res = await api.get('/v2/fees/grants/eligible');
            setScholarships(res.data || []);
        } catch (error) {
            console.error('Failed to load grants:', error);
            showToast('error', 'Scholarship engine is currently offline');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (id: string) => {
        setApplying(id);
        try {
            await api.post('/v2/fees/grants/apply', { scholarshipId: id });
            showToast('success', 'Grant application transmitted successfully');
        } catch (error: any) {
            showToast('error', error.response?.data?.error || 'Transmission failure');
        } finally {
            setApplying(null);
        }
    };

    if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Skeleton className="h-64 rounded-3xl bg-surface" /></div>;

    if (scholarships.length === 0) {
        return (
            <Card className="p-12 border-dashed border-slate-200 dark:border-white/10 bg-transparent flex flex-col items-center justify-center text-center">
                <LuCircleAlert className="w-12 h-12 text-slate-300 mb-6" />
                <h3 className="text-lg font-black text-slate-500 uppercase tracking-widest leading-relaxed">No Grant Matches Found<br/><span className="text-xs italic font-medium opacity-60">Complete more profile details to trigger AI matching</span></h3>
            </Card>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {scholarships.map((s, idx) => (
                    <motion.div 
                        key={s.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="group glass-card overflow-hidden h-full flex flex-col relative border-slate-200 dark:border-white/5 bg-white/40 dark:bg-black/20 hover:border-indigo-400/30 transition-all">
                            {/* AI Score Badge */}
                            <div className="absolute top-0 right-0 p-4 z-10">
                                <div className={cn(
                                    "px-3 py-1.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border subpixel-antialiased shadow-xl",
                                    (s.aiMatch?.matchScore || 0) > 80 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                                )}>
                                    <LuTrendingUp className="w-3 h-3" />
                                    Match: {s.aiMatch?.matchScore || 0}%
                                </div>
                            </div>

                            {/* Header Section */}
                            <div className="p-6 pb-0 relative">
                                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -ml-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 w-fit mb-6">
                                    <LuTrophy className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-1">{s.name}</h4>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{s.provider}</p>
                            </div>

                            {/* Main Content */}
                            <div className="p-6 space-y-6 flex-grow">
                                <div className="space-y-4">
                                    <div className="flex items-baseline justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Reward</p>
                                            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic">₹{s.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed italic line-clamp-2">
                                        "{s.description || 'Institutional grant program for high-potential academic trajectories.'}"
                                    </p>
                                </div>

                                {s.aiMatch && (
                                    <div className="p-4 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/10 relative overflow-hidden">
                                        <div className="flex items-start gap-4">
                                            <div className="p-1 px-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                                                <LuQuote className="w-3 h-3 scale-x-[-1]" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">AI Coordinator Note</p>
                                                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                                    {s.aiMatch.recommendation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Action */}
                            <div className="p-6 pt-0 mt-auto">
                                <Button 
                                    onClick={() => handleApply(s.id)}
                                    disabled={applying === s.id}
                                    className="w-full h-12 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-400/50 hover:bg-indigo-400/5 text-slate-700 dark:text-slate-300 font-black uppercase tracking-widest text-xs group/btn transition-all flex items-center justify-center gap-2 rounded-2xl overflow-hidden relative shadow-none"
                                >
                                    <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover/btn:opacity-5 transition-opacity" />
                                    {applying === s.id ? <LuSparkles className="w-4 h-4 animate-spin" /> : <LuHandHeart className="w-4 h-4" />}
                                    {applying === s.id ? 'Securing application...' : 'Apply via Identity Hub'}
                                    <LuArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
            <Toast toast={toast} onClose={hideToast} />
        </div>
    );
}
