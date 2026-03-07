'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { UNI_ADMIN_NAV } from '@/lib/constants/nav-config';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LuCheck, LuX, LuEye, LuFilter, LuGraduationCap } from 'react-icons/lu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Toast, useToast } from '@/components/ui/toast-alert';

export default function AdmissionManagement() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const fetchApplications = useCallback(async () => {
        try {
            const res = await api.get('/admissions/admin');
            setApplications(res.data);
        } catch (e) {
            console.error('Fetch error:', e);
            showToast('error', 'Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/admissions/admin/${id}/status`, { status });
            showToast('success', `Application ${status.toLowerCase()}`);
            fetchApplications();
            setOpen(false);
        } catch (e) {
            showToast('error', 'Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUBMITTED': return 'bg-blue-100 text-blue-700';
            case 'SHORTLISTED': return 'bg-yellow-100 text-yellow-700';
            case 'SELECTED': return 'bg-emerald-100 text-emerald-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <ProtectedRoute allowedRoles={['UNI_ADMIN', 'SUPERADMIN']}>
            <DashboardLayout navItems={UNI_ADMIN_NAV} title="Admission Control Center">
                <Toast toast={toast} onClose={hideToast} />
                <div className="space-y-8">
                    <div className="flex justify-between items-center text-slate-900 border-b border-slate-100 pb-8">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">Admission Review</h2>
                            <p className="text-text-secondary font-medium">Manage and process prospective student applications university-wide.</p>
                        </div>
                        <Button variant="outline"><LuFilter className="mr-2 h-4 w-4" /> Filter Listings</Button>
                    </div>

                    <Card className="glass-card border-slate-200/60 shadow-xl shadow-slate-200/20">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Incoming Applications</CardTitle>
                            <CardDescription>Process enrollments for the current academic session.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">Applicant</TableHead>
                                        <TableHead className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">Target Program</TableHead>
                                        <TableHead className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">Institution</TableHead>
                                        <TableHead className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">Status</TableHead>
                                        <TableHead className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">Applied On</TableHead>
                                        <TableHead className="text-right font-bold text-slate-900 text-[11px] uppercase tracking-wider">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-12 text-text-muted">Synchronizing records...</TableCell></TableRow>
                                    ) : applications.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-12 text-text-muted italic">No admission requests on file.</TableCell></TableRow>
                                    ) : (
                                        applications.map((app) => (
                                            <TableRow key={app.id} className="hover:bg-slate-50/40 transition-colors">
                                                <TableCell>
                                                    <div className="font-bold text-slate-900">{app.applicantName}</div>
                                                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">{app.email}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold px-2 py-0.5 text-[10px]">{app.program?.name}</Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-600 font-medium italic">{app.university?.name}</TableCell>
                                                <TableCell>
                                                    <Badge className={`${getStatusColor(app.status)} border-none font-bold text-[10px] uppercase`}>{app.status}</Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-text-secondary font-medium">
                                                    {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => { setSelectedApp(app); setOpen(true); }} className="hover:bg-indigo-50 hover:text-indigo-600 rounded-full">
                                                        <LuEye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-2xl border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">Application Dossier</DialogTitle>
                            <DialogDescription className="font-medium text-text-secondary">Comprehensive review of the intake request.</DialogDescription>
                        </DialogHeader>
                        {selectedApp && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[1px]">Personal Identity</label>
                                        <div className="font-bold text-lg mt-1 text-slate-900">{selectedApp.applicantName}</div>
                                        <div className="text-sm font-medium text-text-secondary">{selectedApp.email}</div>
                                        <div className="text-sm font-medium text-text-secondary">{selectedApp.phone}</div>
                                    </div>
                                    <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[1px]">Admission Target</label>
                                        <div className="font-bold text-lg mt-1 text-indigo-700">{selectedApp.program?.name}</div>
                                        <div className="text-sm font-bold text-indigo-500/70 uppercase tracking-wider">{selectedApp.program?.type} Enrollment</div>
                                    </div>
                                </div>

                                <Card className="border-slate-100 shadow-none bg-slate-50/30">
                                    <CardHeader className="py-4">
                                        <CardTitle className="text-xs uppercase font-black text-text-muted tracking-wider">Verification Documents</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 pb-4 text-slate-900">
                                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 group hover:border-indigo-500/20 transition-all cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600"><LuGraduationCap className="h-4 w-4" /></div>
                                                <span className="text-sm font-bold">Academic_Transcript.pdf</span>
                                            </div>
                                            <LuEye className="h-4 w-4 text-text-muted" />
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 group hover:border-indigo-500/20 transition-all cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600"><LuEye className="h-4 w-4" /></div>
                                                <span className="text-sm font-bold">Identification_Proof.jpg</span>
                                            </div>
                                            <LuEye className="h-4 w-4 text-text-muted" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <DialogFooter className="flex gap-2 sm:justify-start pt-6 border-t border-slate-100">
                                    <Button onClick={() => handleUpdateStatus(selectedApp.id, 'SELECTED')} className="bg-emerald-600 hover:bg-emerald-700 font-bold px-6">
                                        <LuCheck className="mr-2 h-4 w-4" /> Approve & Confirm
                                    </Button>
                                    <Button onClick={() => handleUpdateStatus(selectedApp.id, 'REJECTED')} variant="destructive" className="font-bold">
                                        <LuX className="mr-2 h-4 w-4" /> Reject
                                    </Button>
                                    <Button onClick={() => handleUpdateStatus(selectedApp.id, 'SHORTLISTED')} variant="outline" className="font-bold text-slate-600 border-slate-200">
                                        Shortlist for Interview
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
