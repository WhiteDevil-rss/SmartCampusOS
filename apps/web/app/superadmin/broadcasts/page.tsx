'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SUPERADMIN_NAV } from '@/lib/constants/nav-config';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast, useToast } from '@/components/ui/toast-alert';
import { LuSend } from 'react-icons/lu';

export default function SuperAdminBroadcasts() {
    const [loading, setLoading] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('SYSTEM');
    const [targetType, setTargetType] = useState('ALL');
    const [targetRoleId, setTargetRoleId] = useState('');
    const [targetUserId, setTargetUserId] = useState('');
    const [link, setLink] = useState('');

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: any = {
                title,
                message,
                category,
                targetType,
                link: link || undefined
            };

            if (targetType === 'ROLE') payload.targetRoleId = targetRoleId;
            if (targetType === 'USER') payload.targetUserId = targetUserId;

            const { data } = await api.post('/v2/notifications/broadcast', payload);
            showToast('success', `Broadcast sent successfully to ${data.recipientsCount} recipient(s).`);

            // Reset form
            setTitle('');
            setMessage('');
            setCategory('SYSTEM');
            setTargetType('ALL');
            setTargetRoleId('');
            setTargetUserId('');
            setLink('');

        } catch (error: any) {
            console.error('Broadcast Error:', error);
            showToast('error', error?.response?.data?.error || 'Failed to send broadcast.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['SUPERADMIN']}>
            <DashboardLayout navItems={SUPERADMIN_NAV} title="Broadcast Messaging">
                <Toast toast={toast} onClose={hideToast} />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-text-primary glow-sm">Global Broadcasts</h2>
                        <p className="text-slate-600 dark:text-text-muted mt-1">Send targeted announcements and critical alerts instantly to users natively.</p>
                    </div>
                </div>

                <div className="max-w-3xl">
                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-border backdrop-blur-md shadow-xl rounded-2xl">
                        <CardHeader className="bg-slate-50 dark:bg-surface border-b border-border pb-4">
                            <CardTitle className="text-lg font-bold text-text-primary">Compose Broadcast Message</CardTitle>
                            <CardDescription className="text-text-secondary">Configure the message payload and targeted audience accurately.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleBroadcast} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary">Notification Title *</label>
                                    <Input
                                        placeholder="E.g., Scheduled Maintenance Downtime"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="bg-surface border-border-hover focus:border-neon-cyan"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary">Message Content *</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Detailed message regarding the alert..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                        className="w-full bg-surface border border-border-hover focus:border-neon-cyan rounded-xl p-3 text-sm text-text-primary resize-none outline-none transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary">Category *</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            required
                                            className="w-full bg-surface border border-border-hover focus:border-neon-cyan rounded-xl p-3 text-sm font-medium text-text-primary outline-none"
                                        >
                                            <option value="SYSTEM">System Alert</option>
                                            <option value="ACADEMIC">Academic Announcement</option>
                                            <option value="FEES">Financial / Fees</option>
                                            <option value="ATTENDANCE">Attendance Warning</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary">Target Audience *</label>
                                        <select
                                            value={targetType}
                                            onChange={(e) => setTargetType(e.target.value)}
                                            required
                                            className="w-full bg-surface border border-border-hover focus:border-neon-cyan rounded-xl p-3 text-sm font-medium text-text-primary outline-none"
                                        >
                                            <option value="ALL">All Network Users</option>
                                            <option value="ROLE">Specific Role Mapping</option>
                                            <option value="USER">Specific User (UID)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Conditional Render for Specific Targets */}
                                {targetType === 'ROLE' && (
                                    <div className="space-y-2 p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-border">
                                        <label className="text-sm font-bold text-text-secondary">Select Authorized Role *</label>
                                        <select
                                            value={targetRoleId}
                                            onChange={(e) => setTargetRoleId(e.target.value)}
                                            required={targetType === 'ROLE'}
                                            className="w-full bg-surface border border-border-hover focus:border-neon-cyan rounded-xl p-3 text-sm font-medium text-text-primary outline-none"
                                        >
                                            <option value="" disabled>-- Select System Role --</option>
                                            <option value="STUDENT">Student Profiles</option>
                                            <option value="FACULTY">Core Faculty</option>
                                            <option value="DEPT_ADMIN">Department Admins</option>
                                            <option value="UNI_ADMIN">University Moderators</option>
                                            <option value="SUPERADMIN">Super Admins Only</option>
                                        </select>
                                    </div>
                                )}

                                {targetType === 'USER' && (
                                    <div className="space-y-2 p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-border">
                                        <label className="text-sm font-bold text-text-secondary">Target Database ID (User UUID) *</label>
                                        <Input
                                            placeholder="Insert strict user internal identifier..."
                                            value={targetUserId}
                                            onChange={(e) => setTargetUserId(e.target.value)}
                                            required={targetType === 'USER'}
                                            className="bg-surface border-border-hover focus:border-neon-cyan"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary">Associated Link (Optional)</label>
                                    <Input
                                        placeholder="e.g., /dashboard/maintenance"
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        className="bg-surface border-border-hover focus:border-neon-cyan"
                                    />
                                    <p className="text-xs text-text-muted mt-1">If provided, the notification block will become actively clickable routing to this URI.</p>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-neon-cyan hover:bg-[#00d0cc] text-black font-bold shadow-[0_0_15px_rgba(0,255,255,0.3)] min-w-[150px]"
                                    >
                                        {loading ? (
                                            <span className="flex items-center">
                                                <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full mr-2"></div>
                                                Transmitting...
                                            </span>
                                        ) : (
                                            <span className="flex items-center">
                                                <LuSend className="mr-2" /> Launch Broadcast
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
