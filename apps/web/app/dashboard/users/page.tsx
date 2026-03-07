'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuUsers, LuUserPlus, LuShieldAlert, LuKeyRound, LuPower, LuPowerOff, LuUser } from 'react-icons/lu';
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
    const [usersList, setUsersList] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
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

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/users');
            setUsersList(data);
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        if (currentUser?.universityId) {
            fetchUsers();
        }
    }, [fetchUsers, currentUser?.universityId]);

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
            fetchUsers();
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
            fetchUsers();
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
                    fetchUsers();
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
            fetchUsers();
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
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-text-primary glow-sm">Users Directory</h2>
                        <p className="text-slate-600 dark:text-text-muted mt-1">Manage institutional access, roles, and security credentials.</p>
                    </div>
                    <Button onClick={() => setIsAddUserOpen(true)} className="bg-neon-cyan text-slate-900 font-bold shadow-[0_0_15px_rgba(57,193,239,0.4)] hover:shadow-[0_0_25px_rgba(57,193,239,0.6)] transition-all">
                        <LuUserPlus className="w-4 h-4 mr-2" /> Provision User
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
                ) : (
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-border backdrop-blur-md shadow-xl dark:shadow-2xl overflow-hidden rounded-2xl">
                        <CardHeader className="bg-slate-50 dark:bg-surface border-b border-slate-200 dark:border-border pb-6">
                            <CardTitle className="text-xl text-slate-900 dark:text-text-primary">Institutional Accounts</CardTitle>
                            <CardDescription className="text-slate-600 dark:text-text-muted">A complete registry of users authorized within this university division.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="table-container">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-text-secondary dark:text-text-muted uppercase bg-slate-50 dark:bg-surface">
                                        <tr>
                                            <th className="px-6 py-5 font-bold tracking-wider">User Identity</th>
                                            <th className="px-6 py-5 font-bold tracking-wider">Access Role</th>
                                            <th className="px-6 py-5 font-bold tracking-wider">Contact</th>
                                            <th className="px-6 py-5 font-bold tracking-wider">Status</th>
                                            <th className="px-6 py-5 font-bold tracking-wider text-right">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {usersList.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-surface transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-neon-cyan transition-colors">{user.username}</div>
                                                    <div className="text-text-secondary dark:text-text-secondary text-xs mt-0.5">{user.email || 'No email provided'}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-slate-700 dark:text-text-muted font-medium">
                                                    {user.phoneNumber || '—'}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {user.isActive ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></div> Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2"></div> Disabled
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-slate-900 dark:text-text-primary hover:bg-slate-100 dark:hover:bg-surface-hover border border-slate-200 dark:border-border rounded-xl font-bold"
                                                        onClick={() => {
                                                            setSelectedUserId(user.id);
                                                            setEditUserForm({
                                                                username: user.username,
                                                                email: user.email || '',
                                                                role: user.role,
                                                                phoneNumber: user.phoneNumber || '',
                                                                address: user.address || ''
                                                            });
                                                            setIsEditUserOpen(true);
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 border border-amber-500/10 rounded-xl font-bold"
                                                        onClick={() => { setSelectedUserId(user.id); setIsResetPasswordOpen(true); }}
                                                    >
                                                        <LuKeyRound className="w-3.5 h-3.5 mr-1" /> Reset
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={cn(
                                                            "rounded-xl font-bold border transition-all",
                                                            user.isActive
                                                                ? "text-rose-400 border-rose-500/10 hover:bg-rose-500/10 hover:text-rose-300"
                                                                : "text-emerald-400 border-emerald-500/10 hover:bg-emerald-500/10 hover:text-emerald-300"
                                                        )}
                                                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                    >
                                                        {user.isActive ? <LuPowerOff className="w-3.5 h-3.5 mr-1" /> : <LuPower className="w-3.5 h-3.5 mr-1" />}
                                                        {user.isActive ? 'Disable' : 'Enable'}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/10 rounded-xl font-bold"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {usersList.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                                                    <LuShieldAlert className="w-8 h-8 mx-auto text-text-muted mb-2" />
                                                    No users registered in this university.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Add User Modal */}
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogContent className="sm:max-w-xl bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-border shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-0 overflow-hidden">
                        <DialogHeader className="p-8 pb-0">
                            <DialogTitle className="text-3xl font-black text-slate-900 dark:text-text-primary tracking-tight">Provision Identity</DialogTitle>
                            <p className="text-slate-600 dark:text-text-muted font-medium">Generate a new secure access point for institutional management.</p>
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
                                <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-1">Institutional Role</label>
                                <select
                                    className="w-full h-12 rounded-xl bg-surface border border-border text-text-primary text-sm font-bold px-4 focus:border-neon-cyan/50 outline-none transition-all cursor-pointer appearance-none"
                                    value={newUserForm.role}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                                >
                                    <option className="bg-[#0a0a0c]" value="UNI_ADMIN">University Admin</option>
                                    <option className="bg-[#0a0a0c]" value="DEPT_ADMIN">Department Admin</option>
                                    <option className="bg-[#0a0a0c]" value="FACULTY">Faculty</option>
                                </select>
                            </div>
                        </div>
                        <DialogFooter className="p-8 bg-surface border-t border-border">
                            <Button variant="ghost" onClick={() => setIsAddUserOpen(false)} className="text-text-muted hover:text-text-primary hover:bg-surface rounded-xl px-6 h-12 font-bold">Discard</Button>
                            <Button
                                onClick={handleCreateUser}
                                disabled={!newUserForm.username || !newUserForm.password}
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
                            <p className="text-text-muted font-medium">Update secure parameters for the authorized account.</p>
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
                                    <label className="text-[10px] uppercase font-black text-text-secondary tracking-widest ml-1">System Role</label>
                                    <select
                                        className="w-full h-12 rounded-xl bg-surface border border-border text-text-primary text-sm font-bold px-4 outline-none transition-all cursor-pointer appearance-none"
                                        value={editUserForm.role}
                                        onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                                    >
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
                                    placeholder="Location Address"
                                    value={editUserForm.address}
                                    onChange={(e) => setEditUserForm({ ...editUserForm, address: e.target.value })}
                                />
                            </div>
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
                            <DialogTitle>Force Security Refresh</DialogTitle>
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
                                <p className="text-xs text-text-secondary">Overwrites the previous credential. The user must use this new access key to authenticate.</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>Cancel</Button>
                            <Button variant="outline" className="bg-red-600 text-text-primary hover:bg-red-700 hover:text-text-primary" onClick={handleResetPassword} disabled={newPassword.length < 6}>Reset Identity Key</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </DashboardLayout>
        </ProtectedRoute>
    );
}
