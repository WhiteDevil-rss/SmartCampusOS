'use client';

import React, { useState } from "react";
import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";
import { LandingFooter } from "@/components/landing-footer";
import { GetStartedModal } from "@/components/get-started-modal";
import { motion } from "framer-motion";

export default function PlatformPage() {
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
                            <span className="material-symbols-outlined text-sm">terminal</span>
                            The Infrastructure of Knowledge
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-bold font-space-grotesk leading-tight tracking-tight mb-8">
                            The OS for <span className="gradient-text">Modern Academia</span>
                        </h1>
                        <p className="text-text-muted text-xl leading-relaxed max-w-2xl mx-auto">
                            Beyond simple scheduling. A comprehensive orchestration layer designed to run the complex logic of higher education institutions.
                        </p>
                    </div>

                    {/* Core Capabilities - Grid with Hover Effects */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                        {[
                            { icon: "memory", title: "Constraint Engine v4", desc: "Our proprietary neural-solver resolves millions of academic variables in parallel with sub-second latency." },
                            { icon: "security", title: "Governance Layer", desc: "Fine-grained role-based access control (RBAC) designed for complex university hierarchies." },
                            { icon: "dataset", title: "Institutional Graph", desc: "A unified data model representing the relationships between faculty, students, spaces, and curriculum." },
                            { icon: "api", title: "Extensible API Ecosystem", desc: "Connect SmartCampus OS to your existing LMS, SIS, and ERP systems with robust webhooks." },
                            { icon: "monitoring", title: "Real-time Telemetry", desc: "Live monitoring of campus resource utilization with automated threshold alerts." },
                            { icon: "cloud_done", title: "Sovereign Infrastructure", desc: "Deploy on dedicated sovereign cloud instances with localized data residency compliance." }
                        ].map((cap, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-morphism rounded-[32px] p-8 border border-border hover:border-primary/20 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined">{cap.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold font-space-grotesk mb-4">{cap.title}</h3>
                                <p className="text-text-secondary text-sm leading-relaxed">{cap.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Architecture Feature Section */}
                    <div className="flex flex-col lg:flex-row items-center gap-16 mb-32 bg-white/5 rounded-[48px] p-12 md:p-16 border border-border-hover">
                        <div className="w-full lg:w-1/2">
                            <h2 className="text-4xl font-bold font-space-grotesk mb-6">Designed for <span className="text-primary italic">Zero Conflict</span> Architecture</h2>
                            <p className="text-text-muted text-lg leading-relaxed mb-8">
                                Our platform doesn't just "detect" conflicts—it's designed to make them mathematically impossible. By isolating constraints into discrete logic gates, we ensure that every generated schedule is ready for immediate deployment.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Isolating Hard & Soft Constraints",
                                    "Distributed Computation Clusters",
                                    "Versioning & Snapshots for All Cycles",
                                    "Predictive Room-Shuffle Optimization"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                                        <span className="material-symbols-outlined text-primary text-sm font-bold">check_circle</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="w-full lg:w-1/2 aspect-square rounded-[32px] bg-[#0f172a] border border-border relative overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 blur-[80px]" />
                            <div className="relative z-10 text-center animate-pulse">
                                <span className="material-symbols-outlined text-[120px] text-white/20">hub</span>
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 mt-4">System Core visualizing...</p>
                            </div>
                        </div>
                    </div>

                    {/* Metrics Section */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32 py-12 border-y border-border">
                        {[
                            { value: "99.99%", label: "Uptime SLA" },
                            { value: "500ms", label: "Solver Latency" },
                            { value: "SOC2", label: "Certified" },
                            { value: "256-bit", label: "Encryption" }
                        ].map((metric, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl font-bold font-space-grotesk text-white mb-2">{metric.value}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{metric.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Final CTA */}
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold font-space-grotesk mb-8">Deploy the Future of Campus Management.</h2>
                        <div className="flex flex-wrap justify-center gap-6">
                            <button
                                onClick={() => setShowInquiryModal(true)}
                                className="glow-button bg-primary text-white px-10 py-5 rounded-2xl font-bold hover:scale-105 transition-all"
                            >
                                Initialize Platform
                            </button>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center px-10 py-5 rounded-2xl border border-border-hover text-white font-bold hover:bg-white/5 transition-all"
                            >
                                Speak with an Architect
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />

            <GetStartedModal isOpen={showInquiryModal} onClose={() => setShowInquiryModal(false)} />
        </div>
    );
}
