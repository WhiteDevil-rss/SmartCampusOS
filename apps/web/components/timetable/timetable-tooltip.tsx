'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { resolveSessionColor, SESSION_COLORS } from './timetable-cell';
import { LuUser, LuBuilding, LuUsers, LuHash, LuBookOpen, LuX } from 'react-icons/lu';

interface TimetableTooltipProps {
    slot: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    onClose: () => void;
}

export const TimetableTooltip: React.FC<TimetableTooltipProps> = ({ slot, onClose }) => {
    if (!slot || slot.isBreak) return null;

    const colorKey = resolveSessionColor(slot);
    const c = SESSION_COLORS[colorKey];

    const courseCode = slot.course?.code || slot.courseCode || '—';
    const courseName = slot.course?.name || slot.courseName || '—';
    const facultyName = slot.faculty?.name || slot.facultyName || '—';
    const faculty2Name = slot.faculty2?.name;
    const roomName = slot.room?.name || slot.roomName || '—';
    const roomType = slot.room?.type || '';
    const batchName = slot.batch?.name || slot.batchName || '—';
    const sessionTypeName = slot.sessionType?.name || slot.slotType || '—';
    const batchStrength = slot.batch?.strength;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                className={cn(
                    "relative w-full max-w-sm rounded-2xl border-2 shadow-2xl overflow-hidden",
                    "bg-white dark:bg-slate-900",
                    c.border, c.darkBorder
                )}
            >
                {/* Header */}
                <div className={cn("px-5 py-4 border-b", c.bg, c.border, c.darkBg, c.darkBorder)}>
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/60 dark:bg-slate-800/60 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    >
                        <LuX className="w-4 h-4 text-text-secondary dark:text-text-muted" />
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                        <div className={cn("px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-tight", c.badge, c.darkBadge)}>
                            {c.emoji} {c.label}
                        </div>
                        {slot.isElective && (
                            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-700">
                                Elective Group
                            </span>
                        )}
                    </div>
                    <h3 className={cn("text-lg font-extrabold tracking-tight", c.text, c.darkText)}>{courseCode}</h3>
                    <p className={cn("text-sm font-medium mt-0.5", c.subtext, c.darkSubtext)}>{courseName}</p>
                </div>

                {/* Details */}
                <div className="px-5 py-4 space-y-3">
                    <DetailRow icon={<LuUser className="w-4 h-4" />} label="Faculty" value={faculty2Name ? `${facultyName} / ${faculty2Name}` : facultyName} />
                    <DetailRow icon={<LuBuilding className="w-4 h-4" />} label="Room" value={roomType ? `${roomName} (${roomType})` : roomName} />
                    <DetailRow icon={<LuUsers className="w-4 h-4" />} label="Batch" value={batchName} />
                    <DetailRow icon={<LuBookOpen className="w-4 h-4" />} label="Session Type" value={sessionTypeName} />
                    {batchStrength && (
                        <DetailRow icon={<LuHash className="w-4 h-4" />} label="Students" value={String(batchStrength)} />
                    )}
                    {slot.basketId && (
                        <DetailRow icon={<LuHash className="w-4 h-4" />} label="Elective Basket" value={slot.basketId.slice(-8)} />
                    )}
                </div>
            </div>
        </div>
    );
};

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-text-muted dark:text-text-secondary flex-shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-text-secondary">{label}</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{value}</div>
            </div>
        </div>
    );
}
