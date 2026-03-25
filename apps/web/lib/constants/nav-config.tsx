import {
    LuLayoutDashboard, LuUsers, LuGraduationCap, LuBookOpen, LuNetwork,
    LuMonitor, LuCalendar, LuShieldCheck, LuBuilding2, LuUser,
    LuClipboardList, LuMailOpen, LuBanknote, LuLifeBuoy, LuTrendingUp,
    LuFileText as LuFileLineChart, LuShieldAlert, LuCompass, LuCpu,
    LuLibrary, LuBriefcase, LuTrophy, LuSend, LuVote, LuShield, LuRocket, LuCircleHelp
} from 'react-icons/lu';
import { ReactNode } from 'react';

export interface NavItem {
    title: string;
    href: string;
    icon: ReactNode;
}

export const DEPT_ADMIN_NAV: NavItem[] = [
    { title: 'Overview', href: '/department', icon: <LuLayoutDashboard className="w-5 h-5" /> },
    { title: 'Faculty', href: '/department/faculty', icon: <LuUsers className="w-5 h-5" /> },
    { title: 'Students', href: '/department/students', icon: <LuUsers className="w-5 h-5" /> },
    { title: 'Early Warning', href: '/department/students/risk', icon: <LuShieldAlert className="w-5 h-5" /> },
    { title: 'Marks Review', href: '/department/marks', icon: <LuClipboardList className="w-5 h-5" /> },
    { title: 'Programs', href: '/department/courses', icon: <LuGraduationCap className="w-5 h-5" /> },
    { title: 'Subjects', href: '/department/subjects', icon: <LuBookOpen className="w-5 h-5" /> },
    { title: 'Finance', href: '/department/finance', icon: <LuBanknote className="w-5 h-5" /> },
    { title: 'Elective Baskets', href: '/department/electives', icon: <LuClipboardList className="w-5 h-5" /> },
    { title: 'Admissions', href: '/department/admissions', icon: <LuClipboardList className="w-5 h-5" /> },
    { title: 'Batches', href: '/department/batches', icon: <LuNetwork className="w-5 h-5" /> },
    { title: 'Resources', href: '/department/resources', icon: <LuMonitor className="w-5 h-5" /> },
    { title: 'Leave Approvals', href: '/department/leave', icon: <LuClipboardList className="w-5 h-5" /> },
    { title: 'IoT Devices', href: '/department/iot', icon: <LuCpu className="w-5 h-5" /> },
    { title: 'Helpdesk', href: '/department/helpdesk', icon: <LuLifeBuoy className="w-5 h-5" /> },
    { title: 'Analytics', href: '/department/analytics', icon: <LuTrendingUp className="w-5 h-5" /> },
    { title: 'Result Trends', href: '/department/results/trends', icon: <LuTrendingUp className="w-5 h-5" /> },
    { title: 'Faculty Metrics', href: '/department/faculty/performance', icon: <LuTrophy className="w-5 h-5" /> },
    { title: 'Timetables', href: '/department/timetables', icon: <LuCalendar className="w-5 h-5" /> },
    { title: 'Message History', href: '/history', icon: <LuClipboardList className="w-5 h-5" /> },
    { title: 'Profile', href: '/profile', icon: <LuUser className="w-5 h-5" /> },
];

export const UNI_ADMIN_NAV: NavItem[] = [
    { title: 'Overview', href: '/dashboard', icon: <LuLayoutDashboard className="w-5 h-5" /> },
    { title: 'Departments', href: '/dashboard/departments', icon: <LuBuilding2 className="w-5 h-5" /> },
    { title: 'Users', href: '/dashboard/users', icon: <LuUsers className="w-5 h-5" /> },
    { title: 'Programs', href: '/dashboard/programs', icon: <LuGraduationCap className="w-5 h-5" /> },
    { title: 'Admissions', href: '/dashboard/admissions', icon: <LuClipboardList className="w-5 h-5" /> },
    { title: 'Courses', href: '/dashboard/courses', icon: <LuBookOpen className="w-5 h-5" /> },
    { title: 'Library', href: '/dashboard/library', icon: <LuLibrary className="w-5 h-5" /> },
    { title: 'Placements', href: '/dashboard/placements', icon: <LuBriefcase className="w-5 h-5" /> },
    { title: 'NAAC Metrics', href: '/dashboard/naac', icon: <LuShieldCheck className="w-5 h-5" /> },
    { title: 'Result Processing', href: '/dashboard/results', icon: <LuTrendingUp className="w-5 h-5" /> },
    { title: 'Message History', href: '/history', icon: <LuClipboardList className="w-5 h-5" /> },
    { title: 'My Profile', href: '/profile', icon: <LuUser className="w-5 h-5" /> },
];

