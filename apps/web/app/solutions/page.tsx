'use client';

import React, { useState } from "react";
import { LandingNav } from "@/components/landing-nav";
import { LandingFooter } from "@/components/landing-footer";
import { GetStartedModal } from "@/components/get-started-modal";

const tabs = [
    {
        label: "University Administrators",
        cards: [
            { icon: "account_balance", title: "Manage multiple departments", desc: "Oversee and harmonize complex timetables across various disciplines, faculties, and campuses seamlessly.", color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
            { icon: "settings", title: "Configure academic structure", desc: "Set up programs, semesters, divisions, and academic calendar with full flexibility.", color: "text-neon-purple", bg: "bg-neon-purple/10" },
            { icon: "monitoring", title: "Oversee scheduling across programs", desc: "Bird's-eye view of all schedules with real-time conflict detection and resolution.", color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: "insights", title: "Monitor resource utilization", desc: "Gain insights into classroom usage, faculty workloads, and identify areas for optimization.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ]
    },
    {
        label: "Department Heads",
        cards: [
            { icon: "menu_book", title: "Assign subjects to faculty", desc: "Allocate courses to educators with ease, considering constraints, preferences, and workload limits.", color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
            { icon: "tune", title: "Configure department constraints", desc: "Define department-specific scheduling rules, preferred time slots, and room requirements.", color: "text-neon-purple", bg: "bg-neon-purple/10" },
            { icon: "event_available", title: "Generate department timetables", desc: "One-click timetable generation with AI-powered optimization for your department.", color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: "category", title: "Handle elective baskets", desc: "Smart grouping and scheduling of elective subjects with automatic student split handling.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ]
    },
    {
        label: "Academic Coordinators",
        cards: [
            { icon: "calendar_month", title: "Manage academic calendar", desc: "Align academic events, exams, and holidays without conflicts throughout the year.", color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
            { icon: "group_work", title: "Coordinate cross-department scheduling", desc: "Handle shared resources, common rooms, and cross-listed courses seamlessly.", color: "text-neon-purple", bg: "bg-neon-purple/10" },
            { icon: "location_on", title: "Handle room allocations", desc: "Smartly assign venues based on capacity, equipment needs, and proximity.", color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: "share", title: "Export and share timetables", desc: "Export schedules in multiple formats and share with stakeholders instantly.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ]
    },
    {
        label: "Faculty Members",
        cards: [
            { icon: "schedule", title: "View personal schedules", desc: "Access your teaching schedule anytime, anywhere with a clean, personal dashboard.", color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
            { icon: "edit_calendar", title: "Update availability", desc: "Set your preferred teaching hours and unavailable time slots with ease.", color: "text-neon-purple", bg: "bg-neon-purple/10" },
            { icon: "sync", title: "Access real-time changes", desc: "Stay updated with instant notifications when schedules are modified.", color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: "notifications_active", title: "Receive notifications", desc: "Get alerts for schedule changes, room updates, and important announcements.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ]
    },
];

export default function SolutionsPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [showInquiryModal, setShowInquiryModal] = useState(false);

    return (
        <div className="dark min-h-screen bg-background-dark text-slate-100 relative overflow-x-hidden flex flex-col font-heading selection:bg-neon-cyan/30 antialiased">
            <LandingNav />

            <main className="flex-grow flex flex-col items-center w-full">
                {/* Hero */}
                <section className="w-full max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col items-center text-center relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(157,78,221,0.15)_0%,transparent_70%)] pointer-events-none" />
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan text-sm font-medium mb-8">
                        <span className="material-symbols-outlined text-base">school</span>
                        <span>Tailored for Academia</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 max-w-4xl">
                        Solutions for Every <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">Academic Role</span>
                    </h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full mb-8" />
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
                        Empowering educational institutions with intelligent, conflict-free academic timetable generation tailored to your specific responsibilities.
                    </p>
                    <button
                        onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex items-center justify-center rounded-full bg-gradient-to-r from-neon-cyan to-blue-500 text-white px-[36px] py-[14px] text-[16px] font-semibold shadow-[0_0_20px_rgba(0,245,255,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(0,245,255,0.5)] transition-all active:scale-95"
                    >
                        Find Your Solution
                    </button>
                </section>

                {/* Role-based Tabs */}
                <section id="roles" className="w-full max-w-7xl mx-auto px-6 py-16">
                    <div className="flex flex-col items-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Empower Your Team</h2>
                        <p className="text-slate-400 text-center max-w-2xl">Discover how Zembaa streamlines scheduling tasks across your entire institution.</p>
                    </div>
                    <div className="flex overflow-x-auto border-b border-white/10 mb-8 justify-start lg:justify-center">
                        {tabs.map((tab, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTab(i)}
                                className={`flex-shrink-0 px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === i ? 'border-neon-cyan text-neon-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {tabs[activeTab].cards.map((card, i) => (
                            <div key={i} className="bg-surface-dark/70 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(0,245,255,0.1)] transition-all duration-300 flex flex-col h-full">
                                <div className={`w-12 h-12 rounded-lg ${card.bg} ${card.color} flex items-center justify-center mb-6`}>
                                    <span className="material-symbols-outlined text-2xl">{card.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed flex-grow">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Use Cases */}
                <section className="w-full bg-surface-dark/50 py-20 border-y border-white/10">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col items-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">Common Use Cases</h2>
                            <p className="text-slate-400 text-center max-w-2xl">Tailored solutions for complex academic scheduling challenges.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { icon: "location_city", title: "Multi-campus Scheduling", desc: "Manage travel times and shared resources across different physical locations.", color: "border-l-neon-cyan", iconColor: "text-neon-cyan" },
                                { icon: "category", title: "Elective Management", desc: "Handle complex student choices for elective subjects with automatic conflict resolution.", color: "border-l-neon-purple", iconColor: "text-neon-purple" },
                                { icon: "group_work", title: "Shared Faculty", desc: "Seamlessly schedule professors who teach across multiple departments or programs.", color: "border-l-blue-400", iconColor: "text-blue-400" },
                                { icon: "science", title: "Lab Scheduling", desc: "Allocate specialized rooms and equipment efficiently, grouping lab sessions logically.", color: "border-l-emerald-400", iconColor: "text-emerald-400" },
                                { icon: "update", title: "Continuous Timetables", desc: "Adapt to dynamic academic environments where schedules need frequent adjustments.", color: "border-l-amber-400", iconColor: "text-amber-400", wide: true },
                            ].map((c, i) => (
                                <div key={i} className={`bg-surface-dark/70 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:-translate-y-1 transition-transform duration-300 border-l-4 ${c.color} group flex flex-col ${c.wide ? 'lg:col-span-2' : ''}`}>
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className={`material-symbols-outlined ${c.iconColor} group-hover:scale-110 transition-transform`}>{c.icon}</span>
                                        <h3 className="text-lg font-bold">{c.title}</h3>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-4">{c.desc}</p>
                                    <div className="mt-auto">
                                        <button className="flex items-center text-[14px] font-medium text-neon-cyan hover:underline transition-all group-hover:gap-1">
                                            View Details <span className="material-symbols-outlined text-[16px] ml-1">arrow_right_alt</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Before vs After */}
                <section className="w-full max-w-7xl mx-auto px-6 py-20">
                    <div className="flex flex-col items-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">The Zembaa Difference</h2>
                        <p className="text-slate-400 text-center max-w-2xl">Transform your scheduling process from a nightmare into a strategic advantage.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Before */}
                        <div className="bg-surface-dark/70 backdrop-blur-sm rounded-2xl p-8 border border-red-900/30 bg-red-950/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="material-symbols-outlined text-8xl text-red-500">warning</span>
                            </div>
                            <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined">cancel</span> Manual Scheduling
                            </h3>
                            <ul className="space-y-4">
                                {["Weeks of tedious manual planning", "High risk of hidden conflicts", "Suboptimal use of campus facilities", "Difficult to accommodate changes"].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-red-500 text-sm mt-1">close</span>
                                        <span className="text-slate-300">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* After */}
                        <div className="bg-surface-dark/70 backdrop-blur-sm rounded-2xl p-8 border border-neon-cyan/30 relative overflow-hidden shadow-[0_0_30px_rgba(0,245,255,0.1)]">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="material-symbols-outlined text-8xl text-neon-cyan">bolt</span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 pointer-events-none" />
                            <h3 className="text-xl font-bold text-neon-cyan mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined">check_circle</span> Zembaa AI Solution
                            </h3>
                            <ul className="space-y-4">
                                {["Instant generation in minutes", "100% guaranteed conflict-free", "Optimized resource allocation", "Dynamic adjustments with AI"].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-neon-cyan text-sm mt-1">check</span>
                                        <span className="text-white font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Metrics */}
                <section className="w-full py-20 relative">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
                            {[
                                { value: "90%", label: "Time Saved", color: "text-neon-cyan" },
                                { value: "100%", label: "Conflict-Free", color: "text-neon-purple" },
                                { value: "50%", label: "Better Resource Usage", color: "text-blue-400" },
                                { value: "80%", label: "Less Manual Work", color: "text-emerald-400" },
                            ].map((m, i) => (
                                <div key={i} className="flex flex-col items-center px-4">
                                    <span className={`text-4xl md:text-5xl font-bold ${m.color} mb-2`}>{m.value}</span>
                                    <span className="text-sm text-slate-400 font-medium uppercase tracking-wider">{m.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="w-full max-w-5xl mx-auto px-6 py-24 text-center relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,245,255,0.1)_0%,transparent_60%)] pointer-events-none" />
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Find the Right Solution <br className="hidden sm:block" /> for Your Institution</h2>
                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">Join forward-thinking academic institutions that have already revolutionized their scheduling with Zembaa.</p>
                    <button
                        onClick={() => setShowInquiryModal(true)}
                        className="flex mx-auto items-center justify-center rounded-full bg-gradient-to-r from-neon-cyan to-blue-500 text-white px-[36px] py-[14px] text-[16px] font-semibold shadow-[0_0_20px_rgba(0,245,255,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(0,245,255,0.5)] transition-all active:scale-95"
                    >
                        Get Started
                    </button>
                </section>
            </main>

            <LandingFooter />

            <GetStartedModal isOpen={showInquiryModal} onClose={() => setShowInquiryModal(false)} />
        </div>
    );
}
