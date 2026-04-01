'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuShieldCheck, LuSave, LuGlobe, LuLock, LuBell, LuDatabase, LuRefreshCw, LuTriangleAlert, LuCircleCheck, LuCircleX, LuDownload, LuArchive, LuFlame } from 'react-icons/lu';
import { SiFirebase } from 'react-icons/si';
import { SUPERADMIN_NAV } from '@/lib/constants/nav-config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useCallback } from 'react';
import { Toast, useToast } from '@/components/ui/toast-alert';
import { api } from '@/lib/api';
import { SuperAdminPageHeader } from '@/components/superadmin/page-header';

interface SettingsData {
    platformName: string;
    supportEmail: string;
    maintenanceMode: boolean;
    sessionTimeout: number;
    mfaEnabled: boolean;
    logRetention: string;
    autoBackups: boolean;
}

interface BackupMeta {
    filename: string;
    displayName: string;
    sizeDisplay: string;
    createdAt: string;
    createdByName: string;
    totalRecords: number;
}

interface ResetStep {
    label: string;
    status: 'pending' | 'running' | 'done' | 'failed';
    detail?: string;
}

export default function GlobalSettingsPage() {
    const { toast, showToast, hideToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // ── Firebase Sync state ──────────────────────────────────────────────────
    const [syncScope, setSyncScope] = useState('all');
    const [syncDryRun, setSyncDryRun] = useState(true);
    const [syncRunning, setSyncRunning] = useState(false);
    const [syncReport, setSyncReport] = useState<any>(null);
    const [syncConfirmText, setSyncConfirmText] = useState('');
    const [showSyncConfirm, setShowSyncConfirm] = useState(false);

    // ── Seed Backup state ────────────────────────────────────────────────────
    const [backups, setBackups] = useState<BackupMeta[]>([]);
    const [backupsLoading, setBackupsLoading] = useState(false);
    const [creatingBackup, setCreatingBackup] = useState(false);

    // ── Factory Reset state ──────────────────────────────────────────────────
    const [selectedBackup, setSelectedBackup] = useState('');
    const [resetConfirmText, setResetConfirmText] = useState('');
    const [resetRunning, setResetRunning] = useState(false);
    const [resetSteps, setResetSteps] = useState<ResetStep[]>([]);

    // ── Restore & Seed state ─────────────────────────────────────────────────
    const [restoreBackup, setRestoreBackup] = useState('');
    const [restoreConfirmText, setRestoreConfirmText] = useState('');
    const [restoreRunning, setRestoreRunning] = useState(false);
    const [restoreSteps, setRestoreSteps] = useState<ResetStep[]>([]);

    const fetchBackups = useCallback(async () => {
        setBackupsLoading(true);
        try {
            const res = await api.get('/seed/backups');
            setBackups(res.data.backups ?? []);
        } catch (e) {
            // silently fail — the list may be empty on first run
        } finally {
            setBackupsLoading(false);
        }
    }, []);

    const handleCreateBackup = async () => {
        setCreatingBackup(true);
        try {
            const res = await api.post('/seed/backups');
            const b = res.data.backup;
            showToast('success', `Backup created: ${b.filename} (${b.sizeDisplay}, ${b.totalRecords} records)`);
            await fetchBackups();
            setSelectedBackup(b.filename);
        } catch (error: any) {
            showToast('error', error.response?.data?.error || 'Failed to create backup');
        } finally {
            setCreatingBackup(false);
        }
    };

    const handleFactoryReset = async () => {
        if (resetConfirmText !== 'RESET' || resetRunning) return;

        setResetRunning(true);
        // Show pending steps immediately
        setResetSteps([
            { label: 'Clear All Database Data', status: 'running' },
            { label: 'Delete All Firebase Auth Users', status: 'pending' },
        ]);

        try {
            const res = await api.post('/seed/factory-reset', { confirmation: 'RESET' });
            const result = res.data.result;
            setResetSteps((result.steps ?? []).map((s: any) => ({ label: s.label, status: s.status, detail: s.detail })));
            showToast('success', '🗑️ Factory reset complete! System is now empty. Logging out...');
            setTimeout(() => window.location.reload(), 3000);
        } catch (error: any) {
            const result = error.response?.data?.result;
            if (result?.steps) {
                setResetSteps(result.steps.map((s: any) => ({ label: s.label, status: s.status, detail: s.detail })));
            }
            showToast('error', error.response?.data?.error || 'Factory reset failed. Check logs.');
        } finally {
            setResetRunning(false);
            setResetConfirmText('');
        }
    };

    const handleRestoreAndSync = async () => {
        if (restoreConfirmText !== 'RESTORE' || !restoreBackup || restoreRunning) return;
        setRestoreRunning(true);
        setRestoreSteps([
            { label: 'Validate Backup File', status: 'running' },
            { label: 'Clear Existing Data', status: 'pending' },
            { label: 'Restore Data from Backup', status: 'pending' },
            { label: 'Sync Users to Firebase Auth', status: 'pending' },
        ]);
        try {
            const res = await api.post('/seed/restore', { filename: restoreBackup, confirmation: 'RESTORE' });
            const result = res.data.result;
            setRestoreSteps((result.steps ?? []).map((s: any) => ({ label: s.label, status: s.status, detail: s.detail })));
            showToast('success', '✅ Restore complete! Refreshing in 3 seconds...');
            setTimeout(() => window.location.reload(), 3000);
        } catch (error: any) {
            const result = error.response?.data?.result;
            if (result?.steps) setRestoreSteps(result.steps.map((s: any) => ({ label: s.label, status: s.status, detail: s.detail })));
            showToast('error', error.response?.data?.error || 'Restore failed. Check logs.');
        } finally {
            setRestoreRunning(false);
            setRestoreConfirmText('');
        }
    };

    const [settings, setSettings] = useState<SettingsData>({
        platformName: 'Zembaa.AI Scheduler',
        supportEmail: 'support@zembaa.ai',
        maintenanceMode: false,
        sessionTimeout: 10,
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
        fetchBackups();
    }, [fetchBackups]);

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

    // ── Firebase Sync handlers ───────────────────────────────────────────────
    const handleFirebaseSync = async () => {
        setSyncRunning(true);
        setSyncReport(null);
        try {
            const endpoint = syncDryRun ? '/firebase-sync/dry-run' : '/firebase-sync/run';
            // Parse composite "scope:role" value from dropdown
            const [scopeKey, roleValue] = syncScope.split(':');
            const body: Record<string, any> = { scope: scopeKey, dryRun: syncDryRun };
            if (roleValue) body.role = roleValue;

            const { data } = await api.post(endpoint, body);
            setSyncReport(data.report);
            showToast('success', syncDryRun
                ? `Dry-run complete. Would affect ${data.report.created + data.report.updated} user(s).`
                : `Sync complete. Created: ${data.report.created}, Updated: ${data.report.updated}, Failed: ${data.report.failed}.`);
        } catch (e: any) {
            showToast('error', e.response?.data?.error || 'Firebase sync failed.');
        } finally {
            setSyncRunning(false);
            setShowSyncConfirm(false);
            setSyncConfirmText('');
        }
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

                <SuperAdminPageHeader
                    eyebrow="System policy"
                    title="Configuration and recovery"
                    description="Tune platform defaults, recovery routines, and security controls for every institution connected to SmartOS."
                    icon={<LuShieldCheck className="h-6 w-6" />}
                    actions={
                        <Button onClick={handleSave} disabled={loading} className="h-11 rounded-2xl px-5 font-bold">
                            {loading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <LuSave className="mr-2 h-4 w-4" />
                                    Save changes
                                </>
                            )}
                        </Button>
                    }
                    stats={[
                        { label: 'Timeout', value: `${settings.sessionTimeout}m` },
                        { label: 'Retention', value: `${settings.logRetention}d` },
                        { label: 'Maintenance', value: settings.maintenanceMode ? 'On' : 'Off' },
                    ]}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* General Platform Settings */}
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-border backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-surface border-b border-slate-200 dark:border-border p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20">
                                    <LuGlobe className="w-5 h-5 text-neon-cyan" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-slate-900 dark:text-text-primary">Platform Defaults</CardTitle>
                                    <CardDescription className="text-slate-600 dark:text-text-muted">Basic system-wide branding and region settings.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-text-muted uppercase tracking-wider">Platform Name</label>
                                <Input
                                    className="bg-slate-50 dark:bg-surface border-slate-200 dark:border-border-hover text-slate-900 dark:text-text-primary rounded-xl h-11"
                                    value={settings.platformName}
                                    onChange={(e) => handleChange('platformName', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-text-muted uppercase tracking-wider">System Support Email</label>
                                <Input
                                    className="bg-slate-50 dark:bg-surface border-slate-200 dark:border-border-hover text-slate-900 dark:text-text-primary rounded-xl h-11"
                                    value={settings.supportEmail}
                                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-text-muted uppercase tracking-wider">Maintenance Mode</label>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-surface border border-slate-200 dark:border-border-hover">
                                    <span className="text-sm text-slate-600 dark:text-text-muted">Disable platform access for all users except Super Admins</span>
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
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-border backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-surface border-b border-slate-200 dark:border-border p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                    <LuLock className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-slate-900 dark:text-text-primary">Security & Auth</CardTitle>
                                    <CardDescription className="text-slate-600 dark:text-text-muted">Manage session, password, and access control policies.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-text-muted uppercase tracking-wider">Session Timeout (Seconds)</label>
                                <Input
                                    className="bg-slate-50 dark:bg-surface border-slate-200 dark:border-border-hover text-slate-900 dark:text-text-primary rounded-xl h-11"
                                    value={settings.sessionTimeout}
                                    type="number"
                                    onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                                />
                                <p className="text-[10px] text-text-secondary">Platform-wide strict session duration before auto-logout.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-text-muted uppercase tracking-wider">Multi-Factor Authentication (MFA)</label>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-surface border border-slate-200 dark:border-border-hover">
                                    <span className={`text-sm ${settings.mfaEnabled ? 'text-amber-500 font-bold' : 'text-slate-700 dark:text-text-muted'}`}>
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
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-border backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden lg:col-span-2">
                        <CardHeader className="bg-slate-50 dark:bg-surface border-b border-slate-200 dark:border-border p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                    <LuDatabase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-slate-900 dark:text-text-primary">Audit & Persistence</CardTitle>
                                    <CardDescription className="text-slate-600 dark:text-text-muted">Settings for log retention and automated data backups.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-text-muted uppercase tracking-wider">Log Retention Period (Days)</label>
                                    <select
                                        value={settings.logRetention}
                                        onChange={(e) => handleChange('logRetention', e.target.value)}
                                        className="w-full flex h-11 rounded-xl border border-slate-200 dark:border-border-hover bg-slate-50 dark:bg-surface px-3 py-2 text-sm text-slate-900 dark:text-text-primary focus:ring-2 focus:ring-neon-cyan/30"
                                    >
                                        <option value="30">30 Days</option>
                                        <option value="90">90 Days</option>
                                        <option value="365">1 Year</option>
                                        <option value="forever">Indefinite</option>
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-surface border border-slate-200 dark:border-border-hover">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 dark:text-text-primary">Daily Automated Backups</span>
                                            <span className="text-[10px] text-text-secondary">Run database snapshots every 24 hours at 00:00 UTC</span>
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

                    {/* ── Firebase Auth Sync ───────────────────────────────────────────────────── */}
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-border backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden lg:col-span-2">
                        <CardHeader className="bg-slate-50 dark:bg-surface border-b border-slate-200 dark:border-border p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                    <SiFirebase className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-slate-900 dark:text-text-primary">Firebase Auth Sync</CardTitle>
                                    <CardDescription className="text-slate-600 dark:text-text-muted">Manually reconcile the application database with Firebase Authentication to repair missing or mismatched user accounts.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Controls */}
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-text-muted uppercase tracking-wider">Sync Scope</label>
                                        <select
                                            value={syncScope}
                                            onChange={(e) => setSyncScope(e.target.value)}
                                            className="w-full flex h-11 rounded-xl border border-slate-200 dark:border-border-hover bg-slate-50 dark:bg-surface px-3 py-2 text-sm text-slate-900 dark:text-text-primary focus:ring-2 focus:ring-orange-500/30 outline-none"
                                        >
                                            <option value="all">All Users</option>
                                            <option value="by_role:UNI_ADMIN">University Admins only</option>
                                            <option value="by_role:DEPT_ADMIN">Department Admins only</option>
                                            <option value="by_role:FACULTY">Faculty only</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-surface border border-slate-200 dark:border-border-hover">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 dark:text-text-primary">Dry-Run Mode</span>
                                            <span className="text-[10px] text-text-secondary mt-0.5">Preview changes without writing to Firebase</span>
                                        </div>
                                        <div
                                            onClick={() => setSyncDryRun(v => !v)}
                                            className={`w-12 h-6 ${syncDryRun ? 'bg-orange-500/20' : 'bg-slate-200 dark:bg-slate-800'} rounded-full relative cursor-pointer transition-colors`}
                                        >
                                            <div className={`absolute ${syncDryRun ? 'right-1' : 'left-1'} top-1 w-4 h-4 ${syncDryRun ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-slate-400 dark:bg-slate-500'} rounded-full transition-all`} />
                                        </div>
                                    </div>

                                    {/* Danger zone — live sync requires typing 'sync' */}
                                    {!syncDryRun && (
                                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl p-4 space-y-2">
                                            <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <LuTriangleAlert className="w-4 h-4" /> Live Sync — type <span className="font-mono">&quot;sync&quot;</span> to enable
                                            </p>
                                            <Input
                                                placeholder="sync"
                                                value={syncConfirmText}
                                                onChange={(e) => setSyncConfirmText(e.target.value)}
                                                className="font-mono text-sm bg-white dark:bg-slate-900 border-red-200 dark:border-red-800/50 dark:text-text-primary h-10"
                                                autoComplete="off"
                                            />
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleFirebaseSync}
                                        disabled={syncRunning || (!syncDryRun && syncConfirmText.toLowerCase() !== 'sync')}
                                        className={`w-full h-11 font-bold transition-all rounded-xl ${syncDryRun
                                            ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30 hover:bg-orange-200 dark:hover:bg-orange-500/20'
                                            : 'bg-red-600 hover:bg-red-700 text-text-primary disabled:opacity-40'
                                            }`}
                                    >
                                        {syncRunning ? (
                                            <span className="flex items-center gap-2">
                                                <LuRefreshCw className="w-4 h-4 animate-spin" />
                                                {syncDryRun ? 'Scanning...' : 'Syncing...'}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <SiFirebase className="w-4 h-4" />
                                                {syncDryRun ? 'Run Dry-Run Preview' : 'Execute Live Sync'}
                                            </span>
                                        )}
                                    </Button>
                                </div>

                                {/* Results panel */}
                                <div className="space-y-3">
                                    {syncReport ? (
                                        <>
                                            <div className="flex items-center gap-2 mb-2">
                                                {syncReport.dryRun
                                                    ? <LuTriangleAlert className="w-4 h-4 text-orange-500" />
                                                    : <LuCircleCheck className="w-4 h-4 text-emerald-500" />}
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-text-primary">
                                                    {syncReport.dryRun ? 'Dry-Run Preview' : 'Sync Complete'} — {syncReport.durationMs}ms
                                                </h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[['Scanned', syncReport.scanned, 'text-slate-600 dark:text-text-muted'],
                                                ['Created', syncReport.created, 'text-emerald-600 dark:text-emerald-400'],
                                                ['Updated', syncReport.updated, 'text-blue-600 dark:text-blue-400'],
                                                ['Skipped', syncReport.skipped, 'text-text-secondary'],
                                                ['Failed', syncReport.failed, 'text-red-600 dark:text-red-400'],
                                                ['Orphans', syncReport.orphansFound, 'text-amber-600 dark:text-amber-400'],
                                                ].map(([label, val, color]) => (
                                                    <div key={label as string} className="bg-slate-50 dark:bg-surface border border-slate-200 dark:border-border-hover rounded-xl p-3 text-center">
                                                        <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{label}</div>
                                                        <div className={`text-2xl font-black mt-0.5 ${color}`}>{val}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            {syncReport.errors?.length > 0 && (
                                                <div className="mt-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl p-3 max-h-40 overflow-y-auto custom-scrollbar">
                                                    <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-2 uppercase">Failed Operations</p>
                                                    {syncReport.errors.map((e: any, i: number) => (
                                                        <div key={i} className="text-xs text-red-600 dark:text-red-400 font-mono truncate">
                                                            <LuCircleX className="inline w-3 h-3 mr-1" />{e.userId}: {e.error}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full min-h-[180px] text-center text-text-muted dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-border-hover rounded-xl">
                                            <SiFirebase className="w-10 h-10 mb-3 opacity-30" />
                                            <p className="text-sm font-medium">No sync results yet</p>
                                            <p className="text-xs mt-1">Run a dry-run to preview changes</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Card 1: Create Seed Backup ─────────────────────────────────────── */}
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-border backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden lg:col-span-2">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 opacity-80"></div>
                        <CardHeader className="bg-slate-50 dark:bg-surface border-b border-slate-200 dark:border-border p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <LuArchive className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg text-slate-900 dark:text-text-primary">Seed Data Management</CardTitle>
                                        <CardDescription className="text-text-secondary dark:text-text-muted">Backup the current system state as a seed file that can be restored later via Factory Reset.</CardDescription>
                                    </div>
                                </div>
                                <Button
                                    onClick={fetchBackups}
                                    variant="outline"
                                    size="sm"
                                    disabled={backupsLoading || resetRunning}
                                    className="gap-2 text-xs"
                                >
                                    <LuRefreshCw className={`w-3.5 h-3.5 ${backupsLoading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            {/* Backup list */}
                            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                                {backups.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 dark:border-border-hover rounded-xl text-text-muted">
                                        <LuArchive className="w-8 h-8 mb-2 opacity-30" />
                                        <p className="text-sm font-medium">No seed backups yet</p>
                                        <p className="text-xs mt-0.5">Click &quot;Create Seed Backup&quot; to save the current state</p>
                                    </div>
                                ) : (
                                    backups.map(b => (
                                        <div key={b.filename} onClick={() => !resetRunning && setSelectedBackup(b.filename)}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all ${selectedBackup === b.filename
                                                ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                                                : 'border-slate-200 dark:border-border-hover hover:border-slate-300 dark:hover:border-border-hover'
                                                }`}>
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedBackup === b.filename ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-text-primary truncate">{b.displayName}</p>
                                                    <p className="text-xs text-text-secondary">{b.totalRecords} records &bull; {b.sizeDisplay} &bull; by {b.createdByName}</p>
                                                </div>
                                            </div>
                                            <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/v1/seed/backups/${b.filename}/download`}
                                                target="_blank" rel="noreferrer"
                                                onClick={e => e.stopPropagation()}
                                                className="flex-shrink-0 ml-3 p-1.5 rounded-lg text-text-muted hover:text-slate-700 dark:hover:text-text-primary hover:bg-slate-100 dark:hover:bg-surface-hover transition-colors">
                                                <LuDownload className="w-4 h-4" />
                                            </a>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Create Backup button */}
                            <Button
                                onClick={handleCreateBackup}
                                disabled={creatingBackup || resetRunning}
                                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-text-primary font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all"
                            >
                                {creatingBackup ? (
                                    <span className="flex items-center gap-2">
                                        <LuRefreshCw className="w-4 h-4 animate-spin" />
                                        Creating Backup...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <LuArchive className="w-4 h-4" />
                                        Create Seed Backup
                                    </span>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* ── Card: Restore & Seed Data ───────────────────────────────────────── */}
                    <Card className="bg-white dark:bg-slate-900/40 border-amber-200 dark:border-amber-800/30 shadow-2xl rounded-2xl overflow-hidden lg:col-span-2 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 opacity-80" />
                        <CardHeader className="bg-amber-50/60 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800/30 p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                    <LuDatabase className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-amber-700 dark:text-amber-300">Restore &amp; Seed Data</CardTitle>
                                    <CardDescription className="text-amber-600/80 dark:text-amber-500/70">
                                        Overwrite current database with a saved backup, then auto-sync Firebase Auth. No schema wipe — only data is replaced.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            {/* Backup selector */}
                            <div>
                                <label className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2 block">Select Backup to Restore</label>
                                {backups.length === 0 ? (
                                    <div className="flex items-center gap-2 text-sm text-text-muted border border-dashed border-slate-200 dark:border-border-hover rounded-xl px-4 py-3">
                                        <LuArchive className="w-4 h-4" /> No backups available — create one first.
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                                        {backups.map(b => (
                                            <div key={b.filename}
                                                onClick={() => !restoreRunning && setRestoreBackup(b.filename)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${restoreBackup === b.filename
                                                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30'
                                                    : 'border-slate-200 dark:border-border-hover hover:border-amber-300 dark:hover:border-amber-800/50'
                                                    }`}
                                            >
                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${restoreBackup === b.filename ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-text-primary truncate">{b.displayName}</p>
                                                    <p className="text-xs text-text-secondary">{b.totalRecords} records &bull; {b.sizeDisplay} &bull; by {b.createdByName}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Warning banner */}
                            {restoreBackup && (
                                <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/40 rounded-xl p-4">
                                    <LuTriangleAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                                        <p className="font-bold">This will overwrite all current data.</p>
                                        <p className="text-xs opacity-80">All users, departments, faculty, courses, batches, and resources will be replaced. Firebase accounts will be synced automatically after restore. Type <span className="font-mono font-bold">RESTORE</span> to confirm.</p>
                                    </div>
                                </div>
                            )}

                            {/* Confirm + trigger */}
                            {restoreBackup && (
                                <div className="space-y-3">
                                    <Input
                                        placeholder="Type RESTORE to confirm"
                                        value={restoreConfirmText}
                                        onChange={e => setRestoreConfirmText(e.target.value)}
                                        disabled={restoreRunning}
                                        className="font-mono border-amber-300 dark:border-amber-700/50 focus:ring-amber-400"
                                    />
                                    <Button
                                        onClick={handleRestoreAndSync}
                                        disabled={restoreConfirmText !== 'RESTORE' || restoreRunning || !restoreBackup}
                                        className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-text-primary font-bold rounded-xl disabled:opacity-40 transition-all"
                                    >
                                        {restoreRunning ? (
                                            <span className="flex items-center gap-2">
                                                <LuRefreshCw className="w-4 h-4 animate-spin" />
                                                Restoring &amp; Syncing...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <LuDatabase className="w-4 h-4" />
                                                Restore &amp; Seed Data
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* Progress steps */}
                            {restoreSteps.length > 0 && (
                                <div className="space-y-2 mt-2">
                                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Progress</p>
                                    {restoreSteps.map((step, i) => (
                                        <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${step.status === 'done' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40' :
                                            step.status === 'failed' ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40' :
                                                step.status === 'running' ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/40 animate-pulse' :
                                                    'bg-slate-50 dark:bg-surface border-slate-200 dark:border-border opacity-50'
                                            }`}>
                                            <span className="mt-0.5 flex-shrink-0">
                                                {step.status === 'done' && <LuCircleCheck className="w-4 h-4 text-emerald-500" />}
                                                {step.status === 'failed' && <LuCircleX className="w-4 h-4 text-red-500" />}
                                                {step.status === 'running' && <LuRefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
                                                {step.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />}
                                            </span>
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-text-primary">{step.label}</p>
                                                {step.detail && <p className="text-xs text-text-secondary mt-0.5">{step.detail}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ── Card 2: Factory Reset ─────────────────────────────────────────── */}
                    <Card className="bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 shadow-2xl rounded-2xl overflow-hidden lg:col-span-2 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-500"></div>
                        <CardHeader className="bg-surface0 dark:bg-black/20 border-b border-red-200 dark:border-red-900/40 p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <LuFlame className="w-5 h-5 text-red-600 dark:text-red-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-red-700 dark:text-red-400">System Factory Reset</CardTitle>
                                    <CardDescription className="text-red-600/70 dark:text-red-500/70">
                                        Permanently deletes ALL database data and ALL Firebase Auth accounts. Leaves the system completely empty. This cannot be undone.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">

                            {/* Critical warning */}
                            <div className="flex gap-3 bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-700/60 rounded-xl p-4">
                                <LuTriangleAlert className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-red-700 dark:text-red-400 space-y-1">
                                    <p className="font-black text-base">⚠️ This action is irreversible.</p>
                                    <p className="text-xs opacity-90">This will permanently delete ALL system data from the database and ALL user accounts from Firebase Authentication. Login will not work until you reseed using &quot;Restore &amp; Seed Data&quot; above. Do not proceed unless you are absolutely certain.</p>
                                </div>
                            </div>

                            {/* What will be deleted */}
                            <div className="grid grid-cols-2 gap-2">
                                {['All Users & Admins', 'Universities & Departments', 'Faculty & Courses', 'Batches & Resources', 'Timetables & Slots', 'Firebase Auth Accounts'].map((item) => (
                                    <div key={item} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40">
                                        <LuCircleX className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                        <span className="text-xs font-medium text-red-700 dark:text-red-400">{item}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Progress tracker */}
                            {resetSteps.length > 0 && (
                                <div className="space-y-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-border-hover rounded-xl p-4">
                                    <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">Reset Progress</p>
                                    {resetSteps.map((step, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                                                {step.status === 'done' && <LuCircleCheck className="w-5 h-5 text-emerald-500" />}
                                                {step.status === 'failed' && <LuCircleX className="w-5 h-5 text-red-500" />}
                                                {step.status === 'running' && <LuRefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
                                                {step.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-semibold ${step.status === 'done' ? 'text-emerald-700 dark:text-emerald-400' :
                                                    step.status === 'failed' ? 'text-red-700 dark:text-red-400' :
                                                        step.status === 'running' ? 'text-blue-700 dark:text-blue-400' :
                                                            'text-text-muted'
                                                    }`}>{step.label}</p>
                                                {step.detail && <p className="text-xs text-text-secondary mt-0.5">{step.detail}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Confirmation */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-red-200 dark:border-red-900/50">
                                <label className="text-xs font-bold text-slate-700 dark:text-text-muted uppercase tracking-widest mb-2 block">
                                    Type <span className="font-mono bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded">RESET</span> to confirm
                                </label>
                                <Input
                                    value={resetConfirmText}
                                    onChange={e => setResetConfirmText(e.target.value)}
                                    placeholder="RESET"
                                    disabled={resetRunning}
                                    className="font-mono h-11 border-red-200 dark:border-red-900/50 focus-visible:ring-red-500"
                                    autoComplete="off"
                                />
                            </div>

                            {/* Execute button */}
                            <Button
                                onClick={handleFactoryReset}
                                disabled={resetRunning || resetConfirmText !== 'RESET'}
                                variant="destructive"
                                className="w-full h-14 font-black text-base shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] transition-all rounded-xl disabled:opacity-30 disabled:shadow-none"
                            >
                                {resetRunning ? (
                                    <span className="flex items-center gap-2">
                                        <LuRefreshCw className="w-5 h-5 animate-spin" />
                                        Wiping System...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <LuFlame className="w-5 h-5" />
                                        Execute Factory Reset — Wipe Everything
                                    </span>
                                )}
                            </Button>
                            <p className="text-[10px] font-bold text-red-500 text-center uppercase tracking-widest">This action is irreversible. All current data will be permanently erased.</p>
                        </CardContent>
                    </Card>

                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
