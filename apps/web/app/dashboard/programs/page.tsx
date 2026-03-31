'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuPlus, LuTrash2, LuPencil, LuClock, LuLayers, LuSearch, LuGraduationCap } from 'react-icons/lu';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog, useConfirm } from '@/components/ui/confirm-dialog';
import { Toast, useToast } from '@/components/ui/toast-alert';
import { UNI_ADMIN_NAV } from '@/lib/constants/nav-config';

const PROGRAM_TYPES = ['UG', 'PG', 'Diploma', 'Ph.D'];

const emptyForm = { name: '', shortName: '', type: 'PG', duration: 2, totalSems: 4 };

type ProgramForm = typeof emptyForm;

function ProgramFormFields({
    form,
    setForm,
    error,
}: {
    form: ProgramForm;
    setForm: (f: ProgramForm) => void;
    error: string;
}) {
    return (
        <div className="space-y-4 py-4">
            {error && <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-sm">{error}</div>}
            <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Full Program Name</label>
                <Input
                    placeholder="e.g. Master of Computer Application"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-background/50 border-border-hover text-white"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Short Name / Code</label>
                    <Input
                        placeholder="e.g. MCA"
                        value={form.shortName}
                        onChange={(e) => setForm({ ...form, shortName: e.target.value.toUpperCase() })}
                        className="bg-background/50 border-border-hover text-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Program Type</label>
                    <select
                        className="w-full h-10 rounded-md border border-input bg-background/50 border-border-hover text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                        {PROGRAM_TYPES.map(t => <option key={t} value={t} className="bg-surface text-white">{t}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Duration (Years)</label>
                    <Input
                        type="number" min="1" max="6"
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 2 })}
                        className="bg-background/50 border-border-hover text-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted">Total Semesters</label>
                    <Input
                        type="number" min="1" max="12"
                        value={form.totalSems}
                        onChange={(e) => setForm({ ...form, totalSems: parseInt(e.target.value) || 4 })}
                        className="bg-background/50 border-border-hover text-white"
                    />
                </div>
            </div>
        </div>
    );
}

const typeColors: Record<string, string> = {
    PG: 'bg-purple-500/10 text-purple-400 border-purple-500/20 font-bold',
    UG: 'bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold',
    Diploma: 'bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold',
    'Ph.D': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold',
};

interface Program {
    id: string;
    name: string;
    shortName: string;
    type: string;
    duration: number;
    totalSems: number;
}

