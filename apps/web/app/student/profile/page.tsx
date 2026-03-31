'use client';

import { V2DashboardLayout } from '@/components/v2/layout/dashboard-layout';
import { StudentProfile } from '@/components/student/student-profile';

export default function ProfilePage() {
    return (
        <V2DashboardLayout title="My Profile">
            <StudentProfile />
        </V2DashboardLayout>
    );
}
