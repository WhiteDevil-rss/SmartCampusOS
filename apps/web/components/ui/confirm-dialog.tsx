'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LuTriangleAlert } from 'react-icons/lu';

// ── ConfirmDialog (controlled) ────────────────────────────────────────────────
export type ConfirmState = {
    open: boolean;
    title: string;
    message: string;
    danger?: boolean;
    confirmLabel?: string;
    requireTypedConfirm?: boolean;
    onConfirm: () => void;
};

export const emptyConfirm: ConfirmState = {
    open: false,
    title: '',
    message: '',
    danger: true,
    confirmLabel: 'Delete',
    requireTypedConfirm: false,
    onConfirm: () => { },
};

const CONFIRM_KEYWORD = 'delete';

export function ConfirmDialog({
    state,
    onClose,
}: {
    state: ConfirmState;
    onClose: () => void;
}) {
    const [typedValue, setTypedValue] = useState('');

    const handleClose = () => {
        setTypedValue('');
        onClose();
    };

    const isTypedConfirmValid = !state.requireTypedConfirm ||
        typedValue.toLowerCase() === CONFIRM_KEYWORD;

    return (
        <Dialog open={state.open} onOpenChange={(o) => { if (!o) handleClose(); }}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className={`flex items-center gap-2 ${state.danger !== false ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
                        <LuTriangleAlert className="w-5 h-5 shrink-0" />
                        {state.title}
                    </DialogTitle>
                </DialogHeader>

                <p className="text-sm text-slate-600 dark:text-text-muted py-2 leading-relaxed">{state.message}</p>

                {state.requireTypedConfirm && (
                    <div className="space-y-3 mt-1">
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1">
                                ⚠ This action is permanent and irreversible
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-500">
                                All associated data will be permanently deleted and cannot be recovered.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-600 dark:text-text-muted">
                                Type <span className="font-bold text-red-600 dark:text-red-400 font-mono">&quot;delete&quot;</span> to confirm:
                            </label>
                            <Input
                                placeholder="delete"
                                value={typedValue}
                                onChange={(e) => setTypedValue(e.target.value)}
                                className="font-mono text-sm border-slate-300 dark:border-border-hover dark:bg-slate-900/50 dark:text-white caret-slate-900 dark:caret-white"
                                autoComplete="off"
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                <DialogFooter className="mt-2">
                    <Button variant="outline" onClick={handleClose} className="dark:border-border-hover dark:text-slate-300 dark:hover:bg-slate-800">Cancel</Button>
                    <Button
                        className={state.danger !== false ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white disabled:opacity-40' : ''}
                        disabled={!isTypedConfirmValid}
                        onClick={() => { if (isTypedConfirmValid) { state.onConfirm(); handleClose(); } }}
                    >
                        {state.confirmLabel ?? 'Confirm'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── useConfirm hook ────────────────────────────────────────────────────────────
// Usage:
//   const { confirmState, closeConfirm, askConfirm } = useConfirm();
//   askConfirm({ title: 'Delete?', message: '…', requireTypedConfirm: true, onConfirm: () => doDelete() });
//   <ConfirmDialog state={confirmState} onClose={closeConfirm} />
export function useConfirm() {
    const [confirmState, setConfirmState] = useState<ConfirmState>(emptyConfirm);
    const closeConfirm = useCallback(() => setConfirmState(emptyConfirm), []);
    const askConfirm = useCallback((opts: Omit<ConfirmState, 'open'>) => {
        setConfirmState({ open: true, ...opts });
    }, []);
    return { confirmState, closeConfirm, askConfirm };
}