export default function UniversityPrograms() {
    const { user } = useAuthStore();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [addForm, setAddForm] = useState<ProgramForm>({ ...emptyForm });
    const [editForm, setEditForm] = useState<ProgramForm>({ ...emptyForm });
    const [error, setError] = useState('');
    const { confirmState, closeConfirm, askConfirm } = useConfirm();
    const { toast, showToast, hideToast } = useToast();

    const fetchData = useCallback(async () => {
        if (!user?.universityId) return;
        setLoading(true);
        try {
            const { data } = await api.get('/programs');
            setPrograms(data);
        } catch (err) {
            console.error(err);
            showToast('error', 'Failed to fetch academic programs');
        } finally {
            setLoading(false);
        }
    }, [user?.universityId, showToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = programs.filter(p =>
        !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.shortName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = async () => {
        setError('');
        try {
            await api.post('/programs', { ...addForm, universityId: user?.universityId });
            setIsAddOpen(false);
            setAddForm({ ...emptyForm });
            fetchData();
            showToast('success', 'Program registered successfully');
        } catch (e) {
            setError((e as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to create program.');
        }
    };

    const handleEdit = async () => {
        if (!selectedId) return;
        setError('');
        try {
            await api.put(`/programs/${selectedId}`, editForm);
            setIsEditOpen(false);
            fetchData();
            showToast('success', 'Program configurations updated');
        } catch (e) {
            setError((e as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to update program.');
        }
    };

    const handleDelete = (id: string) => {
        askConfirm({
            title: 'Purge Academic Program',
            message: 'Delete this program from the university catalog? This may affect linked subjects and student cohorts. This action is irreversible.',
            requireTypedConfirm: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/programs/${id}`);
                    fetchData();
                    showToast('success', 'Program purged from registry');
                } catch (e) {
                    showToast('error', (e as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to delete program.');
                }
            },
        });
    };

    return (
        <ProtectedRoute allowedRoles={['UNI_ADMIN']}>
            <DashboardLayout navItems={UNI_ADMIN_NAV} title="Academic Portfolio">
                <ConfirmDialog state={confirmState} onClose={closeConfirm} />
                <Toast toast={toast} onClose={hideToast} />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white font-heading font-black">Programs Directory</h2>
                        <p className="text-muted">Configure and manage degree programs across the entire university.</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 shadow-sm w-full sm:w-64">
                            <LuSearch className="w-4 h-4 text-muted shrink-0" />
                            <Input
                                placeholder="Search programs..."
                                className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm placeholder:text-muted/50 text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => { setError(''); setIsAddOpen(true); }} className="bg-primary shadow-md hover:bg-primary/90 text-primary-foreground font-bold">
                            <LuPlus className="w-4 h-4 mr-2" /> Add Program
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(prog => (
                            <Card key={prog.id} className="bg-surface shadow-sm border-border hover:border-primary/50 transition-colors overflow-hidden group">
                                <CardHeader className="pb-3 border-b bg-surface-hover border-border p-5">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <CardTitle className="text-base font-bold text-white font-heading leading-tight line-clamp-2">{prog.name}</CardTitle>
                                            <CardDescription className="font-mono font-bold text-sm mt-1 text-primary">{prog.shortName}</CardDescription>
                                        </div>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border shrink-0 ${typeColors[prog.type] || 'bg-surface border-border text-muted'}`}>
                                            {prog.type}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-5 pb-5 px-5">
                                    <div className="grid grid-cols-2 gap-3 mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-background border border-border"><LuClock className="w-4 h-4 text-primary" /></div>
                                            <div>
                                                <div className="text-[10px] text-muted font-bold uppercase tracking-wider">Duration</div>
                                                <div className="text-sm font-semibold text-white">{prog.duration} {prog.duration === 1 ? 'Year' : 'Years'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-background border border-border"><LuLayers className="w-4 h-4 text-primary" /></div>
                                            <div>
                                                <div className="text-[10px] text-muted font-bold uppercase tracking-wider">Semesters</div>
                                                <div className="text-sm font-semibold text-white">{prog.totalSems} Sem</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" size="sm" className="w-1/2 text-muted hover:text-white border-border hover:bg-surface-hover font-bold font-heading bg-transparent"
                                            onClick={() => {
                                                setSelectedId(prog.id);
                                                setEditForm({ name: prog.name, shortName: prog.shortName, type: prog.type, duration: prog.duration, totalSems: prog.totalSems });
                                                setError('');
                                                setIsEditOpen(true);
                                            }}>
                                            <LuPencil className="w-4 h-4 mr-1.5" /> Edit
                                        </Button>
                                        <Button variant="outline" size="sm" className="w-1/2 text-red-500 border-red-500/20 hover:bg-red-500/10 hover:text-red-400 font-bold font-heading bg-transparent"
                                            onClick={() => handleDelete(prog.id)}>
                                            <LuTrash2 className="w-4 h-4 mr-1.5" /> Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {filtered.length === 0 && (
                            <div className="col-span-full py-16 text-center text-muted bg-surface rounded-xl border-dashed border-2 border-border/50">
                                <LuGraduationCap className="w-12 h-12 text-muted/30 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-white">{searchTerm ? `No results for "${searchTerm}"` : 'No programs registered'}</h3>
                                <p className="text-sm mt-1">{searchTerm ? 'Try a different search term' : 'Add degree programs to the university academic catalog.'}</p>
                            </div>
                        )}
                    </div>
                )}

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="sm:max-w-md bg-surface border-border">
                        <DialogHeader><DialogTitle className="text-white font-heading font-black">Register Academic Program</DialogTitle></DialogHeader>
                        <ProgramFormFields form={addForm} setForm={setAddForm} error={error} />
                        <DialogFooter className="border-t border-border pt-4">
                            <Button variant="outline" className="border-border text-muted hover:bg-surface-hover hover:text-white" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold" onClick={handleCreate} disabled={!addForm.name || !addForm.shortName}>Save Program</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-md bg-surface border-border">
                        <DialogHeader><DialogTitle className="text-white font-heading font-black">Edit Program Details</DialogTitle></DialogHeader>
                        <ProgramFormFields form={editForm} setForm={setEditForm} error={error} />
                        <DialogFooter className="border-t border-border pt-4">
                            <Button variant="outline" className="border-border text-muted hover:bg-surface-hover hover:text-white" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold" onClick={handleEdit} disabled={!editForm.name || !editForm.shortName}>Commit Revisions</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
