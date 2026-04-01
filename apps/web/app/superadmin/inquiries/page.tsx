'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import {
    LuMailOpen, LuSearch, LuDownload, LuTrash2, LuEye, LuChevronLeft,
    LuChevronRight, LuCircleAlert
} from 'react-icons/lu';
import { SUPERADMIN_NAV } from '@/lib/constants/nav-config';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog, useConfirm } from '@/components/ui/confirm-dialog';
import { Toast, useToast } from '@/components/ui/toast-alert';
import { cn } from '@/lib/utils';
import { SuperAdminPageHeader } from '@/components/superadmin/page-header';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Inquiry {
    id: string;
    name: string;
    email: string;
    contactNumber: string;
    organization?: string;
    message?: string;
    status: 'NEW' | 'CONTACTED' | 'CONVERTED';
    source?: string;
    ipAddress?: string;
    createdAt: string;
    updatedAt: string;
}

interface PaginatedResponse {
    data: Inquiry[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
    NEW: 'New',
    CONTACTED: 'Contacted',
    CONVERTED: 'Converted',
};

const STATUS_NEXT: Record<string, string> = {
    NEW: 'CONTACTED',
    CONTACTED: 'CONVERTED',
    CONVERTED: 'NEW',
};

const STATUS_STYLES: Record<string, string> = {
    NEW: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    CONTACTED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    CONVERTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
            STATUS_STYLES[status] ?? 'bg-slate-500/10 text-text-muted border-slate-500/20'
        )}>
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SuperAdminInquiries() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [viewInquiry, setViewInquiry] = useState<Inquiry | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);

    const { confirmState, closeConfirm, askConfirm } = useConfirm();
    const { toast, showToast, hideToast } = useToast();

    // ── Fetch ─────────────────────────────────────────────────────────────────

    const fetchInquiries = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: '10',
                search: search.trim(),
                status: statusFilter,
            });
            const { data } = await api.get<PaginatedResponse>(`/inquiries?${params}`);
            setInquiries(data.data);
            setTotal(data.total);
            setTotalPages(data.totalPages);
        } catch {
            showToast('error', 'Failed to load inquiries.');
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter, showToast]);

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    // Debounce search to avoid hitting API on every keystroke
    const [searchInput, setSearchInput] = useState('');
    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    // ── Actions ───────────────────────────────────────────────────────────────

    const handleCycleStatus = async (inquiry: Inquiry) => {
        const nextStatus = STATUS_NEXT[inquiry.status];
        setUpdatingId(inquiry.id);
        try {
            await api.patch(`/inquiries/${inquiry.id}/status`, { status: nextStatus });
            showToast('success', `Status updated to ${STATUS_LABELS[nextStatus]}.`);
            fetchInquiries();
        } catch {
            showToast('error', 'Failed to update status.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleBulkStatusUpdate = async (status: string) => {
        if (selectedIds.length === 0) return;
        setIsBulkUpdating(true);
        try {
            await Promise.all(selectedIds.map(id =>
                api.patch(`/inquiries/${id}/status`, { status })
            ));
            showToast('success', `Updated ${selectedIds.length} inquiries to ${STATUS_LABELS[status]}.`);
            setSelectedIds([]);
            fetchInquiries();
        } catch {
            showToast('error', 'Failed to update some inquiries.');
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        askConfirm({
            title: 'Bulk Delete',
            message: `Are you sure you want to delete ${selectedIds.length} inquiries?`,
            requireTypedConfirm: true,
            onConfirm: async () => {
                setIsBulkUpdating(true);
                try {
                    await Promise.all(selectedIds.map(id => api.delete(`/inquiries/${id}`)));
                    showToast('success', 'Inquiries deleted successfully.');
                    setSelectedIds([]);
                    fetchInquiries();
                } catch {
                    showToast('error', 'Failed to delete some inquiries.');
                } finally {
                    setIsBulkUpdating(false);
                }
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === inquiries.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(inquiries.map(i => i.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDelete = (id: string, name: string) => {
        askConfirm({
            title: 'Delete Inquiry',
            message: `Delete inquiry from "${name}"? This cannot be undone.`,
            requireTypedConfirm: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/inquiries/${id}`);
                    showToast('success', 'Inquiry deleted.');
                    fetchInquiries();
                } catch {
                    showToast('error', 'Failed to delete inquiry.');
                }
            },
        });
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1';
            const token = (await import('@/lib/firebase')).auth.currentUser
                ? await (await import('@/lib/firebase')).auth.currentUser!.getIdToken()
                : null;

            const res = await fetch(`${apiUrl}/inquiries/export`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            if (!res.ok) throw new Error('Export failed');

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inquiries-${Date.now()}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            showToast('error', 'Failed to export Excel file.');
        } finally {
            setExporting(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <DashboardLayout navItems={SUPERADMIN_NAV} title="Inquiries">
                <ConfirmDialog state={confirmState} onClose={closeConfirm} />
                <Toast toast={toast} onClose={hideToast} />

                <SuperAdminPageHeader
                    eyebrow="Lead intelligence"
                    title="Inbound inquiries"
                    description="Triage interest captured from public surfaces, qualify follow-up, and keep conversions visible."
                    icon={<LuMailOpen className="h-6 w-6" />}
                    actions={
                        <Button onClick={handleExport} disabled={exporting} className="h-11 rounded-2xl px-5 font-bold">
                            <LuDownload className={cn('mr-2 h-4 w-4', exporting && 'animate-bounce')} />
                            {exporting ? 'Exporting…' : 'Export'}
                        </Button>
                    }
                    stats={[
                        { label: 'Total', value: total },
                        { label: 'Selected', value: selectedIds.length },
                        { label: 'Page', value: `${page}/${totalPages}` },
                    ]}
                />

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <Input
                            className="pl-9 bg-white dark:bg-surface border-slate-200 dark:border-border-hover text-slate-900 dark:text-text-primary placeholder-slate-400 focus:border-neon-cyan/50 rounded-xl h-11"
                            placeholder="Search by name, email, org, phone…"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>

                    <select
                        className="h-11 rounded-xl bg-white dark:bg-surface border border-slate-200 dark:border-border-hover text-slate-900 dark:text-text-primary text-sm font-semibold px-4 outline-none focus:border-neon-cyan/50 transition-all appearance-none cursor-pointer min-w-[150px]"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">All Statuses</option>
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="CONVERTED">Converted</option>
                    </select>

                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 transition-all">
                            <span className="text-xs font-bold text-neon-cyan px-2">
                                {selectedIds.length} selected
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                disabled={isBulkUpdating}
                                onClick={() => handleBulkStatusUpdate('CONTACTED')}
                                className="h-9 px-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 text-[10px] font-black uppercase"
                            >
                                Mark Contacted
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                disabled={isBulkUpdating}
                                onClick={handleBulkDelete}
                                className="h-9 px-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-[10px] font-black uppercase"
                            >
                                Delete
                            </Button>
                        </div>
                    )}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center p-16">
                        <div className="w-8 h-8 rounded-full border-4 border-neon-cyan border-t-transparent animate-spin" />
                    </div>
                ) : (
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-border backdrop-blur-md shadow-xl overflow-hidden rounded-2xl">
                        <CardHeader className="bg-slate-50 dark:bg-surface border-b border-slate-200 dark:border-border pb-6">
                            <CardTitle className="text-xl text-slate-900 dark:text-text-primary">Lead Submissions</CardTitle>
                            <CardDescription className="text-slate-600 dark:text-text-muted">
                                All interest captured from the Zembaa landing page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="table-container">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-text-secondary dark:text-text-muted uppercase bg-slate-50 dark:bg-surface">
                                        <tr>
                                            <th className="px-6 py-5 w-10">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-border-hover bg-white/5 checked:bg-neon-cyan transition-all cursor-pointer"
                                                    checked={inquiries.length > 0 && selectedIds.length === inquiries.length}
                                                    onChange={toggleSelectAll}
                                                />
                                            </th>
                                            <th className="px-6 py-5 font-bold tracking-wider">Contact</th>
                                            <th className="px-6 py-5 font-bold tracking-wider">Source</th>
                                            <th className="px-6 py-5 font-bold tracking-wider">Organization</th>
                                            <th className="px-6 py-5 font-bold tracking-wider">Date Submitted</th>
                                            <th className="px-6 py-5 font-bold tracking-wider">Status</th>
                                            <th className="px-6 py-5 font-bold tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {inquiries.map((inq) => (
                                            <tr key={inq.id} className={cn(
                                                "hover:bg-slate-50 dark:hover:bg-surface transition-colors group",
                                                selectedIds.includes(inq.id) && "bg-neon-cyan/5"
                                            )}>
                                                <td className="px-6 py-5">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-border-hover bg-white/5 checked:bg-neon-cyan transition-all cursor-pointer"
                                                        checked={selectedIds.includes(inq.id)}
                                                        onChange={() => toggleSelect(inq.id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-neon-cyan transition-colors">
                                                        {inq.name || 'Anonymous User'}
                                                    </div>
                                                    <div className="text-text-secondary text-xs mt-0.5">{inq.email}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                                        {inq.source?.replace('_', ' ') || 'Website'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-slate-700 dark:text-text-muted text-sm">
                                                    {inq.organization || <span className="text-text-muted italic">—</span>}
                                                </td>
                                                <td className="px-6 py-5 text-text-secondary dark:text-text-muted text-xs whitespace-nowrap">
                                                    {formatDate(inq.createdAt)}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <StatusBadge status={inq.status} />
                                                </td>
                                                <td className="px-6 py-5 text-right space-x-2 whitespace-nowrap">
                                                    {/* View */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-slate-900 dark:text-text-primary hover:bg-slate-100 dark:hover:bg-surface-hover border border-slate-200 dark:border-border rounded-xl font-bold"
                                                        onClick={() => setViewInquiry(inq)}
                                                    >
                                                        <LuEye className="w-3.5 h-3.5 mr-1" /> View
                                                    </Button>
                                                    {/* Cycle status */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={updatingId === inq.id}
                                                        className="text-amber-400 hover:bg-amber-500/10 border border-amber-500/10 rounded-xl font-bold"
                                                        onClick={() => handleCycleStatus(inq)}
                                                    >
                                                        {updatingId === inq.id ? '…' : `→ ${STATUS_LABELS[STATUS_NEXT[inq.status]]}`}
                                                    </Button>
                                                    {/* Delete */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-rose-400 hover:bg-rose-500/10 border border-rose-500/10 rounded-xl font-bold"
                                                        onClick={() => handleDelete(inq.id, inq.name)}
                                                    >
                                                        <LuTrash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}

                                        {inquiries.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-16 text-center text-text-secondary">
                                                    <LuCircleAlert className="w-8 h-8 mx-auto text-text-muted mb-2" />
                                                    No inquiries found.
                                                    {search && <span className="block text-xs mt-1">Try clearing the search filter.</span>}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-border">
                                    <p className="text-xs text-text-secondary">
                                        Page {page} of {totalPages} &nbsp;·&nbsp; {total} total
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={page <= 1}
                                            onClick={() => setPage((p) => p - 1)}
                                            className="rounded-xl border border-slate-200 dark:border-border-hover text-slate-700 dark:text-text-muted disabled:opacity-30"
                                        >
                                            <LuChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <span className="text-xs font-bold text-slate-700 dark:text-text-primary px-2">{page}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={page >= totalPages}
                                            onClick={() => setPage((p) => p + 1)}
                                            className="rounded-xl border border-slate-200 dark:border-border-hover text-slate-700 dark:text-text-muted disabled:opacity-30"
                                        >
                                            <LuChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* View Detail Modal */}
                <Dialog open={!!viewInquiry} onOpenChange={(o) => !o && setViewInquiry(null)}>
                    <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#0d0f14] border border-slate-200 dark:border-border-hover shadow-[0_0_80px_rgba(0,0,0,0.4)] dark:shadow-[0_0_60px_rgba(0,0,0,0.8)] rounded-[2.5rem] p-0 overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-300">
                        {/* Header Banner */}
                        <div className="h-32 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 relative flex items-end p-8 overflow-hidden">
                            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-neon-cyan/10 blur-[80px] rounded-full pointer-events-none" />
                            <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-neon-purple/5 blur-[60px] rounded-full pointer-events-none" />

                            <div className="relative z-10 flex items-center gap-5 translate-y-2">
                                <div className="w-16 h-16 rounded-[1.25rem] bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center shadow-lg backdrop-blur-md">
                                    <LuMailOpen className="w-8 h-8 text-neon-cyan" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-2xl font-black text-white tracking-tight">Lead Intelligence</h3>
                                    <p className="text-[10px] uppercase font-black text-neon-cyan tracking-[0.2em] opacity-80">Transmission ID: {viewInquiry?.id.slice(-8)}</p>
                                </div>
                            </div>
                        </div>

                        {viewInquiry && (
                            <div className="p-10 space-y-10">
                                {/* Grid Info */}
                                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                    {[
                                        ['Full Name', viewInquiry.name || 'Anonymous User', 'person'],
                                        ['Official Email', viewInquiry.email, 'mail'],
                                        ['Phone Vector', viewInquiry.contactNumber || 'Not Provided', 'call'],
                                        ['Organization', viewInquiry.organization || 'Independent Entity', 'corporate_fare'],
                                        ['Data Source', viewInquiry.source?.replace('_', ' ') || 'Web Node', 'hub'],
                                        ['Submission Hash', formatDate(viewInquiry.createdAt), 'sync'],
                                    ].map(([label, value, icon]) => (
                                        <div key={label as string} className="space-y-1.5 group">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[14px] text-text-muted group-hover:text-neon-cyan transition-colors">{icon}</span>
                                                <p className="text-[10px] uppercase font-black text-text-secondary tracking-widest">{label}</p>
                                            </div>
                                            <p className="text-slate-900 dark:text-text-primary font-bold tracking-tight pl-5 truncate">{value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Status & IP Section */}
                                <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-surface border border-slate-100 dark:border-border-hover rounded-2xl">
                                    <div className="space-y-1">
                                        <p className="text-[9px] uppercase font-black text-text-muted tracking-widest px-1">Current State</p>
                                        <StatusBadge status={viewInquiry.status} />
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-[9px] uppercase font-black text-text-muted tracking-widest px-1">Network Origin</p>
                                        <p className="text-[11px] font-black text-slate-400 font-mono tracking-tighter opacity-80">{viewInquiry.ipAddress || '0.0.0.0'}</p>
                                    </div>
                                </div>

                                {/* Message Block */}
                                {viewInquiry.message && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[14px] text-text-muted">notes</span>
                                            <p className="text-[10px] uppercase font-black text-text-secondary tracking-widest">Inquiry Payload</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-[#08090b] border border-slate-200 dark:border-border rounded-2xl p-6 text-slate-800 dark:text-text-muted text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                            {viewInquiry.message}
                                        </div>
                                    </div>
                                )}

                                {/* Action Bar */}
                                <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setViewInquiry(null)}
                                        className="text-text-muted hover:text-white hover:bg-white/5 rounded-xl px-8 h-12 font-black text-xs uppercase tracking-widest"
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        disabled={updatingId === viewInquiry.id}
                                        className="bg-primary text-white font-black rounded-xl px-8 h-12 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
                                        onClick={async () => {
                                            await handleCycleStatus(viewInquiry);
                                            setViewInquiry(null);
                                        }}
                                    >
                                        {updatingId === viewInquiry.id ? 'Processing...' : `Transition to ${STATUS_LABELS[STATUS_NEXT[viewInquiry.status]]}`}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

            </DashboardLayout>
        </ProtectedRoute>
    );
}
