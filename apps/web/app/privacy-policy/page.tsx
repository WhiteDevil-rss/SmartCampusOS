'use client';

import React from 'react';
import { LandingNav } from '@/components/landing-nav';
import { LandingFooter } from '@/components/landing-footer';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, FileText, Globe, ArrowRight } from 'lucide-react';
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import Link from 'next/link';

export default function PrivacyPolicyPage() {
    const sections = [
        { id: "data-collection", title: "1. Data Collection Architecture" },
        { id: "processing", title: "2. Institutional Processing" },
        { id: "encryption", title: "3. Cryptographic Standards" },
        { id: "retention", title: "4. Node Record Retention" },
        { id: "compliance", title: "5. International Compliance (GDPR/FERPA)" },
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
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px] mix-blend-screen" />
            </div>

            <main className="flex-1 relative z-10 pt-40 pb-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-4 gap-16">
                    
                    {/* Sticky Sidebar TOC */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-32 space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-6">Framework</h3>
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
                                <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Compliance Update</div>
                                <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">Our protocol was last audited on March 2026 for GDPR Type II compliance.</p>
                                <button className="text-[10px] font-black text-primary flex items-center gap-1 hover:gap-2 transition-all">READ AUDIT <ArrowRight className="w-3 h-3" /></button>
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
                            <div className="inline-flex px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase rounded-full mb-6">Security Document v4.1</div>
                            <h1 className="text-5xl md:text-7xl font-black font-space-grotesk tracking-tight mb-8">Data Privacy <span className="text-primary italic">Statement</span></h1>
                            <div className="flex items-center gap-4 text-slate-400 text-sm font-bold">
                                <span>Last Updated: March 15, 2026</span>
                                <span className="h-4 w-px bg-slate-200 dark:bg-white/10" />
                                <span>Global HQ Enforcement</span>
                            </div>
                        </motion.div>

                        <div className="prose prose-slate dark:prose-invert max-w-none space-y-16">
                            <section id="data-collection">
                                <h2 className="text-3xl font-black font-space-grotesk text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-white/5 pb-4">1. Data Collection Architecture</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                                    SmartCampus OS acts as a data processor for its institutional clients. We do not own the academic records processed through the platform. Data ingestion occurs through secure institutional gateways, encrypted at the edge before reaching our persistence layer.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10">
                                        <h4 className="font-black text-sm uppercase mb-3">Institutional Data</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">Names, academic IDs, and departmental mappings provided by the registrar.</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10">
                                        <h4 className="font-black text-sm uppercase mb-3">Verification Hashes</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">Non-reversible SHA-256 strings representing diplomas and transcripts.</p>
                                    </div>
                                </div>
                            </section>

                            <section id="processing">
                                <h2 className="text-3xl font-black font-space-grotesk text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-white/5 pb-4">2. Institutional Processing</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                                    All processing logic—including admission score mapping, timetable conflict resolution, and financial aid eligibility—is performed in isolated tenant clusters. No student data is shared between different universities or third-party advertisers.
                                </p>
                            </section>

                            <section id="encryption">
                                <h2 className="text-3xl font-black font-space-grotesk text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-white/5 pb-4">3. Cryptographic Standards</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-6">
                                    We employ the "SmartOS Trust Protocol" which utilizes asymmetric encryption for institutional signatures and symmetric AES-256-GCM for records at rest.
                                </p>
                                <div className="p-8 rounded-3xl bg-slate-900 text-emerald-500 font-mono text-sm leading-relaxed border border-white/10">
                                    <div className="flex items-center gap-2 mb-4 opacity-50"><Lock className="w-4 h-4" /> ENCRYPTION_HEARTBEAT</div>
                                    <p>PROTOCOL: TLS 1.3_ChaCha20_Poly1305</p>
                                    <p>CIPHER: AES_256_GCM_SHA384</p>
                                    <p>ENTROPY_SOURCE: Hardware_RNG_Level_4</p>
                                    <p className="mt-4 text-emerald-500 font-black">STATUS: HARDENED_OPERATIONAL</p>
                                </div>
                            </section>

                            <section id="retention">
                                <h2 className="text-3xl font-black font-space-grotesk text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-white/5 pb-4">4. Node Record Retention</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                                    Cryptographic hashes in the verification ledger are retained in accordance with national academic record mandates (typically 50-100 years). PII data stored in institutional shards is subject to the university&apos;s own data disposal policy.
                                </p>
                            </section>

                            <section id="compliance">
                                <h2 className="text-3xl font-black font-space-grotesk text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-white/5 pb-4">5. International Compliance</h2>
                                <div className="space-y-6">
                                    <div className="flex gap-6 items-start">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><Globe className="w-6 h-6" /></div>
                                        <div>
                                            <h4 className="font-black text-lg mb-2">GDPR (Global)</h4>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">Full support for the "Right to Erasure" (on non-immutable shards) and "Data Portability" through our standard API exports.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 items-start">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><ShieldCheck className="w-6 h-6" /></div>
                                        <div>
                                            <h4 className="font-black text-lg mb-2">FERPA (United States)</h4>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">Compliance with U.S. federal privacy requirements for educational institutions.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
