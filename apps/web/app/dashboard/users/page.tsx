'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuUsers, LuUserPlus, LuShieldAlert, LuKeyRound, LuPower, LuPowerOff, LuUser } from 'react-icons/lu';
import { UserListView } from '@/components/users/user-list-view';
import { UNI_ADMIN_NAV } from '@/lib/constants/nav-config';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
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
    isActive: boolean;
    phoneNumber?: string;
    address?: string;
}

export default function UniversityUsers() {
    const { user: currentUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const triggerRefresh = () => setRefreshKey(prev => prev + 1);
    const { confirmState, closeConfirm, askConfirm } = useConfirm();
    const { toast, showToast, hideToast } = useToast();

    // Modals state
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isEditUserOpen, setIsEditUserOpen] = useState(false);
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    // Form inputs
    const [newUserForm, setNewUserForm] = useState({
        username: '',
        email: '',
        password: '',
        role: 'DEPT_ADMIN',
        phoneNumber: '',
        universityId: currentUser?.universityId || ''
    });
    const [editUserForm, setEditUserForm] = useState({
        username: '',
        email: '',
        role: 'DEPT_ADMIN',
        phoneNumber: '',
        address: ''
    });
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        // Universities fetching not needed here as it's scoped by auth
    }, []);

    const handleCreateUser = async () => {
        try {
            const payload = {
                ...newUserForm,
                universityId: currentUser?.universityId
            };
            await api.post('/users', payload);
            setIsAddUserOpen(false);
            setNewUserForm({
                username: '',
                email: '',
                password: '',
                role: 'DEPT_ADMIN',
                phoneNumber: '',
                universityId: currentUser?.universityId || ''
            });
            triggerRefresh();
            showToast('success', 'User account provisioned successfully');
        } catch (e: any) {
            const errorMsg = e.response?.data?.error || 'Failed to create user. Ensure username/email are unique.';
            showToast('error', errorMsg);
        }
    };

    const handleEditUser = async () => {
        if (!selectedUserId) return;
        try {
            await api.put(`/users/${selectedUserId}`, editUserForm);
            setIsEditUserOpen(false);
            triggerRefresh();
            showToast('success', 'User details updated');
        } catch {
            showToast('error', 'Failed to update user');
        }
    };

    const handleDeleteUser = (id: string) => {
        askConfirm({
            title: 'Delete User Identity',
            message: 'Permanently remove this user? This action is irreversible.',
            requireTypedConfirm: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/users/${id}`);
                    triggerRefresh();
                    showToast('success', 'User identity purged');
                } catch {
                    showToast('error', 'Failed to delete user');
                }
            },
        });
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.patch(`/users/${id}/status`, { isActive: !currentStatus });
            triggerRefresh();
        } catch {
            showToast('error', 'Failed to update access status');
        }
    };

    const handleResetPassword = async () => {
        if (!selectedUserId || newPassword.length < 6) {
            showToast('error', 'Password must be at least 6 characters');
            return;
        }
        try {
            await api.patch(`/users/${selectedUserId}/password`, { newPassword });
            setIsResetPasswordOpen(false);
            setNewPassword('');
            setSelectedUserId(null);
            showToast('success', 'Credentials reset successfully');
        } catch {
            showToast('error', 'Failed to reset credentials');
        }
    };

    return (
        <ProtectedRoute allowedRoles={['UNI_ADMIN']}>
            <DashboardLayout navItems={UNI_ADMIN_NAV} title="Identity Management">
                <ConfirmDialog state={confirmState} onClose={closeConfirm} />
                <Toast toast={toast} onClose={hideToast} />

                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white font-heading font-black">Users Directory</h2>
                        <p className="text-muted mt-1 font-medium">Manage institutional access, roles, and security credentials.</p>
                    </div>
                    <Button onClick={() => setIsAddUserOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-heading">
                        <LuUserPlus className="w-4 h-4 mr-2" /> Provision User
                    </Button>
                </div>

                <UserListView 
                    key={refreshKey}
                    initialFilters={{ universityId: currentUser?.universityId || undefined }}
                    title="Institutional Accounts"
                    description="A complete registry of users authorized within this university division."
                    onEdit={(u: any) => {
                        setSelectedUserId(u.id);
                        setEditUserForm({
                            username: u.username,
                            email: u.email || '',
                            role: u.role,
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
                    <DialogContent className="sm:max-w-xl bg-surface border border-border shadow-2xl rounded-[2rem] p-0 overflow-hidden">
                        <DialogHeader className="p-8 pb-0">
                            <DialogTitle className="text-3xl font-black text-white font-heading tracking-tight">Provision Identity</DialogTitle>
                            <p className="text-muted font-medium">Generate a new secure access point for institutional management.</p>
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
                                        placeholder="admin@institution.edu"
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
                                        placeholder="+91 0000000000"
                                        value={newUserForm.phoneNumber}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, phoneNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-1">Temporary Password</label>
                                    <Input
                                        className="bg-surface border-border focus:border-neon-cyan/50 h-12 rounded-xl text-text-primary font-medium"
                                        type="password"
                                        placeholder="••••••••"
                                        value={newUserForm.password}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="text-[10px] uppercase font-black text-muted tracking-widest ml-1">Institutional Role</label>
                                <select
                                    className="w-full h-12 rounded-xl bg-background border border-border text-white text-sm font-bold px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer appearance-none"
                                    value={newUserForm.role}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                                >
                                    <option className="bg-surface" value="UNI_ADMIN">University Admin</option>
                                    <option className="bg-surface" value="DEPT_ADMIN">Department Admin</option>
                                    <option className="bg-surface" value="FACULTY">Faculty</option>
                                </select>
                            </div>
                        </div>
                        <DialogFooter className="p-8 bg-surface-hover border-t border-border mt-0">
                            <Button variant="ghost" onClick={() => setIsAddUserOpen(false)} className="text-muted hover:text-white hover:bg-surface rounded-xl px-6 h-12 font-bold focus:ring-0">Discard</Button>
                            <Button
                                onClick={handleCreateUser}
                                disabled={!newUserForm.username || !newUserForm.password}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black font-heading rounded-xl px-8 h-12 transition-all"
                            >
                                Authorize Account
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit User Modal */}
                <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
                    <DialogContent className="sm:max-w-xl bg-surface border border-border shadow-2xl rounded-[2rem] p-0 overflow-hidden">
                        <DialogHeader className="p-8 pb-0">
                            <DialogTitle className="text-3xl font-black text-white font-heading tracking-tight">Modify Identity</DialogTitle>
                            <p className="text-muted font-medium">Update secure parameters for the authorized account.</p>
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
                                    <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-1">Email <span className="text-rose-500 font-normal ml-1 tracking-normal">(Immutable)</span></label>
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
                                    <label className="text-[10px] uppercase font-black text-muted tracking-widest ml-1">System Role</label>
                                    <select
                                        className="w-full h-12 rounded-xl bg-background border border-border text-white text-sm font-bold px-4 hover:border-border-hover focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer appearance-none"
                                        value={editUserForm.role}
                                        onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                                    >
                                        <option className="bg-surface" value="UNI_ADMIN">University Admin</option>
                                        <option className="bg-surface" value="DEPT_ADMIN">Department Admin</option>
                                        <option className="bg-surface" value="FACULTY">Faculty</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-1">Physical Address</label>
                                <Input
                                    className="bg-surface border-border focus:border-neon-cyan/50 h-12 rounded-xl text-text-primary font-medium"
                                    placeholder="Location Address"
                                    value={editUserForm.address}
                                    onChange={(e) => setEditUserForm({ ...editUserForm, address: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter className="p-8 bg-surface-hover border-t border-border mt-0">
                            <Button variant="ghost" onClick={() => setIsEditUserOpen(false)} className="text-muted hover:text-white hover:bg-surface rounded-xl px-6 h-12 font-bold focus:ring-0">Cancel</Button>
                            <Button
                                onClick={handleEditUser}
                                disabled={!editUserForm.username}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black font-heading rounded-xl px-8 h-12 transition-all"
                            >
                                Commit Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reset Password Modal */}
                <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
                    <DialogContent className="sm:max-w-md bg-surface border-border">
                        <DialogHeader>
                            <DialogTitle className="text-white font-heading font-black">Force Security Refresh</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-red-500">New Secure Password</label>
                                <Input
                                    type="password"
                                    placeholder="Enter new 6+ char password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="bg-background border-border text-white focus:ring-red-500/20 focus:border-red-500/50"
                                />
                                <p className="text-xs text-muted">Overwrites the previous credential. The user must use this new access key to authenticate.</p>
                            </div>
                        </div>
                        <DialogFooter className="border-t border-border pt-4">
                            <Button variant="outline" className="border-border text-muted hover:text-white hover:bg-surface-hover" onClick={() => setIsResetPasswordOpen(false)}>Cancel</Button>
                            <Button variant="outline" className="bg-red-500 text-white hover:bg-red-600 border-none font-bold" onClick={handleResetPassword} disabled={newPassword.length < 6}>Reset Identity Key</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </DashboardLayout>
        </ProtectedRoute>
    );
}
