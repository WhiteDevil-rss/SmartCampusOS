'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { STUDENT_NAV } from '@/lib/constants/nav-config';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LuShieldAlert, LuSend, LuCircleHelp, LuShieldCheck, LuInfo } from 'react-icons/lu';
import { useToast, Toast } from '@/components/ui/toast-alert';
import { useStudentData } from '@/lib/hooks/use-student-data';

export default function StudentComplaintsPage() {
    const { profile } = useStudentData();
    const { toast, showToast, hideToast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [faculties, setFaculties] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    
    const [formData, setFormData] = useState({
        category: '',
        subject: '',
        description: '',
        targetId: '',
        recipient: '',
        isAnonymous: true
    });

    useEffect(() => {
        const fetchTargets = async () => {
            try {
                const [facRes, deptRes] = await Promise.all([
                    api.get('/faculty'),
                    api.get('/departments')
                ]);
                setFaculties(facRes.data);
                setDepartments(deptRes.data);
            } catch (err) {
                console.error('Failed to fetch targets:', err);
            }
        };
        fetchTargets();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.category || !formData.subject || !formData.description) {
            showToast('error', 'Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/v2/complaints/student', {
                ...formData,
                universityId: profile?.universityId,
                studentId: profile?.id
            });
            showToast('success', 'Grievance submitted successfully');
            setFormData({
                category: '',
                subject: '',
                description: '',
                targetId: '',
                recipient: '',
                isAnonymous: true
            });
        } catch (err) {
            showToast('error', 'Failed to submit grievance');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['STUDENT']}>
            <DashboardLayout navItems={STUDENT_NAV} title="Grievance Redressal">
                <Toast toast={toast} onClose={hideToast} />
                <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-rose-500">
                            <span className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-lg">
                                <LuShieldAlert className="w-6 h-6" />
                            </span>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Report a <span className="text-rose-500">Grievance</span></h2>
                        </div>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl">
                            Submit your concerns directly to the institutional administration. All anonymous reports are handled with strict confidentiality.
                        </p>
                    </div>

                    <Card className="p-10 rounded-[2.5rem] border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/5 rounded-full blur-[100px] group-hover:bg-rose-500/10 transition-colors duration-700" />
                        
                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Complaint Category</Label>
                                    <Select 
                                        value={formData.category} 
                                        onValueChange={(v: string) => setFormData({...formData, category: v, targetId: ''})}
                                    >
                                        <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-border-hover dark:bg-white/5 font-bold">
                                            <SelectValue placeholder="What is this about?" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-200 dark:border-border-hover">
                                            <SelectItem value="PROFESSOR">Professor / Faculty</SelectItem>
                                            <SelectItem value="DEPARTMENT">Department Issue</SelectItem>
                                            <SelectItem value="UNIVERSITY">University Level</SelectItem>
                                            <SelectItem value="INFRASTRUCTURE">Infrastructure / Facilities</SelectItem>
                                            <SelectItem value="OTHER">Other Concerns</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.category === 'PROFESSOR' && (
                                    <div className="space-y-3 animate-in zoom-in-95 duration-300">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Select Professor</Label>
                                        <Select value={formData.targetId} onValueChange={(v: string) => setFormData({...formData, targetId: v})}>
                                            <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-border-hover dark:bg-white/5 font-bold">
                                                <SelectValue placeholder="Choose Faculty Member" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-slate-200 dark:border-border-hover">
                                                {faculties.map(f => (
                                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {formData.category === 'DEPARTMENT' && (
                                    <div className="space-y-3 animate-in zoom-in-95 duration-300">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Select Department</Label>
                                        <Select value={formData.targetId} onValueChange={(v: string) => setFormData({...formData, targetId: v})}>
                                            <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-border-hover dark:bg-white/5 font-bold">
                                                <SelectValue placeholder="Choose Department" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-slate-200 dark:border-border-hover">
                                                {departments.map(d => (
                                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">To (Recipient)</Label>
                                <Select 
                                    value={formData.recipient} 
                                    onValueChange={(v: string) => setFormData({...formData, recipient: v})}
                                >
                                    <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-border-hover dark:bg-white/5 font-bold">
                                        <SelectValue placeholder="Address this for..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-200 dark:border-border-hover">
                                        <SelectItem value="Dean / HOD">Dean / HOD</SelectItem>
                                        <SelectItem value="Registrar">Registrar</SelectItem>
                                        <SelectItem value="VC Office">VC Office</SelectItem>
                                        <SelectItem value="Exam Department">Exam Department</SelectItem>
                                        <SelectItem value="IT Helpdesk">IT Helpdesk</SelectItem>
                                        <SelectItem value="Account Section">Account Section</SelectItem>
                                        <SelectItem value="Hostel Warden">Hostel Warden</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Subject</Label>
                                <Input 
                                    className="h-14 rounded-2xl border-slate-200 dark:border-border-hover dark:bg-white/5 font-bold px-6" 
                                    placeholder="Brief summary of the issue"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Detailed Description</Label>
                                <Textarea 
                                    className="min-h-[200px] rounded-[2rem] border-slate-200 dark:border-border-hover dark:bg-white/5 font-medium p-6 resize-none" 
                                    placeholder="Please provide as much detail as possible to help us investigate the matter..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-border-hover transition-all border-dashed">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="anonymous-switch" className="text-sm font-black text-slate-900 dark:text-white cursor-pointer">Submit Anonymously</Label>
                                        <LuCircleHelp className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your identity will be hidden from the reviewer.</p>
                                </div>
                                <Switch 
                                    id="anonymous-switch"
                                    checked={formData.isAnonymous}
                                    onCheckedChange={(v: boolean) => setFormData({...formData, isAnonymous: v})}
                                />
                            </div>

                            <div className="pt-4">
                                <Button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="w-full h-16 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl group transition-all"
                                >
                                    {submitting ? 'Transmitting Data...' : (
                                        <span className="flex items-center gap-3">
                                            <LuSend className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            Initialize Grievance Protocol
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-border-hover space-y-3">
                            <LuInfo className="w-6 h-6 text-amber-500" />
                            <h4 className="font-black text-xs uppercase tracking-widest">Confidentiality</h4>
                            <p className="text-xs text-slate-500 font-medium">Anonymous reports do not transmit student ID or metadata to the server.</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-border-hover space-y-3">
                            <LuShieldCheck className="w-6 h-6 text-emerald-500" />
                            <h4 className="font-black text-xs uppercase tracking-widest">Resolution Time</h4>
                            <p className="text-xs text-slate-500 font-medium">Most grievances are reviewed and processed within 3-5 academic working days.</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-border-hover space-y-3">
                            <LuShieldCheck className="w-6 h-6 text-indigo-500" />
                            <h4 className="font-black text-xs uppercase tracking-widest">Fair Play</h4>
                            <p className="text-xs text-slate-500 font-medium">Please ensure reports are factual. False reporting may trigger a node audit.</p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
