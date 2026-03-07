import { useState } from 'react';
import { api } from '../api';
import axios from 'axios';

export type StorageCategory = 'materials' | 'assignments' | 'profiles' | 'results';

export function useStorage() {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const uploadFile = async (file: File, category: StorageCategory): Promise<string> => {
        try {
            setIsUploading(true);
            setProgress(0);

            // 1. Request signed URL from backend
            const response = await api.post('/v2/storage/upload-url', {
                fileName: file.name,
                contentType: file.type,
                category
            });

            const { uploadUrl, publicUrl } = response.data;

            // 2. Upload directly to Firebase Storage via signed URL
            await axios.put(uploadUrl, file, {
                headers: {
                    'Content-Type': file.type
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setProgress(percentCompleted);
                }
            });

            return publicUrl;
        } catch (error) {
            console.error('[useStorage] Upload failed:', error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const deleteFile = async (filePath: string) => {
        try {
            await api.post('/v2/storage/delete', { filePath });
        } catch (error) {
            console.error('[useStorage] Delete failed:', error);
            throw error;
        }
    };

    return {
        uploadFile,
        deleteFile,
        isUploading,
        progress
    };
}
