"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TermsOfServicePage() {
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
                        <h2 className="text-secondary font-bold uppercase tracking-[0.3em] text-xs mb-4">Legal Framework</h2>
                        <h1 className="text-5xl font-bold font-space-grotesk leading-tight tracking-tight mb-6">
                            Terms of <span className="gradient-text">Service</span>
                        </h1>
                        <p className="text-text-secondary font-medium">Agreement Version 4.1.2 — Effective March 2026</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="prose prose-invert prose-slate max-w-none space-y-12"
                    >
                        <section>
                            <h2 className="text-white text-2xl font-bold font-space-grotesk mb-4">1. Institutional Agreement</h2>
                            <p className="text-text-muted leading-relaxed">
                                Accessing SmartCampus OS implies a binding legal agreement between the accessing Institution and SmartCampus Enterprise Hub. By initializing an instance, you warrant that you possess the executive authority to integrate our AI orchestration layer into your academic infrastructure.
                            </p>
                        </section>

                        <div className="grid md:grid-cols-2 gap-8 ring-1 ring-white/5 rounded-3xl p-8 bg-white/5">
                            <section>
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-sm">security</span>
                                    Permitted Usage
                                </h3>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Usage is restricted to autonomous scheduling, resource allocation, and student lifecycle management. Enterprise accounts are subject to computational quota limits defined in the Service Level Agreement (SLA).
                                </p>
                            </section>
                            <section>
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-accent-red text-sm">block</span>
                                    Prohibited Conduct
                                </h3>
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Decompilation of the core constraint engine, automated scraping of structural metadata, or unauthorized penetration testing is strictly prohibited and constitutes a breach of contract.
                                </p>
                            </section>
                        </div>

                        <section>
                            <h2 className="text-white text-2xl font-bold font-space-grotesk mb-4">2. Algorithmic Liability</h2>
                            <p className="text-text-muted leading-relaxed">
                                SmartCampus OS delivers high-fidelity optimization based on provided institutional constraints. While our engine achieves 99.9% conflict accuracy, the final validation and deployment of academic schedules remain the responsibility of the University's Registrar or appointed administrative body.
                            </p>
                        </section>

                        <section className="bg-secondary/5 rounded-3xl p-8 border border-secondary/10">
                            <h2 className="text-white text-2xl font-bold font-space-grotesk mb-4 flex items-center gap-3">
                                <span className="material-symbols-outlined text-secondary">verified</span>
                                3. Intellectual Property
                            </h2>
                            <p className="text-text-muted leading-relaxed mb-6 text-sm">
                                All proprietary algorithms, the "SmartCampus OS" brand, and the unique mesh-gradient design language are the exclusive intellectual property of the Enterprise Hub. Institutional data uploaded remains the property of the User.
                            </p>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                                Contact: compliance@smartcampus.ac.in
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
