'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications, Notification } from '@/lib/hooks/use-notifications';
import { 
    LuBell, LuCheckCheck, LuTrash2, LuCircle, 
    LuExternalLink, LuX, LuUsers, LuWrench, 
    LuShield, LuSettings 
} from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { MessageDetailPopup } from './message-detail-popup';

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<Notification | null>(null);
    const [mounted, setMounted] = useState(false);
    const { notifications, unreadCount, markAsRead, deleteNotification, loading } = useNotifications();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setMounted(true);
        const handleClickOutside = (event: MouseEvent) => {
            if (selectedMessage) return; // Ignore if detail view is open

            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedMessage]);

    // Handle Scroll Lock
    useEffect(() => {
        if (selectedMessage || isOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [selectedMessage, isOpen]);

    const categoryStyles = {
        ACADEMIC: 'text-blue-500 bg-blue-500/10',
        ATTENDANCE: 'text-amber-500 bg-amber-500/10',
        FEES: 'text-emerald-500 bg-emerald-500/10',
        SYSTEM: 'text-primary bg-primary/10',
        SOCIAL: 'text-purple-500 bg-purple-500/10',
        MAINTENANCE: 'text-rose-500 bg-rose-500/10',
        EXAM: 'text-indigo-500 bg-indigo-500/10'
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'ACADEMIC': return <LuBell className="w-4 h-4" />;
            case 'SOCIAL': return <LuUsers className="w-4 h-4" />;
            case 'MAINTENANCE': return <LuWrench className="w-4 h-4" />;
            case 'EXAM': return <LuShield className="w-4 h-4" />;
            default: return <LuBell className="w-4 h-4" />;
        }
    };

    const dropdownContent = (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            ref={dropdownRef}
                            className="w-[calc(100vw-2rem)] max-w-md max-h-[80vh] overflow-hidden bg-white dark:bg-slate-900 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Notification Hub</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">{unreadCount} Unread Messages</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Link href="/settings/notifications" onClick={() => setIsOpen(false)}>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl hover:bg-slate-200 dark:hover:bg-white/5">
                                            <LuSettings className="w-4 h-4 text-slate-500" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => markAsRead()}
                                        className="h-8 rounded-xl text-[10px] font-black uppercase tracking-wider px-3 hover:bg-primary/10 hover:text-primary transition-all"
                                    >
                                        Read All
                                    </Button>
                                    <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/5 transition-colors">
                                        <LuX className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-[300px]">
                                {loading ? (
                                    Array(4).fill(0).map((_, i) => (
                                        <div key={i} className="h-24 rounded-3xl bg-slate-100 dark:bg-white/5 animate-pulse" />
                                    ))
                                ) : notifications.length === 0 ? (
                                    <div className="py-20 text-center space-y-4">
                                        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto ring-1 ring-white/5 shadow-inner">
                                            <LuBell className="w-10 h-10 text-slate-300 dark:text-white/10" />
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-slate-900 dark:text-white">Crystal Clear</p>
                                            <p className="text-xs font-medium text-slate-500">No new alerts at this time.</p>
                                        </div>
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => setSelectedMessage(notification)}
                                            className={cn(
                                                "p-5 rounded-3xl border transition-all duration-300 group relative cursor-pointer",
                                                notification.isRead
                                                    ? "bg-transparent border-transparent grayscale-[0.8] opacity-60"
                                                    : "bg-white dark:bg-white/[0.04] border-slate-100 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:hover:bg-white/[0.06] hover:border-primary/20"
                                            )}
                                        >
                                            <div className="flex gap-4">
                                                <div className={cn("p-3 h-fit rounded-2xl shrink-0 transition-transform group-hover:scale-110", categoryStyles[notification.category as keyof typeof categoryStyles] || categoryStyles.SYSTEM)}>
                                                    {getCategoryIcon(notification.category)}
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate pr-4">
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.isRead && (
                                                            <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                                        {typeof notification.message === 'object' ? JSON.stringify(notification.message) : notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between pt-2">
                                                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
                                                            {format(new Date(notification.createdAt), 'MMM d • h:mm a')}
                                                        </p>
                                                        <div className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500">
                                                            {notification.category}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions on Hover */}
                                            <div className="absolute right-3 bottom-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {notification.link && (
                                                    <Link href={notification.link} onClick={(e) => e.stopPropagation()}>
                                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg hover:bg-primary/10 hover:text-primary">
                                                            <LuExternalLink className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </Link>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notification.id);
                                                    }}
                                                    className="h-7 w-7 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500"
                                                >
                                                    <LuTrash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-slate-100 dark:border-white/5 text-center">
                                <Link href="/history" onClick={() => setIsOpen(false)}>
                                    <Button variant="link" className="text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary p-0 h-auto">
                                        View All Activity
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-text-muted hover:text-primary transition-all duration-300 group"
            >
                <LuBell className={cn("w-5 h-5 transition-transform", isOpen && "scale-110")} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-black animate-pulse" />
                )}
            </button>

            {mounted && createPortal(dropdownContent, document.body)}

            <MessageDetailPopup
                notification={selectedMessage}
                onClose={() => setSelectedMessage(null)}
                onDelete={deleteNotification}
            />
        </div>
    );
}
