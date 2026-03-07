'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LuCheck, LuArrowRight, LuArrowLeft, LuUpload, LuBuilding, LuGraduationCap, LuInfo } from 'react-icons/lu';
import { Toast, useToast } from '@/components/ui/toast-alert';

export default function AdmissionPortal() {
    const [step, setStep] = useState(1);
    const [universities, setUniversities] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        universityId: '',
        departmentId: '',
        programId: '',
        applicantName: '',
        email: '',
        phone: '',
        documents: {}
    });

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        api.get('/universities').then(res => setUniversities(res.data));
    }, []);

    useEffect(() => {
        if (formData.universityId) {
            api.get(`/departments?universityId=${formData.universityId}`).then(res => setDepartments(res.data));
        }
    }, [formData.universityId]);

    useEffect(() => {
        if (formData.departmentId) {
            api.get(`/programs?departmentId=${formData.departmentId}`).then(res => setPrograms(res.data));
        }
    }, [formData.departmentId]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.post('/admissions/public/submit', formData);
            setSubmitted(true);
            showToast('success', 'Application submitted successfully!');
        } catch (error) {
            showToast('error', 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <Card className="max-w-md w-full text-center p-8 space-y-6">
                    <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                        <LuCheck className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Application Received!</h2>
                        <p className="text-text-secondary">Your admission request has been submitted. We'll contact you via email ({formData.email}) once reviewed.</p>
                    </div>
                    <Button onClick={() => window.location.href = '/'} className="w-full">Back to Home</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
            <Toast toast={toast} onClose={hideToast} />
            <div className="max-w-3xl w-full space-y-8 py-12">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">VNSGU Admission Gateway</h1>
                    <p className="text-text-secondary">Start your academic journey with us today.</p>
                </div>

                <div className="flex justify-between items-center mb-12 relative px-4 text-xs font-bold uppercase tracking-wider text-text-muted">
                    <div className={step >= 1 ? 'text-indigo-600 font-black' : ''}>1. Selection</div>
                    <div className={step >= 2 ? 'text-indigo-600 font-black' : ''}>2. Details</div>
                    <div className={step >= 3 ? 'text-indigo-600 font-black' : ''}>3. Review</div>
                </div>

                <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>
                            {step === 1 && "Choose Your Path"}
                            {step === 2 && "Personal Information"}
                            {step === 3 && "Finalize Submission"}
                        </CardTitle>
                        <CardDescription>
                            {step === 1 && "Select the university and program you wish to apply for."}
                            {step === 2 && "Enter your contact details accurately."}
                            {step === 3 && "Review your information before sending."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">University</label>
                                    <select
                                        className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                                        value={formData.universityId}
                                    >
                                        <option value="">Select University</option>
                                        {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Department</label>
                                    <select
                                        disabled={!formData.universityId}
                                        className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                        value={formData.departmentId}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Academic Program</label>
                                    <select
                                        disabled={!formData.departmentId}
                                        className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                                        onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                                        value={formData.programId}
                                    >
                                        <option value="">Select Program</option>
                                        {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input placeholder="John Doe" value={formData.applicantName} onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email Address</label>
                                        <Input type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone Number</label>
                                        <Input placeholder="+91 9988776655" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-text-secondary text-sm">Applicant</span>
                                    <span className="font-bold text-sm">{formData.applicantName}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-text-secondary text-sm">Program</span>
                                    <span className="font-bold text-sm">{programs.find(p => p.id === formData.programId)?.name || 'Direct Apply'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-text-secondary text-sm">Contact</span>
                                    <span className="font-bold text-sm">{formData.email}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-6 border-t">
                            <Button variant="ghost" disabled={step === 1} onClick={() => setStep(s => s - 1)}>
                                <LuArrowLeft className="mr-2 h-4 w-4" /> Previous
                            </Button>
                            {step < 3 ? (
                                <Button onClick={() => setStep(s => s + 1)} disabled={step === 1 && !formData.programId}>
                                    Next Step <LuArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                                    {loading ? 'Submitting...' : 'Confirm Submission'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
