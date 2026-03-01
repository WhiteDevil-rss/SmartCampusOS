'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuBuilding2, LuPlus, LuUsers, LuLayoutDashboard, LuPencil, LuTrash2, LuClipboardList } from 'react-icons/lu';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast, Toast } from '@/components/ui/toast-alert';
import { useConfirm, ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SUPERADMIN_NAV } from '@/lib/constants/nav-config';

interface University {
    id: string;
    name: string;
    shortName: string;
    location?: string;
    email?: string;
    _count?: {
        departments: number;
        faculty: number;
    };
}

export default function SuperAdminDashboard() {
    const { toast, showToast, hideToast } = useToast();
    const { confirmState, closeConfirm, askConfirm } = useConfirm();
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAddUniOpen, setIsAddUniOpen] = useState(false);
    const [isEditUniOpen, setIsEditUniOpen] = useState(false);
    const [editingUni, setEditingUni] = useState<University | null>(null);

    const [newUniForm, setNewUniForm] = useState({
        name: '', shortName: '', location: '', email: '', adminUsername: '', adminPassword: ''
    });

    const [editUniForm, setEditUniForm] = useState({
        name: '', shortName: '', location: '', email: ''
    });

    const fetchUniversities = useCallback(async () => {
        try {
            const { data } = await api.get('/universities');
            setUniversities(data);
        } catch (e) {
            console.warn(e);
            showToast('error', 'Failed to fetch universities');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchUniversities();
    }, [fetchUniversities]);

    const handleCreateUniversity = async () => {
        try {
            await api.post('/universities', newUniForm);
            setIsAddUniOpen(false);
            setNewUniForm({ name: '', shortName: '', location: '', email: '', adminUsername: '', adminPassword: '' });
            fetchUniversities();
            showToast('success', 'University and Admin account implicitly created!');
        } catch (e: any) {
            console.warn(e);
            const errorMessage = e.response?.data?.error || 'Failed to create university. Ensure shortName or admin username is unique.';
            showToast('error', errorMessage);
        }
    };

    const handleUpdateUniversity = async () => {
        if (!editingUni) return;
        try {
            await api.put(`/universities/${editingUni.id}`, editUniForm);
            setIsEditUniOpen(false);
            setEditingUni(null);
            fetchUniversities();
            showToast('success', 'University updated successfully!');
        } catch (e) {
            console.warn(e);
            showToast('error', 'Failed to update university.');
        }
    };

    const handleDeleteUniversity = async (id: string, name: string) => {
        askConfirm({
            title: `Delete ${name}?`,
            message: 'This will permanently delete ALL associated data including departments, courses, faculty, and users. This action cannot be undone.',
            danger: true,
            requireTypedConfirm: true,
            confirmLabel: 'Yes, Delete Everything',
            onConfirm: async () => {
                try {
                    await api.delete(`/universities/${id}`);
                    fetchUniversities();
                    showToast('success', 'University and all associated data deleted successfully!');
                } catch (e) {
                    console.warn(e);
                    showToast('error', 'Failed to delete university.');
                }
            }
        });
    };

    const openEditDialog = (uni: University) => {
        setEditingUni(uni);
        setEditUniForm({
            name: uni.name,
            shortName: uni.shortName,
            location: uni.location || '',
            email: uni.email || ''
        });
        setIsEditUniOpen(true);
    };


    const navItems = SUPERADMIN_NAV;
    // [
    //     { title: 'Overview', href: '/superadmin', icon: <LuLayoutDashboard className="w-5 h-5" /> },
    //     { title: 'Universities', href: '/superadmin/universities', icon: <LuBuilding2 className="w-5 h-5" /> },
    //     { title: 'Users', href: '/superadmin/users', icon: <LuUsers className="w-5 h-5" /> },
    //     { title: 'Audit Logs', href: '/superadmin/logs', icon: <LuClipboardList className="w-5 h-5" /> },
    // ];

    return (
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <DashboardLayout navItems={navItems} title="Super Admin Dashboard">

                <div className="flex justify-between items-center mb-10 relative z-20">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white glow-sm">Institutions Matrix</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium">Manage global university partitions securely via the Neural Constraint Solver matrix.</p>
                    </div>
                    <Button
                        onClick={() => setIsAddUniOpen(true)}
                        className="bg-neon-cyan text-slate-900 font-black shadow-[0_0_20px_rgba(57,193,239,0.4)] hover:shadow-[0_0_35px_rgba(57,193,239,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 h-11 px-6 rounded-xl border border-transparent hover:border-white/20"
                    >
                        <LuPlus className="w-5 h-5 mr-1.5" /> Provision Partition
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><div className="w-12 h-12 rounded-full border-4 border-neon-cyan border-t-transparent animate-spin shadow-[0_0_20px_rgba(57,193,239,0.3)]" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-20">
                        {universities.map(uni => (
                            <div key={uni.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 backdrop-blur-md rounded-[2rem] overflow-hidden group hover:border-neon-cyan/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(57,193,239,0.1)] relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 blur-[40px] rounded-full group-hover:bg-neon-cyan/15 transition-all duration-500" />

                                <div className="p-8 border-b border-slate-100 dark:border-white/5 relative z-10">
                                    <div className="absolute right-6 top-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 text-slate-400 hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5"
                                            onClick={() => openEditDialog(uni)}
                                        >
                                            <LuPencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5"
                                            onClick={() => handleDeleteUniversity(uni.id, uni.name)}
                                        >
                                            <LuTrash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-start justify-between pr-20 text-slate-900 dark:text-white mb-3">
                                        <span className="font-black text-3xl tracking-tighter text-slate-900 dark:text-white">{uni.shortName}</span>
                                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase rounded-full tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">ACTIVE</span>
                                    </div>
                                    <p className="line-clamp-1 text-slate-500 dark:text-slate-400 font-bold text-sm tracking-tight">{uni.name}</p>
                                </div>
                                <div className="p-8 space-y-4 relative z-10 bg-slate-50 dark:bg-white/[0.02]">
                                    <div className="flex justify-between items-center text-sm group/stat">
                                        <span className="flex items-center text-slate-600 dark:text-slate-400 font-bold group-hover/stat:text-neon-cyan transition-colors"><LuBuilding2 className="w-4 h-4 mr-3 opacity-50" /> Topology Sectors</span>
                                        <span className="font-black text-slate-900 dark:text-white px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl group-hover/stat:border-neon-cyan/30 transition-all">{uni._count?.departments || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm group/stat">
                                        <span className="flex items-center text-slate-600 dark:text-slate-400 font-bold group-hover/stat:text-neon-cyan transition-colors"><LuUsers className="w-4 h-4 mr-3 opacity-50" /> Active Resources</span>
                                        <span className="font-black text-slate-900 dark:text-white px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl group-hover/stat:border-neon-cyan/30 transition-all">{uni._count?.faculty || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {universities.length === 0 && (
                            <div className="col-span-full py-16 text-center text-slate-600 dark:text-slate-400 glass-card rounded-[2rem] border-dashed border-slate-300 dark:border-white/20">
                                No partitions allocated. Initialize a new matrix to commence optimization.
                            </div>
                        )}
                    </div>
                )}

                {/* Add University Modal */}
                <Dialog open={isAddUniOpen} onOpenChange={setIsAddUniOpen}>
                    <DialogContent className="sm:max-w-xl bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-0 overflow-hidden">
                        <DialogHeader className="p-8 pb-0">
                            <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Provision Partition</DialogTitle>
                            <p className="text-slate-600 dark:text-slate-400 font-medium">Initialize a new secure matrix sector for institutional data.</p>
                        </DialogHeader>
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Institution Name</label>
                                    <Input
                                        className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 focus:border-neon-cyan/50 h-12 rounded-xl text-slate-900 dark:text-white font-medium"
                                        placeholder="Veer Narmad South Gujarat University"
                                        value={newUniForm.name}
                                        onChange={(e) => setNewUniForm({ ...newUniForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Short Name</label>
                                    <Input
                                        className="bg-white/5 border-white/5 focus:border-neon-cyan/50 h-12 rounded-xl text-white font-medium"
                                        placeholder="VNSGU"
                                        value={newUniForm.shortName}
                                        onChange={(e) => setNewUniForm({ ...newUniForm, shortName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-700 dark:text-slate-500 tracking-widest ml-1">Location</label>
                                    <Input
                                        className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 focus:border-neon-cyan/50 h-12 rounded-xl text-slate-900 dark:text-white font-medium"
                                        placeholder="Surat, Gujarat"
                                        value={newUniForm.location}
                                        onChange={(e) => setNewUniForm({ ...newUniForm, location: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-700 dark:text-slate-500 tracking-widest ml-1">Support Email</label>
                                    <Input
                                        className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 focus:border-neon-cyan/50 h-12 rounded-xl text-slate-900 dark:text-white font-medium"
                                        type="email"
                                        placeholder="admin@vnsgu.ac.in"
                                        value={newUniForm.email}
                                        onChange={(e) => setNewUniForm({ ...newUniForm, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-white/5" /></div>
                                <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-white dark:bg-[#0a0a0c] px-4 text-slate-500 tracking-widest">Root Matrix Credentials</span></div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-700 dark:text-slate-500 tracking-widest ml-1">Admin Identity</label>
                                    <Input
                                        className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 focus:border-neon-cyan/50 h-12 rounded-xl text-slate-900 dark:text-white font-medium"
                                        placeholder="sys_admin_vnsgu"
                                        value={newUniForm.adminUsername}
                                        onChange={(e) => setNewUniForm({ ...newUniForm, adminUsername: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-700 dark:text-slate-500 tracking-widest ml-1">Access Key</label>
                                    <Input
                                        className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 focus:border-neon-cyan/50 h-12 rounded-xl text-slate-900 dark:text-white font-medium"
                                        type="password"
                                        placeholder="••••••••"
                                        value={newUniForm.adminPassword}
                                        onChange={(e) => setNewUniForm({ ...newUniForm, adminPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="p-8 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/5">
                            <Button variant="ghost" onClick={() => setIsAddUniOpen(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl px-6 h-12 font-bold">Discard</Button>
                            <Button
                                onClick={handleCreateUniversity}
                                disabled={!newUniForm.name || !newUniForm.shortName || !newUniForm.adminUsername || !newUniForm.adminPassword}
                                className="bg-neon-cyan text-slate-900 font-black rounded-xl px-8 h-12 shadow-[0_0_20px_rgba(57,193,239,0.3)] hover:shadow-[0_0_30px_rgba(57,193,239,0.5)] transition-all"
                            >
                                Authorize Matrix
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit University Modal */}
                <Dialog open={isEditUniOpen} onOpenChange={setIsEditUniOpen}>
                    <DialogContent className="sm:max-w-lg bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-0 overflow-hidden">
                        <DialogHeader className="p-8 pb-0">
                            <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Reconfigure Sector</DialogTitle>
                            <p className="text-slate-600 dark:text-slate-400 font-medium">Modify parameters for the selected institutional partition.</p>
                        </DialogHeader>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-700 dark:text-slate-500 tracking-widest ml-1">Institution Name</label>
                                    <Input
                                        className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 focus:border-neon-cyan/50 h-12 rounded-xl text-slate-900 dark:text-white font-medium"
                                        placeholder="Institution Name"
                                        value={editUniForm.name}
                                        onChange={(e) => setEditUniForm({ ...editUniForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-700 dark:text-slate-500 tracking-widest ml-1">Short Name</label>
                                    <Input
                                        className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 focus:border-neon-cyan/50 h-12 rounded-xl text-slate-900 dark:text-white font-medium"
                                        placeholder="Short Name"
                                        value={editUniForm.shortName}
                                        onChange={(e) => setEditUniForm({ ...editUniForm, shortName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-700 dark:text-slate-500 tracking-widest ml-1">Location</label>
                                    <Input
                                        className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 focus:border-neon-cyan/50 h-12 rounded-xl text-slate-900 dark:text-white font-medium"
                                        placeholder="Location"
                                        value={editUniForm.location}
                                        onChange={(e) => setEditUniForm({ ...editUniForm, location: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-700 dark:text-slate-500 tracking-widest ml-1">Support Email</label>
                                    <Input
                                        className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 focus:border-neon-cyan/50 h-12 rounded-xl text-slate-900 dark:text-white font-medium"
                                        type="email"
                                        placeholder="Contact Email"
                                        value={editUniForm.email}
                                        onChange={(e) => setEditUniForm({ ...editUniForm, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="p-8 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/5">
                            <Button variant="ghost" onClick={() => setIsEditUniOpen(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl px-6 h-12 font-bold">Cancel</Button>
                            <Button
                                onClick={handleUpdateUniversity}
                                disabled={!editUniForm.name || !editUniForm.shortName}
                                className="bg-neon-cyan text-slate-900 font-black rounded-xl px-8 h-12 shadow-[0_0_20px_rgba(57,193,239,0.3)] hover:shadow-[0_0_30px_rgba(57,193,239,0.5)] transition-all"
                            >
                                Commit Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Toast toast={toast} onClose={hideToast} />
                <ConfirmDialog state={confirmState} onClose={closeConfirm} />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
