import React from 'react';
import { LandingNav } from '@/components/landing-nav';
import { LandingFooter } from '@/components/landing-footer';

export default function SolutionsPage() {
    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col relative overflow-x-hidden pt-20">
            <LandingNav />
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none z-0" />
            <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-20 relative z-10">
                <h1 className="text-5xl font-black text-white mb-6">Scalable Software Solutions</h1>
                <p className="text-slate-400 text-lg mb-12">Engineered for university systems to handle zero-downtime admission cycles and cryptographically verified student records.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 glass-morphism rounded-3xl border border-slate-700/50 bg-slate-900/40">
                        <h3 className="text-2xl font-bold text-white mb-4">Admissions SaaS</h3>
                        <p className="text-slate-400">Streamline thousands of concurrent inquiries and applications globally without database lockups.</p>
                    </div>
                    <div className="p-8 glass-morphism rounded-3xl border border-slate-700/50 bg-slate-900/40">
                        <h3 className="text-2xl font-bold text-white mb-4">Verification Ledger</h3>
                        <p className="text-slate-400">Distribute unique hashes tied directly to finalized student payloads ensuring data immutability.</p>
                    </div>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
