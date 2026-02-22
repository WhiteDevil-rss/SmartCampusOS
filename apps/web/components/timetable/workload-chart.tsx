'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMemo } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function WorkloadChart({ slots }: { slots: any[] }) {
    const data = useMemo(() => {
        if (!slots || slots.length === 0) return [];

        const workload: Record<string, { facultyName: string, minutes: number }> = {};

        slots.forEach(slot => {
            if (slot.facultyId && slot.faculty) {
                if (!workload[slot.facultyId]) {
                    workload[slot.facultyId] = {
                        facultyName: slot.faculty.name,
                        minutes: 0
                    };
                }
                workload[slot.facultyId].minutes += 1;
            }
        });

        return Object.values(workload)
            .map(w => ({
                name: w.facultyName.split(' ')[0],
                fullName: w.facultyName,
                Workload: w.minutes
            }))
            .sort((a, b) => b.Workload - a.Workload);
    }, [slots]);

    const getBarColor = (val: number) => {
        if (val > 20) return '#ef4444'; // Red for overload
        if (val >= 16) return '#f59e0b'; // Amber for high load
        return '#10b981'; // Green for normal
    };

    if (!slots || slots.length === 0) {
        return (
            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-600">Faculty Workload Summary</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center text-slate-400">
                    No session data available
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm border-slate-200 bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center justify-between">
                    Workload Distribution
                    <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wider">Units = Total Slots</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                interval={0}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                labelStyle={{ color: '#64748b', fontSize: '11px', marginBottom: '4px' }}
                                formatter={(value: number | string | undefined) => value ? [`${value} Units`, 'Workload'] : ['0 Units', 'Workload']}
                                labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
                            />
                            <ReferenceLine y={20} stroke="#cbd5e1" strokeDasharray="3 3" label={{ position: 'right', value: 'CAP', fill: '#94a3b8', fontSize: 10 }} />
                            <Bar
                                dataKey="Workload"
                                radius={[6, 6, 0, 0]}
                                barSize={32}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getBarColor(entry.Workload)} fillOpacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
