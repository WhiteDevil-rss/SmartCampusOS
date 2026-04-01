"use client";

import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Building2, Server, ShieldCheck, Database, Activity, Zap } from 'lucide-react';
import { SUPERADMIN_NAV } from '@/lib/constants/nav-config';
import { SuperAdminPageHeader } from '@/components/superadmin/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitoringDashboard } from '@/components/superadmin/monitoring-dashboard';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function SuperAdminOverview() {
    const { user } = useAuthStore();
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

    return (
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <DashboardLayout navItems={SUPERADMIN_NAV} title="Command Center">
                <div className="flex flex-col gap-10">
                    <SuperAdminPageHeader
                        eyebrow="Platform intelligence"
                        title={`Operational console for ${user?.username || 'Super Admin'}`}
                        description="Orchestrate institutional partitions, monitor service telemetry, and enforce global security protocols from one unified surface."
                        icon={<ShieldCheck className="h-8 w-8" />}
                        stats={[
                            { label: 'Institutions', value: stats.universities },
                            { label: 'Active Nodes', value: <span className="flex items-center gap-2">142 <Activity className="h-4 w-4 text-emerald-500 animate-pulse" /></span> },
                            { label: 'Security Score', value: <span className="text-primary italic">99.9%</span> },
                        ]}
                    />

                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="flex flex-col gap-10"
                    >
                        <motion.div variants={item}>
                            <MonitoringDashboard />
                        </motion.div>
                    </motion.div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
