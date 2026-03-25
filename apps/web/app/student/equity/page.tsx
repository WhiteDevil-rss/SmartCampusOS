'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { StudentStartupDashboard } from '@/components/student/student-startup-dashboard';
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
    LuVote,
    LuShieldCheck,
    LuGraduationCap,
    LuRocket
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
    { title: 'Identity', href: '/student/identity', icon: <LuShieldCheck className="w-5 h-5" /> },
    { title: 'Scholarships', href: '/student/scholarships', icon: <LuGraduationCap className="w-5 h-5" /> },
    { title: 'EquityHub', href: '/student/equity', icon: <LuRocket className="w-5 h-5" /> },
    { title: 'Service Requests', href: '/student/requests', icon: <LuCircleHelp className="w-5 h-5" /> },
    { title: 'Messages', href: '/student/messages', icon: <LuMessageSquare className="w-5 h-5" /> },
    { title: 'Profile', href: '/student/profile', icon: <LuUser className="w-5 h-5" /> },
];

export default function EquityPage() {
    return (
        <DashboardLayout
            title="Startup Equity"
            navItems={studentNavItems}
        >
            <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
                <div className="relative mb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-primary">
                            <span className="p-2 rounded-xl bg-primary/10">
                                <LuRocket className="w-5 h-5" />
                            </span>
                            <span className="text-xs font-black uppercase tracking-widest text-primary">Founder Portfolio</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter">
                            Equity <span className="text-primary italic">Hub</span>
                        </h1>
                        <p className="text-text-secondary text-lg font-medium max-w-xl">
                            Manage your startup equity, vesting schedules, and milestone distributions transparently on the blockchain.
                        </p>
                    </div>
                </div>

                <StudentStartupDashboard />
            </div>
        </DashboardLayout>
    );
}
