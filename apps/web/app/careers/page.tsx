"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LandingNav } from "@/components/landing-nav";
import { LandingFooter } from "@/components/landing-footer";

const jobs = [
    { title: "Core Systems Architect", department: "Platform Engineering", location: "Global / Remote", type: "Full-Time" },
    { title: "AI Protocol Researcher", department: "Intelligence Lab", location: "Singapore / Hybrid", type: "Full-Time" },
    { title: "Interface Systems Designer", department: "Experience Design", location: "London / Hybrid", type: "Full-Time" },
    { title: "Institutional Growth Lead", department: "Global Operations", location: "Remote", type: "Full-Time" }
];

export default function CareersPage() {
    const [selectedJob, setSelectedJob] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans antialiased mesh-gradient flex flex-col selection:bg-primary/30">
            <LandingNav />

            <main className="flex-grow pt-32 pb-24 px-6 relative z-10">
                <div className="max-w-5xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-morphism border border-border text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-8"
                        >
                            <span className="material-symbols-outlined text-sm">rocket_launch</span>
                            Build the Infrastructure of Knowledge
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-bold font-space-grotesk tracking-tight mb-8">
                            Join the <span className="gradient-text">OS Mission</span>
                        </h1>
                        <p className="text-text-muted text-xl leading-relaxed max-w-2xl mx-auto">
                            We are building the sovereign operating system for higher education. We're looking for architects, designers, and thinkers to help us scale institutional intelligence.
                        </p>
                    </div>

                    {/* Job Listings */}
                    <div className="space-y-4 mb-24">
                        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary mb-8 border-b border-border pb-4">
                            Open Protocol Positions
                        </div>
                        {jobs.map((job, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => setSelectedJob(job.title)}
                                className="glass-morphism rounded-[24px] p-8 flex flex-col md:flex-row md:items-center justify-between border border-border hover:border-primary/20 transition-all cursor-pointer group"
                            >
                                <div>
                                    <h3 className="text-2xl font-bold font-space-grotesk mb-3 text-text-primary transition-colors group-hover:text-primary">{job.title}</h3>
                                    <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                                        <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">layers</span> {job.department}</span>
                                        <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">public</span> {job.location}</span>
                                        <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">bolt</span> {job.type}</span>
                                    </div>
                                </div>
                                <div className="mt-6 md:mt-0 flex items-center gap-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">Initialize Application</span>
                                    <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                                        <span className="material-symbols-outlined text-text-primary transition-transform group-hover:translate-x-1">arrow_forward</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Culture Section */}
                    <div className="grid md:grid-cols-2 gap-12 mb-24">
                        <div className="glass-morphism rounded-[40px] p-12 border border-border">
                            <h3 className="text-2xl font-bold font-space-grotesk mb-6">Autonomous <span className="text-primary italic">Execution</span></h3>
                            <p className="text-text-muted leading-relaxed">We value ownership over management. Every node in our team is empowered to make high-impact decisions and execute on institutional-scale problems.</p>
                        </div>
                        <div className="glass-morphism rounded-[40px] p-12 border border-border">
                            <h3 className="text-2xl font-bold font-space-grotesk mb-6">Global <span className="text-primary italic">Residency</span></h3>
                            <p className="text-text-muted leading-relaxed">Our infrastructure is global, and so is our team. We operate across time zones to ensure the SmartCampus OS protocol never stops evolving.</p>
                        </div>
                    </div>
                </div>

                {/* Application Modal */}
                <AnimatePresence>
                    {selectedJob && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                            onClick={() => setSelectedJob(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-background border border-border rounded-[32px] p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative card-glow"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">Initialize Application</div>
                                        <h2 className="text-3xl font-bold font-space-grotesk text-text-primary">{selectedJob}</h2>
                                    </div>
                                    <button onClick={() => setSelectedJob(null)} className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>

                                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setSelectedJob(null); }}>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Legal Identity</label>
                                            <input type="text" placeholder="Full Name" required className="w-full bg-surface border border-border rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary/50 transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Communication Link</label>
                                            <input type="email" placeholder="Email Address" required className="w-full bg-surface border border-border rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary/50 transition-colors" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Professional Artifacts (URLs)</label>
                                        <input type="url" placeholder="GitHub, LinkedIn, or Portfolio" className="w-full bg-surface border border-border rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary/50 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Why SmartCampus OS?</label>
                                        <textarea rows={4} placeholder="Brief reasoning for joining the mission..." className="w-full bg-surface border border-border rounded-2xl px-5 py-4 text-text-primary focus:outline-none focus:border-primary/50 transition-colors resize-none"></textarea>
                                    </div>
                                    <button type="submit" className="w-full glow-button bg-primary text-white font-bold py-5 rounded-2xl mt-4">
                                        Submit Protocol Application
                                    </button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <LandingFooter />
        </div>
    );
}
