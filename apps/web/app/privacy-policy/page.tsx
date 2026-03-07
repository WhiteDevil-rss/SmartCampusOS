"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-background text-text-primary font-sans antialiased mesh-gradient selection:bg-primary/30">
            {/* Nav Header */}
            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 glass-morphism border-b border-border">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-primary text-2xl">hub</span>
                        </div>
                        <span className="text-white text-xl font-bold font-space-grotesk tracking-tight">SmartCampus OS</span>
                    </Link>
                    <Link href="/" className="text-sm font-bold uppercase tracking-widest text-text-muted hover:text-white transition-colors flex items-center gap-2 group">
                        <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>
                        Back Home
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-24 px-6 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
                        <h2 className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-4">Governance & Trust</h2>
                        <h1 className="text-5xl font-bold font-space-grotesk leading-tight tracking-tight mb-6">
                            Privacy <span className="gradient-text">Protocol</span>
                        </h1>
                        <p className="text-text-secondary font-medium">Revision 2.0.4 — Effective March 2026</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="prose prose-invert prose-slate max-w-none space-y-12"
                    >
                        <section className="bg-white/5 rounded-3xl p-8 border border-border">
                            <h2 className="text-white text-2xl font-bold font-space-grotesk mb-4 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">data_usage</span>
                                1. Data Collection Architecture
                            </h2>
                            <p className="text-text-muted leading-relaxed mb-4">
                                SmartCampus OS processes institutional data with clinical precision. We collect:
                            </p>
                            <ul className="grid md:grid-cols-2 gap-4 list-none p-0 tracking-tight">
                                {[
                                    { title: 'Identity Layer', desc: 'Secure UID, email, and biometric markers for login.' },
                                    { title: 'Academic Assets', desc: 'Room capacities, faculty load, and course structures.' },
                                    { title: 'Telemetry', desc: 'Infrastructure performance and security audit trails.' },
                                    { title: 'Audit Logs', desc: 'Detailed tracking of administrative overrides.' }
                                ].map((item, i) => (
                                    <li key={i} className="bg-[#0f172a] p-4 rounded-xl border border-border">
                                        <strong className="text-slate-200 block mb-1">{item.title}</strong>
                                        <span className="text-xs text-text-secondary">{item.desc}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-white text-2xl font-bold font-space-grotesk mb-4">2. Processing Logic</h2>
                            <p className="text-text-muted leading-relaxed">
                                Data is processed exclusively for the purpose of institutional optimization. Our AI engines use academic metadata to resolve scheduling conflicts, monitor campus resources, and provide predictive analytics for administrative decision-making. We never sell or monetize institutional intelligence to third-party entities.
                            </p>
                        </section>

                        <section className="border-l-2 border-primary/20 pl-8">
                            <h2 className="text-white text-2xl font-bold font-space-grotesk mb-4">3. Sovereign Encryption</h2>
                            <p className="text-text-muted leading-relaxed">
                                All data in transit is protected by TLS 1.3 protocol. At-rest data is encrypted using AES-256 standard within decentralized cloud infrastructure conforming to SOC2 and ISO27001 certifications.
                            </p>
                        </section>

                        <section className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
                            <h2 className="text-white text-2xl font-bold font-space-grotesk mb-4">4. Legal Contact</h2>
                            <p className="text-text-muted leading-relaxed mb-6">
                                For inquiries regarding data sovereignty, GDPR/CCPA compliance, or structural deletion requests, please contact our Data Protection Officer.
                            </p>
                            <div className="flex items-center gap-3 text-white font-bold font-space-grotesk underline">
                                <span className="material-symbols-outlined">gavel</span>
                                legal@smartcampus.ac.in
                            </div>
                        </section>
                    </motion.div>
                </div>
            </main>

            <footer className="py-12 border-t border-border text-center">
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">SmartCampus Enterprise Hub</p>
            </footer>
        </div>
    );
}
