import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { StorageService } from '../services/storage.service';
import crypto from 'crypto';
const uuidv4 = () => crypto.randomUUID();

export const requestUpload = async (req: AuthRequest, res: Response) => {
    try {
        const { fileName, contentType, category } = req.body;
        const userId = req.user!.id;

        if (!fileName || !contentType || !category) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Generate a unique path: category/userId/uuid-filename
        const fileExtension = fileName.split('.').pop();
        const secureFileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `${category}/${userId}/${secureFileName}`;

        const uploadData = await StorageService.generateUploadUrl(filePath, contentType);

        res.json({
            ...uploadData,
            filePath
        });
    } catch (error) {
        console.error('Request Upload Error:', error);
        res.status(500).json({ error: 'Failed to generate upload URL' });
    }
};

export const deleteFile = async (req: AuthRequest, res: Response) => {
    try {
        const { filePath } = req.body;
        const userId = req.user!.id;

        // Security check: ensure user is deleting their own file
        // (Path structure assumes {category}/{userId}/...)
        if (!filePath.includes(`/${userId}/`)) {
            return res.status(403).json({ error: 'Unauthorized to delete this file' });
        }

        await StorageService.deleteFile(filePath);
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Delete File Error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
};
