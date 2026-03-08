'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuX, LuBell, LuCalendar, LuUser, LuExternalLink, LuTrash2 } from 'react-icons/lu';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Notification } from '@/lib/hooks/use-notifications';
import Link from 'next/link';
import { createPortal } from 'react-dom';

interface MessageDetailPopupProps {
    notification: Notification | null;
    onClose: () => void;
    onDelete?: (id: string) => void;
}

export function MessageDetailPopup({ notification, onClose, onDelete }: MessageDetailPopupProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!notification || !mounted) return null;

    const categoryStyles = {
        ACADEMIC: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        ATTENDANCE: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        FEES: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        SYSTEM: 'text-primary bg-primary/10 border-primary/20'
    };

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden max-h-[90vh] flex flex-col pointer-events-auto"
                >
                    {/* Header Image/Glow */}
                    <div className={cn(
                        "h-32 w-full relative overflow-hidden",
                        categoryStyles[notification.category as keyof typeof categoryStyles] || categoryStyles.SYSTEM
                    )}>
                        <div className="absolute inset-0 opacity-20 bg-grid-white/10" />
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-slate-900 to-transparent" />

                        <div className="absolute top-8 left-8 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                            <LuBell className="w-8 h-8" />
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
                        >
                            <LuX className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>

                    <div className="px-8 pb-8 -mt-6 relative z-10 overflow-y-auto custom-scrollbar">
                        <div className="space-y-6">
                            {/* Title & Metadata */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                        categoryStyles[notification.category as keyof typeof categoryStyles] || categoryStyles.SYSTEM
                                    )}>
                                        {notification.category}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">•</span>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <LuCalendar className="w-3 h-3" />
                                        {format(new Date(notification.createdAt), 'MMMM d, yyyy')}
                                    </div>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                                    {notification.title}
                                </h2>
                            </div>

                            {/* Content */}
                            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                <div className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    {typeof notification.message === 'object' ? (
                                        <pre className="whitespace-pre-wrap break-words font-sans">
                                            {JSON.stringify(notification.message, null, 2)}
                                        </pre>
                                    ) : (
                                        <p>{notification.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-2">
                                {notification.link && (
                                    <Link href={notification.link} className="flex-1">
                                        <Button className="w-full gap-2 rounded-2xl h-12 font-bold shadow-lg shadow-primary/20">
                                            <LuExternalLink className="w-4 h-4" />
                                            View Details
                                        </Button>
                                    </Link>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className={cn("h-12 rounded-2xl font-bold px-8", !notification.link && "flex-1")}
                                >
                                    Close
                                </Button>
                                {onDelete && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            onDelete(notification.id);
                                            onClose();
                                        }}
                                        className="h-12 w-12 p-0 rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 border border-transparent hover:border-rose-500/20"
                                    >
                                        <LuTrash2 className="w-5 h-5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
        , document.body);
}
