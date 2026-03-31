import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { logAction } from '../lib/logger';

export const getSettings = async (req: Request, res: Response) => {
    try {
        const settings = await prisma.globalSettings.findUnique({
            where: { id: 'system-config' }
        });

        if (!settings) {
            // Should have been seeded, but handle just in case
            return res.status(200).json(null);
        }

        res.json(settings);
    } catch (error) {
        console.error('GET_SETTINGS_ERROR:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const actor = (req as any).user;
        const {
            platformName,
            supportEmail,
            maintenanceMode,
            sessionTimeout,
            mfaEnabled,
            logRetention,
            autoBackups
        } = req.body;

        const settings = await prisma.globalSettings.update({
            where: { id: 'system-config' },
            data: {
                platformName,
                supportEmail,
                maintenanceMode,
                sessionTimeout: sessionTimeout ? parseInt(sessionTimeout) : undefined,
                mfaEnabled,
                logRetention,
                autoBackups
            }
        });

        // Enterprise Audit Log
        await logAction({
            userId: actor?.id,
            action: 'UPDATE_GLOBAL_SETTINGS',
            entityType: 'GLOBAL_SETTINGS',
            entityId: 'system-config',
            changes: req.body,
            status: 'SUCCESS'
        });

        res.json(settings);
    } catch (error: any) {
        console.error('UPDATE_SETTINGS_ERROR:', error);
        res.status(500).json({ error: error.message || 'Failed to update settings' });
    }
};
