'use client';

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { ThemeToggle } from "./theme-toggle";
import { Activity, ShieldCheck, Menu, X, ArrowRight } from "lucide-react";
import { getFrontendRoleHint, getRoleHomePath } from "@/lib/api";

const navLinks = [
    { label: "Solutions", href: "/solutions" },
    { label: "Admissions", href: "/admissions" },
    { label: "Verify", href: "/verify" },
    { label: "Careers", href: "/careers" },
];

export function LandingNav() {
    const { user, isAuthenticated } = useAuthStore();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const authEntryPath = useMemo(
        () => getRoleHomePath(user?.role || getFrontendRoleHint()),
        [user?.role]
    );

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between transition-all duration-700 px-6 lg:px-12 ${
                scrolled 
                ? "bg-background/40 backdrop-blur-2xl border-b border-border shadow-sm py-3" 
                : "bg-transparent py-6"
            }`}
        >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-all duration-500 shadow-inner overflow-hidden">
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                    <Activity className="text-primary w-6 h-6 group-hover:scale-110 transition-transform relative z-10" />
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-black tracking-tighter leading-none font-space-grotesk text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        Smart<span className="text-primary italic">OS</span>
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-[9px] font-black text-slate-500 dark:text-text-muted tracking-[0.15em] uppercase">System Live</span>
                    </div>
                </div>
            </Link>

            {/* Center Nav */}
            <nav className="hidden xl:flex items-center bg-surface/50 backdrop-blur-md rounded-full px-8 py-2.5 border border-border/50 shadow-sm">
                {navLinks.map((link) => (
                    <Link
                        key={link.label}
                        href={link.href}
                        className={`text-sm font-bold transition-all px-4 py-1 rounded-full relative group ${
                            pathname === link.href 
                            ? "text-primary bg-primary/10" 
                            : "text-slate-600 dark:text-text-secondary hover:text-primary"
                        }`}
                    >
                        {link.label}
                        {! (pathname === link.href) && (
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all group-hover:w-2/3" />
                        )}
                    </Link>
                ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-5">
                <div className="hidden lg:flex items-center gap-3">
                    <Link
                        href="/admissions"
                        className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors px-2"
                    >
                        Admissions
                    </Link>
                    <Link
                        href="/verify"
                        className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 px-4 py-2 text-sm font-black transition-all hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    >
                        Verify <ShieldCheck className="w-[18px] h-[18px]" />
                    </Link>
                </div>

                <div className="w-px h-8 bg-slate-200 dark:bg-white/10 hidden sm:block" />

                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <a
                            href={authEntryPath}
                            className="hidden md:flex bg-primary text-white px-6 py-2.5 rounded-2xl text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-[0_10px_20px_rgba(99,102,241,0.2)] hover:shadow-[0_15px_30px_rgba(99,102,241,0.3)]"
                        >
                            Portal Access
                        </a>
                    ) : (
                        <div className="flex items-center gap-3">
                            <a
                                href={authEntryPath}
                                className="hidden md:inline-flex text-sm font-black text-slate-500 dark:text-text-muted hover:text-primary transition-colors"
                            >
                                Login
                            </a>
                            <a
                                href={authEntryPath}
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-7 py-3 rounded-2xl text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl"
                            >
                                Get Started
                            </a>
                        </div>
                    )}
                    
                    <div className="hidden sm:block">
                        <ThemeToggle />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="xl:hidden w-12 h-12 flex items-center justify-center rounded-2xl bg-surface border border-border text-text-muted hover:text-primary transition-all active:scale-90"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {mobileOpen && (
                <div className="fixed inset-0 top-[72px] bg-background/95 backdrop-blur-3xl z-[100] p-8 flex flex-col gap-6 xl:hidden animate-in fade-in slide-in-from-right-10 duration-500 border-t border-white/5">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="text-3xl font-black text-slate-900 dark:text-white hover:text-primary transition-colors py-2 flex items-center justify-between group"
                            >
                                {link.label}
                                <ArrowRight className="opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 w-6 h-6" />
                            </Link>
                        ))}
                    </div>

                    <div className="mt-auto space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/admissions" onClick={() => setMobileOpen(false)} className="h-14 flex items-center justify-center rounded-2xl border border-primary/30 text-primary font-black">Admissions</Link>
                            <Link href="/verify" onClick={() => setMobileOpen(false)} className="h-14 flex items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black">Verify</Link>
                        </div>
                        <a
                            href={authEntryPath}
                            onClick={() => setMobileOpen(false)}
                            className="w-full h-16 flex items-center justify-center rounded-3xl bg-primary text-white text-lg font-black shadow-lg shadow-primary/20"
                        >
                            Open SmartOS Portal
                        </a>
                        <div className="flex justify-center pt-4">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
