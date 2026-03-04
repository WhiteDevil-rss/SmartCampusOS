'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LuUser, LuBuilding, LuUsers, LuBookOpen, LuFlaskConical, LuWrench, LuFolderKanban, LuShuffle } from 'react-icons/lu';

// ── Session Type Color Map ──────────────────────────────────────────────────
export type SessionColorKey = 'theory' | 'lab' | 'practical' | 'project' | 'elective' | 'break' | 'free';

export const SESSION_COLORS: Record<SessionColorKey, {
    bg: string; border: string; text: string; subtext: string; badge: string; icon: string;
    darkBg: string; darkBorder: string; darkText: string; darkSubtext: string; darkBadge: string; darkIcon: string;
    emoji: string; label: string;
}> = {
    theory: {
        bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', subtext: 'text-blue-600', badge: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'text-blue-400',
        darkBg: 'dark:bg-blue-950/40', darkBorder: 'dark:border-blue-800', darkText: 'dark:text-blue-200', darkSubtext: 'dark:text-blue-400', darkBadge: 'dark:bg-blue-900/60 dark:text-blue-300 dark:border-blue-700', darkIcon: 'dark:text-blue-500',
        emoji: '📘', label: 'Theory',
    },
    lab: {
        bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', subtext: 'text-green-600', badge: 'bg-green-100 text-green-700 border-green-200', icon: 'text-green-400',
        darkBg: 'dark:bg-green-950/40', darkBorder: 'dark:border-green-800', darkText: 'dark:text-green-200', darkSubtext: 'dark:text-green-400', darkBadge: 'dark:bg-green-900/60 dark:text-green-300 dark:border-green-700', darkIcon: 'dark:text-green-500',
        emoji: '🟢', label: 'Lab',
    },
    practical: {
        bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', subtext: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: 'text-yellow-500',
        darkBg: 'dark:bg-yellow-950/40', darkBorder: 'dark:border-yellow-800', darkText: 'dark:text-yellow-200', darkSubtext: 'dark:text-yellow-400', darkBadge: 'dark:bg-yellow-900/60 dark:text-yellow-300 dark:border-yellow-700', darkIcon: 'dark:text-yellow-500',
        emoji: '🟡', label: 'Practical',
    },
    project: {
        bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', subtext: 'text-purple-600', badge: 'bg-purple-100 text-purple-700 border-purple-200', icon: 'text-purple-400',
        darkBg: 'dark:bg-purple-950/40', darkBorder: 'dark:border-purple-800', darkText: 'dark:text-purple-200', darkSubtext: 'dark:text-purple-400', darkBadge: 'dark:bg-purple-900/60 dark:text-purple-300 dark:border-purple-700', darkIcon: 'dark:text-purple-500',
        emoji: '🟣', label: 'Project',
    },
    elective: {
        bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', subtext: 'text-orange-600', badge: 'bg-orange-100 text-orange-700 border-orange-200', icon: 'text-orange-400',
        darkBg: 'dark:bg-orange-950/40', darkBorder: 'dark:border-orange-800', darkText: 'dark:text-orange-200', darkSubtext: 'dark:text-orange-400', darkBadge: 'dark:bg-orange-900/60 dark:text-orange-300 dark:border-orange-700', darkIcon: 'dark:text-orange-500',
        emoji: '🟠', label: 'Elective',
    },
    break: {
        bg: 'bg-neutral-50', border: 'border-neutral-200', text: 'text-neutral-600', subtext: 'text-neutral-400', badge: 'bg-neutral-100 text-neutral-500 border-neutral-200', icon: 'text-neutral-300',
        darkBg: 'dark:bg-neutral-800/50', darkBorder: 'dark:border-neutral-700', darkText: 'dark:text-neutral-300', darkSubtext: 'dark:text-neutral-500', darkBadge: 'dark:bg-neutral-700 dark:text-neutral-400 dark:border-neutral-600', darkIcon: 'dark:text-neutral-600',
        emoji: '☕', label: 'Break',
    },
    free: {
        bg: 'bg-slate-50/50', border: 'border-slate-100', text: 'text-slate-400', subtext: 'text-slate-300', badge: '', icon: 'text-slate-200',
        darkBg: 'dark:bg-slate-900/30', darkBorder: 'dark:border-slate-800', darkText: 'dark:text-slate-600', darkSubtext: 'dark:text-slate-700', darkBadge: '', darkIcon: 'dark:text-slate-700',
        emoji: '⬜', label: 'Free',
    },
};

export function resolveSessionColor(slot: any): SessionColorKey { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (slot.isBreak) return 'break';
    if (slot.isElective) return 'elective';
    const type = (slot.slotType || slot.sessionType?.name || slot.course?.type || '').toLowerCase();
    if (type.includes('lab')) return 'lab';
    if (type.includes('practical')) return 'practical';
    if (type.includes('project')) return 'project';
    return 'theory';
}

const SESSION_ICON: Record<SessionColorKey, React.ReactNode> = {
    theory: <LuBookOpen className="w-3 h-3" />,
    lab: <LuFlaskConical className="w-3 h-3" />,
    practical: <LuWrench className="w-3 h-3" />,
    project: <LuFolderKanban className="w-3 h-3" />,
    elective: <LuShuffle className="w-3 h-3" />,
    break: null,
    free: null,
};

