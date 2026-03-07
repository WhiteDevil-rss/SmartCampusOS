'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DEPT_ADMIN_NAV } from '@/lib/constants/nav-config';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LuTrendingUp, LuUsers, LuGraduationCap, LuChartBar, LuRefreshCw } from 'react-icons/lu';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LuDownload } from 'react-icons/lu';

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

interface AnalyticsData {
    enrollmentTrends: { year: string; students: number }[];
    cgpaDistribution: { batch: string; avgCgpa: number }[];
    facultyCourseLoad: { name: string; courses: number }[];
    summary: {
        totalStudents: number;
        totalFaculty: number;
        totalBatches: number;
    };
}

export default function DepartmentAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/v2/analytics/department');
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const element = document.getElementById('analytics-report');
            if (!element) return;

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#f8fafc'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Department_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN', 'SUPERADMIN']}>
            <DashboardLayout navItems={DEPT_ADMIN_NAV} title="Department Analytics">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-text-primary shadow-lg">
                                    <LuChartBar className="w-6 h-6" />
                                </div>
                                Advanced Analytics
                            </h1>
                            <p className="text-text-secondary mt-2 font-medium">
                                Interactive charts powered by real-time department data aggregations.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="gap-2 bg-white"
                                onClick={handleExport}
                                disabled={loading || isExporting}
                            >
                                {isExporting ? <LuRefreshCw className="w-4 h-4 animate-spin" /> : <LuDownload className="w-4 h-4 text-indigo-500" />}
                                {isExporting ? 'Generating PDF...' : 'Export PDF Report'}
                            </Button>
                            <Button variant="outline" className="gap-2" onClick={fetchAnalytics} disabled={loading}>
                                <LuRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
                            </Button>
                        </div>
                    </div>

                    <div id="analytics-report" className="space-y-8 pt-4 pb-8">

                        {/* Summary Cards */}
                        {data && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-text-primary shadow-lg border-none">
                                    <CardContent className="p-6 flex justify-between items-center">
                                        <div>
                                            <p className="text-text-primary/80 text-sm font-medium">Total Students</p>
                                            <h3 className="text-4xl font-black mt-1">{data.summary.totalStudents}</h3>
                                        </div>
                                        <div className="p-3 bg-surface-hover rounded-xl backdrop-blur-sm">
                                            <LuUsers className="w-7 h-7" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-text-primary shadow-lg border-none">
                                    <CardContent className="p-6 flex justify-between items-center">
                                        <div>
                                            <p className="text-text-primary/80 text-sm font-medium">Active Faculty</p>
                                            <h3 className="text-4xl font-black mt-1">{data.summary.totalFaculty}</h3>
                                        </div>
                                        <div className="p-3 bg-surface-hover rounded-xl backdrop-blur-sm">
                                            <LuGraduationCap className="w-7 h-7" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-text-primary shadow-lg border-none">
                                    <CardContent className="p-6 flex justify-between items-center">
                                        <div>
                                            <p className="text-text-primary/80 text-sm font-medium">Active Batches</p>
                                            <h3 className="text-4xl font-black mt-1">{data.summary.totalBatches}</h3>
                                        </div>
                                        <div className="p-3 bg-surface-hover rounded-xl backdrop-blur-sm">
                                            <LuTrendingUp className="w-7 h-7" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {loading && !data ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[1, 2, 3].map(i => (
                                    <Card key={i} className="h-[380px] animate-pulse bg-slate-100 border-slate-200" />
                                ))}
                            </div>
                        ) : data ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                {/* Enrollment Trends - Line Chart */}
                                <Card className="shadow-md border-slate-200 lg:col-span-2">
                                    <CardHeader className="border-b border-slate-100 pb-4">
                                        <CardTitle className="text-slate-800">Enrollment Trends (5-Year)</CardTitle>
                                        <CardDescription>Student intake growth trajectory over the last five academic years.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <ResponsiveContainer width="100%" height={320}>
                                            <LineChart data={data.enrollmentTrends}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} />
                                                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                                <Tooltip
                                                    contentStyle={{
                                                        background: '#1e293b', border: 'none', borderRadius: '12px',
                                                        color: '#fff', fontSize: '13px', padding: '10px 16px'
                                                    }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="students"
                                                    stroke="#6366f1"
                                                    strokeWidth={3}
                                                    dot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                                                    activeDot={{ r: 8, stroke: '#6366f1', strokeWidth: 2 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* CGPA Distribution - Bar Chart */}
                                <Card className="shadow-md border-slate-200">
                                    <CardHeader className="border-b border-slate-100 pb-4">
                                        <CardTitle className="text-slate-800">SGPA by Batch</CardTitle>
                                        <CardDescription>Average semester GPA across all active batches.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {data.cgpaDistribution.length === 0 ? (
                                            <div className="h-[280px] flex items-center justify-center text-text-muted">
                                                No result data available for analysis.
                                            </div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={280}>
                                                <BarChart data={data.cgpaDistribution}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                    <XAxis dataKey="batch" tick={{ fill: '#64748b', fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
                                                    <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 12 }} />
                                                    <Tooltip
                                                        contentStyle={{
                                                            background: '#1e293b', border: 'none', borderRadius: '12px',
                                                            color: '#fff', fontSize: '13px', padding: '10px 16px'
                                                        }}
                                                    />
                                                    <Bar dataKey="avgCgpa" name="Avg SGPA" radius={[6, 6, 0, 0]}>
                                                        {data.cgpaDistribution.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Faculty Course Load - Pie Chart */}
                                <Card className="shadow-md border-slate-200">
                                    <CardHeader className="border-b border-slate-100 pb-4">
                                        <CardTitle className="text-slate-800">Faculty Course Load</CardTitle>
                                        <CardDescription>Distribution of subjects assigned to faculty members.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {data.facultyCourseLoad.length === 0 ? (
                                            <div className="h-[280px] flex items-center justify-center text-text-muted">
                                                No faculty data available.
                                            </div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={280}>
                                                <PieChart>
                                                    <Pie
                                                        data={data.facultyCourseLoad}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={3}
                                                        dataKey="courses"
                                                        nameKey="name"
                                                        label={((props: any) => `${props.name} (${props.value})`) as any}
                                                    >
                                                        {data.facultyCourseLoad.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            background: '#1e293b', border: 'none', borderRadius: '12px',
                                                            color: '#fff', fontSize: '13px', padding: '10px 16px'
                                                        }}
                                                    />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        )}
                                    </CardContent>
                                </Card>

                            </div>
                        ) : null}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
