'use client';

import React from 'react';
import { LandingNav } from "@/components/landing-nav";
import { LandingFooter } from "@/components/landing-footer";
import { motion } from "framer-motion";
import { 
  Users, 
  Target, 
  Globe, 
  ShieldCheck, 
  Cpu, 
  Zap,
  Building2,
  GraduationCap
} from 'lucide-react';
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";

export default function AboutUs() {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/30 antialiased flex flex-col">
            <LandingNav />

            <main className="flex-1 relative z-10 pt-40">
                {/* Hero section */}
                <section className="px-6 lg:px-12 max-w-7xl mx-auto mb-32">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-8">
                            Our Mission
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tight font-space-grotesk mb-8 leading-[0.95]">
                            Orchestrating the Future of <span className="text-primary italic">Education</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xl md:text-2xl font-medium leading-relaxed max-w-3xl">
                            We are building the definitive operating system for academic institutions—an immutable, hyper-efficient layer that connects students, faculty, and administration across the globe.
                        </p>
                    </motion.div>
                </section>

                {/* Key Metrics */}
                <section className="py-24 border-y border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] mb-32">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                            {[
                                { label: "Founded", value: "2024" },
                                { label: "Institutions", value: "120+" },
                                { label: "Records Secured", value: "50M+" },
                                { label: "Countries", value: "18" },
                            ].map((stat, i) => (
                                <div key={i} className="text-center md:text-left">
                                    <div className="text-4xl md:text-6xl font-black font-space-grotesk text-primary mb-2">{stat.value}</div>
                                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Values Pillar Grid */}
                <section className="px-6 lg:px-12 max-w-7xl mx-auto mb-40">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black font-space-grotesk mb-6">Our Core Philosophy</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xl font-medium max-w-2xl mx-auto">
                            Four pillars that define every line of code we write and every institutional partnership we build.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { 
                                title: "Immutable Integrity", 
                                desc: "Academic records are sacred. We use cryptographic hashing to ensure that every diploma and transcript is tamper-proof and verifiable for eternity.",
                                icon: <ShieldCheck className="w-8 h-8" />
                            },
                            { 
                                title: "Radical Efficiency", 
                                desc: "Legacy ERPs are slow. SmartOS is built for sub-millisecond responses, automated scheduling, and instant institutional reporting.",
                                icon: <Zap className="w-8 h-8" />
                            },
                            { 
                                title: "Global Connectivity", 
                                desc: "Education knows no borders. Our multi-institutional nodes allow for seamless student transfers and international credential validation.",
                                icon: <Globe className="w-8 h-8" />
                            },
                            { 
                                title: "Human-Centric Design", 
                                desc: "Software should empower, not frustrate. We prioritize intuitive interfaces that humanize complex administrative processes.",
                                icon: <Users className="w-8 h-8" />
                            },
                        ].map((pillar, i) => (
                            <GlassCard key={i} className="rounded-[3rem] border-2 border-slate-100 dark:border-white/10 overflow-hidden group hover:border-primary/50 transition-all duration-500">
                                <GlassCardContent className="p-12">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                        {pillar.icon}
                                    </div>
                                    <h3 className="text-3xl font-black mb-4 font-space-grotesk">{pillar.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                                        {pillar.desc}
                                    </p>
                                </GlassCardContent>
                            </GlassCard>
                        ))}
                    </div>
                </section>

                {/* Tech Stack Showcase */}
                <section className="py-32 bg-slate-900 text-white relative overflow-hidden mb-40">
                    <div className="absolute inset-0 bg-primary/10 blur-[120px] pointer-events-none" />
                    <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                        <div className="flex flex-col lg:flex-row gap-16 items-center">
                            <div className="flex-1">
                                <h2 className="text-4xl md:text-6xl font-black font-space-grotesk mb-8 leading-tight">
                                    The Engine Beneath the Empire
                                </h2>
                                <p className="text-slate-400 text-xl font-medium mb-12 leading-relaxed">
                                    SmartOS isn't just a web app. It's a high-performance orchestration layer built on a modern distributed stack, ensuring 99.99% uptime and military-grade security.
                                </p>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-primary text-sm font-black uppercase tracking-widest"><Cpu className="w-5 h-5" /> Logic Layer</div>
                                        <div className="text-slate-300 font-bold">FastAPI + OR-Tools</div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-primary text-sm font-black uppercase tracking-widest"><ShieldCheck className="w-5 h-5" /> Persistence</div>
                                        <div className="text-slate-300 font-bold">Prisma + PostgreSQL</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 w-full lg:w-auto">
                                <div className="aspect-square rounded-[4rem] bg-white/5 border border-white/10 backdrop-blur-3xl p-1 relative group">
                                    <div className="absolute inset-4 rounded-[3.5rem] border border-primary/20 animate-pulse" />
                                    <div className="h-full w-full rounded-[3.8rem] bg-slate-900/40 flex items-center justify-center">
                                        <div className="text-center">
                                            <Building2 className="w-24 h-24 text-primary/40 mb-6 mx-auto" />
                                            <div className="text-primary font-black text-2xl">SmartOS Core</div>
                                            <div className="text-slate-500 text-sm font-bold mt-2 uppercase tracking-widest">v4.0.0 Stable</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="px-6 lg:px-12 max-w-5xl mx-auto mb-40 text-center">
                    <GlassCard className="rounded-[4rem] p-20 border-2 border-primary/20 bg-primary/5">
                        <GlassCardContent className="p-0">
                            <h2 className="text-4xl md:text-7xl font-black font-space-grotesk mb-8">Ready to evolve?</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-xl font-medium mb-12 max-w-2xl mx-auto">
                                Join the elite circle of institutions that have moved beyond legacy software.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <button className="w-full sm:w-auto px-12 py-5 rounded-[1.5rem] bg-primary text-white font-black text-xl hover:scale-105 transition-all shadow-xl shadow-primary/20">
                                    Partner With Us
                                </button>
                                <button className="w-full sm:w-auto px-12 py-5 rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-white/5 font-black text-xl hover:bg-white/10 transition-all text-slate-700 dark:text-slate-300">
                                    Join Our Team
                                </button>
                            </div>
                        </GlassCardContent>
                    </GlassCard>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}
