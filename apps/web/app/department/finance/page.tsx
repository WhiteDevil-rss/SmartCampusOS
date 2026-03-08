'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuPlus, LuHistory, LuUsers, LuReceipt, LuSettings2, LuCheck, LuClock, LuInfo, LuBanknote, LuChartBar } from 'react-icons/lu';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Toast, useToast } from '@/components/ui/toast-alert';
import { DEPT_ADMIN_NAV } from '@/lib/constants/nav-config';

interface FeeStructure {
    id: string;
    semester: number;
    academicYear: string;
    totalAmount: number;
    components: any;
    program?: { name: string; shortName?: string; id?: string };
    programId?: string;
}

interface Faculty {
    id: string;
    name: string;
    email: string;
    payrollConfig?: {
        baseSalary: number;
        bankAccount?: string;
    }
}

interface StudentInfo {
    id: string;
    programId: string;
}

export default function FinanceDashboard() {
    const { user } = useAuthStore();
    const [structures, setStructures] = useState<FeeStructure[]>([]);
    const [faculty, setFaculty] = useState<Faculty[]>([]);
    const [students, setStudents] = useState<StudentInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();

    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
    const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

    const [feeForm, setFeeForm] = useState({
        programId: '',
        semester: '1',
        academicYear: '2024-25',
        totalAmount: '',
        components: [
            { name: 'Tuition Fee', amount: 0 },
            { name: 'Library Fee', amount: 0 },
            { name: 'Exam Fee', amount: 0 }
        ]
    });

    const [payrollForm, setPayrollForm] = useState({
        baseSalary: '',
        bankAccount: '',
        ifscCode: '',
        allowances: { HRA: 0, DA: 0 },
        deductions: { PF: 0, Tax: 0 }
    });

    const [programs, setPrograms] = useState<any[]>([]);

    const fetchData = useCallback(async () => {
        if (!user?.entityId) return;
        try {
            const [feeRes, facRes, progRes, studRes] = await Promise.all([
                api.get(`/v2/fees/structures?universityId=${user.universityId}`),
                api.get(`/v2/payroll/configs?universityId=${user.universityId}&departmentId=${user.entityId}`),
                api.get(`/programs`),
                api.get(`/v2/student?departmentId=${user.entityId}`).catch(() => ({ data: [] }))
            ]);
            setStructures(feeRes.data);
            setFaculty(facRes.data);
            setPrograms(progRes.data);
            setStudents(studRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Calculate program-wise fee totals
    const programFeeStats = useMemo(() => {
        const stats: Record<string, { programName: string; shortName: string; studentCount: number; feePerStudent: number; totalApplicable: number }> = {};

        for (const structure of structures) {
            const progId = structure.programId || structure.program?.id || '';
            const progName = structure.program?.name || programs.find((p: any) => p.id === progId)?.name || 'Unknown Program';
            const shortName = structure.program?.shortName || programs.find((p: any) => p.id === progId)?.shortName || 'N/A';
            const studentCount = students.filter(s => s.programId === progId).length;

            if (!stats[progId]) {
                stats[progId] = {
                    programName: progName,
                    shortName,
                    studentCount,
                    feePerStudent: structure.totalAmount,
                    totalApplicable: structure.totalAmount * studentCount
                };
            }
        }

        return stats;
    }, [structures, students, programs]);

    const grandTotal = useMemo(() => {
        return Object.values(programFeeStats).reduce((sum, s) => sum + s.totalApplicable, 0);
    }, [programFeeStats]);

    const handleCreateFeeStructure = async () => {
        try {
            await api.post(`/v2/fees/structures`, {
                ...feeForm,
                universityId: user?.universityId
            });
            setIsFeeModalOpen(false);
            fetchData();
            showToast('success', 'Fee structure defined!');
        } catch (e) {
            showToast('error', 'Failed to create fee structure.');
        }
    };

    const handleUpdatePayroll = async () => {
        if (!selectedFaculty) return;
        try {
            await api.post(`/v2/payroll/configs`, {
                ...payrollForm,
                facultyId: selectedFaculty.id,
                universityId: user?.universityId
            });
            setIsPayrollModalOpen(false);
            fetchData();
            showToast('success', 'Payroll configuration updated!');
        } catch (e) {
            showToast('error', 'Failed to update payroll.');
        }
    };

    const handleGenerateMonthlyPayroll = async () => {
        const eligibleFaculty = faculty.filter(f => !!f.payrollConfig).map(f => f.id);
        if (eligibleFaculty.length === 0) {
            showToast('error', 'No faculty members have payroll configured.');
            return;
        }

        try {
            await api.post(`/v2/payroll/generate`, {
                facultyIds: eligibleFaculty,
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear()
            });
            showToast('success', `Salary slips generated for ${eligibleFaculty.length} faculty members.`);
        } catch (e) {
            showToast('error', 'Batch payroll generation failed.');
        }
    };

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN']}>
            <DashboardLayout navItems={DEPT_ADMIN_NAV} title="Financial Management">
                <Toast toast={toast} onClose={hideToast} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-text-primary">Finance Terminal</h2>
                        <p className="text-text-secondary dark:text-text-muted">Oversee student collections, program fee structures, and faculty payroll processing.</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="glass-card bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-text-secondary">Total Fee Applicable</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">₹ {grandTotal.toLocaleString('en-IN')}</div>
                            <p className="text-xs text-text-secondary mt-1 flex items-center gap-1"><LuCheck className="text-emerald-500" /> Across {Object.keys(programFeeStats).length} programs</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-card bg-purple-500/5 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-text-secondary">Monthly Payroll</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹ {faculty.filter(f => f.payrollConfig).reduce((sum, f) => sum + (f.payrollConfig?.baseSalary || 0), 0).toLocaleString('en-IN')}</div>
                            <p className="text-xs text-text-secondary mt-1 flex items-center gap-1"><LuClock className="text-amber-500" /> {faculty.filter(f => f.payrollConfig).length} configured faculty</p>
                        </CardContent>
                    </Card>
                    <Card className="glass-card bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-text-secondary">Active Fee Structures</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{structures.length}</div>
                            <p className="text-xs text-text-secondary mt-1 flex items-center gap-1"><LuInfo className="text-emerald-500" /> {students.length} total students enrolled</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="fees" className="space-y-6">
                    <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <TabsTrigger value="fees" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">Student Fees</TabsTrigger>
                        <TabsTrigger value="payroll" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">Faculty Payroll</TabsTrigger>
                    </TabsList>

                    <TabsContent value="fees" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-text-primary">Program Fee Structures</h3>
                            <Button onClick={() => setIsFeeModalOpen(true)} className="bg-primary hover:bg-primary/90">
                                <LuPlus className="mr-2 h-4 w-4" /> Define Structure
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {structures.map(s => {
                                const progId = s.programId || s.program?.id || '';
                                const stat = programFeeStats[progId];
                                return (
                                    <Card key={s.id} className="glass-card border-slate-200 dark:border-border-hover group hover:shadow-lg transition-all">
                                        <div className="p-1 bg-indigo-500/10 rounded-t-xl group-hover:bg-indigo-500/20 transition-colors" />
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg">{s.program?.name || programs.find((p: any) => p.id === progId)?.name || 'Academic Course'}</CardTitle>
                                            <CardDescription>Sem {s.semester} | {s.academicYear}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="text-2xl font-black text-slate-800 dark:text-text-primary">₹ {s.totalAmount.toLocaleString('en-IN')}</div>
                                            <div className="pt-3 border-t dark:border-border space-y-2">
                                                {(Array.isArray(s.components) ? s.components : Object.entries(s.components as any).map(([k, v]: any) => ({ name: k, amount: v }))).slice(0, 4).map((comp: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between text-xs text-text-secondary italic">
                                                        <span>{comp.name || 'Component'}</span>
                                                        <span>₹ {Number(comp.amount).toLocaleString('en-IN')}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {stat && (
                                                <div className="pt-3 border-t dark:border-border">
                                                    <div className="flex justify-between text-xs font-semibold">
                                                        <span className="text-text-secondary">Students Enrolled</span>
                                                        <span className="text-indigo-600 dark:text-indigo-400">{stat.studentCount}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs font-bold mt-1">
                                                        <span className="text-text-secondary">Total Applicable</span>
                                                        <span className="text-emerald-600 dark:text-emerald-400">₹ {stat.totalApplicable.toLocaleString('en-IN')}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Program Fee Summary / Comparison */}
                        {Object.keys(programFeeStats).length > 0 && (
                            <Card className="glass-card border-slate-200 dark:border-border-hover mt-8">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <LuChartBar className="h-5 w-5 text-primary" />
                                        Program Fee Comparison
                                    </CardTitle>
                                    <CardDescription>Summary of total fees applicable per program</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {Object.entries(programFeeStats).map(([progId, stat]) => {
                                            const pct = grandTotal > 0 ? (stat.totalApplicable / grandTotal * 100) : 0;
                                            return (
                                                <div key={progId} className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider rounded-lg border border-primary/20">{stat.shortName}</span>
                                                            <div>
                                                                <div className="font-bold text-sm text-slate-800 dark:text-text-primary">{stat.programName}</div>
                                                                <div className="text-[10px] text-text-secondary">{stat.studentCount} students × ₹{stat.feePerStudent.toLocaleString('en-IN')}/student</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹ {stat.totalApplicable.toLocaleString('en-IN')}</div>
                                                            <div className="text-[10px] text-text-secondary font-bold">{pct.toFixed(1)}% of total</div>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                                                        <div className="bg-gradient-to-r from-primary to-indigo-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div className="pt-4 border-t dark:border-border flex items-center justify-between">
                                            <span className="text-sm font-black text-slate-800 dark:text-text-primary uppercase tracking-wide">Grand Total</span>
                                            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">₹ {grandTotal.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="payroll" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-text-primary">Payroll Configurations</h3>
                            <Button onClick={handleGenerateMonthlyPayroll} variant="outline" className="border-primary text-primary hover:bg-primary/5">
                                <LuReceipt className="mr-2 h-4 w-4" /> Run Monthly Payroll
                            </Button>
                        </div>

                        <div className="table-container">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-text-secondary font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Faculty Member</th>
                                        <th className="px-6 py-4">Base Salary</th>
                                        <th className="px-6 py-4">Bank Details</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {faculty.map(f => (
                                        <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold">
                                                        {f.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-800 dark:text-text-primary">{f.name}</div>
                                                        <div className="text-xs text-text-secondary">{f.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-indigo-600 dark:text-indigo-400">
                                                {f.payrollConfig ? `₹ ${f.payrollConfig.baseSalary.toLocaleString()}` : '---'}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-text-secondary">
                                                {f.payrollConfig?.bankAccount || 'Not Set'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {f.payrollConfig ? (
                                                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] uppercase font-bold tracking-wider border border-emerald-500/20">Configured</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-rose-500/10 text-rose-600 rounded-full text-[10px] uppercase font-bold tracking-wider border border-rose-500/20">Incomplete</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button size="icon" variant="ghost" onClick={() => {
                                                    setSelectedFaculty(f);
                                                    setPayrollForm({
                                                        baseSalary: f.payrollConfig?.baseSalary.toString() || '',
                                                        bankAccount: f.payrollConfig?.bankAccount || '',
                                                        ifscCode: '',
                                                        allowances: { HRA: 0, DA: 0 },
                                                        deductions: { PF: 0, Tax: 0 }
                                                    });
                                                    setIsPayrollModalOpen(true);
                                                }}>
                                                    <LuSettings2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* --- MODALS --- */}

                {/* Fee Structure Modal */}
                <Dialog open={isFeeModalOpen} onOpenChange={setIsFeeModalOpen}>
                    <DialogContent className="sm:max-w-lg glass-card">
                        <DialogHeader>
                            <DialogTitle>Define Fee Structure</DialogTitle>
                            <DialogDescription>Set up semester-wise fees for academic programs.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Program</label>
                                    <select className="w-full h-10 rounded-md border dark:border-border-hover bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                                        value={feeForm.programId} onChange={e => setFeeForm({ ...feeForm, programId: e.target.value })}>
                                        <option value="">Select Program</option>
                                        {programs.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Semester</label>
                                    <Input value={feeForm.semester} onChange={e => setFeeForm({ ...feeForm, semester: e.target.value })} type="number" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Academic Year</label>
                                    <Input value={feeForm.academicYear} onChange={e => setFeeForm({ ...feeForm, academicYear: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Total Amount</label>
                                    <Input value={feeForm.totalAmount} onChange={e => setFeeForm({ ...feeForm, totalAmount: e.target.value })} type="number" />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsFeeModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateFeeStructure} disabled={!feeForm.programId || !feeForm.totalAmount}>Save Structure</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Payroll Modal */}
                <Dialog open={isPayrollModalOpen} onOpenChange={setIsPayrollModalOpen}>
                    <DialogContent className="sm:max-w-lg glass-card">
                        <DialogHeader>
                            <DialogTitle>Configure Payroll: {selectedFaculty?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Base Salary (Monthly)</label>
                                <Input value={payrollForm.baseSalary} onChange={e => setPayrollForm({ ...payrollForm, baseSalary: e.target.value })} type="number" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Bank Account No</label>
                                    <Input value={payrollForm.bankAccount} onChange={e => setPayrollForm({ ...payrollForm, bankAccount: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">IFSC Code</label>
                                    <Input value={payrollForm.ifscCode} onChange={e => setPayrollForm({ ...payrollForm, ifscCode: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPayrollModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdatePayroll}>Save Configuration</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </DashboardLayout>
        </ProtectedRoute>
    );
}
