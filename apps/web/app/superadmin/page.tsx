'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Building2, Users, LayoutDashboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function SuperAdminOverview() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [stats, setStats] = useState({ universities: 0, loading: true });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const uniRes = await api.get('/universities');
                setStats({ universities: uniRes.data.length, loading: false });
            } catch (e) {
                console.error(e);
                setStats((prev) => ({ ...prev, loading: false }));
            }
        };
        fetchStats();
    }, []);

    const navItems = [
        { title: 'Overview', href: '/superadmin', icon: <LayoutDashboard className="w-5 h-5" /> },
        { title: 'Universities', href: '/superadmin/universities', icon: <Building2 className="w-5 h-5" /> },
        { title: 'Users', href: '/superadmin/users', icon: <Users className="w-5 h-5" /> },
    ];

    return (
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <DashboardLayout navItems={navItems} title="Super Admin Dashboard">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Welcome, Super Admin</h2>
                    <p className="text-slate-500">Here is the overview of the NEP Scheduler system.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total Universities</CardTitle>
                            <Building2 className="w-4 h-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.loading ? '...' : stats.universities}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
