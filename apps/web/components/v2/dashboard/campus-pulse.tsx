"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  ShieldAlert, 
  TrendingUp, 
  Zap, 
  Layers, 
  BarChart3, 
  Settings2,
  ChevronRight,
  Info,
  RefreshCcw,
  Target,
  FlaskConical
} from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/v2/shared/cards';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface RiskFactor {
  id: string;
  name: string;
  weight: number;
}

interface RiskImpact {
  category: string;
  score: number;
}

interface DepartmentRisk {
  departmentId: string;
  normalizedScore: number;
  level: 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW';
  factors: RiskFactor[];
  impacts: RiskImpact[];
}

interface CampusPulseProps {
  departmentId?: string;
  className?: string;
}

export const CampusPulse: React.FC<CampusPulseProps> = ({ departmentId, className }) => {
  const [riskData, setRiskData] = useState<DepartmentRisk | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSimulation, setActiveSimulation] = useState(false);
  const [policyWeights, setPolicyWeights] = useState({
    attendance: 40,
    academic: 35,
    engagement: 25
  });

  const fetchRiskData = useCallback(async () => {
    if (!departmentId) return;
    setLoading(true);
    try {
      const res = await api.get(`/v2/analytics/admin/department-risk-map/${departmentId}`);
      setRiskData(res.data);
    } catch (error) {
      console.error("Failed to fetch risk map:", error);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchRiskData();
  }, [fetchRiskData]);

  const toggleSimulation = () => {
    setActiveSimulation(!activeSimulation);
  };

  const handleWeightChange = (key: keyof typeof policyWeights, value: number) => {
    setPolicyWeights(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'EXTREME': return 'text-rose-500 border-rose-500/20 bg-rose-500/10';
      case 'HIGH': return 'text-orange-500 border-orange-500/20 bg-orange-500/10';
      case 'MODERATE': return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10';
      case 'LOW': return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10';
      default: return 'text-slate-500 border-slate-500/20 bg-slate-500/10';
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 80) return 'from-rose-500 to-orange-500';
    if (score > 60) return 'from-orange-400 to-yellow-500';
    if (score > 40) return 'from-yellow-400 to-emerald-400';
    return 'from-emerald-500 to-teal-500';
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <Activity className="w-6 h-6 text-primary relative z-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100 uppercase italic font-space-grotesk tracking-tight">Institutional Pulse</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time Departmental Risk Telemetry</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={toggleSimulation}
             className={cn(
               "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 border shadow-lg",
               activeSimulation 
                ? "bg-primary text-white border-primary shadow-primary/20" 
                : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
             )}
           >
             <FlaskConical className={cn("w-3 h-3", activeSimulation && "animate-bounce")} />
             {activeSimulation ? "Active Simulation" : "Policy Playground"}
           </button>
           <button 
             onClick={fetchRiskData}
             className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-slate-100 hover:bg-white/10 transition-all"
           >
             <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Gauge */}
        <GlassCard className="rounded-[2.5rem] border-primary/10 overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
            <Target className="w-24 h-24 text-primary -mr-8 -mt-8 rotate-12" />
          </div>
          <GlassCardHeader className="pb-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Safety Index</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-black text-slate-100 font-space-grotesk">
                {loading ? "..." : riskData ? 100 - riskData.normalizedScore : "--"}
              </h3>
              <span className="text-xs font-bold text-slate-500">/ 100</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 italic">Inverse mortality projection based on {riskData?.factors.length || 0} vectors</p>
          </GlassCardHeader>
          <GlassCardContent className="pt-4">
            <div className="relative h-4 w-full bg-slate-900/50 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${loading ? 0 : riskData ? 100 - riskData.normalizedScore : 0}%` }}
                className={cn("absolute inset-y-0 left-0 bg-gradient-to-r transition-all duration-1000", 
                  getScoreColor(riskData?.normalizedScore || 0)
                )}
              />
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Risk Level</span>
                <span className={cn("px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest", 
                  getLevelColor(riskData?.level || '')
                )}>
                  {riskData?.level || 'NOMINAL'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {riskData?.level === 'EXTREME' || riskData?.level === 'HIGH' 
                  ? "Critical intervention required in attendance and performance blocks." 
                  : "Department stability metrics are within acceptable thresholds."}
              </p>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Heatmap / Impact Vectors */}
        <GlassCard className="lg:col-span-2 rounded-[2.5rem] border-primary/10">
          <GlassCardHeader className="flex flex-row items-center justify-between p-8 pb-4">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-100 font-space-grotesk flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Impact Vectors
              </h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cross-sectional risk distribution</p>
            </div>
            
            <div className="flex gap-1">
               {['Visual', 'Data', 'Raw'].map(v => (
                 <button key={v} className="text-[9px] font-black px-2 py-1 rounded bg-white/5 text-slate-500 hover:text-slate-100 uppercase tracking-widest">
                   {v}
                 </button>
               ))}
            </div>
          </GlassCardHeader>
          <GlassCardContent className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-3xl bg-white/5 animate-pulse border border-white/5" />
                ))
              ) : (
                riskData?.impacts.map((impact) => (
                  <div 
                    key={impact.category}
                    className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center gap-3 group hover:border-primary/30 transition-all cursor-crosshair relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="text-2xl font-black text-slate-100 font-space-grotesk z-10">{impact.score}%</div>
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-center z-10 leading-tight">
                      {impact.category}
                    </div>
                    {impact.score > 15 && (
                      <div className="mt-2 w-full h-1 bg-slate-900/50 rounded-full overflow-hidden z-10">
                        <div className="h-full bg-rose-500" style={{ width: `${impact.score}%` }} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Simulation Overlay */}
            <AnimatePresence>
              {activeSimulation && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-8 p-6 rounded-3xl bg-primary/5 border border-primary/20 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Settings2 className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Policy Simulator Engine</span>
                    </div>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  
                  <div className="space-y-6">
                    {Object.entries(policyWeights).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                          <span className="text-slate-400">{key} Weight</span>
                          <span className="text-primary">{value}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={value}
                          onChange={(e) => handleWeightChange(key as any, parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary border border-white/5"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <Zap className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">Stable Projection</span>
                    </div>
                    <button className="text-[10px] font-black text-slate-100 hover:text-white uppercase tracking-widest flex items-center gap-2 group">
                      Run Impact Analysis
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Underlying Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="rounded-[2.5rem] border-primary/10">
          <GlassCardContent className="p-6 flex items-center gap-6">
             <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <BarChart3 className="w-6 h-6 text-slate-400" />
             </div>
             <div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Correlation Velocity</h4>
                <p className="text-sm font-medium text-slate-200">Inter-departmental risk parity is <span className="text-emerald-500 italic">+4.2%</span> compared to last cycle.</p>
             </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard className="rounded-[2.5rem] border-primary/10">
           <GlassCardContent className="p-6 flex items-center gap-6">
             <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <ShieldAlert className="w-6 h-6 text-primary/60" />
             </div>
             <div className="flex-1">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Mitigation Strategy</h4>
                <div className="flex items-center justify-between">
                   <p className="text-sm font-medium text-slate-200">Broadcast support to <span className="text-primary font-black italic">14 AT_RISK</span> students?</p>
                   <button className="p-1 px-3 rounded-lg bg-primary/20 text-primary border border-primary/30 text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all">Execute</button>
                </div>
             </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
};
