import React, { useState } from "react";
import Link from "next/link";

export function LandingFooter() {
    return (
        <footer className="border-t border-white/10 bg-background-dark pt-16 pb-8 px-6 md:px-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-slate-100 mb-2">
                        <div className="w-5 h-5 text-neon-cyan">
                            <span className="material-symbols-outlined text-[24px]">schedule</span>
                        </div>
                        <h2 className="text-slate-100 text-xl font-bold font-heading">Zembaa</h2>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-4">
                        AI-powered academic timetable generation for modern universities.
                    </p>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                            if (email) alert('Subscribed: ' + email);
                        }}
                        className="flex items-center gap-2"
                    >
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            className="bg-surface-dark/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 h-10 w-full max-w-[200px]"
                            required
                        />
                        <button
                            type="submit"
                            className="flex items-center justify-center h-10 px-4 rounded-lg bg-gradient-to-r from-neon-cyan to-blue-500 text-background-dark font-bold text-sm shadow-[0_0_15px_rgba(0,245,255,0.3)] hover:shadow-[0_0_25px_rgba(0,245,255,0.5)] transition-all shrink-0 active:scale-95"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
                <div className="flex flex-col gap-4">
                    <h3 className="text-slate-100 font-semibold mb-2">Product</h3>
                    <Link className="text-slate-400 hover:text-neon-cyan text-sm transition-colors" href="/platform">Features</Link>
                    <Link className="text-slate-400 hover:text-neon-cyan text-sm transition-colors" href="/platform">Platform</Link>
                    <Link className="text-slate-400 hover:text-neon-cyan text-sm transition-colors" href="/solutions">Solutions</Link>
                </div>
                <div className="flex flex-col gap-4">
                    <h3 className="text-slate-100 font-semibold mb-2">Company</h3>
                    <a className="text-slate-400 hover:text-neon-cyan text-sm transition-colors" href="#">About Us</a>
                    <a className="text-slate-400 hover:text-neon-cyan text-sm transition-colors" href="#">Careers</a>
                    <a className="text-slate-400 hover:text-neon-cyan text-sm transition-colors" href="#">Contact</a>
                </div>
                <div className="flex flex-col gap-4">
                    <h3 className="text-slate-100 font-semibold mb-2">Legal</h3>
                    <a className="text-slate-400 hover:text-neon-cyan text-sm transition-colors" href="#">Privacy Policy</a>
                    <a className="text-slate-400 hover:text-neon-cyan text-sm transition-colors" href="#">Terms of Service</a>
                    <Link className="text-slate-400 hover:text-neon-cyan text-sm transition-colors" href="/security">Security</Link>
                </div>
            </div>
            <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Zembaa Inc. All rights reserved.</p>
                <div className="flex items-center gap-3">
                    <button onClick={() => window.open('https://twitter.com', '_blank')} className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 hover:border-neon-cyan/50 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all active:scale-95">
                        <span className="material-symbols-outlined text-[20px]">public</span> {/* Using generic public icon for twitter placeholder */}
                    </button>
                    <button onClick={() => window.open('https://linkedin.com', '_blank')} className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 hover:border-neon-cyan/50 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all active:scale-95">
                        <span className="material-symbols-outlined text-[20px]">work</span>
                    </button>
                    <button onClick={() => window.open('https://github.com', '_blank')} className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 hover:border-neon-cyan/50 hover:bg-neon-cyan/10 text-slate-400 hover:text-neon-cyan transition-all active:scale-95">
                        <span className="material-symbols-outlined text-[20px]">code</span>
                    </button>
                </div>
            </div>
        </footer>
    );
}
