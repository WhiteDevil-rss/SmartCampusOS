'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuShieldCheck, LuSave, LuGlobe, LuLock, LuBell, LuDatabase } from 'react-icons/lu';
import { SUPERADMIN_NAV } from '@/lib/constants/nav-config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Toast, useToast } from '@/components/ui/toast-alert';
import { api } from '@/lib/api';

interface SettingsData {
    platformName: string;
    supportEmail: string;
    maintenanceMode: boolean;
    sessionTimeout: number;
    mfaEnabled: boolean;
    logRetention: string;
    autoBackups: boolean;
}

export default function GlobalSettingsPage() {
    const { toast, showToast, hideToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [settings, setSettings] = useState<SettingsData>({
        platformName: 'Zembaa.AI Scheduler',
        supportEmail: 'support@zembaa.ai',
        maintenanceMode: false,
        sessionTimeout: 600,
        mfaEnabled: false,
        logRetention: '30',
        autoBackups: false,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                if (response.data) {
                    setSettings(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
                showToast('error', 'Failed to load system settings. Using defaults.');
            } finally {
                setFetching(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.patch('/settings', settings);
            showToast('success', 'Global settings updated and persisted successfully!');
        } catch (error: any) {
            console.error('Save settings error:', error);
            showToast('error', error.response?.data?.error || 'Failed to save settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof SettingsData, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    if (fetching) {
        return (
            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                <DashboardLayout navItems={SUPERADMIN_NAV} title="Global System Settings">
                    <div className="flex items-center justify-center h-[60vh]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan"></div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <DashboardLayout navItems={SUPERADMIN_NAV} title="Global System Settings">
                <Toast toast={toast} onClose={hideToast} />

                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white glow-sm">System Configuration</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Manage global parameters, security policies, and platform-wide defaults.</p>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-neon-cyan text-slate-900 font-black shadow-[0_0_20px_rgba(57,193,239,0.4)] hover:shadow-[0_0_35px_rgba(57,193,239,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 h-11 px-6 rounded-xl border border-transparent hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin mr-2" />
                                Saving Changes...
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <LuSave className="w-5 h-5 mr-1.5" />
                                Save All Settings
                            </div>
                        )}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* General Platform Settings */}
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-white/5 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20">
                                    <LuGlobe className="w-5 h-5 text-neon-cyan" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-slate-900 dark:text-white">Platform Defaults</CardTitle>
                                    <CardDescription className="text-slate-600 dark:text-slate-400">Basic system-wide branding and region settings.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Platform Name</label>
                                <Input
                                    className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl h-11"
                                    value={settings.platformName}
                                    onChange={(e) => handleChange('platformName', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">System Support Email</label>
                                <Input
                                    className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl h-11"
                                    value={settings.supportEmail}
                                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Maintenance Mode</label>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                    <span className="text-sm text-slate-600 dark:text-slate-300">Disable platform access for all users except Super Admins</span>
                                    <div
                                        onClick={() => handleChange('maintenanceMode', !settings.maintenanceMode)}
                                        className={`w-12 h-6 ${settings.maintenanceMode ? 'bg-neon-cyan/20' : 'bg-slate-200 dark:bg-slate-800'} rounded-full relative cursor-pointer group transition-colors`}
                                    >
                                        <div className={`absolute ${settings.maintenanceMode ? 'right-1' : 'left-1'} top-1 w-4 h-4 ${settings.maintenanceMode ? 'bg-neon-cyan shadow-[0_0_10px_rgba(57,193,239,0.5)]' : 'bg-slate-400 dark:bg-slate-500'} rounded-full transition-all`} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security & Access */}
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-white/5 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                    <LuLock className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-slate-900 dark:text-white">Security & Auth</CardTitle>
                                    <CardDescription className="text-slate-600 dark:text-slate-400">Manage session, password, and access control policies.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Session Timeout (Seconds)</label>
                                <Input
                                    className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl h-11"
                                    value={settings.sessionTimeout}
                                    type="number"
                                    onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                                />
                                <p className="text-[10px] text-slate-500">Platform-wide strict session duration before auto-logout.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Multi-Factor Authentication (MFA)</label>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                    <span className={`text-sm ${settings.mfaEnabled ? 'text-amber-500 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {settings.mfaEnabled ? 'Enforce MFA for all Super Admins' : 'MFA is currently optional'}
                                    </span>
                                    <div
                                        onClick={() => handleChange('mfaEnabled', !settings.mfaEnabled)}
                                        className={`w-12 h-6 ${settings.mfaEnabled ? 'bg-amber-500/20' : 'bg-slate-200 dark:bg-slate-800'} rounded-full relative cursor-pointer transition-colors`}
                                    >
                                        <div className={`absolute ${settings.mfaEnabled ? 'right-1' : 'left-1'} top-1 w-4 h-4 ${settings.mfaEnabled ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-400 dark:bg-slate-500'} rounded-full transition-all`} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Database & Logs */}
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-white/5 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden lg:col-span-2">
                        <CardHeader className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                    <LuDatabase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-slate-900 dark:text-white">Audit & Persistence</CardTitle>
                                    <CardDescription className="text-slate-600 dark:text-slate-400">Settings for log retention and automated data backups.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Log Retention Period (Days)</label>
                                    <select
                                        value={settings.logRetention}
                                        onChange={(e) => handleChange('logRetention', e.target.value)}
                                        className="w-full flex h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-neon-cyan/30"
                                    >
                                        <option value="30">30 Days</option>
                                        <option value="90">90 Days</option>
                                        <option value="365">1 Year</option>
                                        <option value="forever">Indefinite</option>
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">Daily Automated Backups</span>
                                            <span className="text-[10px] text-slate-500">Run database snapshots every 24 hours at 00:00 UTC</span>
                                        </div>
                                        <div
                                            onClick={() => handleChange('autoBackups', !settings.autoBackups)}
                                            className={`w-12 h-6 ${settings.autoBackups ? 'bg-neon-cyan/20' : 'bg-slate-200 dark:bg-slate-800'} rounded-full relative cursor-pointer transition-colors`}
                                        >
                                            <div className={`absolute ${settings.autoBackups ? 'right-1' : 'left-1'} top-1 w-4 h-4 ${settings.autoBackups ? 'bg-neon-cyan shadow-[0_0_10px_rgba(57,193,239,0.5)]' : 'bg-slate-400 dark:bg-slate-500'} rounded-full transition-all`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
