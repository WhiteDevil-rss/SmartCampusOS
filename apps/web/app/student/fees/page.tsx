'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { StudentFeesDashboard } from '@/components/student/student-fees-dashboard';
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
    LuLandmark
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

export default function FeesPage() {
    return (
        <DashboardLayout
            title="Student Financial Portal"
            navItems={studentNavItems}
        >
            <div className="min-h-screen bg-slate-50/50 dark:bg-[#0a0a0c] selection:bg-indigo-500/30">
                <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto relative">
                    {/* Background Decorative Element */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />

                    <div className="relative mb-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                                    Financial Dashboard
                                </span>
                                <div className="h-px w-12 bg-border" />
                            </div>
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="space-y-2">
                                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[0.9]">
                                        Fees & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400 italic">Finance</span>
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
                                        Executive command center for academic investments, digital receipts, and real-time financial tracking.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <StudentFeesDashboard />
                </div>
            </div>
        </DashboardLayout>
    );
}
