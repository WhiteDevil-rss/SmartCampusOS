'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { V2DashboardLayout } from '@/components/v2/layout/dashboard-layout';
import { FacultyDashboard } from '@/components/faculty/faculty-dashboard';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function FacultyPanelPage() {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute allowedRoles={['FACULTY']}>
      <V2DashboardLayout title={`Faculty Hub: ${user?.username || 'Professor'}`}>
        <div className="space-y-12 pb-24">
          {/* Dashboard Content */}
          <FacultyDashboard />
        </div>
      </V2DashboardLayout>
    </ProtectedRoute>
  );
}
