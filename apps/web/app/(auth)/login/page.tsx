'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useSessionStore } from '@/lib/store/useSessionStore';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, 
    Lock, 
    ArrowLeft, 
    ArrowRight, 
    User, 
    School, 
    Building2, 
    Eye, 
    EyeOff, 
    Loader2, 
    Mail, 
    Key, 
    Fingerprint,
    CheckCircle2,
    Activity
} from 'lucide-react';
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { cn } from '@/lib/utils';

type AuthType = 'student' | 'faculty' | null;
type AuthMode = 'login' | 'register';

function AuthContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [authType, setAuthType] = useState<AuthType>(null);
    const [mode, setMode] = useState<AuthMode>(searchParams.get('tab') === 'register' ? 'register' : 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
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
            router.push(roleRedirects[user.role] || '/dashboard');
        }
    }, [isAuthenticated, user, router]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            let userCredential;
            if (mode === 'register') {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // After Firebase registration, we'd typically hit /auth/register to sync DB
                const token = await userCredential.user.getIdToken();
                const response = await api.post('/auth/register', { 
                    name: fullName,
                    role: authType === 'student' ? 'STUDENT' : 'FACULTY'
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                loginStore(response.data.user);
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
                const token = await userCredential.user.getIdToken();
                const response = await api.post('/auth/login', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                loginStore(response.data.user);
            }
            useSessionStore.getState().startSession();
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
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
            loginStore(response.data.user);
            useSessionStore.getState().startSession();
        } catch (err) {
            setError('Google sign-in failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020817] flex flex-col font-sans overflow-hidden">
            {/* Background Animations */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            {/* Top Bar */}
            <header className="relative z-50 p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
                <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-black font-space-grotesk tracking-tight text-slate-800 dark:text-white">SmartOS</span>
                </Link>
                <Link href="/" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Return Home
                </Link>
            </header>

            <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-6 pb-24">
                <AnimatePresence mode="wait">
                    {!authType ? (
                        <motion.div
                            key="selector"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            <div className="md:col-span-2 text-center mb-12">
                                <h1 className="text-4xl md:text-6xl font-black font-space-grotesk tracking-tight mb-4">Choose Your <span className="text-primary italic">Entry Point</span></h1>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Verify your role to access the institutional ledger</p>
                            </div>

                            <button 
                                onClick={() => setAuthType('faculty')}
                                className="group relative"
                            >
                                <GlassCard className="rounded-[3rem] p-12 text-center border-2 border-slate-100 dark:border-white/10 group-hover:border-primary transition-all duration-500 h-full">
                                    <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 mx-auto mb-10 group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-110 transition-all duration-500">
                                        <Building2 className="w-12 h-12" />
                                    </div>
                                    <h3 className="text-3xl font-black mb-4 font-space-grotesk">Institutional</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 text-sm">Faculty, Program Heads, and Administrative Staff</p>
                                    <div className="text-primary font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Initialize Node <ArrowRight className="inline w-3 h-3 ml-1" /></div>
                                </GlassCard>
                            </button>

                            <button 
                                onClick={() => setAuthType('student')}
                                className="group relative"
                            >
                                <GlassCard className="rounded-[3rem] p-12 text-center border-2 border-slate-100 dark:border-white/10 group-hover:border-primary transition-all duration-500 h-full">
                                    <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 mx-auto mb-10 group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-110 transition-all duration-500">
                                        <School className="w-12 h-12" />
                                    </div>
                                    <h3 className="text-3xl font-black mb-4 font-space-grotesk">Academic</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 text-sm">Undergraduates, Graduates, and Parental Observers</p>
                                    <div className="text-primary font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Access Records <ArrowRight className="inline w-3 h-3 ml-1" /></div>
                                </GlassCard>
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full max-w-lg"
                        >
                            <button 
                                onClick={() => setAuthType(null)}
                                className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group"
                            >
                                <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" /> Switch Role ({authType})
                            </button>

                            <GlassCard className="rounded-[3rem] px-8 py-12 md:p-16 border-2 border-primary/20 bg-primary/5">
                                <div className="text-center mb-10">
                                    <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 animate-pulse">
                                        <Fingerprint className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-3xl font-black font-space-grotesk mb-2 capitalize">{mode} As {authType}</h2>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Authorized Identity Verification</p>
                                </div>

                                {error && (
                                    <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                                        <ShieldCheck className="w-4 h-4 shrink-0" /> {error}
                                    </div>
                                )}

                                <form onSubmit={handleAuth} className="space-y-6">
                                    {mode === 'register' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Legal Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                                <input 
                                                    type="text"
                                                    required
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Identifier</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <input 
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all outline-none"
                                                placeholder={authType === 'student' ? 'name@student.edu' : 'name@inst.edu'}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Secret Key</label>
                                        <div className="relative group">
                                            <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <input 
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all outline-none"
                                                placeholder="••••••••"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-5 rounded-2xl bg-primary text-white font-black uppercase font-space-grotesk tracking-widest text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                {mode === 'login' ? 'Validate Access' : 'Create Identity'} 
                                                <CheckCircle2 className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-10 relative">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-white/10" /></div>
                                    <div className="relative flex justify-center"><span className="px-4 bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400">Federated Auth</span></div>
                                </div>

                                <button 
                                    onClick={handleGoogleSignIn}
                                    className="mt-8 w-full py-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center gap-4 hover:bg-slate-50 dark:hover:bg-white/10 transition-all group"
                                >
                                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                        <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
                                        <path fill="#FBBC05" d="M16.03 18.232c-1.205.764-2.65 1.233-4.03 1.233-2.859 0-5.29-1.93-6.16-4.534L1.241 18.15c1.958 3.952 6.03 6.65 10.759 6.65 2.95 0 5.736-1.045 7.734-2.853l-3.705-2.715Z" />
                                        <path fill="#4285F4" d="M22.56 12.25c0-.782-.07-1.536-.2-2.25H12v4.26h5.92c-.264 1.373-1.04 2.532-2.213 3.314l3.705 2.715c2.082-1.92 3.282-4.736 3.282-8.09Z" />
                                        <path fill="#34A853" d="M5.84 14.093c-.218-.664-.345-1.36-.345-2.093s.127-1.429.345-2.093L1.815 6.792c-.818 1.636-1.282 3.473-1.282 5.408s.464 3.772 1.282 5.408l4.025-3.515Z" />
                                    </svg>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Identity Provider (Google)</span>
                                </button>

                                <div className="mt-10 text-center">
                                    <button 
                                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all"
                                    >
                                        {mode === 'login' ? "New here? Create Identity" : "Already verified? Enter Gateway"}
                                    </button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020817]">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        }>
            <AuthContent />
        </Suspense>
    );
}
