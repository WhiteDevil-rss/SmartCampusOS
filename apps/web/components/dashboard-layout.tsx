'use client';

import { ReactNode, memo } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { LuLogOut, LuClock, LuShieldAlert } from 'react-icons/lu';
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
                : "border-slate-200 dark:border-white/5 bg-slate-100/80 dark:bg-slate-900/40 shadow-sm dark:shadow-none",
            isMobile && "px-2 py-1 scale-90"
        )}>
            {critical
                ? <LuShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                : <LuClock className={cn("w-4 h-4", warning ? "text-amber-400" : "text-neon-cyan")} />
            }
            <div className="flex flex-col leading-none">
                {!isMobile && <span className="text-[9px] uppercase font-black text-slate-500 tracking-[0.1em] mb-0.5">Session Expires</span>}
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

// ── Main Layout ─────────────────────────────────────────────────
interface NavItem { title: string; href: string; icon: ReactNode; }
interface DashboardLayoutProps { children: ReactNode; navItems: NavItem[]; title: string; }

export function DashboardLayout({ children, navItems, title }: DashboardLayoutProps) {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const forceReset = useSessionStore(s => s.forceReset);
    const { toast, showToast, hideToast } = useToast();

    useRealtimeUpdates(showToast);

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
        <div className="h-screen flex overflow-hidden w-full overflow-x-hidden bg-background dark:bg-[#020203] max-w-[100vw]">
            <Toast toast={toast} onClose={hideToast} />
            {/* Sidebar */}
            <aside className="w-[280px] bg-white dark:bg-black/80 backdrop-blur-3xl border-r border-slate-200 dark:border-white/5 hidden md:flex flex-col flex-shrink-0 z-20">
                <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-inner mr-3 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <LuClock className="w-5 h-5 text-neon-cyan relative z-10 glow-cyan" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Zembaa<span className="text-neon-cyan">.AI</span></span>
                </div>

                <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        // FIX: Only one item should be active. 
                        // Logic: Longest matching prefix wins, OR exact match.
                        // Filter out items where the current pathname starts with the item's href.
                        // Then sort by length descending and take the first one.
                        const matches = navItems
                            .filter(i => pathname.startsWith(i.href))
                            .sort((a, b) => b.href.length - a.href.length);

                        const isActive = matches[0]?.href === item.href;

                        return (
                            <Link key={item.href} href={item.href}>
                                <div className={cn(
                                    "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-500 group relative overflow-hidden",
                                    isActive
                                        ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-premium"
                                        : "text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                                )}>
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-cyan rounded-r-full shadow-[0_0_10px_rgba(57,193,239,0.5)]" />
                                    )}
                                    <div className={cn("transition-colors relative z-10", isActive ? "text-neon-cyan glow-cyan" : "text-slate-400 dark:text-slate-500 group-hover:text-neon-cyan")}>
                                        {item.icon}
                                    </div>
                                    <span className="relative z-10">{item.title}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="p-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] backdrop-blur-md relative overflow-hidden">
                    {/* Subtle bottom glow */}
                    <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-32 h-10 bg-neon-cyan/10 blur-[20px] rounded-full" />
                    <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-inner relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-blue-500 text-slate-900 flex items-center justify-center font-bold shadow-[0_0_10px_rgba(57,193,239,0.3)]">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col flex-1 overflow-hidden justify-center max-w-[130px]">
                            <span className={cn("text-sm font-heading font-bold text-slate-900 dark:text-white truncate", user?.role !== 'SUPERADMIN' && "mt-0.5")}>{user?.username}</span>
                            {user?.role === 'SUPERADMIN' && (
                                <span className="text-[10px] font-semibold text-neon-cyan/70 tracking-wider uppercase truncate">{user?.role}</span>
                            )}
                        </div>
                    </div>
                    <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl font-semibold h-11 border border-transparent hover:border-red-500/20 transition-all z-10 relative" onClick={() => handleLogout()}>
                        <LuLogOut className="mr-3 h-5 w-5" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-x-hidden relative">
                {/* Top Navbar for Mobile */}
                <header className="h-16 bg-background/80 dark:bg-[#020203]/80 backdrop-blur-lg border-b border-border/60 dark:border-white/5 flex items-center justify-between px-6 md:hidden flex-shrink-0 z-30 sticky top-0 transition-all duration-500">
                    <span className="font-black text-slate-900 dark:text-white text-lg tracking-tighter">Zembaa<span className="text-neon-cyan">.AI</span></span>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <SessionTimer isMobile onExpire={handleLogout} />
                        <Button variant="ghost" size="icon" onClick={() => handleLogout()} className="rounded-xl bg-muted dark:bg-white/5 hover:bg-red-50 dark:hover:bg-rose-500/10 transition-colors">
                            <LuLogOut className="h-4 w-4 text-rose-500" />
                        </Button>
                    </div>
                </header>

                {/* Top Header */}
                <header className="h-24 bg-background/80 dark:bg-[#020203]/80 backdrop-blur-3xl border-b border-border/60 dark:border-white/5 hidden md:flex items-center justify-between px-10 z-10 sticky top-0 flex-shrink-0 transition-all duration-500">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter glow-sm">{title}</h1>
                    <div className="flex items-center gap-6">
                        <ThemeToggle />
                        <SessionTimer onExpire={handleLogout} />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 relative w-full">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/10 dark:bg-neon-purple/5 blur-[120px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
                    <div className="max-w-7xl mx-auto space-y-8 relative z-10 w-full overflow-x-hidden">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

