'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Removed non-existent label import
import { LuSearch, LuShieldCheck, LuActivity, LuCheck, LuFingerprint, LuNetwork } from 'react-icons/lu';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function VerifyResultPortal() {
    const [enrollmentNo, setEnrollmentNo] = useState('');
    const [semester, setSemester] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResultData(null);

        try {
            const res = await api.get(`/public/verify?enrollmentNo=${enrollmentNo}&semester=${semester}`);
            setResultData(res.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Verification failed. The record may not exist or has been tampered with.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

            <div className="max-w-xl w-full space-y-8 relative z-10">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-2">
                        <LuNetwork className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">TrustBridge Verification</h1>
                    <p className="text-text-muted">Cryptographically verify academic credentials against the immutable ledger.</p>
                </div>

                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-white">Verify Student Record</CardTitle>
                        <CardDescription className="text-text-muted">Enter the exact enrollment number and semester to fetch the cryptographic proof.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <label htmlFor="enrollmentNo" className="text-sm font-medium text-slate-300">Enrollment Number</label>
                                    <Input
                                        id="enrollmentNo"
                                        placeholder="e.g. STUDENT_2024_1234"
                                        value={enrollmentNo}
                                        onChange={(e) => setEnrollmentNo(e.target.value)}
                                        className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <label htmlFor="semester" className="text-sm font-medium text-slate-300">Semester</label>
                                    <Input
                                        id="semester"
                                        type="number"
                                        placeholder="e.g. 4"
                                        value={semester}
                                        onChange={(e) => setSemester(e.target.value)}
                                        className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500"
                                        required
                                        min="1" max="10"
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 mt-4"
                                disabled={loading || !enrollmentNo || !semester}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Verifying Chain...</div>
                                ) : (
                                    <><LuSearch className="mr-2 h-5 w-5" /> Execute Verification Query</>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <Card className="bg-rose-950/30 border-rose-900/50">
                                <CardContent className="p-6 flex items-start gap-4">
                                    <LuActivity className="w-8 h-8 text-red-500 mb-2" />
                                    <div>
                                        <h3 className="font-bold text-rose-400">Verification Failed</h3>
                                        <p className="text-sm text-rose-300/80 mt-1">{error}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {resultData && resultData.verified && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <Card className="bg-emerald-950/20 border-emerald-900/50 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />
                                <CardHeader className="border-b border-emerald-900/30 pb-4 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/20 rounded-full">
                                            <LuCheck className="w-8 h-8 text-emerald-500 mb-2" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-emerald-400 flex items-center gap-2">
                                                Cryptographically Verified
                                                <LuCheck className="w-4 h-4" />
                                            </CardTitle>
                                            <CardDescription className="text-emerald-300/60 text-xs mt-1 font-mono">
                                                Ledger: {resultData.data.verificationDetails.ledger}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 relative z-10 space-y-6">
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary mb-1">Student Name</p>
                                            <p className="font-bold text-white">{resultData.data.studentName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary mb-1">Enrollment No.</p>
                                            <p className="font-mono text-slate-300">{resultData.data.enrollmentNo}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary mb-1">Program</p>
                                            <p className="text-slate-300">{resultData.data.program} (Sem {resultData.data.semester})</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary mb-1">Academic Status</p>
                                            <Badge className={resultData.data.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}>
                                                {resultData.data.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
                                        <div className="text-center flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary mb-1">SGPA</p>
                                            <p className="text-2xl font-bold text-white">{resultData.data.sgpa.toFixed(2)}</p>
                                        </div>
                                        <div className="w-px h-10 bg-slate-800" />
                                        <div className="text-center flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary mb-1">CGPA</p>
                                            <p className="text-2xl font-bold text-white">{resultData.data.cgpa.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-3 mt-4">
                                        <LuFingerprint className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary mb-1">Tx Hash</p>
                                            <p className="text-[10px] font-mono text-indigo-300/80 truncate">{resultData.data.verificationDetails.txHash}</p>
                                            <p className="text-[9px] text-slate-600 mt-1">Confirmed: {new Date(resultData.data.verificationDetails.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
