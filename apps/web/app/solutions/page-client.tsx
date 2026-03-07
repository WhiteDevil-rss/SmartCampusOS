"use client";

import React from 'react';
import Link from 'next/link';

export default function SolutionsClient() {
    return (
        <div className="min-h-screen bg-background text-text-primary font-sans">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

            {/* Navigation */}
            <nav className="sticky top-0 z-50 px-4 py-3">
                <div className="glass-morphism rounded-full px-4 py-2 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
                        </div>
                        <span className="font-heading font-bold text-lg tracking-tight">Zembaa AI</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <Link href="/platform" className="hover:text-primary transition-colors">Platform</Link>
                        <Link href="/solutions" className="text-primary">Solutions</Link>
                        <Link href="/security" className="hover:text-primary transition-colors">Security</Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/login">
                            <button className="text-xs font-semibold px-3 py-1.5 border border-primary/30 rounded-full hover:bg-primary/10 transition-colors">Log In</button>
                        </Link>
                        <button className="text-xs font-bold px-4 py-1.5 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-lg glow-shadow-primary">Start Free</button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-24 animate-fade-in">
                    <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 tracking-tight leading-tight">
                        Tailored <span className="gradient-text">Solutions</span> for Your Institution
                    </h1>
                    <p className="text-text-secondary text-xl max-w-2xl mx-auto">
                        From major universities to specialized medical colleges, we provide the intelligence to master institutional complexity.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-32">
                    {[
                        {
                            title: "Major Universities",
                            icon: "account_balance",
                            desc: "Manage thousands of students, hundreds of programs, and diverse faculty across multiple campuses seamlessly.",
                            stats: "80% Time Reduction",
                            features: ["Multi-Campus support", "Complex Elective Streams", "Research Slot Optimization"]
                        },
                        {
                            title: "Medical Colleges",
                            icon: "medical_services",
                            desc: "Specialized scheduling for rotations, clinical practice, and advanced lab sessions with strict compliance.",
                            stats: "100% Compliance",
                            features: ["Rotation Scheduling", "OT/Lab Optimization", "Regulatory Compliance"]
                        },
                        {
                            title: "K-12 Schools",
                            icon: "school",
                            desc: "Simple yet powerful scheduling for teachers, classrooms, and student groups with automated substitution management.",
                            stats: "No Manual Tallying",
                            features: ["Teacher Substitution", "Room Rotation", "Parent-Teacher Sync"]
                        },
                        {
                            title: "Corporate Training",
                            icon: "business_center",
                            desc: "Professional scheduling for certification programs, workshops, and internal training sessions at scale.",
                            stats: "Scale effortlessly",
                            features: ["Certification Tracking", "Workshop Spells", "Resource Planning"]
                        }
                    ].map((s, i) => (
                        <div key={i} className="glass-card p-12 rounded-[3rem] group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform"></div>
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
                                <span className="material-symbols-outlined text-4xl text-primary">{s.icon}</span>
                            </div>
                            <h3 className="text-3xl font-bold mb-4">{s.title}</h3>
                            <p className="text-text-secondary text-lg mb-8 leading-relaxed max-w-md">{s.desc}</p>

                            <div className="bg-white/5 border border-border rounded-2xl p-6 mb-8">
                                <p className="text-secondary font-bold text-2xl mb-1">{s.stats}</p>
                                <p className="text-text-muted text-xs uppercase tracking-widest font-bold">Key Performance Indicator</p>
                            </div>

                            <ul className="space-y-4">
                                {s.features.map((f, fi) => (
                                    <li key={fi} className="flex items-center gap-3 text-sm font-medium text-text-secondary">
                                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Benefits section */}
                <section className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold font-heading mb-4">Why Leaders Choose Us</h2>
                        <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { title: "Scalability", desc: "Built to handle institution-wide complexity without performance degradation.", icon: "trending_up" },
                            { title: "Configuration", desc: "Fully customizable rules and constraints that adapt to your unique pedagogy.", icon: "tune" },
                            { title: "Empowerment", desc: "Free your academic coordinators from mundane tasks to focus on student success.", icon: "rocket_launch" }
                        ].map((b, i) => (
                            <div key={i} className="text-center group">
                                <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:border-primary/50 transition-colors">
                                    <span className="material-symbols-outlined text-4xl text-text-muted group-hover:text-primary transition-colors">{b.icon}</span>
                                </div>
                                <h4 className="text-xl font-bold mb-4">{b.title}</h4>
                                <p className="text-text-secondary">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section className="text-center py-20 bg-surface/30 rounded-[3rem] border border-border shadow-2xl">
                    <h2 className="text-4xl font-bold font-heading mb-6">Need a custom solution?</h2>
                    <p className="text-xl text-text-secondary mb-10">Our consultants are ready to help you build the perfect platform for your needs.</p>
                    <button className="px-12 py-5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-xl shadow-2xl glow-shadow-primary hover:scale-105 transition-transform">
                        Talk to an Expert
                    </button>
                </section>
            </main>

            <footer className="border-t border-border py-12 px-6 text-center text-xs text-text-muted uppercase tracking-widest">
                <p>© 2024 Zembaa AI Technologies. All Rights Reserved.</p>
            </footer>
        </div>
    );
}
