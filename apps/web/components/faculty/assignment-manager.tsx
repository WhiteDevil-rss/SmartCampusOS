'use client';

import { useState } from 'react';
import { useAssignments } from '@/lib/hooks/use-assignments';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { LuFileText, LuPlus, LuClock, LuUsers, LuCircleCheck, LuArrowRight, LuX } from 'react-icons/lu';
import { format } from 'date-fns';
import { FileUpload } from '../shared/file-upload';
import { motion, AnimatePresence } from 'framer-motion';

export function AssignmentManager() {
    const { assignments, courses, batches, loading, error, addAssignment } = useAssignments();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseId: '',
        batchId: '',
        dueDate: '',
        maxMarks: 100,
        fileUrl: ''
    });

    if (loading) return <Skeleton className="h-96 rounded-3xl bg-surface" />;

    if (error) {
        return (
            <Card className="p-8 border-rose-500/20 bg-rose-500/5 text-rose-500 text-center">
                <p className="font-bold">{error}</p>
            </Card>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-black text-text-primary flex items-center gap-3">
                        <LuFileText className="text-primary" />
                        Assignments
                    </h3>
                    <p className="text-text-muted text-sm font-medium">Manage and grade student submissions</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="rounded-2xl gap-2 font-bold px-6">
                    <LuPlus className="w-5 h-5" />
                    New Assignment
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assignments.map((assignment) => (
                    <Card key={assignment.id} className="p-6 glass-card border-border hover:border-primary/20 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                <LuFileText className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Due Date</p>
                                <p className="text-sm font-bold text-rose-400">{format(new Date(assignment.dueDate), 'MMM d, h:mm a')}</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <h4 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">{assignment.title}</h4>
                            <p className="text-xs text-text-muted line-clamp-2">{assignment.description}</p>
                        </div>

                        <div className="flex items-center gap-4 py-4 border-y border-border mb-6">
                            <div className="flex items-center gap-2">
                                <LuUsers className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-black uppercase text-text-secondary">{assignment.batch?.name || 'All Batches'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <LuCircleCheck className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-black uppercase text-text-secondary">{assignment._count?.submissions || 0} Submissions</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 rounded-xl font-bold py-5 border-border-hover hover:bg-surface">
                                Edit
                            </Button>
                            <Button className="flex-1 rounded-xl font-bold py-5 gap-2">
                                Submissions
                                <LuArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                ))}

                {assignments.length === 0 && (
                    <div className="md:col-span-2 p-20 rounded-3xl border border-dashed border-border-hover text-center">
                        <LuFileText className="w-12 h-12 text-text-primary/10 mx-auto mb-4" />
                        <p className="text-text-muted font-bold">No assignments created yet.</p>
                        <Button onClick={() => setShowCreateModal(true)} variant="link" className="text-primary mt-2">Create your first assignment</Button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-border-hover p-8 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative my-8"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h4 className="text-2xl font-black text-text-primary">Create Assignment</h4>
                                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Post New Task to Batch</p>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl bg-surface text-text-muted hover:text-text-primary transition-colors">
                                    <LuX className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Assignment Title</label>
                                        <Input
                                            placeholder="e.g. Data Structures Project"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="h-12 bg-surface border-border rounded-2xl px-4 font-bold"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Course</label>
                                            <select
                                                className="w-full h-12 bg-surface border-border rounded-2xl px-4 font-bold text-sm text-text-primary appearance-none"
                                                value={formData.courseId}
                                                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                            >
                                                <option value="" className="bg-slate-900">Select Course</option>
                                                {courses.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Target Batch</label>
                                            <select
                                                className="w-full h-12 bg-surface border-border rounded-2xl px-4 font-bold text-sm text-text-primary appearance-none"
                                                value={formData.batchId}
                                                onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                                            >
                                                <option value="" className="bg-slate-900">Select Batch</option>
                                                {batches.map(b => <option key={b.id} value={b.id} className="bg-slate-900">{b.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Due Date</label>
                                            <Input
                                                type="datetime-local"
                                                value={formData.dueDate}
                                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                                className="h-12 bg-surface border-border rounded-2xl px-4 font-bold text-xs"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Max Marks</label>
                                            <Input
                                                type="number"
                                                value={formData.maxMarks}
                                                onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) })}
                                                className="h-12 bg-surface border-border rounded-2xl px-4 font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Reference File (Optional)</label>
                                        <FileUpload
                                            category="assignments"
                                            onUploadSuccess={(url) => setFormData({ ...formData, fileUrl: url })}
                                            maxSizeMB={20}
                                        />
                                    </div>

                                    <Button
                                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest mt-2"
                                        disabled={!formData.title || !formData.courseId || !formData.batchId || !formData.dueDate}
                                        onClick={async () => {
                                            const { fileUrl, ...rest } = formData;
                                            await addAssignment({
                                                ...rest,
                                                attachments: fileUrl ? [fileUrl] : []
                                            });
                                            setShowCreateModal(false);
                                            setFormData({ title: '', description: '', courseId: '', batchId: '', dueDate: '', maxMarks: 100, fileUrl: '' });
                                        }}
                                    >
                                        Publish Assignment
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
