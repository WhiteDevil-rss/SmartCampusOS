'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { GetStartedModal } from "@/components/get-started-modal";
import { LandingNav } from "@/components/landing-nav";
import { LandingFooter } from "@/components/landing-footer";
import { motion } from "framer-motion";

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

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary relative overflow-x-hidden flex flex-col font-sans selection:bg-primary/30 antialiased mesh-gradient">
      <LandingNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeIn}
              className="flex flex-col gap-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10 w-fit backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-primary text-xs font-bold tracking-wider uppercase">V1.0 Now Live</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold font-space-grotesk leading-[1.05] tracking-tight">
                The AI-Powered <br />
                <span className="gradient-text">University OS</span>
              </h1>

              <p className="text-text-muted text-lg md:text-xl font-normal leading-relaxed max-w-xl">
                Experience the next generation of academic management. A unified platform integrating AI, Blockchain, and IoT for the modern campus.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                {mounted && isAuthenticated ? (
                  <Link
                    href={dashboardPath}
                    className="glow-button flex items-center justify-center rounded-full bg-primary text-white px-10 py-4 text-base font-bold transition-all hover:scale-105 active:scale-95"
                  >
                    Launch Platform
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => setShowInquiryModal(true)}
                      className="glow-button flex items-center justify-center rounded-full bg-primary text-white px-10 py-4 text-base font-bold transition-all hover:scale-105 active:scale-95"
                    >
                      Initialize System
                    </button>
                    <button
                      onClick={() => document.getElementById('ecosystem')?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex items-center justify-center gap-2 rounded-full border border-border-hover bg-white/5 backdrop-blur-md text-white px-10 py-4 text-base font-medium hover:bg-surface-hover transition-all transition-all"
                    >
                      Explore Ecosystem
                    </button>
                  </>
                )}
              </div>

              <div className="pt-10 flex items-center gap-8 border-t border-border mt-4">
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold font-space-grotesk">50+</span>
                  <span className="text-xxs uppercase tracking-widest text-text-secondary font-bold">Institutions</span>
                </div>
                <div className="w-px h-10 bg-white/5" />
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold font-space-grotesk">10k+</span>
                  <span className="text-xxs uppercase tracking-widest text-text-secondary font-bold">Users</span>
                </div>
                <div className="w-px h-10 bg-white/5" />
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold font-space-grotesk">99.9%</span>
                  <span className="text-xxs uppercase tracking-widest text-text-secondary font-bold">Uptime</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl opacity-30 animate-pulse" />
              <div className="relative glass-morphism rounded-3xl p-4 md:p-8 aspect-video overflow-hidden border border-border-hover">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                {/* Dashboard Mockup Representation */}
                <div className="flex flex-col h-full gap-4">
                  <div className="h-4 w-32 bg-surface-hover rounded-full mb-4" />
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="h-24 glass-effect rounded-2xl flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">analytics</span>
                      </div>
                    </div>
                    <div className="h-24 glass-effect rounded-2xl flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-secondary">verified</span>
                      </div>
                    </div>
                    <div className="h-24 glass-effect rounded-2xl flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-accent-green/20 border border-accent-green/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-accent-green">sensors</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 glass-effect rounded-2xl p-6 relative overflow-hidden">
                    <div className="flex flex-col gap-4">
                      <div className="h-4 w-1/2 bg-surface-hover rounded-full" />
                      <div className="h-2 w-full bg-white/5 rounded-full" />
                      <div className="h-2 w-5/6 bg-white/5 rounded-full" />
                      <div className="h-32 mt-4 glass-morphism rounded-xl border border-border" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Ecosystem Section */}
        <section id="ecosystem" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative overflow-hidden">
          <div className="flex flex-col gap-4 text-center mb-20 items-center">
            <h2 className="text-4xl md:text-5xl font-bold font-space-grotesk tracking-tight">The 7-Module Ecosystem</h2>
            <p className="text-text-muted text-lg max-w-2xl">
              A comprehensive suite of interconnected modules designed to automate and enhance every aspect of university life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "psychology",
                title: "AI Doubts Assistant",
                desc: "Real-time AI support for students to resolve academic queries instantly.",
                color: "from-indigo-500/20 to-violet-500/20",
                accent: "indigo"
              },
              {
                icon: "verified",
                title: "Blockchain Vault",
                desc: "Immutable academic results and certificate verification system.",
                color: "from-blue-500/20 to-cyan-500/20",
                accent: "blue"
              },
              {
                icon: "sensors",
                title: "IoT Campus Presence",
                desc: "Automated attendance tracking via Bluetooth and IoT proximity sensors.",
                color: "from-emerald-500/20 to-teal-500/20",
                accent: "emerald"
              },
              {
                icon: "trending_up",
                title: "Predictive Analytics",
                desc: "AI engines that forecast student performance and attrition risks.",
                color: "from-orange-500/20 to-rose-500/20",
                accent: "orange"
              },
              {
                icon: "auto_awesome",
                title: "Smart Scheduler",
                desc: "Conflict-free, intelligent timetable generation for entire departments.",
                color: "from-fuchsia-500/20 to-pink-500/20",
                accent: "fuchsia"
              },
              {
                icon: "account_balance_wallet",
                title: "Financial Engine",
                desc: "Unified fee management, scholarships, and digital payment tracking.",
                color: "from-amber-500/20 to-yellow-500/20",
                accent: "amber"
              }
            ].map((module, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className={`group relative glass-morphism p-8 rounded-3xl overflow-hidden border border-border hover:border-white/20 transition-all duration-500`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl glass-effect flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <span className="material-symbols-outlined text-3xl">{module.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 font-space-grotesk">{module.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{module.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto rounded-[48px] glass-morphism p-12 md:p-24 text-center relative overflow-hidden border border-border-hover group">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-colors duration-700" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] group-hover:bg-secondary/20 transition-colors duration-700" />

            <div className="relative z-10 flex flex-col items-center gap-10">
              <h2 className="text-4xl md:text-6xl font-bold font-space-grotesk tracking-tighter leading-tight">
                Step into the Future <br /> of <span className="gradient-text">Academic Management</span>
              </h2>
              <p className="text-slate-300 text-lg md:text-xl max-w-2xl leading-relaxed">
                Join the elite circle of institutions leveraging SmartCampus OS to drive academic excellence and administrative efficiency.
              </p>
              <button
                onClick={() => setShowInquiryModal(true)}
                className="glow-button flex items-center justify-center rounded-full bg-white text-background px-12 py-5 text-lg font-bold transition-all hover:scale-105 active:scale-95"
              >
                Deploy SmartCampus OS
              </button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
      <GetStartedModal isOpen={showInquiryModal} onClose={() => setShowInquiryModal(false)} />
    </div>
  );
}
