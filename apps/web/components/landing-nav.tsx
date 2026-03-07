'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
    { label: "Ecosystem", href: "#ecosystem" },
    { label: "Solutions", href: "/solutions" },
    { label: "Security", href: "/security" },
    { label: "Admissions", href: "/admissions" },
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
            className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-300 px-6 lg:px-12 py-4 ${scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border py-3" : "bg-transparent py-6"
                }`}
        >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                    <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">hub</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-text-primary text-lg font-bold font-space-grotesk tracking-tight leading-none">SmartCampus</span>
                    <span className="text-secondary text-[10px] font-bold tracking-[0.2em] uppercase leading-none mt-1">Operating System</span>
                </div>
            </Link>

            {/* Center Nav */}
            <nav className="hidden md:flex items-center gap-10">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`text-sm font-medium transition-all hover:text-text-primary ${pathname === link.href ? "text-text-primary" : "text-text-muted"
                            }`}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                {isAuthenticated ? (
                    <Link
                        href={getDashboardPath()}
                        className="glow-button hidden sm:flex items-center justify-center rounded-full bg-primary text-white px-8 py-2.5 text-sm font-bold transition-all hover:scale-105 active:scale-95"
                    >
                        Platform
                    </Link>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="hidden sm:inline-flex text-sm font-bold text-text-muted hover:text-text-primary transition-colors mr-2 focus:outline-none"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/login?tab=register"
                            className="glow-button hidden sm:flex items-center justify-center rounded-full bg-foreground text-background px-8 py-2.5 text-sm font-bold transition-all hover:scale-105 active:scale-95"
                        >
                            Get Started
                        </Link>
                    </>
                )}

                <ThemeToggle />

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-border text-text-muted hover:text-text-primary transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
                </button>
            </div>

            {/* Mobile Dropdown */}
            {mobileOpen && (
                <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-2xl border-b border-border p-6 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-4 duration-300">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className="text-lg font-medium text-text-muted hover:text-text-primary py-2"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="border-t border-border pt-6 mt-2 flex flex-col gap-4">
                        <Link
                            href="/login"
                            onClick={() => setMobileOpen(false)}
                            className="w-full text-center py-4 rounded-2xl bg-foreground text-background font-bold"
                        >
                            Initialize System
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
