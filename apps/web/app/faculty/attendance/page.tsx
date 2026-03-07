'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { AttendanceManagement } from '@/components/faculty/attendance-management';
import { facultyNavItems } from '../page';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AttendancePage() {
    return (
        <DashboardLayout
            title="Attendance Management"
            navItems={facultyNavItems}
        >
            <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
                <Suspense fallback={<Skeleton className="h-96 rounded-3xl bg-surface" />}>
                    <AttendanceManagement />
                </Suspense>
            </div>
        </DashboardLayout>
    );
}
