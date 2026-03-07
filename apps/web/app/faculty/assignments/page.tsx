'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { AssignmentManager } from '@/components/faculty/assignment-manager';
import { facultyNavItems } from '../page';

export default function FacultyAssignmentsPage() {
    return (
        <ProtectedRoute allowedRoles={['FACULTY']}>
            <DashboardLayout
                title="Assignment Management"
                navItems={facultyNavItems}
            >
                <AssignmentManager />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
