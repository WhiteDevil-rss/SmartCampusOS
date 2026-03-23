'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { StudentDashboard } from '@/components/student/student-dashboard';
import { STUDENT_NAV } from '@/lib/constants/nav-config';

export default function StudentPage() {
    return (
        <DashboardLayout
            title="Student Overview"
            navItems={STUDENT_NAV}
        >
            <StudentDashboard />
        </DashboardLayout>
    );
}
