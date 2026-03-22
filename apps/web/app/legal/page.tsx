import React from 'react';
import { LandingNav } from '@/components/landing-nav';
import { LandingFooter } from '@/components/landing-footer';

export default function LegalPage() {
    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col relative overflow-x-hidden pt-20">
            <LandingNav />
            <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-20 relative z-10">
                <h1 className="text-4xl font-black text-white mb-6">Legal Hub</h1>
                <p className="text-slate-400 text-sm mb-8">At SmartCampus OS, we prioritize compliance and transparent operations across jurisdictions.</p>
                <div className="prose prose-invert border-t border-slate-800 pt-8">
                    <p>Information presented in this documentation aligns with enterprise agreements regarding the multi-tenant operation schemas.</p>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
