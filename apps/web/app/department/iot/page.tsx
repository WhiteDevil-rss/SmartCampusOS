'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DEPT_ADMIN_NAV } from '@/lib/constants/nav-config';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    LuCpu, LuWifi, LuWifiOff, LuTerminal,
    LuActivity, LuRefreshCw, LuUserCheck, LuBuilding,
    LuShieldCheck, LuZap, LuClock, LuChevronRight
} from 'react-icons/lu';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast, Toast } from '@/components/ui/toast-alert';

interface IoTLog {
    id: string;
    timestamp: string;
    student: string;
    enrollmentNo: string;
    deviceClassroom: string;
    subject: string;
    method: string;
}

export default function IoTManagementDashboard() {
    const [logs, setLogs] = useState<IoTLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [simulating, setSimulating] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    // Mock Active Devices Array (Enhanced with premium status)
    const activeDevices = [
        { id: 'IOT-LH-001', name: 'Lecture Hall 1 Scanner', location: 'LH-1 (Ground Floor)', status: 'ONLINE', pingMs: 12, health: 98 },
        { id: 'IOT-LAB-04', name: 'Computer Lab 3 Terminal', location: 'Lab 3 (2nd Floor)', status: 'ONLINE', pingMs: 24, health: 95 },
        { id: 'IOT-LH-205', name: 'Lecture Hall 205 Gateway', location: 'LH-205 (Annex)', status: 'OFFLINE', pingMs: -1, health: 0 },
    ];

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/v2/iot/logs');
            setLogs(res.data);
        } catch (error) {
            console.error('Failed to fetch IoT logs', error);
            showToast('error', 'Failed to synchronize with IoT Hub');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 15000); // Polling every 15s for the demo
        return () => clearInterval(interval);
    }, [fetchLogs]);

    const simulateDevicePing = async () => {
        setSimulating(true);
        try {
            await api.post('/v2/iot/attendance', {
                secretKey: 'ZEMBAA_IOT_TEST_KEY',
                deviceId: 'bd8c8e98-17fb-4192-9354-ba46317670d9', // Lecture Hall 1 from seed
                uid: 'EN20250000', // Aarav Patel from seed
                method: 'IOT_SIMULATION'
            });
            showToast('success', 'Hardware Telemetry Simulated Successfully');
            setTimeout(fetchLogs, 1000);
        } catch (error) {
            console.error('Simulation failed', error);
            showToast('error', 'Critical Hardware Handshake Failure');
        } finally {
            setSimulating(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN', 'UNI_ADMIN']}>
            <DashboardLayout navItems={DEPT_ADMIN_NAV} title="IoT Hub | Smart Infrastructure">
                <div className="max-w-7xl mx-auto space-y-10 pb-20">

                    {/* Header: Institutional Branding */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-neon-cyan font-mono text-xs uppercase tracking-[0.3em] font-black">
                                <LuActivity className="w-4 h-4 animate-pulse" /> Live Telemetry Matrix
                            </div>
                            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase underline decoration-neon-cyan decoration-8 underline-offset-8">
                                SMART<span className="text-neon-cyan not-italic">INFRA</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-xl">
                                Monitoring <span className="text-slate-900 dark:text-white font-bold">28 active terminals</span> and physical access vectors across the campus perimeter.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button 
                                variant="outline" 
                                className="h-14 px-8 rounded-2xl border-2 border-slate-200 dark:border-border-hover hover:bg-surface font-black uppercase text-xs tracking-widest gap-3 transition-all active:scale-95"
                                onClick={simulateDevicePing}
                                disabled={simulating}
                            >
                                <LuTerminal className={`w-5 h-5 ${simulating ? 'animate-pulse' : ''}`} /> 
                                {simulating ? 'PINGING...' : 'RUN SIMULATION'}
                            </Button>
                            <Button 
                                className="h-14 px-8 rounded-2xl bg-neon-cyan text-slate-900 font-black uppercase text-xs tracking-widest gap-3 shadow-[0_0_30px_rgba(57,193,239,0.3)] hover:shadow-[0_0_50px_rgba(57,193,239,0.5)] transition-all active:scale-95"
                                onClick={fetchLogs}
                            >
                                <LuRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> SYNC HUB
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                        {/* Device Fleet View */}
                        <div className="xl:col-span-1 space-y-8">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.4em] px-2">Hardware Nodes</h3>
                                {activeDevices.map((device) => (
                                    <Card key={device.id} className="bg-white/95 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-neon-cyan/50 backdrop-blur-xl shadow-xl rounded-[2rem] overflow-hidden group transition-all duration-500">
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-slate-100 dark:bg-black/40 rounded-2xl group-hover:bg-neon-cyan/20 transition-colors">
                                                    <LuCpu className={`w-6 h-6 ${device.status === 'ONLINE' ? 'text-neon-cyan' : 'text-rose-500'}`} />
                                                </div>
                                                <Badge className={`rounded-lg px-2 py-1 uppercase text-[9px] font-black border-none ${
                                                    device.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                                }`}>
                                                    {device.status}
                                                </Badge>
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-black text-slate-900 dark:text-text-primary uppercase tracking-tight text-lg">{device.name}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 font-medium">
                                                    <LuBuilding className="w-3 h-3" /> {device.location}
                                                </p>
                                            </div>
                                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest">Health</span>
                                                    <span className="text-sm font-black text-slate-900 dark:text-white">{device.health}%</span>
                                                </div>
                                                <div className="text-right flex flex-col">
                                                    <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest">Latency</span>
                                                    <span className="text-sm font-black text-neon-cyan font-mono">{device.pingMs > 0 ? `${device.pingMs}ms` : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                <Button variant="ghost" className="w-full h-20 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-border-hover hover:border-neon-cyan/50 hover:bg-neon-cyan/5 text-text-muted hover:text-neon-cyan font-black uppercase text-xs tracking-widest transition-all">
                                    + PROVISION NEW NODE
                                </Button>
                            </div>
                        </div>

                        {/* Telemetry Matrix Feed */}
                        <div className="xl:col-span-3">
                            <Card className="bg-white/95 dark:bg-[#0a0a0c]/80 border-slate-200 dark:border-slate-800 backdrop-blur-3xl shadow-2xl rounded-[3rem] overflow-hidden flex flex-col h-[850px]">
                                <CardHeader className="p-10 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-t-[3rem]">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-1">
                                            <CardTitle className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                                <div className="flex gap-1">
                                                    <div className="w-1.5 h-6 bg-neon-cyan rounded-full animate-pulse" />
                                                    <div className="w-1.5 h-6 bg-neon-cyan/50 rounded-full animate-pulse [animation-delay:0.2s]" />
                                                    <div className="w-1.5 h-6 bg-neon-cyan/20 rounded-full animate-pulse [animation-delay:0.4s]" />
                                                </div>
                                                Real-Time Data Matrix
                                            </CardTitle>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">End-to-End Encrypted Terminal Stream (AES-256)</p>
                                        </div>
                                        <div className="hidden md:flex flex-col items-end gap-2">
                                            <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl font-mono text-[10px] font-black text-neon-cyan flex items-center gap-3">
                                                <LuZap className="w-3 h-3 fill-neon-cyan" /> WSS::CONNECTED_SECURE
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-bold tracking-tighter italic">Last Hub Sync: {format(new Date(), 'HH:mm:ss')}</div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0 flex-1 relative overflow-hidden flex flex-col bg-slate-50/50 dark:bg-transparent">
                                    <div className="grid grid-cols-12 gap-0 border-b border-slate-200 dark:border-white/5 bg-slate-100/30 dark:bg-black/20 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 py-4 px-10">
                                        <div className="col-span-2">Timestamp</div>
                                        <div className="col-span-4">identity vector</div>
                                        <div className="col-span-3">Capture environment</div>
                                        <div className="col-span-2">Transmission</div>
                                        <div className="col-span-1 text-right">View</div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                                        <AnimatePresence mode="popLayout">
                                            {loading && logs.length === 0 ? (
                                                <div className="inset-0 absolute flex flex-col items-center justify-center p-20 gap-4">
                                                    <div className="w-16 h-16 rounded-full border-t-4 border-neon-cyan animate-spin" />
                                                    <span className="font-mono text-xs uppercase tracking-[0.5em] text-neon-cyan animate-pulse">Decrypting Uplink...</span>
                                                </div>
                                            ) : logs.length === 0 ? (
                                                <div className="inset-0 absolute flex flex-col items-center justify-center p-20 text-center space-y-6">
                                                    <div className="p-8 bg-slate-100 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-300 dark:border-border">
                                                        <LuWifiOff className="w-16 h-16 text-text-muted opacity-30" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h3 className="text-2xl font-black text-slate-900 dark:text-text-primary uppercase tracking-tight italic">Silent Sector</h3>
                                                        <p className="text-text-muted text-sm font-medium max-w-sm mx-auto">No hardware telemetry detected in this zone. Ensure all campus nodes are active and performing handshakes.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-slate-100 dark:divide-white/5">
                                                    {logs.map((log, i) => (
                                                        <motion.div
                                                            key={log.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, x: 20 }}
                                                            transition={{ duration: 0.4, delay: i * 0.03 }}
                                                            className="grid grid-cols-12 gap-0 py-6 px-10 items-center hover:bg-neon-cyan/[0.03] transition-all cursor-pointer group"
                                                        >
                                                            <div className="col-span-2 space-y-1">
                                                                <div className="text-sm font-black text-slate-900 dark:text-white font-mono">{format(new Date(log.timestamp), 'HH:mm:ss')}</div>
                                                                <div className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-bold tracking-tighter">{format(new Date(log.timestamp), 'MMM dd yyyy')}</div>
                                                            </div>
                                                            
                                                            <div className="col-span-4 flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl font-black text-neon-cyan group-hover:scale-110 group-hover:bg-neon-cyan group-hover:text-slate-900 transition-all">
                                                                    {log.student.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-neon-cyan transition-colors">{log.student}</div>
                                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md inline-block mt-1">{log.enrollmentNo}</div>
                                                                </div>
                                                            </div>

                                                            <div className="col-span-3">
                                                                <div className="flex items-center gap-2 font-black text-slate-700 dark:text-white/80 uppercase text-xs italic tracking-tighter">
                                                                    <LuBuilding className="w-4 h-4 text-neon-purple" /> {log.deviceClassroom}
                                                                </div>
                                                                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-bold">{log.subject}</div>
                                                            </div>

                                                            <div className="col-span-2">
                                                                <Badge className="bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 rounded-md font-mono text-[9px] font-black tracking-widest px-2 py-1 uppercase">
                                                                    {log.method}
                                                                </Badge>
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                                                                </div>
                                                            </div>

                                                            <div className="col-span-1 text-right">
                                                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-neon-cyan/10 hover:text-neon-cyan transition-all">
                                                                    <LuChevronRight className="w-5 h-5" />
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="p-8 bg-slate-100/50 dark:bg-black/40 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="flex items-center gap-8 text-xs font-black text-text-muted uppercase tracking-widest">
                                            <div className="flex items-center gap-2">
                                                <LuZap className="w-4 h-4 text-amber-500" />
                                                High Resolution Feed
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <LuShieldCheck className="w-4 h-4 text-emerald-500" />
                                                Audit Persistence Active
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-mono text-text-secondary bg-white dark:bg-black/60 px-4 py-2 rounded-2xl border border-slate-200 dark:border-border shadow-inner uppercase tracking-tighter">
                                            Data Throughput: 4.2 MB/s | Uplink ID: HUB-SVT-0149
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                <Toast toast={toast} onClose={hideToast} />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
