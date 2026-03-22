'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LuCheck, LuX, LuLoader, LuMail, LuPhone, LuFileText } from 'react-icons/lu';
import { useToast } from '@/components/ui/toast-alert';

export default function DeptAdmissionsPage() {
    const { user } = useAuthStore();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/v2/admissions/admin?departmentId=${user?.entityId}`);
            setApplications(res.data);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
            showToast('error', 'Failed to load admission requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.entityId) {
            fetchApplications();
        }
    }, [user]);

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/v2/admissions/admin/${id}/status`, { status });
            showToast('success', `Application marked as ${status}`);
            fetchApplications();
        } catch (error) {
            showToast('error', 'Failed to update application status.');
        }
    };

    return (
        <DashboardLayout navItems={[]} title="Admission Requests">
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold font-space-grotesk text-white">Department Applicants</h2>
                        <p className="text-text-secondary text-sm">Review incoming admission payloads for your department.</p>
                    </div>
                    <Button onClick={fetchApplications} variant="outline" className="border-border bg-surface text-white">
                        Refresh List
                    </Button>
                </div>

                {loading ? (
                    <div className="flex h-40 items-center justify-center">
                        <LuLoader className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : applications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 glass-morphism rounded-2xl border border-border">
                        <LuFileText className="w-12 h-12 text-slate-500 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Applications Found</h3>
                        <p className="text-text-secondary text-center">There are currently no pending admission applications in your department.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {applications.map((app) => (
                            <Card key={app.id} className="bg-surface/50 border-border hover:border-primary/50 transition-colors">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg font-bold text-white line-clamp-1">{app.applicantName}</CardTitle>
                                        <span className={`px-2 py-1 text-[10px] uppercase font-black tracking-wider rounded-md ${
                                            app.status === 'SUBMITTED' ? 'bg-amber-500/10 text-amber-500' :
                                            app.status === 'SELECTED' ? 'bg-emerald-500/10 text-emerald-500' :
                                            app.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-500' :
                                            'bg-blue-500/10 text-blue-500'
                                        }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-neon-cyan truncate">{app.program?.name || 'Direct Entry'}</p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2 text-sm text-text-secondary">
                                        <div className="flex items-center gap-2">
                                            <LuMail className="w-4 h-4 text-slate-400" />
                                            <span className="truncate">{app.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <LuPhone className="w-4 h-4 text-slate-400" />
                                            <span>{app.phone || 'N/A'}</span>
                                        </div>
                                    </div>
                                    
                                    {app.status === 'SUBMITTED' && (
                                        <div className="flex items-center gap-3 pt-4 border-t border-border">
                                            <Button 
                                                variant="default" 
                                                className="flex-1 bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/30"
                                                onClick={() => handleUpdateStatus(app.id, 'SELECTED')}
                                            >
                                                <LuCheck className="w-4 h-4 mr-2" /> Accept
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                className="flex-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/30"
                                                onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                                            >
                                                <LuX className="w-4 h-4 mr-2" /> Reject
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
