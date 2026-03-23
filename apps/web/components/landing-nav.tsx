'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { ThemeToggle } from "./theme-toggle";

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

    const getDashboardPath = () => {
        if (!user) return "/dashboard";
        switch (user.role) {
            case 'UNI_ADMIN': return "/dashboard";
            case 'DEPT_ADMIN': return "/department";
            case 'FACULTY': return "/faculty-panel";
            default: return "/dashboard";
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between transition-all duration-500 px-6 lg:px-12 ${
                scrolled 
                ? "bg-background/70 backdrop-blur-2xl border-b border-border/50 shadow-[0_8px_32px_rgba(31,38,135,0.07)] py-3" 
                : "bg-background/20 backdrop-blur-[6px] border-b border-transparent py-5"
            }`}
        >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                    <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform tracking-tight">domain</span>
                </div>
            <div className="flex flex-col">
                    <span className="text-xl font-black tracking-tight leading-none text-indigo-600 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-primary dark:to-neon-cyan">SmartCampus</span>
                    <span className="text-secondary text-[10px] font-bold tracking-[0.2em] uppercase leading-none mt-1">Operating System</span>
                </div>
            </Link>

            {/* Center Nav */}
            <nav className="hidden xl:flex items-center gap-8">
                {navLinks.map((link) => (
                    <Link
                        key={link.label}
                        href={link.href}
                        className={`text-sm font-semibold transition-all hover:text-primary ${pathname === link.href ? "text-primary" : "text-text-secondary"
                            }`}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admissions"
                    className="hidden lg:flex items-center justify-center rounded-full bg-transparent border border-primary/50 text-text-primary hover:bg-primary/10 px-5 py-2 text-sm font-bold transition-all"
                >
                    Apply Now
                </Link>
                
                <Link
                    href="/verify"
                    className="hidden lg:flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 px-5 py-2 text-sm font-bold transition-all glow-sm"
                >
                    Verify
                    <span className="material-symbols-outlined ml-1.5 text-[18px]">verified</span>
                </Link>

                <div className="w-px h-6 bg-border mx-2 hidden sm:block" />

                {isAuthenticated ? (
                    <Link
                        href={getDashboardPath()}
                        className="glow-button hidden sm:flex items-center justify-center rounded-full bg-primary text-white px-6 py-2.5 text-sm font-black transition-all hover:scale-105 active:scale-95"
                    >
                        Admin Portal
                    </Link>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="hidden sm:inline-flex text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/login?tab=register"
                            className="glow-button hidden sm:flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/30"
                        >
                            Get Started
                        </Link>
                    </>
                )}

                <ThemeToggle />

                {/* Mobile Menu Button */}
                <button
                    className="xl:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-border text-text-muted hover:text-text-primary transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
                </button>
            </div>

            {/* Mobile Dropdown */}
            {mobileOpen && (
           <div className="absolute top-full left-0 right-0 bg-background/80 backdrop-blur-2xl border-b border-border/50 p-6 flex flex-col gap-4 xl:hidden animate-in slide-in-from-top-4 duration-300">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className="text-lg font-medium text-text-muted hover:text-primary py-2"
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <Link href="/admissions" onClick={() => setMobileOpen(false)} className="py-3 rounded-xl border border-primary/50 text-center text-primary font-bold">Apply Now</Link>
                        <Link href="/verify" onClick={() => setMobileOpen(false)} className="py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center text-emerald-400 font-bold">Verify Data</Link>
                    </div>
                    <div className="border-t border-border pt-6 mt-2 flex flex-col gap-4">
                        <Link
                            href="/login"
                            onClick={() => setMobileOpen(false)}
                            className="w-full text-center py-4 rounded-xl bg-foreground text-background font-black"
                        >
                            System Login
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
