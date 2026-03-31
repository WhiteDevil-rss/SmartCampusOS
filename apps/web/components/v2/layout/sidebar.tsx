"use client";

import * as React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronRight,
  ChevronDown,
  LogOut,
  User,
  Building2,
  Shield,
  Clock,
  BookOpen,
  ClipboardList,
  Network,
  ArrowRightLeft,
  MailOpen,
  Send,
  ShieldCheck,
  GraduationCap,
  Library,
  Briefcase,
  TrendingUp,
  Layers,
  Calendar,
  Banknote,
  Bell,
  Terminal
} from "lucide-react";

const getRoleColor = (role: string) => {
  switch (role?.toUpperCase()) {
    case 'STUDENT': return '#f97316'; // Orange
    case 'FACULTY': return '#8b5cf6'; // Purple
    case 'UNI_ADMIN':
    case 'SUPERADMIN':
    case 'ADMIN':
    case 'DEPARTMENT':
    case 'DEPT_ADMIN':
      return '#0070ff'; // Blue
    default: return '#0070ff';
  }
};

// --- Helpers ---

const getNavItems = (role: string): NavItem[] => {
  switch (role?.toUpperCase()) {
    case "SUPERADMIN":
      return [
        { title: 'Dashboard', href: '/superadmin', icon: LayoutDashboard },
        { title: 'Universities', href: '/superadmin/universities', icon: Building2 },
        { title: 'Users', href: '/superadmin/users', icon: Users },
        { title: 'Subscribers', href: '/superadmin/subscribers', icon: MailOpen },
        { title: 'Inquiries', href: '/superadmin/inquiries', icon: MailOpen, badge: "3" },
        { title: 'Broadcasts', href: '/superadmin/broadcasts', icon: Send },
        { title: 'Permissions', href: '/superadmin/permissions', icon: ShieldCheck },
        { title: 'Global Settings', href: '/superadmin/settings', icon: ShieldCheck },
        { title: 'Audit Logs', href: '/superadmin/logs', icon: ClipboardList },
        { title: 'Profile', href: '/profile', icon: User },
      ];
    case "UNI_ADMIN":
      return [
        { title: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { title: 'Departments', href: '/dashboard/departments', icon: Building2 },
        { title: 'Users', href: '/dashboard/users', icon: Users },
        { title: 'Programs', href: '/dashboard/programs', icon: GraduationCap },
        { title: 'Admissions', href: '/dashboard/admissions', icon: ClipboardList, badge: "New" },
        { title: 'Courses', href: '/dashboard/courses', icon: BookOpen },
        { title: 'Library', href: '/dashboard/library', icon: Library },
        { title: 'Placements', href: '/dashboard/placements', icon: Briefcase },
        { title: 'NAAC Metrics', href: '/dashboard/naac', icon: ShieldCheck },
        { title: 'Result Processing', href: '/dashboard/results', icon: TrendingUp },
        { title: 'Message History', href: '/history', icon: ClipboardList },
        { title: 'My Profile', href: '/profile', icon: User },
      ];
    case "ADMIN":
    case "DEPARTMENT":
    case "DEPT_ADMIN":
      return [
        { title: 'Overview', href: '/department', icon: LayoutDashboard },
        { title: 'Faculty', href: '/department/faculty', icon: Users },
        { title: 'Students', href: '/department/students', icon: Users, badge: "12" },
        { title: 'Admissions', href: '/department/admissions', icon: ClipboardList },
        { title: 'Batches', href: '/department/batches', icon: Network },
        { title: 'Divisions', href: '/department/divisions', icon: Layers },
        { title: 'Academic Classes', href: '/department/classes', icon: BookOpen },
        { title: 'Student Transfers', href: '/department/student-transfers', icon: ArrowRightLeft },
        { title: 'Timetable Builder', href: '/department/timetables', icon: Calendar },
        { title: 'Programs', href: '/department/courses', icon: GraduationCap },
        { title: 'Subjects', href: '/department/subjects', icon: BookOpen },
        { title: 'Analytics', href: '/department/analytics', icon: TrendingUp },
        { title: 'Profile', href: '/profile', icon: User },
      ];
    case "FACULTY":
      return [
        { title: 'Dashboard', href: '/faculty-panel', icon: LayoutDashboard },
        { title: 'Marks Entry', href: '/faculty-panel/marks', icon: ClipboardList, badge: "!" },
        { title: 'My Schedule', href: '/faculty-panel/schedule', icon: Calendar },
        { title: 'Profile Settings', href: '/profile', icon: User },
      ];
    case "STUDENT":
      return [
        { title: 'Dashboard', href: '/student', icon: LayoutDashboard },
        { title: 'My Schedule', href: '/student/schedule', icon: Calendar },
        { title: 'Attendance', href: '/student/attendance', icon: ShieldCheck },
        { title: 'Academics', href: '/student/academics', icon: BookOpen },
        { title: 'My Results', href: '/student/results', icon: TrendingUp, badge: "8.4" },
        { title: 'Fees & Finance', href: '/student/fees', icon: Banknote },
        { title: 'Profile', href: '/student/profile', icon: User },
      ];
    default:
      return [{ title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" }];
  }
};

// --- Types ---

export interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  children?: NavItem[];
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  initials: string;
}

interface SidebarProps {
  userName: string;
  userRole: string;
  userEmail?: string;
  avatar?: string;
  onNavigate?: (href: string) => void;
  onLogout?: () => void;
  className?: string;
  isMobile?: boolean; // New prop for mobile drawer
  onCloseMobile?: () => void; // New prop to close mobile drawer when navigating
}

// --- Animation Variants ---

const sidebarVariants: Variants = {
  expanded: {
    width: "280px",
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  collapsed: {
    width: "80px",
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  mobile: {
    width: "100%",
    transition: { type: "spring", stiffness: 300, damping: 30 },
  }
};

const contentVariants: Variants = {
  expanded: {
    opacity: 1,
    x: 0,
    display: "block",
    transition: { delay: 0.1, duration: 0.2 },
  },
  collapsed: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.1 },
    transitionEnd: { display: "none" },
  },
};

// --- Components ---

const NavItemComponent: React.FC<{
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
  onNavigate: (href: string) => void;
  level?: number;
}> = ({ item, isCollapsed, isActive, onNavigate, level = 0 }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="w-full">
      <button
        onClick={() => {
          if (hasChildren && !isCollapsed) {
            setIsOpen(!isOpen);
          } else {
            onNavigate(item.href);
          }
        }}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 group relative cursor-pointer",
          isActive 
            ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]" 
            : "text-slate-400 hover:text-slate-100 hover:bg-white/5",
          level > 0 && !isCollapsed && "ml-4"
        )}
      >
        {isActive && (
          <motion.div 
            layoutId="active-indicator"
            className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_8px_var(--primary)]" 
          />
        )}
        
        <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-primary" : "group-hover:text-primary")} />
        
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="flex items-center justify-between flex-1 min-w-0"
            >
              <span className={cn(
                "text-sm font-medium truncate",
                isActive ? "text-slate-100" : "group-hover:text-slate-100"
              )}>
                {item.title}
              </span>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] px-1.5 h-4 font-black uppercase tracking-widest ring-1 ring-primary/20">
                    {item.badge}
                  </Badge>
                )}
                {hasChildren && (
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200 text-slate-600",
                      isOpen && "rotate-90"
                    )}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#0a1120] text-slate-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[200] whitespace-nowrap border border-white/10 shadow-xl shadow-black/50 font-bold uppercase tracking-widest">
            {item.title}
            {item.badge && <span className="ml-2 text-primary">[{item.badge}]</span>}
          </div>
        )}
      </button>

      <AnimatePresence>
        {hasChildren && isOpen && !isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-1 space-y-1"
          >
            {item.children?.map((child) => (
              <NavItemComponent
                key={child.href}
                item={child}
                isCollapsed={isCollapsed}
                isActive={isActive && child.href === item.href}
                onNavigate={onNavigate}
                level={level + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const IndustrialSidebar: React.FC<SidebarProps> = ({
  userName,
  userRole,
  userEmail = "admin@smartcampus.os",
  avatar,
  onNavigate = () => {},
  onLogout = () => {},
  className,
  isMobile = false,
  onCloseMobile,
}) => {
  const [internalCollapsed, setInternalCollapsed] = React.useState(true);
  const [activeItem, setActiveItem] = React.useState("");

  // On mobile, never collapse. On desktop, follow internal state.
  const isCollapsed = isMobile ? false : internalCollapsed;

  const user: UserProfile = {
    name: userName,
    role: userRole,
    email: userEmail,
    avatar: avatar,
    initials: userName.split(" ").map(n => n[0]).join("").toUpperCase()
  };

  const navItems = React.useMemo(() => getNavItems(userRole), [userRole]);

  React.useEffect(() => {
     if (typeof window !== "undefined") {
        setActiveItem(window.location.pathname);
     }
  }, []);

  const handleNavigate = (href: string) => {
    setActiveItem(href);
    onNavigate(href);
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      initial={isMobile ? "mobile" : "collapsed"}
      animate={isMobile ? "mobile" : (isCollapsed ? "collapsed" : "expanded")}
      onMouseEnter={() => !isMobile && setInternalCollapsed(false)}
      onMouseLeave={() => !isMobile && setInternalCollapsed(true)}
      style={{ 
        '--primary': getRoleColor(userRole),
        '--primary-glow': `${getRoleColor(userRole)}33`
      } as React.CSSProperties}
      className={cn(
        "bg-[#020817] flex flex-col z-50 transition-colors",
        !isMobile ? "fixed left-0 top-0 h-screen border-r border-white/5 shadow-2xl shadow-black/50" : "h-full w-full",
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/40 shrink-0">
            <Terminal className="h-6 w-6 text-white" />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="overflow-hidden"
              >
                <h1 className="text-sm font-black text-slate-100 tracking-tighter uppercase font-space-grotesk">SmartCampus <span className="text-primary italic">OS</span></h1>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Online</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-6 px-4 space-y-8">
        {/* Main Menu */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 mb-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] font-space-grotesk">Institutional</p>
          )}
          {navItems.map((item) => (
            <NavItemComponent
              key={item.href}
              item={item}
              isCollapsed={isCollapsed}
              isActive={activeItem === item.href}
              onNavigate={handleNavigate}
            />
          ))}
        </div>

        {/* Account Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 mb-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] font-space-grotesk">Personal</p>
          )}
          <NavItemComponent
            item={{
              title: "Notifications",
              icon: Bell,
              href: "/notifications",
              badge: "New"
            }}
            isCollapsed={isCollapsed}
            isActive={activeItem === "/notifications"}
            onNavigate={handleNavigate}
          />
          <NavItemComponent
            item={{
              title: "System Settings",
              icon: Settings,
              href: "/settings",
            }}
            isCollapsed={isCollapsed}
            isActive={activeItem === "/settings"}
            onNavigate={handleNavigate}
          />
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-white/5 bg-white/[0.02] backdrop-blur-sm shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 group cursor-pointer",
                "hover:bg-primary/5 border border-transparent hover:border-primary/20"
              )}
            >
              <Avatar className="h-10 w-10 border-2 border-white/5 group-hover:border-primary/50 transition-colors shadow-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-black font-space-grotesk">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div
                    variants={contentVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="flex items-center justify-between flex-1 min-w-0"
                  >
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-black text-slate-200 truncate group-hover:text-white transition-colors font-space-grotesk">
                        {user.name}
                      </span>
                      <span className="text-[9px] font-black text-zinc-500 truncate uppercase mt-0.5 tracking-widest">
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-600 group-hover:text-primary transition-colors" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={isMobile ? "center" : "end"}
            side={isMobile ? "top" : "right"}
            sideOffset={12}
            className="w-64 bg-[#0a1120]/95 backdrop-blur-xl border-white/10 p-2 rounded-2xl shadow-2xl z-[100]"
          >
            <div className="px-3 py-4 border-b border-white/5 mb-2">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Authenticated Account</p>
              <p className="text-sm font-bold text-slate-100 truncate">{user.email}</p>
            </div>
            <DropdownMenuItem 
              onClick={() => handleNavigate('/profile')}
              className="rounded-xl text-slate-300 focus:bg-primary/10 focus:text-primary gap-3 py-3 font-medium cursor-pointer"
            >
              <User className="h-4 w-4" />
              <span>Personal Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleNavigate('/settings')}
              className="rounded-xl text-slate-300 focus:bg-primary/10 focus:text-primary gap-3 py-3 font-medium cursor-pointer"
            >
              <Shield className="h-4 w-4" />
              <span>Security Hub</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5 my-2" />
            <DropdownMenuItem
              onClick={onLogout}
              className="rounded-xl text-rose-400 focus:bg-rose-500/10 focus:text-rose-400 gap-3 py-3 font-bold cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Terminate Session</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.aside>
  );
};
