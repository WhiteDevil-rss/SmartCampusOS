"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AboutUsPage() {
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
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-24"
                    >
                        <h2 className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-4">Our Genesis</h2>
                        <h1 className="text-5xl md:text-7xl font-bold font-space-grotesk leading-tight tracking-tight mb-8">
                            Engineering <span className="gradient-text">Institutional</span> Intelligence
                        </h1>
                        <p className="text-text-muted text-xl leading-relaxed">
                            SmartCampus OS was born from a simple realization: the complexity of modern education requires an operating system, not just a set of tools.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 mb-24">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="glass-morphism rounded-[32px] p-10 border border-border relative overflow-hidden group hover:border-primary/30 transition-colors"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all" />
                            <span className="material-symbols-outlined text-4xl text-primary mb-6">workspace_premium</span>
                            <h3 className="text-2xl font-bold font-space-grotesk mb-4">The Vision</h3>
                            <p className="text-text-muted leading-relaxed">
                                To establish the global standard for autonomous campus management. We unify time, space, and human capital into a singular, optimized digital architecture.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="glass-morphism rounded-[32px] p-10 border border-border relative overflow-hidden group hover:border-secondary/30 transition-colors"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-3xl -mr-16 -mt-16 group-hover:bg-secondary/20 transition-all" />
                            <span className="material-symbols-outlined text-4xl text-secondary mb-6">bolt</span>
                            <h3 className="text-2xl font-bold font-space-grotesk mb-4">The Mission</h3>
                            <p className="text-text-muted leading-relaxed">
                                Delivering an infallible AI orchestration layer that respects institutional constraints while maximizing academic outcomes and administrative efficiency.
                            </p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/5 rounded-[40px] p-12 border border-border text-center"
                    >
                        <h2 className="text-3xl font-bold font-space-grotesk mb-8">Guided by Innovation</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { val: '10M+', label: 'Slot Computations' },
                                { val: '99.9%', label: 'Conflict Accuracy' },
                                { val: '40%', label: 'Time Reclaimed' },
                                { val: '24/7', label: 'AI Monitoring' }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="text-3xl font-bold text-white mb-2">{stat.val}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="mt-24 text-center">
                        <p className="text-text-secondary text-sm mb-8 italic">"Building the foundation for the next century of education."</p>
                        <Link href="/contact" className="glow-button inline-flex bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform active:scale-95">
                            Join the Evolution
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="py-12 border-t border-border text-center">
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">SmartCampus Enterprise Hub</p>
            </footer>
        </div>
    );
}
