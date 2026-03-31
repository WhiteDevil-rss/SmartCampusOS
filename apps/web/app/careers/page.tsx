'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LandingNav } from '@/components/landing-nav';
import { LandingFooter } from '@/components/landing-footer';
import { api } from '@/lib/api';
import {
    LuBriefcase, LuMapPin, LuClock, LuBuilding2, LuSearch,
    LuX, LuLoader, LuCircleCheck, LuCircleAlert, LuUser,
    LuMail, LuPhone, LuUpload, LuShieldCheck, LuFilter,
    LuChevronDown, LuFileText
} from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';

interface Job {
    id: string;
    title: string;
    description: string;
    type: string;
    location: string | null;
    panelType: string;
    panelId: string | null;
    departmentName: string | null;
    universityName: string | null;
    isActive: boolean;
    createdAt: string;
}

const PANEL_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
    SUPERADMIN: { label: 'SmartCampus OS',  color: 'text-primary',   bg: 'bg-primary/10',   border: 'border-primary/20' },
    UNIVERSITY:  { label: 'University',      color: 'text-sky-400',   bg: 'bg-sky-500/10',   border: 'border-sky-500/20' },
    DEPARTMENT:  { label: 'Department',      color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
};

const JOB_TYPE_COLORS: Record<string, string> = {
    FULL_TIME:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PART_TIME:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
    CONTRACT:   'bg-orange-500/10 text-orange-400 border-orange-500/20',
    INTERNSHIP: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
    const [form, setForm] = useState({ applicantName: '', email: '', mobile: '', coverLetter: '' });
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.applicantName.trim() || !form.email.trim() || !form.mobile.trim()) {
            setError('Full Name, Email, and Mobile are required.');
            setStatus('error');
            return;
        }
        if (!resumeFile) {
            setError('Please upload your resume. It is required to apply.');
            setStatus('error');
            return;
        }
        setStatus('loading');
        setError('');
        try {
            // For demo: submit metadata; in production use FormData for actual file upload
            await api.post(`/v2/jobs/${job.id}/apply`, {
                applicantName: form.applicantName,
                email: form.email,
                mobile: form.mobile,
                coverLetter: form.coverLetter || null,
                resumeUrl: resumeFile.name, // placeholder until storage integration
            });
            setStatus('success');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit application. Please try again.');
            setStatus('error');
        }
    };

    const panel = PANEL_LABELS[job.panelType];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-card backdrop-blur-3xl border border-border rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-border flex items-start justify-between gap-4 sticky top-0 bg-card/80 backdrop-blur-md z-10">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">Apply For</p>
                            <h2 className="text-xl font-black text-text-primary leading-tight">{job.title}</h2>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${panel?.bg} ${panel?.color} ${panel?.border}`}>
                                    {panel?.label ?? job.panelType}
                                </span>
                                {job.universityName && <span className="text-xs text-text-muted">{job.universityName}</span>}
                                {job.departmentName && <span className="text-xs text-text-muted">• {job.departmentName}</span>}
                                {job.location && <span className="text-xs text-text-muted">• {job.location}</span>}
                            </div>
                        </div>
                        <button onClick={onClose} className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-surface transition-colors">
                            <LuX className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {status === 'success' ? (
                            <div className="flex flex-col items-center text-center py-10 gap-4 animate-in fade-in zoom-in-95">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <LuCircleCheck className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-black text-text-primary">Application Submitted!</h3>
                                <p className="text-text-secondary text-sm max-w-xs">Your application has been received and routed to the hiring panel.</p>
                                <button onClick={onClose} className="mt-2 px-6 py-2.5 rounded-xl border border-border text-text-primary hover:bg-surface transition-colors text-sm font-bold">Close</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                {status === 'error' && (
                                    <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                                        <LuCircleAlert className="w-4 h-4 text-rose-400 shrink-0" />
                                        <p className="text-rose-300 text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Full Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs uppercase font-bold text-text-muted tracking-widest">Full Name <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <LuUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            type="text" required
                                            placeholder="Ravi Shankar"
                                            value={form.applicantName}
                                            onChange={e => setForm(f => ({ ...f, applicantName: e.target.value }))}
                                            className="w-full h-11 bg-surface border border-border rounded-xl pl-10 pr-4 text-text-primary text-sm focus:border-primary focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Email + Mobile */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs uppercase font-bold text-text-muted tracking-widest">Email <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                            <input
                                                type="email" required
                                                placeholder="you@example.com"
                                                value={form.email}
                                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                                className="w-full h-11 bg-surface border border-border rounded-xl pl-10 pr-4 text-text-primary text-sm focus:border-primary focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs uppercase font-bold text-text-muted tracking-widest">Mobile <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <LuPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                            <input
                                                type="tel" required
                                                placeholder="+91 98765 43210"
                                                value={form.mobile}
                                                onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                                                className="w-full h-11 bg-surface border border-border rounded-xl pl-10 pr-4 text-text-primary text-sm focus:border-primary focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Resume Upload — MANDATORY */}
                                <div className="space-y-1.5">
                                    <label className="text-xs uppercase font-bold text-text-muted tracking-widest">Resume <span className="text-rose-500">*</span></label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        className="hidden"
                                        onChange={e => setResumeFile(e.target.files?.[0] ?? null)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`w-full h-24 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${
                                            resumeFile
                                                ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400'
                                                : 'border-border text-text-muted hover:border-primary/50 hover:text-primary hover:bg-primary/5'
                                        }`}
                                    >
                                        {resumeFile ? (
                                            <>
                                                <LuFileText className="w-6 h-6" />
                                                <span className="text-sm font-semibold truncate max-w-xs">{resumeFile.name}</span>
                                                <span className="text-xs opacity-70">Click to change</span>
                                            </>
                                        ) : (
                                            <>
                                                <LuUpload className="w-6 h-6" />
                                                <span className="text-sm font-semibold">Upload Resume (PDF / DOC)</span>
                                                <span className="text-xs">Required — Click to browse</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Cover Letter */}
                                <div className="space-y-1.5">
                                    <label className="text-xs uppercase font-bold text-text-muted tracking-widest">Cover Letter <span className="text-text-muted/60">(Optional)</span></label>
                                    <textarea
                                        rows={3}
                                        placeholder="Tell us why you're a great fit..."
                                        value={form.coverLetter}
                                        onChange={e => setForm(f => ({ ...f, coverLetter: e.target.value }))}
                                        className="w-full bg-surface border border-border rounded-xl p-3.5 text-text-primary text-sm focus:border-primary focus:outline-none transition-colors resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black tracking-wide shadow-lg shadow-primary/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-1"
                                >
                                    {status === 'loading'
                                        ? <><LuLoader className="w-4 h-4 animate-spin" /> Submitting...</>
                                        : <><LuUpload className="w-4 h-4" /> Submit Application</>
                                    }
                                </button>

                                <p className="text-center text-[10px] text-text-muted font-black uppercase tracking-widest">
                                    No login required · Application routed to hiring panel securely
                                </p>
                            </form>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function JobCard({ job, onApply }: { job: Job; onApply: (j: Job) => void }) {
    const panel = PANEL_LABELS[job.panelType] ?? { label: job.panelType, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
    const typeStyle = JOB_TYPE_COLORS[job.type] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20';

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            layout
            className="group bg-card backdrop-blur-xl border border-border hover:border-primary/50 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 hover:shadow-[0_0_30px_var(--primary-glow)]"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:shadow-lg transition-all">
                    <LuBriefcase className="w-5 h-5 text-primary" />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${typeStyle}`}>
                    {job.type.replace('_', ' ')}
                </span>
            </div>

            <div>
                <h3 className="text-lg font-black text-text-primary leading-tight mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">{job.description}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-bold ${panel.bg} ${panel.color} ${panel.border}`}>
                    <LuBuilding2 className="w-3 h-3" />
                    {panel.label}
                </span>
                {job.universityName && (
                    <span className="text-text-muted bg-surface/50 border border-border px-2 py-0.5 rounded-full">{job.universityName}</span>
                )}
                {job.departmentName && (
                    <span className="text-text-muted bg-surface/50 border border-border px-2 py-0.5 rounded-full">{job.departmentName}</span>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 mt-auto pt-2 border-t border-border/60">
                {job.location && (
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                        <LuMapPin className="w-3.5 h-3.5" /> {job.location}
                    </span>
                )}
                <span className="flex items-center gap-1 text-xs text-text-muted ml-auto">
                    <LuClock className="w-3.5 h-3.5" />
                    {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
            </div>

            <button
                onClick={() => onApply(job)}
                className="w-full h-10 rounded-xl border border-primary/30 text-primary hover:bg-primary hover:text-white font-bold text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
            >
                Apply Now
            </button>
        </motion.div>
    );
}

function FilterSelect({
    label, value, onChange, options
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { label: string; value: string }[];
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="h-11 bg-surface border border-border hover:border-primary/50 focus:border-primary rounded-xl pl-4 pr-10 text-sm text-text-primary outline-none transition-colors appearance-none cursor-pointer min-w-[160px]"
            >
                <option value="">{label}</option>
                {options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
            <LuChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
    );
}

export default function CareersPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [search, setSearch] = useState('');
    const [filterUniversity, setFilterUniversity] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterType, setFilterType] = useState('');

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/v2/jobs');
            setJobs(res.data?.data ?? []);
        } catch {
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchJobs(); }, [fetchJobs]);

    // Derive filter options dynamically from data
    const universities = Array.from(new Set(jobs.map(j => j.universityName).filter(Boolean))) as string[];
    const departments = Array.from(new Set(jobs.map(j => j.departmentName).filter(Boolean))) as string[];

    const filtered = jobs.filter(j => {
        const q = search.toLowerCase();
        const matchSearch = !q || j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q);
        const matchUni = !filterUniversity || j.universityName === filterUniversity;
        const matchDept = !filterDepartment || j.departmentName === filterDepartment;
        const matchType = !filterType || j.type === filterType;
        return matchSearch && matchUni && matchDept && matchType;
    });

    const hasFilters = search || filterUniversity || filterDepartment || filterType;

    const clearFilters = () => {
        setSearch('');
        setFilterUniversity('');
        setFilterDepartment('');
        setFilterType('');
    };

    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col relative overflow-x-hidden">
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen pointer-events-none z-0" />

            <LandingNav />

            {selectedJob && <ApplyModal job={selectedJob} onClose={() => setSelectedJob(null)} />}

            <main className="flex-1 relative z-10">
                {/* Hero */}
                <section className="relative pt-36 pb-16 px-6 md:px-12 max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center gap-5"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-400" />
                            </span>
                            <span className="text-purple-300 text-xs font-bold tracking-wider uppercase">We&apos;re Hiring</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
                            Shape the Future of{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-primary to-sky-400">
                                Education Tech
                            </span>
                        </h1>

                        <p className="text-text-secondary text-lg md:text-xl leading-relaxed max-w-2xl">
                            Join the team building next-generation academic management tools for universities, departments, and students across India.
                        </p>

                        <div className="flex items-center gap-8 mt-2 pt-2">
                            {[
                                { value: loading ? '—' : String(jobs.length), label: 'Open Roles' },
                                { value: '3', label: 'Hiring Panels' },
                                { value: '100%', label: 'Remote Friendly' },
                            ].map(s => (
                                <div key={s.label} className="text-center">
                                    <p className="text-3xl font-black text-text-primary">{s.value}</p>
                                    <p className="text-xs text-text-muted mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* Search + Filter Bar */}
                <section className="px-6 md:px-12 max-w-7xl mx-auto pb-8">
                    <div className="bg-surface/60 backdrop-blur-xl border border-border rounded-2xl p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center shadow-sm">
                        {/* Search */}
                        <div className="relative flex-1">
                            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search by job title or keywords..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full h-11 bg-surface border border-border hover:border-primary focus:border-primary rounded-xl pl-10 pr-4 text-text-primary text-sm outline-none transition-colors"
                            />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <LuFilter className="w-4 h-4 text-text-muted shrink-0" />

                            {universities.length > 0 && (
                                <FilterSelect
                                    label="University"
                                    value={filterUniversity}
                                    onChange={setFilterUniversity}
                                    options={universities.map(u => ({ label: u, value: u }))}
                                />
                            )}

                            {departments.length > 0 && (
                                <FilterSelect
                                    label="Department"
                                    value={filterDepartment}
                                    onChange={setFilterDepartment}
                                    options={departments.map(d => ({ label: d, value: d }))}
                                />
                            )}

                            <FilterSelect
                                label="Job Type"
                                value={filterType}
                                onChange={setFilterType}
                                options={[
                                    { label: 'Full Time', value: 'FULL_TIME' },
                                    { label: 'Part Time', value: 'PART_TIME' },
                                    { label: 'Contract', value: 'CONTRACT' },
                                    { label: 'Internship', value: 'INTERNSHIP' },
                                ]}
                            />

                            {hasFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="h-11 px-4 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-sm font-bold transition-colors flex items-center gap-1.5"
                                >
                                    <LuX className="w-4 h-4" /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results count */}
                    {!loading && (
                        <p className="text-text-muted text-sm mt-3 px-1 font-medium">
                            {hasFilters
                                ? `${filtered.length} of ${jobs.length} positions match your filters`
                                : `${jobs.length} open positions`
                            }
                        </p>
                    )}
                </section>

                {/* Job Grid */}
                <section className="px-6 md:px-12 max-w-7xl mx-auto pb-24">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <LuLoader className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-text-muted text-sm font-medium">Loading institutional positions...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center">
                                <LuBriefcase className="w-8 h-8 text-text-disabled" />
                            </div>
                            <p className="text-text-primary font-bold text-lg">No positions match</p>
                            <p className="text-text-muted text-sm max-w-xs">Try adjusting your search or filters to find open roles.</p>
                            {hasFilters && (
                                <button onClick={clearFilters} className="px-5 py-2 rounded-xl border border-border bg-surface text-text-primary hover:bg-surface-hover text-sm font-bold transition-colors">
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filtered.map(job => (
                                <JobCard key={job.id} job={job} onApply={setSelectedJob} />
                            ))}
                        </motion.div>
                    )}

                    <div className="mt-16 flex items-center justify-center gap-2 text-text-muted text-xs font-mono">
                        <LuShieldCheck className="w-4 h-4 text-accent-green" />
                        No login required. All applications are securely routed to the respective institutional nodes.
                    </div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}
