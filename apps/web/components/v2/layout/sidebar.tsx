"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ChevronDown,
  ChevronRight,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  Terminal,
  X,
} from "lucide-react";
import {
  APPROVAL_ADMIN_NAV,
  DEPT_ADMIN_NAV,
  FACULTY_NAV,
  STUDENT_NAV,
  SUPERADMIN_NAV,
  UNI_ADMIN_NAV,
  type NavItem as ConfigNavItem,
} from "@/lib/constants/nav-config";

const getRoleColor = (role: string) => {
  switch (role?.toUpperCase()) {
    case "STUDENT":
      return "#f97316";
    case "FACULTY":
      return "#8b5cf6";
    case "UNI_ADMIN":
    case "SUPERADMIN":
    case "ADMIN":
    case "DEPARTMENT":
    case "DEPT_ADMIN":
      return "#0070ff";
    default:
      return "#0070ff";
  }
};

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  section?: string;
}

interface SidebarProps {
  userName: string;
  userRole: string;
  userEmail?: string;
  avatar?: string;
  onLogout?: () => void;
  className?: string;
  isMobile?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  initials: string;
}

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
  },
};

const contentVariants: Variants = {
  expanded: {
    opacity: 1,
    x: 0,
    display: "block",
    transition: { delay: 0.05, duration: 0.2 },
  },
  collapsed: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.1 },
    transitionEnd: { display: "none" },
  },
};

const getNavItems = (role: string): NavItem[] => {
  let items: ConfigNavItem[] = [];

  switch (role?.toUpperCase()) {
    case "SUPERADMIN":
      items = SUPERADMIN_NAV;
      break;
    case "UNI_ADMIN":
    case "COLLEGE_ADMIN":
      items = UNI_ADMIN_NAV;
      break;
    case "DEPT_ADMIN":
    case "DEPARTMENT":
    case "ADMIN":
      items = DEPT_ADMIN_NAV;
      break;
    case "FACULTY":
      items = FACULTY_NAV;
      break;
    case "STUDENT":
      items = STUDENT_NAV;
      break;
    case "APPROVAL_ADMIN":
      items = APPROVAL_ADMIN_NAV;
      break;
    default:
      items = UNI_ADMIN_NAV;
      break;
  }

  return items.map((item) => ({
    title: item.title,
    href: item.href,
    icon: item.icon,
    badge: item.badge ? String(item.badge) : undefined,
    section: item.section,
  }));
};

const groupNavItems = (items: NavItem[]) =>
  items.reduce<Array<{ section: string; items: NavItem[] }>>((groups, item) => {
    const section = item.section || "General";
    const existing = groups.find((group) => group.section === section);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.push({ section, items: [item] });
    }
    return groups;
  }, []);

const isItemActive = (pathname: string, href: string) =>
  pathname === href || (href !== "/profile" && href !== "/settings/notifications" && pathname.startsWith(`${href}/`));

