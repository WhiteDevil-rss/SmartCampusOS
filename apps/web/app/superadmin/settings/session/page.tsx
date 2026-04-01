'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { GlassCard } from '@/components/ui/glass-card';
import { ShieldCheck, Clock, AlertTriangle, Save, Loader2, ShieldQuestion } from 'lucide-react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SUPERADMIN_NAV } from '@/lib/constants/nav-config';
import { SuperAdminPageHeader } from '@/components/superadmin/page-header';
import { Button } from '@/components/ui/button';

interface SessionSettings {
    sessionTimeout: number;
    sessionWarningMinutes: number;
    maxFailedAttempts: number;
    lockoutDuration: number;
}

export default function SessionSettingsPage() {
    const [settings, setSettings] = useState<SessionSettings>({
        sessionTimeout: 10,
        sessionWarningMinutes: 2,
        maxFailedAttempts: 5,
        lockoutDuration: 15,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/auth/settings/session');
                if (response.data?.success) {
                    setSettings(response.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch session settings', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            const response = await api.patch('/auth/settings/session', settings);
            if (response.data?.success) {
                setMessage({ type: 'success', text: 'Security policies updated successfully.' });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save settings.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                <DashboardLayout navItems={SUPERADMIN_NAV} title="Session Policy">
                    <div className="flex min-h-[60vh] items-center justify-center">
                        <Loader2 className="size-10 animate-spin text-primary" />
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <DashboardLayout navItems={SUPERADMIN_NAV} title="Session Policy">
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <SuperAdminPageHeader
                        eyebrow="Security infrastructure"
                        title="Session and lockout policy"
                        description="Control inactivity windows, warning thresholds, and account lock rules from one consistent security surface."
                        icon={<ShieldCheck className="h-6 w-6" />}
                        actions={
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="h-11 rounded-2xl px-5 font-bold"
                            >
                                {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                                Apply policy
                            </Button>
                        }
                        stats={[
                            { label: 'Session timeout', value: `${settings.sessionTimeout}m` },
                            { label: 'Warning window', value: `${settings.sessionWarningMinutes}m` },
                            { label: 'Lockout rule', value: `${settings.maxFailedAttempts} attempts` },
                        ]}
                    />

                    {message && (
                        <div className={`p-4 rounded-2xl border font-bold text-sm animate-in fade-in zoom-in-95 ${
                            message.type === 'success' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' 
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <GlassCard className="p-8 space-y-6 border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5 rounded-[2rem]">
                            <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <Clock className="size-6" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-xl font-black font-space-grotesk">Session Longevity</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                                    Determines how long an authenticated identity remains valid without activity.
                                </p>
                                
                                <div className="space-y-6 pt-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                                            <span>Timeout Duration</span>
                                            <span className="text-primary">{settings.sessionTimeout} Minutes</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="5"
                                            max="120"
                                            step="5"
                                            value={settings.sessionTimeout}
                                            onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                                            className="w-full accent-primary bg-slate-200 dark:bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                                            <span>Pre-expiry Warning</span>
                                            <span className="text-amber-500">{settings.sessionWarningMinutes} Minutes</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={settings.sessionWarningMinutes}
                                            onChange={(e) => setSettings({ ...settings, sessionWarningMinutes: parseInt(e.target.value) })}
                                            className="w-full accent-amber-500 bg-slate-200 dark:bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-8 space-y-6 border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5 rounded-[2rem]">
                            <div className="size-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                <AlertTriangle className="size-6" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-xl font-black font-space-grotesk">Lockout Thresholds</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                                    Adaptive protection against brute-force attacks by locking suspicious accounts.
                                </p>
                                
                                <div className="space-y-6 pt-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                                            <span>Max Failed Attempts</span>
                                            <span className="text-rose-500">{settings.maxFailedAttempts} Trials</span>
                                        </div>
                                        <select 
                                            value={settings.maxFailedAttempts}
                                            onChange={(e) => setSettings({...settings, maxFailedAttempts: parseInt(e.target.value)})}
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-primary/50"
                                        >
                                            {[3, 5, 10, 15].map(v => <option key={v} value={v}>{v} Attempts</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                                            <span>Lockout Duration</span>
                                            <span className="text-rose-600">{settings.lockoutDuration} Minutes</span>
                                        </div>
                                        <select 
                                            value={settings.lockoutDuration}
                                            onChange={(e) => setSettings({...settings, lockoutDuration: parseInt(e.target.value)})}
                                            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-primary/50"
                                        >
                                            {[15, 30, 60, 1440].map(v => <option key={v} value={v}>{v >= 60 ? `${v/60} Hours` : `${v} Minutes`}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-8 group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)] opacity-50 group-hover:opacity-75 transition-opacity" />
                        <div className="size-20 bg-white/10 rounded-3xl flex items-center justify-center shrink-0 border border-white/20 backdrop-blur-xl">
                            <ShieldQuestion className="size-10" />
                        </div>
                        <div className="space-y-2 text-center md:text-left relative z-10">
                            <h3 className="text-lg font-black font-space-grotesk tracking-tight">Enterprise Session Enforcement</h3>
                            <p className="text-indigo-100 text-sm font-medium leading-relaxed max-w-xl">
                                These policies use high-entropy state validation and distributed activity tracking to ensure that compromised sessions are terminated instantly across all clusters.
                            </p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
