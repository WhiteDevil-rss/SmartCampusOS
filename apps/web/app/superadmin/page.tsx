'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { V2DashboardLayout } from '@/components/v2/layout/dashboard-layout';
import { BentoGridDashboard } from '@/components/v2/dashboard/bento-grid';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  Building2, 
  Users, 
  FileText, 
  ShieldCheck, 
  Activity,
  Server,
  Database,
  Globe
} from 'lucide-react';

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

    // SuperAdmin specific data items for the Bento Grid
    const superAdminQuickStats = [
      {
        title: "Total Institutions",
        value: stats.universities,
        change: 12, // Mocked for visual impact
        icon: Building2,
        changeDescription: "vs last month"
      },
      {
        title: "Active Nodes",
        value: 142,
        change: 5.4,
        icon: Server,
        changeDescription: "system wide"
      },
      {
        title: "Security Level",
        value: 99.9,
        change: 0.1,
        suffix: "%",
        icon: ShieldCheck,
        changeDescription: "Uptime verified"
      }
    ];

    const additionalSystemStats = [
      {
        title: "Total Faculty",
        value: 1240,
        change: 8.2,
        icon: Users,
        changeDescription: "Across 42 departments"
      },
      {
        title: "Database Sync",
        value: 100,
        suffix: "%",
        change: 0,
        icon: Database,
        changeDescription: "Real-time active"
      }
    ];

    return (
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <V2DashboardLayout title={`System Console: ${user?.username || 'Super Admin'}`}>
                <BentoGridDashboard 
                  userName={user?.username || 'Super Admin'}
                  role="SUPERADMIN"
                  customMetricCards={superAdminQuickStats}
                />
            </V2DashboardLayout>
        </ProtectedRoute>
    );
}