const NavItemComponent: React.FC<{
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
  onNavigate?: () => void;
}> = ({ item, isCollapsed, isActive, onNavigate }) => (
  <Link href={item.href} onClick={onNavigate} title={item.title}>
    <div
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors duration-200 group relative cursor-pointer border",
        isActive
          ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
          : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border-transparent"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="v2-active-indicator"
          className="absolute inset-0 rounded-2xl border border-primary/25"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      <div className={cn("relative z-10 shrink-0", isActive ? "text-primary" : "group-hover:text-primary")}>
        {item.icon}
      </div>

      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            variants={contentVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="flex items-center justify-between flex-1 min-w-0"
          >
            <span
              className={cn(
                "text-sm font-bold truncate",
                isActive ? "text-slate-100" : "group-hover:text-slate-100"
              )}
            >
              {item.title}
            </span>
            {item.badge ? (
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] px-1.5 h-4 font-black uppercase tracking-widest ring-1 ring-primary/20">
                {item.badge}
              </Badge>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {isCollapsed && (
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#0a1120] text-slate-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[200] whitespace-nowrap border border-white/10 shadow-xl shadow-black/50 font-bold uppercase tracking-widest">
          {item.title}
          {item.badge ? <span className="ml-2 text-primary">[{item.badge}]</span> : null}
        </div>
      )}
    </div>
  </Link>
);

export const IndustrialSidebar: React.FC<SidebarProps> = ({
  userName,
  userRole,
  userEmail = "admin@smartcampus.os",
  avatar,
  onLogout = () => {},
  className,
  isMobile = false,
  isCollapsed = false,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  const user: UserProfile = {
    name: userName,
    role: userRole,
    email: userEmail,
    avatar,
    initials: userName
      .split(" ")
      .filter(Boolean)
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };

  const navItems = React.useMemo(() => getNavItems(userRole), [userRole]);
  const groupedItems = React.useMemo(() => groupNavItems(navItems), [navItems]);

  return (
    <motion.aside
      variants={sidebarVariants}
      initial={isMobile ? "mobile" : isCollapsed ? "collapsed" : "expanded"}
      animate={isMobile ? "mobile" : isCollapsed ? "collapsed" : "expanded"}
      style={
        {
          "--primary": getRoleColor(userRole),
          "--primary-glow": `${getRoleColor(userRole)}33`,
          "--primary-rgb":
            getRoleColor(userRole) === "#f97316"
              ? "249, 115, 22"
              : getRoleColor(userRole) === "#8b5cf6"
                ? "139, 92, 246"
                : "0, 112, 255",
        } as React.CSSProperties
      }
      className={cn(
        "bg-[#020817] flex flex-col z-50 transition-colors",
        !isMobile ? "fixed left-0 top-0 h-screen border-r border-white/5 shadow-2xl shadow-black/50" : "h-full w-full",
        className
      )}
    >
      <div className="h-20 flex items-center px-5 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4 w-full">
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
                className="overflow-hidden min-w-0 flex-1"
              >
                <h1 className="text-sm font-black text-slate-100 tracking-tighter uppercase font-space-grotesk truncate">
                  SmartCampus <span className="text-primary italic">OS</span>
                </h1>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Online</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isMobile && onToggleCollapse ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="ml-auto p-2 rounded-xl border border-white/10 text-slate-500 hover:text-white hover:bg-white/5 transition-all"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          ) : null}

          {isMobile && onCloseMobile ? (
            <button
              type="button"
              onClick={onCloseMobile}
              className="ml-auto p-2 rounded-xl border border-white/10 text-slate-500 hover:text-white hover:bg-white/5 transition-all"
              title="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-6 px-4 space-y-8">
        {groupedItems.map((group) => (
          <div key={group.section} className="space-y-1">
            {!isCollapsed ? (
              <p className="px-3 mb-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] font-space-grotesk">
                {group.section}
              </p>
            ) : null}
            {group.items.map((item) => (
              <NavItemComponent
                key={item.href}
                item={item}
                isCollapsed={isCollapsed}
                isActive={isItemActive(pathname, item.href)}
                onNavigate={isMobile ? onCloseMobile : undefined}
              />
            ))}
          </div>
        ))}
      </div>

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
                        {user.role.replace("_", " ")}
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
            <DropdownMenuItem asChild className="rounded-xl text-slate-300 focus:bg-primary/10 focus:text-primary gap-3 py-3 font-medium cursor-pointer">
              <Link href="/profile" onClick={isMobile ? onCloseMobile : undefined}>
                <ChevronRight className="h-4 w-4" />
                <span>Personal Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl text-slate-300 focus:bg-primary/10 focus:text-primary gap-3 py-3 font-medium cursor-pointer">
              <Link href="/settings/notifications" onClick={isMobile ? onCloseMobile : undefined}>
                <Shield className="h-4 w-4" />
                <span>Notification Settings</span>
              </Link>
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
