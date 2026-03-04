'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { TimetableCell } from './timetable-cell';
import { TimetableLegend } from './timetable-legend';
import { TimetableTooltip } from './timetable-tooltip';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LuFilter, LuX } from 'react-icons/lu';

interface TimetableGridProps {
    slots: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    config: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    viewMode: 'admin' | 'faculty';
    facultyId?: string;
    baselineSlots?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({ slots, config, viewMode, facultyId, baselineSlots }) => {
    const [selectedBatch, setSelectedBatch] = useState<string>('ALL');
    const [selectedDay, setSelectedDay] = useState<string>('ALL');
    const [selectedSessionType, setSelectedSessionType] = useState<string>('ALL');
    const [showFilters, setShowFilters] = useState(false);
    const [tooltipSlot, setTooltipSlot] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    // ── Extract unique batches ──────────────────────────────────────────
    const uniqueBatches = useMemo(() => {
        const batchMap = new Map<string, any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
        slots.forEach(s => {
            if (!s.isBreak && s.batch && !s.batchId?.startsWith('ELECTIVE_')) {
                batchMap.set(s.batchId, s.batch);
            }
        });
        return Array.from(batchMap.values());
    }, [slots]);

    // ── Extract unique session types ────────────────────────────────────
    const uniqueSessionTypes = useMemo(() => {
        const types = new Set<string>();
        slots.forEach(s => {
            if (!s.isBreak) {
                const t = s.slotType || s.sessionType?.name || s.course?.type || 'Theory';
                types.add(t);
            }
        });
        return Array.from(types).sort();
    }, [slots]);

    // ── Time blocks ─────────────────────────────────────────────────────
    const timeBlocks = useMemo(() => {
        if (config?.timeBlocks && config.timeBlocks.length > 0) {
            return [...config.timeBlocks].sort((a: any, b: any) => a.slotNumber - b.slotNumber);
        }
        const blockMap = new Map<number, any>();
        slots.forEach(s => {
            if (!blockMap.has(s.slotNumber)) {
                blockMap.set(s.slotNumber, {
                    slotNumber: s.slotNumber,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    isBreak: s.isBreak,
                    name: s.block?.name,
                });
            }
        });
        return Array.from(blockMap.values()).sort((a, b) => a.slotNumber - b.slotNumber);
    }, [config?.timeBlocks, slots]);

    const days = config?.daysPerWeek || 6;
    const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].slice(0, days);
    const dayShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].slice(0, days);

    // ── Build grid map: day -> slotNumber -> slots[] ────────────────────
    const gridMap = useMemo(() => {
        const map = new Map<number, Map<number, any[]>>();

        for (let d = 1; d <= days; d++) {
            map.set(d, new Map<number, any[]>());
            timeBlocks.forEach((tb: any) => {
                map.get(d)!.set(tb.slotNumber, []);
            });
        }

        slots.forEach(s => {
            if (s.isBreak) {
                if (map.has(s.dayOfWeek) && map.get(s.dayOfWeek)!.has(s.slotNumber)) {
                    // Only add one break per cell to avoid duplication
                    const existing = map.get(s.dayOfWeek)!.get(s.slotNumber)!;
                    if (!existing.some((e: any) => e.isBreak)) {
                        existing.push(s);
                    }
                }
                return;
            }

            const matchesBatch = selectedBatch === 'ALL' || s.batchId === selectedBatch;
            const matchesFaculty = viewMode === 'admin' || (viewMode === 'faculty' && (s.facultyId === facultyId || s.faculty2Id === facultyId));
            const matchesDay = selectedDay === 'ALL' || s.dayOfWeek === parseInt(selectedDay);
            const matchesSession = selectedSessionType === 'ALL' || (s.slotType || s.sessionType?.name || s.course?.type || '').toUpperCase().includes(selectedSessionType.toUpperCase());

            if (matchesBatch && matchesFaculty && matchesDay && matchesSession) {
                if (map.has(s.dayOfWeek) && map.get(s.dayOfWeek)!.has(s.slotNumber)) {
                    map.get(s.dayOfWeek)!.get(s.slotNumber)!.push(s);
                }
            }
        });

        return map;
    }, [slots, days, timeBlocks, selectedBatch, viewMode, facultyId, selectedDay, selectedSessionType]);

    const handleCellClick = useCallback((slot: any) => {
        if (!slot.isBreak) setTooltipSlot(slot);
    }, []);

    const activeFilterCount = [selectedDay !== 'ALL', selectedSessionType !== 'ALL'].filter(Boolean).length;

    return (
        <div className="flex flex-col space-y-4">
            {/* ── Batch Tabs ──────────────────────────────────────────────── */}
            {viewMode === 'admin' && uniqueBatches.length > 0 && (
                <div className="flex items-center gap-1 p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl shadow-sm overflow-x-auto print:hidden">
                    <TabButton
                        active={selectedBatch === 'ALL'}
                        onClick={() => setSelectedBatch('ALL')}
                        label="All Batches"
                    />
                    {uniqueBatches.map(b => (
                        <TabButton
                            key={b.id}
                            active={selectedBatch === b.id}
                            onClick={() => setSelectedBatch(b.id)}
                            label={b.name}
                        />
                    ))}

                    {/* Filter toggle */}
                    <div className="ml-auto flex items-center gap-1">
                        <button
                            onClick={() => setShowFilters(prev => !prev)}
                            className={cn(
                                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                showFilters
                                    ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                            )}
                        >
                            <LuFilter className="w-3.5 h-3.5" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="ml-1 w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] flex items-center justify-center font-bold">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Filter Bar (Collapsible) ────────────────────────────────── */}
            {showFilters && (
                <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-800/30 rounded-xl print:hidden">
                    <FilterSelect
                        label="Day"
                        value={selectedDay}
                        onChange={setSelectedDay}
                        options={[{ value: 'ALL', label: 'All Days' }, ...dayLabels.map((d, i) => ({ value: String(i + 1), label: d }))]}
                    />
                    <FilterSelect
                        label="Session"
                        value={selectedSessionType}
                        onChange={setSelectedSessionType}
                        options={[{ value: 'ALL', label: 'All Types' }, ...uniqueSessionTypes.map(t => ({ value: t, label: t }))]}
                    />
                    {(selectedDay !== 'ALL' || selectedSessionType !== 'ALL') && (
                        <button
                            onClick={() => { setSelectedDay('ALL'); setSelectedSessionType('ALL'); }}
                            className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 dark:text-red-400 transition-colors"
                        >
                            <LuX className="w-3 h-3" /> Clear
                        </button>
                    )}
                </div>
            )}

            {/* ── Desktop Grid ────────────────────────────────────────────── */}
            <Card className="overflow-hidden border-slate-200 dark:border-white/10 shadow-xl rounded-xl hidden md:block">
                <div className="overflow-auto max-h-[78vh] custom-scrollbar">
                    <div className="min-w-[900px]">
                        {/* Day Headers */}
                        <div
                            className="grid sticky top-0 z-20 font-bold bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 shadow-sm"
                            style={{ gridTemplateColumns: `100px repeat(${days}, minmax(0, 1fr))` }}
                        >
                            <div className="p-3 border-r border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-center">
                                <span className="text-[9px] uppercase tracking-[0.15em] font-black text-slate-400 dark:text-slate-500">Time</span>
                            </div>
                            {dayLabels.map((day, i) => (
                                <div
                                    key={day}
                                    className={cn(
                                        "p-3 text-center text-sm text-slate-600 dark:text-slate-300",
                                        i < days - 1 && "border-r border-slate-100 dark:border-white/5"
                                    )}
                                >
                                    <span className="hidden lg:inline">{day}</span>
                                    <span className="lg:hidden">{dayShort[i]}</span>
                                </div>
                            ))}
                        </div>

                        {/* Time Blocks Rows */}
                        <div className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-slate-900/50">
                            {timeBlocks.map((block: any) => {
                                const p = block.slotNumber;
                                const isBreakRow = block.isBreak;

                                if (isBreakRow) {
                                    return (
                                        <div key={p} className="flex items-center justify-center py-2 bg-neutral-50 dark:bg-neutral-800/30">
                                            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
                                                ☕ Break · {block.startTime} – {block.endTime}
                                            </span>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={p}
                                        className="grid group"
                                        style={{ gridTemplateColumns: `100px repeat(${days}, minmax(0, 1fr))` }}
                                    >
                                        {/* Time Column */}
                                        <div className="p-2 border-r border-slate-200 dark:border-white/10 sticky left-0 z-10 flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 transition-colors">
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 tracking-tight">{block.startTime}</span>
                                            <div className="h-2.5 w-[1px] bg-slate-200 dark:bg-slate-700 my-0.5" />
                                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-tight">{block.endTime}</span>
                                            {block.name && <span className="text-[7px] uppercase font-black text-slate-300 dark:text-slate-600 mt-0.5">{block.name}</span>}
                                        </div>

                                        {/* Day Columns */}
                                        {Array.from({ length: days }).map((_, dIdx) => {
                                            const d = dIdx + 1;
                                            const cellSlots = gridMap.get(d)?.get(p) || [];

                                            return (
                                                <div
                                                    key={d}
                                                    className={cn(
                                                        "p-1.5 min-h-[100px]",
                                                        dIdx < days - 1 && "border-r border-slate-100 dark:border-white/5",
                                                        "group-hover:bg-indigo-50/10 dark:group-hover:bg-indigo-950/10 transition-colors"
                                                    )}
                                                >
                                                    {cellSlots.length > 0 ? (
                                                        <div className="flex flex-col gap-1.5 h-full">
                                                            {cellSlots.map((slot: any, sIdx: number) => {
                                                                let diffStatus: 'new' | 'changed' | 'unchanged' = 'unchanged';
                                                                if (baselineSlots && !slot.isBreak) {
                                                                    const baseline = baselineSlots.find((b: any) =>
                                                                        b.dayOfWeek === slot.dayOfWeek &&
                                                                        b.slotNumber === slot.slotNumber &&
                                                                        b.batchId === slot.batchId
                                                                    );
                                                                    if (!baseline) diffStatus = 'new';
                                                                    else if (baseline.facultyId !== slot.facultyId || baseline.roomId !== slot.roomId) diffStatus = 'changed';
                                                                }
                                                                return (
                                                                    <TimetableCell
                                                                        key={`${slot.slotNumber}-${sIdx}`}
                                                                        slot={slot}
                                                                        viewMode={viewMode}
                                                                        diffStatus={diffStatus}
                                                                        onCellClick={handleCellClick}
                                                                    />
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <TimetableCell slot={null} viewMode={viewMode} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Card>

            {/* ── Mobile Card View ────────────────────────────────────────── */}
            <div className="md:hidden space-y-4">
                {dayLabels.map((day, dIdx) => {
                    const d = dIdx + 1;
                    if (selectedDay !== 'ALL' && d !== parseInt(selectedDay)) return null;

                    const daySlots = timeBlocks.flatMap((block: any) => {
                        if (block.isBreak) return [{ isBreak: true, startTime: block.startTime, endTime: block.endTime }];
                        return (gridMap.get(d)?.get(block.slotNumber) || []).map((s: any) => ({ ...s, blockStartTime: block.startTime, blockEndTime: block.endTime }));
                    }).filter(Boolean);

                    return (
                        <Card key={d} className="border-slate-200 dark:border-white/10 overflow-hidden">
                            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">{day}</h3>
                            </div>
                            <div className="p-3 space-y-2">
                                {daySlots.length === 0 ? (
                                    <div className="text-center py-6 text-sm text-slate-400 dark:text-slate-600">No classes scheduled</div>
                                ) : (
                                    daySlots.map((slot: any, idx: number) => {
                                        if (slot.isBreak) {
                                            return (
                                                <div key={`break-${idx}`} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-700">
                                                    <span className="text-sm">☕</span>
                                                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Break · {slot.startTime} – {slot.endTime}</span>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={idx} className="flex gap-3 items-start">
                                                <div className="flex flex-col items-center pt-1 w-12 flex-shrink-0">
                                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{slot.blockStartTime || slot.startTime}</span>
                                                    <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />
                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600">{slot.blockEndTime || slot.endTime}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <TimetableCell slot={slot} viewMode={viewMode} onCellClick={handleCellClick} />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* ── Legend ───────────────────────────────────────────────────── */}
            <TimetableLegend />

            {/* ── Tooltip Modal ────────────────────────────────────────────── */}
            {tooltipSlot && (
                <TimetableTooltip slot={tooltipSlot} onClose={() => setTooltipSlot(null)} />
            )}
        </div>
    );
};

// ── Sub-components ───────────────────────────────────────────────────────────

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                active
                    ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/50"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-slate-200"
            )}
        >
            {label}
        </button>
    );
}

function FilterSelect({ label, value, onChange, options }: {
    label: string; value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">{label}</span>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="text-xs border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}
