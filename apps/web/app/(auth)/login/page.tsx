'use client';

import { Suspense, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useSessionStore } from '@/lib/store/useSessionStore';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

function LoginContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { user, login: loginStore, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated && user) {
            const roleRedirects: Record<string, string> = {
                SUPERADMIN: '/superadmin',
                UNI_ADMIN: '/dashboard',
                COLLEGE_ADMIN: '/dashboard',
                DEPT_ADMIN: '/department',
                FACULTY: '/faculty-panel',
                STUDENT: '/student',
                PARENT: '/student'
            };
            const path = roleRedirects[user.role] || '/dashboard';
            router.push(path);
        }
    }, [isAuthenticated, user, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            const response = await api.post('/auth/login', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { user } = response.data;

            if (!user) throw new Error('User data missing');

            useSessionStore.getState().startSession();
            loginStore(user);
        } catch (err: any) {
            setError(err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' ? 'Invalid credentials' : (err.message || 'Login failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const token = await userCredential.user.getIdToken();
            const response = await api.post('/auth/login', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { user } = response.data;
            if (!user) throw new Error('User missing');
            useSessionStore.getState().startSession();
            loginStore(user);
        } catch (err) {
            setError('Google sign-in failed');
        }
    };

    return (
        <div className="min-h-screen flex bg-background text-text-primary font-sans antialiased mesh-gradient">
            {/* Left Column: Branding & Value Prop */}
            <div className="hidden lg:flex w-7/12 flex-col justify-between p-16 relative overflow-hidden border-r border-border">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />
                </div>

                <Link href="/" className="z-10 flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(99,102,241,0.1)] group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-primary text-3xl">hub</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white text-2xl font-bold font-space-grotesk tracking-tight">SmartCampus OS</span>
                        <span className="text-secondary text-[10px] font-bold tracking-[0.3em] uppercase mt-1">User Gateway</span>
                    </div>
                </Link>

                <div className="z-10 max-w-xl">
                    <h2 className="text-5xl md:text-6xl font-bold font-space-grotesk leading-tight tracking-tight mb-8">
                        The Operating <br />System for <span className="gradient-text">Excellence</span>
                    </h2>
                    <p className="text-text-muted text-xl leading-relaxed mb-12">
                        Enter the core of your academic ecosystem. Manage, automate, and drive innovation with the power of SmartCampus OS.
                    </p>

                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Security</span>
                            <span className="text-white font-medium">Enterprise Grade</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Infrastructure</span>
                            <span className="text-white font-medium">99.9% Reliable</span>
                        </div>
                    </div>
                </div>

                <div className="z-10 flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Secure Socket Layer Enabled</span>
                    <div className="flex gap-4">
                        <span className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_8px_#10b981]" />
                        <span className="w-2 h-2 rounded-full bg-primary/40" />
                        <span className="w-2 h-2 rounded-full bg-secondary/40" />
                    </div>
                </div>
            </div>

            {/* Right Column: Auth Forms */}
            <div className="w-full lg:w-5/12 flex flex-col items-center justify-center p-8 md:p-16 relative">
                <Link href="/" className="absolute top-8 left-8 lg:left-auto lg:right-16 flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm font-bold group">
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>
                    Return Home
                </Link>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md glass-morphism rounded-[40px] p-8 md:p-12 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-primary to-neon-purple opacity-30" />

                    <div className="text-center mb-6">
                        <h3 className="text-4xl font-black font-space-grotesk mb-3 tracking-normal">
                            User <span className="text-neon-cyan">Login</span>
                        </h3>
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-[0.2em]">
                            Authorized Access Only
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-widest flex items-center gap-4 animate-shake">
                            <span className="material-symbols-outlined text-lg">security</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">

                        <div className="space-y-2.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-300 ml-1">Institutional Email</label>
                            <div className="relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary group-focus-within:text-neon-cyan transition-colors text-xl">alternate_email</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@university.edu"
                                    className="w-full bg-white/5 border border-border-hover rounded-2xl py-5 pl-14 pr-6 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan/50 focus:bg-surface-hover transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-300 ml-1">Access Key</label>
                            <div className="relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary group-focus-within:text-neon-cyan transition-colors text-xl">lock</span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-border-hover rounded-2xl py-5 pl-14 pr-14 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan/50 focus:bg-surface-hover transition-all font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-neon-cyan to-primary text-slate-900 rounded-2xl py-5 font-black text-base uppercase tracking-widest shadow-[0_0_30px_rgba(57,193,239,0.3)] hover:shadow-[0_0_40px_rgba(57,193,239,0.5)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                            ) : (
                                <>
                                    Authorize Identity
                                    <span className="material-symbols-outlined font-bold">verified_user</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 relative text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5" />
                        </div>
                        <span className="relative px-4 py-1.5 bg-slate-900/60 rounded-full border border-white/5 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400 backdrop-blur-md">Secure Federated Access</span>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleGoogleSignIn}
                            className="w-full flex items-center justify-center gap-4 bg-white/5 border border-white/5 rounded-2xl py-5 hover:bg-white/10 transition-all group"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
                                <path fill="#FBBC05" d="M16.03 18.232c-1.205.764-2.65 1.233-4.03 1.233-2.859 0-5.29-1.93-6.16-4.534L1.241 18.15c1.958 3.952 6.03 6.65 10.759 6.65 2.95 0 5.736-1.045 7.734-2.853l-3.705-2.715Z" />
                                <path fill="#4285F4" d="M22.56 12.25c0-.782-.07-1.536-.2-2.25H12v4.26h5.92c-.264 1.373-1.04 2.532-2.213 3.314l3.705 2.715c2.082-1.92 3.282-4.736 3.282-8.09Z" />
                                <path fill="#34A853" d="M5.84 14.093c-.218-.664-.345-1.36-.345-2.093s.127-1.429.345-2.093L1.815 6.792c-.818 1.636-1.282 3.473-1.282 5.408s.464 3.772 1.282 5.408l4.025-3.515Z" />
                            </svg>
                            <span className="text-xs font-black uppercase tracking-widest">Connect with Google</span>
                        </button>
                    </div>

                </motion.div>

                <p className="mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest">SmartCampus Enterprise Security Protocol</p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
