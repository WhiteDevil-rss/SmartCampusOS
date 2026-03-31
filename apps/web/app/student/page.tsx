'use client';

import { V2DashboardLayout } from '@/components/v2/layout/dashboard-layout';
import { StudentDashboard } from '@/components/student/student-dashboard';

export default function StudentPage() {
    return (
        <V2DashboardLayout title="Student Dashboard">
            <StudentDashboard />
        </V2DashboardLayout>
    );
}
