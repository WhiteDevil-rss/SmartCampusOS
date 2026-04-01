'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    LuShieldCheck, LuUsers, LuLock, LuGlobe, LuMail,
    LuSave, LuRefreshCw, LuPlus, LuTrash2, LuCircleCheck, LuX,
    LuLayoutDashboard, LuSettings, LuUserPlus
} from 'react-icons/lu';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ProtectedRoute } from '@/components/protected-route';
import { UserRole } from '@smartcampus-os/types';
import { useToast, Toast } from '@/components/ui/toast-alert';
import { SUPERADMIN_NAV } from '@/lib/constants/nav-config';
import { SuperAdminPageHeader } from '@/components/superadmin/page-header';
import { UserSearchDialog } from '@/components/superadmin/user-search-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Permission {
    id: string;
    roleId: string;
    module: string;
    action: string;
    allowed: boolean;
    restrictions: any;
}

interface SubscriptionControl {
    id: string;
    userId: string;
    canSubscribe: boolean;
    subscriptionLimit: number;
    autoRenew: boolean;
    user: {
        email: string;
        username: string;
    };
}

const ROLES = [
    UserRole.SUPER_ADMIN,
    UserRole.UNIVERSITY_ADMIN,
    UserRole.COLLEGE_ADMIN,
    UserRole.DEPARTMENT_ADMIN,
    UserRole.FACULTY,
    UserRole.LIBRARIAN,
    UserRole.PLACEMENT_OFFICER,
    UserRole.APPROVAL_ADMIN,
    UserRole.STUDENT
];

const MODULES = ['USER_MGMT', 'NOTIFICATIONS', 'INQUIRIES', 'SUBSCRIBERS', 'TIMETABLE', 'ACADEMICS', 'EXAMS'];
const ACTIONS = ['READ', 'WRITE', 'DELETE', 'ALL'];

