import { firebaseAdmin } from '../lib/firebase-admin';

export class StorageService {
    /**
     * Generate a signed URL for client-side uploads
     */
    static async generateUploadUrl(filePath: string, contentType: string) {
        try {
            const bucket = firebaseAdmin.storage().bucket();
            const file = bucket.file(filePath);

            const [url] = await file.getSignedUrl({
                version: 'v4',
                action: 'write',
                expires: Date.now() + 15 * 60 * 1000, // 15 minutes
                contentType
            });

            return {
                uploadUrl: url,
                publicUrl: `https://storage.googleapis.com/${bucket.name}/${filePath}`
            };
        } catch (error) {
            console.error('[StorageService] Generate URL Error:', error);
            throw error;
        }
    }

    /**
     * Delete a file from storage
     */
    static async deleteFile(filePath: string) {
        try {
            const bucket = firebaseAdmin.storage().bucket();
            await bucket.file(filePath).delete();
        } catch (error) {
            console.error('[StorageService] Delete Error:', error);
            throw error;
        }
    }
}
