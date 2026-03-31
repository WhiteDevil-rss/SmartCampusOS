'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DEPT_ADMIN_NAV } from '@/lib/constants/nav-config';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    LuShieldAlert, LuTrendingDown, LuActivity, LuSearch,
    LuTriangleAlert, LuCheck, LuInfo
} from 'react-icons/lu';
import { Progress } from '@/components/ui/progress';

interface RiskData {
    id: string;
    name: string;
    enrollmentNo: string;
    program: string;
    semester: string | number;
    attendanceParams: { percentage: number };
    academicParams: { averageGrade: number, currentSgpa: number };
    riskScore: number;
    riskCategory: 'High' | 'Medium' | 'Low';
}

export default function StudentRiskAnalyticsPage() {
    const { user } = useAuthStore();
    const [data, setData] = useState<RiskData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user?.entityId) return;
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const res = await api.get(`/v2/analytics/${user!.entityId}/risk`);
            setData(res.data);
        } catch (error) {
            console.error('Failed to load risk analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = data.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => b.riskScore - a.riskScore); // Sort by highest risk first

    const getRiskCategoryColor = (category: string) => {
        switch (category) {
            case 'High': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
            case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30';
            case 'Low': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN']}>
            <DashboardLayout navItems={DEPT_ADMIN_NAV} title="Student Risk Analytics">
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <LuShieldAlert className="w-6 h-6 text-red-500" />
                                Early Warning System
                            </h1>
                            <p className="text-text-secondary">Predictive analytics to identify at-risk students based on attendance and academic performance.</p>
                        </div>
                        <div className="relative w-full md:w-72">
                            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                            <Input
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 dark:bg-[#0a0a0c] dark:border-border-hover"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="glass-card shadow-sm border-slate-200 dark:border-border-hover">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-text-secondary">High Risk Students</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <LuTriangleAlert className="w-5 h-5 text-red-500" />
                                    <span className="text-3xl font-bold text-red-600">
                                        {data.filter(d => d.riskCategory === 'High').length}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card shadow-sm border-slate-200 dark:border-border-hover">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-text-secondary">Medium Risk Students</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <LuInfo className="w-5 h-5 text-amber-500" />
                                    <span className="text-3xl font-bold text-amber-600">
                                        {data.filter(d => d.riskCategory === 'Medium').length}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card shadow-sm border-slate-200 dark:border-border-hover">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-text-secondary">Low Risk (On Track)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <LuCheck className="w-5 h-5 text-emerald-500" />
                                    <span className="text-3xl font-bold text-emerald-600">
                                        {data.filter(d => d.riskCategory === 'Low').length}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="glass-card shadow-sm border-slate-200 dark:border-border-hover">
                        <CardHeader>
                            <CardTitle>Risk Analysis Breakdown</CardTitle>
                            <CardDescription>
                                The Risk Score (0-100) is calculated using a weighted formula: 40% Attendance deficit, 30% Assignment grade deficit, and 30% SGPA performance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center p-8"><LuActivity className="w-6 h-6 animate-spin text-indigo-500" /></div>
                            ) : filteredData.length === 0 ? (
                                <div className="text-center p-8 text-text-secondary">No students found matching your search.</div>
                            ) : (
                                <div className="table-container">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead>
                                            <tr className="border-b dark:border-border-hover">
                                                <th className="p-3 font-semibold text-slate-600 dark:text-text-muted">Student Info</th>
                                                <th className="p-3 font-semibold text-slate-600 dark:text-text-muted">Attendance</th>
                                                <th className="p-3 font-semibold text-slate-600 dark:text-text-muted">Assignments</th>
                                                <th className="p-3 font-semibold text-slate-600 dark:text-text-muted">Latest SGPA</th>
                                                <th className="p-3 font-semibold text-slate-600 dark:text-text-muted">Overall Risk Score</th>
                                                <th className="p-3 font-semibold text-slate-600 dark:text-text-muted">Category</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.map(student => (
                                                <tr key={student.id} className="border-b dark:border-border-hover hover:bg-slate-50 dark:hover:bg-surface transition-colors">
                                                    <td className="p-3">
                                                        <div className="font-medium text-slate-900 dark:text-text-primary">{student.name}</div>
                                                        <div className="text-xs text-text-secondary font-mono mt-0.5">{student.enrollmentNo}</div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`text-xs font-bold w-9 ${student.attendanceParams.percentage < 75 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                                {student.attendanceParams.percentage}%
                                                            </div>
                                                            <Progress value={student.attendanceParams.percentage} className="w-20" color={student.attendanceParams.percentage < 75 ? 'bg-red-500' : 'bg-emerald-500'} />
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className={`text-xs font-bold ${student.academicParams.averageGrade < 50 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                            {student.academicParams.averageGrade}% Avg
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={`font-semibold ${student.academicParams.currentSgpa < 5.0 ? 'text-red-500' : ''}`}>
                                                                {student.academicParams.currentSgpa.toFixed(2)}
                                                            </span>
                                                            {student.academicParams.currentSgpa < 5.0 && <LuTrendingDown className="w-3 h-3 text-red-500" />}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-lg w-8">{student.riskScore}</span>
                                                            <Progress
                                                                value={student.riskScore}
                                                                className="w-24 bg-slate-100"
                                                                indicatorClassName={student.riskScore > 60 ? 'bg-red-500' : student.riskScore > 30 ? 'bg-amber-500' : 'bg-emerald-500'}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant="outline" className={getRiskCategoryColor(student.riskCategory)}>
                                                            {student.riskCategory} Risk
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
