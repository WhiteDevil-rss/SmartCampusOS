'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LandingNav } from "@/components/landing-nav";
import { LandingFooter } from "@/components/landing-footer";
import { motion, Variants } from "framer-motion";
import { api, getFrontendRoleHint, getRoleHomePath } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardDescription, 
  GlassCardContent, 
  GlassCardFooter 
} from "@/components/ui/glass-card";
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Phone, 
  User, 
  GraduationCap, 
  ShieldCheck, 
  FileText, 
  Network, 
  Search, 
  ArrowRight, 
  LayoutDashboard, 
  Building2,
  Globe
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [verifyHash, setVerifyHash] = useState('');
  const authEntryPath = getRoleHomePath(user?.role || getFrontendRoleHint());

  // Inquiry Form State
  const [inquiryData, setInquiryData] = useState({
      name: '', email: '', phone: '', program: '', message: ''
  });
  const [inquiryStatus, setInquiryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [inquiryError, setInquiryError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInquirySubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inquiryData.name || !inquiryData.email || !inquiryData.message) {
          setInquiryError("Please fill out all required fields.");
          setInquiryStatus('error');
          return;
      }
      setInquiryStatus('loading');
      setInquiryError('');
      try {
          await api.post('/inquiries', {
              name: inquiryData.name.trim(),
              email: inquiryData.email.trim().toLowerCase(),
              contactNumber: inquiryData.phone.trim() || null,
              organization: inquiryData.program.trim() || null, 
              message: inquiryData.message.trim(),
              source: 'admission_inquiry_section'
          });
          setInquiryStatus('success');
          setInquiryData({ name: '', email: '', phone: '', program: '', message: '' });
          setTimeout(() => setInquiryStatus('idle'), 5000);
      } catch (err: any) {
          setInquiryStatus('error');
          setInquiryError(err.response?.data?.error || err.message || 'Failed to submit inquiry.');
      }
  };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { 
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        show: { 
            y: 0, 
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-100 relative overflow-x-hidden flex flex-col font-sans selection:bg-primary/30 antialiased">
            {/* Advanced Background System */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>
                 
            <LandingNav />

            <main className="flex-1 relative z-10">
                {/* SaaS Hero Section */}
                <section className="relative pt-40 pb-24 md:pt-56 md:pb-40 px-6 lg:px-12 max-w-7xl mx-auto">
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="flex flex-col items-center text-center gap-10 max-w-5xl mx-auto w-full"
                    >
                        <motion.div 
                            variants={itemVariants}
                            className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-3xl shadow-sm"
                        >
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                            </span>
                            <span className="text-primary text-[10px] font-black tracking-[0.2em] uppercase">Enterprise Operating System V4.0</span>
                        </motion.div>

                        <motion.h1 
                            variants={itemVariants}
                            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-[-0.04em] leading-[0.95] font-space-grotesk text-slate-900 dark:text-slate-100 pb-2"
                        >
                            Modernize Your<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-secondary to-blue-400 dark:from-white dark:via-blue-300 dark:to-primary inline-block">
                                University
                            </span>
                        </motion.h1>

                        <motion.p 
                            variants={itemVariants}
                            className="text-slate-500 dark:text-slate-400 text-xl md:text-2xl font-medium leading-relaxed max-w-3xl"
                        >
                            The only multi-institutional platform designed to orchestrate the entire academic lifecycle with cryptographic integrity.
                        </motion.p>

                        <motion.div 
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 w-full max-w-4xl mx-auto"
                        >
                            <a
                                href={authEntryPath}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-[1.5rem] bg-primary text-white px-12 py-5 text-xl font-black transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/20"
                            >
                                Get Started Today <ArrowRight className="w-6 h-6" />
                            </a>
                            
                            <button
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl text-slate-700 dark:text-slate-300 px-10 py-5 text-xl font-black hover:bg-white/10 transition-all border-b-4 border-b-white/5"
                            >
                                Explore Solutions
                            </button>
                        </motion.div>

                        {/* Trust Signals */}
                        <motion.div variants={itemVariants} className="pt-20 w-full">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mb-8">Trusted by Global Institutions</p>
                            <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                                <div className="flex items-center gap-2 font-black text-2xl text-slate-600 dark:text-slate-400">
                                    <Building2 className="w-8 h-8" /> UNIVERSITY<span className="text-primary italic">X</span>
                                </div>
                                <div className="flex items-center gap-2 font-black text-2xl text-slate-600 dark:text-slate-400">
                                    <Network className="w-8 h-8" /> ACADEMIA<span className="text-indigo-500">NET</span>
                                </div>
                                <div className="flex items-center gap-2 font-black text-2xl text-slate-600 dark:text-slate-400">
                                    <ShieldCheck className="w-8 h-8" /> EDU<span className="text-secondary">TRUST</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </section>

            {/* Verification Command Center */}
            <section className="py-24 px-6 md:px-12 relative overflow-hidden">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-6">
                            Secure Verification Layer
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8 text-slate-900 dark:text-slate-100 font-space-grotesk underline decoration-primary/30 decoration-8 underline-offset-[-2px]">
                            Integrity in<br />Every Record
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-xl">
                            Our proprietary cryptographic hashing ensures that every admission letter and diploma is tamper-proof and instantly verifiable worldwide.
                        </p>
                        
                        <div className="relative group max-w-md">
                            <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <div className="relative flex items-center bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 hover:border-primary/50 rounded-[2rem] p-2 transition-all duration-500 shadow-xl group-hover:shadow-primary/20 shadow-black/5">
                                <input 
                                    type="text" 
                                    placeholder="Enter Digital Hash Identifier..." 
                                    className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-6 outline-none font-mono text-sm"
                                    value={verifyHash}
                                    onChange={(e) => setVerifyHash(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && verifyHash.trim()) {
                                            router.push(`/verify?code=${encodeURIComponent(verifyHash.trim())}`);
                                        }
                                    }}
                                />
                                <Link 
                                    href={verifyHash.trim() ? `/verify?code=${encodeURIComponent(verifyHash.trim())}` : '/verify'}
                                    className="w-14 h-14 bg-primary text-white rounded-[1.5rem] flex items-center justify-center hover:bg-primary-dark transition-all shadow-lg shadow-primary/30"
                                >
                                    <ArrowRight className="w-6 h-6" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <GlassCard className="relative rounded-[3rem] border-2 border-white/20 dark:border-white/10 p-1 bg-white/40 dark:bg-white/5 shadow-2xl overflow-hidden group">
                           <GlassCardContent className="bg-white/80 dark:bg-[#0a1120]/60 rounded-[2.8rem] p-10 h-full">
                                <div className="flex items-center gap-5 mb-10 pb-10 border-b border-slate-100 dark:border-white/5">
                                    <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/20">A</div>
                                    <div className="flex-1">
                                        <div className="h-6 w-1/2 bg-slate-200 dark:bg-white/10 rounded-full mb-3"></div>
                                        <div className="h-4 w-1/3 bg-slate-100 dark:bg-white/5 rounded-full"></div>
                                    </div>
                                    <ShieldCheck className="w-10 h-10 text-primary" />
                                </div>
                                <div className="space-y-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center gap-4 group/item">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover/item:text-primary transition-colors duration-500">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${Math.random() * 40 + 40}%` }}
                                                    transition={{ duration: 1.5, delay: i * 0.2 }}
                                                    className="h-full bg-primary/20"
                                                />
                                            </div>
                                            <div className="w-12 h-6 rounded-lg bg-primary/10"></div>
                                        </div>
                                    ))}
                                </div>
                           </GlassCardContent>
                        </GlassCard>
                    </motion.div>
                </div>
            </section>

            {/* Live Statistics Section */}
            <section className="py-32 px-6 border-y border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12"
                    >
                        {[
                            { label: "Total Students", value: "85K+", suffix: "Registered" },
                            { label: "Verifications", value: "2.4M", suffix: "Real-time" },
                            { label: "Universities", value: "120+", suffix: "Institutions" },
                            { label: "Uptime", value: "99.99%", suffix: "Guaranteed" },
                        ].map((stat, i) => (
                            <motion.div 
                                key={i}
                                variants={itemVariants}
                                className="text-center group"
                            >
                                <div className="text-4xl md:text-6xl font-black font-space-grotesk text-slate-900 dark:text-slate-100 mb-2 group-hover:text-primary transition-colors">{stat.value}</div>
                                <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{stat.label}</div>
                                <div className="text-xs font-bold text-secondary italic mt-1">{stat.suffix}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Feature Grid (6 Pillars) */}
            <section id="features" className="py-32 px-6 lg:px-12 max-w-7xl mx-auto">
                <div className="text-center mb-24">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6"
                    >
                        The Core Infrastructure
                    </motion.div>
                    <h2 className="text-4xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-slate-100 font-space-grotesk mb-8">
                        Engineered for <span className="text-primary italic">Scale</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xl font-medium max-w-3xl mx-auto">
                        A comprehensive ecosystem designed to replace legacy systems with modern, secure, and hyper-efficient architecture.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { title: "Multi-Institutional Orchestration", desc: "Manage multiple branches or entire university systems from a single, unified command center.", icon: <Network className="w-8 h-8" /> },
                        { title: "Cryptographic Integrity", desc: "Every academic milestone is hashed and signed, creating an immutable record of achievement.", icon: <ShieldCheck className="w-8 h-8" /> },
                        { title: "Real-time Intelligence", desc: "Predictive analytics and live monitoring of institutional KPIs powered by advanced logic engines.", icon: <LayoutDashboard className="w-8 h-8" /> },
                        { title: "Academic Lifecycle", desc: "From onboarding to alumni management, orchestrate every student interaction with precision.", icon: <GraduationCap className="w-8 h-8" /> },
                        { title: "Secure Admissions", desc: "AI-powered vacancy detection and automated admission workflows with built-in financial verification.", icon: <Building2 className="w-8 h-8" /> },
                        { title: "Global Verification", desc: "Instantly verify credentials across borders with our decentralized verification node system.", icon: <Globe className="w-8 h-8" /> },
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-10 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-primary/50 transition-all duration-500 group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-500 mb-8">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 font-space-grotesk tracking-tight">{feature.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* How It Works (3 Steps) */}
            <section className="py-32 px-6 lg:px-12 bg-slate-900 text-white relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[60%] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-7xl font-black tracking-tight font-space-grotesk mb-8">
                            Zero Friction <span className="text-primary italic">Integration</span>
                        </h2>
                        <p className="text-slate-400 text-xl font-medium max-w-3xl mx-auto">
                            Transforming your institution into a data-driven powerhouse takes only three strategic steps.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
                        {[
                            { step: "01", title: "Institutional Onboarding", desc: "Map your organizational structure, departments, and programs with our intelligent setup engine." },
                            { step: "02", title: "Smart Orchestration", desc: "Automate admissions, scheduling, and results with cryptographically signed workflows." },
                            { step: "03", title: "Live Verification", desc: "Launch your institutional hub with real-time verification and decentralized credentialing." },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="relative group"
                            >
                                <div className="text-8xl font-black text-white/5 absolute -top-12 -left-6 select-none group-hover:text-primary/20 transition-colors duration-700">
                                    {item.step}
                                </div>
                                <div className="relative pt-12">
                                    <h3 className="text-3xl font-black mb-6 font-space-grotesk tracking-tight">{item.title}</h3>
                                    <p className="text-slate-400 text-lg font-medium leading-relaxed">
                                        {item.desc}
                                    </p>
                                    <div className="mt-8 h-1 w-24 bg-primary/30 rounded-full group-hover:w-full transition-all duration-700" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-32 text-center">
                        <a
                            href={authEntryPath}
                            className="inline-flex items-center gap-3 rounded-[1.5rem] bg-primary text-white px-12 py-5 text-xl font-black transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/40 group"
                        >
                            Begin Transformation <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Redesigned Inquiry Module */}
            <section id="inquiry" className="py-40 px-6 relative">
                <div className="max-w-5xl mx-auto">
                    <GlassCard className="relative rounded-[3rem] md:rounded-[4rem] px-10 py-10 md:px-20 md:py-20 border-2 border-white/20 dark:border-white/10 overflow-hidden shadow-2xl bg-white/40 dark:bg-[#0a1120]">
                        
                        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
                        
                        <GlassCardHeader className="text-center mb-16 relative z-10 px-0">
                            <GlassCardTitle className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-6 font-space-grotesk">
                                Request a Demo
                            </GlassCardTitle>
                            <GlassCardDescription className="text-slate-500 dark:text-slate-400 text-xl font-medium max-w-2xl mx-auto">
                                Join the future of academic orchestration. Our team will help you integrate SmartOS across your entire infrastructure.
                            </GlassCardDescription>
                        </GlassCardHeader>

                        <GlassCardContent className="relative z-10 max-w-2xl mx-auto px-0">
                            {inquiryStatus === 'success' ? (
                                 <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center justify-center text-center py-20 bg-white/40 dark:bg-white/5 rounded-[3rem] border border-emerald-500/20"
                                >
                                     <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/30 mb-8">
                                         <CheckCircle2 className="w-12 h-12 text-white" />
                                     </div>
                                     <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Inquiry Received</h3>
                                     <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mb-10">
                                         A SmartOS expert will contact you within 24 hours.
                                     </p>
                                     <button
                                         onClick={() => setInquiryStatus('idle')}
                                         className="px-8 py-3 rounded-2xl bg-primary text-white font-black hover:scale-105 transition-all shadow-xl shadow-primary/20"
                                     >
                                         Send Another
                                     </button>
                                 </motion.div>
                            ) : (
                                <form onSubmit={handleInquirySubmit} className="space-y-8">
                                    {inquiryStatus === 'error' && (
                                        <div className="flex items-center gap-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-6 py-5 mb-8">
                                            <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
                                            <p className="text-rose-600 dark:text-rose-400 font-bold">{inquiryError}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3 px-1">
                                            <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-600 tracking-[0.2em] ml-2">Full Identity</label>
                                            <input type="text" required value={inquiryData.name} onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})} placeholder="John Doe" className="w-full h-16 rounded-2xl bg-white dark:bg-[#020817] border-2 border-slate-100 dark:border-white/10 px-6 text-slate-900 dark:text-slate-100 text-lg font-bold focus:border-primary outline-none transition-all shadow-sm" />
                                        </div>
                                        <div className="space-y-3 px-1">
                                            <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-600 tracking-[0.2em] ml-2">Secure Email</label>
                                            <input type="email" required value={inquiryData.email} onChange={(e) => setInquiryData({...inquiryData, email: e.target.value})} placeholder="john@university.edu" className="w-full h-16 rounded-2xl bg-white dark:bg-[#020817] border-2 border-slate-100 dark:border-white/10 px-6 text-slate-900 dark:text-slate-100 text-lg font-bold focus:border-primary outline-none transition-all shadow-sm" />
                                        </div>
                                    </div>

                                    <div className="space-y-3 px-1">
                                        <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-600 tracking-[0.2em] ml-2">Executive Summary</label>
                                        <textarea required rows={4} value={inquiryData.message} onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})} placeholder="Describe your institutional requirements..." className="w-full rounded-[2rem] bg-white dark:bg-[#020817] border-2 border-slate-100 dark:border-white/10 p-8 text-slate-900 dark:text-slate-100 text-lg font-bold focus:border-primary outline-none transition-all shadow-sm resize-none" />
                                    </div>

                                    <button
                                        type="submit" disabled={inquiryStatus === 'loading'}
                                        className="w-full h-20 rounded-[2rem] bg-primary text-white font-black text-2xl tracking-tight shadow-2xl shadow-primary/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4 group"
                                    >
                                        {inquiryStatus === 'loading' ? (
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                        ) : (
                                            <>Submit Inquiry <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" /></>
                                        )}
                                    </button>
                                </form>
                            )}
                        </GlassCardContent>
                    </GlassCard>
                </div>
            </section>
        </main>

        <LandingFooter />
    </div>
  );
}
