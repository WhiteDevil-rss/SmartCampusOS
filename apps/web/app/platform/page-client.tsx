"use client";

import React from 'react';
import Link from 'next/link';

export default function PlatformClient() {
    return (
        <div className="min-h-screen bg-background text-text-primary font-sans">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

            {/* Navigation */}
            <nav className="sticky top-0 z-50 px-4 py-3">
                <div className="glass-morphism rounded-full px-4 py-2 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
                        </div>
                        <span className="font-heading font-bold text-lg tracking-tight">Zembaa AI</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <Link href="/platform" className="text-primary">Platform</Link>
                        <Link href="/solutions" className="hover:text-primary transition-colors">Solutions</Link>
                        <Link href="/security" className="hover:text-primary transition-colors">Security</Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/login">
                            <button className="text-xs font-semibold px-3 py-1.5 border border-primary/30 rounded-full hover:bg-primary/10 transition-colors">Log In</button>
                        </Link>
                        <button className="text-xs font-bold px-4 py-1.5 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-lg glow-shadow-primary">Start Free</button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-20">
                {/* Hero */}
                <div className="text-center mb-24 animate-fade-in">
                    <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 tracking-tight leading-tight">
                        The Complete <span className="gradient-text">Academic</span> Scheduling Platform
                    </h1>
                    <p className="text-text-secondary text-xl max-w-2xl mx-auto">
                        A comprehensive suite of AI tools designed to modernize institutional scheduling and resource management.
                    </p>
                </div>

                {/* Capabilities Grid */}
                <section className="mb-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: "AI-Powered Generation", icon: "psychology", color: "primary", desc: "Proprietary algorithms that compute billions of variables for optimal flows." },
                            { title: "Conflict Detection", icon: "error_med", color: "secondary", desc: "Real-time identification of overlaps, room bottlenecks, and faculty constraints." },
                            { title: "Multi-Program Scheduling", icon: "account_tree", color: "primary", desc: "Manage multiple programs, divisions, and semesters in a single unified view." },
                            { title: "Elective Management", icon: "list_alt", color: "secondary", desc: "Smart handling of elective baskets and student availability splits." },
                            { title: "Room Allocation", icon: "meeting_room", color: "primary", desc: "Automated space optimization based on capacity, equipment, and distance." },
                            { title: "Partial Regeneration", icon: "autorenew", color: "secondary", desc: "Update specific parts of the schedule without affecting the entire institution." }
                        ].map((c, i) => (
                            <div key={i} className="glass-card p-10 rounded-3xl group hover:-translate-y-2 transition-all duration-300">
                                <div className={`w-14 h-14 rounded-2xl bg-${c.color}/10 flex items-center justify-center mb-8 group-hover:bg-${c.color} group-hover:text-white transition-all`}>
                                    <span className="material-symbols-outlined text-3xl font-bold">{c.icon}</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{c.title}</h3>
                                <p className="text-text-secondary leading-relaxed">{c.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Engine Showcase */}
                <section className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="animate-slide-up">
                        <span className="bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6 inline-block">Advanced Engine</span>
                        <h2 className="text-4xl md:text-5xl font-bold font-heading mb-8 leading-tight">Intelligent Constraint Solving</h2>
                        <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                            Our neural engine processes thousands of data points—from faculty availability to room capacity—ensuring a 100% conflict-free schedule in seconds.
                            It handles soft preferences and hard constraints with equal precision.
                        </p>
                        <div className="space-y-4">
                            {["Genetic Algorithms", "Constraint Satisfaction", "Neural Optimization"].map((t, i) => (
                                <div key={i} className="flex items-center gap-3 font-bold text-sm uppercase tracking-widest text-text-muted">
                                    <span className="w-2 h-2 rounded-full bg-primary shadow-glow"></span>
                                    {t}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative glass-morphism rounded-[3rem] p-12 overflow-hidden min-h-[400px] flex items-center justify-center border-border animate-fade-in">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
                        <div className="relative z-10 w-full max-w-sm">
                            <div className="w-full h-1 bg-white/5 rounded-full mb-12 overflow-hidden">
                                <div className="h-full bg-primary w-2/3 animate-pulse"></div>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className={`h-16 rounded-xl border border-border bg-white/5 flex items-center justify-center animate-pulse`} style={{ animationDelay: `${i * 0.1}s` }}>
                                        <div className={`w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-primary' : 'bg-secondary'}`}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Integrations */}
                <section className="glass-morphism rounded-[3rem] p-16 text-center border-border mb-32">
                    <h2 className="text-3xl font-bold font-heading mb-12">Seamless Ecosystem Integration</h2>
                    <div className="flex flex-wrap justify-center items-center gap-12 mb-12">
                        {[
                            { name: "Canvas", icon: "school" },
                            { name: "Banner", icon: "dns" },
                            { name: "PeopleSoft", icon: "hub" },
                            { name: "Moodle", icon: "history_edu" },
                            { name: "Sakai", icon: "account_balance" }
                        ].map((int, i) => (
                            <div key={i} className="flex flex-col items-center gap-4 group">
                                <div className="size-20 rounded-3xl bg-surface border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors shadow-2xl">
                                    <span className="material-symbols-outlined text-4xl text-text-muted group-hover:text-primary transition-colors">{int.icon}</span>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">{int.name}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-text-muted max-w-xl mx-auto">Connect with your existing SIS, LMS, and ERP systems directly via built-in connectors or our robust API platform.</p>
                </section>

                {/* CTA */}
                <section className="text-center bg-gradient-to-br from-[#1A1A3E] to-background p-16 rounded-[4rem] border border-border shadow-3xl">
                    <h2 className="text-4xl md:text-6xl font-bold font-heading mb-8">Ready to Optimize?</h2>
                    <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto">Join the institutions leading the way in academic innovation with Zembaa AI.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <button className="px-12 py-5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-xl shadow-2xl glow-shadow-primary hover:scale-105 transition-transform">
                            Start Free Trial
                        </button>
                        <button className="px-12 py-5 rounded-full border border-border bg-white/5 font-semibold text-xl hover:bg-surface-hover transition-colors">
                            Read Docs
                        </button>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border py-12 px-6 text-center text-xs text-text-muted uppercase tracking-widest">
                <p>© 2024 Zembaa AI Technologies. All Rights Reserved.</p>
            </footer>
        </div>
    );
}
