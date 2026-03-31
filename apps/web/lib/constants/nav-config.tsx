import {
    LayoutDashboard, Users, GraduationCap, BookOpen, Network,
    Monitor, Calendar, ShieldCheck, Building2, User,
    ClipboardList, MailOpen, Banknote, LifeBuoy, TrendingUp,
    FileText as FileLineChart, ShieldAlert, Compass, Cpu,
    Library, Briefcase, Trophy, Send, Vote, Shield, Rocket, CircleHelp,
    Layers, ArrowRightLeft
} from 'lucide-react';
import { ReactNode } from 'react';

export interface NavItem {
    title: string;
    href: string;
    icon: ReactNode;
    badge?: string | number;
    badgeColor?: string;
}

export const DEPT_ADMIN_NAV: NavItem[] = [
    { title: 'Overview', href: '/department', icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: 'Faculty', href: '/department/faculty', icon: <Users className="w-5 h-5" /> },
    { title: 'Students', href: '/department/students', icon: <Users className="w-5 h-5" /> },
    { title: 'Admissions', href: '/department/admissions', icon: <ClipboardList className="w-5 h-5" />, badge: 12, badgeColor: 'bg-primary' },
    { title: 'Batches', href: '/department/batches', icon: <Network className="w-5 h-5" /> },
    { title: 'Divisions', href: '/department/divisions', icon: <Layers className="w-5 h-5" /> },
    { title: 'Academic Classes', href: '/department/classes', icon: <BookOpen className="w-5 h-5" /> },
    { title: 'Student Transfers', href: '/department/student-transfers', icon: <ArrowRightLeft className="w-5 h-5" /> },
    { title: 'Timetable Builder', href: '/department/timetables', icon: <Calendar className="w-5 h-5" /> },
    { title: 'Programs', href: '/department/courses', icon: <GraduationCap className="w-5 h-5" /> },
    { title: 'Subjects', href: '/department/subjects', icon: <BookOpen className="w-5 h-5" /> },
    { title: 'Analytics', href: '/department/analytics', icon: <TrendingUp className="w-5 h-5" /> },
    { title: 'Profile', href: '/profile', icon: <User className="w-5 h-5" /> },
];

export const UNI_ADMIN_NAV: NavItem[] = [
    { title: 'Overview', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: 'Departments', href: '/dashboard/departments', icon: <Building2 className="w-5 h-5" /> },
    { title: 'Users', href: '/dashboard/users', icon: <Users className="w-5 h-5" /> },
    { title: 'Programs', href: '/dashboard/programs', icon: <GraduationCap className="w-5 h-5" /> },
    { title: 'Admissions', href: '/dashboard/admissions', icon: <ClipboardList className="w-5 h-5" />, badge: 'New', badgeColor: 'bg-emerald-500' },
    { title: 'Courses', href: '/dashboard/courses', icon: <BookOpen className="w-5 h-5" /> },
    { title: 'Library', href: '/dashboard/library', icon: <Library className="w-5 h-5" /> },
    { title: 'Placements', href: '/dashboard/placements', icon: <Briefcase className="w-5 h-5" /> },
    { title: 'NAAC Metrics', href: '/dashboard/naac', icon: <ShieldCheck className="w-5 h-5" /> },
    { title: 'Result Processing', href: '/dashboard/results', icon: <TrendingUp className="w-5 h-5" /> },
    { title: 'Message History', href: '/history', icon: <ClipboardList className="w-5 h-5" /> },
    { title: 'My Profile', href: '/profile', icon: <User className="w-5 h-5" /> },
];

export const APPROVAL_ADMIN_NAV: NavItem[] = [
    { title: 'Overview', href: '/approval', icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: 'Marks Verification', href: '/approval/marks', icon: <ShieldCheck className="w-5 h-5" /> },
    { title: 'Profile', href: '/profile', icon: <User className="w-5 h-5" /> },
];

export const SUPERADMIN_NAV: NavItem[] = [
    { title: 'Dashboard', href: '/superadmin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: 'Universities', href: '/superadmin/universities', icon: <Building2 className="w-5 h-5" /> },
    { title: 'Users', href: '/superadmin/users', icon: <Users className="w-5 h-5" /> },
    { title: 'Subscribers', href: '/superadmin/subscribers', icon: <MailOpen className="w-5 h-5" /> },
    { title: 'Inquiries', href: '/superadmin/inquiries', icon: <MailOpen className="w-5 h-5" />, badge: 5, badgeColor: 'bg-rose-500' },
    { title: 'Broadcasts', href: '/superadmin/broadcasts', icon: <Send className="w-5 h-5" /> },
    { title: 'Permissions', href: '/superadmin/permissions', icon: <ShieldCheck className="w-5 h-5" /> },
    { title: 'Global Settings', href: '/superadmin/settings', icon: <ShieldCheck className="w-5 h-5" /> },
    { title: 'Audit Logs', href: '/superadmin/logs', icon: <ClipboardList className="w-5 h-5" /> },
    { title: 'Profile', href: '/profile', icon: <User className="w-5 h-5" /> },
];

export const FACULTY_NAV: NavItem[] = [
    { title: 'Dashboard', href: '/faculty-panel', icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: 'Marks Entry', href: '/faculty-panel/marks', icon: <ClipboardList className="w-5 h-5" /> },
    { title: 'My Schedule', href: '/faculty-panel/schedule', icon: <Calendar className="w-5 h-5" /> },
    { title: 'Profile Settings', href: '/profile', icon: <User className="w-5 h-5" /> },
];

export const STUDENT_NAV: NavItem[] = [
    { title: 'Dashboard', href: '/student', icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: 'My Schedule', href: '/student/schedule', icon: <Calendar className="w-5 h-5" /> },
    { title: 'Attendance', href: '/student/attendance', icon: <ShieldCheck className="w-5 h-5" /> },
    { title: 'Academics', href: '/student/academics', icon: <BookOpen className="w-5 h-5" /> },
    { title: 'My Results', href: '/student/results', icon: <TrendingUp className="w-5 h-5" /> },
    { title: 'Fees & Finance', href: '/student/fees', icon: <Banknote className="w-5 h-5" /> },
    { title: 'Profile', href: '/student/profile', icon: <User className="w-5 h-5" /> },
];
