'use client';

import { useState } from 'react';
import { useMaterials } from '@/lib/hooks/use-materials';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { LuBookOpen, LuPlus, LuFile, LuTrash2, LuDownload, LuExternalLink, LuX } from 'react-icons/lu';
import { format } from 'date-fns';
import { FileUpload } from '../shared/file-upload';
import { motion, AnimatePresence } from 'framer-motion';

export function MaterialManager() {
    const { materials, courses, loading, error, deleteMaterial, uploadMaterial } = useMaterials();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseId: '',
        fileUrl: '',
        fileType: ''
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
                        <LuBookOpen className="text-primary" />
                        Study Materials
                    </h3>
                    <p className="text-text-muted text-sm font-medium">Distribute notes, syllabus, and lecture resources</p>
                </div>
                <Button onClick={() => setShowUploadModal(true)} className="rounded-2xl gap-2 font-bold px-6">
                    <LuPlus className="w-5 h-5" />
                    Upload Material
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map((material) => (
                    <Card key={material.id} className="p-6 glass-card border-border hover:border-primary/20 transition-all group relative overflow-hidden">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                                <LuFile className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors truncate">{material.title}</h4>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{material.course.name}</p>
                            </div>
                        </div>

                        <p className="text-xs text-text-muted mb-6 line-clamp-2 min-h-[32px]">{material.description || 'No description provided.'}</p>

                        <div className="flex items-center justify-between border-t border-border pt-4">
                            <span className="text-[10px] font-bold text-text-muted uppercase">{format(new Date(material.createdAt), 'MMM d, yyyy')}</span>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-xl text-rose-500 hover:bg-rose-500/10"
                                    onClick={() => deleteMaterial(material.id)}
                                >
                                    <LuTrash2 className="w-4 h-4" />
                                </Button>
                                <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                                    <Button size="icon" className="rounded-xl">
                                        <LuExternalLink className="w-4 h-4" />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </Card>
                ))}

                {materials.length === 0 && (
                    <div className="lg:col-span-3 p-20 rounded-3xl border border-dashed border-border-hover text-center">
                        <LuBookOpen className="w-12 h-12 text-text-primary/10 mx-auto mb-4" />
                        <p className="text-text-muted font-bold">No study materials uploaded yet.</p>
                        <Button onClick={() => setShowUploadModal(true)} variant="link" className="text-primary mt-2">Upload your first resource</Button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-slate-900 border border-border-hover p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden relative"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h4 className="text-xl font-black text-text-primary">Upload Material</h4>
                                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Secure Cloud Storage</p>
                                </div>
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="p-2 rounded-xl bg-surface text-text-muted hover:text-text-primary transition-colors"
                                >
                                    <LuX className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Title</label>
                                    <Input
                                        placeholder="Enter material title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="h-12 bg-surface border-border rounded-2xl px-4 font-bold focus:border-primary/50 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Select Course</label>
                                    <select
                                        className="w-full h-12 bg-surface border-border rounded-2xl px-4 font-bold text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                                        value={formData.courseId}
                                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                    >
                                        <option value="" className="bg-slate-900">Choose a course</option>
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id} className="bg-slate-900">{course.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">File Upload</label>
                                    <FileUpload
                                        category="materials"
                                        onUploadSuccess={(url) => {
                                            setFormData({ ...formData, fileUrl: url, fileType: 'PDF' }); // Simplify fileType for now
                                        }}
                                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                                    />
                                </div>

                                <Button
                                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest mt-4"
                                    disabled={!formData.title || !formData.courseId || !formData.fileUrl}
                                    onClick={async () => {
                                        await uploadMaterial(formData);
                                        setShowUploadModal(false);
                                        setFormData({ title: '', description: '', courseId: '', fileUrl: '', fileType: '' });
                                    }}
                                >
                                    Finalize Material Posting
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
