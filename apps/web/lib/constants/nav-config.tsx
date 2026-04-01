import {
    LayoutDashboard, Users, GraduationCap, BookOpen, Network,
    Monitor, Calendar, ShieldCheck, Building2, User,
    ClipboardList, MailOpen, Banknote, LifeBuoy, TrendingUp,
    FileText as FileLineChart, ShieldAlert, Compass, Cpu,
    Library, Briefcase, Trophy, Send, Vote, Shield, Rocket, CircleHelp,
    Layers, ArrowRightLeft, Bell, Wrench
} from 'lucide-react';
import { ReactNode } from 'react';

export interface NavItem {
    title: string;
    href: string;
    icon: ReactNode;
    section?: string;
    badge?: string | number;
    badgeColor?: string;
}

export const DEPT_ADMIN_NAV: NavItem[] = [
    { title: 'Overview', href: '/department', icon: <LayoutDashboard className="w-5 h-5" />, section: 'Workspace' },
    { title: 'Admissions', href: '/department/admissions', icon: <ClipboardList className="w-5 h-5" />, section: 'Workspace', badge: 'Live', badgeColor: 'bg-primary' },
    { title: 'Inquiries', href: '/department/inquiries', icon: <MailOpen className="w-5 h-5" />, section: 'Workspace' },
    { title: 'Helpdesk', href: '/department/helpdesk', icon: <LifeBuoy className="w-5 h-5" />, section: 'Workspace' },
    { title: 'Faculty', href: '/department/faculty', icon: <Users className="w-5 h-5" />, section: 'Operations' },
    { title: 'Students', href: '/department/students', icon: <Users className="w-5 h-5" />, section: 'Operations' },
    { title: 'Attendance Alerts', href: '/department/leave', icon: <ShieldCheck className="w-5 h-5" />, section: 'Operations' },
    { title: 'Student Transfers', href: '/department/student-transfers', icon: <ArrowRightLeft className="w-5 h-5" />, section: 'Operations' },
    { title: 'Batches', href: '/department/batches', icon: <Network className="w-5 h-5" />, section: 'Academics' },
    { title: 'Divisions', href: '/department/divisions', icon: <Layers className="w-5 h-5" />, section: 'Academics' },
    { title: 'Classes', href: '/department/classes', icon: <BookOpen className="w-5 h-5" />, section: 'Academics' },
    { title: 'Timetables', href: '/department/timetables', icon: <Calendar className="w-5 h-5" />, section: 'Academics' },
    { title: 'Programs', href: '/department/courses', icon: <GraduationCap className="w-5 h-5" />, section: 'Academics' },
    { title: 'Subjects', href: '/department/subjects', icon: <BookOpen className="w-5 h-5" />, section: 'Academics' },
    { title: 'Electives', href: '/department/electives', icon: <Compass className="w-5 h-5" />, section: 'Academics' },
    { title: 'Results', href: '/department/results', icon: <TrendingUp className="w-5 h-5" />, section: 'Intelligence' },
    { title: 'Marks Review', href: '/department/marks', icon: <ClipboardList className="w-5 h-5" />, section: 'Intelligence' },
    { title: 'Analytics', href: '/department/analytics', icon: <FileLineChart className="w-5 h-5" />, section: 'Intelligence' },
    { title: 'Resources', href: '/department/resources', icon: <Library className="w-5 h-5" />, section: 'Services' },
    { title: 'Finance', href: '/department/finance', icon: <Banknote className="w-5 h-5" />, section: 'Services' },
    { title: 'IoT', href: '/department/iot', icon: <Cpu className="w-5 h-5" />, section: 'Services' },
    { title: 'Notifications', href: '/settings/notifications', icon: <Bell className="w-5 h-5" />, section: 'Account' },
    { title: 'Profile', href: '/profile', icon: <User className="w-5 h-5" />, section: 'Account' },
];

export const UNI_ADMIN_NAV: NavItem[] = [
    { title: 'Overview', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, section: 'Workspace' },
    { title: 'Departments', href: '/dashboard/departments', icon: <Building2 className="w-5 h-5" />, section: 'Operations' },
    { title: 'Users', href: '/dashboard/users', icon: <Users className="w-5 h-5" />, section: 'Operations' },
    { title: 'Programs', href: '/dashboard/programs', icon: <GraduationCap className="w-5 h-5" />, section: 'Academics' },
    { title: 'Admissions', href: '/dashboard/admissions', icon: <ClipboardList className="w-5 h-5" />, section: 'Academics', badge: 'Live', badgeColor: 'bg-emerald-500' },
    { title: 'Courses', href: '/dashboard/courses', icon: <BookOpen className="w-5 h-5" />, section: 'Academics' },
    { title: 'Library', href: '/dashboard/library', icon: <Library className="w-5 h-5" />, section: 'Services' },
    { title: 'Placements', href: '/dashboard/placements', icon: <Briefcase className="w-5 h-5" />, section: 'Services' },
    { title: 'NAAC Metrics', href: '/dashboard/naac', icon: <ShieldCheck className="w-5 h-5" />, section: 'Intelligence' },
    { title: 'Results', href: '/dashboard/results', icon: <TrendingUp className="w-5 h-5" />, section: 'Intelligence' },
    { title: 'History', href: '/history', icon: <ClipboardList className="w-5 h-5" />, section: 'Intelligence' },
    { title: 'Security', href: '/dashboard/security', icon: <ShieldAlert className="w-5 h-5 text-indigo-400" />, section: 'Intelligence', badge: 'Live', badgeColor: 'bg-indigo-600' },
    { title: 'Resources', href: '/dashboard/resources', icon: <Library className="w-5 h-5 text-emerald-400" />, section: 'Intelligence', badge: 'Ops', badgeColor: 'bg-emerald-600' },
    { title: 'Networking', href: '/dashboard/networking', icon: <Network className="w-5 h-5 text-amber-400" />, section: 'Intelligence', badge: 'AI', badgeColor: 'bg-amber-600' },
    { title: 'Notifications', href: '/settings/notifications', icon: <Bell className="w-5 h-5" />, section: 'Account' },
    { title: 'Profile', href: '/profile', icon: <User className="w-5 h-5" />, section: 'Account' },
];

