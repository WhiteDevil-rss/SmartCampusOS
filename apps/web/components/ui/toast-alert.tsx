'use client';

import { useState, useCallback, useEffect } from 'react';
import { LuCircleCheck, LuCircleX, LuInfo, LuX } from 'react-icons/lu';

export type ToastType = 'success' | 'error' | 'info';

export type ToastState = {
    show: boolean;
    type: ToastType;
    message: string;
};

const icons = {
    success: <LuCircleCheck className="w-5 h-5 text-neon-cyan shrink-0 glow-cyan" />,
    error: <LuCircleX className="w-5 h-5 text-rose-500 shrink-0 shadow-[0_0_10px_rgba(244,63,94,0.3)]" />,
    info: <LuInfo className="w-5 h-5 text-blue-400 shrink-0" />,
};

const styles = {
    success: 'border-neon-cyan/30 bg-white dark:bg-black/90 text-slate-900 dark:text-white shadow-lg dark:shadow-[0_0_20px_rgba(57,193,239,0.1)]',
    error: 'border-rose-500/30 bg-white dark:bg-black/90 text-slate-900 dark:text-white shadow-lg dark:shadow-[0_0_20px_rgba(244,63,94,0.1)]',
    info: 'border-blue-500/30 bg-white dark:bg-black/90 text-slate-900 dark:text-white shadow-lg',
};

// ── Toast display component ───────────────────────────────────────────────────
export function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
    useEffect(() => {
        if (!toast.show) return;
        // Auto-dismiss after 4s
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [toast.show, onClose]);

    if (!toast.show) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-2 fade-in duration-300">
            <div className={`flex items-start gap-3 rounded-xl border shadow-lg px-4 py-3 min-w-[300px] max-w-sm ${styles[toast.type]}`}>
                {icons[toast.type]}
                <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
                <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                    <LuX className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// ── useToast hook ─────────────────────────────────────────────────────────────
// Usage:
//   const { toast, showToast, hideToast } = useToast();
//   showToast('success', 'Saved successfully!');
//   <Toast toast={toast} onClose={hideToast} />
export function useToast() {
    const [toast, setToast] = useState<ToastState>({ show: false, type: 'success', message: '' });
    const hideToast = useCallback(() => setToast(t => ({ ...t, show: false })), []);
    const showToast = useCallback((type: ToastType, message: string) => {
        setToast({ show: true, type, message });
    }, []);
    return { toast, showToast, hideToast };
}
