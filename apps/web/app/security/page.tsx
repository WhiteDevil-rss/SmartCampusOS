import React from 'react';
import { LandingNav } from '@/components/landing-nav';
import { LandingFooter } from '@/components/landing-footer';

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col relative overflow-x-hidden pt-20">
            <LandingNav />
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen pointer-events-none z-0" />
            <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-20 relative z-10">
                <div className="inline-flex px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase rounded-full mb-6">Trust Center</div>
                <h1 className="text-5xl font-black text-text-primary mb-6">Security Architecture</h1>
                <p className="text-text-secondary text-lg mb-8">
                    SmartCampus OS employs cryptographic hashes and distributed nodes to ensure end-to-end immutability of both student admission documents and final academic results.
                </p>
                <div className="space-y-6">
                    <div className="p-6 bg-card backdrop-blur-xl border border-border rounded-xl">
                        <h4 className="text-text-primary font-bold mb-2">Cryptographic Verification</h4>
                        <p className="text-text-secondary text-sm">Every admission record yields a secure token validating uniqueness and ensuring anti-tampering during transit.</p>
                    </div>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
