'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { StudentProfile } from '@/components/student/student-profile';
import { STUDENT_NAV } from '@/lib/constants/nav-config';

export default function ProfilePage() {
    return (
        <DashboardLayout
            title="My Profile"
            navItems={STUDENT_NAV}
        >
            <StudentProfile />
        </DashboardLayout>
    );
}
