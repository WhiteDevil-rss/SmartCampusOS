'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { UNI_ADMIN_NAV } from '@/lib/constants/nav-config';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Toast, useToast } from '@/components/ui/toast-alert';
import { 
    LuBriefcase, LuBuilding2, LuTrendingUp, LuPlus, LuAward, LuUsers, 
    LuLoader, LuSearch, LuGlobe, LuPhone, LuTarget, LuSparkles 
} from 'react-icons/lu';
import { format } from 'date-fns';

export default function PlacementsDashboard() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();

    // Modal States
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [newCompany, setNewCompany] = useState({ name: '', type: 'IT', website: '', hrContact: '' });
    const [newPlacement, setNewPlacement] = useState({ companyId: '', studentEnrollmentNo: '', jobRole: '', package: '', date: format(new Date(), 'yyyy-MM-dd') });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [companiesRes, recordsRes] = await Promise.all([
                api.get('/v2/placements/companies'),
                api.get('/v2/placements/records')
            ]);
            setCompanies(companiesRes.data);
            setRecords(recordsRes.data);
        } catch (error) {
            console.error('Failed to fetch placement data', error);
            showToast('error', 'Failed to load placement data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRegisterCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/v2/placements/companies', newCompany);
            showToast('success', 'Company registered successfully');
            setIsCompanyModalOpen(false);
            setNewCompany({ name: '', type: 'IT', website: '', hrContact: '' });
            fetchData();
        } catch (error) {
            console.error('Failed to register company', error);
            showToast('error', 'Failed to register company');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogPlacement = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/v2/placements/records', newPlacement);
            showToast('success', 'Placement recorded successfully');
            setIsPlacementModalOpen(false);
            setNewPlacement({ companyId: '', studentEnrollmentNo: '', jobRole: '', package: '', date: format(new Date(), 'yyyy-MM-dd') });
            fetchData();
        } catch (error) {
            console.error('Failed to record placement', error);
            showToast('error', 'Failed to record placement. Check enrollment number.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Derived Metrics
    const topCtc = records.length > 0 ? Math.max(...records.map(r => r.ctc)) : 0;
    const avgCtc = records.length > 0 ? (records.reduce((acc, r) => acc + r.ctc, 0) / records.length).toFixed(1) : 0;

    return (
        <ProtectedRoute allowedRoles={['UNI_ADMIN', 'SUPERADMIN']}>
            <DashboardLayout navItems={UNI_ADMIN_NAV} title="Placements Cell">
                <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-3">
                                <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-600">
                                    <LuBriefcase className="w-6 h-6" />
                                </div>
                                Placement Cell
                            </h1>
                            <p className="text-text-secondary mt-2 font-medium">
                                Manage university recruiters, monitor student placement drives, and track CTC metrics.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="outline"
                                className="gap-2 border-border-subtle bg-surface-secondary hover:bg-surface-hover transition-all"
                                onClick={() => setIsCompanyModalOpen(true)}
                            >
                                <LuBuilding2 className="w-4 h-4 text-purple-600" /> Register Company
                            </Button>
                            <Button
                                className="gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 px-6"
                                onClick={() => setIsPlacementModalOpen(true)}
                            >
                                <LuPlus className="w-4 h-4" /> Log Placement
                            </Button>
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white shadow-xl border-none overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                <LuUsers className="w-24 h-24" />
                            </div>
                            <CardContent className="p-8">
                                <p className="text-white/70 font-bold text-sm uppercase tracking-wider">Total Placed Students</p>
                                <h3 className="text-5xl font-black mt-3 drop-shadow-sm">{records.length}</h3>
                                <div className="mt-4 flex items-center gap-2 text-xs font-medium bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                                    <LuTrendingUp className="w-3 h-3" /> Successfully Placed
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-surface border-border shadow-md rounded-[1.5rem] group">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-text-secondary font-bold text-sm uppercase tracking-wider">Highest Package</p>
                                        <h3 className="text-4xl font-black mt-3 text-text-primary">₹{topCtc}L<span className="text-xl text-text-muted font-bold">PA</span></h3>
                                    </div>
                                    <div className="p-4 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors">
                                        <LuAward className="w-8 h-8 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-surface border-border shadow-md rounded-[1.5rem] group">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-text-secondary font-bold text-sm uppercase tracking-wider">Average Package</p>
                                        <h3 className="text-4xl font-black mt-3 text-text-primary">₹{avgCtc}L<span className="text-xl text-text-muted font-bold">PA</span></h3>
                                    </div>
                                    <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors">
                                        <LuTrendingUp className="w-8 h-8 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* AI Career Matchmaker */}
                        <Card className="bg-surface border-border shadow-md rounded-[1.5rem] overflow-hidden">
                            <CardHeader className="bg-indigo-600 text-white p-6">
                                <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
                                    <LuSparkles className="w-5 h-5" /> AI Career Matchmaker
                                </CardTitle>
                                <CardDescription className="text-indigo-100 font-medium">Predicting top career paths based on institutional data.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <div className="flex items-center justify-between">
                                        <div className="font-black text-indigo-900 uppercase text-xs tracking-widest">Recommended Role</div>
                                        <Badge className="bg-indigo-600 text-[10px] font-black uppercase">98% Match</Badge>
                                    </div>
                                    <div className="text-2xl font-black text-indigo-600 mt-1">Cloud Solutions Architect</div>
                                    <p className="text-xs text-indigo-700/70 mt-2 font-medium">
                                        Based on performance trends in Distributed Systems and Cloud Computing modules.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <div className="text-sm font-bold text-text-secondary flex items-center justify-between">
                                        <span>Skill Alignment</span>
                                        <span className="text-indigo-600">High</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['AWS', 'Kubernetes', 'Terraform', 'Go'].map(skill => (
                                            <Badge key={skill} variant="secondary" className="bg-surface-secondary text-text-primary border-none text-[10px] font-bold">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Placement Leaderboard */}
                        <Card className="bg-surface border-border shadow-md rounded-[1.5rem] overflow-hidden">
                            <CardHeader className="bg-surface-secondary/50 border-b border-border-subtle p-6">
                                <CardTitle className="flex items-center gap-2 text-xl font-black text-text-primary uppercase tracking-tight">
                                    <LuAward className="w-5 h-5 text-purple-600" /> Dept. Leaderboard
                                </CardTitle>
                                <CardDescription className="text-text-secondary">Top performing departments by placement rate.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {[
                                        { name: 'Computer Science', rate: 94, color: 'bg-emerald-500' },
                                        { name: 'Information Tech', rate: 88, color: 'bg-blue-500' },
                                        { name: 'Electronics & Comm', rate: 76, color: 'bg-amber-500' }
                                    ].map((dept, i) => (
                                        <div key={dept.name} className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <div className="text-sm font-black text-text-primary uppercase tracking-tight">
                                                    <span className="text-text-muted mr-2">0{i+1}</span> {dept.name}
                                                </div>
                                                <div className="text-sm font-black text-text-primary">{dept.rate}%</div>
                                            </div>
                                            <div className="h-2 w-full bg-surface-secondary rounded-full overflow-hidden">
                                                <div className={`h-full ${dept.color}`} style={{ width: `${dept.rate}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Recent Placements Table */}
                        <div className="lg:col-span-2">
                            <Card className="bg-surface border-border shadow-md rounded-[1.5rem] h-full flex flex-col overflow-hidden">
                                <CardHeader className="bg-surface-secondary/50 border-b border-border-subtle p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl font-black text-text-primary">Recent Placements</CardTitle>
                                            <CardDescription className="text-text-secondary mt-1">Latest offers accepted by university students.</CardDescription>
                                        </div>
                                        <div className="relative hidden md:block">
                                            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                                            <Input className="pl-9 bg-surface-primary border-border-subtle h-9 w-64" placeholder="Search students..." />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 overflow-auto max-h-[600px] custom-scrollbar flex-1">
                                    {loading ? (
                                        <div className="p-12 text-center text-text-muted flex items-center justify-center gap-2">
                                            <LuLoader className="w-5 h-5 animate-spin" /> Loading placement records...
                                        </div>
                                    ) : (
                                        <div className="table-container min-w-full overflow-x-auto">
                                            <table className="w-full text-sm text-left whitespace-nowrap">
                                                <thead className="bg-surface-secondary/30 text-text-secondary font-bold border-b border-border-subtle sticky top-0 backdrop-blur-md">
                                                    <tr>
                                                        <th className="px-6 py-4">Student Identity</th>
                                                        <th className="px-6 py-4">Company & Target Role</th>
                                                        <th className="px-6 py-4 text-right">Compensation</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border-subtle">
                                                    {records.map(record => (
                                                        <tr key={record.id} className="hover:bg-surface-hover/50 transition-colors group">
                                                            <td className="px-6 py-5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold text-sm">
                                                                        {record.student.name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-text-primary group-hover:text-purple-600 transition-colors">{record.student.name}</div>
                                                                        <div className="text-[10px] text-text-muted font-mono tracking-tighter uppercase mt-0.5">{record.student.enrollmentNo}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <div className="flex flex-col gap-1.5">
                                                                    <Badge variant="outline" className="w-fit bg-purple-500/5 text-purple-600 border-purple-500/20 font-bold px-2 py-0">
                                                                        {record.company.name}
                                                                    </Badge>
                                                                    <div className="text-text-secondary font-medium flex items-center gap-1.5 ml-0.5">
                                                                        <LuTarget className="w-3 h-3 text-text-muted" /> {record.role}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5 text-right">
                                                                <div className="font-black text-emerald-600 text-base">₹{record.ctc} LPA</div>
                                                                <div className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-tight">{format(new Date(record.placedAt), 'MMM dd, yyyy')}</div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {records.length === 0 && (
                                                        <tr>
                                                            <td colSpan={3} className="px-6 py-12 text-center text-text-muted">
                                                                No placements recorded yet.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recruiting Companies */}
                        <div className="lg:col-span-1">
                            <Card className="bg-surface border-border shadow-md rounded-[1.5rem] h-full flex flex-col overflow-hidden">
                                <CardHeader className="bg-surface-secondary/50 border-b border-border-subtle p-6">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-xl font-black text-text-primary">
                                            <LuBuilding2 className="w-5 h-5 text-purple-600" />
                                            Partners ({companies.length})
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsCompanyModalOpen(true)}>
                                            <LuPlus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 overflow-auto max-h-[600px] custom-scrollbar flex-1">
                                    {companies.length === 0 && !loading ? (
                                        <div className="p-12 text-center text-text-muted">No companies registered.</div>
                                    ) : (
                                        <div className="divide-y divide-border-subtle">
                                            {companies.map(company => (
                                                <div key={company.id} className="p-5 hover:bg-surface-hover/50 transition-colors flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-surface-secondary border border-border-subtle flex items-center justify-center group-hover:border-purple-500/30 transition-all">
                                                            <LuGlobe className="w-6 h-6 text-text-muted group-hover:text-purple-600 transition-colors" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-text-primary group-hover:text-purple-600 transition-colors">{company.name}</div>
                                                            <div className="text-xs text-text-secondary mt-1 flex items-center gap-1 font-medium">
                                                                <Badge variant="ghost" className="bg-surface-primary text-[10px] px-1.5 h-4 font-black">
                                                                    {company.type}
                                                                </Badge>
                                                                • Recruiting Partner
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-black text-text-primary">{company._count.placements}</div>
                                                        <div className="text-[10px] uppercase tracking-widest text-text-muted font-black leading-none mt-1">Hires</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>

                {/* Register Company Modal */}
                <Dialog open={isCompanyModalOpen} onOpenChange={setIsCompanyModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">Register Recruiting Company</DialogTitle>
                            <DialogDescription>Add a new company to the university placement portal.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleRegisterCompany} className="space-y-6 pt-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary ml-1">Company Name</label>
                                    <Input
                                        required
                                        placeholder="e.g. Google India"
                                        value={newCompany.name}
                                        onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary ml-1">Type</label>
                                        <select
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={newCompany.type}
                                            onChange={(e) => setNewCompany({ ...newCompany, type: e.target.value })}
                                        >
                                            <option value="IT">IT / Services</option>
                                            <option value="CORE">Core Engineering</option>
                                            <option value="FINANCE">Finance / Banking</option>
                                            <option value="STARTUP">Startup</option>
                                            <option value="MNC">Product MNC</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary ml-1">HR Contact</label>
                                        <Input
                                            placeholder="Contact email"
                                            type="email"
                                            value={newCompany.hrContact}
                                            onChange={(e) => setNewCompany({ ...newCompany, hrContact: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary ml-1">Website URL</label>
                                    <Input
                                        placeholder="https://..."
                                        value={newCompany.website}
                                        onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 hover:bg-purple-700 font-bold">
                                    {isSubmitting ? <LuLoader className="w-4 h-4 animate-spin mr-2" /> : <LuBuilding2 className="w-4 h-4 mr-2" />}
                                    Register Partner
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Log Placement Modal */}
                <Dialog open={isPlacementModalOpen} onOpenChange={setIsPlacementModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-emerald-600">Log Student Placement</DialogTitle>
                            <DialogDescription>Record a successful placement offer for a student.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleLogPlacement} className="space-y-6 pt-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary ml-1">Select Company</label>
                                    <select
                                        required
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={newPlacement.companyId}
                                        onChange={(e) => setNewPlacement({ ...newPlacement, companyId: e.target.value })}
                                    >
                                        <option value="">Choose partner...</option>
                                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary ml-1">Student Enrollment #</label>
                                    <Input
                                        required
                                        placeholder="e.g. EN20250001"
                                        value={newPlacement.studentEnrollmentNo}
                                        onChange={(e) => setNewPlacement({ ...newPlacement, studentEnrollmentNo: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary ml-1">Job Role</label>
                                    <Input
                                        required
                                        placeholder="e.g. Security Specialist"
                                        value={newPlacement.jobRole}
                                        onChange={(e) => setNewPlacement({ ...newPlacement, jobRole: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary ml-1">Package (LPA)</label>
                                        <Input
                                            required
                                            type="number"
                                            step="0.01"
                                            placeholder="e.g. 12.5"
                                            value={newPlacement.package}
                                            onChange={(e) => setNewPlacement({ ...newPlacement, package: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary ml-1">Offer Date</label>
                                        <Input
                                            required
                                            type="date"
                                            value={newPlacement.date}
                                            onChange={(e) => setNewPlacement({ ...newPlacement, date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold">
                                    {isSubmitting ? <LuLoader className="w-4 h-4 animate-spin mr-2" /> : <LuPlus className="w-4 h-4 mr-2" />}
                                    Record Achievement
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Toast toast={toast} onClose={hideToast} />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
