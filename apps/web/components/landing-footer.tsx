import React from 'react';
import Link from 'next/link';
import { LuShieldCheck } from 'react-icons/lu';

export function LandingFooter() {
    return (
        <footer className="bg-background border-t border-border pt-32 pb-12 px-6 lg:px-12 font-sans relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24 relative z-10">
                {/* Column 1: Info & Brand */}
                <div className="space-y-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-all font-black text-primary">
                            <span className="material-symbols-outlined text-[24px]">hub</span>
                        </div>
                        <span className="text-2xl font-black tracking-tighter font-space-grotesk text-slate-900 dark:text-white">
                            Smart<span className="text-primary italic">OS</span>
                        </span>
                    </Link>
                    <p className="text-text-secondary text-sm leading-relaxed font-medium">
                        The definitive orchestration platform for modern educational institutions. Cryptographic integrity for every academic record.
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted hover:text-primary transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-lg">public</span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted hover:text-primary transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-lg">groups</span>
                        </div>
                    </div>
                </div>

                {/* Column 2: Platform */}
                <div className="space-y-6">
                    <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-[0.2em] text-[10px]">Platform</h3>
                    <ul className="space-y-4">
                        <li><Link href="/solutions" className="text-text-secondary hover:text-primary transition-all text-sm font-bold">Solutions Architecture</Link></li>
                        <li><Link href="/admissions" className="text-text-secondary hover:text-primary transition-all text-sm font-bold">Admission Engine</Link></li>
                        <li><Link href="/verify" className="text-text-secondary hover:text-primary transition-all text-sm font-bold">Trust Verification</Link></li>
                    </ul>
                </div>

                {/* Column 3: Company */}
                <div className="space-y-6">
                    <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-[0.2em] text-[10px]">Resources</h3>
                    <ul className="space-y-4">
                        <li><Link href="/about-us" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-all text-sm font-bold">Institutional Overview</Link></li>
                        <li><Link href="/careers" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-all text-sm font-bold flex items-center gap-2">Engineering <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-wider">Join Us</span></Link></li>
                        <li><Link href="/contact" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-all text-sm font-bold">Support Concierge</Link></li>
                    </ul>
                </div>

                {/* Column 4: Compliance */}
                <div className="space-y-6">
                    <h3 className="text-slate-900 dark:text-white font-black uppercase tracking-[0.2em] text-[10px]">Legal & Trust</h3>
                    <ul className="space-y-4">
                        <li><Link href="/legal" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-all text-sm font-bold">Legal Framework</Link></li>
                        <li><Link href="/privacy-policy" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-all text-sm font-bold">Data Privacy</Link></li>
                        <li><Link href="/security" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-all text-sm font-bold flex items-center gap-2">Security Audit <LuShieldCheck className="text-emerald-500 w-4 h-4" /></Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-border pt-12 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6">
                    <p className="text-slate-400 font-bold text-xs">
                        &copy; {new Date().getFullYear()} SmartCampus Operating System v4.0.0
                    </p>
                    <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">
                        Handcrafted by <span className="text-slate-500 dark:text-slate-400">Zembaa Solution</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-emerald-500 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">All Nodes Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
