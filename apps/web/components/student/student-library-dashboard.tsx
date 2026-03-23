'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LuBookLock, LuBookOpen, LuCalendarMinus, LuClock, LuLibrary, LuInfo, LuCircleCheck } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { useToast, Toast } from '@/components/ui/toast-alert';
import { isPast, formatDistanceToNow, differenceInDays } from 'date-fns';

interface Book {
    title: string;
    author: string;
    isbn: string;
    category: string;
}

interface BookLoan {
    id: string;
    book: Book;
    issuedAt: string;
    dueDate: string;
    returnedAt: string | null;
    fineAmount: number | null;
}

export function StudentLibraryDashboard() {
    const [loans, setLoans] = useState<BookLoan[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                const res = await api.get('/v2/student/assets/library');
                setLoans(res.data.bookLoans || []);
            } catch (error) {
                console.error('Failed to load library:', error);
                showToast('error', 'Failed to load library data');
            } finally {
                setLoading(false);
            }
        };
        fetchLibrary();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-3xl bg-surface" />)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-3xl bg-surface" />)}
                </div>
            </div>
        );
    }

    const activeLoans = loans.filter(l => !l.returnedAt);
    const pastLoans = loans.filter(l => l.returnedAt);
    const totalFines = loans.reduce((sum, l) => sum + (l.fineAmount || 0), 0);

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 glass-card border-border bg-surface/50 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                            <LuBookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Currently Borrowed</p>
                            <p className="text-3xl font-black text-text-primary">{activeLoans.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 glass-card border-border bg-surface/50 hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                            <LuCircleCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Books Returned</p>
                            <p className="text-3xl font-black text-text-primary">{pastLoans.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className={cn("p-6 glass-card transition-all", totalFines > 0 ? "border-rose-500/30 bg-rose-500/5 text-rose-500" : "border-border bg-surface/50")}>
                    <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-2xl", totalFines > 0 ? "bg-rose-500/10" : "bg-surface text-text-muted")}>
                            {totalFines > 0 ? <LuInfo className="w-6 h-6" /> : <LuLibrary className="w-6 h-6" />}
                        </div>
                        <div>
                            <p className={cn("text-[10px] font-black uppercase tracking-widest", totalFines > 0 ? "text-rose-500/70" : "text-text-muted")}>Total Fines</p>
                            <p className="text-3xl font-black text-text-primary">₹{totalFines}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Active Loans */}
            <div className="space-y-6">
                <h3 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-3">
                    <LuBookLock className="text-primary" />
                    Currently Reading
                </h3>
                {activeLoans.length === 0 ? (
                    <Card className="p-10 border-border bg-surface/50 text-center flex flex-col items-center justify-center space-y-3">
                        <LuLibrary className="w-10 h-10 text-text-muted" />
                        <p className="text-sm text-text-muted font-medium">You have no actively borrowed books.</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeLoans.map((loan) => {
                            const isOverdue = isPast(new Date(loan.dueDate));
                            const daysDiff = differenceInDays(new Date(loan.dueDate), new Date());
                            return (
                                <Card key={loan.id} className={cn("p-6 glass-card transition-all relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl", isOverdue ? "border-rose-500/30 hover:shadow-rose-500/10" : "border-border hover:border-primary/30 hover:shadow-primary/10")}>
                                    <div className="space-y-4 relative z-10">
                                        <div>
                                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-surface text-text-muted">{loan.book.category || 'General'}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-text-primary leading-tight mb-1">{loan.book.title}</h4>
                                            <p className="text-xs text-text-secondary">{loan.book.author}</p>
                                        </div>
                                        <div className="pt-4 border-t border-border flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Due Date</span>
                                                <span className="text-sm font-medium text-text-primary">{new Date(loan.dueDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className={cn("px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5", isOverdue ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary")}>
                                                {isOverdue ? <LuInfo className="w-3.5 h-3.5" /> : <LuClock className="w-3.5 h-3.5" />}
                                                {isOverdue ? `Overdue by ${Math.abs(daysDiff)} days` : formatDistanceToNow(new Date(loan.dueDate), { addSuffix: true })}
                                            </div>
                                        </div>
                                    </div>
                                    {isOverdue && <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-rose-500/10 transition-colors" />}
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Past Loans Table */}
            {pastLoans.length > 0 && (
                <div className="space-y-6 pt-10 border-t border-border">
                    <h3 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-3">
                        <LuCalendarMinus className="text-text-muted" />
                        Loan History
                    </h3>
                    <Card className="glass-card border-border overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-surface">
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Book Details</th>
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Borrowed On</th>
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Returned On</th>
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Fine Paid</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pastLoans.map((loan) => (
                                        <tr key={loan.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                                            <td className="p-4">
                                                <p className="text-sm font-bold text-text-primary mb-0.5">{loan.book.title}</p>
                                                <p className="text-xs text-text-secondary">{loan.book.author} • {loan.book.isbn}</p>
                                            </td>
                                            <td className="p-4 text-sm text-text-secondary whitespace-nowrap">{new Date(loan.issuedAt).toLocaleDateString()}</td>
                                            <td className="p-4 text-sm text-emerald-400 font-medium whitespace-nowrap">{new Date(loan.returnedAt!).toLocaleDateString()}</td>
                                            <td className="p-4 text-right whitespace-nowrap">
                                                {loan.fineAmount && loan.fineAmount > 0 ? (
                                                    <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-1 rounded-md text-xs border border-rose-500/20">₹{loan.fineAmount}</span>
                                                ) : (
                                                    <span className="text-text-muted text-xs">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            <Toast toast={toast} onClose={hideToast} />
        </div>
    );
}
