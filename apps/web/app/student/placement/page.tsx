'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { StudentPlacementDashboard } from '@/components/student/student-placement-dashboard';
import {
    LuLayoutDashboard,
    LuCalendar,
    LuCheck,
    LuBookOpen,
    LuCreditCard,
    LuLibrary,
    LuBriefcase,
    LuUser,
    LuMessageSquare,
    LuCircleHelp
} from 'react-icons/lu';

const studentNavItems = [
    { title: 'Dashboard', href: '/student', icon: <LuLayoutDashboard className="w-5 h-5" /> },
    { title: 'Timetable', href: '/student/timetable', icon: <LuCalendar className="w-5 h-5" /> },
    { title: 'Attendance', href: '/student/attendance', icon: <LuCheck className="w-5 h-5" /> },
    { title: 'Academics', href: '/student/academics', icon: <LuBookOpen className="w-5 h-5" /> },
    { title: 'Fees & Finance', href: '/student/fees', icon: <LuCreditCard className="w-5 h-5" /> },
    { title: 'Library', href: '/student/library', icon: <LuLibrary className="w-5 h-5" /> },
    { title: 'Placement', href: '/student/placement', icon: <LuBriefcase className="w-5 h-5" /> },
    { title: 'Service Requests', href: '/student/requests', icon: <LuCircleHelp className="w-5 h-5" /> },
    { title: 'Messages', href: '/student/messages', icon: <LuMessageSquare className="w-5 h-5" /> },
    { title: 'Profile', href: '/student/profile', icon: <LuUser className="w-5 h-5" /> },
];

export default function PlacementPage() {
    return (
        <DashboardLayout
            title="Placement Cell"
            navItems={studentNavItems}
        >
            <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
                <div className="relative mb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-blue-400">
                            <span className="p-2 rounded-xl bg-blue-500/10">
                                <LuBriefcase className="w-5 h-5" />
                            </span>
                            <span className="text-xs font-black uppercase tracking-widest">Career Hub</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter">
                            Placement & <span className="text-blue-400 italic">Careers</span>
                        </h1>
                        <p className="text-text-secondary text-lg font-medium max-w-xl">
                            Track your direct campus placement status and view upcoming company recruitment drives.
                        </p>
                    </div>
                </div>

                <StudentPlacementDashboard />
            </div>
        </DashboardLayout>
    );
}
