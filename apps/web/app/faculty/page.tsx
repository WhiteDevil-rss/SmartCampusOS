'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import {
    LayoutDashboard,
    Calendar,
    ClipboardList,
    BookOpen,
    MessageCircle,
    User,
    HelpCircle,
} from 'lucide-react';
import { FacultyDashboard } from '@/components/faculty/faculty-dashboard';

// Exported so sub-pages can reference the same navigation items
// icon is ReactNode (JSX element) to match DashboardLayout's NavItem type
export const facultyNavItems = [
    { title: 'Dashboard', href: '/faculty', icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: 'My Schedule', href: '/faculty/schedule', icon: <Calendar className="w-5 h-5" /> },
    { title: 'Attendance', href: '/faculty/attendance', icon: <ClipboardList className="w-5 h-5" /> },
    { title: 'Academics', href: '/faculty/academics', icon: <BookOpen className="w-5 h-5" /> },
    { title: 'Assignments', href: '/faculty/assignments', icon: <ClipboardList className="w-5 h-5" /> },
    { title: 'Messages', href: '/faculty/messages', icon: <MessageCircle className="w-5 h-5" /> },
    { title: 'Support', href: '/faculty/support', icon: <HelpCircle className="w-5 h-5" /> },
    { title: 'My Profile', href: '/faculty/profile', icon: <User className="w-5 h-5" /> },
];

export default function FacultyPage() {
    return (
        <ProtectedRoute allowedRoles={['FACULTY']}>
            <DashboardLayout
                title="Faculty Dashboard"
                navItems={facultyNavItems}
            >
                <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
                    <FacultyDashboard />
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
