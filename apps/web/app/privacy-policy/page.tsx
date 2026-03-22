import React from 'react';
import { LandingNav } from '@/components/landing-nav';
import { LandingFooter } from '@/components/landing-footer';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col relative overflow-x-hidden pt-20">
            <LandingNav />
            <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-20 relative z-10">
                <h1 className="text-4xl font-black text-white mb-6">Privacy Policy</h1>
                <p className="text-slate-400 text-sm mb-8">Last Updated: March 2026</p>
                <div className="prose prose-invert space-y-6 text-slate-300">
                    <p>SmartCampus OS processes student and administrative data strictly as a sub-processor for educational institutions.</p>
                    <h3 className="text-white font-bold text-lg mt-6">Data Immutability</h3>
                    <p>Academic records securely appended to the verification ledger are cryptographically sealed. We do not store decipherable PII on unauthenticated endpoints.</p>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
