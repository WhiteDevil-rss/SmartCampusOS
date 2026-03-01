'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import {
    LuLayoutDashboard, LuBuilding2, LuUsers, LuClipboardList,
    LuSearch, LuDownload, LuChevronLeft, LuChevronRight,
    LuEye, LuInfo, LuGlobe, LuShield, LuClock, LuUser
} from 'react-icons/lu';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast, Toast } from '@/components/ui/toast-alert';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { SUPERADMIN_NAV } from '@/lib/constants/nav-config';
import { format } from 'date-fns';

interface Log {
    id: string;
    createdAt: string;
    action: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    user?: {
        username: string;
    };
    status: string;
    ipAddress?: string;
    method?: string;
    endpoint?: string;
    userAgent?: string;
    changes?: Record<string, unknown>;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedLog, setSelectedLog] = useState<Log | null>(null);
    const { toast, showToast, hideToast } = useToast();

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/logs', {
                params: {
                    page,
                    limit: 15,
                    search: search || undefined,
                    status: statusFilter || undefined
                }
            });
            setLogs(data.logs);
            setTotal(data.pagination.total);
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, search, showToast]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleExport = async () => {
        try {
            const response = await api.get('/logs/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'audit-logs.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast('success', 'Logs exported successfully');
        } catch {
            showToast('error', 'Export failed');
        }
    };

    const getFriendlyActionName = (action: string) => {
        const mapping: Record<string, string> = {
            'POST /v1/auth/login': 'User Login',
            'POST /login': 'User Login',
            'POST /v1/universities': 'Create University',
            'PUT /v1/universities': 'Update University',
            'DELETE /v1/universities': 'Delete University',
            'POST /v1/users': 'Create User',
            'PUT /v1/users': 'Update User',
            'DELETE /v1/users': 'Delete User',
            'PATCH /v1/users': 'Update User Status',
            'GET /v1/logs/export': 'Export Audit Logs',
            'DELETE_UNIVERSITY': 'Delete University',
            'CREATE_UNIVERSITY': 'Create University',
            'UPDATE_UNIVERSITY': 'Update University',
        };

        // Try exact match or check if it starts with the method + space
        if (mapping[action]) return mapping[action];

        // Remove UUIDs and technical prefixes for cleaner display if no mapping
        return action
            .replace(/POST |PUT |DELETE |PATCH |\/v1\//g, '')
            .replace(/\/[a-f0-9-]{36}/g, '') // remove UUIDs
            .replace(/\//g, ' ')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const navItems = SUPERADMIN_NAV;

    return (
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <DashboardLayout navItems={navItems} title="System Audit Logs">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white glow-sm">Audit Trail</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">Monitor every administrative action across the platform.</p>
                    </div>
                    <Button onClick={handleExport} variant="ghost" className="flex items-center gap-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl font-bold">
                        <LuDownload className="w-4 h-4" /> Export CSV
                    </Button>
                </div>

                <Card className="mb-8 bg-white dark:bg-slate-900/40 border-slate-200 dark:border-white/5 backdrop-blur-md shadow-xl dark:shadow-2xl overflow-hidden rounded-2xl">
                    <CardHeader className="pb-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <LuSearch className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                                <Input
                                    className="pl-10 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:ring-neon-cyan/50"
                                    placeholder="Search by action, ID, or IP..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
                                />
                            </div>
                            <div className="flex gap-3">
                                <select
                                    className="flex h-11 w-40 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-2 text-sm text-slate-900 dark:text-white ring-offset-background cursor-pointer focus:ring-2 focus:ring-neon-cyan/30 mt-0.5"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Status</option>
                                    <option value="SUCCESS" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Success Only</option>
                                    <option value="FAILURE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Failure Only</option>
                                </select>
                                <Button onClick={fetchLogs} className="bg-neon-cyan text-slate-900 font-bold px-6 shadow-[0_0_15px_rgba(57,193,239,0.3)] rounded-xl">Apply</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-white/5">
                                    <tr>
                                        <th className="px-6 py-5 font-bold uppercase tracking-wider">Timestamp</th>
                                        <th className="px-6 py-5 font-bold uppercase tracking-wider">Action</th>
                                        <th className="px-6 py-5 font-bold uppercase tracking-wider">Actor</th>
                                        <th className="px-6 py-5 font-bold uppercase tracking-wider">Target</th>
                                        <th className="px-6 py-5 font-bold uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-5 font-bold uppercase tracking-wider text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center text-slate-400">
                                                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-2" />
                                                Loading trails...
                                            </td>
                                        </tr>
                                    ) : logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center text-slate-400 italic">No logs found matching criteria.</td>
                                        </tr>
                                    ) : logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                                                {format(new Date(log.createdAt), 'MMM dd, HH:mm:ss')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-700">{getFriendlyActionName(log.action)}</div>
                                                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">{log.entityType || 'SYSTEM'}</div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-600">
                                                {log.user?.username || log.userId?.split('-')[0] || 'System'}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-600 truncate max-w-[150px]">
                                                {log.entityId || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {log.status === 'SUCCESS' ? (
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">SUCCESS</span>
                                                ) : (
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100/80 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50">FAILURE</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full"
                                                    onClick={() => setSelectedLog(log)}
                                                >
                                                    <LuEye className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-5 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex justify-between items-center text-slate-700 dark:text-white/80 font-medium">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Showing <span className="text-slate-900 dark:text-white font-bold">{logs.length}</span> of <span className="text-neon-cyan font-bold">{total}</span> entries</span>
                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    <LuChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg"
                                    disabled={logs.length < 15 || page * 15 >= total}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    <LuChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
                    <DialogContent className="max-w-2xl bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-0 overflow-hidden">
                        <DialogHeader className="p-8 pb-0">
                            <DialogTitle className="flex items-center gap-3 text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                <LuShield className="w-8 h-8 text-neon-cyan drop-shadow-[0_0_10px_rgba(57,193,239,0.5)]" />
                                Audit Matrix Detail
                            </DialogTitle>
                            <p className="text-slate-600 dark:text-slate-400 font-medium">Deep dive into the selected system event trail.</p>
                        </DialogHeader>

                        {selectedLog && (
                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 shadow-inner">
                                        <div className="flex items-center gap-2 text-[10px] uppercase font-black text-slate-500 tracking-widest mb-3">
                                            <LuClock className="w-3.5 h-3.5 text-neon-cyan" /> Event Timestamp
                                        </div>
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-tight">
                                            {format(new Date(selectedLog.createdAt), 'PPPP')}
                                        </p>
                                        <p className="text-2xl font-black text-white mt-1 font-mono">
                                            {format(new Date(selectedLog.createdAt), 'HH:mm:ss.SSS')}
                                        </p>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner">
                                        <div className="flex items-center gap-2 text-[10px] uppercase font-black text-slate-500 tracking-widest mb-3">
                                            <LuUser className="w-3.5 h-3.5 text-neon-purple" /> Identity Actor
                                        </div>
                                        <p className="text-xl font-black text-white">
                                            {selectedLog.user?.username || 'System/Automated'}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-mono mt-1 truncate border border-white/5 bg-black/20 px-2 py-1 rounded-md">
                                            {selectedLog.userId || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner">
                                    <div className="flex items-center gap-2 text-[10px] uppercase font-black text-slate-500 tracking-widest mb-4">
                                        <LuGlobe className="w-3.5 h-3.5 text-neon-pink" /> Context Matrix Info
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                        <div>
                                            <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest block mb-1">Host Identity</span>
                                            <span className="font-mono text-sm text-slate-300 bg-white/5 px-2 py-1 rounded border border-white/5">{selectedLog.ipAddress || 'Unknown'}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest block mb-1">Method & Sector</span>
                                            <span className="font-mono text-[10px] bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-1 rounded text-neon-cyan font-bold uppercase">
                                                {selectedLog.method} {selectedLog.endpoint}
                                            </span>
                                        </div>
                                        <div className="md:col-span-2">
                                            <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest block mb-1">Agent Signature</span>
                                            <span className="text-[10px] text-slate-500 font-medium leading-relaxed block break-all bg-black/20 p-2 rounded border border-white/5">
                                                {selectedLog.userAgent || 'Not captured'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl border border-white/5 bg-black/20">
                                    <div className="flex items-center gap-2 text-[10px] uppercase font-black text-slate-500 tracking-widest mb-4">
                                        <LuInfo className="w-3.5 h-3.5 text-white" /> Matrix Mutation Payload
                                    </div>
                                    <div className="bg-slate-950/50 rounded-xl p-5 overflow-x-auto max-h-[300px] border border-white/5 custom-scrollbar shadow-inner">
                                        <pre className="text-xs text-emerald-400 font-mono leading-relaxed">
                                            {JSON.stringify(selectedLog.changes || {}, null, 4)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="p-8 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 text-right">
                            <Button variant="ghost" onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-8 h-12 font-bold transition-all">
                                Close Matrix
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Toast toast={toast} onClose={hideToast} />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
