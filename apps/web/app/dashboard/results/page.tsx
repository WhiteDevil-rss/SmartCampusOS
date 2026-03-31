'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { UNI_ADMIN_NAV } from '@/lib/constants/nav-config';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LuUpload, LuCloudLightning, LuCircleCheck, LuTriangleAlert, LuFileSpreadsheet, LuInfo } from 'react-icons/lu';
import { Badge } from '@/components/ui/badge';
import { useToast, Toast } from '@/components/ui/toast-alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function UniversityResultsPage() {
    const { user } = useAuthStore();
    const { toast: toastState, showToast, hideToast } = useToast();
    const [pendingSubjects, setPendingSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const fetchPending = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/courses'); // In a real app, this would filter for subjects ready for external marks
            // Mocking the progress logic for UI purposes
            setPendingSubjects(data.map((d: any) => ({
                ...d,
                internalStatus: 'APPROVED_BY_APPROVAL_DEPT',
                externalStatus: 'PENDING'
            })));
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to load subject metadata');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    const publishResults = async () => {
        if (!confirm('Calculate SGPA/CGPA and publish results for all students? This action is irreversible.')) return;
        setProcessing(true);
        try {
            await api.post('/v2/marks/university/publish', { universityId: user?.universityId });
            showToast('success', 'Results published successfully');
        } catch (e) {
            showToast('error', 'Failed to publish results');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['UNI_ADMIN']}>
            <DashboardLayout navItems={UNI_ADMIN_NAV} title="Result Processing & Publication">
                <Toast toast={toastState} onClose={hideToast} />
                <div className="space-y-8 animate-in fade-in duration-700">
                    <Card className="bg-surface border-border p-12 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px] -mr-[20rem] -mt-[20rem]" />
                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                            <div className="space-y-4 max-w-2xl">
                                <Badge variant="outline" className="text-primary font-black px-4 py-1.5 rounded-full border border-primary/30 tracking-widest text-xs uppercase">University Operations</Badge>
                                <h2 className="text-5xl font-heading font-black text-white tracking-tighter leading-none">Global Result Release Engine</h2>
                                <p className="text-muted font-bold text-lg leading-relaxed">Trigger the automated calculation of SGPA, CGPA, and final grades once all internal and external assessments are verified.</p>
                            </div>
                            <Button 
                                onClick={publishResults}
                                disabled={processing}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xl px-12 h-24 shadow-md transition-all hover:-translate-y-1 flex items-center gap-4"
                            >
                                <LuCloudLightning className="w-8 h-8 animate-pulse" />
                                Publish Semester Results
                            </Button>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* External Marks Upload Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="bg-surface border-border shadow-sm overflow-hidden">
                                <CardHeader className="p-8 border-b border-border flex flex-row items-center justify-between bg-background/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-surface-hover flex items-center justify-center border border-border">
                                            <LuFileSpreadsheet className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-heading font-black text-white">Subject Submission Status</CardTitle>
                                            <p className="text-sm text-muted font-medium">Tracking marks submission from all departments.</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="font-bold border-border text-primary hover:bg-primary/10">
                                        <LuUpload className="w-4 h-4 mr-2" /> Bulk External Upload
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-surface/50">
                                            <TableRow className="border-border">
                                                <TableHead className="font-bold py-6 pl-8 text-white">Course</TableHead>
                                                <TableHead className="font-bold py-6 text-white">Internal Status</TableHead>
                                                <TableHead className="font-bold py-6 text-right pr-8 text-white">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="text-muted border-border">
                                            {pendingSubjects.map((sub) => (
                                                <TableRow key={sub.id} className="border-border hover:bg-surface-hover transition-colors">
                                                    <TableCell className="pl-8 py-5">
                                                        <div className="font-black text-white uppercase tracking-tight">{sub.name}</div>
                                                        <div className="text-[11px] font-bold text-muted">{sub.code}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-emerald-400 font-bold border-emerald-500/30 bg-emerald-500/10">
                                                            SUBMITTED & VERIFIED
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-8">
                                                        <Button size="sm" variant="ghost" className="font-bold text-primary hover:bg-primary/10">Upload External</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Guidelines Sidebar */}
                        <div className="space-y-6">
                            <Card className="bg-surface border-border p-8 shadow-sm">
                                <LuInfo className="w-10 h-10 text-primary mb-6" />
                                <h3 className="text-lg font-heading font-black text-white mb-4">Publication Checklist</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 group">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30"><LuCircleCheck className="w-3 h-3 text-emerald-500" /></div>
                                        <p className="text-sm font-medium text-muted">All internal marks verified by Approval Dept.</p>
                                    </li>
                                    <li className="flex items-start gap-3 group">
                                        <div className="w-6 h-6 rounded-full bg-surface-hover flex items-center justify-center shrink-0 mt-0.5 border border-border"><LuTriangleAlert className="w-3 h-3 text-muted" /></div>
                                        <p className="text-sm font-medium text-muted">External marks upload for {pendingSubjects.length} subjects.</p>
                                    </li>
                                    <li className="flex items-start gap-3 group">
                                        <div className="w-6 h-6 rounded-full bg-surface-hover flex items-center justify-center shrink-0 mt-0.5 border border-border"><LuTriangleAlert className="w-3 h-3 text-muted" /></div>
                                        <p className="text-sm font-medium text-muted">Credit mapping verification for all courses.</p>
                                    </li>
                                </ul>
                                <div className="mt-8 pt-8 border-t border-border">
                                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-primary mb-2">Automated Rules</p>
                                    <p className="text-xs font-bold text-muted leading-relaxed italic">The system uses the Absolute Grading system (10-point scale) to calculate final SGPA. Records without marks will be marked as &apos;F&apos; (Fail).</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
