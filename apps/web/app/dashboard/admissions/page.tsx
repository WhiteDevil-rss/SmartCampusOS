'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    LuLoader, 
    LuFileText, 
    LuTrendingUp, 
    LuCheck, 
    LuClock, 
    LuX,
    LuDownload,
    LuFilter
} from 'react-icons/lu';
import { useToast } from '@/components/ui/toast-alert';
import { Badge } from '@/components/ui/badge';

export default function UniAdmissionsPage() {
    const { user } = useAuthStore();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const fetchAdmissions = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/v2/admissions/university/${user?.universityId}`);
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch university admissions:', error);
            showToast('error', 'Failed to load admission analytics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.universityId) {
            fetchAdmissions();
        }
    }, [user]);

    const statsCards = [
        { title: 'Total Applications', value: data?.total || 0, icon: LuFileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { title: 'Approved', value: data?.stats?.approved || 0, icon: LuCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { title: 'Pending Review', value: data?.stats?.pending || 0, icon: LuClock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { title: 'Rejected', value: data?.stats?.rejected || 0, icon: LuX, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    ];

    return (
        <DashboardLayout navItems={[]} title="University Admissions Dashboard">
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-heading font-black text-white">Admissions Overview</h2>
                        <p className="text-muted text-sm">Aggregated real-time metrics across all departments.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="border-border bg-surface/50 text-white hover:bg-surface">
                            <LuDownload className="w-4 h-4 mr-2" /> Export Report
                        </Button>
                        <Button onClick={fetchAdmissions} className="bg-primary hover:bg-primary/90 text-white">
                            Refresh Data
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((stat, i) => (
                        <Card key={i} className="bg-surface border-border overflow-hidden relative group transition-all duration-200 ease-out hover:border-primary/50">
                            <div className={`absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity ${stat.color}`}>
                                <stat.icon className="w-12 h-12" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted">{stat.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{loading ? '...' : stat.value}</div>
                                {stat.title === 'Total Applications' && !loading && (
                                    <p className="text-xs text-emerald-400 mt-1 flex items-center">
                                        <LuTrendingUp className="w-3 h-3 mr-1" /> +12.5% from last month
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Area */}
                <Card className="bg-surface border-border overflow-hidden shadow-sm">
                    <CardHeader className="border-b border-border bg-background/50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-heading font-black text-white">Department breakdown</CardTitle>
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                                <LuFilter className="w-4 h-4 mr-2" /> Filter
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex h-64 items-center justify-center">
                                <LuLoader className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : !data?.applications?.length ? (
                            <div className="flex flex-col items-center justify-center p-12">
                                <LuFileText className="w-12 h-12 text-slate-500 mb-4" />
                                <h3 className="text-xl font-bold text-white">No data available</h3>
                                <p className="text-text-secondary">No admission applications found for this university.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 text-text-secondary text-xs uppercase tracking-wider">
                                            <th className="px-6 py-4 font-bold">Applicant Details</th>
                                            <th className="px-6 py-4 font-bold">Department</th>
                                            <th className="px-6 py-4 font-bold">Program</th>
                                            <th className="px-6 py-4 font-bold">Applied Date</th>
                                            <th className="px-6 py-4 font-bold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {data.applications.map((app: any) => (
                                            <tr key={app.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-white group-hover:text-primary transition-colors">{app.applicantName}</div>
                                                    <div className="text-xs text-text-secondary">{app.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="bg-surface border-border text-text-secondary">
                                                        {app.department?.shortName || 'N/A'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-white">
                                                    {app.program?.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-text-secondary">
                                                    {new Date(app.appliedAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={`${
                                                        app.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' :
                                                        app.status === 'PENDING' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                                                        app.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-500 border-rose-500/30' :
                                                        'bg-blue-500/20 text-blue-500 border-blue-500/30'
                                                    } border`}>
                                                        {app.status}
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

                {/* Info Alert */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3 items-start">
                    <LuCheck className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-blue-400">Read-Only View</p>
                        <p className="text-xs text-text-secondary mt-1">
                            This panel is for university-level monitoring and reporting. All admission decisions (Approval/Rejection) are handled exclusively by the respective departments.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
