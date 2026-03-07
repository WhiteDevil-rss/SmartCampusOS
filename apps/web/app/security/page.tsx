'use client';

import React, { useState } from "react";
import { LandingNav } from "@/components/landing-nav";
import { LandingFooter } from "@/components/landing-footer";
import { GetStartedModal } from "@/components/get-started-modal";
import { motion } from "framer-motion";

export default function SecurityPage() {
    const [showInquiryModal, setShowInquiryModal] = useState(false);

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans antialiased mesh-gradient flex flex-col selection:bg-primary/30">
            <LandingNav />

            <main className="flex-grow pt-32 pb-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-morphism border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-8"
                        >
                            <span className="material-symbols-outlined text-sm">enhanced_encryption</span>
                            Sovereign Data Protection
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-bold font-space-grotesk leading-tight tracking-tight mb-8">
                            Fortress Architecture for <span className="gradient-text">Academic Integrity</span>
                        </h1>
                        <p className="text-text-muted text-xl leading-relaxed max-w-2xl mx-auto">
                            SmartCampus OS is engineered with a multi-layered security stack designed to protect sovereign institutional intelligence.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-32">
                        {[
                            { icon: "gpp_maybe", title: "Zero Trust Model", desc: "Every API request and data access point is verified at the perimeter, ensuring no lateral movement in the event of a breach." },
                            { icon: "fingerprint", title: "Biometric Auth Hooks", desc: "Native support for hardware-level authentication including Passkeys, FIDO2, and institution-wide SSO integration." },
                            { icon: "vpn_lock", title: "End-to-End Encryption", desc: "Data is encrypted at the source using AES-256 and remains encrypted throughout the AI resolve cycle and archival." }
                        ].map((item, i) => (
                            <div key={i} className="glass-morphism rounded-[32px] p-8 border border-border hover:border-primary/20 transition-all group">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-110">
                                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold font-space-grotesk mb-4">{item.title}</h3>
                                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Security Standards Cards */}
                    <div className="bg-white/5 rounded-[48px] p-12 md:p-16 border border-border-hover mb-32">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold font-space-grotesk mb-4">Compliance & Frameworks</h2>
                            <p className="text-text-secondary uppercase text-[10px] font-bold tracking-[0.3em]">Meeting the highest global standards for education</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { badge: "GDPR", desc: "EU Privacy Compliant" },
                                { badge: "FERPA", desc: "Student Data Privacy" },
                                { badge: "SOC2", desc: "Type II Certified" },
                                { badge: "ISO27001", desc: "ISMS Global Standard" }
                            ].map((card, i) => (
                                <div key={i} className="text-center p-6 bg-[#0f172a] rounded-[24px] border border-border">
                                    <div className="text-2xl font-bold font-space-grotesk text-white mb-2">{card.badge}</div>
                                    <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">{card.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Process Flow */}
                    <div className="max-w-4xl mx-auto mb-32">
                        <div className="text-left mb-12 border-l-4 border-primary pl-8">
                            <h2 className="text-3xl font-bold font-space-grotesk mb-2">The Security Lifecycle</h2>
                            <p className="text-text-secondary">How we protect every bit of your institutional data.</p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { title: "Threat Detection", icon: "radar" },
                                { title: "Automated Quarantine", icon: "leak_add" },
                                { title: "Encrypted Backups", icon: "cloud_sync" },
                                { title: "Periodic External Audits", icon: "verified_user" }
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-6 p-6 glass-morphism rounded-2xl border border-border group hover:bg-white/5 transition-colors">
                                    <div className="text-slate-600 font-bold font-space-grotesk text-xl">0{i + 1}</div>
                                    <span className="material-symbols-outlined text-primary">{step.icon}</span>
                                    <div className="text-white font-bold font-space-grotesk">{step.title}</div>
                                    <span className="material-symbols-outlined ml-auto text-slate-700 group-hover:text-primary transition-colors">arrow_forward</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold font-space-grotesk mb-8">Ready to secure your institution?</h2>
                        <button
                            onClick={() => setShowInquiryModal(true)}
                            className="glow-button bg-primary text-white px-10 py-5 rounded-2xl font-bold hover:scale-105 transition-all text-lg"
                        >
                            Request Compliance Documentation
                        </button>
                    </div>
                </div>
            </main>

            <LandingFooter />

            <GetStartedModal isOpen={showInquiryModal} onClose={() => setShowInquiryModal(false)} />
        </div>
    );
}
