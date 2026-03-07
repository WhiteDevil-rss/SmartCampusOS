'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useStudentData } from '@/lib/hooks/use-student-data';
import { Card } from '@/components/ui/card';
import { LuCalendar, LuMapPin, LuUser, LuClock } from 'react-icons/lu';
import { Skeleton } from '@/components/ui/skeleton';

interface TimetableChange {
    substituteFaculty?: { name: string };
    newRoom?: { name: string };
    date: string;
}

interface TimetableSlot {
    dayOfWeek: number;
    slotNumber: number;
    startTime: string;
    endTime: string;
    course: { name: string; code: string };
    faculty: { name: string };
    room: { name: string };
    isBreak: boolean;
    isElective: boolean;
    timetableChanges?: TimetableChange[];
}

export function StudentTimetable() {
    const { profile, loading: profileLoading } = useStudentData();
    const [timetable, setTimetable] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile) return;

        const fetchTimetable = async () => {
            try {
                const res = await api.get(`/student/timetable?view=week`);
                setTimetable(res.data);
            } catch (err) {
                console.error('Failed to fetch timetable:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTimetable();
    }, [profile]);

    if (profileLoading || loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} className="h-48 rounded-3xl bg-surface" />
                ))}
            </div>
        );
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const slotsByDay = Array.from({ length: 6 }, () => [] as TimetableSlot[]);

    timetable?.slots?.forEach((slot: TimetableSlot) => {
        if (slot.dayOfWeek >= 1 && slot.dayOfWeek <= 6) {
            slotsByDay[slot.dayOfWeek - 1].push(slot);
        }
    });

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {days.map((day, dayIdx) => (
                    <div key={day} className="space-y-6">
                        <h2 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                            {day}
                        </h2>
                        <div className="space-y-4">
                            {slotsByDay[dayIdx].length > 0 ? (
                                slotsByDay[dayIdx].map((slot, i) => (
                                    <Card key={i} className={`p-5 glass-card border-border relative overflow-hidden group ${slot.isBreak ? 'opacity-60 grayscale' : ''}`}>
                                        {slot.isBreak ? (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 rounded-xl bg-surface border border-border text-text-muted">
                                                        <LuClock className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-text-muted uppercase tracking-widest">Interval</p>
                                                        <p className="text-lg font-bold text-text-primary/50">{slot.startTime} - {slot.endTime}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-5">
                                                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-surface border border-border text-primary">
                                                        <span className="text-xs font-black uppercase">{slot.startTime.split(':')[0]}</span>
                                                        <span className="text-[10px] font-bold text-text-muted">{slot.startTime.split(':')[1]} AM</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors flex items-center gap-2">
                                                            {slot.course?.name}
                                                            {slot.isElective && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 uppercase">Elective</span>}
                                                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                                                                {slot.course?.code}
                                                            </span>
                                                        </h3>
                                                        <div className="flex flex-col gap-1 mt-2">
                                                            {slot.timetableChanges && slot.timetableChanges.length > 0 ? (
                                                                <div className="flex items-center gap-4 bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
                                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-orange-400">
                                                                        <LuUser className="w-3 h-3" />
                                                                        {slot.timetableChanges[0].substituteFaculty?.name || slot.faculty?.name} (Sub)
                                                                    </span>
                                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-orange-400">
                                                                        <LuMapPin className="w-3 h-3" />
                                                                        {slot.timetableChanges[0].newRoom?.name || slot.room?.name}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-4">
                                                                    <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                                                                        <LuUser className="w-3 h-3 text-primary" />
                                                                        {slot.faculty?.name}
                                                                    </span>
                                                                    <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                                                                        <LuMapPin className="w-3 h-3 text-emerald-500" />
                                                                        {slot.room?.name}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-xs font-black text-text-muted/30 group-hover:text-primary/20 transition-colors uppercase vertical-text">
                                                    Slot {slot.slotNumber}
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                ))
                            ) : (
                                <p className="text-sm text-text-muted font-bold italic py-4">No classes scheduled.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
