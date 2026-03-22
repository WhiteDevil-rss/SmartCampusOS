'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LuCheck, LuArrowRight, LuArrowLeft, LuUpload, LuBuilding, LuGraduationCap, LuInfo, LuHouse, LuSettings, LuShieldCheck, LuBookOpen, LuUserCheck } from 'react-icons/lu';
import { Toast, useToast } from '@/components/ui/toast-alert';
import Link from 'next/link';
import { LandingNav } from '@/components/landing-nav';
import { LandingFooter } from '@/components/landing-footer';

export default function AdmissionPortal() {
    const [isApplying, setIsApplying] = useState(false);
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

    const [touched, setTouched] = useState({
        applicantName: false,
        email: false,
        phone: false
    });

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    // Validation Rules
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isNameValid = formData.applicantName.trim().length > 0;
    const isEmailValid = EMAIL_RE.test(formData.email.trim());
    const isPhoneValid = formData.phone.trim().length >= 10 && /^\+?[\d\s-]+$/.test(formData.phone.trim());

    const isStep1Valid = !!formData.universityId && !!formData.departmentId && !!formData.programId;
    const isStep2Valid = isNameValid && isEmailValid && isPhoneValid;

    const canProceed = step === 1 ? isStep1Valid : (step === 2 ? isStep2Valid : true);

    useEffect(() => {
        api.get('/v2/admissions/public/universities')
            .then(res => setUniversities(res.data))
            .catch(err => console.warn('Silently caught failed universities fetch:', err.message));
    }, []);

    useEffect(() => {
        if (formData.universityId) {
            api.get(`/v2/admissions/public/departments?universityId=${formData.universityId}`)
                .then(res => setDepartments(res.data))
                .catch(err => console.warn('Silently caught failed departments fetch:', err.message));
        } else {
            setDepartments([]);
            setPrograms([]);
            setFormData(prev => ({ ...prev, departmentId: '', programId: '' }));
        }
    }, [formData.universityId]);

    useEffect(() => {
        if (formData.departmentId) {
            api.get(`/v2/admissions/public/programs?departmentId=${formData.departmentId}`)
                .then(res => setPrograms(res.data))
                .catch(err => console.warn('Silently caught failed programs fetch:', err.message));
        } else {
            setPrograms([]);
            setFormData(prev => ({ ...prev, programId: '' }));
        }
    }, [formData.departmentId]);

    const handleNextStep = () => {
        if (!canProceed) return;
        setStep(s => s + 1);
    };

    const handleSubmit = async () => {
        if (!isStep1Valid || !isStep2Valid) {
            showToast('error', 'Please complete all required fields correctly before submitting.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/v2/admissions/public/submit', formData);
            setSubmitted(true);
            showToast('success', 'Application submitted successfully!');
        } catch (error) {
            showToast('error', 'Failed to submit application. Please check your network and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <LandingNav />
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-neon-cyan to-blue-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                </div>

                <Card className="relative z-10 max-w-md w-full text-center p-8 space-y-6 bg-slate-900/40 border border-slate-700/50 backdrop-blur-xl shadow-2xl rounded-2xl glow-sm mt-20">
                    <div className="mx-auto w-16 h-16 bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan rounded-full flex items-center justify-center glow-cyan mt-6">
                        <LuCheck className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">Application Received!</h2>
                        <p className="text-slate-400">Your admission request has been securely submitted. We'll contact you via email ({formData.email}).</p>
                    </div>
                    <Button onClick={() => window.location.href = '/'} className="w-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan hover:text-slate-900 transition-all">
                        Back to Origin
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-text-primary selection:bg-neon-cyan/30 flex flex-col relative overflow-x-hidden pt-20">
            <LandingNav />
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none z-0" />
            
            <Toast toast={toast} onClose={hideToast} />

            <main className="flex-1 flex flex-col items-center relative z-10">
                {!isApplying ? (
                    // Admissions Guide Section
                    <section className="w-full max-w-5xl mx-auto px-6 py-20 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-6">
                            <LuBookOpen className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-primary tracking-widest uppercase">Admissions Guide</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
                            Start Your Journey
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
                            A seamless, multi-step application workflow engineered for speed. Zero friction, no login required. Track your progress with cryptographic hashes.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 text-left">
                            <div className="glass-morphism p-6 rounded-2xl border border-slate-700/50 bg-slate-900/40">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4"><LuSettings className="text-primary w-5 h-5"/></div>
                                <h3 className="text-lg font-bold text-white mb-2">1. Select Pipeline</h3>
                                <p className="text-slate-400 text-sm">Choose your preferred organization, department, and program hierarchy seamlessly.</p>
                            </div>
                            <div className="glass-morphism p-6 rounded-2xl border border-slate-700/50 bg-slate-900/40">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4"><LuUserCheck className="text-blue-400 w-5 h-5"/></div>
                                <h3 className="text-lg font-bold text-white mb-2">2. Provide Details</h3>
                                <p className="text-slate-400 text-sm">Submit your core personal and contact details. No complex onboarding, just efficient data mapping.</p>
                            </div>
                            <div className="glass-morphism p-6 rounded-2xl border border-slate-700/50 bg-slate-900/40">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4"><LuShieldCheck className="text-emerald-400 w-5 h-5"/></div>
                                <h3 className="text-lg font-bold text-white mb-2">3. Immutable Review</h3>
                                <p className="text-slate-400 text-sm">Verify your submission. All records map perfectly to the Verify Engine for future status checks.</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button onClick={() => setIsApplying(true)} className="px-10 py-6 rounded-2xl bg-primary text-white font-black text-lg shadow-lg hover:scale-105 active:scale-95 transition-all w-full sm:w-auto">
                                Apply Now <LuArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                            <Link href="/#inquiry" className="px-10 py-6 rounded-2xl border border-slate-700 bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition-all w-full sm:w-auto">
                                General Inquiry
                            </Link>
                        </div>
                    </section>
                ) : (
                    // Application Form Section
                    <div className="w-full max-w-3xl px-6 py-12">
                        <div className="flex items-center gap-4 mb-8">
                            <Button variant="ghost" onClick={() => setIsApplying(false)} className="text-slate-400 hover:text-white">
                                <LuArrowLeft className="w-4 h-4 mr-2" /> Back to Guide
                            </Button>
                        </div>
                        
                        <div className="flex justify-between items-center mb-8 relative px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <div className={step >= 1 ? 'text-primary transition-colors' : ''}>1. Section</div>
                            <div className={step >= 2 ? 'text-primary transition-colors' : ''}>2. Details</div>
                            <div className={step >= 3 ? 'text-primary transition-colors' : ''}>3. Review</div>
                        </div>

                        <Card className="bg-slate-900/60 border border-slate-700/50 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden hover:border-slate-600/50 transition-colors duration-300">
                            <CardHeader className="border-b border-slate-800 bg-slate-900/40">
                                <CardTitle className="text-xl font-semibold text-white">
                                    {step === 1 && "Choose Your Path"}
                                    {step === 2 && "Personal Information"}
                                    {step === 3 && "Finalize Submission"}
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    {step === 1 && "Select the university and program you wish to apply for."}
                                    {step === 2 && "Enter your contact details accurately."}
                                    {step === 3 && "Review your information before sending."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6 p-6 sm:p-8">
                                {step === 1 && (
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                                <span>Organization <span className="text-rose-500">*</span></span>
                                            </label>
                                            <select className={`w-full h-12 px-4 bg-slate-950/50 border ${!formData.universityId ? 'border-amber-500/30 ring-1 ring-amber-500/10' : 'border-slate-700'} rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`} onChange={(e) => setFormData({ ...formData, universityId: e.target.value })} value={formData.universityId}>
                                                <option value="" className="text-slate-500">Select Organization</option>
                                                {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                                <span>Department <span className="text-rose-500">*</span></span>
                                            </label>
                                            <select disabled={!formData.universityId} className={`w-full h-12 px-4 bg-slate-950/50 border ${formData.universityId && !formData.departmentId ? 'border-amber-500/30 ring-1 ring-amber-500/10' : 'border-slate-700'} rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-40 disabled:cursor-not-allowed`} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })} value={formData.departmentId}>
                                                <option value="" className="text-slate-500">Select Department</option>
                                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                                <span>Academic Program <span className="text-rose-500">*</span></span>
                                            </label>
                                            <select disabled={!formData.departmentId} className={`w-full h-12 px-4 bg-slate-950/50 border ${formData.departmentId && !formData.programId ? 'border-amber-500/30 ring-1 ring-amber-500/10' : 'border-slate-700'} rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-40 disabled:cursor-not-allowed`} onChange={(e) => setFormData({ ...formData, programId: e.target.value })} value={formData.programId}>
                                                <option value="" className="text-slate-500">Select Program</option>
                                                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name <span className="text-rose-500">*</span></label>
                                            <Input className={`h-12 bg-slate-950/50 text-white rounded-xl ${touched.applicantName && !isNameValid ? 'border-rose-500/50 focus:ring-rose-500/50' : 'border-slate-700 focus:ring-primary'}`} placeholder="John Doe" value={formData.applicantName} onBlur={() => setTouched(t => ({ ...t, applicantName: true }))} onChange={(e) => { setFormData({ ...formData, applicantName: e.target.value }); setTouched(t => ({ ...t, applicantName: true })); }} />
                                            {touched.applicantName && !isNameValid && <p className="text-[11px] text-rose-400 flex items-center mt-1"><LuInfo className="w-3 h-3 mr-1"/> Required</p>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email <span className="text-rose-500">*</span></label>
                                                <Input type="email" className={`h-12 bg-slate-950/50 text-white rounded-xl ${touched.email && !isEmailValid ? 'border-rose-500/50 focus:ring-rose-500/50' : 'border-slate-700 focus:ring-primary'}`} placeholder="john@example.com" value={formData.email} onBlur={() => setTouched(t => ({ ...t, email: true }))} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setTouched(t => ({ ...t, email: true })); }} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone <span className="text-rose-500">*</span></label>
                                                <Input className={`h-12 bg-slate-950/50 text-white rounded-xl ${touched.phone && !isPhoneValid ? 'border-rose-500/50 focus:ring-rose-500/50' : 'border-slate-700 focus:ring-primary'}`} placeholder="+1 5550199" value={formData.phone} onBlur={() => setTouched(t => ({ ...t, phone: true }))} onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setTouched(t => ({ ...t, phone: true })); }} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-4 bg-slate-950/50 p-6 rounded-xl border border-slate-700/50">
                                        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                                            <span className="text-slate-400 text-sm font-medium">Applicant</span>
                                            <span className="font-bold text-sm text-white">{formData.applicantName}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-800 py-4">
                                            <span className="text-slate-400 text-sm font-medium">Program Target</span>
                                            <span className="font-bold text-sm text-primary">{programs.find(p => p.id === formData.programId)?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-4">
                                            <span className="text-slate-400 text-sm font-medium">Contact Comm</span>
                                            <span className="font-bold text-sm text-white">{formData.email}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between pt-8 mt-4 border-t border-slate-800">
                                    <Button variant="ghost" disabled={step === 1} onClick={() => setStep(s => s - 1)} className="text-slate-400 hover:text-white hover:bg-slate-800">
                                        <LuArrowLeft className="mr-2 h-4 w-4" /> Go Back
                                    </Button>

                                    {step < 3 ? (
                                        <Button onClick={handleNextStep} disabled={!canProceed} className={`transition-all ${!canProceed ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90'}`}>
                                            Next Step <LuArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button onClick={handleSubmit} disabled={loading || !isStep1Valid || !isStep2Valid} className={`transition-all px-8 ${loading || !isStep1Valid || !isStep2Valid ? 'bg-slate-800 text-slate-500' : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'}`}>
                                            {loading ? 'Submitting...' : 'Confirm Transmission'}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
            <LandingFooter />
        </div>
    );
}
