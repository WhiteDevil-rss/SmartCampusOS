'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DEPT_ADMIN_NAV } from '@/lib/constants/nav-config';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    LuCpu, LuWifi, LuWifiOff, LuTerminal,
    LuActivity, LuRefreshCw, LuUserCheck, LuBuilding
} from 'react-icons/lu';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function IoTManagementDashboard() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock Active Devices Array (Usually fetched from a Devices table)
    const activeDevices = [
        { id: 'dev-rfid-01', location: 'CR-101 (Main Building)', status: 'ONLINE', pingMs: 12 },
        { id: 'dev-bio-04', location: 'Computer Lab 3', status: 'ONLINE', pingMs: 24 },
        { id: 'dev-rfid-09', location: 'CR-205 (Annex)', status: 'OFFLINE', pingMs: -1 },
    ];

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/v2/iot/logs');
            setLogs(res.data);
        } catch (error) {
            console.error('Failed to fetch IoT logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // Optional: Implement a generic polling mechanism every 30s to simulate live WebSockets
        const interval = setInterval(fetchLogs, 30000);
        return () => clearInterval(interval);
    }, []);

    // Mock function to trigger the Webhook manually for demonstration
    const simulateDevicePing = async () => {
        try {
            await api.post('/v2/iot/attendance', {
                secretKey: 'ZEMBAA_IOT_TEST_KEY',
                deviceId: 'mock-room-id-here', // Needs a real Resource ID if fully testing
                uid: 'TEST_ENROLLMENT_NO' // Needs a real enrollment No
            });
            fetchLogs();
        } catch (error) {
            console.error('Webhook failed', error);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN']}>
            <DashboardLayout navItems={DEPT_ADMIN_NAV} title="IoT & Devices">
                <div className="max-w-6xl mx-auto space-y-8">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <div className="p-2.5 bg-sky-100 rounded-xl text-sky-600">
                                    <LuCpu className="w-6 h-6" />
                                </div>
                                Smart Infrastructure
                            </h1>
                            <p className="text-text-secondary mt-2 font-medium">
                                Manage physical access terminals, RFID scanners, and live attendance webhooks.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="gap-2" onClick={simulateDevicePing}>
                                <LuTerminal className="w-4 h-4" /> Simulate Ping
                            </Button>
                            <Button className="gap-2 bg-sky-600 hover:bg-sky-700 text-text-primary" onClick={fetchLogs}>
                                <LuRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Device fleet configuration */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="shadow-md border-sky-100">
                                <CardHeader className="bg-sky-50/50 pb-4 border-b border-sky-100">
                                    <CardTitle className="text-sky-900 flex items-center gap-2">
                                        <LuWifi className="w-4 h-4 text-sky-500" />
                                        Device Fleet Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-100">
                                        {activeDevices.map(device => (
                                            <div key={device.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-slate-800 text-sm">{device.id}</span>
                                                        <Badge variant="outline" className={`text-[10px] ${device.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                            {device.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-text-secondary flex items-center gap-1">
                                                        <LuBuilding className="w-3 h-3" /> {device.location}
                                                    </div>
                                                </div>
                                                {device.status === 'ONLINE' ? (
                                                    <div className="text-xs font-mono text-emerald-600 font-medium">
                                                        {device.pingMs}ms
                                                    </div>
                                                ) : (
                                                    <LuWifiOff className="w-4 h-4 text-red-400" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 border-t border-slate-100 bg-slate-50">
                                        <Button variant="outline" className="w-full text-xs font-bold border-dashed border-slate-300">
                                            + Register New Device
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Live Log Stream */}
                        <div className="lg:col-span-2">
                            <Card className="shadow-md border-slate-200 h-full overflow-hidden flex flex-col">
                                <CardHeader className="bg-slate-900 text-text-primary pb-4 rounded-t-xl">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
                                            </div>
                                            Live Telemetry Stream
                                        </CardTitle>
                                        <Badge variant="secondary" className="bg-surface-hover text-text-primary/80 hover:bg-surface-hover font-mono">
                                            PORT: 443 (WSS)
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 bg-slate-50 flex-1 relative min-h-[400px]">

                                    {loading && logs.length === 0 ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-text-muted">
                                            <LuActivity className="w-8 h-8 animate-spin mb-4 text-sky-500" />
                                            <p className="font-mono text-sm">Awaiting WebSocket Handshake...</p>
                                        </div>
                                    ) : logs.length === 0 ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-text-muted text-center">
                                            <LuTerminal className="w-8 h-8 mb-3 opacity-50" />
                                            <p className="font-mono text-sm max-w-[250px]">No recent telemetry received. Ensure hardware devices are powered on and connected to the campus network.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-200/60 max-h-[600px] overflow-y-auto font-mono text-sm p-2">
                                            <AnimatePresence>
                                                {logs.map((log: any, i) => (
                                                    <motion.div
                                                        key={log.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="p-3 hover:bg-sky-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-sky-500 hidden sm:block">
                                                                <LuUserCheck className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-slate-800 font-bold tracking-tight">
                                                                    {log.student} <span className="text-text-muted text-xs ml-1 font-sans">({log.enrollmentNo})</span>
                                                                </div>
                                                                <div className="text-xs text-text-secondary mt-0.5">
                                                                    <span className="text-sky-600 font-semibold">[{log.method}]</span> &rarr; {log.subject}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-slate-700 text-xs font-bold">{log.deviceClassroom}</div>
                                                            <div className="text-[10px] text-text-muted mt-1">{format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}</div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
