'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { StudentIdentityDashboard } from '@/components/student/student-identity-dashboard';
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
    LuShieldCheck
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
    { title: 'Service Requests', href: '/student/requests', icon: <LuCircleHelp className="w-5 h-5" /> },
    { title: 'Messages', href: '/student/messages', icon: <LuMessageSquare className="w-5 h-5" /> },
    { title: 'Profile', href: '/student/profile', icon: <LuUser className="w-5 h-5" /> },
];

export default function IdentityPage() {
    return (
        <DashboardLayout
            title="Digital Identity"
            navItems={studentNavItems}
        >
            <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
                <div className="relative mb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-emerald-400">
                            <span className="p-2 rounded-xl bg-emerald-500/10">
                                <LuShieldCheck className="w-5 h-5" />
                            </span>
                            <span className="text-xs font-black uppercase tracking-widest">Self-Sovereign Identity</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter">
                            Your Decentralized <span className="text-emerald-400 italic">Core</span>
                        </h1>
                        <p className="text-text-secondary text-lg font-medium max-w-xl">
                            Verified. Secure. Under your control. Manage your campus identity, resource access, and tournament entries immutably.
                        </p>
                    </div>
                </div>

                <StudentIdentityDashboard />
            </div>
        </DashboardLayout>
    );
}
