'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LuCreditCard, LuWallet, LuCalendarClock, LuDownload, LuCircleCheck, LuClock, LuCircleX, LuInfo } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { useToast, Toast } from '@/components/ui/toast-alert';

interface FeeStructure {
    id: string;
    semester: number;
    academicYear: string;
    totalAmount: number;
    components: any;
}

interface FeePayment {
    id: string;
    amount: number;
    paymentDate: string;
    method: string;
    status: string;
    transactionId: string;
    feeStructure: FeeStructure;
}

export function StudentFeesDashboard() {
    const [structures, setStructures] = useState<FeeStructure[]>([]);
    const [payments, setPayments] = useState<FeePayment[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        const fetchFees = async () => {
            try {
                const res = await api.get('/v2/student/fees');
                setStructures(res.data.feeStructures || []);
                setPayments(res.data.feePayments || []);
            } catch (error) {
                console.error('Failed to load fees:', error);
                showToast('error', 'Failed to load fee details');
            } finally {
                setLoading(false);
            }
        };
        fetchFees();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-3xl bg-surface" />
                    ))}
                </div>
                <Skeleton className="h-[400px] rounded-3xl bg-surface" />
            </div>
        );
    }

    const totalDues = structures.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalPaid = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);
    const balance = Math.max(0, totalDues - totalPaid);

    const handlePayClick = async () => {
        if (balance <= 0 || structures.length === 0) return;

        setLoading(true);
        try {
            // Pick the first structure for simulation if multiple exist
            const structure = structures[0];
            await api.post('/v2/student/fees/pay', {
                feeStructureId: structure.id,
                amount: balance,
                method: 'DEBIT_CARD'
            });

            showToast('success', 'Payment successful! Your balance has been updated.');
            // Refresh counts
            const res = await api.get('/v2/student/fees');
            setStructures(res.data.feeStructures || []);
            setPayments(res.data.feePayments || []);
        } catch (error) {
            console.error('Payment failed:', error);
            showToast('error', 'Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReceiptClick = async (paymentId: string) => {
        try {
            const res = await api.get(`/v2/student/fees/receipt/${paymentId}`);
            // In a real app, generate a PDF. Here we just show a success toast with data summary
            showToast('success', `Receipt generated for ₹${res.data.amount.toLocaleString()}. Transaction: ${res.data.transactionId}`);
            // Optional: window.open receipt URL
        } catch (e) {
            showToast('error', 'Failed to generate receipt');
        }
    };

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 glass-card border-border bg-surface/50 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-surface text-text-muted">
                            <LuWallet className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total Dues</p>
                            <p className="text-3xl font-black text-text-primary">₹{totalDues.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 glass-card border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                            <LuCircleCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total Paid</p>
                            <p className="text-3xl font-black text-emerald-500">₹{totalPaid.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>

                <Card className={cn(
                    "p-6 glass-card transition-all relative overflow-hidden",
                    balance > 0 ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50" : "border-emerald-500/20 bg-emerald-500/5"
                )}>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={cn(
                            "p-3 rounded-2xl",
                            balance > 0 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                        )}>
                            {balance > 0 ? <LuInfo className="w-6 h-6" /> : <LuCircleCheck className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Outstanding Balance</p>
                            <p className={cn(
                                "text-3xl font-black",
                                balance > 0 ? "text-rose-500" : "text-emerald-500"
                            )}>₹{balance.toLocaleString()}</p>
                        </div>
                        {balance > 0 && (
                            <Button onClick={handlePayClick} className="bg-rose-500 hover:bg-rose-600 text-text-primary font-bold px-6 shrink-0 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                                Pay Now
                            </Button>
                        )}
                    </div>
                    {balance > 0 && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    )}
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Payment History */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-3">
                        <LuCreditCard className="text-primary" />
                        Payment History
                    </h3>

                    <Card className="glass-card border-border overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-surface">
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest whitespace-nowrap">Date</th>
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest whitespace-nowrap">Transaction ID</th>
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest whitespace-nowrap">Method</th>
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest whitespace-nowrap">Status</th>
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right whitespace-nowrap">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-text-muted italic">No payment history found.</td>
                                        </tr>
                                    ) : (
                                        payments.map((payment) => (
                                            <tr key={payment.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                                                <td className="p-4 text-sm text-text-primary whitespace-nowrap">
                                                    {new Date(payment.paymentDate).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-xs font-mono text-text-muted whitespace-nowrap">
                                                    {payment.transactionId || 'N/A'}
                                                </td>
                                                <td className="p-4 text-xs font-bold text-text-primary whitespace-nowrap">
                                                    {payment.method}
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    <span className={cn(
                                                        "text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest flex items-center gap-1 w-fit",
                                                        payment.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500" :
                                                            payment.status === 'FAILED' ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
                                                    )}>
                                                        {payment.status === 'COMPLETED' ? <LuCircleCheck className="w-3 h-3" /> :
                                                            payment.status === 'FAILED' ? <LuCircleX className="w-3 h-3" /> : <LuClock className="w-3 h-3" />}
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-bold text-text-primary whitespace-nowrap">
                                                    ₹{payment.amount.toLocaleString()}
                                                    <div className="flex justify-end mt-1">
                                                        {payment.status === 'COMPLETED' && (
                                                            <button
                                                                onClick={() => handleReceiptClick(payment.id)}
                                                                className="text-primary hover:text-text-primary transition-colors flex items-center gap-1"
                                                            >
                                                                <LuDownload className="w-3 h-3" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest">Receipt</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Fee Breakdown */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-3">
                        <LuCalendarClock className="text-indigo-400" />
                        Fee Structure
                    </h3>
                    <div className="space-y-4">
                        {structures.length === 0 ? (
                            <Card className="p-6 border-border bg-surface/50 text-center">
                                <p className="text-sm text-text-muted">No fee structures assigned yet.</p>
                            </Card>
                        ) : (
                            structures.map((structure) => (
                                <Card key={structure.id} className="p-6 glass-card border-border hover:border-indigo-400/30 transition-all">
                                    <div className="mb-4 pb-4 border-b border-border">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Semester {structure.semester}</p>
                                        <div className="flex justify-between items-end">
                                            <h4 className="text-lg font-bold text-text-primary">Total Fee</h4>
                                            <span className="text-xl font-black text-text-primary">₹{structure.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {Array.isArray(structure.components) && structure.components.map((comp: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <span className="text-text-secondary">{comp.name}</span>
                                                <span className="font-medium text-text-primary">₹{comp.amount?.toLocaleString() || 0}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <Toast toast={toast} onClose={hideToast} />
        </div>
    );
}
