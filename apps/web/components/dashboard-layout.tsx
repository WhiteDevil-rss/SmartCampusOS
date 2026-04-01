'use client';

import { memo, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LuChevronRight, LuClock, LuLogOut, LuMenu, LuShieldAlert, LuSparkles, LuX } from 'react-icons/lu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationCenter } from '@/components/shared/notification-center';
import { Toast, useToast } from '@/components/ui/toast-alert';
import { APPROVAL_ADMIN_NAV, DEPT_ADMIN_NAV, FACULTY_NAV, SUPERADMIN_NAV, STUDENT_NAV, UNI_ADMIN_NAV, type NavItem } from '@/lib/constants/nav-config';
import { api, clearFrontendAuthHints } from '@/lib/api';
import { useRealtimeUpdates } from '@/lib/hooks/useRealtimeUpdates';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useSessionStore } from '@/lib/store/useSessionStore';
import { cn } from '@/lib/utils';

const ROLE_LABELS: Record<string, string> = {
    SUPERADMIN: 'Super Admin',
    UNI_ADMIN: 'University Admin',
    COLLEGE_ADMIN: 'College Admin',
    DEPT_ADMIN: 'Department Admin',
    FACULTY: 'Faculty',
    STUDENT: 'Student',
    PARENT: 'Parent',
    APPROVAL_ADMIN: 'Approval Admin',
};

const ROLE_TONES: Record<string, string> = {
    SUPERADMIN: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
    UNI_ADMIN: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/20',
    COLLEGE_ADMIN: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/20',
    DEPT_ADMIN: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
    FACULTY: 'bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/20',
    STUDENT: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20',
    PARENT: 'bg-orange-500/15 text-orange-600 dark:text-orange-300 border-orange-500/20',
    APPROVAL_ADMIN: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 border-fuchsia-500/20',
};

const SIDEBAR_COLLAPSE_STORAGE_KEY = 'scos_dashboard_sidebar_collapsed';

const getInitials = (value?: string | null) =>
    (value ?? 'SC')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'SC';

const groupNavItems = (navItems: NavItem[]) =>
    navItems.reduce<Array<{ section: string; items: NavItem[] }>>((groups, item) => {
        const section = item.section || 'General';
        const existingGroup = groups.find((group) => group.section === section);
        if (existingGroup) {
            existingGroup.items.push(item);
        } else {
            groups.push({ section, items: [item] });
        }
        return groups;
    }, []);

const SessionTimer = memo(function SessionTimer({
    isCompact = false,
    onExpire,
}: {
    isCompact?: boolean;
    onExpire: (isExpired?: boolean) => void;
}) {
    const { timeoutMinutes, lastActivityAt } = useSessionStore();
    const [currentTimeLeft, setCurrentTimeLeft] = useState(timeoutMinutes * 60);
    const expiredRef = useRef(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            if (!lastActivityAt) {
                setCurrentTimeLeft(timeoutMinutes * 60);
                expiredRef.current = false;
                return;
            }

            const expiresAt = lastActivityAt + timeoutMinutes * 60_000;
            const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
            setCurrentTimeLeft(diff);

            if (diff <= 0 && !expiredRef.current) {
                expiredRef.current = true;
                onExpire(true);
                return;
            }

            expiredRef.current = false;
        };

        calculateTimeLeft();
        const timerId = window.setInterval(calculateTimeLeft, 1000);
        return () => window.clearInterval(timerId);
    }, [lastActivityAt, onExpire, timeoutMinutes]);

    const mins = Math.floor(currentTimeLeft / 60);
    const secs = currentTimeLeft % 60;
    const formatted = `${mins}:${secs.toString().padStart(2, '0')}`;
    const isCritical = currentTimeLeft < 60;

    return (
        <div
            className={cn(
                'flex items-center gap-3 rounded-2xl border px-3 py-2 backdrop-blur-md transition-all duration-200',
                isCritical
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-500'
                    : 'border-border/80 bg-background/70 text-foreground',
                isCompact && 'gap-2 px-2.5 py-2',
            )}
        >
            {isCritical ? (
                <LuShieldAlert className="h-4 w-4 animate-pulse" />
            ) : (
                <LuClock className="h-4 w-4 text-primary" />
            )}
            <div className="flex flex-col leading-none">
                {!isCompact ? (
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                        Session
                    </span>
                ) : null}
                <span className="text-sm font-black tabular-nums tracking-tight">{formatted}</span>
            </div>
        </div>
    );
});

