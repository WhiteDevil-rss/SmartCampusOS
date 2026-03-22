import React from 'react';
import { LandingNav } from '@/components/landing-nav';
import { LandingFooter } from '@/components/landing-footer';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col relative overflow-x-hidden pt-20">
            <LandingNav />
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none z-0" />
            <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-20 relative z-10">
                <h1 className="text-5xl font-black text-white mb-6">Contact Us</h1>
                <p className="text-slate-400 text-lg mb-12">
                    Have any questions regarding our enterprise deployments, node architecture, or partnership opportunities? Reach out.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="p-8 border border-slate-800 rounded-3xl bg-slate-900/50">
                        <h3 className="text-xl font-bold text-white mb-2">Enterprise Sales</h3>
                        <p className="text-slate-400">sales@smartcampus-os.com</p>
                    </div>
                    <div className="p-8 border border-slate-800 rounded-3xl bg-slate-900/50">
                        <h3 className="text-xl font-bold text-white mb-2">Technical Support</h3>
                        <p className="text-slate-400">support@smartcampus-os.com</p>
                    </div>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
