'use client';

import { ReactNode, memo } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { LuLogOut, LuClock, LuShieldAlert, LuMenu, LuX } from 'react-icons/lu';
import { NotificationCenter } from '@/components/shared/notification-center';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRealtimeUpdates } from '@/lib/hooks/useRealtimeUpdates';
import { useSessionStore } from '@/lib/store/useSessionStore';
import { auth } from '@/lib/firebase';
import { ThemeToggle } from '@/components/theme-toggle';
import { Toast, useToast } from '@/components/ui/toast-alert';
import { DEPT_ADMIN_NAV, UNI_ADMIN_NAV, SUPERADMIN_NAV, FACULTY_NAV, STUDENT_NAV } from '@/lib/constants/nav-config';
import { motion, AnimatePresence } from 'framer-motion';

// ── Isolated Timer Component ────────────────────────────────────
// This component manages its own subscription to the session store,
// so only the tiny timer badge re-renders every second — not the entire page.
const SessionTimer = memo(function SessionTimer({ isMobile = false, onExpire }: { isMobile?: boolean; onExpire: (isExpired?: boolean) => void }) {
    const { expiryTimestamp, hasHydrated } = useSessionStore();
    const [currentTimeLeft, setCurrentTimeLeft] = useState(600);

    // Update the local timer state every second based on the absolute expiry timestamp
    useEffect(() => {
        if (!hasHydrated) return;

        const calculateTimeLeft = () => {
            const diff = Math.max(0, Math.floor((expiryTimestamp - Date.now()) / 1000));
            setCurrentTimeLeft(diff);
            if (diff <= 0 && expiryTimestamp > 0) {
                onExpire(true); // Signal this was an auto-expiry
            }
        };

        calculateTimeLeft();
        const id = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(id);
    }, [expiryTimestamp, hasHydrated, onExpire]);

    // Fixed 10-minute session: No activity listeners anymore.

    const mins = Math.floor(currentTimeLeft / 60);
    const secs = currentTimeLeft % 60;
    const formatted = `${mins}:${secs.toString().padStart(2, '0')}`;
    const critical = currentTimeLeft < 60;
    const warning = currentTimeLeft < 180;

    return (
        <div className={cn(
            "flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all duration-300 backdrop-blur-md",
            critical
                ? "border-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse"
                : "border-slate-200 dark:border-border bg-slate-100/80 dark:bg-slate-900/40 shadow-sm dark:shadow-none",
            isMobile && "px-2 py-1 scale-90"
        )}>
            {critical
                ? <LuShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                : <LuClock className={cn("w-4 h-4 text-primary glow-shadow-primary")} />
            }
            <div className="flex flex-col leading-none">
                {!isMobile && <span className="text-[9px] uppercase font-black text-text-secondary tracking-[0.1em] mb-0.5">Session Expires</span>}
                <span className={cn(
                    "text-sm font-bold tabular-nums tracking-tight",
                    critical ? 'text-rose-500' : warning ? 'text-amber-500 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100',
                    isMobile && "text-xs"
                )}>
                    {formatted}
                </span>
            </div>
        </div>
    );
});

// ── Sidebar Content Component ───────────────────────────────────
const SidebarContent = memo(function SidebarContent({ 
    user, 
    navItems, 
    pathname, 
    onLogout,
    onClose
}: { 
    user: any; 
    navItems: NavItem[]; 
    pathname: string; 
    onLogout: () => void;
    onClose?: () => void;
}) {
    return (
        <>
            <div className="h-24 flex items-center px-8 border-b border-border">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 shadow-inner mr-3 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <LuClock className="w-5 h-5 text-primary relative z-10 transition-transform group-hover:scale-110" />
                </div>
                <span className="text-2xl font-bold font-space-grotesk text-text-primary tracking-tight">Smart<span className="text-primary italic">OS</span></span>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="ml-auto md:hidden rounded-xl border border-border">
                        <LuX className="h-5 w-5" />
                    </Button>
                )}
            </div>

            <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                    const matches = navItems
                        .filter(i => pathname.startsWith(i.href))
                        .sort((a, b) => b.href.length - a.href.length);

                    const isActive = matches[0]?.href === item.href;

                    return (
                        <Link key={item.href} href={item.href} onClick={onClose}>
                            <div className={cn(
                                "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "text-primary bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.05)]"
                                    : "text-text-muted hover:text-primary hover:bg-surface-hover border border-transparent hover:border-border-hover"
                            )}>
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                )}
                                <div className={cn("transition-colors relative z-10", isActive ? "text-primary" : "text-text-muted group-hover:text-primary")}>
                                    {item.icon}
                                </div>
                                <span className="relative z-10 flex-1">{item.title}</span>
                                {item.badge && (
                                    <div className={cn(
                                        "min-w-[1.25rem] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-black text-white relative z-10 shadow-sm",
                                        item.badgeColor || "bg-primary"
                                    )}>
                                        {item.badge}
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="p-6 border-t border-border bg-surface backdrop-blur-md relative overflow-hidden">
                <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-32 h-10 bg-primary/10 blur-[20px] rounded-full" />
                <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-background/40 border border-border shadow-inner relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden justify-center max-w-[130px]">
                        <span className={cn("text-sm font-bold font-space-grotesk text-text-primary truncate", user?.role !== 'SUPERADMIN' && "mt-0.5")}>{user?.username}</span>
                        <span className="text-[10px] font-bold text-primary/70 tracking-widest uppercase truncate">{user?.role}</span>
                    </div>
                </div>
                <Button variant="ghost" className="w-full justify-start text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl font-bold h-12 border border-transparent hover:border-rose-500/30 transition-all z-10 relative" onClick={onLogout}>
                    <LuLogOut className="mr-3 h-5 w-5" />
                    Sign Out / Disconnect
                </Button>
            </div>
        </>
    );
});

