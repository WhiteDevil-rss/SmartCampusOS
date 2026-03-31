'use client';

import React, { useState } from "react";
import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";
import { LandingFooter } from "@/components/landing-footer";
import { GetStartedModal } from "@/components/get-started-modal";
import { motion } from "framer-motion";
import { 
    Cpu, 
    ShieldCheck, 
    Network, 
    Layers, 
    Activity, 
    Globe, 
    CheckCircle2,
    Zap,
    ChevronRight,
    ArrowUpRight
} from "lucide-react";
import { GlassCard, GlassCardContent } from "@/components/v2/shared/cards";
import { IndustrialButton } from "@/components/v2/shared/inputs";
import { PredictivePulse } from "@/components/v2/platform/predictive-pulse";

export default function InstitutionalPortfolioPage() {
    const [showInquiryModal, setShowInquiryModal] = useState(false);

    return (
        <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans antialiased flex flex-col selection:bg-primary/30 overflow-x-hidden">
            <LandingNav />

            <main className="flex-grow pt-40 pb-24 px-6 relative z-10">
                {/* Ambient Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] -z-10 opacity-50" />
                
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-3 px-6 py-2 rounded-2xl bg-white/5 border border-white/10 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-10 shadow-2xl backdrop-blur-xl"
                        >
                            <Layers className="w-4 h-4" />
                            Foundation of Academic Excellence
                        </motion.div>
                        <h1 className="text-6xl md:text-8xl font-black font-space-grotesk leading-[1.1] tracking-tighter mb-10 uppercase italic">
                            The OS for <span className="text-primary not-italic underline decoration-primary/30 underline-offset-[12px]">Modern Academia</span>
                        </h1>
                        <p className="text-slate-400 text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto font-medium mb-12">
                            Beyond administrative scheduling. A comprehensive orchestration layer designed to align the complex strategic goals of world-class institutions.
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-6">
                            <IndustrialButton 
                                variant="primary" 
                                className="h-16 px-12 rounded-2xl text-[11px] font-black uppercase tracking-widest"
                                onClick={() => setShowInquiryModal(true)}
                            >
                                Institutional Onboarding
                            </IndustrialButton>
                            <Link href="/solutions">
                                <IndustrialButton 
                                    variant="outline" 
                                    className="h-16 px-12 rounded-2xl border-white/10 text-[11px] font-black uppercase tracking-widest text-slate-400"
                                >
                                    Explore Hubs
                                </IndustrialButton>
                            </Link>
                        </div>
                    </div>

                    {/* AI Predictive Pulse Section */}
                    <div className="mb-40">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <PredictivePulse />
                        </motion.div>
                    </div>

                    {/* Core Capabilities - Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-40">
                        {[
                            { icon: Cpu, title: "Strategic Engine v4", desc: "Our proprietary neural-solver aligns institutional resources with academic goals with sub-second precision." },
                            { icon: ShieldCheck, title: "Governance Framework", desc: "Refined role-based oversight designed for complex institutional hierarchies and departmental workflows." },
                            { icon: Network, title: "Institutional Graph", desc: "A unified relationship model spanning faculty expertise, student aspirations, and campus infrastructure." },
                            { icon: Layers, title: "Extensible Ecosystem", desc: "Seamlessly integrate your legacy infrastructure via robust, high-fidelity institutional webhooks." },
                            { icon: Activity, title: "Operational Intelligence", desc: "Real-time visibility into campus resource health and administrative mission status." },
                            { icon: Globe, title: "Global Sovereignty", desc: "Dedicated cloud residency ensuring total compliance with institutional and regional data standards." }
                        ].map((cap, i) => (
                            <GlassCard
                                key={i}
                                className="rounded-[40px] border-white/5 hover:border-primary/40 transition-all duration-500 group cursor-default"
                            >
                                <GlassCardContent className="p-10">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-all duration-500 border border-primary/20">
                                        <cap.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-2xl font-black font-space-grotesk mb-4 uppercase tracking-tight text-slate-100 group-hover:text-primary transition-colors">{cap.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-bold uppercase tracking-tight opacity-70 group-hover:opacity-100 transition-opacity italic">{cap.desc}</p>
                                </GlassCardContent>
                            </GlassCard>
                        ))}
                    </div>

                    {/* Architecture Feature Section */}
                    <div className="flex flex-col lg:flex-row items-center gap-20 mb-40 bg-white/[0.02] rounded-[64px] p-12 md:p-20 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] -z-10 group-hover:bg-primary/10 transition-all duration-700" />
                        
                        <div className="w-full lg:w-3/5 space-y-10">
                            <h2 className="text-5xl md:text-6xl font-black font-space-grotesk leading-tight uppercase tracking-tighter">
                                Designed for <span className="text-primary italic underline underline-offset-8 decoration-primary/20">Conflict-Free</span> Governance
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed font-medium">
                                Our architecture doesn&apos;t just identify administrative friction—it eliminates it at the source. By decomposing institutional constraints into discrete strategic parameters, we ensure that every decision is validated for immediate implementation.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    "Dynamic Constraint Isolation",
                                    "Distributed Compute Clusters",
                                    "Historical Cycle Auditing",
                                    "Strategic Asset Optimization"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 text-slate-300 font-black uppercase text-xs tracking-widest group/item transition-all">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover/item:bg-emerald-500 group-hover/item:text-slate-900 transition-all">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full lg:w-2/5 aspect-square rounded-[40px] bg-[#0c1220] border border-white/10 relative overflow-hidden flex items-center justify-center group/viz shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
                            <div className="relative z-10 text-center space-y-6">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="relative"
                                >
                                    <Network className="text-[120px] text-primary/20 blur-[2px]" />
                                    <Network className="absolute inset-0 text-[120px] text-primary animate-pulse" />
                                </motion.div>
                                <div className="space-y-1 px-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.6em] text-primary animate-pulse">Core Intelligence Visualizing</p>
                                    <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">WSS::ORCHESTRATION_STREAM_ACTIVE</p>
                                </div>
                            </div>
                            
                            {/* Decorative Grid Lines */}
                            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
                        </div>
                    </div>

                    {/* Performance Benchmarks */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-40 py-16 border-y border-white/5 bg-white/[0.01]">
                        {[
                            { value: "99.99%", label: "Institutional Uptime" },
                            { value: "500ms", label: "Solver Latency" },
                            { value: "SOC-2", label: "Registry Security" },
                            { value: "AES-256", label: "End-to-End Encryption" }
                        ].map((metric, i) => (
                            <div key={i} className="text-center group cursor-default">
                                <div className="text-4xl font-black font-space-grotesk text-slate-100 mb-3 group-hover:text-primary transition-colors duration-300 tracking-tighter italic uppercase">{metric.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 group-hover:text-slate-400 transition-colors uppercase">{metric.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Final Institutional CTA */}
                    <GlassCard className="max-w-5xl mx-auto rounded-[48px] border-white/5 bg-primary/[0.02] relative overflow-hidden group">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] group-hover:bg-primary/40 transition-all duration-700" />
                        <GlassCardContent className="p-16 md:p-24 text-center space-y-12">
                            <h2 className="text-5xl md:text-7xl font-black font-space-grotesk leading-tight uppercase tracking-tighter text-slate-100">
                                Deploy the Future of <br /> <span className="text-primary italic">Campus Governance.</span>
                            </h2>
                            <div className="flex flex-wrap justify-center gap-8">
                                <IndustrialButton
                                    variant="primary"
                                    onClick={() => setShowInquiryModal(true)}
                                    className="h-18 px-14 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(57,193,239,0.3)] hover:shadow-[0_0_60px_rgba(57,193,239,0.5)] transition-all"
                                >
                                    Initialize Institutional Hub
                                </IndustrialButton>
                                <Link href="/contact">
                                    <IndustrialButton
                                        variant="outline"
                                        className="h-18 px-14 rounded-2xl border-white/10 text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all"
                                    >
                                        Consult with a Specialist
                                    </IndustrialButton>
                                </Link>
                            </div>
                            <div className="flex items-center justify-center gap-6 pt-10 text-[10px] font-black text-slate-600 uppercase tracking-widest border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <Zap className="text-primary w-4 h-4" />
                                    Rapid Deployment
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="text-emerald-500 w-4 h-4" />
                                    Enterprise Compliance
                                </div>
                            </div>
                        </GlassCardContent>
                    </GlassCard>
                </div>
            </main>

            <LandingFooter />

            <GetStartedModal isOpen={showInquiryModal} onClose={() => setShowInquiryModal(false)} />
        </div>
    );
}
