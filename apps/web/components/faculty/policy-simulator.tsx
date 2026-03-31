import { useState, useCallback } from 'react';
import { GlassCard } from '@/components/v2/shared/cards';
import { IndustrialButton } from '@/components/v2/shared/inputs';
import { 
    Activity, 
    Settings2, 
    BarChart3, 
    Zap, 
    ArrowRight,
    Binary,
    ShieldAlert,
    RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { api } from '@/lib/api';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell,
    Legend
} from 'recharts';

interface PolicySimulatorProps {
    classId: string;
    initialData: {
        SAFE: number;
        AT_RISK: number;
        CRITICAL: number;
    };
}

export function PolicySimulator({ classId, initialData }: PolicySimulatorProps) {
    const [attendanceThreshold, setAttendanceThreshold] = useState(75);
    const [engagementThreshold, setEngagementThreshold] = useState(70);
    const [simulatedData, setSimulatedData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSimulate = async () => {
        setLoading(true);
        try {
            const res = await api.post('/v2/analytics/faculty/simulate-policy', {
                classId,
                attendanceThreshold,
                engagementThreshold
            });
            setSimulatedData(res.data);
        } catch (error) {
            console.error('Simulation Failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const chartData = [
        {
            name: 'SAFE',
            current: initialData.SAFE,
            simulated: simulatedData?.after?.SAFE ?? initialData.SAFE,
        },
        {
            name: 'AT_RISK',
            current: initialData.AT_RISK,
            simulated: simulatedData?.after?.AT_RISK ?? initialData.AT_RISK,
        },
        {
            name: 'CRITICAL',
            current: initialData.CRITICAL,
            simulated: simulatedData?.after?.CRITICAL ?? initialData.CRITICAL,
        },
    ];

    return (
        <GlassCard className="p-8 border-white/5 bg-white/2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Binary className="w-32 h-32 text-primary" />
            </div>

            <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Settings2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h4 className="text-lg font-black uppercase tracking-tighter text-slate-100">Policy Impact Matrix</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Neural "What-If" Analysis Engine</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Control Panel */}
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Attendance Threshold</label>
                                    <span className={cn(
                                        "text-sm font-black text-primary px-2 py-0.5 bg-primary/10 rounded-md ring-1 ring-primary/20",
                                        attendanceThreshold > 85 && "text-rose-500 bg-rose-500/10 ring-rose-500/20"
                                    )}>
                                        {attendanceThreshold}%
                                    </span>
                                </div>
                                <Slider 
                                    value={[attendanceThreshold]} 
                                    onValueChange={(v: number[]) => setAttendanceThreshold(v[0])}
                                    max={100}
                                    min={50}
                                    step={1}
                                    className="cursor-pointer"
                                />
                                <p className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter">
                                    Minimum attendance required before triggering risk flags.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Engagement Mark</label>
                                    <span className="text-sm font-black text-primary px-2 py-0.5 bg-primary/10 rounded-md ring-1 ring-primary/20">
                                        {engagementThreshold}%
                                    </span>
                                </div>
                                <Slider 
                                    value={[engagementThreshold]} 
                                    onValueChange={(v: number[]) => setEngagementThreshold(v[0])}
                                    max={100}
                                    min={40}
                                    step={1}
                                    className="cursor-pointer"
                                />
                                <p className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter">
                                    Minimum submission rate for assignments and quizzes.
                                </p>
                            </div>
                        </div>

                        <IndustrialButton 
                            variant="primary" 
                            size="lg" 
                            className="w-full rounded-2xl py-6 relative group overflow-hidden"
                            onClick={handleSimulate}
                            disabled={loading}
                        >
                            <span className="relative z-10 flex items-center gap-2 font-black uppercase tracking-widest text-xs">
                                {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                                {loading ? "Computing Neural Vectors..." : "Execute Simulation"}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-primary bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
                        </IndustrialButton>
                    </div>

                    {/* Visualization Area */}
                    <div className="bg-black/20 rounded-3xl border border-white/5 p-6 min-h-[300px] flex flex-col">
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#475569" 
                                        fontSize={10} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tick={{ fontWeight: 900 }}
                                    />
                                    <YAxis 
                                        stroke="#475569" 
                                        fontSize={10} 
                                        tickLine={false} 
                                        axisLine={false}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#0f172a', 
                                            border: '1px solid #ffffff10', 
                                            borderRadius: '12px',
                                            padding: '12px'
                                        }}
                                        itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                    />
                                    <Legend 
                                        wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                    />
                                    <Bar dataKey="current" name="Baseline" fill="#334155" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="simulated" name="Simulated" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={
                                                    entry.name === 'CRITICAL' ? '#f43f5e' :
                                                    entry.name === 'AT_RISK' ? '#f97316' : '#10b981'
                                                } 
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {simulatedData && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-auto pt-6 space-y-4"
                            >
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            simulatedData.insights.riskSurge > 0 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                                        )}>
                                            {simulatedData.insights.riskSurge > 0 ? <ShieldAlert className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Net Risk Delta</p>
                                            <p className="text-sm font-black text-slate-200">
                                                {simulatedData.insights.riskSurge > 0 ? '+' : ''}{simulatedData.insights.riskSurge} Students shifting to Risk
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-600" />
                                </div>
                                
                                <p className="text-[9px] font-semibold text-slate-500 text-center uppercase tracking-widest">
                                    Simulating against {simulatedData.insights.affectedStudents} student vectors
                                </p>
                            </motion.div>
                        )}

                        {!simulatedData && (
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                    Execute simulation to visualize impact
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
