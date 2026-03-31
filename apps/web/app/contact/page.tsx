'use client';

import React, { useState } from "react";
import { LandingNav } from '@/components/landing-nav';
import { LandingFooter } from '@/components/landing-footer';
import { motion } from "framer-motion";
import { api } from '@/lib/api';
import { 
    Mail, 
    Phone, 
    MapPin, 
    Clock, 
    ShieldCheck, 
    ArrowRight, 
    CheckCircle2, 
    AlertCircle, 
    Loader2,
    Globe,
    MessageSquare
} from 'lucide-react';
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { SiX, SiLinkedin, SiGithub } from 'react-icons/si';

export default function ContactPage() {
    const [inquiryData, setInquiryData] = useState({
        name: '', email: '', phone: '', subject: '', message: ''
    });
    const [inquiryStatus, setInquiryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [inquiryError, setInquiryError] = useState('');

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
                organization: inquiryData.subject.trim() || 'General Inquiry', 
                message: inquiryData.message.trim(),
                source: 'contact_page'
            });
            setInquiryStatus('success');
            setInquiryData({ name: '', email: '', phone: '', subject: '', message: '' });
            setTimeout(() => setInquiryStatus('idle'), 5000);
        } catch (err: any) {
            setInquiryStatus('error');
            setInquiryError(err.response?.data?.error || err.message || 'Failed to submit inquiry.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/30 antialiased flex flex-col">
            <LandingNav />

            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px] mix-blend-screen" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[150px]" />
            </div>

            <main className="flex-1 relative z-10 pt-40 pb-24 px-6 lg:px-12 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    
                    {/* Left Column: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-8">
                            Global Operations
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight font-space-grotesk mb-8 leading-none">
                            Connect With <span className="text-primary italic">SmartOS</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xl font-medium leading-relaxed mb-12 max-w-xl">
                            Our executive response team is ready to assist with enterprise-grade deployments, academic integrations, and partnership opportunities.
                        </p>

                        <div className="space-y-6 mb-12">
                            {[
                                { icon: <Mail className="w-5 h-5" />, label: "Enterprise Inquiries", value: "hq@smartcampus-os.com" },
                                { icon: <Phone className="w-5 h-5" />, label: "Institutional Hotline", value: "+1 (555) 942-0101" },
                                { icon: <MapPin className="w-5 h-5" />, label: "Global HQ", value: "101 Innovation Way, Silicon Valley, CA" },
                                { icon: <Clock className="w-5 h-5" />, label: "Security Operations", value: "24/7/365 Monitoring" },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-5 p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-primary/30 transition-all group">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{item.label}</div>
                                        <div className="text-lg font-bold text-slate-700 dark:text-slate-200">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mr-4">Social Signal</div>
                            <div className="flex items-center gap-3">
                                {[
                                    { icon: <SiX className="w-4 h-4" />, href: "https://x.com" },
                                    { icon: <SiLinkedin className="w-4 h-4" />, href: "https://linkedin.com" },
                                    { icon: <SiGithub className="w-4 h-4" />, href: "https://github.com" },
                                ].map((social, i) => (
                                    <a key={i} href={social.href} target="_blank" className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/50 transition-all">
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <GlassCard className="rounded-[3rem] border-2 border-white/20 dark:border-white/10 overflow-hidden shadow-2xl bg-white/40 dark:bg-[#0a1120] p-1">
                            <GlassCardContent className="bg-white/80 dark:bg-[#0a1120]/60 rounded-[2.8rem] p-10 md:p-14">
                                {inquiryStatus === 'success' ? (
                                    <div className="flex flex-col items-center justify-center text-center py-20">
                                        <div className="w-20 h-20 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 mb-8">
                                            <CheckCircle2 className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-3xl font-black mb-4">Transmission Successful</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-10">
                                            Your inquiry has been routed to the appropriate department.
                                        </p>
                                        <button
                                            onClick={() => setInquiryStatus('idle')}
                                            className="px-10 py-4 rounded-2xl bg-primary text-white font-black hover:scale-105 transition-all shadow-xl shadow-primary/20"
                                        >
                                            Send Another
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleInquirySubmit} className="space-y-8">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <MessageSquare className="w-6 h-6 text-primary" />
                                                <h2 className="text-2xl font-black tracking-tight">Direct Inquiry</h2>
                                            </div>

                                            {inquiryStatus === 'error' && (
                                                <div className="flex items-center gap-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-6 py-4">
                                                    <AlertCircle className="w-5 h-5 text-rose-500" />
                                                    <p className="text-rose-600 dark:text-rose-400 font-bold text-sm">{inquiryError}</p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest ml-1">Identity</label>
                                                    <input required type="text" value={inquiryData.name} onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})} placeholder="Full name" className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-[#020817] border-2 border-slate-100 dark:border-white/10 px-5 text-slate-900 dark:text-white font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest ml-1">Secure Email</label>
                                                    <input required type="email" value={inquiryData.email} onChange={(e) => setInquiryData({...inquiryData, email: e.target.value})} placeholder="email@corp.com" className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-[#020817] border-2 border-slate-100 dark:border-white/10 px-5 text-slate-900 dark:text-white font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest ml-1">Subject / Institution</label>
                                                <input type="text" value={inquiryData.subject} onChange={(e) => setInquiryData({...inquiryData, subject: e.target.value})} placeholder="e.g. University Administration" className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-[#020817] border-2 border-slate-100 dark:border-white/10 px-5 text-slate-900 dark:text-white font-bold focus:border-primary outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700" />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest ml-1">Requirement Overview</label>
                                                <textarea required rows={4} value={inquiryData.message} onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})} placeholder="How can our engineering team help you?" className="w-full rounded-2xl bg-slate-50 dark:bg-[#020817] border-2 border-slate-100 dark:border-white/10 p-5 text-slate-900 dark:text-white font-bold focus:border-primary outline-none transition-all resize-none placeholder:text-slate-300 dark:placeholder:text-slate-700" />
                                            </div>
                                        </div>

                                        <button
                                            type="submit" disabled={inquiryStatus === 'loading'}
                                            className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {inquiryStatus === 'loading' ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <>Signal Team <ArrowRight className="w-5 h-5" /></>
                                            )}
                                        </button>
                                        
                                        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                                            <ShieldCheck className="w-3 h-3 text-emerald-500" /> End-to-End Encrypted Communication
                                        </div>
                                    </form>
                                )}
                            </GlassCardContent>
                        </GlassCard>
                    </motion.div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
