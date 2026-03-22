import React from 'react';
import Link from 'next/link';
import { LuShieldCheck } from 'react-icons/lu';

export function LandingFooter() {
    return (
        <footer className="bg-background border-t border-border/50 pt-20 pb-10 px-6 lg:px-12 font-sans relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 relative z-10">
                {/* Column 1: Product */}
                <div className="space-y-4">
                    <h3 className="text-slate-900 dark:text-white font-bold tracking-tight text-lg mb-6">Product</h3>
                    <ul className="space-y-3">
                        <li><Link href="/solutions" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">Solutions</Link></li>
                        <li><Link href="/admissions" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">Admissions</Link></li>
                        <li><Link href="/verify" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">Verify Engine</Link></li>
                    </ul>
                </div>

                {/* Column 2: Company */}
                <div className="space-y-4">
                    <h3 className="text-slate-900 dark:text-white font-bold tracking-tight text-lg mb-6">Company</h3>
                    <ul className="space-y-3">
                        <li><Link href="/about-us" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">About Us</Link></li>
                        <li><Link href="/careers" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium flex items-center gap-2">Careers <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">Hiring</span></Link></li>
                        <li><Link href="/contact" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">Contact</Link></li>
                    </ul>
                </div>

                {/* Column 3: Legal */}
                <div className="space-y-4">
                    <h3 className="text-slate-900 dark:text-white font-bold tracking-tight text-lg mb-6">Legal</h3>
                    <ul className="space-y-3">
                        <li><Link href="/legal" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">Legal Information</Link></li>
                        <li><Link href="/privacy-policy" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">Privacy Policy</Link></li>
                        <li><Link href="/terms-of-service" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">Terms of Services</Link></li>
                        <li><Link href="/security" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium flex items-center gap-2">Security <LuShieldCheck className="text-emerald-500 dark:text-emerald-400 w-3 h-3" /></Link></li>
                    </ul>
                </div>

                {/* Column 4: CTA / Info */}
                <div className="space-y-6">
                    <Link href="/" className="flex items-center gap-2 group mb-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-all">
                            <span className="material-symbols-outlined text-primary text-[20px]">domain</span>
                        </div>
                        <span className="text-slate-900 dark:text-white font-black tracking-tight text-lg">SmartCampus OS</span>
                    </Link>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                        The ultimate modern software platform for scalable admission management and cryptographic credential verification.
                    </p>
                    <div className="flex flex-col gap-3 pt-2">
                        <Link href="/login?tab=register" className="w-full flex justify-center items-center py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            Apply Now
                        </Link>
                        <Link href="/verify" className="w-full flex justify-center items-center py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-bold hover:bg-emerald-500/20 transition-all gap-1.5">
                            <LuShieldCheck className="w-4 h-4" /> Quick Verify
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                <p className="text-slate-500 font-mono text-xs">
                    &copy; {new Date().getFullYear()} SmartCampus Operating System. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                    <span className="w-2h-2 rounded-full bg-emerald-500 animate-pulse hidden md:block"></span>
                    <span className="text-emerald-400 text-xs font-mono font-medium hidden md:block">All systems operational</span>
                </div>
            </div>
        </footer>
    );
}
