import React from 'react';
import { LandingNav } from '@/components/landing-nav';
import { LandingFooter } from '@/components/landing-footer';

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col relative overflow-x-hidden pt-20">
            <LandingNav />
            <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-20 relative z-10">
                <h1 className="text-4xl font-black text-white mb-6">Terms of Service</h1>
                <p className="text-slate-400 text-sm mb-8">Accessing the SmartCampus Operating System constitutes agreement to these terms.</p>
                <div className="prose prose-invert space-y-6 text-slate-300">
                    <h3 className="text-white font-bold text-lg mt-6">1. Usage Rights</h3>
                    <p>Institutions are granted a non-exclusive license to operate the multi-tenant architecture under their designated namespaces.</p>
                    <h3 className="text-white font-bold text-lg mt-6">2. Uptime Guarantees</h3>
                    <p>API endpoints, including the Verification Engine, are maintained under strict SLA tolerances.</p>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
