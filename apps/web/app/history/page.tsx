'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { offlineStore, OfflineMessage } from '@/lib/services/offline-store';
import {
    LuSearch, LuFilter, LuCalendar, LuMessageSquare, LuChevronRight,
    LuInfo, LuTriangleAlert, LuBell, LuClock, LuHistory
} from 'react-icons/lu';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DEPT_ADMIN_NAV, UNI_ADMIN_NAV, SUPERADMIN_NAV, FACULTY_NAV, STUDENT_NAV } from '@/lib/constants/nav-config';
import { MessageDetailPopup } from '@/components/shared/message-detail-popup';

export default function HistoryPage() {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [selectedMessage, setSelectedMessage] = useState<any>(null);

    const getNavItems = () => {
        switch (user?.role) {
            case 'SUPERADMIN': return SUPERADMIN_NAV;
            case 'UNI_ADMIN': return UNI_ADMIN_NAV;
            case 'DEPT_ADMIN': return DEPT_ADMIN_NAV;
            case 'FACULTY': return FACULTY_NAV;
            case 'STUDENT': return STUDENT_NAV;
            default: return [];
        }
    };

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Fetch from Server
            let serverMessages = [];
            try {
                const serverRes = await api.get('/v2/history');
                serverMessages = serverRes.data;
            } catch (e) {
                console.warn('Server offline, relying on local cache');
            }

            // 2. Fetch from IndexedDB
            let localMessages: OfflineMessage[] = [];
            if (offlineStore) {
                localMessages = await offlineStore.getAllMessages();
            }

            // 3. Merge and Deduplicate
            const combined = [...serverMessages];
            localMessages.forEach(local => {
                const exists = combined.some(s =>
                    s.message_id === local.message_id
                );
                if (!exists) {
                    combined.push({
                        id: local.message_id,
                        title: local.subject,
                        content: local.body,
                        type: local.category,
                        createdAt: local.sent_at,
                        synced: local.synced_to_server,
                        isLocal: true
                    });
                }
            });

            // Sort by date desc
            setMessages(combined.sort((a, b) => new Date(b.sent_at || b.createdAt).getTime() - new Date(a.sent_at || a.createdAt).getTime()));
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const [stats, setStats] = useState({ total: 0, pending_sync: 0, synced: 0 });
    useEffect(() => {
        const updateStats = async () => {
            if (offlineStore) {
                const s = await offlineStore.getStats();
                setStats(s);
            }
        };
        updateStats();
        const interval = setInterval(updateStats, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const filteredMessages = messages.filter(msg => {
        const matchesSearch =
            (msg.title || msg.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (msg.content || msg.body || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = filterCategory === 'ALL' || msg.type === filterCategory || msg.category === filterCategory;

        return matchesSearch && matchesCategory;
    });

    const getCategoryIcon = (category: string) => {
        switch (category?.toUpperCase()) {
            case 'ACADEMIC': return <LuInfo className="w-4 h-4 text-blue-500" />;
            case 'ATTENDANCE': return <LuTriangleAlert className="w-4 h-4 text-amber-500" />;
            case 'SYSTEM': return <LuBell className="w-4 h-4 text-emerald-500" />;
            default: return <LuMessageSquare className="w-4 h-4 text-primary" />;
        }
    };

    return (
        <ProtectedRoute allowedRoles={['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN', 'FACULTY', 'STUDENT']}>
            <DashboardLayout navItems={getNavItems()} title="Message History">
                <div className="max-w-6xl mx-auto space-y-8 pb-20">
                    {/* Header Card */}
                    <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-indigo-600/10 via-primary/5 to-transparent border border-white/10 overflow-hidden backdrop-blur-xl">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                                    <LuHistory className="w-10 h-10 text-primary" />
                                    Communication History
                                </h1>
                                <p className="text-text-muted font-bold mt-2">Access all your past notifications, alerts, and system broadcasts in one secure place.</p>
                            </div>
                            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-sm self-start">
                                <span className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    "bg-primary text-white shadow-glow"
                                )}>Active Journal</span>
                            </div>
                        </div>
                    </div>

                    {/* Sync Status - Section 5.6 SPEC */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-white/5 border-white/10 rounded-2xl p-4 flex items-center justify-between">
                            <span className="text-sm font-bold text-emerald-500 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Synced
                            </span>
                            <span className="text-lg font-black text-white">{stats.synced} Cloud</span>
                        </Card>
                        <Card className="bg-white/5 border-white/10 rounded-2xl p-4 flex items-center justify-between">
                            <span className="text-sm font-bold text-blue-500 flex items-center gap-2">
                                <LuClock className="w-4 h-4" />
                                Pending Sync
                            </span>
                            <span className="text-lg font-black text-white">{stats.pending_sync} items</span>
                        </Card>
                        <Card className="bg-white/5 border-white/10 rounded-2xl p-4 flex items-center justify-between">
                            <span className="text-sm font-bold text-text-muted flex items-center gap-2">
                                <LuHistory className="w-4 h-4" />
                                Local Backup
                            </span>
                            <span className="text-lg font-black text-white">{stats.total} total</span>
                        </Card>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted transition-colors group-focus-within:text-primary" />
                            <Input
                                placeholder="Search archives by title or content..."
                                className="h-14 pl-12 bg-white/5 border-border rounded-2xl focus:ring-primary/20 transition-all font-bold text-white shadow-inner"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            {['ALL', 'NOTIFICATION', 'ALERT', 'BROADCAST'].map((cat) => (
                                <Button
                                    key={cat}
                                    variant={filterCategory === cat ? 'default' : 'outline'}
                                    onClick={() => setFilterCategory(cat)}
                                    className={cn(
                                        "h-14 px-6 rounded-2xl font-black transition-all",
                                        filterCategory === cat
                                            ? "bg-primary text-white shadow-glow border-0"
                                            : "bg-white/5 border-border text-text-muted hover:bg-white/10"
                                    )}
                                >
                                    {cat === 'ALL' ? 'Everything' : cat}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <Card className="glass-card border-border overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl font-black text-white tracking-tight">Recent Archives</CardTitle>
                                <span className="text-sm font-bold text-text-muted bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                                    {filteredMessages.length} Messages Found
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-20 text-center">
                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent border-dashed animate-spin rounded-full mx-auto mb-6"></div>
                                    <p className="text-text-muted font-bold animate-pulse">Restoring your archives...</p>
                                </div>
                            ) : filteredMessages.length > 0 ? (
                                <div className="divide-y divide-white/5">
                                    {filteredMessages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            onClick={() => setSelectedMessage(msg)}
                                            className="group p-6 hover:bg-primary/5 transition-all cursor-pointer flex items-center gap-6"
                                        >
                                            <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 shadow-inner">
                                                {getCategoryIcon(msg.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                                                        {msg.type}
                                                    </span>
                                                    <span className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                                                        <LuClock className="w-3 h-3" />
                                                        {format(new Date(msg.sent_at || msg.createdAt), 'MMM dd, yyyy · HH:mm')}
                                                    </span>
                                                    {msg.synced && (
                                                        <span className="text-[9px] font-bold text-emerald-500/70 border border-emerald-500/20 px-1.5 rounded bg-emerald-500/5">☁️ Synced</span>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-black text-white truncate transition-colors group-hover:text-primary tracking-tight">
                                                    {msg.title || msg.subject}
                                                </h3>
                                                <p className="text-sm text-text-secondary truncate font-medium">
                                                    {msg.content || msg.body}
                                                </p>
                                            </div>
                                            <LuChevronRight className="w-6 h-6 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-20 text-center">
                                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/5">
                                        <LuMessageSquare className="w-10 h-10 text-text-muted" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">No archives matching your criteria</h3>
                                    <p className="text-text-muted font-medium mt-2 max-w-sm mx-auto">Try adjusting your filters or search query to find specific communications.</p>
                                    <Button
                                        onClick={() => { setSearchQuery(''); setFilterCategory('ALL'); }}
                                        variant="ghost"
                                        className="mt-6 text-primary hover:text-primary/80 font-black h-auto p-0"
                                    >
                                        Clear all filters
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                        {/* Footer - Section 5.6 SPEC */}
                        {!loading && filteredMessages.length > 0 && (
                            <div className="p-8 border-t border-white/5 bg-white/5 flex flex-wrap gap-4 items-center justify-between">
                                <div className="flex gap-3">
                                    <Button variant="outline" className="rounded-xl font-bold border-white/10 hover:bg-white/10">Export CSV</Button>
                                    <Button variant="outline" className="rounded-xl font-bold border-white/10 hover:bg-white/10">Export PDF</Button>
                                </div>
                                <div className="text-sm font-bold text-text-muted">
                                    Page 1 of 1 · Showing {filteredMessages.length} results
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {selectedMessage && (
                    <MessageDetailPopup
                        notification={{
                            id: selectedMessage.id,
                            title: selectedMessage.title || selectedMessage.subject,
                            message: selectedMessage.content || selectedMessage.body,
                            category: (selectedMessage.type === 'BROADCAST' ? 'SYSTEM' : selectedMessage.type) as any,
                            createdAt: selectedMessage.sent_at || selectedMessage.createdAt,
                            isRead: true,
                            link: selectedMessage.link
                        }}
                        onClose={() => setSelectedMessage(null)}
                    />
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
