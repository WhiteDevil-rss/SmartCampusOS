'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DEPT_ADMIN_NAV } from '@/lib/constants/nav-config';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { LuTrendingUp, LuShieldAlert, LuLayers, LuFilter, LuActivity, LuDownload } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ChartPoint {
    semester: string;
    [key: string]: string | number;
}

interface DifficultyItem {
    subject: string;
    failRate: number;
}

export default function ResultTrendsPage() {
    const { user } = useAuthStore();
    const [longitudinal, setLongitudinal] = useState<ChartPoint[]>([]);
    const [difficulty, setDifficulty] = useState<DifficultyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        if (!user?.entityId) return;
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const res = await api.get(`/v2/analytics/${user!.entityId}/trends`);
            setLongitudinal(res.data.longitudinal);
            setDifficulty(res.data.difficultyHeatmap);
        } catch (error) {
            console.error('Failed to load result trends:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const element = document.getElementById('trends-report');
            if (!element) return;

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Results_Trends_Report.pdf`);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const batches = longitudinal.length > 0
        ? Object.keys(longitudinal[0]).filter(k => k !== 'semester')
        : [];

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LuActivity className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN', 'UNI_ADMIN']}>
            <DashboardLayout navItems={DEPT_ADMIN_NAV} title="Results & Academic Trends">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <LuTrendingUp className="w-6 h-6 text-indigo-500" />
                                Long-Term Academic Performance
                            </h1>
                            <p className="text-text-secondary text-sm">Cross-batch analysis of SGPA trends and subject-wise difficulty metrics.</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            disabled={isExporting}
                            className="bg-white dark:bg-surface border-slate-200 dark:border-border-hover"
                        >
                            {isExporting ? <LuActivity className="w-4 h-4 mr-2 animate-spin" /> : <LuDownload className="w-4 h-4 mr-2" />}
                            Export Trends Report
                        </Button>
                    </div>

                    <div id="trends-report" className="space-y-6 pt-2">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Trend Chart */}
                            <Card className="lg:col-span-2 glass-card border-none shadow-sm dark:bg-[#0a0a0c] dark:border-border">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <LuLayers className="w-4 h-4 text-indigo-500" />
                                        Average SGPA Progression (by Batch)
                                    </CardTitle>
                                    <CardDescription>Tracking growth and consistency across different graduating classes.</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={longitudinal} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="semester" />
                                            <YAxis domain={[4, 10]} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                            />
                                            <Legend />
                                            {batches.map((batch, i) => (
                                                <Line
                                                    key={batch}
                                                    type="monotone"
                                                    dataKey={batch}
                                                    stroke={colors[i % colors.length]}
                                                    strokeWidth={3}
                                                    dot={{ r: 4, strokeWidth: 2 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Subject Difficulty Heatmap */}
                            <Card className="glass-card border-none shadow-sm dark:bg-[#0a0a0c] dark:border-border">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <LuShieldAlert className="w-4 h-4 text-red-500" />
                                        Critical Subjects (Failure Rates)
                                    </CardTitle>
                                    <CardDescription>Top 10 subjects where students struggle the most.</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={difficulty} layout="vertical" margin={{ left: 30, right: 30 }}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="subject" type="category" width={100} tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Bar dataKey="failRate" radius={[0, 4, 4, 0]} barSize={20}>
                                                {difficulty.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.failRate > 20 ? '#ef4444' : entry.failRate > 10 ? '#f59e0b' : '#6366f1'}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Lower Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Highest Avg SGPA', value: '8.42', sub: 'Batch 2021-25', color: 'emerald' },
                                { label: 'Max Improvement', value: '+0.85', sub: 'Sem 3 to Sem 4', color: 'indigo' },
                                { label: 'Critical Course', value: 'Thermodynamics', sub: '24.5% Fail Rate', color: 'red' },
                                { label: 'Overall Pass %', value: '92.4%', sub: 'Current Semester', color: 'sky' }
                            ].map((stat, i) => (
                                <Card key={i} className="glass-card p-4 border-none shadow-sm flex flex-col items-center text-center">
                                    <div className={`text-2xl font-black text-${stat.color}-600 dark:text-${stat.color}-400 mb-1`}>{stat.value}</div>
                                    <div className="text-[10px] uppercase font-bold text-text-secondary">{stat.label}</div>
                                    <div className="text-[11px] text-text-muted mt-0.5">{stat.sub}</div>
                                </Card>
                            ))}
                        </div>
                    </div>

                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