export const APPROVAL_ADMIN_NAV: NavItem[] = [
    { title: 'Overview', href: '/approval', icon: <LayoutDashboard className="w-5 h-5" />, section: 'Workspace' },
    { title: 'Marks Verification', href: '/approval/marks', icon: <ShieldCheck className="w-5 h-5" />, section: 'Operations' },
    { title: 'Notifications', href: '/settings/notifications', icon: <Bell className="w-5 h-5" />, section: 'Account' },
    { title: 'Profile', href: '/profile', icon: <User className="w-5 h-5" />, section: 'Account' },
];

export const SUPERADMIN_NAV: NavItem[] = [
    { title: 'Overview', href: '/superadmin', icon: <LayoutDashboard className="w-5 h-5" />, section: 'Platform' },
    { title: 'Institutions', href: '/superadmin/universities', icon: <Building2 className="w-5 h-5" />, section: 'Platform' },
    { title: 'Identity', href: '/superadmin/users', icon: <Users className="w-5 h-5" />, section: 'Platform' },
    { title: 'Audience', href: '/superadmin/subscribers', icon: <MailOpen className="w-5 h-5" />, section: 'Comms' },
    { title: 'Lead Inbox', href: '/superadmin/inquiries', icon: <MailOpen className="w-5 h-5" />, section: 'Comms' },
    { title: 'Broadcast Studio', href: '/superadmin/broadcasts', icon: <Send className="w-5 h-5" />, section: 'Comms' },
    { title: 'Access Matrix', href: '/superadmin/permissions', icon: <ShieldCheck className="w-5 h-5" />, section: 'Security' },
    { title: 'Session Policy', href: '/superadmin/settings/session', icon: <Shield className="w-5 h-5" />, section: 'Security' },
    { title: 'System Settings', href: '/superadmin/settings', icon: <Cpu className="w-5 h-5" />, section: 'Security' },
    { title: 'Audit Trail', href: '/superadmin/logs', icon: <ClipboardList className="w-5 h-5" />, section: 'Security' },
    { title: 'Notifications', href: '/settings/notifications', icon: <Bell className="w-5 h-5" />, section: 'Account' },
    { title: 'Profile', href: '/profile', icon: <User className="w-5 h-5" />, section: 'Account' },
];

export const FACULTY_NAV: NavItem[] = [
    { title: 'Dashboard', href: '/faculty-panel', icon: <LayoutDashboard className="w-5 h-5" />, section: 'Workspace' },
    { title: 'Marks Entry', href: '/faculty-panel/marks', icon: <ClipboardList className="w-5 h-5" />, section: 'Teaching' },
    { title: 'Schedule', href: '/faculty-panel/schedule', icon: <Calendar className="w-5 h-5" />, section: 'Teaching' },
    { title: 'Notifications', href: '/settings/notifications', icon: <Bell className="w-5 h-5" />, section: 'Account' },
    { title: 'Profile', href: '/profile', icon: <User className="w-5 h-5" />, section: 'Account' },
];

export const STUDENT_NAV: NavItem[] = [
    { title: 'Dashboard', href: '/student', icon: <LayoutDashboard className="w-5 h-5" />, section: 'Workspace' },
    { title: 'Networking', href: '/dashboard/networking', icon: <Network className="w-5 h-5" />, section: 'Services', badge: 'AI', badgeColor: 'bg-indigo-600' },
    { title: 'Schedule', href: '/student/schedule', icon: <Calendar className="w-5 h-5" />, section: 'Academics' },
    { title: 'Attendance', href: '/student/attendance', icon: <ShieldCheck className="w-5 h-5" />, section: 'Academics' },
    { title: 'Academics', href: '/student/academics', icon: <BookOpen className="w-5 h-5" />, section: 'Academics' },
    { title: 'Results', href: '/student/results', icon: <TrendingUp className="w-5 h-5" />, section: 'Academics' },
    { title: 'Fees', href: '/student/fees', icon: <Banknote className="w-5 h-5" />, section: 'Services' },
    { title: 'Notifications', href: '/settings/notifications', icon: <Bell className="w-5 h-5" />, section: 'Account' },
    { title: 'Profile', href: '/student/profile', icon: <User className="w-5 h-5" />, section: 'Account' },
];
