'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";
import { LandingFooter } from "@/components/landing-footer";
import { motion } from "framer-motion";
import { api } from '@/lib/api';
import { LuLoader, LuCircleCheck, LuCircleAlert, LuMail, LuPhone, LuUser, LuGraduationCap, LuShieldCheck, LuFileText, LuNetwork, LuSearch, LuArrowRight, LuLayoutDashboard } from 'react-icons/lu';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  // Inquiry Form State
  const [inquiryData, setInquiryData] = useState({
      name: '', email: '', phone: '', program: '', message: ''
  });
  const [inquiryStatus, setInquiryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [inquiryError, setInquiryError] = useState('');

  // Quick Verify State
  const [verifyHash, setVerifyHash] = useState('');

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

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary relative overflow-x-hidden flex flex-col font-sans selection:bg-neon-cyan/30 antialiased">
        <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-cyan/5 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />
             
        <LandingNav />

        <main className="flex-1">
            {/* SaaS Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
                <motion.div initial="initial" animate="animate" variants={fadeIn} className="flex flex-col items-center gap-8 max-w-4xl mx-auto w-full">
                  
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md">
                      <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-cyan"></span>
                      </span>
                      <span className="text-primary text-xs font-bold tracking-wider uppercase">Enterprise Edition API Live</span>
                  </div>

                  <h1 className="text-5xl md:text-7xl lg:text-7xl font-black tracking-tighter leading-[1.05]">
                      Smart Admission <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400 glow-text drop-shadow-sm">
                          Management Software
                      </span>
                  </h1>

                  <p className="text-slate-400 text-lg md:text-xl font-normal leading-relaxed max-w-2xl">
                      A scalable, secure, multi-institution platform designed to handle your entire admission lifecycle. Ensure data integrity with cryptographic ledger verifications built-in.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full max-w-4xl mx-auto flex-wrap">
                      <Link
                          href="/login?tab=register"
                          className="w-full xl:w-auto glow-button flex items-center justify-center gap-2 rounded-2xl bg-primary text-white px-10 py-4 text-lg font-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                      >
                          Apply Now <LuArrowRight className="w-5 h-5" />
                      </Link>
                      
                      <button
                          onClick={() => document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' })}
                          className="w-full xl:w-auto flex items-center justify-center gap-2 rounded-2xl border border-border-hover bg-slate-900/50 backdrop-blur-sm text-slate-300 px-8 py-4 text-lg font-semibold hover:bg-slate-800 transition-all"
                      >
                          Admission Inquiry
                      </button>

                      <Link
                          href="/verify"
                          className="w-full xl:w-auto flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/50 text-emerald-400 bg-emerald-500/10 px-8 py-4 text-lg font-bold hover:bg-emerald-500/20 transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                      >
                          <LuShieldCheck className="w-6 h-6" /> Verify Data
                      </Link>
                      
                      <Link
                          href="/careers"
                          className="w-full xl:w-auto flex items-center justify-center gap-2 rounded-2xl border border-purple-500/50 text-purple-400 bg-purple-500/10 px-8 py-4 text-lg font-bold hover:bg-purple-500/20 transition-all shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                      >
                          View Careers
                      </Link>
                  </div>

                  <div className="mt-8 w-full max-w-md mx-auto relative group">
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl group-hover:bg-emerald-500/30 transition-all"></div>
                      <div className="relative flex items-center bg-black/50 border border-emerald-500/50 rounded-2xl p-1 backdrop-blur-md">
                          <input 
                              type="text" 
                              placeholder="Enter Verification Hash..." 
                              className="w-full bg-transparent border-none text-white px-4 outline-none font-mono text-sm"
                              value={verifyHash}
                              onChange={(e) => setVerifyHash(e.target.value)}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter' && verifyHash.trim()) {
                                      window.location.href = `/verify?code=${encodeURIComponent(verifyHash.trim())}`;
                                  }
                              }}
                          />
                          <Link 
                              href={verifyHash.trim() ? `/verify?code=${encodeURIComponent(verifyHash.trim())}` : '/verify'}
                              className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                          >
                              <LuSearch className="w-5 h-5" />
                          </Link>
                      </div>
                  </div>
                </motion.div>
            </section>

            {/* Admissions Overview Section */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-border/50 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                            No Login Required
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Seamless Admission Flow</h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            We've eliminated friction. Applicants can explore programs, submit inquiries, and complete multi-step admission applications entirely unauthenticated. Secure links and verification hashes handle the rest.
                        </p>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                                    <LuLayoutDashboard className="text-primary w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">Multi-Step Processing</h4>
                                    <p className="text-slate-400 text-sm">Automated saving and structured routing across all application stages.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                                    <LuShieldCheck className="text-emerald-400 w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">Instant Verification</h4>
                                    <p className="text-slate-400 text-sm">Every admission letter is cryptographically signed and hash-verifiable.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Link href="/admissions" className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors">Start Application</Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-neon-cyan/20 blur-[100px] rounded-full"></div>
                        <div className="relative glass-morphism rounded-[2rem] border border-border p-6 shadow-2xl">
                            {/* Mock Dashboard UI */}
                            <div className="flex bg-black/40 rounded-xl p-4 gap-4 items-center border border-white/5 mb-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center"><LuUser className="text-primary" /></div>
                                <div className="flex-1">
                                    <div className="h-4 w-1/3 bg-white/10 rounded mb-2"></div>
                                    <div className="h-3 w-1/4 bg-white/5 rounded"></div>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">Verified</div>
                            </div>
                            <div className="space-y-3">
                                {[1,2,3].map(i => (
                                    <div key={i} className="flex bg-black/40 rounded-xl p-4 gap-4 items-center border border-white/5">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><LuFileText className="text-slate-400" /></div>
                                        <div className="flex-1">
                                            <div className="h-3 w-1/2 bg-white/10 rounded mb-2"></div>
                                        </div>
                                        <div className="h-6 w-16 rounded bg-emerald-500/20"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Centralized Inquiry Module */}
            <section id="inquiry" className="py-24 px-6 md:px-12 max-w-5xl mx-auto relative border-t border-border/50">
                <div className="glass-morphism rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 border border-primary/20 relative overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.05)]">
                    
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="text-center mb-10 relative z-10">
                        <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">Lead Generation API</div>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">Admission Inquiry</h2>
                        <p className="text-slate-400 text-lg">
                            Have questions? Drop an inquiry directly into our secure PostgreSQL database node.
                        </p>
                    </div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10">
                            {inquiryStatus === 'success' ? (
                                 <div className="flex flex-col items-center justify-center text-center py-10 space-y-4 animate-in fade-in zoom-in-95">
                                     <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                         <LuCircleCheck className="w-10 h-10 text-emerald-400" />
                                     </div>
                                     <h3 className="text-2xl font-black text-white">Payload Stored!</h3>
                                     <p className="text-slate-400 max-w-sm mx-auto">
                                         Your admission inquiry was successfully captured by our systems.
                                     </p>
                                     <button
                                         onClick={() => setInquiryStatus('idle')}
                                         className="mt-4 px-6 py-2 rounded-full border border-border-hover text-white hover:bg-white/10 transition-colors"
                                     >
                                         Submit Another
                                     </button>
                                 </div>
                            ) : (
                                <form onSubmit={handleInquirySubmit} className="space-y-6">
                                    {inquiryStatus === 'error' && (
                                        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-5 py-4">
                                            <LuCircleAlert className="w-5 h-5 text-rose-400 shrink-0" />
                                            <p className="text-rose-300 text-sm font-semibold">{inquiryError}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase font-bold text-slate-400 tracking-widest ml-1">
                                                Full Name <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <LuUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                <input type="text" required value={inquiryData.name} onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})} placeholder="Demo User" className="w-full h-12 rounded-xl bg-black/60 border border-white/10 pl-11 pr-4 text-white text-sm focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/20 outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase font-bold text-slate-400 tracking-widest ml-1">
                                                Email Address <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                <input type="email" required value={inquiryData.email} onChange={(e) => setInquiryData({...inquiryData, email: e.target.value})} placeholder="demo@example.com" className="w-full h-12 rounded-xl bg-black/60 border border-white/10 pl-11 pr-4 text-white text-sm focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/20 outline-none transition-all" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase font-bold text-slate-400 tracking-widest ml-1">Phone</label>
                                            <div className="relative">
                                                <LuPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                <input type="tel" value={inquiryData.phone} onChange={(e) => setInquiryData({...inquiryData, phone: e.target.value})} placeholder="+1 555-0199" className="w-full h-12 rounded-xl bg-black/60 border border-white/10 pl-11 pr-4 text-white text-sm focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/20 outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase font-bold text-slate-400 tracking-widest ml-1">Program Pipeline</label>
                                            <div className="relative">
                                                <LuGraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                <input type="text" value={inquiryData.program} onChange={(e) => setInquiryData({...inquiryData, program: e.target.value})} placeholder="e.g. B.Tech CS" className="w-full h-12 rounded-xl bg-black/60 border border-white/10 pl-11 pr-4 text-white text-sm focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/20 outline-none transition-all" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs uppercase font-bold text-slate-400 tracking-widest ml-1">
                                            Message <span className="text-rose-500">*</span>
                                        </label>
                                        <textarea required rows={3} value={inquiryData.message} onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})} placeholder="Enter inquiry details..." className="w-full rounded-xl bg-black/60 border border-white/10 p-4 text-white text-sm focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/20 outline-none transition-all resize-none" />
                                    </div>

                                    <button
                                        type="submit" disabled={inquiryStatus === 'loading'}
                                        className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-black tracking-wide shadow-lg shadow-primary/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {inquiryStatus === 'loading' ? (
                                            <><LuLoader className="w-5 h-5 animate-spin" /> Transmitting...</>
                                        ) : (
                                            <><span className="material-symbols-outlined text-[20px]">send</span> POST Inquiry</>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <LandingFooter />
    </div>
  );
}
