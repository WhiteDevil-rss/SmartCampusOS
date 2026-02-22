'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRealtimeUpdates } from '@/lib/hooks/useRealtimeUpdates';

interface NavItem {
    title: string;
    href: string;
    icon: ReactNode;
}

interface DashboardLayoutProps {
    children: ReactNode;
    navItems: NavItem[];
    title: string;
}

export function DashboardLayout({ children, navItems, title }: DashboardLayoutProps) {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useRealtimeUpdates(); // Initialize Real-time mapping

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="h-screen flex overflow-hidden bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r flex flex-col hidden md:flex flex-shrink-0">
                <div className="h-16 flex items-center px-6 border-b text-lg font-bold text-primary">
                    NEP Scheduler
                </div>

                <div className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <span className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                pathname === item.href
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            )}>
                                {item.icon}
                                {item.title}
                            </span>
                        </Link>
                    ))}
                </div>

                <div className="p-4 border-t bg-slate-50/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold truncate max-w-[130px]">{user?.username}</span>
                            <span className="text-xs text-slate-500">{user?.role}</span>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navbar for Mobile (simplified) */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 md:hidden flex-shrink-0">
                    <span className="font-bold text-primary">NEP Scheduler</span>
                    <Button variant="ghost" size="icon" onClick={handleLogout}>
                        <LogOut className="h-5 w-5 text-red-600" />
                    </Button>
                </header>

                {/* Top Header */}
                <header className="h-16 bg-white border-b hidden md:flex items-center px-8 shadow-sm z-10 flex-shrink-0">
                    <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
