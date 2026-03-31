'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    LuLoader, 
    LuSearch, 
    LuFilter, 
    LuCheck, 
    LuX, 
    LuUserCheck, 
    LuFileText, 
    LuMail, 
    LuClock,
    LuArrowRight,
    LuEye,
    LuShieldCheck
} from 'react-icons/lu';
import { useToast } from '@/components/ui/toast-alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DeptAdmissionsPage() {
    const { user } = useAuthStore();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');
    const { showToast } = useToast();

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/v2/admissions/department/${user?.departmentId}`, {
                params: { status: filter !== 'ALL' ? filter : undefined, search }
            });
            setApplications(res.data);
        } catch (error) {
            showToast('error', 'Failed to load applications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.departmentId) {
            fetchApplications();
        }
    }, [user, filter]);

    const handleAction = async (id: string, action: 'review' | 'approve' | 'reject' | 'enroll') => {
        try {
            await api.post(`/v2/admissions/${id}/${action}`);
            showToast('success', `Application ${action}ed successfully.`);
            fetchApplications();
        } catch (error) {
            showToast('error', `Failed to ${action} application.`);
        }
    };

    return (
        <DashboardLayout navItems={[]} title="Department Admissions Control">
            <div className="space-y-8">
                {/* Header & Controls */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold font-space-grotesk text-white">Application Pipeline</h2>
                        <p className="text-text-secondary">Process student admissions for your department.</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-80">
                            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <Input 
                                placeholder="Search by name, email or ID..." 
                                className="pl-10 bg-surface/50 border-border text-white h-11 rounded-xl"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchApplications()}
                            />
                        </div>
                        <select 
                            className="bg-surface/50 border-border text-white px-4 py-2 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="UNDER_REVIEW">Reviewing</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="ENROLLED">Enrolled</option>
                        </select>
                    </div>
                </div>

                {/* Applications Grid */}
                {loading ? (
                    <div className="flex h-96 items-center justify-center">
                        <LuLoader className="w-10 h-10 animate-spin text-primary" />
                    </div>
                ) : applications.length === 0 ? (
                    <Card className="bg-surface/30 border-border p-20 text-center">
                        <LuFileText className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-2">No applications found</h3>
                        <p className="text-text-secondary max-w-sm mx-auto">Either no students have applied yet or no applications match your current filters.</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {applications.map((app) => (
                            <Card key={app.id} className="bg-surface/40 border-border glass-morphism overflow-hidden hover:border-primary/40 transition-all group">
                                <div className="p-6 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                                                <LuFileText className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{app.applicantName}</h4>
                                                <p className="text-xs font-mono text-text-muted uppercase tracking-wider">{app.applicationId}</p>
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            "px-3 py-1 rounded-lg border",
                                            app.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            app.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            app.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                            'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                        )}>
                                            {app.status}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-text-muted uppercase font-black tracking-widest">Target Program</span>
                                            <p className="text-sm font-bold text-text-primary truncate">{app.program?.name || 'General Admission'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-text-muted uppercase font-black tracking-widest">Submission Date</span>
                                            <p className="text-sm font-bold text-text-primary">{new Date(app.appliedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                                        <div className="flex gap-2">
                                            {app.status === 'PENDING' && (
                                                <Button size="sm" onClick={() => handleAction(app.id, 'review')} className="bg-blue-500 hover:bg-blue-600 text-white h-9 px-4 rounded-xl font-bold">
                                                    Start Review
                                                </Button>
                                            )}
                                            {['PENDING', 'UNDER_REVIEW'].includes(app.status) && (
                                                <>
                                                    <Button size="sm" onClick={() => handleAction(app.id, 'approve')} className="bg-emerald-500 hover:bg-emerald-600 text-white h-9 px-4 rounded-xl font-bold">
                                                        <LuCheck className="w-4 h-4 mr-2" /> Approve
                                                    </Button>
                                                    <Button size="sm" onClick={() => handleAction(app.id, 'reject')} variant="ghost" className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-9 px-4 rounded-xl font-bold">
                                                        <LuX className="w-4 h-4 mr-2" /> Reject
                                                    </Button>
                                                </>
                                            )}
                                            {app.status === 'APPROVED' && (
                                                <Button size="sm" onClick={() => handleAction(app.id, 'enroll')} className="bg-primary hover:bg-primary/90 text-white h-9 px-4 rounded-xl font-bold">
                                                    <LuUserCheck className="w-4 h-4 mr-2" /> Complete Enrollment
                                                </Button>
                                            )}
                                        </div>
                                        
                                        <Button variant="outline" className="h-9 border-border bg-white/5 text-white hover:bg-white/10 rounded-xl font-bold">
                                            <LuEye className="w-4 h-4 mr-2" /> View Documents
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Secure Protocol Footer */}
                <div className="p-6 rounded-2xl bg-surface/20 border border-border flex items-center gap-4 text-text-secondary">
                    <LuShieldCheck className="w-6 h-6 text-primary" />
                    <p className="text-sm">All actions are protocol-logged with immutable audit trails. Department heads can override status within 24 hours of decision.</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
