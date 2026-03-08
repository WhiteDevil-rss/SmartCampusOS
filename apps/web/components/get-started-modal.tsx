'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LuX, LuLoader, LuCircleCheck, LuCircleAlert, LuMail } from 'react-icons/lu';
import { api } from '@/lib/api';

interface GetStartedModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function GetStartedModal({ isOpen, onClose }: GetStartedModalProps) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [org, setOrg] = useState('');
    const [touched, setTouched] = useState(false);
    const [status, setStatus] = useState<SubmitStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [spamLock, setSpamLock] = useState(false);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const emailError = !email.trim() ? 'Email is required.' : (!EMAIL_RE.test(email.trim()) ? 'Enter a valid email address.' : '');
    const nameError = !name.trim() ? 'Full Name is required.' : '';
    const isValid = !emailError && !nameError;

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && status !== 'loading') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, status, onClose]);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setEmail('');
            setName('');
            setPhone('');
            setOrg('');
            setTouched(false);
            setStatus('idle');
            setErrorMessage('');
        }
        return () => {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        };
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);
        if (!isValid || spamLock) return;

        setStatus('loading');
        setErrorMessage('');

        try {
            await api.post('/inquiries', {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                contactNumber: phone.trim() || null,
                organization: org.trim() || null,
                message: 'Initial system inquiry via Get Started modal.',
                source: 'get_started_modal'
            });

            setStatus('success');
            setSpamLock(true);

            // Auto-close after 3s
            closeTimerRef.current = setTimeout(() => {
                onClose();
                setStatus('idle');
                setSpamLock(false);
            }, 3000);
        } catch (err: unknown) {
            setStatus('error');
            setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
        >
            {/* Dim overlay */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={status !== 'loading' ? onClose : undefined}
            />

            {/* Modal card */}
            <div className="relative z-10 w-full max-w-lg bg-[#0d0f14] border border-border-hover rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                {/* Glow accents */}
                <div className="absolute top-[-30%] right-[-20%] w-[50%] h-[50%] bg-neon-cyan/15 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-neon-purple/15 blur-[80px] rounded-full pointer-events-none" />

                {/* Header */}
                <div className="relative flex items-center justify-between px-10 pt-10 pb-2">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                            <LuMail className="w-6 h-6 text-neon-cyan" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Get Started</h2>
                            <p className="text-xs text-text-secondary font-medium uppercase tracking-[0.1em]">Join our exclusive network</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={status === 'loading'}
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-surface-hover border border-border-hover flex items-center justify-center text-text-muted hover:text-white transition-all disabled:opacity-50"
                        aria-label="Close modal"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                {status === 'success' ? (
                    // ── Success State ──
                    <div className="relative flex flex-col items-center justify-center gap-6 px-10 py-20 text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <LuCircleCheck className="w-10 h-10 text-emerald-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-white">Inquiry Received!</h3>
                            <p className="text-text-muted text-sm max-w-xs mx-auto">
                                Our institutional experts will review your request and contact you within the next 12 hours.
                            </p>
                        </div>
                    </div>
                ) : (
                    // ── Form ──
                    <form onSubmit={handleSubmit} noValidate className="relative px-10 pt-4 pb-10 space-y-6">

                        {/* Error banner */}
                        {status === 'error' && (
                            <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-5 py-3">
                                <LuCircleAlert className="w-4 h-4 text-rose-400 shrink-0" />
                                <p className="text-rose-300 text-xs font-semibold">{errorMessage}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-0.5">
                                    Full Name <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Lead Administrator"
                                    className={`w-full h-12 rounded-xl bg-white/5 border px-4 text-sm text-white font-medium placeholder-slate-600 outline-none transition-all focus:ring-1
                                    ${touched && nameError
                                            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20'
                                            : 'border-border-hover focus:border-neon-cyan/50 focus:ring-neon-cyan/10'
                                        }`}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-0.5">
                                    Official Email <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@univ.edu"
                                    className={`w-full h-12 rounded-xl bg-white/5 border px-4 text-sm text-white font-medium placeholder-slate-600 outline-none transition-all focus:ring-1
                                    ${touched && emailError
                                            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20'
                                            : 'border-border-hover focus:border-neon-cyan/50 focus:ring-neon-cyan/10'
                                        }`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-0.5">
                                    Phone Number
                                </label>
                                <input
                                    name="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full h-12 rounded-xl bg-white/5 border border-border-hover px-4 text-sm text-white font-medium placeholder-slate-600 outline-none transition-all focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/10"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-0.5">
                                    Organization
                                </label>
                                <input
                                    name="org"
                                    type="text"
                                    value={org}
                                    onChange={(e) => setOrg(e.target.value)}
                                    placeholder="University / Institute"
                                    className="w-full h-12 rounded-xl bg-white/5 border border-border-hover px-4 text-sm text-white font-medium placeholder-slate-600 outline-none transition-all focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/10"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!isValid || status === 'loading' || spamLock}
                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-neon-cyan to-blue-500 text-slate-900 text-base font-black tracking-wider
                                shadow-[0_0_20px_rgba(57,193,239,0.3)] hover:shadow-[0_0_30px_rgba(57,193,239,0.5)]
                                disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                                transition-all flex items-center justify-center gap-3 mt-4"
                        >
                            {status === 'loading' ? (
                                <>
                                    <LuLoader className="w-5 h-5 animate-spin" />
                                    Transmitting...
                                </>
                            ) : (
                                <>
                                    Dispatch Inquiry
                                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
