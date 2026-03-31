'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import {
    LuLayers, LuPlus, LuTrash2, LuPencil,
    LuSearch, LuTriangleAlert, LuUserCheck,
    LuChevronDown, LuChevronUp, LuUsers, LuDoorOpen, LuUser
} from 'react-icons/lu';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DEPT_ADMIN_NAV } from '@/lib/constants/nav-config';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Batch {
    id: string;
    name: string;
    program: string | null;
}

interface Faculty {
    id: string;
    user: {
        name: string;
    };
}

interface Room {
    id: string;
    name: string;
    building: string | null;
}

interface Student {
    id: string;
    name: string;
    rollNumber: string | null;
    email: string;
}

interface Division {
    id: string;
    name: string;
    capacity: number;
    batchId: string;
    classTeacherId: string | null;
    primaryRoomId: string | null;
    batch: Batch;
    classTeacher?: {
        user: { name: string };
    };
    primaryRoom?: {
        name: string;
        building: string;
    };
    students: {
        student: Student;
    }[];
}

export default function DeptDivisionsPage() {
    const { user } = useAuthStore();
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [expandedDiv, setExpandedDiv] = useState<string | null>(null);

    // Dialog state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
    const [error, setError] = useState('');

    // Form state
    const [form, setForm] = useState({
        name: '',
        capacity: 60,
        batchId: '',
        classTeacherId: '',
        primaryRoomId: ''
    });

    const fetchData = useCallback(async () => {
        if (!user?.entityId) return;
        setLoading(true);
        try {
            const [divRes, batchRes, facRes, roomRes] = await Promise.all([
                api.get('/v2/divisions'),
                api.get('/batches'),
                api.get('/faculty'),
                api.get('/resources') // Assuming rooms are resources
            ]);
            setDivisions(divRes.data);
            setBatches(batchRes.data);
            setFaculties(facRes.data);
            setRooms(roomRes.data.filter((r: any) => r.type === 'CLASSROOM'));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [user?.entityId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCreate = async () => {
        try {
            setError('');
            await api.post('/v2/divisions', {
                ...form,
                departmentId: user?.entityId
            });
            setIsAddOpen(false);
            fetchData();
        } catch (e: any) {
            setError(e.response?.data?.error || 'Failed to create division');
        }
    };

    const handleUpdate = async () => {
        if (!selectedDivision) return;
        try {
            setError('');
            await api.put(`/v2/divisions/${selectedDivision.id}`, form);
            setIsEditOpen(false);
            fetchData();
        } catch (e: any) {
            setError(e.response?.data?.error || 'Failed to update division');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this division? All class assignments and student enrollments will be removed.')) return;
        try {
            await api.delete(`/v2/divisions/${id}`);
            fetchData();
        } catch (e: any) {
            alert(e.response?.data?.error || 'Failed to delete division');
        }
    };

    const filteredDivisions = divisions.filter(div =>
        div.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        div.batch.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN']}>
            <DashboardLayout navItems={DEPT_ADMIN_NAV} title="Divisions">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Academic Divisions</h2>
                        <p className="text-slate-500 dark:text-slate-400">Manage sections, class teachers, and student rosters.</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-72">
                            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search divisions or batches..."
                                className="pl-10 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => {
                            setForm({ name: '', capacity: 60, batchId: '', classTeacherId: '', primaryRoomId: '' });
                            setError('');
                            setIsAddOpen(true);
                        }} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-6">
                            <LuPlus className="w-5 h-5 mr-2" /> New Division
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-24 space-y-4">
                        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                        <p className="text-slate-500 animate-pulse font-medium">Curating academic records...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {filteredDivisions.map((div) => (
                            <Card key={div.id} className="group relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                                
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                                                <span className="text-primary font-black text-xl">{div.name}</span>
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                                    Division {div.name}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-1">
                                                    <span className="font-semibold text-slate-600 dark:text-slate-300">{div.batch.name}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                                    <span className="text-primary/80 dark:text-primary/60">{div.batch.program}</span>
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary"
                                                onClick={() => {
                                                    setSelectedDivision(div);
                                                    setForm({
                                                        name: div.name,
                                                        capacity: div.capacity,
                                                        batchId: div.batchId,
                                                        classTeacherId: div.classTeacherId || '',
                                                        primaryRoomId: div.primaryRoomId || ''
                                                    });
                                                    setError('');
                                                    setIsEditOpen(true);
                                                }}>
                                                <LuPencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-500"
                                                onClick={() => handleDelete(div.id)}>
                                                <LuTrash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                                <LuUser className="w-3 h-3" /> Class Teacher
                                            </div>
                                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                {div.classTeacher?.user.name || 'Not assigned'}
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                                <LuDoorOpen className="w-3 h-3" /> Primary Room
                                            </div>
                                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                                                {div.primaryRoom ? `${div.primaryRoom.name} (${div.primaryRoom.building})` : 'Not assigned'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <div className="flex items-center gap-2">
                                            <LuUsers className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                                {div.students.length} / {div.capacity} Students
                                            </span>
                                        </div>
                                        <div className="text-xs font-bold text-primary">
                                            {Math.round((div.students.length / div.capacity) * 100)}% Occupancy
                                        </div>
                                    </div>
                                    
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
                                        <div 
                                            className={cn(
                                                "h-full rounded-full transition-all duration-500",
                                                div.students.length > div.capacity ? "bg-red-500" : "bg-primary"
                                            )}
                                            style={{ width: `${Math.min(100, (div.students.length / div.capacity) * 100)}%` }}
                                        />
                                    </div>

                                    <Button 
                                        variant="outline" 
                                        className="w-full border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 justify-between items-center h-11"
                                        onClick={() => setExpandedDiv(expandedDiv === div.id ? null : div.id)}
                                    >
                                        <span className="flex items-center gap-2">
                                            <LuUserCheck className="w-4 h-4 text-primary" />
                                            View Student Roster
                                        </span>
                                        {expandedDiv === div.id ? <LuChevronUp className="w-4 h-4" /> : <LuChevronDown className="w-4 h-4" />}
                                    </Button>

                                    {expandedDiv === div.id && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {div.students.length === 0 ? (
                                                <div className="text-center py-6 text-slate-500 text-sm">No students assigned to this division yet.</div>
                                            ) : (
                                                <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                                    {div.students.map(({ student }) => (
                                                        <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100/50 dark:border-slate-800/50 group/item">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                                                                    {student.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.name}</div>
                                                                    <div className="text-xs text-slate-500">{student.rollNumber || student.email}</div>
                                                                </div>
                                                            </div>
                                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover/item:opacity-100 text-primary text-xs h-7">Details</Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* ── Add/Edit Dialog ────────────────────────────────────────── */}
                <Dialog open={isAddOpen || isEditOpen} onOpenChange={(o) => { setIsAddOpen(false); setIsEditOpen(false); }}>
                    <DialogContent className="sm:max-w-lg dark:bg-slate-900 dark:border-slate-800">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <LuLayers className="text-primary" />
                                {isAddOpen ? 'Create New Division' : 'Update Division'}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-6">
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex gap-3 animate-shake">
                                    <LuTriangleAlert className="w-5 h-5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Division Name</label>
                                    <Input 
                                        placeholder="e.g. A, B, C" 
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })}
                                        className="h-11 dark:bg-slate-950 dark:border-slate-800"
                                        maxLength={5}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Capacity</label>
                                    <Input 
                                        type="number" 
                                        value={form.capacity}
                                        onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
                                        className="h-11 dark:bg-slate-950 dark:border-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Target Batch</label>
                                <select 
                                    className="w-full h-11 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={form.batchId}
                                    onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                                    disabled={isEditOpen}
                                >
                                    <option value="">Select a batch...</option>
                                    {batches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.program})</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Class Teacher</label>
                                <select 
                                    className="w-full h-11 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={form.classTeacherId}
                                    onChange={(e) => setForm({ ...form, classTeacherId: e.target.value })}
                                >
                                    <option value="">No specific assignment</option>
                                    {faculties.map(f => <option key={f.id} value={f.id}>{f.user.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Primary Classroom</label>
                                <select 
                                    className="w-full h-11 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={form.primaryRoomId}
                                    onChange={(e) => setForm({ ...form, primaryRoomId: e.target.value })}
                                >
                                    <option value="">No specific room</option>
                                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.building})</option>)}
                                </select>
                            </div>
                        </div>

                        <DialogFooter className="gap-3">
                            <Button variant="ghost" className="h-11 px-8" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Cancel</Button>
                            <Button 
                                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-11 px-8 min-w-[120px]" 
                                onClick={isAddOpen ? handleCreate : handleUpdate}
                                disabled={!form.name || !form.batchId}
                            >
                                {isAddOpen ? 'Create Division' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