export default function PermissionsPage() {
    const [activeTab, setActiveTab] = useState<'roles' | 'subscriptions'>('roles');
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [subscriptions, setSubscriptions] = useState<SubscriptionControl[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);
    const { toast: toastState, showToast, hideToast } = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [permRes, subRes] = await Promise.all([
                api.get('/v2/permissions/permissions'),
                api.get('/v2/permissions/subscriptions')
            ]);
            setPermissions(permRes.data);
            setSubscriptions(subRes.data);
        } catch (error) {
            showToast('error', 'Failed to synchronize system policies');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTogglePermission = async (roleId: string, module: string, action: string, currentAllowed: boolean) => {
        if (roleId === UserRole.SUPER_ADMIN) return;

        // Optimistic update
        const previousPermissions = [...permissions];
        const newAllowed = !currentAllowed;
        
        setPermissions(prev => {
            const existingIdx = prev.findIndex(p => p.roleId === roleId && p.module === module && p.action === action);
            if (existingIdx >= 0) {
                const updated = [...prev];
                updated[existingIdx] = { ...updated[existingIdx], allowed: newAllowed };
                return updated;
            } else {
                return [...prev, { id: 'temp', roleId, module, action, allowed: newAllowed, restrictions: null }];
            }
        });

        try {
            await api.post('/v2/permissions/permissions', {
                roleId,
                module,
                action,
                allowed: newAllowed
            });
            showToast('success', `${module} permission updated for ${roleId.replace('_', ' ')}`);
        } catch (error) {
            setPermissions(previousPermissions);
            showToast('error', 'Policy update failed. Reverting changes.');
        }
    };

    const handleUpdateSubscription = async (id: string, data: Partial<SubscriptionControl>) => {
        try {
            await api.put(`/v2/permissions/subscriptions/${id}`, data);
            setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
            showToast('success', 'Control parameters updated');
        } catch (error) {
            showToast('error', 'Failed to update subscription control');
        }
    };

    const handleAddSubscriptionControl = async (user: any) => {
        try {
            setIsSaving(true);
            const { data } = await api.post('/v2/permissions/subscriptions', {
                userId: user.id,
                canSubscribe: true,
                subscriptionLimit: 100,
                autoRenew: false
            });
            setSubscriptions(prev => [data.control, ...prev]);
            showToast('success', `Subscription control initialized for ${user.username}`);
        } catch (error) {
            showToast('error', 'User already has subscription control or operation failed');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <Toast toast={toastState} onClose={hideToast} />
            <DashboardLayout title="System Permissions" navItems={SUPERADMIN_NAV}>
                <div className="flex flex-col gap-10 pb-20">
                    <SuperAdminPageHeader
                        eyebrow="Policy governance"
                        title="Permissions and subscriptions"
                        description="Control role-level access modules and granular subscription limits from a unified compliance layer."
                        icon={<LuShieldCheck className="h-6 w-6" />}
                        actions={
                            activeTab === 'subscriptions' && (
                                <Button 
                                    onClick={() => setIsUserSearchOpen(true)}
                                    className="bg-neon-cyan hover:bg-neon-cyan/80 text-slate-900 font-bold px-6 h-11 rounded-[14px] shadow-[0_0_20px_rgba(57,193,239,0.2)]"
                                >
                                    <LuUserPlus className="mr-2 h-4 w-4" /> Add User Control
                                </Button>
                            )
                        }
                        stats={[
                            { label: 'Active Policies', value: permissions.filter(p => p.allowed).length },
                            { label: 'Provisioned Users', value: subscriptions.length },
                            { label: 'Integrity', value: 'Verified' },
                        ]}
                    />

                    {/* Navigation Tabs */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-border-hover rounded-[20px] w-fit backdrop-blur-md">
                            <button
                                onClick={() => setActiveTab('roles')}
                                className={cn(
                                    "flex items-center gap-2.5 px-8 py-3 rounded-[15px] text-sm font-black transition-all duration-300",
                                    activeTab === 'roles' 
                                        ? "bg-white dark:bg-primary text-primary dark:text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_20px_-6px_rgba(99,102,241,0.5)]" 
                                        : "text-slate-500 dark:text-text-muted hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                <LuLock className="w-4 h-4" /> Role Access Matrix
                            </button>
                            <button
                                onClick={() => setActiveTab('subscriptions')}
                                className={cn(
                                    "flex items-center gap-2.5 px-8 py-3 rounded-[15px] text-sm font-black transition-all duration-300",
                                    activeTab === 'subscriptions' 
                                        ? "bg-white dark:bg-primary text-primary dark:text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_20px_-6px_rgba(99,102,241,0.5)]" 
                                        : "text-slate-500 dark:text-text-muted hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                <LuGlobe className="w-4 h-4" /> Subscription Controls
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={fetchData}
                                className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-border-hover text-slate-500 dark:text-text-muted hover:text-primary transition-all active:rotate-180 duration-500"
                            >
                                <LuRefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
                            </button>
                            <div className="h-4 w-[1px] bg-slate-200 dark:bg-border mx-1" />
                            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live Synchronization</span>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {isLoading && permissions.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center py-32 gap-6 glass-card bg-white/50 dark:bg-white/5 border border-dashed border-slate-300 dark:border-border-hover rounded-[3rem]"
                            >
                                <div className="relative">
                                    <LuRefreshCw className="w-16 h-16 text-primary animate-spin" />
                                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                                </div>
                                <div className="text-center space-y-1">
                                    <h3 className="text-xl font-bold dark:text-white">Pulling Governance Data</h3>
                                    <p className="text-sm text-slate-500 dark:text-text-muted">Analyzing role inheritance and user permissions...</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="space-y-8"
                            >
                                {activeTab === 'roles' ? (
                                    <div className="overflow-hidden glass-card bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-border-hover rounded-[2.5rem] shadow-2xl">
                                        <div className="overflow-x-auto custom-scrollbar">
                                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                                <thead>
                                                    <tr className="bg-slate-50/80 dark:bg-white/5 border-b border-slate-200 dark:border-border">
                                                        <th className="p-8 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-text-secondary sticky left-0 z-10 bg-inherit backdrop-blur-xl">Capability Map</th>
                                                        {ROLES.map(role => (
                                                            <th key={role} className="p-8 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-text-secondary text-center">
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <span className="text-slate-900 dark:text-text-primary whitespace-nowrap">{role.replace('_', ' ')}</span>
                                                                    <div className="w-1 h-1 rounded-full bg-primary/40" />
                                                                </div>
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {MODULES.map((module) => (
                                                        <React.Fragment key={module}>
                                                            <tr className="border-b border-slate-100 dark:border-border/40">
                                                                <td colSpan={ROLES.length + 1} className="px-8 py-4 bg-slate-50/50 dark:bg-primary/5">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="p-1.5 bg-primary/10 rounded-lg">
                                                                            <LuLayoutDashboard className="w-4 h-4 text-primary" />
                                                                        </div>
                                                                        <span className="text-[11px] font-black uppercase tracking-[0.25em] text-primary">{module.replace('_', ' ')} Module</span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            {ACTIONS.map((action, idx) => (
                                                                <tr key={`${module}-${action}`} className={cn(
                                                                    "border-b last:border-0 border-slate-100 dark:border-white/5 transition-all group",
                                                                    idx % 2 === 0 ? "bg-white/30 dark:bg-transparent" : "bg-slate-50/20 dark:bg-white/[0.02]"
                                                                )}>
                                                                    <td className="p-8 sticky left-0 z-10 bg-inherit backdrop-blur-xl group-hover:bg-slate-100/50 dark:group-hover:bg-white/5 transition-all">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="w-2 h-8 rounded-full bg-slate-200 dark:bg-white/5 group-hover:bg-primary/50 transition-all" />
                                                                            <div className="flex flex-col">
                                                                                <span className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{action}</span>
                                                                                <span className="text-[10px] text-slate-500 dark:text-text-muted font-black tracking-widest uppercase">System Hook</span>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    {ROLES.map(role => {
                                                                        const perm = permissions.find(p => p.roleId === role && p.module === module && p.action === action);
                                                                        const isAllowed = perm ? perm.allowed : false;
                                                                        const isSuper = role === UserRole.SUPER_ADMIN;

                                                                        return (
                                                                            <td key={role} className="p-8 text-center group-hover:bg-slate-100/30 dark:group-hover:bg-white/[0.01] transition-all">
                                                                                <button
                                                                                    disabled={isSaving || isSuper}
                                                                                    onClick={() => handleTogglePermission(role, module, action, isAllowed)}
                                                                                    className={cn(
                                                                                        "w-14 h-7 rounded-full relative transition-all duration-500 p-1 mx-auto",
                                                                                        isAllowed ? 'bg-primary shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-slate-200 dark:bg-white/10 dark:border dark:border-white/5',
                                                                                        isSuper ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer active:scale-90 hover:scale-110'
                                                                                    )}
                                                                                >
                                                                                    {isSuper && (
                                                                                        <LuLock className="absolute inset-0 m-auto w-3 h-3 text-white/50 z-10" />
                                                                                    )}
                                                                                    <motion.div 
                                                                                        animate={{ x: isAllowed ? 28 : 0 }}
                                                                                        className={cn(
                                                                                            "w-5 h-5 rounded-full shadow-lg transition-all",
                                                                                            isAllowed ? "bg-white" : "bg-slate-400 dark:bg-slate-600"
                                                                                        )} 
                                                                                    />
                                                                                </button>
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            ))}
                                                        </React.Fragment>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {subscriptions.length === 0 ? (
                                            <div className="col-span-full py-24 text-center glass-card bg-white/50 dark:bg-white/5 border-dashed border-2 border-slate-200 dark:border-border-hover rounded-[3rem]">
                                                <div className="w-20 h-20 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <LuUsers className="w-10 h-10 text-slate-400" />
                                                </div>
                                                <h3 className="text-xl font-bold dark:text-white mb-2">No Active Controls</h3>
                                                <p className="text-slate-500 dark:text-text-muted mb-8 max-w-xs mx-auto text-sm">Synchronize identities to initialize granular subscription limiters.</p>
                                                <Button 
                                                    onClick={() => setIsUserSearchOpen(true)}
                                                    className="bg-primary text-white font-bold px-8 h-12 rounded-2xl shadow-xl hover:scale-105 transition-all"
                                                >
                                                    Provision Controls
                                                </Button>
                                            </div>
                                        ) : subscriptions.map((sub, idx) => (
                                            <motion.div 
                                                key={sub.id} 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="glass-card p-8 rounded-[2.5rem] border border-slate-200 dark:border-border-hover hover:border-primary/50 transition-all group relative overflow-hidden flex flex-col h-full bg-white/40 dark:bg-slate-900/40"
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-all duration-700" />
                                                
                                                <div className="flex items-start justify-between mb-8 relative z-10">
                                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-border-hover flex items-center justify-center text-slate-500 dark:text-text-muted group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                                                        <LuUsers className="w-7 h-7" />
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-text-secondary">Quota Limit</span>
                                                        <div className="relative group/input">
                                                            <input
                                                                type="number"
                                                                value={sub.subscriptionLimit}
                                                                onChange={(e) => handleUpdateSubscription(sub.id, { subscriptionLimit: parseInt(e.target.value) || 0 })}
                                                                className="w-24 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-border-hover rounded-[14px] px-4 py-2.5 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-center"
                                                            />
                                                            <LuSettings className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 opacity-0 group-focus-within/input:opacity-100 transition-all" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-8 relative z-10 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white truncate tracking-tight">{sub.user.username}</h3>
                                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 rounded-lg px-2 text-[10px] uppercase font-black tracking-widest">Operator</Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-500 dark:text-text-muted truncate flex items-center gap-2.5 font-medium">
                                                        <LuMail className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" /> {sub.user.email}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5 relative z-10 w-full mt-auto">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-black text-slate-400 dark:text-text-secondary uppercase tracking-widest">Connectivity</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className={cn("w-2 h-2 rounded-full", sub.canSubscribe ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]")} />
                                                            <span className="text-xs font-bold text-slate-700 dark:text-white uppercase tracking-tighter">
                                                                {sub.canSubscribe ? 'Active Link' : 'Terminated'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <button
                                                        onClick={() => handleUpdateSubscription(sub.id, { canSubscribe: !sub.canSubscribe })}
                                                        className={cn(
                                                            "flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-lg",
                                                            sub.canSubscribe 
                                                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-600 hover:text-white shadow-rose-500/5" 
                                                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white shadow-emerald-500/5"
                                                        )}
                                                    >
                                                        {sub.canSubscribe ? <><LuX className="w-4 h-4" /> Suspend</> : <><LuPlus className="w-4 h-4" /> Reactivate</>}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <UserSearchDialog 
                        open={isUserSearchOpen}
                        onOpenChange={setIsUserSearchOpen}
                        onSelect={handleAddSubscriptionControl}
                        excludeIds={subscriptions.map(s => s.userId)}
                    />
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
