'use client';

import React, { useState } from 'react';
import { LandingNav } from '@/components/landing-nav';
import { LandingFooter } from '@/components/landing-footer';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { getFrontendRoleHint, getRoleHomePath } from '@/lib/api';
import { 
    ShieldCheck, 
    Zap, 
    Cpu, 
    Users, 
    ArrowRight, 
    Globe, 
    Database, 
    LayoutDashboard, 
    Clock, 
    Search,
    CheckCircle2,
    XCircle,
    Network,
    Activity
} from 'lucide-react';
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { cn } from '@/lib/utils';

export default function SolutionsPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'scheduling' | 'admissions' | 'records'>('scheduling');
    const authEntryPath = getRoleHomePath(user?.role || getFrontendRoleHint());

    const tabs = [
        { 
            id: 'scheduling', 
            label: 'AI Scheduling', 
            icon: <Clock className="w-5 h-5" />,
            title: 'Algorithmic Resource Allocation',
            desc: 'Our proprietary logic engine solves NP-hard scheduling problems in seconds, balancing faculty preferences, room capacities, and student electives without conflicts.',
            features: ['Constraint-Based Optimization', 'Auto-Substitution Engine', 'Real-time Room Telemetry'],
            metric: '98% less planning time'
        },
        { 
            id: 'admissions', 
            label: 'Admissions', 
            icon: <Users className="w-5 h-5" />,
            title: 'High-Volume Pipeline Orchestration',
            desc: 'Handle 100k+ applications with our distributed queuing system. Automated document verification and instant eligibility scoring built directly into the core.',
            features: ['AI-Powered Document OCR', 'Automated Score Mapping', 'Financial Aid Intelligence'],
            metric: '2.4s Average Processing'
        },
        { 
            id: 'records', 
            label: 'Academic Records', 
            icon: <Database className="w-5 h-5" />,
            title: 'Immutable Academic Ledger',
            desc: 'Every grade, result, and degree is hashed and anchored to our distributed trust network, making academic fraud mathematically impossible.',
            features: ['SHA-256 Record Anchoring', 'Global Verification Portal', 'Instant Digital Transcripts'],
            metric: 'Zero Fraud Incidents'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/30 antialiased flex flex-col">
            <LandingNav />

            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px] mix-blend-screen" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[150px]" />
            </div>

            <main className="flex-1 relative z-10 pt-40">
                {/* Hero section */}
                <section className="px-6 lg:px-12 max-w-7xl mx-auto mb-32 text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-8">
                            Enterprise Evolution
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tight font-space-grotesk mb-8 leading-[0.95]">
                            The Institutional <span className="text-primary italic">Operating System</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xl md:text-2xl font-medium leading-relaxed max-w-3xl mx-auto">
                            Move beyond legacy ERPs. SmartOS provides the modular infrastructure to orchestrate every aspect of the modern university lifecycle.
                        </p>
                    </motion.div>
                </section>

                {/* 3-Tab Feature Showcase */}
                <section className="px-6 lg:px-12 max-w-7xl mx-auto mb-40">
                    <div className="flex flex-wrap justify-center gap-4 mb-16">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all",
                                    activeTab === tab.id 
                                        ? "bg-primary text-white shadow-xl shadow-primary/20" 
                                        : "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-white/10"
                                )}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {tabs.map((tab) => tab.id === activeTab && (
                            <motion.div
                                key={tab.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                transition={{ duration: 0.5 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                            >
                                <div className="space-y-8 p-4">
                                    <h2 className="text-4xl md:text-6xl font-black font-space-grotesk tracking-tight leading-tight">
                                        {tab.title}
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-xl font-medium leading-relaxed">
                                        {tab.desc}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {tab.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 group hover:border-primary/30 transition-all">
                                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4">
                                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-2">Quantifiable Impact</div>
                                        <div className="text-4xl font-black text-primary font-space-grotesk">{tab.metric}</div>
                                    </div>
                                </div>
                                <div className="relative">
                                    <GlassCard className="rounded-[3rem] border-2 border-primary/20 bg-primary/5 p-1 overflow-hidden aspect-video group">
                                        <div className="absolute inset-4 rounded-[2.5rem] border border-primary/20 flex items-center justify-center bg-slate-900/40 backdrop-blur-xl">
                                            <div className="text-center">
                                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-500 text-primary">
                                                    {tab.icon}
                                                </div>
                                                <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-primary transition-colors">Module Initialization</div>
                                                <div className="mt-4 h-1.5 w-48 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: "80%" }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        className="h-full bg-primary"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                    <div className="absolute -bottom-6 -right-6 px-8 py-5 rounded-3xl bg-white dark:bg-[#0a1120] border border-slate-100 dark:border-white/10 shadow-2xl z-20">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                                        <div className="text-emerald-500 font-bold flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Optimized
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </section>

                {/* Comparison Table: SmartOS vs Legacy ERP */}
                <section className="py-32 bg-slate-900 text-white relative overflow-hidden mb-40">
                    <div className="absolute inset-0 bg-primary/5 blur-[120px] pointer-events-none" />
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                        <div className="text-center mb-24">
                            <h2 className="text-4xl md:text-6xl font-black font-space-grotesk mb-6">Built Different</h2>
                            <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto">
                                Why the world's most innovative institutions are abandoning legacy ERPs for SmartOS.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="pb-8 text-[10px] uppercase font-black tracking-widest text-slate-500">Feature Capabilities</th>
                                        <th className="pb-8 text-[10px] uppercase font-black tracking-widest text-primary text-center">SmartOS Core</th>
                                        <th className="pb-8 text-[10px] uppercase font-black tracking-widest text-slate-500 text-center">Legacy ERPs</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        { label: "Deployment Speed", smart: "24-48 Hours", legacy: "6-12 Months" },
                                        { label: "Data Integrity", smart: "Cryptographic Proof", legacy: "Central Database" },
                                        { label: "AI Orchestration", smart: "Built-in Engines", legacy: "Manual Entry" },
                                        { label: "Mobile Experience", smart: "Native-Speed Web", legacy: "Not Responsive" },
                                        { label: "Inter-Institutional Nodes", smart: "Fully Supported", legacy: "Siloed Data" },
                                    ].map((row, i) => (
                                        <tr key={i} className="group hover:bg-white/[0.02] transition-all">
                                            <td className="py-8 font-bold text-slate-300">{row.label}</td>
                                            <td className="py-8 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <CheckCircle2 className="text-primary w-5 h-5 mb-1" />
                                                    <span className="text-primary font-black text-sm uppercase">{row.smart}</span>
                                                </div>
                                            </td>
                                            <td className="py-8 text-center">
                                                <div className="flex flex-col items-center gap-1 opacity-40">
                                                    <XCircle className="text-slate-500 w-5 h-5 mb-1" />
                                                    <span className="text-slate-400 font-bold text-sm uppercase">{row.legacy}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Integration Marquee (Simulated) */}
                <section className="px-6 lg:px-12 max-w-7xl mx-auto mb-40 text-center">
                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-12">Seamless Integration Network</div>
                    <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                        <div className="flex items-center gap-3 font-black text-2xl"><Zap className="text-blue-500" /> SLACK.OS</div>
                        <div className="flex items-center gap-3 font-black text-2xl"><Globe className="text-emerald-500" /> GOOGLE.EDU</div>
                        <div className="flex items-center gap-3 font-black text-2xl"><Cpu className="text-primary" /> AZURE.LABS</div>
                        <div className="flex items-center gap-3 font-black text-2xl"><Database className="text-indigo-500" /> CANVAS.API</div>
                        <div className="flex items-center gap-3 font-black text-2xl"><Activity className="text-rose-500" /> MAPPINGD.IO</div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="px-6 lg:px-12 max-w-5xl mx-auto mb-40 text-center">
                    <GlassCard className="rounded-[4rem] p-20 border-2 border-primary/20 bg-primary/5">
                        <GlassCardContent className="p-0">
                            <h2 className="text-4xl md:text-7xl font-black font-space-grotesk mb-8">Deploy Your Hub</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-xl font-medium mb-12 max-w-2xl mx-auto">
                                The future of academic management is modular, secure, and ready for your institution today.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <a
                                    href={authEntryPath}
                                    className="w-full sm:w-auto px-12 py-5 rounded-[1.5rem] bg-primary text-white font-black text-xl hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                                >
                                    Get Started <ArrowRight className="w-6 h-6" />
                                </a>
                                <Link
                                    href="/contact"
                                    className="w-full sm:w-auto px-12 py-5 rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-white/5 font-black text-xl hover:bg-white/10 transition-all text-slate-700 dark:text-slate-300"
                                >
                                    Talk to an Architect
                                </Link>
                            </div>
                        </GlassCardContent>
                    </GlassCard>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}
