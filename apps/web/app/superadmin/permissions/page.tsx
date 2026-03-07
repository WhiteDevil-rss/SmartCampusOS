'use client';

import React, { useState, useEffect } from 'react';
import {
    LuShieldCheck, LuUsers, LuLock, LuGlobe, LuMail,
    LuSave, LuRefreshCw, LuPlus, LuTrash2, LuCircleCheck, LuX
} from 'react-icons/lu';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ProtectedRoute } from '@/components/protected-route';
import { UserRole } from '@smartcampus-os/types';
import { useToast, Toast } from '@/components/ui/toast-alert';
import { SUPERADMIN_NAV } from '@/lib/constants/nav-config';

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

const ROLES = ['SUPER_ADMIN', 'UNI_ADMIN', 'DEPT_ADMIN', 'FACULTY', 'STUDENT'];
const MODULES = ['USER_MGMT', 'NOTIFICATIONS', 'INQUIRIES', 'SUBSCRIBERS', 'TIMETABLE'];
const ACTIONS = ['READ', 'WRITE', 'DELETE', 'ALL'];

export default function PermissionsPage() {
    const [activeTab, setActiveTab] = useState<'roles' | 'subscriptions'>('roles');
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [subscriptions, setSubscriptions] = useState<SubscriptionControl[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast: toastState, showToast, hideToast } = useToast();

    // Form data for new permission
    const [selectedRole, setSelectedRole] = useState(ROLES[1]);
    const [selectedModule, setSelectedModule] = useState(MODULES[0]);
    const [selectedAction, setSelectedAction] = useState(ACTIONS[0]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [permRes, subRes] = await Promise.all([
                api.get('/v2/permissions/permissions'),
                api.get('/v2/permissions/subscriptions')
            ]);
            setPermissions(permRes.data);
            setSubscriptions(subRes.data);
        } catch (error) {
            showToast('error', 'Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTogglePermission = async (roleId: string, module: string, action: string, currentAllowed: boolean) => {
        setIsSaving(true);
        try {
            await api.post('/v2/permissions/permissions', {
                roleId,
                module,
                action,
                allowed: !currentAllowed
            });
            await fetchData();
            showToast('success', 'Permission updated successfully');
        } catch (error) {
            showToast('error', 'Update failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateSubscription = async (id: string, data: Partial<SubscriptionControl>) => {
        try {
            await api.put(`/v2/permissions/subscriptions/${id}`, data);
            await fetchData();
            showToast('success', 'Subscription updated successfully');
        } catch (error) {
            showToast('error', 'Failed to update subscription');
        }
    };

    return (
        <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <Toast toast={toastState} onClose={hideToast} />
            <DashboardLayout title="System Permissions" navItems={SUPERADMIN_NAV}>
                <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">

                    {/* Tabs Header */}
                    <div className="flex p-1 bg-surface border border-border rounded-2xl w-fit">
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'roles' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                        >
                            <LuLock className="w-4 h-4" /> Role Matrix
                        </button>
                        <button
                            onClick={() => setActiveTab('subscriptions')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'subscriptions' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                        >
                            <LuGlobe className="w-4 h-4" /> Subscriptions
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <LuRefreshCw className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-text-muted animate-pulse">Synchronizing system policies...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {activeTab === 'roles' ? (
                                <>
                                    {/* Permissions Matrix */}
                                    <div className="table-container">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-white/5 border-b border-border">
                                                    <th className="p-6 text-xs font-black uppercase tracking-widest text-text-secondary">Module / Role</th>
                                                    {ROLES.map(role => (
                                                        <th key={role} className="p-6 text-xs font-black uppercase tracking-widest text-text-secondary text-center">
                                                            {role.replace('_', ' ')}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {MODULES.map(module => (
                                                    <React.Fragment key={module}>
                                                        <tr className="border-b border-border/50">
                                                            <td colSpan={ROLES.length + 1} className="px-6 py-3 bg-primary/5 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                                                {module}
                                                            </td>
                                                        </tr>
                                                        {ACTIONS.map(action => (
                                                            <tr key={`${module}-${action}`} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                                <td className="p-6">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{action}</span>
                                                                        <span className="text-[10px] text-text-muted font-medium">{module}</span>
                                                                    </div>
                                                                </td>
                                                                {ROLES.map(role => {
                                                                    const perm = permissions.find(p => p.roleId === role && p.module === module && p.action === action);
                                                                    const isAllowed = perm ? perm.allowed : false;

                                                                    return (
                                                                        <td key={role} className="p-6 text-center">
                                                                            <button
                                                                                disabled={isSaving || role === 'SUPER_ADMIN'}
                                                                                onClick={() => handleTogglePermission(role, module, action, isAllowed)}
                                                                                className={`w-12 h-6 rounded-full relative transition-all ${isAllowed ? 'bg-primary shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-surface border border-border'} ${role === 'SUPER_ADMIN' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
                                                                            >
                                                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all ${isAllowed ? 'right-1' : 'left-1 bg-slate-600'}`} />
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
                                </>
                            ) : (
                                /* Subscriptions Tab */
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {subscriptions.length === 0 ? (
                                            <div className="col-span-full py-12 text-center glass-morphism rounded-3xl border border-border border-dashed">
                                                <LuUsers className="w-12 h-12 text-text-muted mx-auto mb-4" />
                                                <p className="text-text-muted">No subscription controls found. Map some users in Phase 4.1</p>
                                            </div>
                                        ) : subscriptions.map(sub => (
                                            <div key={sub.id} className="glass-morphism p-6 rounded-[2rem] border border-border hover:border-primary/50 transition-all group">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-border flex items-center justify-center text-text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                        <LuUsers className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Limit</span>
                                                        <input
                                                            type="number"
                                                            value={sub.subscriptionLimit}
                                                            onChange={(e) => handleUpdateSubscription(sub.id, { subscriptionLimit: parseInt(e.target.value) })}
                                                            className="w-16 bg-white/5 border border-border rounded-lg px-2 py-1 text-sm font-bold text-white focus:outline-none focus:border-primary transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1 mb-6">
                                                    <h3 className="text-lg font-bold text-white truncate">{sub.user.username}</h3>
                                                    <p className="text-xs text-text-muted truncate flex items-center gap-2">
                                                        <LuMail className="w-3 h-3" /> {sub.user.email}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                    <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Active Status</span>
                                                    <button
                                                        onClick={() => handleUpdateSubscription(sub.id, { canSubscribe: !sub.canSubscribe })}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sub.canSubscribe ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}
                                                    >
                                                        {sub.canSubscribe ? <><LuCircleCheck className="w-3 h-3" /> Enabled</> : <><LuX className="w-3 h-3" /> Suspended</>}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
