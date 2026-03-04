'use client';

import React, { useState } from "react";
import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";
import { LandingFooter } from "@/components/landing-footer";
import { GetStartedModal } from "@/components/get-started-modal";

export default function PlatformPage() {
    const [showInquiryModal, setShowInquiryModal] = useState(false);

    return (
        <div className="dark min-h-screen bg-background-dark text-slate-100 relative overflow-x-hidden flex flex-col font-heading selection:bg-neon-cyan/30 antialiased">
            <LandingNav />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 flex flex-col items-center">
                {/* Hero */}
                <section className="w-full py-20 flex flex-col items-center justify-center text-center gap-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/10 to-transparent -z-10 rounded-full blur-3xl opacity-50 w-[800px] h-[800px] top-[-400px] left-1/2 -translate-x-1/2 pointer-events-none" />
                    <h1 className="text-white text-5xl md:text-7xl font-black leading-tight tracking-[-0.033em] max-w-4xl">
                        The Complete Academic <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-blue-400">Scheduling Platform</span>
                    </h1>
                    <p className="text-slate-300 text-lg md:text-xl font-normal leading-relaxed max-w-2xl">
                        Powered by AI. Built for universities. Experience intelligent academic timetabling with advanced constraint-solving algorithms.
                    </p>
                    <button
                        onClick={() => setShowInquiryModal(true)}
                        className="flex mt-4 items-center justify-center rounded-full bg-gradient-to-r from-neon-cyan to-blue-500 text-white px-[36px] py-[14px] text-[16px] font-semibold shadow-[0_0_20px_rgba(0,245,255,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(0,245,255,0.5)] transition-all active:scale-95"
                    >
                        Request Demo
                    </button>
                </section>

                {/* Core Capabilities */}
                <section className="w-full py-16 flex flex-col gap-12">
                    <div className="flex flex-col gap-4 text-center items-center">
                        <h2 className="text-white tracking-tight text-4xl md:text-5xl font-bold leading-tight max-w-[720px]">Core Capabilities</h2>
                        <p className="text-slate-300 text-lg font-normal max-w-[720px]">Everything you need to orchestrate complex academic schedules seamlessly.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: "smart_toy", title: "AI-Powered Generation", desc: "Automated generation of optimal schedules balancing complex constraints." },
                            { icon: "warning", title: "Conflict Detection & Resolution", desc: "Instantly identify and resolve clashes before they become real problems." },
                            { icon: "layers", title: "Multi-Program Scheduling", desc: "Manage multiple degree programs simultaneously with cross-department support." },
                            { icon: "menu_book", title: "Elective Basket Management", desc: "Handle complex student elective choices and dynamic enrollment numbers." },
                            { icon: "group", title: "Division & Batch Handling", desc: "Automate cohort and division splitting for large core classes." },
                            { icon: "person_search", title: "Faculty Assignment Optimization", desc: "Optimize instructor workloads, preferences, and availability windows." },
                            { icon: "location_on", title: "Room & Lab Allocation", desc: "Smartly assign venues based on capacity, equipment needs, and proximity." },
                            { icon: "sync", title: "Continuous Timetabling", desc: "Adapt schedules dynamically as requirements change throughout the term." },
                            { icon: "build", title: "Partial Regeneration", desc: "Regenerate specific sections or days without resetting the entire schedule." },
                        ].map((cap, i) => (
                            <div key={i} className="flex flex-col gap-4 rounded-xl border border-neon-cyan/20 bg-black/20 backdrop-blur-sm p-6 hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(0,245,255,0.15)] transition-all group">
                                <div className="text-neon-cyan p-3 bg-neon-cyan/10 rounded-lg w-fit group-hover:bg-neon-cyan/20 transition-colors">
                                    <span className="material-symbols-outlined text-3xl">{cap.icon}</span>
                                </div>
                                <div className="flex flex-col gap-2 h-full">
                                    <h3 className="text-white text-xl font-bold leading-tight">{cap.title}</h3>
                                    <p className="text-slate-400 text-base font-normal leading-relaxed mb-4">{cap.desc}</p>
                                    <div className="mt-auto">
                                        <button
                                            className="flex items-center text-[14px] font-medium text-neon-cyan hover:underline transition-all group/btn"
                                        >
                                            Learn More
                                            <span className="material-symbols-outlined text-[16px] ml-1 transition-transform group-hover/btn:translate-x-1">arrow_right_alt</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* AI Showcase */}
                <section className="w-full py-16">
                    <div className="flex flex-col items-stretch justify-start rounded-2xl border border-neon-cyan/20 bg-black/20 backdrop-blur-sm overflow-hidden lg:flex-row shadow-[0_8px_32px_rgba(0,245,255,0.05)]">
                        <div className="w-full lg:w-1/2 aspect-video lg:aspect-auto bg-gradient-to-br from-neon-cyan/10 via-background-dark to-neon-purple/10 flex items-center justify-center min-h-[300px]">
                            <div className="text-center p-8">
                                <span className="material-symbols-outlined text-neon-cyan text-8xl mb-4">psychology</span>
                                <p className="text-slate-400 text-sm">Neural Network Visualization</p>
                            </div>
                        </div>
                        <div className="flex w-full lg:w-1/2 min-w-72 flex-col items-start justify-center gap-6 p-8 lg:p-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan text-sm font-semibold">
                                <span className="material-symbols-outlined text-base">psychology</span>
                                AI Showcase
                            </div>
                            <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight">Intelligent Constraint Solving</h2>
                            <p className="text-slate-300 text-lg font-normal leading-relaxed">
                                Our proprietary AI engine processes millions of academic variables simultaneously. It balances hard constraints like room capacity and faculty availability with soft preferences like consecutive classes and preferred teaching hours.
                            </p>
                        </div>
                    </div>
                </section>

                {/* How AI Works */}
                <section className="w-full py-20 flex flex-col gap-12">
                    <div className="flex flex-col gap-4 text-center items-center">
                        <h2 className="text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight">How AI Works</h2>
                        <p className="text-slate-300 text-lg font-normal">The journey from raw data to a flawless academic schedule.</p>
                    </div>
                    <div className="relative mt-8">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-neon-cyan/20 -translate-y-1/2 hidden md:block rounded-full" />
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
                            {[
                                { icon: "dataset", title: "Input Data", desc: "Upload courses, faculty, and rooms." },
                                { icon: "rule", title: "Define Constraints", desc: "Set hard rules and soft preferences." },
                                { icon: "model_training", title: "AI Analysis", desc: "Processing millions of combinations." },
                                { icon: "tune", title: "Optimization", desc: "Refining for maximum satisfaction." },
                                { icon: "event_available", title: "Conflict-Free Output", desc: "Ready-to-use perfect schedule.", active: true },
                            ].map((step, i) => (
                                <div key={i} className="flex flex-col items-center gap-4 text-center bg-background-dark p-4 rounded-xl">
                                    <div className={`w-16 h-16 rounded-full border-2 border-neon-cyan flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.2)] ${step.active ? 'bg-neon-cyan text-background-dark shadow-[0_0_20px_rgba(0,245,255,0.4)]' : 'bg-neon-cyan/10 text-neon-cyan'
                                        }`}>
                                        <span className="material-symbols-outlined text-2xl">{step.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold mb-1">{step.title}</h4>
                                        <p className="text-slate-400 text-sm">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="w-full py-24 mb-10">
                    <div className="rounded-3xl bg-gradient-to-br from-neon-cyan/20 via-background-dark to-blue-900/40 border border-neon-cyan/30 p-10 md:p-16 text-center flex flex-col items-center gap-8 relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-neon-cyan/30 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
                        <h2 className="text-white text-4xl md:text-5xl font-black leading-tight z-10">
                            Experience the Power of AI Scheduling
                        </h2>
                        <p className="text-slate-300 text-xl font-normal max-w-2xl z-10">
                            Join leading institutions streamlining their academic operations with Zembaa.
                        </p>
                        <div className="flex flex-wrap justify-center gap-[16px] mt-4 z-10 w-full">
                            <button
                                onClick={() => setShowInquiryModal(true)}
                                className="flex items-center justify-center rounded-full bg-gradient-to-r from-neon-cyan to-blue-500 text-white px-[36px] py-[14px] text-[16px] font-semibold shadow-[0_0_20px_rgba(0,245,255,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(0,245,255,0.5)] transition-all active:scale-95"
                            >
                                Get Started
                            </button>
                            <Link
                                href="/contact"
                                className="flex items-center justify-center rounded-full border border-neon-cyan text-neon-cyan bg-transparent px-[36px] py-[14px] text-[16px] font-medium hover:bg-neon-cyan hover:text-white transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
                            >
                                Talk to Sales
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <LandingFooter />

            <GetStartedModal isOpen={showInquiryModal} onClose={() => setShowInquiryModal(false)} />
        </div>
    );
}
