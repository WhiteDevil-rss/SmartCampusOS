import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { NotificationService, NotificationCategory } from '../services/notification.service';

export const getPreferences = async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'User ID required' });

        const preferences = await NotificationService.getPreferences(userId as string);
        res.json(preferences);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePreference = async (req: Request, res: Response) => {
    try {
        const { userId, category, channels } = req.body;
        if (!userId || !category || !channels) {
            return res.status(400).json({ error: 'Missing required preference fields' });
        }

        const preference = await NotificationService.updatePreferences(
            userId as string, 
            category as NotificationCategory, 
            channels
        );
        
        res.json(preference);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
