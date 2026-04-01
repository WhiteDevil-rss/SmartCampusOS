'use client';

import { useEffect, useState, useCallback } from 'react';
import { RiskRadar } from './risk-radar';
import { InterventionHub } from './intervention-hub';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    ShieldAlert, 
    Sparkles, 
    RefreshCw,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function SentinelPanel() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSentinel = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const endpoint = isRefresh ? '/v2/analytics/sentinel?refresh=true' : '/v2/analytics/sentinel';
            const response = await api.get(endpoint);
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch Sentinel data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchSentinel();
    }, [fetchSentinel]);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-[280px] w-full rounded-3xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter text-slate-100 italic flex items-center gap-2">
                            Academic Health Sentinel
                            {refreshing && <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />}
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                            AI-Powered Early Warning System • Powered by llama3.2
                        </p>
                    </div>
                </div>

                <Button 
                    variant="ghost" 
                    size="sm"
                    disabled={refreshing}
                    onClick={() => fetchSentinel(true)}
                    className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-500/30 text-[10px] uppercase font-black tracking-widest"
                >
                    <Activity className="w-3 h-3 mr-2" />
                    Recalculate Vitality
                </Button>
            </div>

            {data.risk ? (
                <RiskRadar 
                    score={data.risk.score}
                    level={data.risk.riskLevel}
                    factors={data.risk.factors}
                />
            ) : (
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl text-center">
                    <p className="text-sm text-slate-400">No baseline analysis available yet. Recalculate to generate initial risk profile.</p>
                </div>
            )}

            <div className="space-y-6">
                <div className="flex items-center gap-2 px-1">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 italic">
                        Prescribed Interventions
                    </h3>
                </div>
                <InterventionHub 
                    interventions={data.interventions} 
                    onUpdate={() => fetchSentinel(true)}
                />
            </div>
        </div>
    );
}
