"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', org: '', subject: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            await api.post('/inquiries', {
                name: formData.name,
                email: formData.email,
                contactNumber: formData.phone || 'N/A',
                organization: formData.org || 'N/A',
                message: `[${formData.subject}] ${formData.message}`
            });
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', org: '', subject: '', message: '' });
        } catch (error) {
            setStatus('error');
        }

        setTimeout(() => setStatus('idle'), 5000);
    };

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans antialiased mesh-gradient selection:bg-primary/30">
            {/* Nav Header */}
            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 glass-morphism border-b border-border">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-primary text-2xl">hub</span>
                        </div>
                        <span className="text-white text-xl font-bold font-space-grotesk tracking-tight">SmartCampus OS</span>
                    </Link>
                    <Link href="/" className="text-sm font-bold uppercase tracking-widest text-text-muted hover:text-white transition-colors flex items-center gap-2 group">
                        <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>
                        Back Home
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-12"
                        >
                            <h2 className="text-neon-cyan font-black uppercase tracking-[0.4em] text-[10px] mb-4">Institutional Presence</h2>
                            <h1 className="text-6xl md:text-7xl font-black font-space-grotesk leading-[0.9] tracking-tighter mb-8">
                                Let's Start a <br /><span className="gradient-text">Conversation</span>
                            </h1>
                            <p className="text-text-muted text-lg leading-relaxed max-w-lg font-medium">
                                Architecting the future of education together. Our experts are ready to deploy SmartCampus OS infrastructure tailored to your institution's specific needs.
                            </p>
                        </motion.div>

                        <div className="space-y-10 mb-16">
                            {[
                                { icon: 'alternate_email', title: 'Institutional Support', detail: 'support@smartcampus.ac.in', color: 'text-neon-cyan', bg: 'bg-neon-cyan/10' },
                                { icon: 'corporate_fare', title: 'Global Headquarters', detail: 'AI Innovation Drive, Palo Alto, CA', color: 'text-primary', bg: 'bg-primary/10' },
                                { icon: 'verified_user', title: 'Security Ops', detail: 'sec-ops@smartcampus.ac.in', color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                    className="flex items-center gap-6 group cursor-pointer"
                                >
                                    <div className={`w-16 h-16 rounded-[1.25rem] ${item.bg} flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-all duration-500 shadow-lg backdrop-blur-sm`}>
                                        <span className={`material-symbols-outlined ${item.color} text-2xl`}>{item.icon}</span>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-1 opacity-70">{item.title}</div>
                                        <div className="text-white font-bold tracking-tight text-lg">{item.detail}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                    >
                        {/* Decorative Background Glows */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-neon-cyan/5 blur-[80px] rounded-full pointer-events-none" />

                        <div className="bg-[#0d0f14]/80 backdrop-blur-xl rounded-[3rem] p-10 md:p-14 border border-white/5 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-primary to-neon-purple opacity-30" />

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Full Name</label>
                                        <input
                                            type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Lead Administrator"
                                            className="w-full bg-white/5 border border-border-hover rounded-2xl py-4.5 px-6 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan/50 focus:bg-surface-hover transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Official Email</label>
                                        <input
                                            type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="admin@univ.edu"
                                            className="w-full bg-white/5 border border-border-hover rounded-2xl py-4.5 px-6 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan/50 focus:bg-surface-hover transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Organization</label>
                                        <input
                                            type="text" value={formData.org} onChange={e => setFormData({ ...formData, org: e.target.value })}
                                            placeholder="University Name"
                                            className="w-full bg-white/5 border border-border-hover rounded-2xl py-4.5 px-6 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan/50 focus:bg-surface-hover transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Phone Vector</label>
                                        <input
                                            type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+1 (888) 000-0000"
                                            className="w-full bg-white/5 border border-border-hover rounded-2xl py-4.5 px-6 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan/50 focus:bg-surface-hover transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Inquiry Subject</label>
                                    <input
                                        type="text" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="Institutional Deployment Inquiry"
                                        className="w-full bg-white/5 border border-border-hover rounded-2xl py-4.5 px-6 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan/50 focus:bg-surface-hover transition-all font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Operational Message</label>
                                    <textarea
                                        rows={4} required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Describe your architectural requirements..."
                                        className="w-full bg-white/5 border border-border-hover rounded-2xl py-5 px-6 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan/50 focus:bg-surface-hover transition-all resize-none font-medium text-sm leading-relaxed"
                                    />
                                </div>

                                <button
                                    type="submit" disabled={status === 'loading'}
                                    className="w-full bg-gradient-to-r from-neon-cyan to-primary text-slate-900 rounded-2xl py-5 font-black text-base uppercase tracking-widest shadow-[0_0_30px_rgba(57,193,239,0.3)] hover:shadow-[0_0_40px_rgba(57,193,239,0.5)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                            Transmitting...
                                        </>
                                    ) : (
                                        <>
                                            Dispatch Request
                                            <span className="material-symbols-outlined font-bold">arrow_forward</span>
                                        </>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {status === 'success' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-center text-xs font-bold uppercase tracking-widest">
                                            Transmission Successful. Sync established.
                                        </motion.div>
                                    )}
                                    {status === 'error' && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-center text-xs font-bold uppercase tracking-widest">
                                            Transmission Error. Verify connection link.
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </main>

            <footer className="py-12 border-t border-border text-center">
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">SmartCampus Enterprise Hub</p>
            </footer>
        </div>
    );
}
