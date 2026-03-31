'use client';

import React from 'react';
import { LandingNav } from '@/components/landing-nav';
import { LandingFooter } from '@/components/landing-footer';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, FileText, Globe, ArrowRight, Gavel, Cpu, Zap, Activity } from 'lucide-react';
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";

export default function TermsOfServicePage() {
    const sections = [
        { id: "usage-rights", title: "1. Usage Rights & Licensing" },
        { id: "uptime-sla", title: "2. Uptime & Service Level Agreement" },
        { id: "data-integrity", title: "3. Accountability & Data Integrity" },
        { id: "liability", title: "4. Institutional Liability" },
        { id: "termination", title: "5. Termination of Service" },
    ];

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/30 antialiased flex flex-col">
            <LandingNav />

            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px] mix-blend-screen" />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            <main className="flex-1 relative z-10 pt-40 pb-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-4 gap-16">
                    
                    {/* Sticky Sidebar TOC */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-32 space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-6">Terms Framework</h3>
                                <nav className="space-y-4">
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => scrollToSection(section.id)}
                                            className="block text-sm font-bold text-slate-500 hover:text-primary transition-colors text-left"
                                        >
                                            {section.title}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                            <GlassCard className="rounded-3xl border border-primary/20 bg-primary/5 p-6">
                                <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Protocol Version</div>
                                <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">SmartOS Operating Terms v4.2. Current institutional node agreement.</p>
                                <button className="text-[10px] font-black text-primary flex items-center gap-1 hover:gap-2 transition-all">VIEW VERSION LOG <ArrowRight className="w-3 h-3" /></button>
                            </GlassCard>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-16"
                        >
                            <div className="inline-flex px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase rounded-full mb-6">Legal Agreement</div>
                            <h1 className="text-5xl md:text-7xl font-black font-space-grotesk tracking-tight mb-8">Terms of <span className="text-primary italic">Service</span></h1>
                            <div className="flex items-center gap-4 text-slate-400 text-sm font-bold">
                                <span>Revision Date: March 20, 2026</span>
                                <span className="h-4 w-px bg-slate-200 dark:bg-white/10" />
                                <span>Institutional Standard</span>
                            </div>
                        </motion.div>

                        <div className="prose prose-slate dark:prose-invert max-w-none space-y-16">
                            <section id="usage-rights">
                                <h2 className="text-3xl font-black font-space-grotesk text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-white/5 pb-4">1. Usage Rights & Licensing</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                                    By accessing the SmartCampus Operating System (SmartOS), your institution is granted a non-exclusive, non-transferable license to operate our multi-tenant architecture under your designated enterprise namespace. Usage is predicated on institutional verification and adherence to our core orchestration rules.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    <div className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><Cpu className="w-5 h-5" /></div>
                                        <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-wider">Automated orchestration for institutional nodes.</p>
                                    </div>
                                    <div className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><Lock className="w-5 h-5" /></div>
                                        <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-wider">Multi-factor identity mapping for all personnel.</p>
                                    </div>
                                </div>
                            </section>

                            <section id="uptime-sla">
                                <h2 className="text-3xl font-black font-space-grotesk text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-white/5 pb-4">2. Uptime & Service Level Agreement</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                                    SmartOS provides a guaranteed 99.99% uptime for core API endpoints, including the "Verification Engine" and "Admission Orchestrator". We employ real-time telemetry and geo-redundant clusters to maintain sub-100ms response times globally.
                                </p>
                                <div className="mt-8 p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                    <div className="flex items-center gap-2 mb-2"><Activity className="w-4 h-4 text-emerald-500" /> <span className="text-[10px] font-black uppercase text-emerald-500">Live Telemetry</span></div>
                                    <p className="text-sm font-bold text-slate-500 italic">"Global node availability is currently at 99.998% for the last 30 operational cycles."</p>
                                </div>
                            </section>

                            <section id="data-integrity">
                                <h2 className="text-3xl font-black font-space-grotesk text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-white/5 pb-4">3. Accountability & Data Integrity</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                                    As a cryptographic operating system, SmartOS is not liable for data inaccuracies provided by the institution. However, our protocol guarantees that once a record is verified and hashed, it remains mathematically immutable and tamper-proof. Institutions are responsible for the "Root of Trust" credentials provided to their administrators.
                                </p>
                            </section>

                            <section id="liability">
                                <h2 className="text-3xl font-black font-space-grotesk text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-white/5 pb-4">4. Institutional Liability</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                                    SmartOS is an infrastructure provider. We are not an educational institution and do not issue degrees or academic credentials ourselves. We provide the technical layer used by accredited institutions to perform these functions with increased integrity.
                                </p>
                            </section>

                            <section id="termination">
                                <h2 className="text-3xl font-black font-space-grotesk text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-white/5 pb-4">5. Termination of Service</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                                    Service termination requires a 90-day transition period, ensuring institutional data portability. Upon termination, cryptographic hashes in the public verification ledger will remain for credential continuity, but institutional shards will be securely decommissioned.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
