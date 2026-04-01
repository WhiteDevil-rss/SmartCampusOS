'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, AlertTriangle, CheckCircle, 
    Zap, Settings, MapPin, Wrench, 
    RefreshCcw, AlertOctagon, Info
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { toast } from 'sonner';
import AssetPulse from '@/components/maintenance/AssetPulse';

interface Asset {
    id: string;
    name: string;
    type: string;
    location: string;
    status: 'OPERATIONAL' | 'WARNING' | 'CRITICAL' | 'MAINTENANCE';
    healthScore: number;
    lastService: string;
    tickets: any[];
}

interface HealthStats {
    total: number;
    critical: number;
    warning: number;
    operational: number;
    avgHealth: number;
    activeTickets: number;
}

export default function MaintenanceDashboard() {
// ... existing state/fetch ...
    const { user } = useAuthStore();
    const universityId = user?.universityId;
    const [stats, setStats] = useState<HealthStats | null>(null);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!universityId) return;
        try {
            const [healthRes, assetsRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v2/maintenance/health?universityId=${universityId}`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v2/maintenance/assets?universityId=${universityId}`)
            ]);
            
            const healthData = await healthRes.json();
            const assetsData = await assetsRes.json();
            
            setStats(healthData);
            setAssets(assetsData);
        } catch (error) {
            console.error('Failed to fetch maintenance data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // 30s poll
        return () => clearInterval(interval);
    }, [universityId]);

    const handleSimulate = async (assetId: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v2/maintenance/simulate/${assetId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dropAmount: 30 })
            });
            if (res.ok) {
                toast.success('Telemetry drop simulated. AI Sentinel monitoring...');
                fetchData();
            }
        } catch (error) {
            toast.error('Simulation failed');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPERATIONAL': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'WARNING': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'CRITICAL': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <RefreshCcw className="w-8 h-8 animate-spin text-blue-500" />
        </div>
    );

    return (
        <div className="min-h-screen p-8 bg-[#0a0b0d] text-slate-200">
            {/* Header */}
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Campus Health Sentinel
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Predictive Maintenance & IoT Fleet Intelligence</p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 flex gap-8">
                    <div className="text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fleet Health</p>
                        <p className={`text-2xl font-black mt-1 ${stats?.avgHealth && stats.avgHealth > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {stats?.avgHealth}%
                        </p>
                    </div>
                    <div className="w-px h-10 bg-slate-700" />
                    <div className="text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Tickets</p>
                        <p className="text-2xl font-black mt-1 text-blue-400">{stats?.activeTickets}</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Total Assets', value: stats?.total, icon: Activity, color: 'blue' },
                    { label: 'Operational', value: stats?.operational, icon: CheckCircle, color: 'emerald' },
                    { label: 'Warnings', value: stats?.warning, icon: AlertTriangle, color: 'amber' },
                    { label: 'Critical Failures', value: stats?.critical, icon: AlertOctagon, color: 'red' },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-colors"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 blur-3xl rounded-full -mr-8 -mt-8`} />
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-400 text-sm font-semibold">{stat.label}</p>
                                <h3 className="text-3xl font-black mt-2">{stat.value}</h3>
                            </div>
                            <stat.icon className={`w-8 h-8 text-${stat.color}-400/50`} />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Asset Grid */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Zap className="text-amber-400 w-5 h-5" />
                            Live Asset Web
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence mode="popLayout">
                            {assets.map((asset) => (
                                <motion.div
                                    layout
                                    key={asset.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-slate-900/80 backdrop-blur-lg border border-white/5 p-5 rounded-2xl group hover:shadow-2xl hover:shadow-blue-500/5 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-blue-500/10 rounded-xl">
                                                <Wrench className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-100">{asset.name}</h4>
                                                <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5 font-medium">
                                                    <MapPin className="w-3 h-3" />
                                                    {asset.location}
                                                </div>
                                            </div>
                                        </div>
                                        <AssetPulse status={asset.status} />
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Health Core</span>
                                            <span className={`font-black ${asset.healthScore > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {asset.healthScore}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${asset.healthScore}%` }}
                                                className={`h-full rounded-full ${
                                                    asset.healthScore < 30 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
                                                    asset.healthScore < 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                                }`} 
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${getStatusColor(asset.status)}`}>
                                            {asset.status}
                                        </span>
                                        <button 
                                            onClick={() => handleSimulate(asset.id)}
                                            className="text-[10px] text-slate-400 hover:text-red-400 font-bold uppercase tracking-widest transition-colors"
                                        >
                                            Simulate Failure
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* AI Sentinel Feed */}
                <div className="space-y-6">
                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 h-full">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-2 h-8 bg-blue-500 rounded-full" />
                            <h2 className="text-xl font-bold tracking-tight">AI Sentinel Intelligence</h2>
                        </div>

                        <div className="space-y-4">
                            {assets.flatMap(a => a.tickets).length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
                                    <CheckCircle className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-400 text-sm font-medium">No active repair tickets.<br/>Fleet is synchronized.</p>
                                </div>
                            ) : (
                                assets.flatMap(a => a.tickets).map((ticket, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={ticket.id}
                                        className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl ring-1 ring-white/5 shadow-lg shadow-black/20"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`p-1.5 rounded-lg ${
                                                ticket.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 
                                                ticket.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                                <Info className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-300">
                                                {ticket.severity} Alert
                                            </span>
                                            <span className="text-[10px] text-slate-500 ml-auto bg-slate-800 px-1.5 py-0.5 rounded">
                                                {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                            {ticket.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">AI Analysis In Progress...</span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
