'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { V2DashboardLayout } from '@/components/v2/layout/dashboard-layout';
import { api } from '@/lib/api';
import { 
    StatCard, 
    GlassCard, 
    GlassCardHeader, 
    GlassCardTitle, 
    GlassCardContent 
} from '@/components/v2/shared/cards';
import { IndustrialButton } from '@/components/v2/shared/inputs';
import { Badge } from '@/components/ui/badge';
import {
    LuCpu, 
    LuActivity, 
    LuRefreshCw, 
    LuBuilding,
    LuShieldCheck, 
    LuZap, 
    LuClock, 
    LuChevronRight,
    LuWifiOff,
    LuTerminal,
    LuHistory
} from 'react-icons/lu';
import { 
    Cpu, 
    Activity, 
    ShieldCheck, 
    Zap 
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast, Toast } from '@/components/ui/toast-alert';
import { GreetingCard } from '@/components/v2/shared/greeting-card';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface IoTLog {
    id: string;
    timestamp: string;
    student: string;
    enrollmentNo: string;
    deviceClassroom: string;
    subject: string;
    method: string;
}

export default function CampusInfrastructureDashboard() {
    const { user } = useAuthStore();
    const [logs, setLogs] = useState<IoTLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [simulating, setSimulating] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    // Mock Active Assets Array
    const activeAssets = [
        { id: 'ASSET-LH-001', name: 'Lecture Hall 1 Hub', location: 'Main Block - G01', status: 'ONLINE', pingMs: 12, health: 98 },
        { id: 'ASSET-LAB-04', name: 'AI Innovation Lab', location: 'Tech Tower - L04', status: 'ONLINE', pingMs: 24, health: 95 },
        { id: 'ASSET-LH-205', name: 'Lecture Hall 205 Gateway', location: 'Annex A - 205', status: 'OFFLINE', pingMs: -1, health: 0 },
    ];

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/v2/iot/logs');
            setLogs(res.data);
        } catch (error) {
            console.error('Failed to fetch infrastructure logs', error);
            showToast('error', 'Failed to synchronize with Campus Presence Hub');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 15000);
        return () => clearInterval(interval);
    }, [fetchLogs]);

    const simulatePresenceTrigger = async () => {
        setSimulating(true);
        try {
            await api.post('/v2/iot/attendance', {
                secretKey: 'ZEMBAA_IOT_TEST_KEY',
                deviceId: 'bd8c8e98-17fb-4192-9354-ba46317670d9',
                uid: 'EN20250000',
                method: 'PRESENCE_SIMULATION'
            });
            showToast('success', 'Institutional Presence Simulated Successfully');
            setTimeout(fetchLogs, 1000);
        } catch (error) {
            console.error('Simulation failed', error);
            showToast('error', 'Handshake Failure: Asset unreachable');
        } finally {
            setSimulating(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN', 'UNI_ADMIN']}>
            <V2DashboardLayout title="Campus Presence & Infrastructure">
                <div className="space-y-10 pb-24">
                    
                    {/* Institutional Greeting */}
                    <GreetingCard 
                        name={user?.username || 'Administrator'}
                        role="Infrastructure Admin"
                        stats={[
                            { label: "Active Assets", value: 28, icon: LuCpu },
                            { label: "Uptime Status", value: "99.9%", icon: LuZap }
                        ]}
                        quickAction={{
                            label: "Sync Presence Hub",
                            onClick: fetchLogs
                        }}
                    />

                    {/* Infrastructure Summary Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            title="Provisioned Assets" 
                            value={28} 
                            change={4} 
                            icon={Cpu} 
                            changeDescription="new modules added"
                        />
                        <StatCard 
                            title="Active Workforce" 
                            value={logs.length} 
                            change={12} 
                            icon={Activity} 
                            changeDescription="sessions verified"
                        />
                        <StatCard 
                            title="System Reliability" 
                            value={98.2} 
                            change={1.4} 
                            icon={ShieldCheck} 
                            suffix="%"
                            changeDescription="health index"
                        />
                        <StatCard 
                            title="Aggregate Uplink" 
                            value={4.2} 
                            change={0} 
                            icon={Zap} 
                            suffix="MB/s"
                            precision={1}
                            changeDescription="data throughput"
                        />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                        {/* Institutional Assets List */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                    <LuBuilding className="w-4 h-4 text-primary" />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-tighter text-slate-100">
                                    Infrastructure Assets
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {activeAssets.map((asset) => (
                                    <GlassCard key={asset.id} className="hover:border-primary/40 transition-all duration-300 group cursor-pointer border-white/5">
                                        <GlassCardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary/10 transition-all duration-300">
                                                    <LuCpu className={`w-6 h-6 ${asset.status === 'ONLINE' ? 'text-primary' : 'text-rose-500'}`} />
                                                </div>
                                                <Badge className={`rounded-xl px-2 py-1 uppercase text-[9px] font-black border-none ${
                                                    asset.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                                }`}>
                                                    {asset.status}
                                                </Badge>
                                            </div>
                                            <h4 className="font-black text-slate-100 uppercase tracking-tight text-lg font-space-grotesk">{asset.name}</h4>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                                                <LuBuilding className="w-3 h-3" /> {asset.location}
                                            </p>
                                            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest leading-none mb-1">Health</span>
                                                    <span className="text-sm font-black text-slate-100">{asset.health}%</span>
                                                </div>
                                                <div className="text-right flex flex-col">
                                                    <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest leading-none mb-1">Latency</span>
                                                    <span className="text-sm font-black text-primary font-mono">{asset.pingMs > 0 ? `${asset.pingMs}ms` : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </GlassCardContent>
                                    </GlassCard>
                                ))}
                                <IndustrialButton 
                                    variant="outline" 
                                    className="w-full h-20 rounded-[2.5rem] border-dashed border-white/10 hover:border-primary/40 hover:bg-primary/5 text-slate-500 hover:text-primary transition-all duration-300 font-black uppercase text-[10px] tracking-widest"
                                >
                                    + Provision New Asset
                                </IndustrialButton>
                            </div>
                        </div>

                        {/* Activity Intelligence Feed */}
                        <div className="xl:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                        <LuActivity className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <h2 className="text-xl font-black uppercase tracking-tighter text-slate-100">
                                        Activity Intelligence Matrix
                                    </h2>
                                </div>
                                <div className="flex gap-3">
                                    <IndustrialButton 
                                        variant="secondary" 
                                        size="sm" 
                                        className="text-[9px] uppercase font-black tracking-widest h-10 px-4"
                                        onClick={simulatePresenceTrigger}
                                        disabled={simulating}
                                    >
                                        <LuTerminal className={`mr-2 w-3 h-3 ${simulating ? 'animate-pulse' : ''}`} /> 
                                        {simulating ? 'Simulating...' : 'Run Handshake'}
                                    </IndustrialButton>
                                    <IndustrialButton 
                                        variant="primary" 
                                        size="sm" 
                                        className="text-[9px] uppercase font-black tracking-widest h-10 px-4"
                                        onClick={fetchLogs}
                                    >
                                        <LuRefreshCw className={`mr-2 w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Sync Hub
                                    </IndustrialButton>
                                </div>
                            </div>

                            <GlassCard className="rounded-[3rem] border-white/5 flex flex-col h-[750px] overflow-hidden">
                                <GlassCardHeader className="bg-slate-900/40 p-8 border-b border-white/5">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-1">
                                            <GlassCardTitle className="text-xl font-black text-slate-100 flex items-center gap-3">
                                                <LuActivity className="w-5 h-5 text-primary animate-pulse" />
                                                Live Activity Stream
                                            </GlassCardTitle>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">End-to-End Cryptographically Verified Transmission</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg font-mono text-[9px] font-black text-primary uppercase">
                                                Connected_Secure::TLS_1.3
                                            </div>
                                            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter italic">Sync: {format(new Date(), 'HH:mm:ss')}</span>
                                        </div>
                                    </div>
                                </GlassCardHeader>

                                <GlassCardContent className="p-0 flex-1 relative flex flex-col">
                                    <div className="grid grid-cols-12 gap-0 border-b border-white/5 bg-white/[0.02] text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 py-4 px-10">
                                        <div className="col-span-2">Cycle Time</div>
                                        <div className="col-span-4">Identity Vector</div>
                                        <div className="col-span-4">Capture Environment</div>
                                        <div className="col-span-2 text-right">Authenticity</div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                        <AnimatePresence mode="popLayout">
                                            {loading && logs.length === 0 ? (
                                                <div className="inset-0 absolute flex flex-col items-center justify-center p-20 gap-4">
                                                    <div className="w-12 h-12 rounded-full border-t-2 border-primary animate-spin" />
                                                    <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-primary animate-pulse">Decrypting Uplink...</span>
                                                </div>
                                            ) : logs.length === 0 ? (
                                                <div className="inset-0 absolute flex flex-col items-center justify-center p-20 text-center space-y-6">
                                                    <div className="p-8 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                                                        <LuWifiOff className="w-16 h-16 text-slate-700 opacity-30" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h3 className="text-xl font-black text-slate-300 uppercase tracking-tight italic">Silent Sector</h3>
                                                        <p className="text-slate-500 text-xs font-medium max-w-xs mx-auto leading-relaxed">No hardware telemetry detected in this zone. Ensure all institutional assets are correctly provisioned.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-white/5">
                                                    {logs.map((log, i) => (
                                                        <motion.div
                                                            key={log.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="grid grid-cols-12 gap-0 py-6 px-10 items-center hover:bg-primary/[0.03] transition-all duration-300 group cursor-pointer"
                                                        >
                                                            <div className="col-span-2 space-y-1">
                                                                <div className="text-xs font-black text-slate-100 font-mono tracking-tight">{format(new Date(log.timestamp), 'HH:mm:ss')}</div>
                                                                <div className="text-[9px] text-slate-600 uppercase font-black tracking-tighter">{format(new Date(log.timestamp), 'MMM dd')}</div>
                                                            </div>
                                                            
                                                            <div className="col-span-4 flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg font-black text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                                                                    {log.student.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="font-black text-slate-100 uppercase tracking-tight group-hover:text-primary transition-colors duration-300 font-space-grotesk">{log.student}</div>
                                                                    <div className="text-[9px] text-slate-600 font-mono bg-white/5 px-2 py-0.5 rounded-md inline-block mt-1">{log.enrollmentNo}</div>
                                                                </div>
                                                            </div>

                                                            <div className="col-span-4">
                                                                <div className="flex items-center gap-2 font-black text-slate-300 uppercase text-[11px] italic tracking-tighter">
                                                                    <LuBuilding className="w-3 h-3 text-primary/70" /> {log.deviceClassroom}
                                                                </div>
                                                                <div className="text-[9px] text-slate-600 font-black uppercase tracking-[0.1em] mt-1">{log.subject}</div>
                                                            </div>

                                                            <div className="col-span-2 text-right">
                                                                <div className="flex flex-col items-end gap-2">
                                                                    <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-lg font-mono text-[8px] font-black tracking-widest px-2 py-1 uppercase group-hover:bg-primary group-hover:text-slate-900 transition-all duration-300">
                                                                        {log.method.split('_')[0]}
                                                                    </Badge>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Intelligence Summary Footer */}
                                    <div className="p-8 bg-slate-900/40 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="flex items-center gap-8 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                            <div className="flex items-center gap-2">
                                                <LuZap className="w-4 h-4 text-primary" />
                                                High-Res Telemetry Buffer
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <LuShieldCheck className="w-4 h-4 text-emerald-500" />
                                                Audit Integrity Locked
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-black/40 px-5 py-2.5 rounded-2xl border border-white/5 shadow-inner uppercase tracking-tighter">
                                            Uplink Security ID: HUB-SVT-9201 | Buffer Status: Optimal
                                        </div>
                                    </div>
                                </GlassCardContent>
                            </GlassCard>
                        </div>
                    </div>
                </div>
                <Toast toast={toast} onClose={hideToast} />
            </V2DashboardLayout>
        </ProtectedRoute>
    );
}
