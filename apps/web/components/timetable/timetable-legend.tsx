'use client';

import React from 'react';
import { SESSION_COLORS, SessionColorKey } from './timetable-cell';
import { cn } from '@/lib/utils';

const LEGEND_ITEMS: SessionColorKey[] = ['theory', 'lab', 'practical', 'project', 'elective', 'free'];

export const TimetableLegend: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={cn(
            "flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 rounded-xl border bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-white/10 shadow-sm print:shadow-none print:border-slate-300",
            className
        )}>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mr-1">Legend</span>
            {LEGEND_ITEMS.map((key) => {
                const c = SESSION_COLORS[key];
                return (
                    <div key={key} className="flex items-center gap-1.5">
                        <div className={cn(
                            "w-3 h-3 rounded border",
                            c.bg, c.border, c.darkBg, c.darkBorder
                        )} />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {c.emoji} {c.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
