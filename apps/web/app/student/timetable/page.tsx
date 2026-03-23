'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { StudentTimetable } from '@/components/student/student-timetable';
import { STUDENT_NAV } from '@/lib/constants/nav-config';

export default function TimetablePage() {
    return (
        <DashboardLayout
            title="Weekly Timetable"
            navItems={STUDENT_NAV}
        >
            <StudentTimetable />
        </DashboardLayout>
    );
}
