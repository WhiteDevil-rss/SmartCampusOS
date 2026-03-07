'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    LuSearch,
    LuFilter,
    LuMessageCircle,
    LuClock,
    LuMessageSquare,
    LuCircleHelp
} from 'react-icons/lu';
import { facultyNavItems } from '../page';

export default function FacultySupportPage() {
    return (
        <ProtectedRoute allowedRoles={['FACULTY']}>
            <DashboardLayout
                title="Support & Student Requests"
                navItems={facultyNavItems}
            >
                <div className="space-y-8 animate-fade-in">
                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <Input
                                placeholder="Search requests, student ID..."
                                className="pl-10 h-12 bg-surface border-border-hover rounded-2xl text-sm"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button variant="outline" className="rounded-xl border-border-hover bg-surface gap-2 font-bold px-4">
                                <LuFilter className="w-4 h-4" />
                                Filter
                            </Button>
                            <Button className="rounded-xl gap-2 font-bold px-6 shadow-glow">
                                Raise System Issue
                            </Button>
                        </div>
                    </div>

                    {/* Request List */}
                    <div className="space-y-4">
                        {[
                            { id: '#REQ-1024', student: 'Amit Sharma', type: 'Attendance Correction', status: 'PENDING', date: '2 hours ago' },
                            { id: '#REQ-1021', student: 'Priya Patel', type: 'Subject Credit Query', status: 'RESOLVED', date: 'Yesterday' },
                            { id: '#REQ-1019', student: 'Rahul Varma', type: 'Extracurricular Leave', status: 'ACTION_REQUIRED', date: '2 days ago' },
                        ].map((req, idx) => (
                            <Card key={idx} className="p-6 glass-card border-border bg-surface hover:border-primary/20 transition-all cursor-pointer group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-primary font-black">
                                            {req.student.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase text-primary tracking-widest">{req.id}</span>
                                                <Badge className={cn(
                                                    "text-[8px] font-black tracking-[0.1em]",
                                                    req.status === 'PENDING' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                        req.status === 'RESOLVED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                            "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                                )}>
                                                    {req.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <h4 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">{req.type}</h4>
                                            <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">{req.student} • Submitted {req.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button variant="outline" size="sm" className="rounded-xl border-border-hover bg-surface hover:bg-surface-hover font-bold gap-2">
                                            <LuMessageCircle className="w-4 h-4" />
                                            Reply
                                        </Button>
                                        <Button size="sm" className="rounded-xl font-bold px-6">
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Support Channels */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                        <Card className="p-6 glass-card border-border bg-surface text-center">
                            <LuMessageSquare className="w-8 h-8 text-primary mx-auto mb-4" />
                            <h5 className="font-bold text-text-primary mb-2">Internal Chat</h5>
                            <p className="text-[10px] text-text-muted font-bold leading-relaxed">Communicate directly with departments and administration.</p>
                        </Card>
                        <Card className="p-6 glass-card border-border bg-surface text-center">
                            <LuClock className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
                            <h5 className="font-bold text-text-primary mb-2">SLA Tracking</h5>
                            <p className="text-[10px] text-text-muted font-bold leading-relaxed">All student requests are tracked for timely resolution.</p>
                        </Card>
                        <Card className="p-6 glass-card border-border bg-surface text-center">
                            <LuCircleHelp className="w-8 h-8 text-amber-500 mx-auto mb-4" />
                            <h5 className="font-bold text-text-primary mb-2">Knowledge Base</h5>
                            <p className="text-[10px] text-text-muted font-bold leading-relaxed">Access faculty manuals and system documentation.</p>
                        </Card>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
