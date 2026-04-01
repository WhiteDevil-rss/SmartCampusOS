'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
    Activity, 
    TrendingUp, 
    ShieldAlert, 
    Zap, 
    AlertTriangle,
    BarChart3,
    Microscope,
    Loader2
} from "lucide-react";
import { motion } from "framer-motion";

interface DeptFinancial {
    departmentId: string;
    departmentName: string;
    budgetAllocation: number;
    operationalSpending: number;
    researchInflow: number;
    researchSpent: number;
    totalHealthScore: number;
}

interface Bottleneck {
    resourceType: string;
    probability: number;
    expectedDate: string;
    reason: string;
}

interface Forecast {
    forecastSummary: string;
    bottlenecks: Bottleneck[];
    recommendation: string;
}

export function InstitutionalWarRoom() {
    const [finances, setFinances] = useState<DeptFinancial[]>([]);
    const [forecast, setForecast] = useState<Forecast | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWarRoomData = async () => {
            try {
                const [finRes, foreRes] = await Promise.all([
                    fetch('/api/v2/institutional/overview'),
                    fetch('/api/v2/institutional/forecast/main-university') // Assuming default or fetch from context
                ]);
                
                const finData = await finRes.json();
                const foreData = await foreRes.json();
                
                setFinances(finData);
                setForecast(foreData);
            } catch (err) {
                console.error("Failed to load war-room data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWarRoomData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Synchronizing Global Institutional Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Institutional War-Room</h1>
                    <p className="text-muted-foreground">Cross-departmental fiscal health & AI resource forecasting</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-3 py-1 bg-green-500/10 text-green-500 border-green-500/20">
                        FISCAL STABILITY: OPTIMAL
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 bg-blue-500/10 text-blue-500 border-blue-500/20">
                        AI SATELLITE: ACTIVE
                    </Badge>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Global Metrics */}
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Research Inflow</CardTitle>
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${finances.reduce((acc, f) => acc + f.researchInflow, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">+12.5% from last quarter</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Operational Burn Rate</CardTitle>
                        <Activity className="w-4 h-4 text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${finances.reduce((acc, f) => acc + f.operationalSpending, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">42% of total allocation consumed</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Institutional Health Score</CardTitle>
                        <Zap className="w-4 h-4 text-indigo-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {finances.length > 0 
                                ? Math.round(finances.reduce((acc, f) => acc + f.totalHealthScore, 0) / finances.length) 
                                : 0}/100
                        </div>
                        <Progress 
                            value={finances.length > 0 ? (finances.reduce((acc, f) => acc + f.totalHealthScore, 0) / finances.length) : 0} 
                            className="h-1 mt-3" 
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 2. Departmental Table */}
                <Card className="bg-slate-950/40 border-slate-800 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Departmental Financial Standing
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {finances.map((dept) => (
                                <motion.div 
                                    key={dept.departmentId}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 rounded-lg border border-slate-800 bg-slate-900/40 flex items-center justify-between hover:bg-slate-900/60 transition-colors"
                                >
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-sm">{dept.departmentName}</h3>
                                        <div className="flex gap-4 text-xs text-muted-foreground">
                                            <span>Alloc: ${dept.budgetAllocation.toLocaleString()}</span>
                                            <span>Research In: ${dept.researchInflow.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className={`text-sm font-bold ${dept.totalHealthScore > 80 ? 'text-emerald-400' : dept.totalHealthScore > 60 ? 'text-amber-400' : 'text-red-400'}`}>
                                                {dept.totalHealthScore}%
                                            </div>
                                            <div className="text-[10px] uppercase opacity-50 tracking-wider font-medium">Health</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. AI resource Forecast */}
                <Card className="bg-slate-950/40 border-slate-800 backdrop-blur-xl">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Microscope className="w-5 h-5 text-indigo-400" />
                                AI Resource Bottleneck Analysis
                            </CardTitle>
                            <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-300 text-[10px] border-indigo-500/20">
                                90-DAY HORIZON
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {forecast && (
                            <>
                                <div className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20 border-dashed">
                                    <p className="text-sm leading-relaxed text-indigo-100 flex items-start gap-2">
                                        <ShieldAlert className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                                        {forecast.forecastSummary}
                                    </p>
                                </div>
                                
                                <div className="space-y-4">
                                    {forecast.bottlenecks.map((b, i) => (
                                        <div key={i} className="flex gap-4 p-3 rounded bg-slate-900/50 border border-slate-800">
                                            <div className={`w-1 shrink-0 rounded-full ${b.probability > 70 ? 'bg-red-500' : 'bg-amber-500'}`} />
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between w-full min-w-[200px]">
                                                    <span className="font-bold text-sm text-slate-200">{b.resourceType}</span>
                                                    <Badge variant="outline" className="text-[10px]">{b.probability}% Risk</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{b.reason}</p>
                                                <div className="text-[10px] text-slate-500 uppercase font-mono mt-1">Expected: {new Date(b.expectedDate).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Zap className="w-3 h-3" />
                                        R_FORECAST_ACTION_ADVICE
                                    </h4>
                                    <p className="text-sm text-emerald-100/80 italic">"{forecast.recommendation}"</p>
                                </div>
                            </>
                        )}
                        {!forecast && (
                            <div className="flex flex-col items-center justify-center p-12 text-center border-slate-800 border-2 border-dashed rounded-xl grayscale opacity-50">
                                <AlertTriangle className="w-10 h-10 mb-2" />
                                <p className="text-sm">No predictive data synthesized yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
