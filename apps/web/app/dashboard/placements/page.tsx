'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { UNI_ADMIN_NAV } from '@/lib/constants/nav-config';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LuBriefcase, LuBuilding2, LuTrendingUp, LuPlus, LuAward, LuUsers } from 'react-icons/lu';
import { format } from 'date-fns';

export default function PlacementsDashboard() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Derived Metrics
    const topCtc = records.length > 0 ? Math.max(...records.map(r => r.ctc)) : 0;
    const avgCtc = records.length > 0 ? (records.reduce((acc, r) => acc + r.ctc, 0) / records.length).toFixed(1) : 0;

    return (
        <ProtectedRoute allowedRoles={['UNI_ADMIN', 'SUPERADMIN']}>
            <DashboardLayout navItems={UNI_ADMIN_NAV} title="Placements Cell">
                <div className="max-w-7xl mx-auto space-y-8">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <div className="p-2.5 bg-purple-100 rounded-xl text-purple-600">
                                    <LuBriefcase className="w-6 h-6" />
                                </div>
                                Placement Cell
                            </h1>
                            <p className="text-text-secondary mt-2 font-medium">
                                Manage university recruiters, monitor student placement drives, and track CTC metrics.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="gap-2">
                                <LuBuilding2 className="w-4 h-4" /> Register Company
                            </Button>
                            <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                                <LuPlus className="w-4 h-4" /> Log Placement
                            </Button>
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg border-none">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-white/80 font-medium text-sm">Total Placed Students</p>
                                        <h3 className="text-4xl font-black mt-2">{records.length}</h3>
                                    </div>
                                    <div className="p-3 bg-surface-hover rounded-xl backdrop-blur-sm">
                                        <LuUsers className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-text-secondary font-medium text-sm">Highest Package (CTC)</p>
                                        <h3 className="text-3xl font-black mt-2 text-slate-800">₹{topCtc}L</h3>
                                    </div>
                                    <div className="p-3 bg-emerald-100 rounded-xl">
                                        <LuAward className="w-6 h-6 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-text-secondary font-medium text-sm">Average Package (CTC)</p>
                                        <h3 className="text-3xl font-black mt-2 text-slate-800">₹{avgCtc}L</h3>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-xl">
                                        <LuTrendingUp className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Recent Placements Table */}
                        <div className="lg:col-span-2">
                            <Card className="shadow-md border-slate-200">
                                <CardHeader className="bg-slate-50 border-b border-slate-200 pb-4">
                                    <CardTitle className="text-slate-800">Recent Placements</CardTitle>
                                    <CardDescription>Latest offers accepted by students across all departments.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="table-container">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-text-secondary font-medium border-b border-slate-200">
                                                <tr>
                                                    <th className="px-6 py-4 rounded-tl-lg">Student</th>
                                                    <th className="px-6 py-4">Company</th>
                                                    <th className="px-6 py-4">Role</th>
                                                    <th className="px-6 py-4 text-right">Package</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {records.map(record => (
                                                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-800">{record.student.name}</div>
                                                            <div className="text-xs text-text-secondary font-mono mt-0.5">{record.student.enrollmentNo}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                                                {record.company.name}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]">{record.role}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="font-bold text-emerald-600">₹{record.ctc} LPA</div>
                                                            <div className="text-[10px] text-text-muted mt-0.5">{format(new Date(record.placedAt), 'MMM dd, yyyy')}</div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {records.length === 0 && !loading && (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-12 text-center text-text-muted">
                                                            No placements recorded yet.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recruiting Companies */}
                        <div className="lg:col-span-1">
                            <Card className="shadow-md border-slate-200 h-full">
                                <CardHeader className="bg-slate-50 border-b border-slate-200 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-slate-800">
                                        <LuBuilding2 className="w-5 h-5 text-text-secondary" />
                                        Recruiting Partners ({companies.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 overflow-auto max-h-[500px]">
                                    {companies.length === 0 && !loading ? (
                                        <div className="p-8 text-center text-text-muted">No companies registered.</div>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {companies.map(company => (
                                                <div key={company.id} className="p-5 hover:bg-slate-50 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-bold text-slate-800">{company.name}</div>
                                                            <div className="text-xs text-text-secondary mt-1">{company.type} Sector</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-xl font-black text-slate-800">{company._count.placements}</div>
                                                            <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold">Hires</div>
                                                        </div>
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
            </DashboardLayout>
        </ProtectedRoute>
    );
}
