import React from 'react';
import { LandingNav } from '@/components/landing-nav';
import { LandingFooter } from '@/components/landing-footer';

export default function AboutUsPage() {
    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col relative overflow-x-hidden pt-20">
            <LandingNav />
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none z-0" />
            <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-20 relative z-10 text-center">
                <h1 className="text-5xl font-black text-white mb-6">About SmartCampus OS</h1>
                <p className="text-slate-400 text-lg leading-relaxed">
                    We are building the foundational primitives for academic data infrastructure. We believe in replacing outdated, siloed ERP systems with connected, verifiable software ecosystems that put data integrity first.
                </p>
            </main>
            <LandingFooter />
        </div>
    );
}
