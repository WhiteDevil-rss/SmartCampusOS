'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications, Notification } from '@/lib/hooks/use-notifications';
import { LuBell, LuCheckCheck, LuTrash2, LuCircle, LuExternalLink, LuX } from 'react-icons/lu';
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
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle Scroll Lock
    useEffect(() => {
        if (selectedMessage) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [selectedMessage]);

    const categoryStyles = {
        ACADEMIC: 'text-blue-500 bg-blue-500/10',
        ATTENDANCE: 'text-amber-500 bg-amber-500/10',
        FEES: 'text-emerald-500 bg-emerald-500/10',
        SYSTEM: 'text-primary bg-primary/10'
    };

    const dropdownContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{
                        position: 'fixed',
                        top: triggerRef.current ? triggerRef.current.getBoundingClientRect().bottom + 16 : 80,
                        right: triggerRef.current ? window.innerWidth - triggerRef.current.getBoundingClientRect().right : 40,
                        zIndex: 'var(--z-notification)'
                    }}
                    className="w-96 max-h-[600px] overflow-hidden bg-white dark:bg-slate-900 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Notifications</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">{unreadCount} Unread Messages</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead()}
                                className="h-8 rounded-lg text-[10px] font-black uppercase tracking-wider gap-1.5 hover:bg-primary/10 hover:text-primary"
                            >
                                <LuCheckCheck className="w-3.5 h-3.5" />
                                Read All
                            </Button>
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 transition-colors">
                                <LuX className="w-4 h-4 text-text-muted" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar min-h-[200px]">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
                            ))
                        ) : notifications.length === 0 ? (
                            <div className="py-10 text-center space-y-3">
                                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto">
                                    <LuBell className="w-8 h-8 text-slate-300 dark:text-white/10" />
                                </div>
                                <p className="text-sm font-bold text-text-muted">All caught up!</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => setSelectedMessage(notification)}
                                    className={cn(
                                        "p-4 rounded-2xl border transition-all duration-300 group relative cursor-pointer",
                                        notification.isRead
                                            ? "bg-transparent border-transparent grayscale-[0.5] opacity-70"
                                            : "bg-white dark:bg-white/[0.03] border-slate-100 dark:border-white/10 shadow-sm hover:border-primary/30"
                                    )}
                                >
                                    <div className="flex gap-4">
                                        <div className={cn("p-2.5 h-fit rounded-xl shrink-0", categoryStyles[notification.category as keyof typeof categoryStyles] || categoryStyles.SYSTEM)}>
                                            <LuBell className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-black text-slate-900 dark:text-white truncate pr-4">
                                                    {notification.title}
                                                </h4>
                                                {!notification.isRead && <LuCircle className="w-2 h-2 fill-primary text-primary shrink-0" />}
                                            </div>
                                            <p className="text-xs font-medium text-text-secondary dark:text-text-muted leading-relaxed line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-text-muted pt-1">
                                                {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                                            </p>
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
                        <Button variant="link" className="text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary p-0 h-auto">
                            View All Activity
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
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
            </div>

            <MessageDetailPopup
                notification={selectedMessage}
                onClose={() => setSelectedMessage(null)}
                onDelete={deleteNotification}
            />
        </>
    );
}
