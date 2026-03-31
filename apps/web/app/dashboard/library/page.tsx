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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { LuLibrary, LuBook, LuBookCopy, LuPlus, LuCornerDownLeft, LuSearch, LuCalendarDays, LuLoader } from 'react-icons/lu';
import { format } from 'date-fns';
import { Toast, useToast } from '@/components/ui/toast-alert';

export default function LibraryDashboard() {
    const { toast, showToast, hideToast } = useToast();
    const [books, setBooks] = useState<any[]>([]);
    const [loans, setLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Add Book Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newBook, setNewBook] = useState({
        isbn: '',
        title: '',
        author: '',
        category: '',
        totalCopies: '1'
    });

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
            await api.post(`/v2/library/loans/${loanId}/return`);
            showToast('success', 'Book returned successfully');
            fetchData();
        } catch (error) {
            console.error('Failed to return book', error);
            showToast('error', 'Failed to process return');
        }
    };

    const handleAddBook = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/v2/library/books', newBook);
            showToast('success', 'Book added to inventory');
            setIsAddModalOpen(false);
            setNewBook({ isbn: '', title: '', author: '', category: '', totalCopies: '1' });
            fetchData();
        } catch (error) {
            console.error('Failed to add book', error);
            showToast('error', 'Failed to add book');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['UNI_ADMIN', 'SUPERADMIN']}>
            <DashboardLayout navItems={UNI_ADMIN_NAV} title="Library Management">
                <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-0">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-heading font-black text-white tracking-tight flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20 shadow-sm">
                                    <LuLibrary className="w-6 h-6" />
                                </div>
                                Central Library
                            </h1>
                            <p className="text-muted mt-2 font-medium">
                                Manage book inventory, track active student loans, and process returns.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md">
                                        <LuPlus className="w-4 h-4" /> Add New Book
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Add New Book</DialogTitle>
                                        <DialogDescription>
                                            Enter the book details to add it to the library catalog.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleAddBook} className="space-y-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <label className="text-right text-sm font-medium text-text-secondary">ISBN</label>
                                            <Input
                                                className="col-span-3"
                                                value={newBook.isbn}
                                                onChange={e => setNewBook({ ...newBook, isbn: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <label className="text-right text-sm font-medium text-text-secondary">Title</label>
                                            <Input
                                                className="col-span-3"
                                                value={newBook.title}
                                                onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <label className="text-right text-sm font-medium text-text-secondary">Author</label>
                                            <Input
                                                className="col-span-3"
                                                value={newBook.author}
                                                onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <label className="text-right text-sm font-medium text-text-secondary">Category</label>
                                            <Input
                                                className="col-span-3"
                                                value={newBook.category}
                                                placeholder="e.g. Computer Science"
                                                onChange={e => setNewBook({ ...newBook, category: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <label className="text-right text-sm font-medium text-text-secondary">Copies</label>
                                            <Input
                                                type="number"
                                                className="col-span-3"
                                                value={newBook.totalCopies}
                                                onChange={e => setNewBook({ ...newBook, totalCopies: e.target.value })}
                                                min="1"
                                                required
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                                {isSubmitting ? <LuLoader className="w-4 h-4 animate-spin mr-2" /> : <LuPlus className="w-4 h-4 mr-2" />}
                                                Add Book
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Active Loans Panel */}
                        <Card className="bg-surface border-border shadow-sm h-full flex flex-col overflow-hidden">
                            <CardHeader className="bg-background/50 pb-4 border-b border-border p-6 flex flex-col justify-center">
                                <CardTitle className="text-primary font-heading font-black flex items-center gap-2">
                                    <LuBookCopy className="w-5 h-5" />
                                    Active Loans ({loans.length})
                                </CardTitle>
                                <CardDescription className="text-muted font-medium mt-1">Books currently checked out by students.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-auto max-h-[600px] custom-scrollbar">
                                {loading ? (
                                    <div className="p-8 text-center text-text-muted flex items-center justify-center gap-2">
                                        <LuLoader className="w-4 h-4 animate-spin" /> Loading loans...
                                    </div>
                                ) : loans.length === 0 ? (
                                    <div className="p-12 text-center text-text-muted">
                                        <LuLibrary className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No active loans.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {loans.map(loan => {
                                            const isOverdue = new Date(loan.dueDate) < new Date();
                                            return (
                                                <div key={loan.id} className="p-5 hover:bg-surface-hover transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                                    <div>
                                                        <div className="font-bold text-white line-clamp-1">{loan.book.title}</div>
                                                        <div className="text-xs text-muted mt-1 flex items-center gap-2">
                                                            <span className="font-bold text-primary">{loan.student.enrollmentNo}</span>
                                                            <span className="text-muted opacity-50">&bull;</span>
                                                            <span className="font-medium">{loan.student.name}</span>
                                                        </div>
                                                        <div className={`text-xs mt-2 font-bold flex items-center gap-1.5 ${isOverdue ? 'text-red-400' : 'text-muted'}`}>
                                                            <LuCalendarDays className="w-3.5 h-3.5" />
                                                            Due: {format(new Date(loan.dueDate), 'MMM dd, yyyy')}
                                                            {isOverdue && <Badge variant="outline" className="text-[10px] ml-1 h-4 bg-red-500/10 text-red-500 border-red-500/20">OVERDUE</Badge>}
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
                        <Card className="bg-surface border-border shadow-sm h-full flex flex-col overflow-hidden">
                            <CardHeader className="bg-background/50 pb-4 border-b border-border p-6 flex flex-col justify-center">
                                <CardTitle className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div className="flex items-center gap-2 text-white font-heading font-black">
                                        <LuBook className="w-5 h-5 text-primary" />
                                        Inventory Catalog
                                    </div>
                                    <div className="relative">
                                        <LuSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                                        <input
                                            type="text"
                                            placeholder="Search catalog..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="text-sm pl-9 pr-4 py-2 w-full sm:w-[220px] bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white placeholder:text-muted"
                                        />
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-auto max-h-[600px] custom-scrollbar">
                                {loading ? (
                                    <div className="p-8 text-center text-text-muted flex items-center justify-center gap-2">
                                        <LuLoader className="w-4 h-4 animate-spin" /> Loading catalog...
                                    </div>
                                ) : filteredBooks.length === 0 ? (
                                    <div className="p-12 text-center text-text-muted">
                                        <LuBook className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>{searchQuery ? 'No books match your search.' : 'Catalog is empty.'}</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {filteredBooks.map(book => (
                                            <div key={book.id} className="p-4 flex justify-between items-center hover:bg-surface-hover transition-colors">
                                                <div>
                                                    <div className="font-bold text-sm text-white line-clamp-1">{book.title}</div>
                                                    <div className="text-xs text-muted font-medium mt-0.5">{book.author} | <span className="text-primary">{book.category}</span></div>
                                                    <div className="text-[10px] text-muted opacity-60 font-mono mt-1 font-bold">ISBN: {book.isbn}</div>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-1">
                                                    <Badge variant="outline" className={book.availableCopies > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold' : 'bg-red-500/10 text-red-400 border-red-500/20 font-bold'}>
                                                        {book.availableCopies} available
                                                    </Badge>
                                                    <span className="text-[10px] text-muted font-bold">of {book.totalCopies} total</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>
                </div>
                <Toast toast={toast} onClose={hideToast} />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