// ── Main Layout ─────────────────────────────────────────────────
interface NavItem { title: string; href: string; icon: ReactNode; badge?: string | number; badgeColor?: string; }
interface DashboardLayoutProps { children: ReactNode; navItems: NavItem[]; title: string; }

export function DashboardLayout({ children, navItems, title }: DashboardLayoutProps) {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const forceReset = useSessionStore(s => s.forceReset);
    const { toast, showToast, hideToast } = useToast();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useRealtimeUpdates(showToast);

    const resolvedNavItems = 
        user?.role === 'SUPERADMIN' ? SUPERADMIN_NAV :
        user?.role === 'UNI_ADMIN' ? UNI_ADMIN_NAV :
        user?.role === 'DEPT_ADMIN' ? DEPT_ADMIN_NAV :
        user?.role === 'FACULTY' ? FACULTY_NAV :
        user?.role === 'STUDENT' ? STUDENT_NAV :
        (navItems || []);

    const handleLogout = useCallback(async (isExpired: boolean = false) => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Firebase sign out error', error);
        }
        logout();
        forceReset();
        const target = isExpired ? '/login?expired=true' : '/login';
        router.push(target);
    }, [logout, router, forceReset]);

    return (
        <div className="fixed inset-0 flex overflow-hidden w-full bg-background text-text-primary font-sans antialiased mesh-gradient selection:bg-primary/30">
            <Toast toast={toast} onClose={hideToast} />
            
            {/* Desktop Sidebar */}
            <aside className="w-[280px] bg-surface border-r border-border hidden md:flex flex-col flex-shrink-0 z-20">
                <SidebarContent 
                    user={user} 
                    navItems={resolvedNavItems} 
                    pathname={pathname} 
                    onLogout={() => handleLogout()} 
                />
            </aside>

            {/* Mobile Sidebar Overlay & Drawer */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[150] md:hidden"
                        />
                        <motion.aside 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-surface border-r border-border flex flex-col z-[160] md:hidden shadow-2xl"
                        >
                            <SidebarContent 
                                user={user} 
                                navItems={resolvedNavItems} 
                                pathname={pathname} 
                                onLogout={() => handleLogout()} 
                                onClose={() => setSidebarOpen(false)}
                            />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Top Navbar for Mobile */}
                <header className="h-20 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 md:hidden flex-shrink-0 z-[100] sticky top-0 transition-all duration-500">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="rounded-xl border border-border bg-surface">
                            <LuMenu className="h-5 w-5" />
                        </Button>
                        <span className="font-bold font-space-grotesk text-text-primary text-xl tracking-tight">Smart<span className="text-primary italic">OS</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        {user?.role !== 'SUPERADMIN' && <NotificationCenter />}
                        <SessionTimer isMobile onExpire={handleLogout} />
                    </div>
                </header>

                {/* Top Header */}
                <header className="h-24 bg-background/60 backdrop-blur-2xl border-b border-border hidden md:flex items-center justify-between px-10 z-[90] sticky top-0 flex-shrink-0 transition-all duration-500">
                    <h1 className="text-3xl font-bold font-space-grotesk text-text-primary tracking-tight">{title}</h1>
                    <div className="flex items-center gap-6">
                        <ThemeToggle />
                        {user?.role !== 'SUPERADMIN' && <NotificationCenter />}
                        <SessionTimer onExpire={handleLogout} />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 md:p-10 relative w-full main-content overflow-y-auto custom-scrollbar">
                    <div className="max-w-7xl mx-auto relative z-10 w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