// ── Props ───────────────────────────────────────────────────────────────────

interface TimetableCellProps {
    slot: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    viewMode: 'admin' | 'faculty';
    className?: string;
    diffStatus?: 'new' | 'changed' | 'unchanged';
    onCellClick?: (slot: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// ── Component ───────────────────────────────────────────────────────────────

export const TimetableCell: React.FC<TimetableCellProps> = ({ slot, viewMode, className, diffStatus, onCellClick }) => {
    // Empty slot
    if (!slot) {
        const fc = SESSION_COLORS.free;
        return (
            <div className={cn(
                "h-full w-full min-h-[90px] rounded-lg border border-dashed flex items-center justify-center transition-colors",
                fc.bg, fc.border, fc.darkBg, fc.darkBorder, className
            )}>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
        );
    }

    // Break slot
    if (slot.isBreak) {
        const bc = SESSION_COLORS.break;
        return (
            <div className={cn(
                "h-full w-full min-h-[60px] rounded-lg border flex items-center justify-center gap-2 p-2",
                bc.bg, bc.border, bc.darkBg, bc.darkBorder, className
            )}>
                <span className="text-lg">{bc.emoji}</span>
                <span className={cn("font-semibold uppercase tracking-widest text-xs", bc.text, bc.darkText)}>Break</span>
            </div>
        );
    }

    // Resolve color key
    const colorKey = resolveSessionColor(slot);
    const c = SESSION_COLORS[colorKey];

    const courseCode = slot.course?.code || slot.courseCode || '—';
    const facultyName = slot.faculty?.name || '—';
    const faculty2Name = slot.faculty2?.name;
    const roomName = slot.room?.name;
    const batchName = slot.batch?.name;

    return (
        <div
            onClick={() => onCellClick?.(slot)}
            className={cn(
                "h-full w-full min-h-[90px] border rounded-lg p-2.5 transition-all flex flex-col justify-between shadow-sm relative overflow-hidden group/cell",
                "hover:shadow-md hover:scale-[1.01] cursor-pointer",
                c.bg, c.border, c.darkBg, c.darkBorder,
                // Diff detection badges
                diffStatus === 'changed' && "ring-2 ring-amber-400 ring-offset-1 shadow-amber-100 dark:ring-offset-slate-900",
                diffStatus === 'new' && "ring-2 ring-emerald-400 ring-offset-1 shadow-emerald-100 dark:ring-offset-slate-900",
                className
            )}
        >
            {/* Diff badge */}
            {diffStatus && diffStatus !== 'unchanged' && (
                <div className={cn(
                    "absolute top-0 right-0 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest text-white rounded-bl-md",
                    diffStatus === 'changed' ? "bg-amber-500" : "bg-emerald-500"
                )}>
                    {diffStatus}
                </div>
            )}

            {/* Top: Course Code + Session Badge */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1">
                    <span className={cn("text-sm font-extrabold tracking-tight leading-none", c.text, c.darkText)}>
                        {courseCode}
                    </span>
                    <div className={cn(
                        "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-tight",
                        c.badge, c.darkBadge
                    )}>
                        {SESSION_ICON[colorKey]}
                        <span className="ml-0.5">{c.label}</span>
                    </div>
                </div>

                {/* Faculty line */}
                <div className={cn("flex items-center gap-1 text-[11px] font-semibold", c.subtext, c.darkSubtext)}>
                    <LuUser className={cn("w-3 h-3 flex-shrink-0", c.icon, c.darkIcon)} />
                    <span className="truncate">
                        {facultyName}
                        {faculty2Name && <span className="opacity-70"> / {faculty2Name}</span>}
                    </span>
                </div>
            </div>

            {/* Bottom: Room + Batch info */}
            <div className={cn("text-[10px] space-y-0.5 mt-auto pt-1.5 border-t border-dashed", c.border, c.darkBorder, c.subtext, c.darkSubtext)}>
                {viewMode === 'admin' ? (
                    <>
                        {roomName && (
                            <div className="flex items-center gap-1 opacity-80">
                                <LuBuilding className={cn("w-2.5 h-2.5", c.icon, c.darkIcon)} />
                                <span className="truncate">{roomName}</span>
                            </div>
                        )}
                        {batchName && (
                            <div className="flex items-center gap-1 opacity-60">
                                <LuUsers className={cn("w-2.5 h-2.5", c.icon, c.darkIcon)} />
                                <span className="truncate">{batchName}</span>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {batchName && (
                            <div className="flex items-center gap-1 font-medium">
                                <LuUsers className={cn("w-2.5 h-2.5", c.icon, c.darkIcon)} />
                                <span className="truncate">{batchName}</span>
                            </div>
                        )}
                        {roomName && (
                            <div className="flex items-center gap-1 opacity-80">
                                <LuBuilding className={cn("w-2.5 h-2.5", c.icon, c.darkIcon)} />
                                <span className="truncate">{roomName}</span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
