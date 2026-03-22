'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuBuilding2, LuUsers, LuLayoutDashboard, LuClipboardList, LuShieldCheck } from 'react-icons/lu';
import { SUPERADMIN_NAV } from '@/lib/constants/nav-config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function SuperAdminOverview() {
    const { user } = useAuthStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [stats, setStats] = useState({ universities: 0, loading: true });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const uniRes = await api.get('/universities');
                setStats({ universities: uniRes.data.length, loading: false });
            } catch (e: any) {
                console.warn("Failed to fetch admin stats:", e.message);
                setStats((prev) => ({ ...prev, loading: false }));
            }
        };
        fetchStats();
    }, []);


    const navItems = SUPERADMIN_NAV;

    return (
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <DashboardLayout navItems={navItems} title={`Welcome, ${user?.username || 'Super Admin'}`}>
                <div className="mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-text-primary glow-sm">Welcome, {user?.username || 'Super Admin'}</h2>
                    <p className="text-slate-600 dark:text-text-muted mt-2">Here is the overview of the NEP Scheduler system across all institutions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-border backdrop-blur-md shadow-xl dark:shadow-2xl overflow-hidden rounded-2xl group hover:border-neon-cyan/30 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="text-sm font-bold text-text-muted uppercase tracking-wider">Total Universities</CardTitle>
                            <LuBuilding2 className="w-5 h-5 text-neon-cyan glow-cyan" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-slate-900 dark:text-text-primary">
                                {stats.loading ? '...' : stats.universities}
                            </div>
                            <p className="text-xs text-text-secondary mt-2 font-medium">Provisioned institutions</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-border backdrop-blur-md shadow-xl dark:shadow-2xl overflow-hidden rounded-2xl group hover:border-neon-purple/30 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="text-sm font-bold text-text-muted uppercase tracking-wider">System Logs</CardTitle>
                            <LuClipboardList className="w-5 h-5 text-neon-purple shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
                        </CardHeader>
                        <CardContent>
                            <Link href="/superadmin/logs" className="text-xl font-bold text-slate-700 dark:text-text-muted hover:text-neon-purple transition-colors flex items-center group/link">
                                View Audit Trail <span className="ml-2 group-hover/link:translate-x-1 transition-transform">→</span>
                            </Link>
                            <p className="text-xs text-text-secondary mt-2 font-medium">Trace administrative actions</p>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
