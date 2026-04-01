"use client";

import React, { useState, useEffect } from 'react';
import { 
    Activity, 
    Users, 
    BookOpen, 
    ShieldCheck, 
    AlertCircle, 
    BrainCircuit, 
    LineChart, 
    Zap, 
    Award,
    RefreshCcw,
    Search,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DepartmentRiskMap } from './department-risk-map';

interface Faculty {
    id: string;
    name: string;
    designation: string;
}

interface Course {
    id: string;
    name: string;
    code: string;
}

interface AuditRecord {
    id: string;
    academicYear: string;
    semester: number;
    overallScore: number;
    teachingScore: number;
    researchImpact: number;
    aiSummary: string;
    recommendations: string;
}

interface AlignmentRecord {
    id: string;
    academicYear: string;
    alignmentScore: number;
    gapAnalysis: string;
    suggestions: string;
}

export function GovernanceAuditCenter() {
    const [activeTab, setActiveTab] = useState<'DEPARTMENTS' | 'FACULTY' | 'CURRICULUM'>('DEPARTMENTS');
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [facultyHistory, setFacultyHistory] = useState<AuditRecord[]>([]);
    const [courseHistory, setCourseHistory] = useState<AlignmentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [facRes, courRes] = await Promise.all([
                    fetch('/api/v1/faculty'),
                    fetch('/api/v1/courses')
                ]);
                setFaculties(await facRes.json());
                setCourses(await courRes.json());
            } catch (err) {
                console.error("Failed to load audit data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const fetchFacultyHistory = async (id: string) => {
        setSelectedFaculty(id);
        try {
            const res = await fetch(`/api/v2/governance/audit/faculty/${id}/history`);
            setFacultyHistory(await res.json());
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCourseHistory = async (id: string) => {
        setSelectedCourse(id);
        try {
            const res = await fetch(`/api/v2/governance/audit/curriculum/${id}/history`);
            setCourseHistory(await res.json());
        } catch (err) {
            console.error(err);
        }
    };

    const triggerFacultyAudit = async () => {
        if (!selectedFaculty) return;
        setProcessing(true);
        try {
            const res = await fetch(`/api/v2/governance/audit/faculty/${selectedFaculty}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ academicYear: '2023-24', semester: 1 })
            });
            if (res.ok) fetchFacultyHistory(selectedFaculty);
        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    const triggerCurriculumAudit = async () => {
        if (!selectedCourse) return;
        setProcessing(true);
        try {
            const res = await fetch(`/api/v2/governance/audit/curriculum/${selectedCourse}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ academicYear: '2023-24' })
            });
            if (res.ok) fetchCourseHistory(selectedCourse);
        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <RefreshCcw className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-muted-foreground animate-pulse font-medium">Initializing Governance Audit Engine...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8 max-w-[1600px] mx-auto min-h-screen">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent underline decoration-indigo-500/30 decoration-4 underline-offset-8">
                        Academic Governance Center
                    </h1>
                    <p className="text-slate-400 font-medium">Unified institutional oversight via Llama-3.2 Intelligence</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
                    <Button 
                        variant={activeTab === 'DEPARTMENTS' ? 'default' : 'ghost'} 
                        onClick={() => setActiveTab('DEPARTMENTS')}
                        className={`text-xs h-9 px-4 gap-2 transition-all duration-300 ${activeTab === 'DEPARTMENTS' ? 'bg-indigo-600 shadow-indigo-600/20 shadow-lg' : ''}`}
                    >
                        <Activity className="w-3.5 h-3.5" />
                        Departments
                    </Button>
                    <Button 
                        variant={activeTab === 'FACULTY' ? 'default' : 'ghost'} 
                        onClick={() => setActiveTab('FACULTY')}
                        className={`text-xs h-9 px-4 gap-2 transition-all duration-300 ${activeTab === 'FACULTY' ? 'bg-indigo-600 shadow-indigo-600/20 shadow-lg' : ''}`}
                    >
                        <Users className="w-3.5 h-3.5" />
                        Faculty
                    </Button>
                    <Button 
                        variant={activeTab === 'CURRICULUM' ? 'default' : 'ghost'} 
                        onClick={() => setActiveTab('CURRICULUM')}
                        className={`text-xs h-9 px-4 gap-2 transition-all duration-300 ${activeTab === 'CURRICULUM' ? 'bg-indigo-600 shadow-indigo-600/20 shadow-lg' : ''}`}
                    >
                        <BookOpen className="w-3.5 h-3.5" />
                        Curriculum
                    </Button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    {activeTab === 'DEPARTMENTS' && <DepartmentRiskMap />}

                    {activeTab === 'FACULTY' && (
                        <Card className="bg-slate-900/30 border-slate-800/80 backdrop-blur-3xl shadow-2xl overflow-hidden">
                            <CardHeader className="border-b border-slate-800/50 pb-6 bg-gradient-to-br from-orange-500/5 to-transparent">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 shadow-inner">
                                            <Users className="w-7 h-7 text-orange-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold tracking-tight">Faculty 360° Auditing</CardTitle>
                                            <CardDescription>Aggregate performance synthesis & AI impact reports</CardDescription>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        disabled={!selectedFaculty || processing}
                                        onClick={triggerFacultyAudit}
                                        className="border-orange-500/30 hover:bg-orange-500/10 text-orange-400 gap-2 h-10 px-5 font-semibold group"
                                    >
                                        {processing ? <RefreshCcw className="w-4 h-4 animate-spin text-orange-400" /> : <BrainCircuit className="w-4 h-4 transition-transform group-hover:scale-125" />}
                                        Run AI Audit
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-0 h-[700px]">
                                    {/* List Sidebar */}
                                    <div className="md:col-span-4 border-r border-slate-800/50 p-6 overflow-y-auto custom-scrollbar bg-slate-950/20">
                                        <div className="space-y-2">
                                            {faculties.map((f) => (
                                                <button
                                                    key={f.id}
                                                    onClick={() => fetchFacultyHistory(f.id)}
                                                    className={`w-full text-left p-4 rounded-2xl transition-all border group ${
                                                        selectedFaculty === f.id 
                                                        ? 'bg-orange-500/10 border-orange-500/40 shadow-lg shadow-orange-500/5' 
                                                        : 'hover:bg-slate-800/40 border-transparent hover:border-slate-700/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className={`font-bold text-sm ${selectedFaculty === f.id ? 'text-orange-400' : 'text-slate-200'}`}>{f.name}</div>
                                                            <div className="text-[10px] text-slate-500 uppercase font-extrabold tracking-widest mt-1.5 opacity-80">{f.designation}</div>
                                                        </div>
                                                        <ChevronRight className={`w-4 h-4 transition-transform ${selectedFaculty === f.id ? 'scale-125 text-orange-400' : 'opacity-0 group-hover:opacity-100'}`} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* History Display */}
                                    <div className="md:col-span-8 overflow-y-auto custom-scrollbar p-8 bg-slate-950/40">
                                        <AnimatePresence mode="wait">
                                            {selectedFaculty ? (
                                                <motion.div 
                                                    key={selectedFaculty}
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="space-y-8"
                                                >
                                                    {facultyHistory.length > 0 ? (
                                                        <div className="space-y-8">
                                                            {facultyHistory.map((audit) => (
                                                                <div key={audit.id} className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 shadow-2xl relative overflow-hidden group">
                                                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] transition-opacity group-hover:opacity-[0.06]">
                                                                        <Activity className="w-32 h-32" />
                                                                    </div>

                                                                    <div className="flex items-center justify-between mb-8 relative z-10">
                                                                        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 px-4 py-1 text-xs font-bold">
                                                                            AY {audit.academicYear} • SEMESTER {audit.semester}
                                                                        </Badge>
                                                                        <span className="text-[10px] text-slate-500 font-mono tracking-widest bg-slate-950/50 px-2 py-1 rounded-md">REF_{audit.id.slice(0,8).toUpperCase()}</span>
                                                                    </div>
                                                                    
                                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 relative z-10">
                                                                        <div className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800 shadow-inner flex flex-col items-center justify-center text-center group/metric">
                                                                            <div className="text-4xl font-extrabold text-orange-400 mb-1 group-hover/metric:scale-110 transition-transform">{audit.overallScore}%</div>
                                                                            <div className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Institutional Value</div>
                                                                        </div>
                                                                        <div className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800 shadow-inner flex flex-col items-center justify-center text-center group/metric">
                                                                            <div className="text-4xl font-extrabold text-blue-400 mb-1 group-hover/metric:scale-110 transition-transform">{audit.teachingScore}%</div>
                                                                            <div className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Teaching Eff.</div>
                                                                        </div>
                                                                        <div className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800 shadow-inner flex flex-col items-center justify-center text-center group/metric">
                                                                            <div className="text-4xl font-extrabold text-indigo-400 mb-1 group-hover/metric:scale-110 transition-transform">{audit.researchImpact}%</div>
                                                                            <div className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Research Index</div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-6 relative z-10">
                                                                        <div className="space-y-3">
                                                                            <h4 className="text-xs font-black text-slate-300 flex items-center gap-2.5 tracking-widest px-1">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                                                                EXECUTIVE_SUMMARY
                                                                            </h4>
                                                                            <div className="p-6 rounded-2xl bg-orange-500/[0.03] border border-orange-500/10 backdrop-blur-sm">
                                                                                <p className="text-sm text-slate-300 leading-relaxed italic font-medium">
                                                                                    "{audit.aiSummary}"
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-3">
                                                                            <h4 className="text-xs font-black text-slate-300 flex items-center gap-2.5 tracking-widest px-1">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                                                STRATEGIC_IMPROVEMENTS
                                                                            </h4>
                                                                            <div className="text-sm text-slate-400 bg-slate-950/40 p-6 rounded-2xl border border-slate-800/80 leading-relaxed">
                                                                                <ul className="space-y-3">
                                                                                    {audit.recommendations.split('\n').map((rec, i) => (
                                                                                        <li key={i} className="flex gap-3">
                                                                                            <Zap className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                                                                                            <span>{rec}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="h-[500px] flex flex-col items-center justify-center text-center p-12 relative overflow-hidden bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                                                            <div className="absolute inset-0 opacity-[0.01]">
                                                                <BrainCircuit className="w-full h-full" />
                                                            </div>
                                                            <AlertCircle className="w-16 h-16 mb-6 text-slate-700" />
                                                            <h3 className="text-xl font-bold text-slate-400 mb-2">No Performance Records</h3>
                                                            <p className="max-w-xs text-sm text-slate-500 leading-relaxed">
                                                                Historical metrics are uninitialized for this profile. Trigger an AI audit sequence to synthezise state.
                                                            </p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ) : (
                                                <div className="h-[640px] flex flex-col items-center justify-center text-center space-y-6 bg-slate-900/10 rounded-3xl border border-dashed border-slate-800/50">
                                                    <div className="p-8 rounded-full bg-slate-900/50 border border-slate-800 shadow-2xl relative">
                                                        <Search className="w-16 h-16 text-slate-600" />
                                                        <motion.div 
                                                            animate={{ rotate: 360 }} 
                                                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                                            className="absolute inset-0 rounded-full border border-orange-500/20 border-t-orange-500/60" 
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-lg font-bold text-slate-400 tracking-tight text-glow">Awaiting Target Selection</p>
                                                        <p className="text-sm text-slate-600 max-w-xs">Select a faculty operative from the roster to aggregate cross-contextual performance history.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'CURRICULUM' && (
                        <Card className="bg-slate-900/30 border-slate-800 backdrop-blur-3xl shadow-2xl overflow-hidden">
                             <CardHeader className="border-b border-slate-800/50 pb-6 bg-gradient-to-br from-indigo-500/5 to-transparent">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-inner">
                                            <BookOpen className="w-7 h-7 text-indigo-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold tracking-tight">Curriculum Alignment AI</CardTitle>
                                            <CardDescription>Syllabus coverage & outcome gap analysis</CardDescription>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        disabled={!selectedCourse || processing}
                                        onClick={triggerCurriculumAudit}
                                        className="border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 gap-2 h-10 px-5 font-semibold group"
                                    >
                                        {processing ? <RefreshCcw className="w-4 h-4 animate-spin text-indigo-400" /> : <LineChart className="w-4 h-4 transition-transform group-hover:rotate-12" />}
                                        Initialize Vector Sync
                                      </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="grid grid-cols-1 md:grid-cols-12 h-[700px]">
                                     {/* List Sidebar */}
                                     <div className="md:col-span-4 border-r border-slate-800/50 p-6 overflow-y-auto custom-scrollbar bg-slate-950/20">
                                        <div className="space-y-2">
                                            {courses.map((c) => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => fetchCourseHistory(c.id)}
                                                    className={`w-full text-left p-4 rounded-2xl transition-all border group ${
                                                        selectedCourse === c.id 
                                                        ? 'bg-indigo-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5' 
                                                        : 'hover:bg-slate-800/40 border-transparent hover:border-slate-700/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className={`font-bold text-sm ${selectedCourse === c.id ? 'text-indigo-400' : 'text-slate-200'}`}>{c.name}</div>
                                                            <div className="text-[10px] text-slate-500 font-mono tracking-widest mt-1.5 opacity-80">{c.code}</div>
                                                        </div>
                                                        <ArrowRight className={`w-4 h-4 transition-all ${selectedCourse === c.id ? 'translate-x-0.5 text-indigo-400' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Audit Detail */}
                                    <div className="md:col-span-8 overflow-y-auto custom-scrollbar p-8 bg-slate-950/40">
                                        <AnimatePresence mode="wait">
                                            {selectedCourse ? (
                                                <motion.div 
                                                    key={selectedCourse}
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="space-y-8"
                                                >
                                                    {courseHistory.length > 0 ? (
                                                        <div className="space-y-8">
                                                            {courseHistory.map((crdt) => (
                                                                <div key={crdt.id} className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 shadow-2xl relative overflow-hidden group">
                                                                    <div className="flex items-center justify-between mb-8">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center group-hover:scale-105 transition-transform">
                                                                                <div className="text-xl font-black text-indigo-400 leading-none">{crdt.alignmentScore}%</div>
                                                                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mt-1">HEALTH</div>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-[10px] text-slate-500 font-mono tracking-[0.3em] uppercase">SYNC_SESSION_METRIC</span>
                                                                                <h4 className="text-sm font-bold text-slate-200">Alignment Resolution • {crdt.academicYear}</h4>
                                                                            </div>
                                                                        </div>
                                                                        <Badge variant="outline" className="text-[10px] border-slate-800 text-slate-500 font-mono">HASH::{crdt.id.slice(0,12)}</Badge>
                                                                    </div>

                                                                    <div className="space-y-6">
                                                                        <div className="space-y-3">
                                                                            <h4 className="text-xs font-black text-slate-400 flex items-center gap-2.5 tracking-[0.2em] px-1 lowercase italic">
                                                                                <Award className="w-3.5 h-3.5 text-indigo-400" />
                                                                                gap_vectors_detected
                                                                            </h4>
                                                                            <div className="p-6 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/10 transition-colors group-hover:bg-indigo-500/5">
                                                                                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                                                                    {crdt.gapAnalysis}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-3">
                                                                            <h4 className="text-xs font-black text-slate-400 flex items-center gap-2.5 tracking-[0.2em] px-1 lowercase italic">
                                                                                <RefreshCcw className="w-3.5 h-3.5 text-emerald-400" />
                                                                                strategic_delta_fixes
                                                                            </h4>
                                                                            <div className="text-sm text-slate-400 bg-slate-950 p-6 rounded-2xl border border-slate-800/80 leading-relaxed border-dashed relative overflow-hidden">
                                                                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px]" />
                                                                                <div className="relative z-10 whitespace-pre-line text-xs font-mono tracking-tight text-slate-400 opacity-90">
                                                                                    {crdt.suggestions}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="h-[500px] flex flex-col items-center justify-center text-center p-12 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                                                            <RefreshCcw className="w-16 h-16 mb-6 text-slate-700 animate-pulse-slow" />
                                                            <h3 className="text-xl font-bold text-slate-400 mb-2">Null Sector Health</h3>
                                                            <p className="max-w-xs text-sm text-slate-500 leading-relaxed">
                                                                No curriculum health metrics processed. Initiate a vector sync to analyze syllabus-to-outcome mapping.
                                                            </p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ) : (
                                                <div className="h-[640px] flex flex-col items-center justify-center text-center space-y-6 bg-slate-900/10 rounded-3xl border border-dashed border-slate-800/50">
                                                    <div className="p-8 rounded-full bg-slate-900/50 border border-slate-800 shadow-2xl relative">
                                                        <BookOpen className="w-16 h-16 text-slate-600" />
                                                        <motion.div 
                                                            animate={{ rotate: -360 }} 
                                                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                                            className="absolute -inset-2 rounded-full border border-indigo-500/10 border-b-indigo-500/40" 
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-lg font-bold text-slate-400 tracking-tight">Curriculum Selection Required</p>
                                                        <p className="text-sm text-slate-600 max-w-sm">Target a specific course module to run semantic alignment checks against target learning outcomes.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #334155;
                }
                .text-glow {
                   text-shadow: 0 0 10px rgba(255,255,255,0.1);
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}
