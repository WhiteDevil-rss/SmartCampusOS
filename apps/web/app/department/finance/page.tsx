'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { V2DashboardLayout } from '@/components/v2/layout/dashboard-layout';
import { 
    LuPlus, 
    LuHistory, 
    LuUsers, 
    LuReceipt, 
    LuSettings2, 
    LuCheck, 
    LuClock, 
    LuInfo, 
    LuBanknote, 
    LuChartBar,
    LuTrendingUp,
    LuWallet
} from 'react-icons/lu';
import { motion } from 'framer-motion';
import { 
    Banknote, 
    Receipt, 
    TrendingUp, 
    Wallet 
} from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
    GlassCard, 
    GlassCardContent, 
    GlassCardHeader, 
    GlassCardTitle,
    StatCard 
} from '@/components/v2/shared/cards';
import { IndustrialButton } from '@/components/v2/shared/inputs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Toast, useToast } from '@/components/ui/toast-alert';
import { GreetingCard } from '@/components/v2/shared/greeting-card';

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

export default function InstitutionalResourcesDashboard() {
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
            <V2DashboardLayout title="Institutional Resource Management">
                <Toast toast={toast} onClose={hideToast} />

                <div className="space-y-10 pb-24">
                    
                    {/* Institutional Greeting */}
                    <GreetingCard 
                        name={user?.username || 'Administrator'}
                        role="Financial Registrar"
                        stats={[
                            { label: "Total Endowment", value: `₹${(grandTotal/1000000).toFixed(1)}M`, icon: LuWallet },
                            { label: "Payroll Status", value: "Verified", icon: LuCheck }
                        ]}
                        quickAction={{
                            label: "Run Batch Payroll",
                            onClick: handleGenerateMonthlyPayroll
                        }}
                    />

                    {/* Financial Summary Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard 
                            title="Total Fee Endowment" 
                            value={grandTotal} 
                            change={12.5} 
                            icon={Banknote} 
                            prefix="₹"
                            changeDescription="vs previous cycle"
                        />
                        <StatCard 
                            title="Monthly Compensation" 
                            value={faculty.filter(f => f.payrollConfig).reduce((sum, f) => sum + (f.payrollConfig?.baseSalary || 0), 0)} 
                            change={2.1} 
                            icon={Receipt} 
                            prefix="₹"
                            changeDescription="staff payroll"
                        />
                        <StatCard 
                            title="Active Endowments" 
                            value={structures.length} 
                            change={0} 
                            icon={TrendingUp} 
                            changeDescription="program structures"
                        />
                    </div>

                    <GlassCard className="rounded-[3rem] border-white/5 overflow-hidden">
                        <Tabs defaultValue="fees" className="w-full">
                            <div className="px-8 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10">
                                    <TabsTrigger value="fees" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-all">
                                        Academic Endowments
                                    </TabsTrigger>
                                    <TabsTrigger value="payroll" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-all">
                                        Staff Compensation
                                    </TabsTrigger>
                                </TabsList>
                                
                                <IndustrialButton 
                                    variant="primary" 
                                    size="sm" 
                                    className="h-12 px-6 text-[10px] uppercase font-black tracking-widest"
                                    onClick={() => setIsFeeModalOpen(true)}
                                >
                                    <LuPlus className="mr-2 w-4 h-4" /> Define Structure
                                </IndustrialButton>
                            </div>

                            <TabsContent value="fees" className="p-8 space-y-10 focus-visible:ring-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {structures.map(s => {
                                        const progId = s.programId || s.program?.id || '';
                                        const stat = programFeeStats[progId];
                                        return (
                                            <GlassCard key={s.id} className="border-white/5 hover:border-primary/40 transition-all duration-300 group cursor-pointer bg-white/[0.02]">
                                                <div className="p-1.5 bg-primary/20 rounded-t-xl group-hover:bg-primary/40 transition-colors" />
                                                <GlassCardContent className="p-6 space-y-6">
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-100 font-space-grotesk leading-tight uppercase tracking-tight">
                                                            {s.program?.name || programs.find((p: any) => p.id === progId)?.name || 'Academic Course'}
                                                        </h4>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                                            Semester {s.semester} • {s.academicYear}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="text-3xl font-black text-primary font-space-grotesk tracking-tighter">
                                                        ₹ {s.totalAmount.toLocaleString('en-IN')}
                                                    </div>

                                                    <div className="space-y-2 pt-4 border-t border-white/5">
                                                        {(Array.isArray(s.components) ? s.components : Object.entries(s.components as any).map(([k, v]: any) => ({ name: k, amount: v }))).slice(0, 3).map((comp: any, idx: number) => (
                                                            <div key={idx} className="flex justify-between text-[11px] font-bold text-slate-400 italic">
                                                                <span className="uppercase tracking-tighter">{comp.name || 'Component'}</span>
                                                                <span className="text-white/80">₹ {Number(comp.amount).toLocaleString('en-IN')}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {stat && (
                                                        <div className="pt-4 border-t border-white/5 bg-primary/5 -mx-6 -mb-6 p-6">
                                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                                                                <span>Enrolled Count</span>
                                                                <span className="text-primary">{stat.studentCount}</span>
                                                            </div>
                                                            <div className="flex justify-between text-xs font-black uppercase tracking-tight text-slate-100">
                                                                <span>Gross Yield</span>
                                                                <span className="text-emerald-500">₹ {stat.totalApplicable.toLocaleString('en-IN')}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </GlassCardContent>
                                            </GlassCard>
                                        );
                                    })}
                                </div>

                                {/* Resource Allocation Chart */}
                                {Object.keys(programFeeStats).length > 0 && (
                                    <GlassCard className="border-white/5 bg-white/[0.01] mt-8">
                                        <GlassCardHeader className="p-8 border-b border-white/5">
                                            <GlassCardTitle className="text-xl font-black text-slate-100 flex items-center gap-3">
                                                <LuChartBar className="w-5 h-5 text-primary" />
                                                Resource Allocation Matrix
                                            </GlassCardTitle>
                                        </GlassCardHeader>
                                        <GlassCardContent className="p-8">
                                            <div className="space-y-8">
                                                {Object.entries(programFeeStats).map(([progId, stat]) => {
                                                    const pct = grandTotal > 0 ? (stat.totalApplicable / grandTotal * 100) : 0;
                                                    return (
                                                        <div key={progId} className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-primary/20">{stat.shortName}</span>
                                                                    <div>
                                                                        <div className="font-black text-sm text-slate-100 uppercase tracking-tight font-space-grotesk">{stat.programName}</div>
                                                                        <div className="text-[10px] font-bold text-slate-500 uppercase">{stat.studentCount} students Verified</div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-lg font-black text-emerald-500 font-space-grotesk tracking-tighter italic">₹ {stat.totalApplicable.toLocaleString('en-IN')}</div>
                                                                    <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{pct.toFixed(1)}% Yield</div>
                                                                </div>
                                                            </div>
                                                            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                                                                <motion.div 
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${pct}%` }}
                                                                    className="bg-gradient-to-r from-primary to-indigo-500 h-full rounded-full"
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                                    <span className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Institutional Aggregate</span>
                                                    <span className="text-2xl font-black text-primary font-space-grotesk tracking-tighter">₹ {grandTotal.toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                        </GlassCardContent>
                                    </GlassCard>
                                )}
                            </TabsContent>

                            <TabsContent value="payroll" className="p-0 focus-visible:ring-0">
                                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                    <h3 className="text-lg font-black text-slate-100 uppercase tracking-tight flex items-center gap-3 font-space-grotesk">
                                        <LuUsers className="w-5 h-5 text-primary" />
                                        Staff Compensation Registry
                                    </h3>
                                    <IndustrialButton variant="secondary" size="sm" onClick={handleGenerateMonthlyPayroll} className="h-10 text-[9px] uppercase font-black tracking-widest">
                                        <LuHistory className="mr-2 w-3 h-3" /> Execute Monthly Cycle
                                    </IndustrialButton>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead className="bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                            <tr>
                                                <th className="px-8 py-5">Staff Identity</th>
                                                <th className="px-8 py-5">Endowment Base</th>
                                                <th className="px-8 py-5">Resource Vector</th>
                                                <th className="px-8 py-5">Integrity Status</th>
                                                <th className="px-8 py-5 text-right">Settings</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {faculty.map(f => (
                                                <tr key={f.id} className="hover:bg-primary/[0.03] transition-all duration-300 group cursor-pointer">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg font-black text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                                                                {f.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-slate-100 uppercase tracking-tight font-space-grotesk group-hover:text-primary transition-colors duration-300">{f.name}</div>
                                                                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{f.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 font-mono text-primary font-black text-xs">
                                                        {f.payrollConfig ? `₹ ${f.payrollConfig.baseSalary.toLocaleString()}` : '───'}
                                                    </td>
                                                    <td className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
                                                        {f.payrollConfig?.bankAccount || 'Vector Not Set'}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        {f.payrollConfig ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Incomplete</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <Button size="icon" variant="ghost" className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300" onClick={() => {
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
                    </GlassCard>
                </div>

                {/* --- MODALS --- */}
                {/* Fee Structure Modal */}
                <Dialog open={isFeeModalOpen} onOpenChange={setIsFeeModalOpen}>
                    <DialogContent className="sm:max-w-lg glass-card border-white/10 bg-slate-900 shadow-2xl rounded-[2.5rem]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-slate-100 font-space-grotesk">
                                Define Endowment Structure
                            </DialogTitle>
                            <DialogDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Configure cycle-wise collections for academic programs.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Program Vector</label>
                                    <select className="w-full h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-slate-100 focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={feeForm.programId} onChange={e => setFeeForm({ ...feeForm, programId: e.target.value })}>
                                        <option value="" className="bg-slate-900 border-none">Select Program</option>
                                        {programs.map((p: any) => <option key={p.id} value={p.id} className="bg-slate-900 border-none">{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Semester Cycle</label>
                                    <Input className="h-12 rounded-2xl bg-white/5 border-white/10 font-black text-slate-100" value={feeForm.semester} onChange={e => setFeeForm({ ...feeForm, semester: e.target.value })} type="number" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Academic Horizon</label>
                                    <Input className="h-12 rounded-2xl bg-white/5 border-white/10 font-black text-slate-100" value={feeForm.academicYear} onChange={e => setFeeForm({ ...feeForm, academicYear: e.target.value })} placeholder="e.g. 2024-25" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Aggregate Amount</label>
                                    <Input className="h-12 rounded-2xl bg-white/5 border-white/10 font-black text-primary" value={feeForm.totalAmount} onChange={e => setFeeForm({ ...feeForm, totalAmount: e.target.value })} type="number" />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="gap-3">
                            <IndustrialButton variant="outline" onClick={() => setIsFeeModalOpen(false)} className="h-12 px-6 text-[10px] uppercase font-black tracking-widest">Cancel</IndustrialButton>
                            <IndustrialButton variant="primary" onClick={handleCreateFeeStructure} disabled={!feeForm.programId || !feeForm.totalAmount} className="h-12 px-6 text-[10px] uppercase font-black tracking-widest">Commit Structure</IndustrialButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Payroll Modal */}
                <Dialog open={isPayrollModalOpen} onOpenChange={setIsPayrollModalOpen}>
                    <DialogContent className="sm:max-w-lg glass-card border-white/10 bg-slate-900 shadow-2xl rounded-[2.5rem]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-slate-100 font-space-grotesk">
                                Staff Endowment: {selectedFaculty?.name}
                            </DialogTitle>
                            <DialogDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Configure recurring compensation vector for this identity.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Base Monthly Allotment</label>
                                <Input className="h-12 rounded-2xl bg-white/5 border-white/10 font-black text-primary" value={payrollForm.baseSalary} onChange={e => setPayrollForm({ ...payrollForm, baseSalary: e.target.value })} type="number" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Primary Resource Account</label>
                                    <Input className="h-12 rounded-2xl bg-white/5 border-white/10 font-black text-slate-100" value={payrollForm.bankAccount} onChange={e => setPayrollForm({ ...payrollForm, bankAccount: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Verification Code (IFSC)</label>
                                    <Input className="h-12 rounded-2xl bg-white/5 border-white/10 font-black text-slate-100" value={payrollForm.ifscCode} onChange={e => setPayrollForm({ ...payrollForm, ifscCode: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="gap-3">
                            <IndustrialButton variant="outline" onClick={() => setIsPayrollModalOpen(false)} className="h-12 px-6 text-[10px] uppercase font-black tracking-widest">Cancel</IndustrialButton>
                            <IndustrialButton variant="primary" onClick={handleUpdatePayroll} className="h-12 px-6 text-[10px] uppercase font-black tracking-widest">Save Configuration</IndustrialButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </V2DashboardLayout>
        </ProtectedRoute>
    );
}
