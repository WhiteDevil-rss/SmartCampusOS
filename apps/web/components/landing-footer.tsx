'use client';

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LuLoader, LuSend } from "react-icons/lu";
import { api } from '@/lib/api';

export function LandingFooter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || status === 'loading') return;

        setStatus('loading');
        setMessage('');

        try {
            await api.post('/subscribers', { email: email.trim().toLowerCase() });

            setStatus('success');
            setMessage('Subscribed successfully! Welcome to the network.');
            setEmail('');

            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 5000);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Subscription failed. Please try again.');
        }
    };

    return (
        <footer className="relative bg-[#050608] border-t border-white/5 pt-32 pb-16 px-6 md:px-12 overflow-hidden">
            {/* Sophisticated Glow Accents */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-50" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-neon-purple/5 rounded-full blur-[100px] pointer-events-none opacity-30" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24 relative z-10">
                {/* Brand & Newsletter Column */}
                <div className="flex flex-col gap-8 lg:col-span-5 pr-0 lg:pr-12">
                    <Link href="/" className="flex items-center gap-3.5 group w-fit">
                        <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_25px_rgba(99,102,241,0.15)] group-hover:scale-110 transition-transform duration-500">
                            <span className="material-symbols-outlined text-primary text-2xl font-bold">hub</span>
                        </div>
                        <span className="text-white text-2xl font-black font-space-grotesk tracking-tighter">SmartCampus <span className="text-primary">OS</span></span>
                    </Link>

                    <p className="text-text-muted text-base leading-relaxed max-w-md font-medium">
                        Empowering the next generation of academic excellence through high-performance orchestration and AI-driven intelligence.
                    </p>

                    <form onSubmit={handleSubscribe} className="max-w-md space-y-4">
                        <div className="flex flex-col gap-2">
                            <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] ml-1">Newsletter Architecture</h4>
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-neon-purple/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                <div className="relative flex">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="institutional-lead@university.edu"
                                        disabled={status === 'loading'}
                                        className="w-full h-14 bg-[#0d0f14] border border-white/10 rounded-2xl pl-5 pr-16 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
                                    />
                                    <button
                                        type="submit"
                                        disabled={status === 'loading' || !email.trim()}
                                        className="absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center bg-primary text-white rounded-xl shadow-lg ring-1 ring-white/10 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {status === 'loading' ? <LuLoader className="w-5 h-5 animate-spin" /> : <LuSend className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        {message && (
                            <motion.p
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`text-xs font-bold tracking-tight ml-1 ${status === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}
                            >
                                {message}
                            </motion.p>
                        )}
                    </form>
                </div>

                {/* Links Grid */}
                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
                    <div className="flex flex-col gap-7">
                        <h3 className="text-white font-black font-space-grotesk text-xs uppercase tracking-[0.2em] opacity-80">Infrastructure</h3>
                        <ul className="flex flex-col gap-5">
                            <li><Link href="#ecosystem" className="text-text-muted hover:text-white transition-colors text-sm font-semibold">Core Engine</Link></li>
                            <li><Link href="/solutions" className="text-text-muted hover:text-white transition-colors text-sm font-semibold">Department AI</Link></li>
                            <li><Link href="/security" className="text-text-muted hover:text-white transition-colors text-sm font-semibold">Protocols</Link></li>
                            <li><Link href="/admissions" className="text-text-muted hover:text-white transition-colors text-sm font-semibold">Admission Hub</Link></li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-7">
                        <h3 className="text-white font-black font-space-grotesk text-xs uppercase tracking-[0.2em] opacity-80">Resources</h3>
                        <ul className="flex flex-col gap-5">
                            <li><Link href="/about-us" className="text-text-muted hover:text-white transition-colors text-sm font-semibold">Intelligence</Link></li>
                            <li><Link href="/careers" className="text-text-muted hover:text-white transition-colors text-sm font-semibold">Network Stats</Link></li>
                            <li><Link href="/contact" className="text-text-muted hover:text-white transition-colors text-sm font-semibold">Direct Support</Link></li>
                            <li><Link href="/legal" className="text-text-muted hover:text-white transition-colors text-sm font-semibold">Case Studies</Link></li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-7">
                        <h3 className="text-white font-black font-space-grotesk text-xs uppercase tracking-[0.2em] opacity-80">Governance</h3>
                        <ul className="flex flex-col gap-5">
                            <li><Link href="/privacy-policy" className="text-text-muted hover:text-white transition-colors text-sm font-semibold">Privacy Policy</Link></li>
                            <li><Link href="/terms-of-service" className="text-text-muted hover:text-white transition-colors text-sm font-semibold">Terms of Use</Link></li>
                            <li><Link href="/security" className="text-text-muted hover:text-white transition-colors text-sm font-semibold">Compliance</Link></li>
                            <li><Link href="/legal" className="text-text-muted hover:text-white transition-colors text-sm font-semibold">SLA Matrix</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8">
                    <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                        © {new Date().getFullYear()} SmartCampus OS
                    </p>
                    <div className="h-1 w-1 rounded-full bg-white/20 hidden md:block"></div>
                    <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                        Version 1.0.1
                    </p>
                </div>

                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Global Clusters Active</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