export const APPROVAL_ADMIN_NAV: NavItem[] = [
    { title: 'Overview', href: '/approval', icon: <LuLayoutDashboard className="w-5 h-5" /> },
    { title: 'Marks Verification', href: '/approval/marks', icon: <LuShieldCheck className="w-5 h-5" /> },
    { title: 'Profile', href: '/profile', icon: <LuUser className="w-5 h-5" /> },
];

export const SUPERADMIN_NAV: NavItem[] = [
    { title: 'Dashboard', href: '/superadmin', icon: <LuLayoutDashboard className="w-5 h-5" /> },
    { title: 'Universities', href: '/superadmin/universities', icon: <LuBuilding2 className="w-5 h-5" /> },
    { title: 'Users', href: '/superadmin/users', icon: <LuUsers className="w-5 h-5" /> },
    { title: 'Subscribers', href: '/superadmin/subscribers', icon: <LuMailOpen className="w-5 h-5" /> },
    { title: 'Inquiries', href: '/superadmin/inquiries', icon: <LuMailOpen className="w-5 h-5" /> },
    { title: 'Broadcasts', href: '/superadmin/broadcasts', icon: <LuSend className="w-5 h-5" /> },
    { title: 'Permissions', href: '/superadmin/permissions', icon: <LuShieldCheck className="w-5 h-5" /> },
    { title: 'Global Settings', href: '/superadmin/settings', icon: <LuShieldCheck className="w-5 h-5" /> },
    { title: 'Audit Logs', href: '/superadmin/logs', icon: <LuClipboardList className="w-5 h-5" /> },
    { title: 'Profile', href: '/profile', icon: <LuUser className="w-5 h-5" /> },
];

export const FACULTY_NAV: NavItem[] = [
    { title: 'Dashboard', href: '/faculty-panel', icon: <LuLayoutDashboard className="w-5 h-5" /> },
    { title: 'Marks Entry', href: '/faculty-panel/marks', icon: <LuClipboardList className="w-5 h-5" /> },
    { title: 'My Schedule', href: '/faculty-panel/schedule', icon: <LuCalendar className="w-5 h-5" /> },
    { title: 'Message History', href: '/history', icon: <LuClipboardList className="w-5 h-5" /> },
    { title: 'Profile Settings', href: '/profile', icon: <LuUser className="w-5 h-5" /> },
];

export const STUDENT_NAV: NavItem[] = [
    { title: 'Dashboard', href: '/student', icon: <LuLayoutDashboard className="w-5 h-5" /> },
    { title: 'Timetable', href: '/student/timetable', icon: <LuCalendar className="w-5 h-5" /> },
    { title: 'Attendance', href: '/student/attendance', icon: <LuShieldCheck className="w-5 h-5" /> },
    { title: 'Academics', href: '/student/academics', icon: <LuBookOpen className="w-5 h-5" /> },
    { title: 'My Results', href: '/student/results', icon: <LuTrendingUp className="w-5 h-5" /> },
    { title: 'Fees & Finance', href: '/student/fees', icon: <LuBanknote className="w-5 h-5" /> },
    { title: 'Library', href: '/student/library', icon: <LuLibrary className="w-5 h-5" /> },
    { title: 'Placement', href: '/student/placement', icon: <LuBriefcase className="w-5 h-5" /> },
    { title: 'Governance', href: '/student/governance', icon: <LuVote className="w-5 h-5" /> },
    { title: 'Identity', href: '/student/identity', icon: <LuShield className="w-5 h-5" /> },
    { title: 'Scholarships', href: '/student/scholarships', icon: <LuGraduationCap className="w-5 h-5" /> },
    { title: 'Learning Hub', href: '/student/learning', icon: <LuMonitor className="w-5 h-5" /> },
    { title: 'Equity Hub', href: '/student/equity', icon: <LuRocket className="w-5 h-5" /> },
    { title: 'Service Requests', href: '/student/requests', icon: <LuCircleHelp className="w-5 h-5" /> },
    { title: 'Career Path', href: '/student/career', icon: <LuCompass className="w-5 h-5" /> },
    { title: 'AI Assistant', href: '/student/assistant', icon: <LuCpu className="w-5 h-5" /> },
    { title: 'Messages', href: '/student/messages', icon: <LuMailOpen className="w-5 h-5" /> },
    { title: 'Materials', href: '/student/materials', icon: <LuBookOpen className="w-5 h-5" /> },
    { title: 'Grievances', href: '/student/complaints', icon: <LuShieldAlert className="w-5 h-5" /> },
    { title: 'Profile', href: '/student/profile', icon: <LuUser className="w-5 h-5" /> },
];
