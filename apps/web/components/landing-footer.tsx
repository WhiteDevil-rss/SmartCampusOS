import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Activity, Globe, Users, Terminal, Cpu, Zap, Heart } from 'lucide-react';
import { SiX, SiLinkedin, SiGithub } from 'react-icons/si';
import { cn } from '@/lib/utils';

export function LandingFooter() {
    return (
        <footer className="bg-[#020817] border-t border-white/5 pt-32 pb-12 px-6 lg:px-12 font-sans relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none opacity-50" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none opacity-50" />
            
            {/* Subtle Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.02] z-0 pointer-events-none bg-[url('/noise.svg')] mix-blend-overlay" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32 relative z-10">
                {/* Column 1: Institutional Brand */}
                <div className="space-y-10">
                    <Link href="/" className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-all duration-500 shadow-[0_0_20px_rgba(0,112,255,0.15)]">
                            <Terminal className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter font-space-grotesk text-slate-100">
                            Smart<span className="text-primary italic">OS</span>
                        </span>
                    </Link>
                    <p className="text-slate-500 text-[13px] leading-relaxed font-medium max-w-[280px]">
                        The definitive orchestration platform for <span className="text-slate-300">modern educational excellence</span>. Orchestrating institutional intelligence with cryptographic precision.
                    </p>
                    <div className="flex items-center gap-4">
                        {[
                            { icon: SiX, href: "https://twitter.com" },
                            { icon: SiLinkedin, href: "https://linkedin.com" },
                            { icon: SiGithub, href: "https://github.com" }
                        ].map((social, i) => (
                            <Link 
                                key={i}
                                href={social.href} 
                                target="_blank" 
                                className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-500 hover:text-primary transition-all hover:scale-110 active:scale-95 group shadow-sm"
                            >
                                <social.icon className="w-4 h-4" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Column 2: Ecosystem */}
                <div className="space-y-8">
                    <h3 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] font-space-grotesk border-l-2 border-primary pl-4">Ecosystem</h3>
                    <ul className="space-y-5">
                        {[
                            { name: 'Command Hub', href: '/solutions' },
                            { name: 'Admission Engine', href: '/admissions' },
                            { name: 'Faculty Services', href: '/faculty-panel' },
                            { name: 'Identity Trust', href: '/verify' }
                        ].map((link) => (
                            <li key={link.name}>
                                <Link href={link.href} className="text-slate-500 hover:text-primary transition-all text-sm font-bold uppercase tracking-widest text-[11px] block group">
                                    <span className="group-hover:translate-x-1 inline-block transition-transform duration-300">{link.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Column 3: Governance */}
                <div className="space-y-8">
                    <h3 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] font-space-grotesk border-l-2 border-blue-500 pl-4">Governance</h3>
                    <ul className="space-y-5">
                        {[
                            { name: 'Institutional Profile', href: '/about-us' },
                            { name: 'Engineering Core', href: '/careers', badge: 'Join' },
                            { name: 'Direct Terminal', href: '/contact' },
                            { name: 'Network Analytics', href: '/department/analytics' }
                        ].map((link) => (
                            <li key={link.name}>
                                <Link href={link.href} className="text-slate-500 hover:text-primary transition-all text-sm font-bold uppercase tracking-widest text-[11px] flex items-center gap-3 group">
                                    <span className="group-hover:translate-x-1 inline-block transition-transform duration-300">{link.name}</span>
                                    {link.badge && (
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-wider group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Column 4: Security Stack */}
                <div className="space-y-8">
                    <h3 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] font-space-grotesk border-l-2 border-slate-700 pl-4">Security Stack</h3>
                    <ul className="space-y-5">
                        {[
                            { name: 'Protocol Framework', href: '/legal' },
                            { name: 'Privacy Encryption', href: '/privacy-policy' },
                            { name: 'Audit Compliance', href: '/security', icon: ShieldCheck }
                        ].map((link) => (
                            <li key={link.name}>
                                <Link href={link.href} className="text-slate-500 hover:text-primary transition-all text-sm font-bold uppercase tracking-widest text-[11px] flex items-center gap-3 group">
                                    <span className="group-hover:translate-x-1 inline-block transition-transform duration-300">{link.name}</span>
                                    {link.icon && <link.icon className="text-emerald-500 w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:rotate-12 transition-all" />}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Bottom Utility Bar */}
            <div className="max-w-7xl mx-auto border-t border-white/5 pt-16 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <p className="text-slate-600 font-black text-[10px] uppercase tracking-widest">
                            &copy; {new Date().getFullYear()} SmartCampus OS Suite V4.2.0-PRIME
                        </p>
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-800 uppercase tracking-[0.3em]">
                            Authenticated by <span className="text-slate-700 underline decoration-primary/30">Zembaa Quantum Solutions</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 px-4 py-2 rounded-2xl shadow-inner">
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 outline outline-2 outline-emerald-500/20"></span>
                            </span>
                            <span className="text-emerald-500/80 text-[10px] font-black uppercase tracking-[0.2em] italic">Mesh Status: Optimal</span>
                        </div>
                        <div className="w-px h-4 bg-white/5" />
                        <div className="flex items-center gap-2">
                             <Cpu className="w-3.5 h-3.5 text-slate-700" />
                             <span className="text-slate-700 text-[10px] font-black uppercase tracking-[0.2em]">0.04ms</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final Touch: Made with Heart */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-10">
                 <Zap className="w-3 h-3 text-primary" />
                 <span className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-400 italic">Redefining Education One Node At A Time</span>
                 <Heart className="w-3 h-3 text-rose-500" />
            </div>
        </footer>
    );
}
