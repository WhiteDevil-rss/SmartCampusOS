'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LuCheck, LuArrowRight, LuArrowLeft, LuUpload, LuBuilding, LuGraduationCap, LuInfo, LuHouse, LuSettings, LuShieldCheck, LuBookOpen, LuUserCheck, LuUser } from 'react-icons/lu';
import { Toast, useToast } from '@/components/ui/toast-alert';
import Link from 'next/link';
import { LandingNav } from '@/components/landing-nav';
import { LandingFooter } from '@/components/landing-footer';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
                {/* Background effects */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50 animate-pulse" />
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="relative z-10 max-w-md w-full text-center p-12 space-y-8 glass-morphism border border-primary/20 shadow-2xl rounded-[2.5rem]"
                >
                    <div className="mx-auto w-24 h-24 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                        <LuCheck className="w-12 h-12" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black font-space-grotesk tracking-tighter text-text-primary">Transmission Successful</h2>
                        <p className="text-text-secondary font-medium leading-relaxed">Your admission packet for <span className="text-text-primary font-bold">{formData.applicantName}</span> has been securely hashed and broadcasted to the institutional node.</p>
                    </div>
                    <div className="pt-4">
                        <Button 
                            onClick={() => window.location.href = '/'} 
                            className="w-full h-14 rounded-2xl bg-primary text-text-primary font-black text-lg shadow-glow hover:scale-105 active:scale-95 transition-all"
                        >
                            Return to Command Center
                        </Button>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Secure Protocol v2.4.1</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-text-primary selection:bg-primary/30 flex flex-col relative overflow-x-hidden pt-20">
            <LandingNav />
            
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>
            
            <Toast toast={toast} onClose={hideToast} />

            <main className="flex-1 flex flex-col items-center relative z-10">
                {!isApplying ? (
                    <div className="w-full max-w-7xl mx-auto px-6 py-24">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            {/* Copy Side */}
                            <motion.div 
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-10"
                            >
                                <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                    <span className="text-[10px] font-black text-primary tracking-[0.3em] uppercase">Admission Pipeline Active</span>
                                </div>
                                
                                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-text-primary">
                                    Initialize Your <span className="text-primary italic">Future</span>
                                </h1>
                                
                                <p className="text-xl text-text-secondary font-medium leading-relaxed max-w-lg">
                                    SmartOS provides a frictionless, zero-trust admission workflow. Your credentials are cryptographically secured and instantly verifiable.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                                    <Button 
                                        onClick={() => setIsApplying(true)} 
                                        className="h-16 px-10 rounded-2xl bg-primary text-text-primary font-black text-lg shadow-glow hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
                                    >
                                        Start Application <LuArrowRight className="ml-3 w-6 h-6" />
                                    </Button>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Process Time</span>
                                        <span className="text-lg font-bold text-text-primary tracking-tight">~ 2.4 Minutes</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Features Side */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                            >
                                {[
                                    { icon: <LuSettings />, title: "Secure Routing", desc: "Select your institutional hierarchy with 100% data integrity.", color: "primary" },
                                    { icon: <LuUserCheck />, title: "Instant Mapping", desc: "Personal data is mapped to secure institutional nodes immediately.", color: "blue" },
                                    { icon: <LuShieldCheck />, title: "Hash Anchoring", desc: "Every submission generates a verifiable SHA-256 protocol hash.", color: "emerald" },
                                    { icon: <LuBookOpen />, title: "Program Sync", desc: "Live curriculum and seat availability synchronization.", color: "purple" }
                                ].map((feature, i) => (
                                    <div key={i} className="p-8 rounded-[2rem] glass-morphism border border-white/5 hover:border-primary/20 transition-all group">
                                        <div className={`w-12 h-12 rounded-2xl bg-${feature.color}-500/10 flex items-center justify-center text-${feature.color}-400 mb-6 group-hover:scale-110 transition-transform`}>
                                            {React.cloneElement(feature.icon as React.ReactElement, { className: "w-6 h-6" })}
                                        </div>
                                        <h3 className="text-xl font-bold text-text-primary mb-2">{feature.title}</h3>
                                        <p className="text-sm text-text-secondary font-medium leading-relaxed">{feature.desc}</p>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-4xl px-6 py-20 pb-40">
                        {/* Header Controls */}
                        <div className="flex items-center justify-between mb-16 px-4">
                            <Button variant="ghost" onClick={() => setIsApplying(false)} className="h-12 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface font-bold">
                                <LuArrowLeft className="w-5 h-5 mr-3" /> Abort Mission
                            </Button>
                            
                            <div className="flex items-center gap-6">
                                {[1, 2, 3].map((s) => (
                                    <div key={s} className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border transition-all duration-500",
                                            step >= s ? "bg-primary border-primary text-text-primary shadow-glow" : "bg-surface border-border text-text-muted"
                                        )}>
                                            {step > s ? <LuCheck className="w-5 h-5" /> : s}
                                        </div>
                                        {s < 3 && <div className={cn("w-8 h-0.5 rounded-full transition-colors duration-500", step > s ? "bg-primary" : "bg-border")} />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Card */}
                        <motion.div 
                            key={step}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-morphism border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-10 md:p-14 space-y-12">
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black font-space-grotesk tracking-tighter text-text-primary">
                                        {step === 1 && "Targeting Hierarchy"}
                                        {step === 2 && "Personal Credentials"}
                                        {step === 3 && "Final Audit"}
                                    </h2>
                                    <p className="text-lg text-text-secondary font-medium">
                                        {step === 1 && "Identify your destination university and program stream."}
                                        {step === 2 && "Input your identifying details for institutional record creation."}
                                        {step === 3 && "Perform a final verification of your admission packet."}
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    {step === 1 && (
                                        <div className="grid grid-cols-1 gap-8">
                                            {[
                                                { label: "University Node", value: formData.universityId, options: universities, setter: (val: string) => setFormData({ ...formData, universityId: val }), icon: <LuBuilding /> },
                                                { label: "Department Cluster", value: formData.departmentId, options: departments, setter: (val: string) => setFormData({ ...formData, departmentId: val }), icon: <LuSettings />, disabled: !formData.universityId },
                                                { label: "Academic Stream", value: formData.programId, options: programs, setter: (val: string) => setFormData({ ...formData, programId: val }), icon: <LuGraduationCap />, disabled: !formData.departmentId }
                                            ].map((field, i) => (
                                                <div key={i} className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 pl-4">{field.label}</label>
                                                    <div className="relative group">
                                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-primary transition-colors">
                                                            {React.cloneElement(field.icon as React.ReactElement, { className: "w-5 h-5" })}
                                                        </div>
                                                        <select 
                                                            disabled={field.disabled}
                                                            className="w-full h-16 pl-14 pr-10 bg-surface border border-border rounded-2xl text-text-primary font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-30"
                                                            onChange={(e) => field.setter(e.target.value)} 
                                                            value={field.value}
                                                        >
                                                            <option value="">Select Path...</option>
                                                            {field.options.map((opt: any) => <option key={opt.id} value={opt.id} className="bg-[#0a0a0c]">{opt.name}</option>)}
                                                        </select>
                                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                            <LuArrowRight className="w-5 h-5 text-slate-700 rotate-90" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 pl-4">Full Identity Name</label>
                                                <div className="relative">
                                                    <LuUser className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" />
                                                    <Input className="h-16 pl-14 bg-surface border-border rounded-2xl text-text-primary font-bold focus:ring-primary/50" placeholder="e.g. Satoshi Nakamoto" value={formData.applicantName} onBlur={() => setTouched(t => ({ ...t, applicantName: true }))} onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted pl-4">Email Address</label>
                                                    <Input type="email" className="h-16 px-6 bg-surface border-border rounded-2xl text-text-primary font-bold" placeholder="satosh@p2p.foundation" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted pl-4">Contact Protocol</label>
                                                    <Input className="h-16 px-6 bg-surface border-border rounded-2xl text-text-primary font-bold" placeholder="+44 20 7946 0958" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-4">
                                            {[
                                                { label: "Identity", value: formData.applicantName },
                                                { label: "Program", value: programs.find(p => p.id === formData.programId)?.name },
                                                { label: "Contact", value: formData.email }
                                            ].map((attr, i) => (
                                                <div key={i} className="p-6 rounded-2xl bg-surface border border-border flex justify-between items-center group hover:bg-surface-hover transition-colors">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{attr.label}</span>
                                                    <span className="font-bold text-text-primary tracking-tight">{attr.value}</span>
                                                </div>
                                            ))}
                                            <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/20 text-center space-y-2">
                                                <p className="text-amber-400 font-bold text-sm">System Ready for Transmission</p>
                                                <p className="text-[10px] text-amber-500/60 uppercase font-black tracking-widest">A secure SHA-256 hash will be generated upon confirmation.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-12 border-t border-white/10">
                                    <Button 
                                        variant="ghost" 
                                        disabled={step === 1} 
                                        onClick={() => setStep(s => s - 1)} 
                                        className="h-14 px-8 rounded-2xl text-slate-500 hover:text-white font-bold"
                                    >
                                        <LuArrowLeft className="mr-3 h-5 w-5" /> Previous Phase
                                    </Button>

                                    <Button 
                                        onClick={step < 3 ? handleNextStep : handleSubmit} 
                                        disabled={!canProceed || loading}
                                        className={cn(
                                            "h-16 px-12 rounded-2x rounded-[1.5rem] font-black text-lg transition-all shadow-glow",
                                            step < 3 ? "bg-primary text-text-primary" : "bg-emerald-500 text-white hover:bg-emerald-400"
                                        )}
                                    >
                                        {loading ? "Transmitting..." : step < 3 ? "Next Configuration" : "Initialize Submission"}
                                        <LuArrowRight className="ml-3 h-6 w-6" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </main>
            <LandingFooter />
        </div>
    );
}

