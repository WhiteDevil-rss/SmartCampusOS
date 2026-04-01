'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuUsers, LuSearch, LuDownload, LuPower, LuPowerOff, LuTrash2, LuMailOpen, LuListFilter } from 'react-icons/lu';
import { SUPERADMIN_NAV } from '@/lib/constants/nav-config';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog, useConfirm } from '@/components/ui/confirm-dialog';
import { Toast, useToast } from '@/components/ui/toast-alert';
import { cn } from '@/lib/utils';
import { SuperAdminPageHeader } from '@/components/superadmin/page-header';

interface Subscriber {
    id: string;
    email: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export default function SuperAdminSubscribers() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0 });

    // Server-side table state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);

    const { confirmState, closeConfirm, askConfirm } = useConfirm();
    const { toast, showToast, hideToast } = useToast();

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await api.get('/subscribers/stats');
            setStats(data);
        } catch (e) {
            console.error('Failed to load stats:', e);
        }
    }, []);

    const fetchSubscribers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
            });
            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter) params.append('status', statusFilter);

            const { data } = await api.get(`/subscribers?${params.toString()}`);
            setSubscribers(data.data);
            setTotalPages(data.meta.totalPages || 1);
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to fetch subscribers.');
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSubscribers();
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [fetchSubscribers]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Handle searching (resets page)
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    // Handle status filtering
    const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
        setPage(1);
    };

    const handleDelete = (id: string) => {
        askConfirm({
            title: 'Delete Subscriber',
            message: 'Permanently remove this email from the database?',
            requireTypedConfirm: false,
            onConfirm: async () => {
                try {
                    await api.delete(`/subscribers/${id}`);
                    fetchSubscribers();
                    fetchStats();
                    showToast('success', 'Subscriber removed successfully.');
                } catch {
                    showToast('error', 'Failed to delete subscriber.');
                }
            },
        });
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'ACTIVE' ? 'UNSUBSCRIBED' : 'ACTIVE';
            await api.patch(`/subscribers/${id}/status`, { status: newStatus });
            fetchSubscribers();
            fetchStats();
            showToast('success', `Status changed to ${newStatus}.`);
        } catch {
            showToast('error', 'Failed to update subscriber status.');
        }
    };

    const handleBulkStatusUpdate = async (status: string) => {
        if (selectedIds.length === 0) return;
        setIsBulkUpdating(true);
        try {
            await Promise.all(selectedIds.map(id =>
                api.patch(`/subscribers/${id}/status`, { status })
            ));
            showToast('success', `Updated ${selectedIds.length} subscribers to ${status}.`);
            setSelectedIds([]);
            fetchSubscribers();
            fetchStats();
        } catch {
            showToast('error', 'Failed to update some subscribers.');
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        askConfirm({
            title: 'Bulk Delete',
            message: `Permanently delete ${selectedIds.length} subscribers?`,
            requireTypedConfirm: true,
            onConfirm: async () => {
                setIsBulkUpdating(true);
                try {
                    await Promise.all(selectedIds.map(id => api.delete(`/subscribers/${id}`)));
                    showToast('success', 'Subscribers deleted.');
                    setSelectedIds([]);
                    fetchSubscribers();
                    fetchStats();
                } catch {
                    showToast('error', 'Failed to delete some subscribers.');
                } finally {
                    setIsBulkUpdating(false);
                }
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === subscribers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(subscribers.map(s => s.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleExport = async () => {
        try {
            // Trigger browser download via API
            const response = await api.get('/subscribers/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'subscribers.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (e) {
            showToast('error', 'Failed to download export file.');
        }
    };

    return (
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <DashboardLayout navItems={SUPERADMIN_NAV} title="Newsletter Subscribers">
                <ConfirmDialog state={confirmState} onClose={closeConfirm} />
                <Toast toast={toast} onClose={hideToast} />

                <SuperAdminPageHeader
                    eyebrow="Audience operations"
                    title="Subscriber directory"
                    description="Review opt-ins, manage list health, and export clean audience data for campaigns and compliance."
                    icon={<LuMailOpen className="h-6 w-6" />}
                    actions={
                        <Button onClick={handleExport} className="h-11 rounded-2xl px-5 font-bold">
                            <LuDownload className="mr-2 h-4 w-4" /> Export
                        </Button>
                    }
                    stats={[
                        { label: 'Total', value: stats.total },
                        { label: 'Active', value: stats.active },
                        { label: 'Unsubscribed', value: stats.unsubscribed },
                    ]}
                />

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-border backdrop-blur-md shadow-xl rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-bold text-text-secondary uppercase">Total Audience</CardTitle>
                            <LuUsers className="w-5 h-5 text-neon-cyan" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900 dark:text-text-primary">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-border backdrop-blur-md shadow-xl rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-bold text-emerald-500 uppercase">Active Subscribers</CardTitle>
                            <LuMailOpen className="w-5 h-5 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900 dark:text-text-primary">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-border backdrop-blur-md shadow-xl rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-bold text-rose-500 uppercase">Unsubscribed</CardTitle>
                            <LuPowerOff className="w-5 h-5 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900 dark:text-text-primary">{stats.unsubscribed}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-border backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
                    <CardHeader className="bg-slate-50 dark:bg-surface border-b border-border pb-4">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:max-w-xs">
                                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                                <Input
                                    className="pl-10 bg-surface border-border-hover text-text-primary rounded-xl focus:border-neon-cyan"
                                    placeholder="Search by email..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                            </div>
                            <div className="relative w-full md:max-w-[200px]">
                                <select
                                    className="w-full pl-3 pr-10 py-2 bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-border-hover rounded-xl text-sm font-medium focus:outline-none focus:border-neon-cyan appearance-none"
                                    value={statusFilter}
                                    onChange={handleFilter}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="UNSUBSCRIBED">Unsubscribed</option>
                                </select>
                                <LuListFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 pointer-events-none" />
                            </div>

                            {selectedIds.length > 0 && (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 transition-all">
                                    <span className="text-xs font-bold text-neon-cyan px-2">
                                        {selectedIds.length} selected
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        disabled={isBulkUpdating}
                                        onClick={() => handleBulkStatusUpdate('ACTIVE')}
                                        className="h-9 px-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-[10px] font-black uppercase"
                                    >
                                        Reactivate
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        disabled={isBulkUpdating}
                                        onClick={() => handleBulkStatusUpdate('UNSUBSCRIBED')}
                                        className="h-9 px-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 text-[10px] font-black uppercase"
                                    >
                                        Deactivate
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
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="table-container">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-text-secondary uppercase bg-slate-50 dark:bg-surface border-b border-border/50">
                                    <tr>
                                        <th className="px-6 py-4 w-10">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-border-hover bg-white/5 checked:bg-neon-cyan transition-all cursor-pointer"
                                                checked={subscribers.length > 0 && selectedIds.length === subscribers.length}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Email Address</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">Subscribed Date</th>
                                        <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-text-secondary">
                                                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : subscribers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                                                No subscribers found.
                                            </td>
                                        </tr>
                                    ) : (
                                        subscribers.map((sub) => (
                                            <tr key={sub.id} className={cn(
                                                "hover:bg-slate-50 dark:hover:bg-surface transition-colors group",
                                                selectedIds.includes(sub.id) && "bg-neon-cyan/5"
                                            )}>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-border-hover bg-white/5 checked:bg-neon-cyan transition-all cursor-pointer"
                                                        checked={selectedIds.includes(sub.id)}
                                                        onChange={() => toggleSelect(sub.id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                                                    {sub.email}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {sub.status === 'ACTIVE' ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div> Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2"></div> Unsubscribed
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-text-secondary">
                                                    {new Date(sub.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={cn(
                                                            "rounded-xl font-bold border transition-all",
                                                            sub.status === 'ACTIVE'
                                                                ? "text-rose-400 border-rose-500/10 hover:bg-rose-500/10 hover:text-rose-300"
                                                                : "text-emerald-400 border-emerald-500/10 hover:bg-emerald-500/10 hover:text-emerald-300"
                                                        )}
                                                        onClick={() => handleToggleStatus(sub.id, sub.status)}
                                                    >
                                                        {sub.status === 'ACTIVE' ? <LuPowerOff className="w-3.5 h-3.5 mr-1" /> : <LuPower className="w-3.5 h-3.5 mr-1" />}
                                                        {sub.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent rounded-xl font-bold"
                                                        onClick={() => handleDelete(sub.id)}
                                                    >
                                                        <LuTrash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Footer */}
                        {!loading && subscribers.length > 0 && (
                            <div className="flex items-center justify-between p-4 border-t border-border bg-slate-50 dark:bg-black/20">
                                <span className="text-xs text-text-secondary">Page {page} of {totalPages}</span>
                                <div className="space-x-2">
                                    <Button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        variant="outline"
                                        size="sm"
                                        className="h-8 rounded-lg border-border-hover"
                                    >
                                        Prev
                                    </Button>
                                    <Button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        variant="outline"
                                        size="sm"
                                        className="h-8 rounded-lg border-border-hover"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
