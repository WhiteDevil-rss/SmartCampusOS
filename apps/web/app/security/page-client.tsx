"use client";

import React from 'react';
import Link from 'next/link';

export default function SecurityClient() {
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
                        <Link href="/platform" className="hover:text-primary transition-colors">Platform</Link>
                        <Link href="/solutions" className="hover:text-primary transition-colors">Solutions</Link>
                        <Link href="/security" className="text-primary">Security</Link>
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
                <div className="text-center mb-24 animate-fade-in">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8 shadow-glow-primary">
                        <span className="material-symbols-outlined text-primary text-5xl">shield_person</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 tracking-tight leading-tight">
                        Enterprise-Grade <span className="gradient-text">Security</span>
                    </h1>
                    <p className="text-text-secondary text-xl max-w-2xl mx-auto">
                        Your institution's data is our highest priority. We employ multi-layered security protocols to ensure complete data integrity.
                    </p>
                </div>

                {/* Security Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                    {[
                        { title: "SSL Encryption", icon: "lock", desc: "All data in transit is protected by high-standard TLS 1.3 encryption (AES-256)." },
                        { title: "Privacy Compliant", icon: "gavel", desc: "Fully compliant with GDPR, FERPA, and international data privacy standards." },
                        { title: "ISO Audited", icon: "verified_user", desc: "Regular security audits and ISO certification ensure consistent protection." },
                        { title: "99.9% Uptime", icon: "cloud_done", desc: "Hosted on enterprise-grade global data centers with redundant backups." },
                        { title: "Access Control", icon: "manage_accounts", desc: "Granular role-based permissions and multi-factor authentication for all users." },
                        { title: "Audit Logging", icon: "visibility", desc: "Comprehensive logging of all system activities for full transparency and accountability." }
                    ].map((s, i) => (
                        <div key={i} className="glass-card p-10 rounded-3xl border-white/5 group hover:border-primary/30 transition-all">
                            <div className="w-16 h-16 rounded-2xl bg-surface border border-white/5 flex items-center justify-center mb-8 shadow-2xl group-hover:bg-primary group-hover:text-white transition-all">
                                <span className="material-symbols-outlined text-3xl font-bold">{s.icon}</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{s.title}</h3>
                            <p className="text-text-secondary leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Data Protection Workflow */}
                <section className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold font-heading mb-4">The Data Journey</h2>
                        <p className="text-text-muted">How we protect your data at every step of the process.</p>
                    </div>

                    <div className="relative max-w-4xl mx-auto">
                        <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-accent-red opacity-30"></div>

                        {[
                            { title: "Ingestion", desc: "Data is sanitized and validated at the edge before entering our system.", icon: "input" },
                            { title: "Encryption", icon: "vpn_lock", desc: "Data is immediately encrypted using industry-leading AES-256 standards." },
                            { title: "Storage", icon: "database", desc: "Information is stored in physically segregated, multi-tenant databases." },
                            { title: "Recovery", icon: "backup", desc: "Real-time geo-redundant backups ensure data is never lost." }
                        ].map((step, i) => (
                            <div key={i} className={`flex flex-col md:flex-row items-center gap-12 mb-20 last:mb-0 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                                <div className="flex-1 text-center md:text-right">
                                    {i % 2 === 0 && (
                                        <div>
                                            <h4 className="text-2xl font-bold mb-3">{step.title}</h4>
                                            <p className="text-text-secondary">{step.desc}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="relative z-10 w-20 h-20 rounded-full bg-surface border-4 border-background flex items-center justify-center shadow-glow">
                                    <span className="material-symbols-outlined text-primary text-3xl font-bold">{step.icon}</span>
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    {i % 2 === 1 && (
                                        <div>
                                            <h4 className="text-2xl font-bold mb-3">{step.title}</h4>
                                            <p className="text-text-secondary">{step.desc}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final Statement */}
                <section className="text-center bg-surface/30 p-20 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent"></div>
                    <h2 className="text-4xl font-bold font-heading mb-6 relative z-10">Your Data is Safe With Us</h2>
                    <p className="text-xl text-text-secondary mb-10 relative z-10 max-w-2xl mx-auto">We are committed to maintaining the highest levels of security and privacy for our global institutional partners.</p>
                    <button className="px-12 py-5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-xl shadow-2xl glow-shadow-primary hover:scale-105 transition-transform relative z-10">
                        Download Security Whitepaper
                    </button>
                </section>
            </main>

            <footer className="border-t border-white/5 py-12 px-6 text-center text-xs text-text-muted uppercase tracking-widest">
                <p>© 2024 Zembaa AI Technologies. All Rights Reserved.</p>
            </footer>
        </div>
    );
}
