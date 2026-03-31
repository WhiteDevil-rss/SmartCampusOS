'use client';

import React from 'react';
import { LandingNav } from '@/components/landing-nav';
import { LandingFooter } from '@/components/landing-footer';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, FileText, Globe, ArrowRight, Gavel, Cpu, Zap, Activity, Info } from 'lucide-react';
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import Link from 'next/link';

export default function LegalPage() {
    const legalTabs = [
        { title: "Privacy Policy", icon: <Lock className="w-5 h-5" />, href: "/privacy-policy", desc: "How we process and protect institutional and student data." },
        { title: "Terms of Service", icon: <FileText className="w-5 h-5" />, href: "/terms-of-service", desc: "The operational framework and licensing for institutions." },
        { title: "Security SLA", icon: <ShieldCheck className="w-5 h-5" />, href: "/security", desc: "Our commitment to uptime and cryptographic integrity." },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/30 antialiased flex flex-col">
            <LandingNav />

            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px] mix-blend-screen" />
                <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            <main className="flex-1 relative z-10 pt-40 pb-24 px-6 lg:px-12 max-w-7xl mx-auto w-full">
                <div className="text-center mb-24 max-w-4xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8">
                            Trust & Governance Hub
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tight font-space-grotesk mb-8 leading-[0.95]">
                            Legal <span className="text-slate-500 italic">Framework</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xl font-medium leading-relaxed max-w-3xl mx-auto">
                            The transparent administrative layer governing the SmartCampus Operating System and its global institutional partners.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-40">
                    {legalTabs.map((tab, i) => (
                        <Link key={i} href={tab.href} className="group">
                            <GlassCard className="rounded-[3rem] h-full border-2 border-slate-100 dark:border-white/10 hover:border-primary/50 transition-all duration-500 bg-white/40 dark:bg-[#0a1120]">
                                <GlassCardContent className="p-12 flex flex-col h-full">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-400 flex items-center justify-center mb-8 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                        {tab.icon}
                                    </div>
                                    <h3 className="text-3xl font-black mb-4 font-space-grotesk tracking-tight">{tab.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 flex-1">
                                        {tab.desc}
                                    </p>
                                    <div className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                        Review Terms <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </GlassCardContent>
                            </GlassCard>
                        </Link>
                    ))}
                </div>

                {/* Additional Legal Notice Section */}
                <div className="max-w-4xl mx-auto space-y-12">
                    <section>
                        <h2 className="text-3xl font-black font-space-grotesk mb-6 flex items-center gap-3">
                            <Gavel className="w-8 h-8 text-primary" /> Corporate Identity
                        </h2>
                        <div className="p-10 rounded-[3rem] bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10">
                            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                                SmartCampus Operating System (SmartOS) is a proprietary technology platform developed and managed by Zembaa Solutions. All "Institutional Node" deployments are subject to master service agreements (MSAs) specifically negotiated for academic scale.
                            </p>
                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 gap-8 text-sm">
                                <div>
                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Company Registration</div>
                                    <p className="font-bold">Zembaa Solutions v4.0.0-PRO</p>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Data Governance</div>
                                    <p className="font-bold">Global Compliance Node #402</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    <section>
                        <h2 className="text-3xl font-black font-space-grotesk mb-6 flex items-center gap-3 text-emerald-500">
                             <ShieldCheck className="w-8 h-8" /> Ethical AI Usage
                        </h2>
                        <GlassCard className="rounded-[3rem] border border-emerald-500/20 bg-emerald-500/5 p-10">
                           <GlassCardContent className="p-0">
                                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                                    Our AI Orchestration layer (FastAPI Power) is used exclusively for institutional optimization—specifically scheduling, vacancy detection, and document OCR. SmartOS does not use student data to train external large language models (LLMs) or commercial advertising profiles.
                                </p>
                           </GlassCardContent>
                        </GlassCard>
                    </section>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
