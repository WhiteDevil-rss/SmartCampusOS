'use client';

import React, { useState } from "react";
import { LandingNav } from "@/components/landing-nav";
import { LandingFooter } from "@/components/landing-footer";
import { GetStartedModal } from "@/components/get-started-modal";

export default function SecurityPage() {
    const [showInquiryModal, setShowInquiryModal] = useState(false);

    return (
        <div className="dark min-h-screen bg-background-dark text-slate-100 relative overflow-x-hidden flex flex-col font-heading selection:bg-neon-cyan/30 antialiased">
            <LandingNav />

            <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-6 py-12 md:py-20 gap-24">
                {/* Hero */}
                <section className="flex flex-col items-center text-center gap-8 relative">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(0,245,255,0.1)_0%,transparent_70%)]" />
                    <div className="w-32 h-32 rounded-full bg-neon-cyan/10 flex items-center justify-center border border-neon-cyan/30 shadow-[0_0_40px_rgba(0,245,255,0.2)]">
                        <span className="material-symbols-outlined text-6xl text-neon-cyan">security</span>
                    </div>
                    <div className="max-w-3xl flex flex-col gap-4">
                        <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                            Enterprise-Grade <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-blue-400">Security</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 font-normal leading-relaxed">
                            Your academic data is protected by industry-leading security standards. We employ multiple layers of defense to ensure absolute integrity and confidentiality.
                        </p>
                    </div>
                    <button
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex mt-4 items-center justify-center rounded-full bg-gradient-to-r from-neon-cyan to-blue-500 text-white px-[36px] py-[14px] text-[16px] font-semibold shadow-[0_0_20px_rgba(0,245,255,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(0,245,255,0.5)] transition-all active:scale-95"
                    >
                        Learn More
                    </button>
                </section>

                {/* Security Features */}
                <section id="features" className="flex flex-col gap-12">
                    <div className="flex flex-col gap-4 text-center items-center">
                        <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight">Comprehensive Protection</h2>
                        <p className="text-slate-400 text-base max-w-2xl">Zembaa employs multiple layers of security to ensure your data is always safe, from transmission to storage.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: "gpp_good", title: "Secure Authentication", desc: "Multi-factor authentication and Single Sign-On (SSO) integration for secure, verified access." },
                            { icon: "manage_accounts", title: "Role-Based Access", desc: "Granular control over permissions, ensuring users only access what they need." },
                            { icon: "enhanced_encryption", title: "Data Encryption", desc: "AES-256 encryption at rest and TLS 1.3 in transit for all sensitive information." },
                            { icon: "visibility_off", title: "Privacy Protection", desc: "Strict adherence to GDPR, CCPA, and FERPA regulations for academic data privacy." },
                            { icon: "monitoring", title: "Activity Monitoring", desc: "24/7 continuous monitoring, automated threat detection, and comprehensive logging." },
                            { icon: "dns", title: "Secure Infrastructure", desc: "Hosted on SOC2 compliant infrastructure with automated disaster recovery protocols." },
                        ].map((feature, i) => (
                            <div key={i} className="flex flex-col gap-4 rounded-xl border border-white/10 bg-surface-dark/50 backdrop-blur-sm p-6 hover:border-neon-cyan/50 transition-colors group">
                                <div className="w-12 h-12 rounded-lg bg-neon-cyan/10 flex items-center justify-center group-hover:bg-neon-cyan/20 transition-colors">
                                    <span className="material-symbols-outlined text-2xl text-neon-cyan">{feature.icon}</span>
                                </div>
                                <div className="flex flex-col gap-2 h-full">
                                    <h3 className="text-lg font-bold leading-tight mb-2">{feature.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-4">{feature.desc}</p>
                                    <div className="mt-auto">
                                        <button className="flex items-center text-[14px] font-medium text-neon-cyan hover:underline transition-all group-hover:gap-1">
                                            Read More <span className="material-symbols-outlined text-[16px] ml-1">arrow_right_alt</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Data Protection Flow */}
                <section className="flex flex-col gap-12 max-w-4xl mx-auto w-full">
                    <div className="flex flex-col gap-4 text-center items-center">
                        <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight">Data Protection Flow</h2>
                        <p className="text-slate-400 text-base max-w-2xl">How we handle your data from entry to secure storage.</p>
                    </div>
                    <div className="relative flex flex-col gap-8 py-4">
                        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-white/10 -translate-x-1/2" />
                        <div className="absolute left-8 md:left-1/2 top-0 h-1/2 w-0.5 bg-gradient-to-b from-neon-cyan to-transparent -translate-x-1/2 shadow-[0_0_10px_rgba(0,245,255,0.5)]" />

                        {[
                            { title: "1. Secure Data Entry", desc: "All data entered is immediately encrypted in the browser using TLS 1.3 before transmission.", active: true },
                            { title: "2. Encrypted in Transit", desc: "Data passes through strict validation firewalls and malware scanning before reaching our core systems.", active: false },
                            { title: "3. Stored with Encryption", desc: "Processed schedules are stored using AES-256 encryption in distinct, isolated databases.", active: false },
                            { title: "4. Access Controlled", desc: "Role-based permissions ensure only authorized users can access specific data sets.", active: false },
                            { title: "5. Regular Backups", desc: "Automated, encrypted backups are distributed across multiple geographic regions.", active: false },
                        ].map((step, i) => (
                            <div key={i} className={`relative flex items-center ${i % 2 === 0 ? 'justify-start md:justify-end md:pr-1/2' : 'justify-start md:justify-start md:pl-1/2'} w-full`}>
                                <div className={`absolute left-8 md:left-1/2 w-4 h-4 rounded-full -translate-x-1/2 border-4 border-background-dark z-10 ${step.active ? 'bg-neon-cyan shadow-[0_0_10px_rgba(0,245,255,0.8)]' : 'bg-slate-600'
                                    }`} />
                                <div className={`${i % 2 === 0 ? 'ml-16 md:ml-0 md:mr-12' : 'ml-16 md:ml-12'} w-full md:w-5/12 bg-surface-dark p-6 rounded-xl border border-white/10`}>
                                    <h4 className={`text-lg font-bold mb-2 ${step.active ? 'text-neon-cyan' : 'text-slate-200'}`}>{step.title}</h4>
                                    <p className="text-sm text-slate-400">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Trust Badges */}
                <section className="flex flex-col gap-10 py-12 border-y border-white/10">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-8">Trusted by Institutions Worldwide</h3>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 md:gap-12">
                        {[
                            { icon: "verified_user", label: "SSL Secured" },
                            { icon: "policy", label: "Privacy Compliant" },
                            { icon: "fact_check", label: "Annual Audits" },
                            { icon: "speed", label: "99.9% Uptime" },
                        ].map((badge, i) => (
                            <div key={i} className="flex items-center gap-3 bg-surface-dark px-6 py-4 rounded-full border border-white/10 shadow-[0_0_15px_rgba(0,245,255,0.05)] hover:border-neon-cyan/30 transition-colors">
                                <span className="material-symbols-outlined text-neon-cyan">{badge.icon}</span>
                                <span className="font-medium text-sm">{badge.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="flex flex-col items-center text-center gap-8 py-12 bg-gradient-to-b from-transparent to-neon-cyan/5 rounded-3xl border border-white/10">
                    <h2 className="text-3xl md:text-5xl font-bold leading-tight">Your Data is Safe With Us</h2>
                    <p className="text-slate-400 max-w-xl text-lg">Focus on optimizing your academic schedules. We&apos;ll handle the complex security infrastructure.</p>
                    <button
                        onClick={() => setShowInquiryModal(true)}
                        className="mt-4 flex cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-neon-cyan to-blue-500 text-white px-[36px] py-[14px] text-[16px] font-semibold shadow-[0_0_20px_rgba(0,245,255,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(0,245,255,0.5)] transition-all active:scale-95"
                    >
                        Get Started Securely
                    </button>
                </section>
            </main>

            <LandingFooter />

            <GetStartedModal isOpen={showInquiryModal} onClose={() => setShowInquiryModal(false)} />
        </div>
    );
}