const SidebarContent = memo(function SidebarContent({
    user,
    navItems,
    pathname,
    title,
    isCollapsed = false,
    onToggleCollapse,
    onLogout,
    onClose,
}: {
    user: any;
    navItems: NavItem[];
    pathname: string;
    title: string;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    onLogout: () => void;
    onClose?: () => void;
}) {
    const groupedItems = groupNavItems(navItems);
    const activeItem = navItems.find(
        (item) => pathname === item.href || (item.href !== '/profile' && pathname.startsWith(`${item.href}/`)),
    );

    return (
        <div className="flex h-full flex-col font-sans select-none">
            <div className={cn('relative overflow-hidden border-b border-border/40 backdrop-blur-xl', isCollapsed ? 'px-4 py-5' : 'px-6 py-6')}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
                <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-3xl" />

                <div className={cn('relative flex items-center', isCollapsed ? 'justify-center gap-0' : 'gap-3')}>
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-inner shadow-primary/20 transition-transform hover:scale-105">
                        <LuSparkles className="h-6 w-6" />
                    </div>
                    {!isCollapsed ? (
                        <div className="min-w-0 flex-1">
                            <div className="text-xl font-black tracking-tight text-foreground">
                                Smart<span className="italic text-primary">OS</span>
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                                Central Command
                            </div>
                        </div>
                    ) : null}
                    {onToggleCollapse ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggleCollapse}
                            className={cn(
                                'rounded-xl border border-border/50 hover:bg-muted/50',
                                isCollapsed ? 'absolute -right-2 -top-2 hidden md:inline-flex' : 'hidden md:inline-flex'
                            )}
                            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            <LuChevronRight className={cn('h-4 w-4 transition-transform', !isCollapsed && 'rotate-180')} />
                        </Button>
                    ) : null}
                    {onClose ? (
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl border border-border/50 hover:bg-muted/50 md:hidden">
                            <LuX className="h-4 w-4" />
                        </Button>
                    ) : null}
                </div>

                <div className={cn('relative mt-6 rounded-[1.25rem] border border-primary/10 bg-primary/5 backdrop-blur-md', isCollapsed ? 'p-3' : 'p-4')}>
                    <div className="flex flex-col gap-2">
                        <div className={cn('flex items-center gap-2', isCollapsed ? 'justify-center' : 'justify-between')}>
                            {!isCollapsed ? (
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                                    Active Surface
                                </span>
                            ) : null}
                            <Badge
                                variant="ghost"
                                className={cn(
                                    'rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] border border-current/20',
                                    ROLE_TONES[user?.role] || ROLE_TONES.SUPERADMIN,
                                )}
                            >
                                {isCollapsed ? getInitials(ROLE_LABELS[user?.role] || user?.role || 'Operator') : ROLE_LABELS[user?.role] || user?.role || 'Operator'}
                            </Badge>
                        </div>
                        {!isCollapsed ? (
                            <div className="truncate text-base font-black tracking-tight text-foreground">
                                {activeItem?.title || title}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className={cn('flex-1 overflow-y-auto custom-scrollbar', isCollapsed ? 'px-3 py-5' : 'px-4 py-6')}>
                <div className="flex flex-col gap-8">
                    {groupedItems.map((group) => (
                        <div key={group.section} className="flex flex-col gap-3">
                            {!isCollapsed ? (
                                <div className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                                    {group.section}
                                </div>
                            ) : null}
                            <nav className="flex flex-col gap-1.5">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/profile' && pathname.startsWith(`${item.href}/`));
                                    return (
                                        <Link key={item.href} href={item.href} onClick={onClose} title={item.title}>
                                            <div
                                                className={cn(
                                                    'group relative flex items-center rounded-2xl border transition-all duration-300',
                                                    isCollapsed ? 'justify-center px-3 py-3.5' : 'gap-3 px-3 py-3',
                                                    isActive
                                                        ? 'border-primary/20 bg-primary/10 text-primary shadow-lg shadow-primary/5'
                                                        : 'border-transparent text-muted-foreground/80 hover:bg-muted/40 hover:text-foreground',
                                                )}
                                            >
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeNav"
                                                        className="absolute inset-0 z-0 rounded-2xl border border-primary/30"
                                                        initial={false}
                                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                                    />
                                                )}
                                                <div className={cn('relative z-10 flex shrink-0 items-center justify-center transition-colors', isActive ? 'text-primary' : 'group-hover:text-foreground')}>
                                                    {item.icon}
                                                </div>
                                                {!isCollapsed ? <span className="relative z-10 flex-1 truncate text-sm font-bold tracking-tight">{item.title}</span> : null}
                                                {item.badge && !isCollapsed ? (
                                                    <Badge
                                                        variant="ghost"
                                                        className={cn(
                                                            'relative z-10 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em]',
                                                            item.badgeColor || 'bg-primary text-white shadow-glow',
                                                        )}
                                                    >
                                                        {item.badge}
                                                    </Badge>
                                                ) : null}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>
            </div>

            <div className={cn('border-t border-border/40', isCollapsed ? 'p-3' : 'p-5')}>
                <div className={cn('rounded-3xl border border-border/60 bg-muted/20 backdrop-blur-md', isCollapsed ? 'p-3' : 'p-4')}>
                    <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'gap-3')}>
                        <div className="relative">
                            <Avatar className="size-12 border-2 border-primary/20 p-0.5">
                                <AvatarFallback className="bg-primary/10 text-sm font-black text-primary">
                                    {getInitials(user?.username)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 border-background bg-emerald-500 shadow-sm" />
                        </div>
                        {!isCollapsed ? (
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-black tracking-tight text-foreground">{user?.username}</div>
                                <div className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">{ROLE_LABELS[user?.role] || user?.role}</div>
                            </div>
                        ) : null}
                    </div>

                    <div className={cn('flex flex-col gap-2', isCollapsed ? 'mt-3' : 'mt-5')}>
                        <Button
                            variant="ghost"
                            className={cn(
                                'h-10 rounded-xl border border-transparent px-3 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-colors',
                                isCollapsed ? 'w-full justify-center' : 'w-full justify-start'
                            )}
                            onClick={onLogout}
                            title="Sign Out"
                        >
                            <LuLogOut className={cn('h-4 w-4', !isCollapsed && 'mr-3')} />
                            {!isCollapsed ? <span className="text-sm font-bold">Sign Out</span> : null}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
});

interface DashboardLayoutProps {
    children: ReactNode;
    navItems: NavItem[];
    title: string;
}

export function DashboardLayout({ children, navItems, title }: DashboardLayoutProps) {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const pathname = usePathname();
    const resetSession = useSessionStore((state) => state.reset);
    const { toast, showToast, hideToast } = useToast();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useRealtimeUpdates(showToast);

    const resolvedNavItems = useMemo(
        () =>
            user?.role === 'SUPERADMIN'
                ? SUPERADMIN_NAV
                : user?.role === 'UNI_ADMIN'
                    ? UNI_ADMIN_NAV
                    : user?.role === 'COLLEGE_ADMIN'
                        ? UNI_ADMIN_NAV
                    : user?.role === 'DEPT_ADMIN'
                        ? DEPT_ADMIN_NAV
                        : user?.role === 'FACULTY'
                            ? FACULTY_NAV
                            : user?.role === 'APPROVAL_ADMIN'
                                ? APPROVAL_ADMIN_NAV
                            : user?.role === 'STUDENT'
                                ? STUDENT_NAV
                                : navItems,
        [navItems, user?.role],
    );

    const handleLogout = useCallback(
        async (isExpired: boolean = false) => {
            try {
                await api.post('/auth/logout');
            } catch {
                // no-op
            }

            clearFrontendAuthHints();
            logout();
            resetSession();
            router.replace(isExpired ? '/login?expired=true' : '/login');
        },
        [logout, resetSession, router],
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const storedValue = window.localStorage.getItem(SIDEBAR_COLLAPSE_STORAGE_KEY);
        if (storedValue === '1') {
            setIsSidebarCollapsed(true);
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(SIDEBAR_COLLAPSE_STORAGE_KEY, isSidebarCollapsed ? '1' : '0');
    }, [isSidebarCollapsed]);

    const handleSidebarToggle = useCallback(() => {
        setIsSidebarCollapsed((current) => !current);
    }, []);

    const activeItem = resolvedNavItems.find(
        (item) => pathname === item.href || (item.href !== '/profile' && pathname.startsWith(`${item.href}/`)),
    );

    return (
        <div className="fixed inset-0 flex overflow-hidden mesh-gradient-premium">
            <Toast toast={toast} onClose={hideToast} />

            <aside
                className={cn(
                    'hidden shrink-0 border-r border-border/10 bg-surface/70 backdrop-blur-3xl transition-[width] duration-300 md:flex',
                    isSidebarCollapsed ? 'w-[96px]' : 'w-[320px]'
                )}
            >
                <SidebarContent
                    user={user}
                    navItems={resolvedNavItems}
                    pathname={pathname}
                    title={title}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={handleSidebarToggle}
                    onLogout={() => handleLogout()}
                />
            </aside>

            <AnimatePresence>
                {sidebarOpen ? (
                    <>
                        <motion.div
                            className="fixed inset-0 z-[var(--z-backdrop)] bg-slate-950/50 backdrop-blur-sm md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            className="fixed inset-y-0 left-0 z-[var(--z-fixed)] w-[304px] border-r border-border/70 bg-background/96 backdrop-blur-2xl md:hidden"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
                        >
                            <SidebarContent
                                user={user}
                                navItems={resolvedNavItems}
                                pathname={pathname}
                                title={title}
                                onLogout={() => handleLogout()}
                                onClose={() => setSidebarOpen(false)}
                            />
                        </motion.aside>
                    </>
                ) : null}
            </AnimatePresence>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border/10 bg-surface/40 backdrop-blur-3xl">
                    <div className="flex h-20 items-center justify-between gap-4 px-6 md:h-24 md:px-10">
                        <div className="flex min-w-0 items-center gap-4 md:gap-6">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSidebarOpen(true)}
                                className="rounded-2xl border-primary/20 bg-primary/5 md:hidden"
                            >
                                <LuMenu className="h-5 w-5 text-primary" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleSidebarToggle}
                                className="hidden rounded-2xl border-primary/20 bg-primary/5 md:inline-flex"
                                title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            >
                                <LuChevronRight className={cn('h-5 w-5 text-primary transition-transform', !isSidebarCollapsed && 'rotate-180')} />
                            </Button>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                                    <span className="px-2 py-0.5 rounded-full border border-primary/20 bg-primary/5">{ROLE_LABELS[user?.role || 'SUPERADMIN']}</span>
                                    {activeItem ? (
                                        <>
                                            <LuChevronRight className="h-3 w-3 text-muted-foreground/50" />
                                            <span className="text-muted-foreground/60">{activeItem?.section || 'Workspace'}</span>
                                        </>
                                    ) : null}
                                </div>
                                <h1 className="mt-1 truncate text-2xl font-black tracking-tight text-foreground md:text-[2.25rem]">
                                    {title}
                                </h1>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3 md:gap-5">
                            <ThemeToggle />
                            <NotificationCenter />
                            <SessionTimer isCompact onExpire={handleLogout} />
                        </div>
                    </div>
                </header>

                <main className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-6 py-8 md:px-10 md:py-12"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
