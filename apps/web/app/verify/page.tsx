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
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
            
            <Toast toast={toast} onClose={hideToast} />

            <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-32 relative z-10">
                <div className="w-full max-w-3xl space-y-12">
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center gap-2 mb-2 px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/20 rounded-full">
                        <LuShieldCheck className="w-4 h-4 text-neon-cyan" />
                        <span className="text-xs font-bold text-neon-cyan tracking-widest uppercase">Immutable Ledger Access</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-neon-cyan tracking-tight drop-shadow-sm glow-sm">
                        Dual Verification Engine
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        Cryptographically audit student profiles and academic results against tamper-proof software ledgers.
                    </p>
                </div>

                {!verifiedData && !errorCode && (
                    <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-3xl overflow-hidden relative">
                        <div className="flex w-full border-b border-slate-800 bg-slate-950/40">
                            <button
                                onClick={() => setActiveTab('student')}
                                className={`flex-1 flex items-center justify-center gap-2 py-5 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'student' ? 'text-neon-cyan border-b-2 border-neon-cyan bg-slate-900/50' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <LuUserCheck className="w-5 h-5" />
                                Admission Status
                            </button>
                            <button
                                onClick={() => setActiveTab('result')}
                                className={`flex-1 flex items-center justify-center gap-2 py-5 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'result' ? 'text-neon-cyan border-b-2 border-neon-cyan bg-slate-900/50' : 'text-slate-500 hover:text-slate-300'}`}
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
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Application ID</label>
                                            <Input placeholder="e.g. APP-882910" value={studentForm.appId} onChange={e => setStudentForm({...studentForm, appId: e.target.value})} className="h-12 bg-slate-950/50 border-slate-700 text-white focus:border-neon-cyan" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">DOB / Email</label>
                                            <Input placeholder="Date of birth or Email" value={studentForm.contactRef} onChange={e => setStudentForm({...studentForm, contactRef: e.target.value})} className="h-12 bg-slate-950/50 border-slate-700 text-white focus:border-neon-cyan" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unique Secure Token (Hash)</label>
                                            <Input placeholder="0x..." value={studentForm.secureHash} onChange={e => setStudentForm({...studentForm, secureHash: e.target.value})} className="h-12 bg-slate-950/50 border-slate-700 text-neon-cyan font-mono focus:border-neon-cyan" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
                                         <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seat / Enroll Number</label>
                                            <Input placeholder="e.g. EN20251019" value={resultForm.enrollmentNo} onChange={e => setResultForm({...resultForm, enrollmentNo: e.target.value})} className="h-12 bg-slate-950/50 border-slate-700 text-white focus:border-neon-cyan" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Result Verification Hash</label>
                                            <Input placeholder="0x..." value={resultForm.secureHash} onChange={e => setResultForm({...resultForm, secureHash: e.target.value})} className="h-12 bg-slate-950/50 border-slate-700 text-neon-cyan font-mono focus:border-neon-cyan" />
                                        </div>
                                    </div>
                                )}

                                <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 tracking-wide mt-4" disabled={loading}>
                                    {loading ? <><LuLoader className="w-6 h-6 animate-spin" /> Querying Ledgers...</> : <><LuSearch className="w-6 h-6" /> Authenticate Record</>}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {errorCode && (
                    <Card className={`${errorCode === 409 ? 'bg-rose-950/40 border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.1)]' : 'bg-slate-900/60 border-slate-700 shadow-2xl'} backdrop-blur-xl border rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                        <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                            {errorCode === 409 ? (
                                <>
                                    <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center animate-pulse border border-rose-500/30">
                                        <LuShieldAlert className="w-10 h-10 text-rose-500" />
                                    </div>
                                    <h3 className="text-3xl font-black text-rose-400 tracking-tight">Security Alert: Tampering Detected</h3>
                                    <p className="text-slate-300 text-lg max-w-lg">
                                        The cryptographic signature provided does not match our secure ledger. This indicates unauthorized data modification or a fraudulent claim.
                                    </p>
                                </>
                            ) : errorCode === 404 ? (
                                <>
                                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                        <LuSearch className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white tracking-tight">Record Not Found</h3>
                                    <p className="text-slate-400 text-lg max-w-lg">
                                        We could not find any active student or result record matching these credentials. Please check for typos in the enrollment number or hash.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
                                        <LuTriangleAlert className="w-10 h-10 text-amber-500" />
                                    </div>
                                    <h3 className="text-3xl font-black text-amber-400 tracking-tight">System Node Offline</h3>
                                    <p className="text-slate-400 text-lg max-w-lg">
                                        Unable to reach the verification network. Please try again or contact system administration.
                                    </p>
                                </>
                            )}
                            <Button onClick={resetForms} className={`${errorCode === 409 ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'} mt-6 border transition-all px-8 py-6 rounded-full font-bold`}>
                                Return to Authenticator
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {verifiedData && !errorCode && verifiedData.type === 'student' && (
                    <Card className="bg-slate-900/80 backdrop-blur-xl border border-neon-cyan/30 shadow-[0_0_80px_rgba(0,255,255,0.05)] rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                         <div className="p-8 border-b border-slate-800 flex justify-between items-start bg-slate-950/50">
                            <div>
                                <div className="inline-flex flex-wrap items-center gap-2 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1"><LuCheck /> SECURE PAYLOAD</span>
                                    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase">Admission Profile</span>
                                </div>
                                <h2 className="text-3xl lg:text-4xl font-black text-white">{verifiedData.payload.student.name}</h2>
                            </div>
                            <Button variant="outline" className="hidden sm:flex" onClick={() => window.print()}><LuPrinter className="mr-2" /> Print PDF</Button>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                     <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email</p>
                                        <p className="text-slate-200 font-medium">{verifiedData.payload.student.email}</p>
                                     </div>
                                     <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded text-sm font-bold ${verifiedData.payload.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : verifiedData.payload.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                            {verifiedData.payload.status}
                                        </span>
                                     </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">University Map</p>
                                        <p className="text-slate-200 font-medium">{verifiedData.payload.university.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Application ID</p>
                                        <p className="text-neon-cyan font-mono">{verifiedData.payload.applicationId}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-950 p-6 border-t border-slate-800 text-xs font-mono text-slate-500 flex justify-between items-center">
                            <span>Hash: {verifiedData.payload.verifyHash}</span>
                            <Button onClick={resetForms} variant="ghost" size="sm" className="text-slate-400 hover:text-white">Close</Button>
                        </div>
                    </Card>
                )}

                {verifiedData && !errorCode && verifiedData.type === 'result' && (
                    <Card className="bg-slate-900/80 backdrop-blur-xl border border-neon-cyan/30 shadow-[0_0_80px_rgba(0,255,255,0.05)] rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                        <div className="p-8 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950/50 gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-3">
                                    <LuCheck className="w-3 h-3" /> VERIFIED ON CHAIN
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-tight">{verifiedData.payload.student.name}</h2>
                                <p className="text-neon-cyan font-mono text-sm tracking-wider">{verifiedData.payload.student.enrollmentNo}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button className="bg-slate-800 hover:bg-slate-700 text-white"><LuDownload className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Download PDF</span></Button>
                                <Button className="bg-slate-800 hover:bg-slate-700 text-white" onClick={() => window.print()}><LuPrinter className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Print</span></Button>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-900/50">
                            {/* Analytics Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-6 rounded-2xl bg-black/40 border border-white/5">
                                 <div className="space-y-1">
                                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Sem</span>
                                    <p className="text-2xl font-black text-white">{verifiedData.payload.result.semester}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Marks (Max 600)</span>
                                    <p className="text-2xl font-black text-white">{verifiedData.payload.result.totalMarks}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Percentage</span>
                                    <p className="text-2xl font-black text-neon-cyan">{verifiedData.payload.result.percentage}%</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Status / CGPA</span>
                                    <p className={`text-2xl font-black ${verifiedData.payload.result.status === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {verifiedData.payload.result.status} <span className="text-sm font-normal text-slate-500 ml-1">({verifiedData.payload.result.cgpa})</span>
                                    </p>
                                </div>
                            </div>

                            {/* Dense Table Layout for 6 subjects */}
                            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/80">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-900 border-b border-slate-800 uppercase text-[10px] font-black tracking-widest text-slate-400">
                                        <tr>
                                            <th className="px-6 py-4">Subject</th>
                                            <th className="px-6 py-4 text-center">Score / Total</th>
                                            <th className="px-6 py-4 text-center">Percentage</th>
                                            <th className="px-6 py-4 text-right">Grade Component</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {verifiedData.payload.result.subjects.map((sub: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-200">{sub.courseName}</div>
                                                    <div className="text-xs text-slate-500 font-mono mt-0.5">{sub.courseCode}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-slate-300 font-mono">
                                                    {sub.marksObtained} <span className="text-slate-600">/ {sub.maxMarks}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-slate-400">
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

                        <div className="bg-slate-950 p-6 border-t border-slate-800 text-[10px] md:text-xs font-mono text-slate-600 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                            <div className="flex flex-col gap-1">
                                <span>ON-CHAIN TX: <span className="text-emerald-500/80">{verifiedData.payload.blockchain.txHash}</span></span>
                                <span>PAYLOAD HASH: <span className="text-slate-500">{verifiedData.payload.blockchain.signatureHash}</span></span>
                            </div>
                            <Button onClick={resetForms} variant="ghost" className="text-slate-400 hover:text-white shrink-0">Close Registry</Button>
                        </div>
                    </Card>
                )}
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
