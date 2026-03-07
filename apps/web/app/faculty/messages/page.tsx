'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { MessagesDashboard } from '@/components/messages-dashboard';
import { facultyNavItems } from '../page';

export default function FacultyMessagesPage() {
    return (
        <ProtectedRoute allowedRoles={['FACULTY']}>
            <DashboardLayout
                title="Faculty Messages"
                navItems={facultyNavItems}
            >
                <MessagesDashboard role="FACULTY" />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
