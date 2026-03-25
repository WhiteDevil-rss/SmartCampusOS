'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LuCreditCard, LuWallet, LuCalendarClock, LuDownload, LuCircleCheck, LuClock, LuCircleX, LuInfo, LuArrowRight, LuReceipt, LuExternalLink, LuSearch } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { useToast, Toast } from '@/components/ui/toast-alert';
import { motion, AnimatePresence } from 'framer-motion';

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

    const [searchQuery, setSearchQuery] = useState('');

    const filteredPayments = payments.filter(p => 
        p.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-12 pb-20"
        >
            {/* Overview Stats - Premium 3-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { 
                        label: 'Total Commitment', 
                        value: totalDues, 
                        icon: LuWallet, 
                        color: 'indigo',
                        sub: `${structures.length} semesters active`
                    },
                    { 
                        label: 'Realized Payments', 
                        value: totalPaid, 
                        icon: LuCircleCheck, 
                        color: 'emerald',
                        sub: `${payments.filter(p => p.status === 'COMPLETED').length} confirmed transactions`
                    },
                    { 
                        label: 'Outstanding Balance', 
                        value: balance, 
                        icon: LuInfo, 
                        color: balance > 0 ? 'rose' : 'emerald',
                        action: balance > 0,
                        sub: balance > 0 ? 'Pending verification' : 'Financials cleared'
                    }
                ].map((stat, i) => (
                    <motion.div key={i} variants={itemVariants}>
                        <Card className={cn(
                            "group p-6 glass-card transition-all duration-500 overflow-hidden relative",
                            stat.color === 'indigo' ? "hover:border-indigo-500/30 bg-white/50 dark:bg-white/5" :
                            stat.color === 'emerald' ? "hover:border-emerald-500/30 bg-emerald-500/[0.02] border-emerald-500/10" :
                            "hover:border-rose-500/30 bg-rose-500/[0.02] border-rose-500/10"
                        )}>
                            {/* Decorative background gradient */}
                            <div className={cn(
                                "absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 opacity-20 transition-opacity group-hover:opacity-40",
                                stat.color === 'indigo' ? "bg-indigo-500" : stat.color === 'emerald' ? "bg-emerald-500" : "bg-rose-500"
                            )} />

                            <div className="flex items-start justify-between relative z-10">
                                <div className="space-y-4">
                                    <div className={cn(
                                        "p-2.5 rounded-xl w-fit",
                                        stat.color === 'indigo' ? "bg-indigo-500/10 text-indigo-500" :
                                        stat.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                    )}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                ₹{stat.value.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium mt-1">{stat.sub}</p>
                                    </div>
                                </div>
                                {stat.action && (
                                    <Button 
                                        onClick={handlePayClick} 
                                        className="bg-rose-500 hover:bg-rose-600 text-white font-bold p-2 h-10 w-10 min-w-10 rounded-xl shadow-lg shadow-rose-500/20 group/btn transition-all"
                                    >
                                        <LuArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Financial Ledger (7 Columns) */}
                <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                                <LuReceipt className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Financial Ledger</h3>
                        </div>
                        <div className="relative">
                            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search ledger..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border-none text-xs text-text-primary focus:ring-1 focus:ring-indigo-500/50 w-64 transition-all"
                            />
                        </div>
                    </div>

                    <Card className="glass-card border-slate-200 dark:border-white/5 overflow-hidden bg-white/30 dark:bg-black/20 backdrop-blur-xl">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Date</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Audit ID</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Channel</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Tracking</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount (INR)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode="popLayout">
                                        {filteredPayments.length === 0 ? (
                                            <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                <td colSpan={5} className="p-12 text-center text-slate-400 italic font-medium">
                                                    No audit trails matching your search.
                                                </td>
                                            </motion.tr>
                                        ) : (
                                            filteredPayments.map((payment) => (
                                                <motion.tr 
                                                    key={payment.id} 
                                                    initial={{ opacity: 0 }} 
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="group border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.03] transition-colors"
                                                >
                                                    <td className="p-4 whitespace-nowrap">
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                            {new Date(payment.paymentDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-mono text-indigo-400 group-hover:text-indigo-500 transition-colors">
                                                                #{payment.transactionId?.slice(-8) || 'AUD-N/A'}
                                                            </span>
                                                            {payment.status === 'COMPLETED' && (
                                                                <button onClick={() => handleReceiptClick(payment.id)} className="p-1 rounded-lg bg-indigo-500/10 text-indigo-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-500/20">
                                                                    <LuDownload className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 whitespace-nowrap">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{payment.method}</span>
                                                    </td>
                                                    <td className="p-4 whitespace-nowrap">
                                                        <div className={cn(
                                                            "text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1.5 w-fit border",
                                                            payment.status === 'COMPLETED' ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" :
                                                            payment.status === 'FAILED' ? "bg-rose-500/5 text-rose-500 border-rose-500/20" : 
                                                            "bg-amber-500/5 text-amber-500 border-amber-500/20"
                                                        )}>
                                                            <div className={cn("w-1 h-1 rounded-full", 
                                                                payment.status === 'COMPLETED' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                                                                payment.status === 'FAILED' ? "bg-rose-500" : "bg-amber-500"
                                                            )} />
                                                            {payment.status}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right whitespace-nowrap">
                                                        <span className={cn(
                                                            "text-base font-black tracking-tighter",
                                                            payment.status === 'COMPLETED' ? "text-slate-900 dark:text-white" : "text-slate-400"
                                                        )}>
                                                            ₹{payment.amount.toLocaleString()}
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </motion.div>

                {/* Institutional Holdings (4 Columns) */}
                <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
                    <div className="flex items-center gap-4 px-2">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                            <LuCalendarClock className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Fee Allocation</h3>
                    </div>

                    <div className="space-y-4">
                        {structures.length === 0 ? (
                            <Card className="p-12 border-dashed border-slate-200 dark:border-white/10 bg-transparent flex flex-col items-center justify-center text-center">
                                <LuInfo className="w-10 h-10 text-slate-300 mb-4" />
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-loose">No active allocations<br/>found for student</p>
                            </Card>
                        ) : (
                            structures.map((structure) => (
                                <Card key={structure.id} className="p-6 glass-card border-slate-200 dark:border-white/5 bg-white/40 dark:bg-white/5 hover:border-indigo-400/30 transition-all group overflow-hidden relative">
                                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mb-12 -mr-12" />
                                    
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Semester {structure.semester}</p>
                                            <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{structure.academicYear}</h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Payload</p>
                                            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic">₹{structure.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {Array.isArray(structure.components) && structure.components.map((comp: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center group/item">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 group-hover/item:bg-indigo-400 transition-colors" />
                                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{comp.name}</span>
                                                </div>
                                                <span className="text-xs font-black text-slate-700 dark:text-slate-300">₹{comp.amount?.toLocaleString() || 0}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <Button variant="ghost" className="w-full mt-6 h-10 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 group-hover:text-indigo-400 transition-all flex items-center gap-2">
                                        Allocation Details <LuExternalLink className="w-3 h-3" />
                                    </Button>
                                </Card>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>

            <Toast toast={toast} onClose={hideToast} />
        </motion.div>
    );
}
