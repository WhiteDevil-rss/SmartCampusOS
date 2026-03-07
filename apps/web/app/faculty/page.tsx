'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { FacultyDashboard } from '@/components/faculty/faculty-dashboard';
import {
    LuLayoutDashboard,
    LuCalendar,
    LuCheck,
    LuBookOpen,
    LuFileText,
    LuMessageSquare,
    LuUser,
    LuCircleHelp
} from 'react-icons/lu';

export const facultyNavItems = [
    { title: 'Dashboard', href: '/faculty', icon: <LuLayoutDashboard className="w-5 h-5" /> },
    { title: 'My Schedule', href: '/faculty/schedule', icon: <LuCalendar className="w-5 h-5" /> },
    { title: 'Attendance', href: '/faculty/attendance', icon: <LuCheck className="w-5 h-5" /> },
    { title: 'Academics', href: '/faculty/academics', icon: <LuBookOpen className="w-5 h-5" /> },
    { title: 'Assignments', href: '/faculty/assignments', icon: <LuFileText className="w-5 h-5" /> },
    { title: 'Messages', href: '/faculty/messages', icon: <LuMessageSquare className="w-5 h-5" /> },
    { title: 'Profile', href: '/faculty/profile', icon: <LuUser className="w-5 h-5" /> },
    { title: 'Help & Support', href: '/faculty/support', icon: <LuCircleHelp className="w-5 h-5" /> },
];

export default function FacultyPage() {
    return (
        <DashboardLayout
            title="Faculty Overview"
            navItems={facultyNavItems}
        >
            <FacultyDashboard />
        </DashboardLayout>
    );
}
