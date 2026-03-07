import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getMessageHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const history = await prisma.messageHistory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to last 50 for performance
        });

        res.json(history);
    } catch (error) {
        console.error('Get Message History Error:', error);
        res.status(500).json({ error: 'Failed to fetch message history' });
    }
};

export const syncMessages = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        // Handle both bulk (messages) and single (message_data) sync formats
        const { messages, message_data, offline_log_id, deviceInfo } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const messagesToSave = messages || (message_data ? [message_data] : []);

        if (messagesToSave && Array.isArray(messagesToSave) && messagesToSave.length > 0) {
            try {
                await prisma.messageHistory.createMany({
                    data: messagesToSave.map((msg: any) => ({
                        userId,
                        title: msg.title || 'Untitled',
                        content: msg.content || msg.body || '',
                        type: msg.type || 'NOTIFICATION',
                        link: msg.link,
                        source: msg.source || 'offline-sync',
                        createdAt: msg.sent_at ? new Date(msg.sent_at) : (msg.createdAt ? new Date(msg.createdAt) : new Date())
                    }))
                });
            } catch (dbError) {
                console.warn('Message history save failed (table may not exist):', dbError);
            }
        }

        // Sync log is optional — don't crash if the table doesn't exist
        try {
            await prisma.messageSyncLog.create({
                data: {
                    userId,
                    syncStatus: 'SUCCESS',
                    offlineCount: messagesToSave.length,
                    deviceInfo: deviceInfo || `log_id: ${offline_log_id || 'unknown'}`
                }
            });
        } catch (logError) {
            console.warn('Sync log creation skipped (table may not exist):', logError);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Sync Messages Error:', error);
        res.status(500).json({ error: 'Failed to sync messages' });
    }
};

export const getLatestMessages = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { lastSyncAt, since } = req.query;
        const syncTimestamp = since || lastSyncAt;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        let messages: any[] = [];
        try {
            messages = await prisma.messageHistory.findMany({
                where: {
                    userId,
                    createdAt: {
                        gt: syncTimestamp ? new Date(syncTimestamp as string) : new Date(0)
                    }
                },
                orderBy: { createdAt: 'asc' }
            });
        } catch (dbError) {
            console.warn('Message history fetch failed (table may not exist):', dbError);
        }

        res.json({ messages });
    } catch (error) {
        console.error('Get Latest Messages Error:', error);
        res.status(500).json({ error: 'Failed to fetch latest messages' });
    }
};
