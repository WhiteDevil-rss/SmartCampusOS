'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams, useRouter } from 'next/navigation';
import { LuCheck, LuX, LuSave, LuUsers, LuUserCheck } from 'react-icons/lu';
import { cn } from '@/lib/utils';

export function AttendanceManagement() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const slotId = searchParams.get('slot');

    const [students, setStudents] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slotId) {
            setError('No timetable slot selected');
            setLoading(false);
            return;
        }

        const fetchStudents = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/attendance/students/${slotId}`);
                setStudents(res.data);
                // Initialize all as Present by default
                const initial: Record<string, 'PRESENT' | 'ABSENT'> = {};
                res.data.forEach((s: any) => initial[s.id] = 'PRESENT');
                setAttendance(initial);
            } catch (err: any) {
                console.error('Fetch Students Error:', err);
                setError(err.response?.data?.error || 'Failed to load students');
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [slotId]);

    const toggleStatus = (studentId: string) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'PRESENT' ? 'ABSENT' : 'PRESENT'
        }));
    };

    const markAll = (status: 'PRESENT' | 'ABSENT') => {
        const updated: Record<string, 'PRESENT' | 'ABSENT'> = {};
        students.forEach(s => updated[s.id] = status);
        setAttendance(updated);
    };

    const handleSave = async () => {
        if (!slotId) return;
        try {
            setSaving(true);
            // 1. Create session
            const sessionRes = await api.post('/attendance/session', {
                timetableSlotId: slotId,
                date: new Date().toISOString(),
                method: 'MANUAL',
                openedAt: new Date().toISOString()
            });

            const sessionId = sessionRes.data.id;

            // 2. Bulk mark
            const records = students.map(s => ({
                studentId: s.id,
                status: attendance[s.id],
                method: 'MANUAL'
            }));

            await api.post('/attendance/bulk-mark', {
                sessionId,
                records
            });

            router.push('/faculty?attendance=success');
        } catch (err: any) {
            console.error('Save Attendance Error:', err);
            alert('Failed to save attendance: ' + (err.response?.data?.error || 'Internal Error'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Skeleton className="h-96 rounded-3xl bg-surface" />;
    if (error) return <div className="p-10 text-center text-rose-500 font-bold">{error}</div>;

    const presentCount = Object.values(attendance).filter(s => s === 'PRESENT').length;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-surface/50 p-8 rounded-3xl border border-border">
                <div>
                    <h3 className="text-2xl font-black text-text-primary flex items-center gap-3">
                        <LuUsers className="text-primary" />
                        Mark Attendance
                    </h3>
                    <p className="text-text-muted text-sm font-medium mt-1">
                        Batch: {students[0]?.batch?.name || 'Loading...'} • {students.length} Students Total
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-black uppercase tracking-widest">
                        {presentCount} Present
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-black uppercase tracking-widest">
                        {students.length - presentCount} Absent
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            <div className="flex gap-4">
                <Button variant="outline" onClick={() => markAll('PRESENT')} className="rounded-2xl gap-2 font-bold px-6 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10">
                    <LuCheck className="w-4 h-4" />
                    All Present
                </Button>
                <Button variant="outline" onClick={() => markAll('ABSENT')} className="rounded-2xl gap-2 font-bold px-6 border-rose-500/20 text-rose-500 hover:bg-rose-500/10">
                    <LuX className="w-4 h-4" />
                    All Absent
                </Button>
            </div>

            {/* Student List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => {
                    const isPresent = attendance[student.id] === 'PRESENT';
                    return (
                        <Card
                            key={student.id}
                            onClick={() => toggleStatus(student.id)}
                            className={cn(
                                "p-5 rounded-3xl border transition-all cursor-pointer group flex items-center justify-between",
                                isPresent
                                    ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
                                    : "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg transition-colors",
                                    isPresent ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500/20 text-rose-500"
                                )}>
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{student.name}</p>
                                    <p className="text-[10px] text-text-muted font-medium uppercase tracking-widest">{student.enrollmentNo}</p>
                                </div>
                            </div>
                            <div className={cn(
                                "p-2 rounded-full transition-transform group-active:scale-90",
                                isPresent ? "text-emerald-500" : "text-rose-500"
                            )}>
                                {isPresent ? <LuUserCheck className="w-6 h-6" /> : <LuX className="w-6 h-6" />}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Action Bar */}
            <div className="sticky bottom-10 left-0 right-0 py-6 px-10 flex justify-center z-20">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-full h-16 px-12 gap-3 shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.5)] transition-all font-black text-lg scale-110"
                >
                    {saving ? 'Saving...' : 'Finalize Attendance'}
                    <LuSave className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
