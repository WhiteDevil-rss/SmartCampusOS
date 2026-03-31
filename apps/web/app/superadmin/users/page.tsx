'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuBuilding2, LuUsers, LuLayoutDashboard, LuUserPlus, LuShieldAlert, LuKeyRound, LuPower, LuPowerOff, LuClipboardList, LuUser } from 'react-icons/lu';
import { UserListView } from '@/components/users/user-list-view';
import { SUPERADMIN_NAV } from '@/lib/constants/nav-config';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog, useConfirm } from '@/components/ui/confirm-dialog';
import { Toast, useToast } from '@/components/ui/toast-alert';
import { cn } from '@/lib/utils';

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    universityId?: string;
    university?: University;
    isActive: boolean;
}

interface University {
    id: string;
    name: string;
    shortName: string;
}

export default function SuperAdminUsers() {
    const [loading, setLoading] = useState(false); // Users handled by UserListView
    const { confirmState, closeConfirm, askConfirm } = useConfirm();
    const { toast, showToast, hideToast } = useToast();

    // Modals state
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isEditUserOpen, setIsEditUserOpen] = useState(false);
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const [universitiesList, setUniversitiesList] = useState<University[]>([]);

    // Form inputs
    const [newUserForm, setNewUserForm] = useState({ username: '', email: '', password: '', role: 'SUPERADMIN', universityId: '', phoneNumber: '' });
    const [editUserForm, setEditUserForm] = useState({ username: '', email: '', role: 'SUPERADMIN', universityId: '', phoneNumber: '', address: '' });
    const [newPassword, setNewPassword] = useState('');


    const fetchUniversities = useCallback(async () => {
        try {
            const { data } = await api.get('/universities');
            setUniversitiesList(data);
        } catch (e) {
            console.error('Failed to load universities:', e);
        }
    }, []);

    const [refreshKey, setRefreshKey] = useState(0);
    const triggerRefresh = () => setRefreshKey(prev => prev + 1);

    useEffect(() => {
        fetchUniversities();
    }, [fetchUniversities]);

    const handleCreateUser = async () => {
        try {
            const payload = { ...newUserForm, entityId: newUserForm.universityId || null };
            await api.post('/users', payload);
            setIsAddUserOpen(false);
            setNewUserForm({ username: '', email: '', password: '', role: 'SUPERADMIN', universityId: '', phoneNumber: '' });
            triggerRefresh();
            showToast('success', 'User account provisioned successfully.');
        } catch {
            showToast('error', 'Failed to create user. Ensure username/email are unique.');
        }
    };

    const handleEditUser = async () => {
        if (!selectedUserId) return;
        try {
            const payload = { ...editUserForm, entityId: editUserForm.universityId || null };
            await api.put(`/users/${selectedUserId}`, payload);
            setIsEditUserOpen(false);
            triggerRefresh();
            showToast('success', 'User updated successfully!');
        } catch {
            showToast('error', 'Failed to update user. Username or email might be in use.');
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.patch(`/users/${id}/status`, { isActive: !currentStatus });
            triggerRefresh();
            showToast('success', `User ${currentStatus ? 'disabled' : 'enabled'} successfully.`);
        } catch {
            showToast('error', 'Failed to update status. Cannot disable your own account.');
        }
    };

    const handleResetPassword = async () => {
        if (!selectedUserId || newPassword.length < 6) {
            showToast('error', 'Password must be at least 6 characters.');
            return;
        }
        try {
            await api.patch(`/users/${selectedUserId}/password`, { newPassword });
            setIsResetPasswordOpen(false);
            setNewPassword('');
            setSelectedUserId(null);
            showToast('success', 'Password reset successfully!');
        } catch {
            showToast('error', 'Failed to reset password.');
        }
    };

    const navItems = SUPERADMIN_NAV;

    return (
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <DashboardLayout navItems={navItems} title="Super Admin Dashboard">
                <ConfirmDialog state={confirmState} onClose={closeConfirm} />
                <Toast toast={toast} onClose={hideToast} />

                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-text-primary glow-sm">Users Directory</h2>
                        <p className="text-slate-600 dark:text-text-muted mt-1">Manage platform access, roles, and reset credentials securely.</p>
                    </div>
                    <Button onClick={() => setIsAddUserOpen(true)} className="bg-neon-cyan text-slate-900 font-bold shadow-[0_0_15px_rgba(57,193,239,0.4)] hover:shadow-[0_0_25px_rgba(57,193,239,0.6)] transition-all">
                        <LuUserPlus className="w-4 h-4 mr-2" /> Add User
                    </Button>
                </div>

                <UserListView 
                    key={refreshKey}
                    title="Identities Directory"
                    description="Comprehensive multi-tenant identity mesh with hierarchical sector filtering."
                    onEdit={(u: any) => {
                        setSelectedUserId(u.id);
                        setEditUserForm({
                            username: u.username,
                            email: u.email || '',
                            role: u.role,
                            universityId: u.universityId || '',
                            phoneNumber: u.phoneNumber || '',
                            address: u.address || ''
                        });
                        setIsEditUserOpen(true);
                    }}
                    onToggleStatus={(u: any) => handleToggleStatus(u.id, u.isActive)}
                    onResetPassword={(u: any) => { setSelectedUserId(u.id); setIsResetPasswordOpen(true); }}
                />

                {/* Add User Modal */}
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogContent className="sm:max-w-xl bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-border shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-0 overflow-hidden">
                        <DialogHeader className="p-8 pb-0">
                            <DialogTitle className="text-3xl font-black text-slate-900 dark:text-text-primary tracking-tight">Provision Identity</DialogTitle>
                            <p className="text-slate-600 dark:text-text-muted font-medium">Create a new secure access point for the matrix.</p>
                        </DialogHeader>
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-1">Username</label>
                                    <Input
                                        className="bg-surface border-border focus:border-neon-cyan/50 h-12 rounded-xl text-text-primary font-medium"
                                        placeholder="Identity Identifier"
                                        value={newUserForm.username}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-1">Email Address</label>
                                    <Input
                                        className="bg-surface border-border focus:border-neon-cyan/50 h-12 rounded-xl text-text-primary font-medium"
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={newUserForm.email}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-1">Contact Number</label>
                                    <Input
                                        className="bg-surface border-border focus:border-neon-cyan/50 h-12 rounded-xl text-text-primary font-medium"
                                        placeholder="+91 9876543210"
                                        value={newUserForm.phoneNumber}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, phoneNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-1">Access Key</label>
                                    <Input
                                        className="bg-surface border-border focus:border-neon-cyan/50 h-12 rounded-xl text-text-primary font-medium"
                                        type="password"
                                        placeholder="••••••••"
                                        value={newUserForm.password}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-1">System Role</label>
                                    <select
                                        className="w-full h-12 rounded-xl bg-surface border border-border text-text-primary text-sm font-bold px-4 focus:border-neon-cyan/50 outline-none transition-all cursor-pointer appearance-none"
                                        value={newUserForm.role}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                                    >
                                        <option className="bg-[#0a0a0c]" value="SUPERADMIN">Super Admin</option>
                                        <option className="bg-[#0a0a0c]" value="UNI_ADMIN">University Admin</option>
                                        <option className="bg-[#0a0a0c]" value="DEPT_ADMIN">Department Admin</option>
                                        <option className="bg-[#0a0a0c]" value="FACULTY">Faculty</option>
                                    </select>
                                </div>
                                {newUserForm.role !== 'SUPERADMIN' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-1">Partition Assignment</label>
                                        <select
                                            className="w-full h-12 rounded-xl bg-surface border border-border text-text-primary text-sm font-bold px-4 focus:border-neon-cyan/50 outline-none transition-all cursor-pointer appearance-none"
                                            value={newUserForm.universityId}
                                            onChange={(e) => setNewUserForm({ ...newUserForm, universityId: e.target.value })}
                                        >
                                            <option className="bg-white dark:bg-[#0a0a0c]" value="">-- Select Partition --</option>
                                            {universitiesList.map((uni) => (
                                                <option className="bg-white dark:bg-[#0a0a0c]" key={uni.id} value={uni.id}>{uni.name} ({uni.shortName})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter className="p-8 bg-surface border-t border-border">
                            <Button variant="ghost" onClick={() => setIsAddUserOpen(false)} className="text-text-muted hover:text-text-primary hover:bg-surface rounded-xl px-6 h-12 font-bold">Discard</Button>
                            <Button
                                onClick={handleCreateUser}
                                disabled={!newUserForm.username || !newUserForm.password || !newUserForm.phoneNumber}
                                className="bg-neon-cyan text-slate-900 font-black rounded-xl px-8 h-12 shadow-[0_0_20px_rgba(57,193,239,0.3)] hover:shadow-[0_0_30px_rgba(57,193,239,0.5)] transition-all"
                            >
                                Authorize Account
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit User Modal */}
                <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
                    <DialogContent className="sm:max-w-xl bg-[#0a0a0c] border border-border shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-0 overflow-hidden">
                        <DialogHeader className="p-8 pb-0">
                            <DialogTitle className="text-3xl font-black text-text-primary tracking-tight">Modify Identity</DialogTitle>
                            <p className="text-text-muted font-medium">Update secure parameters for the user account.</p>
                        </DialogHeader>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-1">Username</label>
                                    <Input
                                        className="bg-surface border-border focus:border-neon-cyan/50 h-12 rounded-xl text-text-primary font-medium"
                                        placeholder="Username"
                                        value={editUserForm.username}
                                        onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-1">Email <span className="text-rose-500 font-normal ml-1 tracking-normal">(Locked)</span></label>
                                    <Input
                                        className="bg-surface border-border h-12 rounded-xl text-text-secondary font-medium cursor-not-allowed opacity-50"
                                        type="email"
                                        disabled
                                        value={editUserForm.email}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-1">Contact Number</label>
                                    <Input
                                        className="bg-surface border-border focus:border-neon-cyan/50 h-12 rounded-xl text-text-primary font-medium"
                                        placeholder="Phone Number"
                                        value={editUserForm.phoneNumber}
                                        onChange={(e) => setEditUserForm({ ...editUserForm, phoneNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-1">System Role</label>
                                    <select
                                        className="w-full h-12 rounded-xl bg-surface border border-border text-text-primary text-sm font-bold px-4 outline-none transition-all cursor-pointer appearance-none"
                                        value={editUserForm.role}
                                        onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                                    >
                                        <option className="bg-[#0a0a0c]" value="SUPERADMIN">Super Admin</option>
                                        <option className="bg-[#0a0a0c]" value="UNI_ADMIN">University Admin</option>
                                        <option className="bg-[#0a0a0c]" value="DEPT_ADMIN">Department Admin</option>
                                        <option className="bg-[#0a0a0c]" value="FACULTY">Faculty</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-1">Physical Address</label>
                                <Input
                                    className="bg-surface border-border focus:border-neon-cyan/50 h-12 rounded-xl text-text-primary font-medium"
                                    placeholder="Address"
                                    value={editUserForm.address}
                                    onChange={(e) => setEditUserForm({ ...editUserForm, address: e.target.value })}
                                />
                            </div>

                            {editUserForm.role !== 'SUPERADMIN' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-1">Partition Assignment</label>
                                    <select
                                        className="w-full h-12 rounded-xl bg-surface border border-border text-text-primary text-sm font-bold px-4 outline-none transition-all cursor-pointer appearance-none"
                                        value={editUserForm.universityId}
                                        onChange={(e) => setEditUserForm({ ...editUserForm, universityId: e.target.value })}
                                    >
                                        <option className="bg-[#0a0a0c]" value="">-- Select Partition --</option>
                                        {universitiesList.map((uni) => (
                                            <option className="bg-[#0a0a0c]" key={uni.id} value={uni.id}>{uni.name} ({uni.shortName})</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <DialogFooter className="p-8 bg-surface border-t border-border">
                            <Button variant="ghost" onClick={() => setIsEditUserOpen(false)} className="text-text-muted hover:text-text-primary hover:bg-surface rounded-xl px-6 h-12 font-bold">Cancel</Button>
                            <Button
                                onClick={handleEditUser}
                                disabled={!editUserForm.username}
                                className="bg-neon-cyan text-slate-900 font-black rounded-xl px-8 h-12 shadow-[0_0_20px_rgba(57,193,239,0.3)] hover:shadow-[0_0_30px_rgba(57,193,239,0.5)] transition-all"
                            >
                                Commit Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reset Password Modal */}
                <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Force Password Reset</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-red-600">New Secure Password</label>
                                <Input
                                    type="password"
                                    placeholder="Enter new 6+ char password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <p className="text-xs text-text-secondary">This action cannot be undone. The user will be required to use this new credential to authenticate.</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>Cancel</Button>
                            <Button variant="outline" className="bg-red-600 text-text-primary hover:bg-red-700 hover:text-text-primary" onClick={handleResetPassword} disabled={newPassword.length < 6}>Reset Credentials</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </DashboardLayout>
        </ProtectedRoute>
    );
}
