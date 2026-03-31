"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IndustrialSidebar } from "./sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { 
  Bell, 
  Search, 
  Terminal, 
  Command,
  Cpu,
  ShieldCheck,
  Activity,
  Menu,
  X,
  Plus
} from "lucide-react";

interface V2DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

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

export function V2DashboardLayout({ children, title }: V2DashboardLayoutProps) {
  const store = useAuthStore();
  const user = store.user;
  const logout = store.logout;
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  const roleColor = React.useMemo(() => getRoleColor(user?.role || 'ADMIN'), [user?.role]);

  const handleLogout = React.useCallback(async () => {
    await logout();
    router.push("/login");
  }, [logout, router]);

  // Mock notifications for UI polish
  const notifications = 3;

  return (
    <div 
      className="flex h-screen w-full bg-[#020817] text-slate-100 selection:bg-primary/30 overflow-hidden font-sans"
      style={{ 
        '--primary': roleColor,
        '--primary-glow': `${roleColor}33`,
        '--primary-rgb': roleColor === '#f97316' ? '249, 115, 22' : (roleColor === '#8b5cf6' ? '139, 92, 246' : '0, 112, 255')
      } as React.CSSProperties}
    >
      {/* Background patterns */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--primary-glow),transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-20" />
      </div>

      {/* Mobile sidebar Drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] md:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-[#020817] z-[70] md:hidden border-r border-white/10 shadow-2xl"
            >
              <div className="absolute top-6 right-6 z-[80]">
                 <button 
                   onClick={() => setIsMobileSidebarOpen(false)}
                   className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white"
                 >
                   <X className="w-5 h-5" />
                 </button>
              </div>
              <IndustrialSidebar 
                userName={user?.username || "Admin"}
                userRole={user?.role || "ADMIN"}
                onNavigate={(href) => {
                  router.push(href);
                  setIsMobileSidebarOpen(false);
                }}
                onLogout={handleLogout}
                isMobile={true}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar Integration */}
      <div className="hidden md:block">
        <IndustrialSidebar 
          userName={user?.username || "Admin"}
          userRole={user?.role || "ADMIN"}
          onNavigate={(href) => router.push(href)}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden md:ml-20">
        {/* V2 Header */}
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 border-b border-white/5 bg-[#020817]/40 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3 md:gap-6">
            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer border border-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 group hover:border-primary/40 transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
                <Terminal className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-slate-100 truncate max-w-[150px] md:max-w-[400px] font-space-grotesk">
                  {title || "Dashboard Control"}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] hidden sm:block">Live Node Status</span>
                </div>
              </div>
            </div>

            {/* Breadcrumb separator */}
            <div className="h-4 w-px bg-white/10 hidden md:block" />
            
            {/* Quick Stats in Header */}
            <div className="hidden xl:flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Protocol Priority</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <Activity className="w-3 h-3 text-primary/40" />
                  <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest">High Affinity</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Data Integrity</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-500/30" />
                  <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest">Verified L3</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-5">
            {/* Search Trigger */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="hidden lg:flex items-center gap-4 px-5 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-slate-500 hover:text-slate-300 hover:border-white/20 transition-all duration-300 group cursor-pointer shadow-lg"
            >
              <Search className="w-4 h-4 group-hover:text-primary transition-all scale-100 group-hover:scale-110" />
              <span className="text-[10px] font-black uppercase tracking-widest">Search Hub...</span>
              <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 font-mono text-[9px] font-black text-slate-500 opacity-100 sm:flex">
                <Command className="w-2 h-2" /> K
              </kbd>
            </button>

            {/* Action Icons */}
            <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] rounded-2xl border border-white/5 shadow-inner">
               <button className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                <Plus className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/5 transition-all relative cursor-pointer group">
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {notifications > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-[#020817] shadow-[0_0_12px_rgba(var(--primary-rgb),0.6)]" />
                )}
              </button>
              <div className="w-px h-5 bg-white/5 mx-1" />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[1700px] mx-auto w-full h-full"
          >
            {children}
          </motion.div>
        </div>

        {/* Global Matrix Footer */}
        <footer className="h-10 border-t border-white/5 bg-[#020817]/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2.5">
                <Cpu className="w-3.5 h-3.5 text-slate-800" />
                <span className="text-[9px] font-black font-mono text-slate-700 uppercase tracking-[0.2em]">Core: V3.4.2-PRIME</span>
             </div>
             <div className="w-px h-3 bg-white/5 hidden sm:block" />
             <div className="hidden sm:flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary/30" />
                <span className="text-[9px] font-black font-mono text-slate-700 uppercase tracking-[0.2em]">Institutional Mesh Active</span>
             </div>
          </div>
          <span className="text-[8px] font-black font-mono text-slate-800 uppercase tracking-[0.3em]">© 2026 SmartCampus • Command Central</span>
        </footer>
      </main>

      {/* Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
    </div>
  );
}
