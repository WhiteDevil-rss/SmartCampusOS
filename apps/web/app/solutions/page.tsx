'use client';

import React, { useState } from "react";
import { LandingNav } from "@/components/landing-nav";
import { LandingFooter } from "@/components/landing-footer";
import { GetStartedModal } from "@/components/get-started-modal";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
    {
        label: "University Admins",
        cards: [
            { icon: "hub", title: "Enterprise Orchestration", desc: "Oversee and harmonize complex academic structures across multi-campus environments with a single pane of glass.", color: "text-primary", bg: "bg-primary/10" },
            { icon: "security", title: "Policy Enforcement", desc: "Set global institutional rules, program constraints, and academic calendars with cryptographically secure audit trails.", color: "text-secondary", bg: "bg-secondary/10" },
            { icon: "monitoring", title: "Predictive Analytics", desc: "Deep insights into campus-wide utilization, forecasting resource requirements before conflicts arise.", color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: "verified", title: "Certified Accuracy", desc: "Ensure 100% compliance with government and accreditation standards for faculty load and contact hours.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ]
    },
    {
        label: "Department Heads",
        cards: [
            { icon: "auto_fix_high", title: "AI-Powered Allocation", desc: "Instantly assign subjects to faculty based on proficiency, availability, and historical throughput.", color: "text-primary", bg: "bg-primary/10" },
            { icon: "tune", title: "Constraint Tuning", desc: "Fine-tune department-specific nuances, from specialized lab requirements to cross-disciplinary seminars.", color: "text-secondary", bg: "bg-secondary/10" },
            { icon: "event_repeat", title: "Iterative Generation", desc: "Generate millions of possible schedule permutations in seconds to find the mathematically perfect fit.", color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: "dynamic_feed", title: "Elective Resolution", desc: "Automated handling of complex student elective choices with sub-batching and room-swap logic.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ]
    },
    {
        label: "Faculty & Staff",
        cards: [
            { icon: "person_search", title: "Personnel Optimization", desc: "Respecting faculty preferences and research blocks while maintaining teaching excellence.", color: "text-primary", bg: "bg-primary/10" },
            { icon: "dashboard_customize", title: "Personal Command Center", desc: "Every educator receives a personalized, dynamic schedule synced across all their digital devices.", color: "text-secondary", bg: "bg-secondary/10" },
            { icon: "emergency", title: "Swap & Backup Logic", desc: "Instant readjustment for unforeseen leaves with automated substitute suggestions and notifications.", color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: "forum", title: "Integrated Feedback", desc: "Direct channel for schedule-related requests and feedback with administrative transparency.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ]
    }
];

export default function SolutionsPage() {
    const [activeTab, setActiveTab] = useState(0);
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
                            <span className="material-symbols-outlined text-sm">settings_suggest</span>
                            Engineered for Scale
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-bold font-space-grotesk leading-tight tracking-tight mb-8">
                            Unifying the <span className="gradient-text">Academic Universe</span>
                        </h1>
                        <p className="text-text-muted text-xl leading-relaxed max-w-2xl mx-auto">
                            SmartCampus OS delivers domain-specific solutions that scale from individual departments to global education networks.
                        </p>
                    </div>

                    {/* Role Tabs Section */}
                    <div className="mb-24">
                        <div className="flex justify-center mb-12 border-b border-border gap-8 overflow-x-auto pb-4 no-scrollbar">
                            {tabs.map((tab, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveTab(i)}
                                    className={`relative px-4 py-2 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === i ? 'text-white' : 'text-text-secondary hover:text-slate-300'
                                        }`}
                                >
                                    {tab.label}
                                    {activeTab === i && (
                                        <motion.div
                                            layoutId="activeTabUnderline"
                                            className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                            >
                                {tabs[activeTab].cards.map((card, i) => (
                                    <div key={i} className="glass-morphism rounded-[32px] p-8 border border-border hover:border-primary/20 group transition-all h-full flex flex-col">
                                        <div className={`w-14 h-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                            <span className="material-symbols-outlined text-2xl">{card.icon}</span>
                                        </div>
                                        <h3 className="text-xl font-bold font-space-grotesk mb-4">{card.title}</h3>
                                        <p className="text-text-secondary text-sm leading-relaxed flex-grow">{card.desc}</p>
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Use Cases Grid */}
                    <div className="mb-24">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold font-space-grotesk mb-4">Enterprise Use Cases</h2>
                            <p className="text-text-secondary uppercase text-[10px] font-bold tracking-[0.3em]">Solving the complex patterns of higher education</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: "Multi-modal Scheduling", desc: "Coordinating hybrid models combining on-campus labs with virtual theoretical sessions.", icon: "layers" },
                                { title: "Resource Conflict Resolution", desc: "Automated real-time re-allocation when high-value labs or auditoriums become unavailable.", icon: "balance" },
                                { title: "Cross-University Credit", desc: "Facilitating students taking courses across different institutions within a single federation.", icon: "account_tree" }
                            ].map((uc, i) => (
                                <div key={i} className="bg-white/5 rounded-3xl p-8 border border-border-hover hover:bg-white/[0.07] transition-colors">
                                    <span className="material-symbols-outlined text-primary mb-4">{uc.icon}</span>
                                    <h4 className="text-white font-bold mb-3">{uc.title}</h4>
                                    <p className="text-text-secondary text-sm leading-relaxed">{uc.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-[48px] p-12 md:p-20 border border-primary/20 text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -mr-64 -mt-64" />
                        <h2 className="text-4xl md:text-5xl font-bold font-space-grotesk mb-6 relative z-10 max-w-2xl mx-auto">
                            Ready to upgrade to an <span className="text-primary italic">Operating System?</span>
                        </h2>
                        <p className="text-text-muted text-lg mb-12 relative z-10 max-w-xl mx-auto leading-relaxed">
                            Stop managing tools. Start managing results with SmartCampus OS. Join 50+ tier-1 institutions scaling with ease.
                        </p>
                        <button
                            onClick={() => setShowInquiryModal(true)}
                            className="glow-button relative z-10 inline-flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all"
                        >
                            Request Architecture Review
                            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </main>

            <LandingFooter />

            <GetStartedModal isOpen={showInquiryModal} onClose={() => setShowInquiryModal(false)} />
        </div>
    );
}
