'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { GetStartedButton } from "@/components/get-started-button";

const navLinks = [
    { label: "Home", href: "/" },
    { label: "Platform", href: "/platform" },
    { label: "Solutions", href: "/solutions" },
    { label: "Security", href: "/security" },
];

export function LandingNav() {
    const { user, isAuthenticated } = useAuthStore();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

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
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-white/10 bg-background-dark/80 backdrop-blur-md px-6 lg:px-10 py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 text-slate-100">
                <div className="w-6 h-6 text-neon-cyan flex items-center justify-center">
                    <span className="material-symbols-outlined text-[28px]">schedule</span>
                </div>
                <h2 className="text-slate-100 text-xl font-bold leading-tight tracking-[-0.015em] font-heading">Zembaa</h2>
            </Link>

            {/* Center Nav */}
            <div className="hidden md:flex flex-1 justify-center items-center gap-8">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`text-[14px] font-medium transition-colors ${pathname === link.href
                            ? "text-neon-cyan"
                            : "text-slate-300 hover:text-neon-cyan"
                            }`}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>

            {/* Right Desktop Actions */}
            <div className="hidden md:flex flex-1 justify-end items-center gap-3">
                {isAuthenticated ? (
                    <Link
                        href={getDashboardPath()}
                        className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-5 bg-gradient-to-r from-neon-cyan to-blue-500 text-background-dark text-sm font-bold shadow-[0_0_15px_rgba(0,245,255,0.3)] hover:shadow-[0_0_25px_rgba(0,245,255,0.5)] transition-all"
                    >
                        Dashboard
                    </Link>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="hidden sm:flex items-center justify-center rounded-full border border-neon-cyan text-neon-cyan px-6 py-2 text-[14px] font-medium hover:bg-neon-cyan hover:text-white transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
                        >
                            Login
                        </Link>
                        <GetStartedButton
                            className="flex items-center justify-center rounded-full bg-gradient-to-r from-neon-cyan to-blue-500 text-white px-6 py-[10px] text-[14px] font-semibold shadow-[0_0_15px_rgba(0,245,255,0.3)] hover:scale-105 hover:shadow-[0_0_25px_rgba(0,245,255,0.5)] transition-all active:scale-95 animate-pulse hover:animate-none"
                        >
                            Get Started
                        </GetStartedButton>
                    </div>
                )}
            </div>

            {/* Mobile Menu Button */}
            <button
                className="md:hidden p-2 rounded-lg border border-white/10 text-slate-300 hover:text-white transition-colors ml-3"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle navigation menu"
            >
                <span className="material-symbols-outlined text-xl">{mobileOpen ? 'close' : 'menu'}</span>
            </button>

            {/* Mobile Dropdown */}
            {mobileOpen && (
                <div className="absolute top-full left-0 right-0 mt-0 bg-background-dark/95 backdrop-blur-xl border-b border-white/10 p-4 flex flex-col gap-3 md:hidden shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`text-sm font-medium py-2 px-3 rounded-lg transition-colors ${pathname === link.href
                                ? "text-neon-cyan bg-neon-cyan/10"
                                : "text-slate-300 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="border-t border-white/10 pt-3 mt-1 flex flex-col gap-2">
                        {isAuthenticated ? (
                            <Link
                                href={getDashboardPath()}
                                onClick={() => setMobileOpen(false)}
                                className="w-full text-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-neon-cyan to-blue-500 text-background-dark text-sm font-bold transition-all"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="w-full text-center text-sm font-medium text-slate-300 hover:text-white transition-colors py-2"
                                >
                                    Sign In
                                </Link>
                                <GetStartedButton
                                    onClick={() => setMobileOpen(false)}
                                    className="w-full text-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-neon-cyan to-blue-500 text-background-dark text-sm font-bold transition-all"
                                >
                                    Get Started
                                </GetStartedButton>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
