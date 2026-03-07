'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFacultySchedule } from '@/lib/hooks/use-faculty-schedule';
import { LuClock, LuMapPin, LuBook, LuUsers } from 'react-icons/lu';
import { cn } from '@/lib/utils';

export function FacultySchedule() {
    const { schedule, loading, error } = useFacultySchedule();

    if (loading) return <Skeleton className="h-96 rounded-3xl bg-surface" />;

    if (error) {
        return (
            <Card className="p-8 border-rose-500/20 bg-rose-500/5 text-rose-500 text-center">
                <p className="font-bold">{error}</p>
            </Card>
        );
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {days.map((day, index) => {
                    const daySlots = schedule.filter(slot => slot.dayOfWeek === index + 1);

                    return (
                        <div key={day} className="space-y-4">
                            <h3 className="text-xl font-black text-text-primary flex items-center gap-2 px-2">
                                <span className="w-2 h-6 bg-primary rounded-full" />
                                {day}
                            </h3>
                            <div className="space-y-3">
                                {daySlots.length > 0 ? (
                                    daySlots.map((slot) => (
                                        <Card key={slot.id} className="p-5 glass-card border-border hover:border-primary/20 transition-all group">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-primary">
                                                        <LuClock className="w-4 h-4" />
                                                        <span className="text-xs font-black uppercase tracking-widest">{slot.startTime} - {slot.endTime}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">{slot.course.name}</h4>
                                                        <p className="text-xs text-text-muted font-medium">{slot.course.code} • {slot.sessionType.name}</p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 pt-2">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                                                            <LuUsers className="w-3 h-3 text-amber-500" />
                                                            {slot.batch.name} (Div {slot.batch.division})
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                                                            <LuMapPin className="w-3 h-3 text-indigo-500" />
                                                            {slot.room.name}, {slot.room.building}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                                                    Slot {slot.slotNumber}
                                                </span>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="p-6 rounded-2xl border border-dashed border-border text-center">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">No classes scheduled</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
