'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuBuilding2, LuUsers, LuLayoutDashboard, LuUserPlus, LuShieldAlert, LuKeyRound, LuPower, LuPowerOff, LuClipboardList, LuUser } from 'react-icons/lu';
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
    const [usersList, setUsersList] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
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

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/users');
            setUsersList(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchUniversities();
    }, [fetchUsers, fetchUniversities]);

    const handleCreateUser = async () => {
        try {
            const payload = { ...newUserForm, entityId: newUserForm.universityId || null };
            await api.post('/users', payload);
            setIsAddUserOpen(false);
            setNewUserForm({ username: '', email: '', password: '', role: 'SUPERADMIN', universityId: '', phoneNumber: '' });
            fetchUsers();
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
            fetchUsers();
            showToast('success', 'User updated successfully!');
        } catch {
            showToast('error', 'Failed to update user. Username or email might be in use.');
        }
    };

    const handleDeleteUser = (id: string) => {
        askConfirm({
            title: 'Delete User',
            message: 'Permanently delete this user account? This action cannot be undone.',
            requireTypedConfirm: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/users/${id}`);
                    fetchUsers();
                } catch {
                    showToast('error', 'Failed to delete user. Cannot delete your own account.');
                }
            },
        });
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.patch(`/users/${id}/status`, { isActive: !currentStatus });
            fetchUsers();
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
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white glow-sm">Users Directory</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Manage platform access, roles, and reset credentials securely.</p>
                    </div>
                    <Button onClick={() => setIsAddUserOpen(true)} className="bg-neon-cyan text-slate-900 font-bold shadow-[0_0_15px_rgba(57,193,239,0.4)] hover:shadow-[0_0_25px_rgba(57,193,239,0.6)] transition-all">
                        <LuUserPlus className="w-4 h-4 mr-2" /> Add User
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
                ) : (
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-white/5 backdrop-blur-md shadow-xl dark:shadow-2xl overflow-hidden rounded-2xl">
                        <CardHeader className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 pb-6">
                            <CardTitle className="text-xl text-slate-900 dark:text-white">Registered Accounts</CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-400">A complete list of users registered across the multi-tenant architecture.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-white/5">
                                        <tr>
                                            <th className="px-6 py-5 font-bold tracking-wider">User</th>
                                            <th className="px-6 py-5 font-bold tracking-wider">Role</th>
                                            <th className="px-6 py-5 font-bold tracking-wider">Affiliation</th>
                                            <th className="px-6 py-5 font-bold tracking-wider">Status</th>
                                            <th className="px-6 py-5 font-bold tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {usersList.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-neon-cyan transition-colors">{user.username}</div>
                                                    <div className="text-slate-500 dark:text-slate-500 text-xs mt-0.5">{user.email || 'No email provided'}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-slate-700 dark:text-slate-300 font-medium">
                                                    {user.university ? user.university.shortName : 'System Wide'}
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
                                                        className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded-xl font-bold"
                                                        onClick={() => {
                                                            setSelectedUserId(user.id);
                                                            setEditUserForm({
                                                                username: user.username,
                                                                email: user.email || '',
                                                                role: user.role,
                                                                universityId: user.universityId || '',
                                                                phoneNumber: (user as any).phoneNumber || '',
                                                                address: (user as any).address || ''
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
                                                </td>
                                            </tr>
                                        ))}
                                        {usersList.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                    <LuShieldAlert className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                                    No users found in the system.
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
                    <DialogContent className="sm:max-w-xl bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-0 overflow-hidden">
                        <DialogHeader className="p-8 pb-0">
                            <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Provision Identity</DialogTitle>
                            <p className="text-slate-600 dark:text-slate-400 font-medium">Create a new secure access point for the matrix.</p>
                        </DialogHeader>
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Username</label>
                                    <Input
                                        className="bg-white/5 border-white/5 focus:border-neon-cyan/50 h-12 rounded-xl text-white font-medium"
                                        placeholder="Identity Identifier"
                                        value={newUserForm.username}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Email Address</label>
                                    <Input
                                        className="bg-white/5 border-white/5 focus:border-neon-cyan/50 h-12 rounded-xl text-white font-medium"
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={newUserForm.email}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Contact Number</label>
                                    <Input
                                        className="bg-white/5 border-white/5 focus:border-neon-cyan/50 h-12 rounded-xl text-white font-medium"
                                        placeholder="+91 9876543210"
                                        value={newUserForm.phoneNumber}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, phoneNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Access Key</label>
                                    <Input
                                        className="bg-white/5 border-white/5 focus:border-neon-cyan/50 h-12 rounded-xl text-white font-medium"
                                        type="password"
                                        placeholder="••••••••"
                                        value={newUserForm.password}
                                        onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">System Role</label>
                                    <select
                                        className="w-full h-12 rounded-xl bg-white/5 border border-white/5 text-white text-sm font-bold px-4 focus:border-neon-cyan/50 outline-none transition-all cursor-pointer appearance-none"
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
                                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Partition Assignment</label>
                                        <select
                                            className="w-full h-12 rounded-xl bg-white/5 border border-white/5 text-white text-sm font-bold px-4 focus:border-neon-cyan/50 outline-none transition-all cursor-pointer appearance-none"
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
                        <DialogFooter className="p-8 bg-white/[0.02] border-t border-white/5">
                            <Button variant="ghost" onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-6 h-12 font-bold">Discard</Button>
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
                    <DialogContent className="sm:max-w-xl bg-[#0a0a0c] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-0 overflow-hidden">
                        <DialogHeader className="p-8 pb-0">
                            <DialogTitle className="text-3xl font-black text-white tracking-tight">Modify Identity</DialogTitle>
                            <p className="text-slate-400 font-medium">Update secure parameters for the user account.</p>
                        </DialogHeader>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Username</label>
                                    <Input
                                        className="bg-white/5 border-white/5 focus:border-neon-cyan/50 h-12 rounded-xl text-white font-medium"
                                        placeholder="Username"
                                        value={editUserForm.username}
                                        onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Email <span className="text-rose-500 font-normal ml-1 tracking-normal">(Locked)</span></label>
                                    <Input
                                        className="bg-white/5 border-white/5 h-12 rounded-xl text-slate-500 font-medium cursor-not-allowed opacity-50"
                                        type="email"
                                        disabled
                                        value={editUserForm.email}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Contact Number</label>
                                    <Input
                                        className="bg-white/5 border-white/5 focus:border-neon-cyan/50 h-12 rounded-xl text-white font-medium"
                                        placeholder="Phone Number"
                                        value={editUserForm.phoneNumber}
                                        onChange={(e) => setEditUserForm({ ...editUserForm, phoneNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">System Role</label>
                                    <select
                                        className="w-full h-12 rounded-xl bg-white/5 border border-white/5 text-white text-sm font-bold px-4 outline-none transition-all cursor-pointer appearance-none"
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
                                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Physical Address</label>
                                <Input
                                    className="bg-white/5 border-white/5 focus:border-neon-cyan/50 h-12 rounded-xl text-white font-medium"
                                    placeholder="Address"
                                    value={editUserForm.address}
                                    onChange={(e) => setEditUserForm({ ...editUserForm, address: e.target.value })}
                                />
                            </div>

                            {editUserForm.role !== 'SUPERADMIN' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Partition Assignment</label>
                                    <select
                                        className="w-full h-12 rounded-xl bg-white/5 border border-white/5 text-white text-sm font-bold px-4 outline-none transition-all cursor-pointer appearance-none"
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
                        <DialogFooter className="p-8 bg-white/[0.02] border-t border-white/5">
                            <Button variant="ghost" onClick={() => setIsEditUserOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-6 h-12 font-bold">Cancel</Button>
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
                                <p className="text-xs text-slate-500">This action cannot be undone. The user will be required to use this new credential to authenticate.</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>Cancel</Button>
                            <Button variant="outline" className="bg-red-600 text-white hover:bg-red-700 hover:text-white" onClick={handleResetPassword} disabled={newPassword.length < 6}>Reset Credentials</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </DashboardLayout>
        </ProtectedRoute>
    );
}
