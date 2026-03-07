'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { UNI_ADMIN_NAV } from '@/lib/constants/nav-config';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LuLibrary, LuBook, LuBookCopy, LuPlus, LuCornerDownLeft, LuSearch, LuCalendarDays } from 'react-icons/lu';
import { format } from 'date-fns';

export default function LibraryDashboard() {
    const [books, setBooks] = useState<any[]>([]);
    const [loans, setLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [booksRes, loansRes] = await Promise.all([
                api.get('/v2/library/books'),
                api.get('/v2/library/loans/active')
            ]);
            setBooks(booksRes.data);
            setLoans(loansRes.data);
        } catch (error) {
            console.error('Failed to fetch library data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleReturn = async (loanId: string) => {
        try {
            const res = await api.post(`/v2/library/loans/${loanId}/return`);
            fetchData();
        } catch (error) {
            console.error('Failed to return book', error);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['UNI_ADMIN', 'SUPERADMIN']}>
            <DashboardLayout navItems={UNI_ADMIN_NAV} title="Library Management">
                <div className="max-w-6xl mx-auto space-y-8">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600">
                                    <LuLibrary className="w-6 h-6" />
                                </div>
                                Central Library
                            </h1>
                            <p className="text-text-secondary mt-2 font-medium">
                                Manage book inventory, track active student loans, and process returns.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                                <LuPlus className="w-4 h-4" /> Add New Book
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Active Loans Panel */}
                        <Card className="shadow-md border-indigo-100 h-full flex flex-col">
                            <CardHeader className="bg-indigo-50/50 pb-4 border-b border-indigo-100">
                                <CardTitle className="text-indigo-900 flex items-center gap-2">
                                    <LuBookCopy className="w-5 h-5 text-indigo-500" />
                                    Active Loans ({loans.length})
                                </CardTitle>
                                <CardDescription>Books currently checked out by students.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-auto max-h-[600px]">
                                {loading ? (
                                    <div className="p-8 text-center text-text-muted">Loading loans...</div>
                                ) : loans.length === 0 ? (
                                    <div className="p-12 text-center text-text-muted">
                                        <LuLibrary className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No active loans.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {loans.map(loan => {
                                            const isOverdue = new Date(loan.dueDate) < new Date();
                                            return (
                                                <div key={loan.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                                    <div>
                                                        <div className="font-bold text-slate-800 line-clamp-1">{loan.book.title}</div>
                                                        <div className="text-xs text-text-secondary mt-1 flex items-center gap-2">
                                                            <span className="font-medium text-indigo-600">{loan.student.enrollmentNo}</span>
                                                            &bull;
                                                            <span>{loan.student.name}</span>
                                                        </div>
                                                        <div className={`text-xs mt-2 font-medium flex items-center gap-1.5 ${isOverdue ? 'text-red-600' : 'text-text-secondary'}`}>
                                                            <LuCalendarDays className="w-3.5 h-3.5" />
                                                            Due: {format(new Date(loan.dueDate), 'MMM dd, yyyy')}
                                                            {isOverdue && <Badge variant="destructive" className="text-[10px] ml-1 h-4">OVERDUE</Badge>}
                                                        </div>
                                                    </div>
                                                    <Button variant={isOverdue ? "destructive" : "outline"} size="sm" className="shrink-0 gap-2 w-full sm:w-auto" onClick={() => handleReturn(loan.id)}>
                                                        <LuCornerDownLeft className="w-4 h-4" /> Process Return
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Inventory Panel */}
                        <Card className="shadow-md border-slate-200 h-full flex flex-col">
                            <CardHeader className="bg-slate-50 pb-4 border-b border-slate-200">
                                <CardTitle className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <LuBook className="w-5 h-5 text-slate-600" />
                                        Inventory Catalog
                                    </div>
                                    <div className="relative">
                                        <LuSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                        <input
                                            type="text"
                                            placeholder="Search by ISBN or Title..."
                                            className="text-sm pl-9 pr-4 py-1.5 w-[200px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-auto max-h-[600px]">
                                {loading ? (
                                    <div className="p-8 text-center text-text-muted">Loading catalog...</div>
                                ) : books.length === 0 ? (
                                    <div className="p-12 text-center text-text-muted">Catalog is empty.</div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {books.map(book => (
                                            <div key={book.id} className="p-4 flex justify-between items-center">
                                                <div>
                                                    <div className="font-bold text-sm text-slate-800 line-clamp-1">{book.title}</div>
                                                    <div className="text-xs text-text-secondary mt-0.5">{book.author} | {book.category}</div>
                                                    <div className="text-[10px] text-text-muted font-mono mt-1">ISBN: {book.isbn}</div>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <Badge variant={book.availableCopies > 0 ? "secondary" : "outline"} className={book.availableCopies > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}>
                                                        {book.availableCopies} available
                                                    </Badge>
                                                    <span className="text-[10px] text-text-muted mt-1 font-medium text-right">of {book.totalCopies} total</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
