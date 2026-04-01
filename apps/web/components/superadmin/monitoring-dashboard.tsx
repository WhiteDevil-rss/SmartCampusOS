"use client";

import { useEffect, useRef, useState } from 'react';
import { useMonitoring } from '@/lib/hooks/use-monitoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Activity, Cpu, BrainCircuit, Timer } from 'lucide-react';
import { format } from 'date-fns';

const CHART_HEIGHT = 250;

function formatDuration(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }

    if (minutes > 0) {
        return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
    }

    return `${seconds}s`;
}

function ChartShell({ children }: { children: (size: { width: number; height: number }) => React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const updateWidth = () => {
            setWidth(element.getBoundingClientRect().width);
        };

        updateWidth();

        const observer = new ResizeObserver(() => {
            updateWidth();
        });

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div ref={containerRef} className="h-[250px] min-w-0 w-full">
            {width > 0 ? children({ width, height: CHART_HEIGHT }) : null}
        </div>
    );
}

export function MonitoringDashboard() {
    const { metrics, history } = useMonitoring();
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timerId = window.setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => {
            window.clearInterval(timerId);
        };
    }, []);

    if (!metrics) {
        return (
            <div className="flex items-center justify-center h-48 border border-dashed rounded-3xl animate-pulse bg-primary/5 text-muted-foreground italic text-sm">
                Waiting for telemetry handshake...
            </div>
        );
    }

    const chartData = history.map((m) => ({
        time: format(new Date(m.timestamp), 'HH:mm:ss'),
        cpu: m.cpuUsage,
        mem: m.memoryUsage.percentage,
        rps: m.throughput,
        aiSolveTime: m.ai?.metrics?.avg_solve_time_ms || 0
    }));

    const aiMetrics = metrics.ai?.metrics;
    const aiReachable = metrics.ai?.reachable;
    const heartbeatAgeSeconds = Math.max(0, Math.floor((now - new Date(metrics.timestamp).getTime()) / 1000));
    const liveUptime = formatDuration(metrics.uptime + heartbeatAgeSeconds);

    return (
        <div className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {/* Real-time Status Card */}
            <Card className="col-span-full xl:col-span-3 border-primary/10 bg-surface/60 backdrop-blur-3xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                            Live Telemetry
                        </p>
                        <CardTitle className="text-xl font-black">
                            Operational Pulse
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        System Normal
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-3 pt-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">CPU LOAD</span>
                        <span className="text-3xl font-black text-foreground">{metrics.cpuUsage}%</span>
                        <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${metrics.cpuUsage}%` }} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">MEMORY</span>
                        <span className="text-3xl font-black text-foreground">{metrics.memoryUsage.percentage}%</span>
                        <div className="w-full h-1.5 bg-indigo-500/10 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${metrics.memoryUsage.percentage}%` }} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">THROUGHPUT</span>
                        <span className="text-3xl font-black text-foreground">{metrics.throughput.toFixed(2)} RPS</span>
                        <span className="text-[10px] font-medium text-muted-foreground">Uptime {liveUptime}</span>
                    </div>
                </CardContent>
            </Card>

            {/* AI Engine Pulse Card */}
            <Card className="col-span-full xl:col-span-1 border-primary/10 bg-surface/60 backdrop-blur-3xl overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                            AI Core Unit
                        </p>
                        <CardTitle className="text-xl font-black flex items-center gap-2">
                            <BrainCircuit className="h-5 w-5 text-fuchsia-500" />
                            Reactor Core
                        </CardTitle>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-tighter ${
                        aiReachable 
                            ? 'border-fuchsia-500/20 bg-fuchsia-500/5 text-fuchsia-500' 
                            : 'border-red-500/20 bg-red-500/5 text-red-500'
                    }`}>
                        {aiReachable ? 'ACTIVE' : 'OFFLINE'}
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pt-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">SOLVES</span>
                        <span className="text-2xl font-black">{aiMetrics?.total_solves || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">AVG LATENCY</span>
                        <span className="text-2xl font-black text-fuchsia-500">
                            {aiMetrics?.avg_solve_time_ms ? `${aiMetrics.avg_solve_time_ms}ms` : '—'}
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-fuchsia-500/10 rounded-full overflow-hidden mt-1 relative">
                        {aiReachable && (
                            <div className="absolute inset-0 bg-fuchsia-500/20 animate-pulse" />
                        )}
                        <div className="h-full bg-fuchsia-500 transition-all duration-1000 shadow-[0_0_8px_rgba(217,70,239,0.5)]" 
                             style={{ width: aiReachable ? '85%' : '0%' }} 
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Charts */}
            <Card className="col-span-2 min-w-0 border-primary/10 bg-surface/40 backdrop-blur-3xl min-h-[300px]">
                <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-primary" /> CPU & Memory Trend
                    </CardTitle>
                </CardHeader>
                <CardContent className="min-w-0">
                    <ChartShell>
                        {({ width, height }) => (
                        <AreaChart width={width} height={height} data={chartData}>
                            <defs>
                                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" hide />
                            <YAxis domain={[0, 100]} hide />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="cpu" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCpu)" />
                            <Area type="monotone" dataKey="mem" stroke="#6366f1" fillOpacity={1} fill="url(#colorMem)" />
                        </AreaChart>
                        )}
                    </ChartShell>
                </CardContent>
            </Card>

            <Card className="col-span-2 min-w-0 border-primary/10 bg-surface/40 backdrop-blur-3xl min-h-[300px]">
                <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Activity className="h-4 w-4 text-teal-500" /> API Throughput (RPS)
                    </CardTitle>
                </CardHeader>
                <CardContent className="min-w-0">
                    <ChartShell>
                        {({ width, height }) => (
                        <AreaChart width={width} height={height} data={chartData}>
                            <defs>
                                <linearGradient id="colorRps" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" hide />
                            <YAxis hide />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="rps" stroke="#14b8a6" fillOpacity={1} fill="url(#colorRps)" strokeWidth={2} />
                        </AreaChart>
                        )}
                    </ChartShell>
                </CardContent>
            </Card>
            <Card className="col-span-2 min-w-0 border-primary/10 bg-surface/40 backdrop-blur-3xl min-h-[300px]">
                <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Timer className="h-4 w-4 text-fuchsia-500" /> AI Solve Latency (ms)
                    </CardTitle>
                </CardHeader>
                <CardContent className="min-w-0">
                    <ChartShell>
                        {({ width, height }) => (
                        <AreaChart width={width} height={height} data={chartData}>
                            <defs>
                                <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" hide />
                            <YAxis hide />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="aiSolveTime" stroke="#d946ef" fillOpacity={1} fill="url(#colorAi)" strokeWidth={2} />
                        </AreaChart>
                        )}
                    </ChartShell>
                </CardContent>
            </Card>
        </div>
    );
}
