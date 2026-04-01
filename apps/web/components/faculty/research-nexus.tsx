'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, 
    Trophy, 
    TrendingUp, 
    FileText, 
    ExternalLink, 
    Plus, 
    Sparkles, 
    Zap,
    Search,
    ChevronRight,
    Loader2,
    DollarSign,
    Award
} from 'lucide-react';
import { GlassCard } from '@/components/v2/shared/cards';
import { IndustrialButton } from '@/components/v2/shared/inputs';
import { 
    getResearchNexus, 
    analyzeImpact, 
    ResearchNexusData, 
    ImpactAnalysis 
} from '@/lib/services/research-service';
import { cn } from '@/lib/utils';

export const ResearchNexus = () => {
    const [data, setData] = useState<ResearchNexusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [abstract, setAbstract] = useState('');
    const [impactAnalysis, setImpactAnalysis] = useState<ImpactAnalysis | null>(null);

    useEffect(() => {
        const fetchNexus = async () => {
            try {
                const res = await getResearchNexus();
                setData(res);
            } catch (err) {
                console.error('Failed to fetch research nexus:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNexus();
    }, []);

    const handleAnalyze = async () => {
        if (!abstract) return;
        setAnalyzing(true);
        try {
            const result = await analyzeImpact(abstract);
            setImpactAnalysis(result);
        } catch (err) {
            console.error('Impact analysis failed:', err);
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'h-Index', value: data?.stats.hIndex || 0, icon: Trophy, color: 'text-amber-500' },
                    { label: 'Citations', value: data?.stats.totalCitations || 0, icon: TrendingUp, color: 'text-emerald-500' },
                    { label: 'Impact Score', value: data?.stats.researchImpactScore || 0, icon: Sparkles, color: 'text-primary' },
                    { label: 'Publications', value: data?.stats.totalPublications || 0, icon: BookOpen, color: 'text-purple-500' },
                ].map((stat, i) => (
                    <GlassCard key={i} className="p-4 border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg bg-white/5", stat.color)}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                                <p className="text-xl font-black text-slate-100 font-space-grotesk">{stat.value}</p>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Publications */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Recent Output
                        </h3>
                        <IndustrialButton variant="ghost" size="sm" className="text-[10px] uppercase font-black tracking-widest h-8">
                            View All <ChevronRight className="ml-1 w-3 h-3" />
                        </IndustrialButton>
                    </div>
                    
                    <div className="space-y-3">
                        {data?.publications && data.publications.length > 0 ? (
                            data.publications.slice(0, 3).map((pub) => (
                                <GlassCard key={pub.id} className="p-5 border-white/5 hover:border-primary/30 transition-all duration-300 group">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <h4 className="text-base font-black text-slate-200 group-hover:text-primary transition-colors">
                                                {pub.title}
                                            </h4>
                                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                                                {pub.journal || 'Independent Release'} • {new Date(pub.publicationDate).getFullYear()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Citations</span>
                                                <span className="text-sm font-black text-emerald-500">{pub.citationsCount}</span>
                                            </div>
                                            {pub.doi && (
                                                <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 text-slate-400 hover:text-primary transition-all">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            ))
                        ) : (
                            <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                                <p className="text-sm text-slate-500 font-medium italic">No publications recorded in the current nexus.</p>
                            </div>
                        )}
                    </div>

                    {/* Active Grants */}
                    <div className="pt-4 space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Active Funding
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data?.grants && data.grants.filter(g => g.status === 'ACTIVE').length > 0 ? (
                                data.grants.filter(g => g.status === 'ACTIVE').map(grant => (
                                    <GlassCard key={grant.id} className="p-5 border-emerald-500/10 bg-emerald-500/[0.02]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <Award className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-200 truncate max-w-[150px]">{grant.title}</h4>
                                                <p className="text-[10px] font-black text-emerald-500/80 uppercase">
                                                    ${grant.amount.toLocaleString()} • {grant.agency}
                                                </p>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))
                            ) : (
                                <GlassCard className="p-5 border-white/5 bg-white/[0.01] flex items-center gap-4 grayscale opacity-50">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Awaiting Grant Dispersal</p>
                                </GlassCard>
                            )}
                        </div>
                    </div>
                </div>

                {/* AI Impact Predictor Card */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
                        <Zap className="w-4 h-4" /> AI Impact Engine
                    </h3>
                    <GlassCard className="p-8 border-primary/20 bg-primary/[0.03] space-y-6 flex flex-col h-full min-h-[400px]">
                        <div className="space-y-2">
                            <p className="text-xs font-black text-primary/70 uppercase tracking-widest">Predictive Analysis</p>
                            <h4 className="text-xl font-black text-slate-100 font-space-grotesk leading-none">Impact Forecaster</h4>
                            <p className="text-[10px] text-slate-500 font-medium">Paste your abstract below to simulate academic resonance.</p>
                        </div>

                        <div className="flex-1 space-y-4">
                            <textarea 
                                value={abstract}
                                onChange={(e) => setAbstract(e.target.value)}
                                placeholder="Enter abstract keywords or summary..."
                                className="w-full h-32 bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-xs text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-primary/40 transition-all resize-none"
                            />

                            <IndustrialButton 
                                onClick={handleAnalyze}
                                disabled={analyzing || !abstract}
                                variant="primary" 
                                className="w-full py-6 h-auto uppercase font-black tracking-widest text-[10px] rounded-2xl shadow-[0_0_20px_rgba(57,193,239,0.1)] group"
                            >
                                {analyzing ? (
                                    <>Processing Neural Model <Loader2 className="ml-2 w-4 h-4 animate-spin" /></>
                                ) : (
                                    <>Simulate Impact <Sparkles className="ml-2 w-4 h-4 group-hover:scale-125 transition-transform" /></>
                                )}
                            </IndustrialButton>
                        </div>

                        <AnimatePresence mode="wait">
                            {impactAnalysis && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="pt-6 border-t border-white/5 space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Predicted Score</span>
                                        <span className="text-lg font-black text-primary italic">{impactAnalysis.predictedImpactScore}%</span>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Suggested Venues</span>
                                        <div className="flex flex-wrap gap-2">
                                            {impactAnalysis.suggestedJournals.map((j, i) => (
                                                <span key={i} className="px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase">
                                                    {j}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
