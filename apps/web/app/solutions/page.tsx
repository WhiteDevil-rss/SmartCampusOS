'use client';

import React from 'react';
import { LandingNav } from '@/components/landing-nav';
import { LandingFooter } from '@/components/landing-footer';
import { motion } from 'framer-motion';
import { LuShieldCheck, LuZap, LuCpu, LuUsers, LuArrowRight, LuGlobe, LuDatabase } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SolutionsPage() {
    const solutions = [
        {
            id: 'admissions',
            icon: <LuUsers />,
            title: 'Dynamic Admissions Orchestration',
            subtitle: 'Global Scale. Zero Friction.',
            description: 'A multi-tenant admission pipeline designed to handle peak application cycles with zero downtime. Automated document mapping and student node initialization.',
            features: ['Automated Eligibility Engine', 'Real-time Pipeline Analytics', 'Cross-Institutional Data Portability'],
            color: 'primary',
            alignment: 'left'
        },
        {
            id: 'verification',
            icon: <LuShieldCheck />,
            title: 'Cryptographic Trust Ledger',
            subtitle: 'Immutable. Instance-Verifiable.',
            description: 'Every academic record, result, and status is hashed using SHA-256 and anchored to institutional nodes, ensuring absolute data integrity.',
            features: ['Public Verification Portal', 'Blockchain Anchor Protection', 'Tamper-Proof Document Vault'],
            color: 'emerald',
            alignment: 'right'
        },
        {
            id: 'ai-timetable',
            icon: <LuCpu />,
            title: 'AI-Driven Logistics',
            subtitle: 'Optimized. Constraint-Aware.',
            description: 'Advanced OR-Tools integration to solve complex academic scheduling problems, minimizing conflicts and maximizing resource utilization.',
            features: ['Automated Conflict Resolution', 'Resource Load Balancing', 'Faculty Preference Mapping'],
            color: 'indigo',
            alignment: 'left'
        },
        {
            id: 'enterprise',
            icon: <LuGlobe />,
            title: 'Enterprise ERP Core',
            subtitle: 'Unified. Scalable.',
            description: 'A comprehensive suite covering Finance, Library, Placement, and Service Requests under a single unified dashboard architecture.',
            features: ['Real-time Financial Telemetry', 'Automated Placement Workflows', 'Centralized Service Desk'],
            color: 'rose',
            alignment: 'right'
        }
    ];

    return (
        <div className="min-h-screen bg-background text-text-primary selection:bg-primary/30 flex flex-col relative overflow-x-hidden pt-20">
            <LandingNav />
            
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen" />
            </div>

            <main className="flex-1 relative z-10">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-6 py-24 md:py-32 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-surface border border-border rounded-full">
                            <LuZap className="text-primary w-4 h-4 animate-pulse" />
                            <span className="text-[10px] font-black text-text-muted tracking-[0.3em] uppercase">The SmartOS Ecosystem</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-text-primary">
                            Engineered for <br />
                            <span className="text-primary italic">Institutional Excellence</span>
                        </h1>
                        <p className="text-xl text-text-secondary font-medium leading-relaxed max-w-2xl mx-auto">
                            A modular, secure, and AI-first operating system for modern universities. Scale your operations without compromising on security or user experience.
                        </p>
                        <div className="flex justify-center gap-6 pt-6">
                            <Link href="/admissions">
                                <Button className="h-16 px-10 rounded-2xl bg-primary text-text-primary font-black text-lg shadow-glow hover:scale-105 active:scale-95 transition-all">
                                    Start Deployment <LuArrowRight className="ml-3 w-6 h-6" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </section>

                {/* Solutions Grid */}
                <section className="max-w-7xl mx-auto px-6 py-24 space-y-40">
                    {solutions.map((solution, i) => (
                        <motion.div
                            key={solution.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className={cn(
                                "flex flex-col gap-12 items-center",
                                solution.alignment === 'right' ? "lg:flex-row-reverse" : "lg:flex-row"
                            )}
                        >
                            {/* Text Content */}
                            <div className="flex-1 space-y-8">
                                <div className={cn(
                                    "w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl transition-transform hover:scale-110",
                                    `bg-${solution.color}-500/10 text-${solution.color}-400 border border-${solution.color}-500/20`
                                )}>
                                    {solution.icon}
                                </div>
                                <div className="space-y-4">
                                    <p className={cn("text-[10px] font-black uppercase tracking-[0.4em]", `text-${solution.color}-500`)}>{solution.subtitle}</p>
                                    <h2 className="text-4xl md:text-5xl font-black font-space-grotesk tracking-tighter leading-tight text-text-primary">{solution.title}</h2>
                                    <p className="text-lg text-text-secondary font-medium leading-relaxed max-w-xl">{solution.description}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {solution.features.map((feature, j) => (
                                        <div key={j} className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-border group hover:bg-surface-hover transition-colors">
                                            <LuShieldCheck className={cn("w-5 h-5 shrink-0", `text-${solution.color}-400`)} />
                                            <span className="text-sm font-bold text-text-secondary">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Visual Placeholder / Mockup */}
                            <div className="flex-1 w-full relative">
                                <div className="aspect-[4/3] rounded-[3rem] overflow-hidden glass-morphism border border-white/10 shadow-2xl relative group">
                                    <div className={cn(
                                        "absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700",
                                        `bg-gradient-to-br from-${solution.color}-500 to-transparent`
                                    )} />
                                    <div className="absolute inset-0 flex items-center justify-center p-12">
                                        <div className="w-full h-full rounded-[2rem] bg-black/40 border border-white/10 flex flex-col p-8 space-y-6 overflow-hidden">
                                            <div className="flex items-center justify-between">
                                                <div className="flex gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                                </div>
                                                <div className="text-[9px] font-black uppercase tracking-widest text-text-muted">Live Telemetry</div>
                                            </div>
                                            <div className="space-y-4 pt-4">
                                                <div className="h-8 w-3/4 bg-white/5 rounded-lg animate-pulse" />
                                                <div className="h-32 w-full bg-white/5 rounded-2xl animate-pulse" />
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
                                                    <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
                                                    <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Floating stats */}
                                    <motion.div 
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute -top-6 -right-6 p-6 glass-morphism border border-primary/20 rounded-2xl shadow-xl z-20"
                                    >
                                        <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Latency</div>
                                        <div className="text-2xl font-black text-text-primary">14ms</div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </section>

                {/* Final CTA */}
                <section className="max-w-5xl mx-auto px-6 py-40">
                    <div className="p-16 md:p-24 rounded-[4rem] bg-gradient-to-br from-primary/20 via-indigo-500/10 to-transparent border border-white/10 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-text-primary mb-8 relative z-10">
                            Ready to Upgrade Your <br />
                            <span className="text-primary italic">Institutional Stack?</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
                            <Link href="/admissions">
                                <Button className="h-16 px-12 rounded-2xl bg-primary text-text-primary font-black text-lg shadow-glow hover:scale-105 active:scale-95 transition-all w-full sm:w-auto">
                                    Join the Network
                                </Button>
                            </Link>
                            <Link href="/#contact">
                                <Button variant="outline" className="h-16 px-12 rounded-2xl border-border bg-surface text-text-primary font-black text-lg hover:bg-surface-hover transition-all w-full sm:w-auto">
                                    Talk to an Architect
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}

import { cn } from '@/lib/utils';
