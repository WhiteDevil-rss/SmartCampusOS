'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LuCheck, LuLoader, LuShieldCheck, LuTriangleAlert, LuArrowLeft, LuSearch, LuGraduationCap, LuUserCheck, LuPrinter, LuDownload, LuShieldAlert } from 'react-icons/lu';
import { Toast, useToast } from '@/components/ui/toast-alert';
import Link from 'next/link';
import { api } from '@/lib/api';
import { LandingNav } from '@/components/landing-nav';
import { LandingFooter } from '@/components/landing-footer';

export default function DualVerificationPortal() {
    const [activeTab, setActiveTab] = useState<'student' | 'result'>('student');
    const [loading, setLoading] = useState(false);
    const [verifiedData, setVerifiedData] = useState<any>(null);
    const [errorCode, setErrorCode] = useState<number | null>(null);
    const { toast, showToast, hideToast } = useToast();

    // Student Form State
    const [studentForm, setStudentForm] = useState({ appId: '', contactRef: '', secureHash: '' });
    // Result Form State
    const [resultForm, setResultForm] = useState({ enrollmentNo: '', secureHash: '' });

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (activeTab === 'student' && (!studentForm.appId || !studentForm.contactRef || !studentForm.secureHash)) {
            showToast('error', 'Please fill all Application fields.');
            return;
        }

        if (activeTab === 'result' && (!resultForm.enrollmentNo || !resultForm.secureHash)) {
            showToast('error', 'Please fill all Result fields.');
            return;
        }

        setLoading(true);
        setErrorCode(null);
        setVerifiedData(null);

        try {
            const endpoint = activeTab === 'student' 
                ? `/v2/verification/public/student?appId=${studentForm.appId}&contact=${studentForm.contactRef}&hash=${studentForm.secureHash}`
                : `/v2/verification/public/result?enrollNo=${resultForm.enrollmentNo}&hash=${resultForm.secureHash}`;
            
            const response = await api.get(endpoint);
            setVerifiedData({ type: activeTab, payload: response.data });
            showToast('success', 'Cryptographic verification successful. Data integrity confirmed.');
        } catch (error: any) {
            setErrorCode(error.response?.status || 500);
            if (error.response?.status === 409) {
                showToast('error', 'INTEGRITY COMPROMISED: Cryptographic signature mismatch.');
            } else if (error.response?.status === 404) {
                showToast('error', 'No matching records found for these credentials.');
            } else {
                showToast('error', 'Failed to connect to verification nodes.');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForms = () => {
        setVerifiedData(null);
        setErrorCode(null);
        setStudentForm({ appId: '', contactRef: '', secureHash: '' });
        setResultForm({ enrollmentNo: '', secureHash: '' });
    };

    return (
        <div className="min-h-screen bg-background relative flex flex-col font-sans antialiased text-text-primary selection:bg-neon-cyan/30">
            <LandingNav />
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 dark:bg-primary/20 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
            
            <Toast toast={toast} onClose={hideToast} />

            <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-32 relative z-10">
                <div className="w-full max-w-3xl space-y-12">
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center gap-2 mb-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                        <LuShieldCheck className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-primary tracking-widest uppercase">Immutable Ledger Access</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-text-primary via-primary to-secondary tracking-tight drop-shadow-sm transition-all duration-700">
                        Dual Verification Engine
                    </h1>
                    <p className="text-text-secondary text-lg max-w-xl mx-auto">
                        Cryptographically audit student profiles and academic results against tamper-proof software ledgers.
                    </p>
                </div>

                {!verifiedData && !errorCode && (
                    <Card className="bg-card backdrop-blur-xl border border-border shadow-2xl rounded-3xl overflow-hidden relative">
                        <div className="flex w-full border-b border-border bg-background/40">
                            <button
                                onClick={() => setActiveTab('student')}
                                className={`flex-1 flex items-center justify-center gap-2 py-5 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'student' ? 'text-primary border-b-2 border-primary bg-surface/50' : 'text-text-muted hover:text-text-primary'}`}
                            >
                                <LuUserCheck className="w-5 h-5" />
                                Admission Status
                            </button>
                            <button
                                onClick={() => setActiveTab('result')}
                                className={`flex-1 flex items-center justify-center gap-2 py-5 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'result' ? 'text-primary border-b-2 border-primary bg-surface/50' : 'text-text-muted hover:text-text-primary'}`}
                            >
                                <LuGraduationCap className="w-5 h-5" />
                                Academic Results
                            </button>
                        </div>

                        <CardContent className="p-8 sm:p-10">
                            <form onSubmit={handleVerify} className="space-y-6">
                                {activeTab === 'student' ? (
                                    <div className="space-y-5 animate-in slide-in-from-left-4 fade-in duration-300">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Application ID</label>
                                            <Input placeholder="e.g. APP-882910" value={studentForm.appId} onChange={e => setStudentForm({...studentForm, appId: e.target.value})} className="h-12 bg-surface/50 border-border text-text-primary focus:border-primary dark:focus:border-neon-cyan" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">DOB / Email</label>
                                            <Input placeholder="Date of birth or Email" value={studentForm.contactRef} onChange={e => setStudentForm({...studentForm, contactRef: e.target.value})} className="h-12 bg-surface/50 border-border text-text-primary focus:border-primary dark:focus:border-neon-cyan" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Unique Secure Token (Hash)</label>
                                            <Input placeholder="0x..." value={studentForm.secureHash} onChange={e => setStudentForm({...studentForm, secureHash: e.target.value})} className="h-12 bg-surface/50 border-border text-primary dark:text-neon-cyan font-mono focus:border-primary dark:focus:border-neon-cyan" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Seat / Enroll Number</label>
                                            <Input placeholder="e.g. EN20251019" value={resultForm.enrollmentNo} onChange={e => setResultForm({...resultForm, enrollmentNo: e.target.value})} className="h-12 bg-surface/50 border-border text-text-primary focus:border-primary" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Result Verification Hash</label>
                                            <Input placeholder="0x..." value={resultForm.secureHash} onChange={e => setResultForm({...resultForm, secureHash: e.target.value})} className="h-12 bg-surface/50 border-border text-primary font-mono focus:border-primary" />
                                        </div>
                                    </div>
                                )}

                                <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-black text-lg shadow-button flex items-center justify-center gap-2 tracking-wide mt-4" disabled={loading}>
                                    {loading ? <><LuLoader className="w-6 h-6 animate-spin" /> Querying Ledgers...</> : <><LuSearch className="w-6 h-6" /> Authenticate Record</>}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {errorCode && (
                    <Card className={`${errorCode === 409 ? 'bg-accent-red/5 dark:bg-rose-950/40 border-accent-red/30 dark:border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.1)]' : 'bg-card border-border shadow-2xl'} backdrop-blur-xl border rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                        <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                            {errorCode === 409 ? (
                                <>
                                    <div className="w-20 h-20 rounded-full bg-accent-red/10 dark:bg-rose-500/20 flex items-center justify-center animate-pulse border border-accent-red/20 dark:border-rose-500/30">
                                        <LuShieldAlert className="w-10 h-10 text-accent-red dark:text-rose-500" />
                                    </div>
                                    <h3 className="text-3xl font-black text-accent-red dark:text-rose-400 tracking-tight">Security Alert: Tampering Detected</h3>
                                    <p className="text-text-secondary text-lg max-w-lg">
                                        The cryptographic signature provided does not match our secure ledger. This indicates unauthorized data modification or a fraudulent claim.
                                    </p>
                                </>
                            ) : errorCode === 404 ? (
                                <>
                                    <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center border border-border">
                                        <LuSearch className="w-10 h-10 text-text-muted" />
                                    </div>
                                    <h3 className="text-3xl font-black text-text-primary tracking-tight">Record Not Found</h3>
                                    <p className="text-text-secondary text-lg max-w-lg">
                                        We could not find any active student or result record matching these credentials. Please check for typos in the enrollment number or hash.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 rounded-full bg-accent-yellow/10 flex items-center justify-center border border-accent-yellow/30">
                                        <LuTriangleAlert className="w-10 h-10 text-accent-yellow" />
                                    </div>
                                    <h3 className="text-3xl font-black text-accent-yellow tracking-tight">System Node Offline</h3>
                                    <p className="text-text-muted text-lg max-w-lg">
                                        Unable to reach the verification network. Please try again or contact system administration.
                                    </p>
                                </>
                            )}
                            <Button onClick={resetForms} className={`${errorCode === 409 ? 'bg-accent-red/10 dark:bg-rose-500/10 border-accent-red/20 dark:border-rose-500/30 text-accent-red dark:text-rose-400 hover:bg-accent-red hover:text-white' : 'bg-surface border-border text-text-secondary hover:bg-primary hover:text-white'} mt-6 border transition-all px-8 py-6 rounded-full font-bold`}>
                                Return to Authenticator
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {verifiedData && !errorCode && verifiedData.type === 'student' && (
                    <Card className="bg-card backdrop-blur-xl border border-primary/20 dark:border-neon-cyan/30 shadow-[0_0_80px_rgba(0,255,255,0.05)] rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                         <div className="p-8 border-b border-border flex justify-between items-start bg-surface/50">
                            <div>
                                <div className="inline-flex flex-wrap items-center gap-2 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-accent-green/10 border border-accent-green/20 text-accent-green dark:text-emerald-400 text-xs font-bold flex items-center gap-1"><LuCheck /> SECURE PAYLOAD</span>
                                    <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-blue-400 text-xs font-bold uppercase">Admission Profile</span>
                                </div>
                                <h2 className="text-3xl lg:text-4xl font-black text-text-primary">{verifiedData.payload.student.name}</h2>
                            </div>
                            <Button variant="outline" className="hidden sm:flex border-border text-text-secondary hover:text-text-primary" onClick={() => window.print()}><LuPrinter className="mr-2" /> Print PDF</Button>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                     <div>
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Email</p>
                                        <p className="text-text-primary font-medium">{verifiedData.payload.student.email}</p>
                                     </div>
                                     <div>
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded text-sm font-bold ${verifiedData.payload.status === 'APPROVED' ? 'bg-accent-green/20 text-accent-green dark:text-emerald-400' : verifiedData.payload.status === 'REJECTED' ? 'bg-accent-red/20 text-accent-red dark:text-rose-400' : 'bg-accent-yellow/20 text-accent-yellow'}`}>
                                            {verifiedData.payload.status}
                                        </span>
                                     </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">University Map</p>
                                        <p className="text-text-primary font-medium">{verifiedData.payload.university.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Application ID</p>
                                        <p className="text-primary font-mono font-bold">{verifiedData.payload.applicationId}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-background p-6 border-t border-border text-xs font-mono text-text-muted flex justify-between items-center">
                            <span className="truncate mr-4">Hash: {verifiedData.payload.verifyHash || 'COMMITTED_ON_DATABASE'}</span>
                            <Button onClick={resetForms} variant="ghost" size="sm" className="text-text-muted hover:text-text-primary shrink-0">Close</Button>
                        </div>
                    </Card>
                )}

                {verifiedData && !errorCode && verifiedData.type === 'result' && (
                    <Card className="bg-card backdrop-blur-xl border border-primary/20 dark:border-neon-cyan/30 shadow-[0_0_80px_rgba(0,255,255,0.05)] rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                        <div className="p-8 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface/50 gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-green/10 border border-accent-green/20 text-accent-green dark:text-emerald-400 text-xs font-bold mb-3">
                                    <LuCheck className="w-3 h-3" /> VERIFIED ON CHAIN
                                </div>
                                <h2 className="text-3xl font-black text-text-primary tracking-tight">{verifiedData.payload.student.name}</h2>
                                <p className="text-primary font-mono text-sm tracking-wider font-bold">{verifiedData.payload.student.enrollmentNo}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button className="bg-primary hover:bg-primary-dark text-white"><LuDownload className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Download PDF</span></Button>
                                <Button variant="outline" className="border-border text-text-secondary hover:text-text-primary" onClick={() => window.print()}><LuPrinter className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Print</span></Button>
                            </div>
                        </div>

                        <div className="p-8 bg-surface/30">
                            {/* Analytics Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-6 rounded-2xl bg-background/60 border border-border">
                                 <div className="space-y-1">
                                    <span className="text-[10px] text-text-muted uppercase font-black tracking-widest">Sem</span>
                                    <p className="text-2xl font-black text-text-primary">{verifiedData.payload.result.semester}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-text-muted uppercase font-black tracking-widest">Marks (Max 600)</span>
                                    <p className="text-2xl font-black text-text-primary">{verifiedData.payload.result.totalMarks}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-text-muted uppercase font-black tracking-widest">Percentage</span>
                                    <p className="text-2xl font-black text-primary">{verifiedData.payload.result.percentage}%</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-text-muted uppercase font-black tracking-widest">Status / CGPA</span>
                                    <p className={`text-2xl font-black ${verifiedData.payload.result.status === 'PASS' ? 'text-accent-green dark:text-emerald-400' : 'text-accent-red dark:text-rose-400'}`}>
                                        {verifiedData.payload.result.status} <span className="text-sm font-normal text-text-muted ml-1">({verifiedData.payload.result.cgpa})</span>
                                    </p>
                                </div>
                            </div>

                            {/* Dense Table Layout for 6 subjects */}
                            <div className="rounded-xl border border-border overflow-hidden bg-surface">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-background border-b border-border uppercase text-[10px] font-black tracking-widest text-text-muted">
                                        <tr>
                                            <th className="px-6 py-4">Subject</th>
                                            <th className="px-6 py-4 text-center">Score / Total</th>
                                            <th className="px-6 py-4 text-center">Percentage</th>
                                            <th className="px-6 py-4 text-right">Grade Component</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {verifiedData.payload.result.subjects.map((sub: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-background/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-text-primary">{sub.courseName}</div>
                                                    <div className="text-xs text-text-muted font-mono mt-0.5">{sub.courseCode}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-text-secondary font-mono">
                                                    {sub.marksObtained} <span className="text-text-disabled">/ {sub.maxMarks}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-text-muted">
                                                    {((sub.marksObtained / sub.maxMarks) * 100).toFixed(1)}%
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`inline-flex items-center justify-center min-w-[36px] px-2 py-1 rounded text-xs font-black ${
                                                        sub.grade === 'O' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        sub.grade === 'F' ? 'bg-rose-500/20 text-rose-400' :
                                                        'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                        {sub.grade}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-surface p-6 border-t border-border text-[10px] md:text-xs font-mono text-text-muted flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                            <div className="flex flex-col gap-1">
                                <span>ON-CHAIN TX: <span className="text-accent-green dark:text-emerald-400/80 shrink-0 truncate max-w-[200px] md:max-w-none">{verifiedData.payload.blockchain.txHash}</span></span>
                                <span>PAYLOAD HASH: <span className="text-text-secondary shrink-0 truncate max-w-[200px] md:max-w-none">{verifiedData.payload.blockchain.signatureHash}</span></span>
                            </div>
                            <Button onClick={resetForms} variant="ghost" className="text-text-muted hover:text-text-primary shrink-0">Close Registry</Button>
                        </div>
                    </Card>
                )}
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
