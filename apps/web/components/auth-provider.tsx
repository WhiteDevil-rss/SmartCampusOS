'use client';

import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { api } from '@/lib/api';
import { LuShieldAlert } from 'react-icons/lu';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { login, logout, setHasHydrated, backendError, setBackendError } = useAuthStore();

    useEffect(() => {
        // Firebase auth state listener
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    console.log('AuthProvider: Firebase user detected:', firebaseUser.email);
                    // Fetch user details from backend using the Firebase token
                    const response = await api.get('/auth/me');
                    console.log('AuthProvider: Backend sync successful');

                    if (response.data) {
                        login(response.data);
                        setBackendError(null);
                    } else {
                        console.warn('AuthProvider: No user data in backend response');
                        logout();
                    }
                } else {
                    console.log('AuthProvider: No firebase user found');
                    logout();
                    setBackendError(null);
                }
            } catch (error: any) {
                // Silence handled network/server/auth errors in the console to avoid clutter
                if (error.message === 'Network Error' || error.response?.status === 401 || error.response?.status >= 500) {
                    console.warn(`AuthProvider: Backend sync paused - ${error.message}${error.response?.status ? ` (${error.response.status})` : ''}`);
                } else {
                    console.error('Failed to fetch user details from backend:', error);
                }
                
                // If it's a network error (no response), api.ts interceptor will already set backendError
                // But for extra safety or other 5xx errors:
                if (error.response?.status >= 500) {
                    setBackendError('SERVER_ERROR');
                }
                
                logout();
            } finally {
                // Mark hydration and readiness AFTER the check is done
                setHasHydrated(true);
                useAuthStore.getState().setAuthReady(true);
            }
        });

        return () => unsubscribe();
    }, [login, logout, setHasHydrated, setBackendError]);

    if (backendError === 'NETWORK_ERROR' || backendError === 'SERVER_ERROR') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 selection:bg-rose-500/30">
                <div className="max-w-md w-full space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="relative mx-auto w-24 h-24">
                        <div className="absolute inset-0 bg-rose-500/20 blur-2xl rounded-full animate-pulse" />
                        <div className="relative bg-slate-900 border border-rose-500/30 w-full h-full rounded-3xl flex items-center justify-center shadow-2xl">
                            <LuShieldAlert className="w-12 h-12 text-rose-500 animate-bounce" />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-white tracking-tighter">Campus Services Offline</h1>
                        <p className="text-slate-400 font-medium leading-relaxed">
                            {backendError === 'NETWORK_ERROR' 
                                ? "We're unable to connect to the core university ledgers. This usually means the API node is undergoing maintenance or your connection is unstable."
                                : "The central server encountered a critical fault. Our engineers have been notified and are working on a resolution."}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => window.location.reload()}
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Retry Connection
                        </button>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Error Code: {backendError}</p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
