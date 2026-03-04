'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { GetStartedModal } from "@/components/get-started-modal";
import { LandingNav } from "@/components/landing-nav";
import { LandingFooter } from "@/components/landing-footer";
import { GetStartedButton } from "@/components/get-started-button";

export default function Home() {
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getDashboardPath = () => {
    if (!user) return "/dashboard";
    switch (user.role) {
      case 'UNI_ADMIN': return "/dashboard";
      case 'DEPT_ADMIN': return "/department";
      case 'FACULTY': return "/faculty-panel";
      default: return "/dashboard";
    }
  };

  const dashboardPath = getDashboardPath();

  return (
    <div className="dark min-h-screen bg-background-dark text-slate-100 relative overflow-x-hidden flex flex-col font-heading selection:bg-neon-cyan/30 antialiased">
      <LandingNav />

      <main className="flex-1">
        {/* Section B: Hero */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-1/4 -left-64 w-96 h-96 bg-neon-cyan/20 rounded-full mix-blend-screen filter blur-[128px]" />
          <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-neon-purple/20 rounded-full mix-blend-screen filter blur-[128px]" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
            <div className="flex flex-col gap-8 max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 w-fit">
                <span className="material-symbols-outlined text-neon-cyan text-sm">auto_awesome</span>
                <span className="text-neon-cyan text-xs font-semibold tracking-wide uppercase">AI-Powered Scheduling</span>
              </div>

              {/* Heading */}
              <div className="flex flex-col gap-4">
                <h1 className="text-slate-100 text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                  The Future of Academic <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">Timetable Generation</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl font-normal leading-relaxed max-w-xl">
                  Create conflict-free, optimized timetables in seconds with our intelligent AI scheduling engine.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {mounted && isAuthenticated ? (
                  <Link
                    href={dashboardPath}
                    className="flex items-center justify-center rounded-full bg-gradient-to-r from-neon-cyan to-blue-500 text-white px-[36px] py-[14px] text-[16px] font-semibold shadow-[0_0_20px_rgba(0,245,255,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(0,245,255,0.5)] transition-all active:scale-95"
                  >
                    Access Dashboard
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => setShowInquiryModal(true)}
                      className="flex items-center justify-center rounded-full bg-gradient-to-r from-neon-cyan to-blue-500 text-white px-[36px] py-[14px] text-[16px] font-semibold shadow-[0_0_20px_rgba(0,245,255,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(0,245,255,0.5)] transition-all active:scale-95"
                    >
                      Get Started Free
                    </button>
                    <button
                      onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex items-center justify-center gap-2 rounded-full border border-neon-cyan text-neon-cyan bg-transparent px-[36px] py-[14px] text-[16px] font-medium hover:bg-neon-cyan hover:text-white transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
                    >
                      <span className="material-symbols-outlined text-[20px]">play_circle</span>
                      Watch Demo
                    </button>
                  </>
                )}
              </div>

              {/* Trust bar */}
              <div className="pt-8 border-t border-white/10 flex flex-col gap-3 mt-2">
                <div className="flex flex-wrap gap-6 text-slate-400 text-sm">
                  <span className="flex items-center gap-1.5"><span className="text-neon-cyan">✓</span> 50+ Universities</span>
                  <span className="flex items-center gap-1.5"><span className="text-neon-cyan">✓</span> 500+ Timetables</span>
                  <span className="flex items-center gap-1.5"><span className="text-neon-cyan">✓</span> 99.9% Conflict-Free</span>
                </div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative w-full aspect-[4/3] rounded-2xl bg-white/[0.03] border border-white/10 shadow-2xl p-2 md:p-4 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 z-0" />
              <div className="relative z-10 w-full h-full bg-background-dark rounded-xl border border-white/10 shadow-inner flex flex-col overflow-hidden">
                {/* Dashboard Header */}
                <div className="h-12 border-b border-white/10 flex items-center px-4 justify-between bg-white/[0.03]">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="h-4 w-32 bg-white/10 rounded-full" />
                </div>
                {/* Dashboard Content */}
                <div className="flex-1 p-4 flex gap-4">
                  <div className="w-48 border-r border-white/10 pr-4 hidden sm:flex flex-col gap-3">
                    <div className="h-6 w-full bg-white/10 rounded" />
                    <div className="h-6 w-3/4 bg-white/10 rounded" />
                    <div className="h-6 w-5/6 bg-white/10 rounded" />
                    <div className="mt-auto h-8 w-full bg-neon-cyan/20 rounded" />
                  </div>
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="flex gap-4">
                      <div className="h-24 flex-1 bg-white/[0.03] rounded-lg border border-white/10 flex items-center justify-center">
                        <div className="h-8 w-8 rounded-full bg-neon-cyan/50" />
                      </div>
                      <div className="h-24 flex-1 bg-white/[0.03] rounded-lg border border-white/10 flex items-center justify-center">
                        <div className="h-8 w-8 rounded-full bg-neon-purple/50" />
                      </div>
                    </div>
                    {/* Timetable Grid Mockup */}
                    <div className="flex-1 bg-white/[0.03] rounded-lg border border-white/10 p-2 grid grid-cols-5 gap-2">
                      <div className="bg-neon-cyan/20 rounded col-span-2 row-span-2" />
                      <div className="bg-blue-500/20 rounded col-span-1 row-span-1" />
                      <div className="bg-neon-purple/20 rounded col-span-2 row-span-1" />
                      <div className="bg-emerald-500/20 rounded col-span-1 row-span-3" />
                      <div className="bg-amber-500/20 rounded col-span-2 row-span-2" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 border-2 border-neon-cyan/0 group-hover:border-neon-cyan/30 rounded-2xl transition-all duration-500 z-20 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* Section C: Features Grid */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative">
          <div className="flex flex-col gap-4 text-center mb-16 items-center">
            <h2 className="text-slate-100 text-3xl md:text-4xl font-bold leading-tight">Powerful Features</h2>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl">
              Everything you need for intelligent scheduling
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "auto_awesome", title: "AI Timetable Generation", desc: "Advanced AI generates optimized schedules automatically" },
              { icon: "verified_user", title: "Zero Conflicts", desc: "Guaranteed conflict-free scheduling for all resources" },
              { icon: "tune", title: "Smart Constraints", desc: "Intelligent handling of complex academic requirements" },
              { icon: "account_tree", title: "Multi-Program Support", desc: "Handle multiple programs, divisions, and semesters" },
              { icon: "menu_book", title: "Elective Management", desc: "Smart basket-based elective scheduling with student splits" },
              { icon: "bolt", title: "Resource Optimization", desc: "Maximum utilization of rooms, labs, and time slots" },
              { icon: "calendar_month", title: "Continuous Scheduling", desc: "Gap-free timetables for better student experience" },
              { icon: "sync", title: "Easy Updates", desc: "Flexible partial regeneration without full rebuild" },
            ].map((feature, i) => (
              <div key={i} className="group flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,245,255,0.1)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-lg bg-neon-cyan/10 flex items-center justify-center text-neon-cyan mb-2">
                  <span className="material-symbols-outlined text-[28px]">{feature.icon}</span>
                </div>
                <div>
                  <h3 className="text-slate-100 text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{feature.desc}</p>
                  <button
                    onClick={() => { }}
                    className="flex items-center text-[14px] font-medium text-neon-cyan hover:underline transition-all group/btn"
                  >
                    Learn More
                    <span className="material-symbols-outlined text-[16px] ml-1 transition-transform group-hover/btn:translate-x-1">arrow_right_alt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section D: How It Works */}
        <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-slate-100 text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">A simple process to generate your academic timetable.</p>
          </div>
          <div className="relative flex flex-col gap-0 pl-6 md:pl-0">
            <div className="absolute left-[38px] md:left-1/2 md:-ml-px top-4 bottom-4 w-0.5 bg-white/10" />

            {[
              { icon: "settings", title: "Setup Your Institution", desc: "Configure your university, departments, and programs", active: true },
              { icon: "database", title: "Add Academic Data", desc: "Input subjects, faculty, rooms, and time slots", active: false },
              { icon: "tune", title: "Set Preferences", desc: "Define constraints, electives, and scheduling rules", active: false },
              { icon: "smart_toy", title: "Generate Timetable", desc: "AI creates optimized conflict-free schedule instantly", active: false },
              { icon: "check_circle", title: "Review & Export", desc: "Review, make adjustments, and export your timetable", active: false },
            ].map((step, i) => (
              <div key={i} className="relative flex flex-col md:flex-row items-start md:items-center justify-between mb-12 md:mb-16 group">
                <div className={`md:w-[45%] mb-4 md:mb-0 ${i % 2 === 0 ? 'text-left md:text-right' : 'text-left md:text-left md:order-last'} pl-12 md:pl-0`}>
                  <h3 className="text-xl font-bold text-slate-100 mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.desc}</p>
                </div>
                <div className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full border-4 border-background-dark z-10 ${step.active
                  ? 'bg-neon-cyan text-background-dark shadow-[0_0_15px_rgba(0,245,255,0.5)]'
                  : 'bg-white/[0.03] border-white/10 text-slate-300 group-hover:border-neon-cyan/50 group-hover:text-neon-cyan transition-colors'
                  }`}>
                  <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                </div>
                <div className="md:w-[45%]" />
              </div>
            ))}
          </div>
        </section>

        {/* Section E: Statistics */}
        <section className="py-24 border-y border-white/5 relative w-full">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {[
                { value: "500+", label: "Timetables Generated", color: "text-white" },
                { value: "50+", label: "Universities Trust Us", color: "text-neon-cyan" },
                { value: "1000+", label: "Faculty Managed", color: "text-white" },
                { value: "99.9%", label: "Conflict-Free Rate", color: "text-neon-purple" },
              ].map((stat, i) => (
                <div key={i} className="text-center md:text-left">
                  <div className={`text-4xl font-extrabold ${stat.color} mb-2 tracking-tight`}>{stat.value}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section F: Testimonials */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-slate-100 text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-slate-400 text-lg">Trusted by academic institutions worldwide</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "This platform completely transformed how we create timetables. What used to take weeks now takes minutes.", name: "Dr. Sarah Johnson", role: "Dean of Academics" },
              { quote: "The AI scheduling is incredibly smart. Zero conflicts and optimal resource usage every single time.", name: "Prof. Michael Chen", role: "Department Head" },
              { quote: "Managing electives across multiple batches was a nightmare. Now it's completely automated and accurate.", name: "Dr. Emily Roberts", role: "Academic Coordinator" },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-neon-cyan/30 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,245,255,0.05)]">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="material-symbols-outlined text-neon-cyan text-lg fill-1">star</span>
                  ))}
                </div>
                <p className="text-slate-300 text-base leading-relaxed mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan/30 to-neon-purple/30 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-slate-100 font-bold text-sm">{testimonial.name}</p>
                    <p className="text-slate-500 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section G: CTA */}
        <section className="py-24 px-6 md:px-12">
          <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-neon-cyan/20 via-background-dark to-neon-purple/20 border border-white/10 p-12 md:p-20 text-center relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center gap-8">
              <h2 className="text-slate-100 text-4xl md:text-5xl font-bold leading-tight max-w-2xl">
                Ready to Transform Your Academic Scheduling?
              </h2>
              <p className="text-slate-300 text-lg max-w-xl">
                Join over 50+ universities that have eliminated scheduling conflicts and saved countless administrative hours.
              </p>
              <div className="flex justify-center gap-[16px] flex-wrap mt-4 w-full">
                <button
                  onClick={() => setShowInquiryModal(true)}
                  className="flex items-center justify-center rounded-full bg-gradient-to-r from-neon-cyan to-blue-500 text-white px-[36px] py-[14px] text-[16px] font-semibold shadow-[0_0_20px_rgba(0,245,255,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(0,245,255,0.5)] transition-all active:scale-95"
                >
                  Get Started Free
                </button>
                <Link
                  href="/contact"
                  className="flex items-center justify-center rounded-full border border-neon-cyan text-neon-cyan bg-transparent px-[36px] py-[14px] text-[16px] font-medium hover:bg-neon-cyan hover:text-white transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
                >
                  Schedule Demo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />

      {/* Get Started Inquiry Modal */}
      <GetStartedModal isOpen={showInquiryModal} onClose={() => setShowInquiryModal(false)} />
    </div>
  );
}
