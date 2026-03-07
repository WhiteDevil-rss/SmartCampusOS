'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { FacultySchedule } from '@/components/faculty/faculty-schedule';
import { facultyNavItems } from '../page';

export default function FacultySchedulePage() {
    return (
        <DashboardLayout
            title="My Academic Schedule"
            navItems={facultyNavItems}
        >
            <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
                <FacultySchedule />
            </div>
        </DashboardLayout>
    );
}
