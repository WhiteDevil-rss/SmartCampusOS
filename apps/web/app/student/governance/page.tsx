'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { StudentGovernanceDashboard } from '@/components/student/student-governance-dashboard';
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
    LuCircleHelp,
    LuVote
} from 'react-icons/lu';

const studentNavItems = [
    { title: 'Dashboard', href: '/student', icon: <LuLayoutDashboard className="w-5 h-5" /> },
    { title: 'Timetable', href: '/student/timetable', icon: <LuCalendar className="w-5 h-5" /> },
    { title: 'Attendance', href: '/student/attendance', icon: <LuCheck className="w-5 h-5" /> },
    { title: 'Academics', href: '/student/academics', icon: <LuBookOpen className="w-5 h-5" /> },
    { title: 'Fees & Finance', href: '/student/fees', icon: <LuCreditCard className="w-5 h-5" /> },
    { title: 'Library', href: '/student/library', icon: <LuLibrary className="w-5 h-5" /> },
    { title: 'Placement', href: '/student/placement', icon: <LuBriefcase className="w-5 h-5" /> },
    { title: 'Governance', href: '/student/governance', icon: <LuVote className="w-5 h-5" /> },
    { title: 'Service Requests', href: '/student/requests', icon: <LuCircleHelp className="w-5 h-5" /> },
    { title: 'Messages', href: '/student/messages', icon: <LuMessageSquare className="w-5 h-5" /> },
    { title: 'Profile', href: '/student/profile', icon: <LuUser className="w-5 h-5" /> },
];

export default function GovernancePage() {
    return (
        <DashboardLayout
            title="Governance & IP"
            navItems={studentNavItems}
        >
            <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
                <div className="relative mb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-primary">
                            <span className="p-2 rounded-xl bg-primary/10">
                                <LuVote className="w-5 h-5" />
                            </span>
                            <span className="text-xs font-black uppercase tracking-widest text-primary">Decentralized Governance</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter">
                            Vote & <span className="text-primary italic">Verify</span>
                        </h1>
                        <p className="text-text-secondary text-lg font-medium max-w-xl">
                            Empower your voice. Participate in campus-wide voting and secure your intellectual property on the blockchain.
                        </p>
                    </div>
                </div>

                <StudentGovernanceDashboard />
            </div>
        </DashboardLayout>
    );
}
