'use client';

import { useState, useRef } from 'react';
import { useStorage, StorageCategory } from '@/lib/hooks/use-storage';
import { LuCloudUpload, LuFileText, LuX, LuCircleCheck, LuInfo } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
    category: StorageCategory;
    onUploadSuccess: (url: string) => void;
    accept?: string;
    maxSizeMB?: number;
}

export function FileUpload({ category, onUploadSuccess, accept = "*/*", maxSizeMB = 10 }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { uploadFile, isUploading, progress } = useStorage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > maxSizeMB * 1024 * 1024) {
                setError(`File size exceeds ${maxSizeMB}MB limit`);
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        try {
            const url = await uploadFile(file, category);
            onUploadSuccess(url);
            setFile(null);
        } catch (err) {
            setError('Upload failed. Please try again.');
        }
    };

    return (
        <div className="space-y-4">
            <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "relative border-2 border-dashed rounded-3xl p-10 transition-all duration-300 cursor-pointer group",
                    file
                        ? "border-primary/50 bg-primary/5"
                        : "border-slate-200 dark:border-border-hover hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={accept}
                    className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-3 text-center">
                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                        file ? "bg-primary text-white" : "bg-slate-100 dark:bg-white/5 text-text-muted dark:text-text-secondary"
                    )}>
                        <LuCloudUpload className="w-8 h-8" />
                    </div>

                    {file ? (
                        <div className="space-y-1">
                            <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px]">
                                {file.name}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <p className="text-sm font-black text-slate-900 dark:text-white">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                                Maximum file size: {maxSizeMB}MB
                            </p>
                        </div>
                    )}
                </div>

                {file && !isUploading && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 dark:bg-surface-hover text-text-secondary hover:text-rose-500 transition-colors"
                    >
                        <LuX className="w-4 h-4" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isUploading && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                    >
                        <div className="flex justify-between items-end">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
                                Uploading to Secure Instance...
                            </p>
                            <p className="text-xs font-black text-primary">{progress}%</p>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                    <LuInfo className="w-4 h-4 shrink-0" />
                    <p className="text-xs font-bold">{error}</p>
                </div>
            )}

            {file && !isUploading && (
                <Button
                    onClick={handleUpload}
                    className="w-full h-12 rounded-2xl font-black uppercase tracking-widest group relative overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        Start Secure Upload
                        <LuCircleCheck className="w-4 h-4" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
            )}
        </div>
    );
}
