'use client';

import React from 'react';
import { LandingNav } from '@/components/landing-nav';
import { LandingFooter } from '@/components/landing-footer';
import { motion } from 'framer-motion';
import { 
    ShieldCheck, 
    Lock, 
    Gavel, 
    UserCheck, 
    CloudDownload, 
    UserCog, 
    Eye, 
    Zap, 
    Database, 
    Globe, 
    Server, 
    Shield,
    ArrowRight,
    Search
} from 'lucide-react';
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import Link from 'next/link';

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/30 antialiased flex flex-col">
            <LandingNav />

            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[150px] mix-blend-screen" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px]" />
            </div>

            <main className="flex-1 relative z-10 pt-40">
                {/* Hero section */}
                <section className="px-6 lg:px-12 max-w-7xl mx-auto mb-32 text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-8">
                            Trust Operations Center
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tight font-space-grotesk mb-8 leading-[0.95]">
                            Cryptographically <span className="text-emerald-500 italic">Secure</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xl md:text-2xl font-medium leading-relaxed max-w-3xl mx-auto">
                            Institutional integrity is in our DNA. We protect every record with end-to-end cryptographic hashing and military-grade encryption.
                        </p>
                    </motion.div>
                </section>

                {/* Trust Badges Bar */}
                <section className="py-16 mb-40 border-y border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12">
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                           {[
                               { label: "SOC2 TYPE II", icon: <ShieldCheck className="w-8 h-8" /> },
                               { label: "GDPR READY", icon: <Shield className="w-8 h-8" /> },
                               { label: "ISO 27001", icon: <Lock className="w-8 h-8" /> },
                               { label: "HIPAA COMPLIANT", icon: <Database className="w-8 h-8" /> },
                           ].map((badge, i) => (
                               <div key={i} className="flex flex-col items-center gap-3">
                                   <div className="text-slate-600 dark:text-slate-400">{badge.icon}</div>
                                   <div className="text-[10px] font-black tracking-widest">{badge.label}</div>
                               </div>
                           ))}
                        </div>
                    </div>
                </section>

                {/* Security Pillars Grid */}
                <section className="px-6 lg:px-12 max-w-7xl mx-auto mb-40">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { title: "Quantum-Resistant Hashing", desc: "Every academic record is hashed using SHA-256 and signed with institutional private keys, creating an immutable proof of achievement.", icon: <Zap className="w-8 h-8" /> },
                            { title: "Encrypted Persistence", desc: "Data at rest is secured with AES-256-GCM, and data in transit utilizes TLS 1.3 with Perfect Forward Secrecy.", icon: <Lock className="w-8 h-8" /> },
                            { title: "Distributed Trust Nodes", desc: "Institutional nodes ensure that no single entity has complete control over academic verification, decentralizing institutional trust.", icon: <Globe className="w-8 h-8" /> },
                            { title: "Zero-Trust Architecture", desc: "Granular, role-based access control (RBAC) ensures users only access the data absolutely necessary for their operations.", icon: <UserCog className="w-8 h-8" /> },
                            { title: "99.99% Node Uptime", desc: "Our multi-region node distribution ensures the global verification network never goes dark, even during local outages.", icon: <CloudDownload className="w-8 h-8" /> },
                            { title: "Continuous Auditing", desc: "Real-time audit logs of every system interaction, stored in a tamper-proof log stream for complete accountability.", icon: <Eye className="w-8 h-8" /> },
                        ].map((pillar, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-10 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-emerald-500/50 transition-all duration-500 group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all duration-500 mb-8">
                                    {pillar.icon}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 font-space-grotesk tracking-tight">{pillar.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                    {pillar.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Blockchain/Hash Verification Showcase */}
                <section className="py-32 bg-slate-900 text-white relative overflow-hidden mb-40">
                    <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] pointer-events-none" />
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <h2 className="text-4xl md:text-6xl font-black font-space-grotesk mb-8 leading-tight">
                                    Verifiable Without <span className="text-emerald-500 italic">Central Authorities</span>
                                </h2>
                                <p className="text-slate-400 text-xl font-medium mb-12 leading-relaxed">
                                    Our proprietary verification node system allows any third party—employers, other universities, or government agencies—to verify a credential's authenticity in 300ms without needing account access.
                                </p>
                                <div className="space-y-6">
                                    <div className="flex gap-5 p-6 rounded-3xl bg-white/5 border border-white/10 shadow-2xl">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"><Search className="w-5 h-5" /></div>
                                        <p className="text-slate-300 font-medium italic mb-2">"Institutional node is validating the hash [0x7f...8a]... Consensus reached in 12ms."</p>
                                    </div>
                                    <Link 
                                        href="/verify"
                                        className="inline-flex items-center gap-3 text-emerald-500 font-black uppercase tracking-widest hover:gap-5 transition-all"
                                    >
                                        Try the Verification Node <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="aspect-square rounded-[4rem] bg-white/5 border border-white/10 p-8 relative flex flex-col justify-center gap-6">
                                    <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-[4rem] animate-pulse" />
                                    <div className="p-8 rounded-[2rem] bg-black/40 border border-white/10 font-mono text-xs text-emerald-500/70 overflow-hidden">
                                        <p className="mb-2">ROOT_HASH: 0x82f...a12c</p>
                                        <p className="mb-2">SIG_INSTITUTION_ID: "U-4029-X"</p>
                                        <p className="mb-2">METADATA_NONCE: 4920194</p>
                                        <p className="mb-2">TIMESTAMP: 2026-03-30T16:59:23Z</p>
                                        <div className="h-px bg-white/10 my-4" />
                                        <p className="text-emerald-500 font-black uppercase">Result: Verified (14 Nodes Agreed)</p>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4">
                                        {[1,2,3,4,5,6,7,8].map(i => (
                                            <div key={i} className="h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                                <Server className="w-5 h-5 text-emerald-500/50" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Incident Response / SLA */}
                <section className="px-6 lg:px-12 max-w-7xl mx-auto mb-40">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-black font-space-grotesk mb-6">Our Response Standard</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { title: "15-Minute Response", desc: "Our internal SRE and Security teams are notified within 2 seconds of any anomaly, with a guaranteed 15-minute response SLA for Critical incidents.", icon: <Zap className="w-6 h-6" /> },
                            { title: "Geo-Redundant Backup", desc: "Records are backed up synchronously in three separate global regions, ensuring 0% data loss even during complete infrastructure failure.", icon: <Database className="w-6 h-6" /> },
                            { title: "Active Threat Hunting", desc: "We deploy automated red-teaming and continuous penetration testing to identify vulnerabilities before they can be exploited.", icon: <ShieldCheck className="w-6 h-6" /> },
                        ].map((resp, i) => (
                            <div key={i} className="text-center p-8">
                                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 mx-auto mb-8">
                                    {resp.icon}
                                </div>
                                <h3 className="text-xl font-black mb-4 font-space-grotesk">{resp.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{resp.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section className="px-6 lg:px-12 max-w-5xl mx-auto mb-40 text-center">
                    <GlassCard className="rounded-[4rem] p-20 border-2 border-emerald-500/20 bg-emerald-500/5">
                        <GlassCardContent className="p-0">
                            <h2 className="text-4xl md:text-7xl font-black font-space-grotesk mb-8 text-black dark:text-white">Review Our Whitepaper</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-xl font-medium mb-12 max-w-2xl mx-auto">
                                Deep-dive into the cryptographic proofs and distributed node architecture of SmartOS.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <button className="w-full sm:w-auto px-12 py-5 rounded-[1.5rem] bg-emerald-500 text-white font-black text-xl hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3">
                                    Download Whitepaper <Database className="w-6 h-6" />
                                </button>
                                <Link
                                    href="/contact"
                                    className="w-full sm:w-auto px-12 py-5 rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-white/5 font-black text-xl hover:bg-white/10 transition-all text-slate-700 dark:text-slate-300"
                                >
                                    Security Audit Log
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
