'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    TrendingUp, 
    AlertTriangle, 
    DollarSign, 
    Building2, 
    Plus,
    RefreshCw,
    Download,
    Filter,
    ShieldCheck
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer, 
    Cell,
    LineChart,
    Line,
    Legend
} from 'recharts';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';

export default function InstitutionalDashboard() {
    const { user } = useAuthStore();
    const [financeData, setFinanceData] = useState<any[]>([]);
    const [forecastData, setForecastData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const universityId = user?.universityId || 'b76a8c7f-698a-489c-9e8e-a4c86b4bbe83'; // Fallback to seed if not logged in for demo

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const [finRes, forecastRes] = await Promise.all([
                api.get(`/institutional/overview/${universityId}`),
                api.get(`/institutional/forecast/${universityId}`)
            ]);
            setFinanceData(finRes.data);
            setForecastData(forecastRes.data);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [universityId]);

    const totalBudget = financeData.reduce((acc, curr) => acc + curr.budgetAllocation, 0);
    const totalSpent = financeData.reduce((acc, curr) => acc + curr.operationalSpending, 0);
    const totalResearch = financeData.reduce((acc, curr) => acc + curr.researchInflow, 0);
    const avgHealth = financeData.length > 0 
        ? Math.round(financeData.reduce((acc, curr) => acc + curr.totalHealthScore, 0) / financeData.length)
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                    <RefreshCw className="w-8 h-8 text-blue-500" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-6 lg:p-10 font-inter">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                        Institutional Governance
                    </h1>
                    <p className="text-slate-400 flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Comprehensive Financial & Resource Intelligence
                    </p>
                </motion.div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        variant="glass" 
                        size="sm" 
                        className="bg-slate-900/50 border-slate-800"
                        onClick={fetchData}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20">
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </header>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Total Allocation', value: `$${(totalBudget/1e6).toFixed(1)}M`, icon: DollarSign, color: 'text-emerald-400' },
                    { label: 'Operational Spend', value: `$${(totalSpent/1e6).toFixed(1)}M`, icon: TrendingUp, color: 'text-amber-400' },
                    { label: 'Research Grants', value: `$${(totalResearch/1e6).toFixed(1)}M`, icon: ShieldCheck, color: 'text-blue-400' },
                    { label: 'System Health', value: `${avgHealth}%`, icon: AlertTriangle, color: avgHealth > 70 ? 'text-emerald-400' : 'text-amber-400' }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <GlassCard className="p-6 border-slate-800 hover:border-blue-500/50 transition-colors group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 rounded-lg bg-slate-900 shadow-inner group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <Badge variant="glass" className="bg-slate-900/50">+2.4%</Badge>
                            </div>
                            <h3 className="text-slate-400 text-sm font-medium">{stat.label}</h3>
                            <div className="text-2xl font-bold mt-1">{stat.value}</div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Resource Forecast Chart */}
                <GlassCard className="lg:col-span-2 p-8 border-slate-800 bg-slate-900/20">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-semibold mb-1">Resource Bottleneck Forecast</h2>
                            <p className="text-sm text-slate-400">AI-predicted utilization peaks for the next 7 days</p>
                        </div>
                        <Badge variant="glass" className="bg-amber-950/20 text-amber-500 border-amber-900/50">
                            Predictive Insights Active
                        </Badge>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={forecastData?.bottleneckAlerts || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="resourceName" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                />
                                <Bar dataKey="utilization" radius={[6, 6, 0, 0]}>
                                    {(forecastData?.bottleneckAlerts || []).map((entry: any, index: number) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.utilization > 80 ? '#f43f5e' : entry.utilization > 50 ? '#f59e0b' : '#3b82f6'} 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Audit & Compliance Sidebar */}
                <GlassCard className="p-8 border-slate-800 bg-slate-900/20 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                            Security & Audits
                        </h2>
                        
                        <div className="space-y-6">
                            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-400">Grant Compliance Rate</span>
                                    <span className="text-sm font-bold text-emerald-400">98.2%</span>
                                </div>
                                <Progress value={98.2} className="h-1.5 bg-slate-800" indicatorColor="bg-emerald-500" />
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-400">Identity Risk Score</span>
                                    <span className="text-sm font-bold text-blue-400">Low</span>
                                </div>
                                <div className="flex gap-1 mt-2">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`h-1 w-full rounded-full ${i <= 1 ? 'bg-blue-500' : 'bg-slate-800'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Separator className="my-8 bg-slate-800" />

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Live AI Analysis</h4>
                            <div className="flex gap-3 text-sm text-slate-400">
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                <p>Unusual resource booking peak detected in Dept: CS. High collision risk for Wednesday PM.</p>
                            </div>
                        </div>
                    </div>

                    <Button variant="secondary" className="w-full mt-8 bg-slate-800 hover:bg-slate-700 text-white border-0">
                        View Audit Logs
                    </Button>
                </GlassCard>
            </div>

            {/* Department Breakdown Table */}
            <GlassCard className="p-8 border-slate-800 bg-slate-900/20 overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">Department Health & Budget</h2>
                    <div className="flex gap-2">
                        <Button variant="glass" size="sm" className="bg-slate-800/50">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-800 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-900/80">
                            <TableRow className="border-slate-800 hover:bg-transparent">
                                <TableHead className="text-slate-400">Department Name</TableHead>
                                <TableHead className="text-slate-400">Budget Allocation</TableHead>
                                <TableHead className="text-slate-400">Current Spend</TableHead>
                                <TableHead className="text-slate-400">Research Inflow</TableHead>
                                <TableHead className="text-slate-400">Efficiency Score</TableHead>
                                <TableHead className="text-slate-400 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {financeData.map((dept, index) => (
                                <TableRow key={dept.departmentId} className="border-slate-800 hover:bg-slate-900/40">
                                    <TableCell className="font-medium text-slate-200">{dept.departmentName}</TableCell>
                                    <TableCell>${dept.budgetAllocation.toLocaleString()}</TableCell>
                                    <TableCell className="text-slate-400">${dept.operationalSpending.toLocaleString()}</TableCell>
                                    <TableCell className="text-blue-400 font-medium">${dept.researchInflow.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-bold ${dept.totalHealthScore > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {dept.totalHealthScore}%
                                            </span>
                                            <div className="w-24 bg-slate-800 rounded-full h-1.5 hidden md:block">
                                                <div 
                                                    className={`h-full rounded-full ${dept.totalHealthScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                                    style={{ width: `${dept.totalHealthScore}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="hover:bg-slate-800">Review</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </GlassCard>
        </div>
    );
}
