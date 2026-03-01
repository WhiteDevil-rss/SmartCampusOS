import { Request, Response } from 'express';
import { logAction } from '../lib/logger';
import { createBackup, listBackups, factoryReset, restoreFromBackup, BackupMeta } from '../services/seed-management.service';
import path from 'path';
import fs from 'fs';

const BACKUP_DIR = path.resolve(__dirname, '../../../seed-backups');

// ─── GET /v1/seed/backups — List all backup files ────────────────────────────
export const getBackups = async (req: Request, res: Response) => {
    try {
        const actor = (req as any).user;
        if (actor?.role !== 'SUPERADMIN') {
            return res.status(403).json({ error: 'Forbidden. Superadmin access required.' });
        }
        const backups = listBackups();
        res.json({ backups });
    } catch (err: any) {
        console.error('GET_BACKUPS_ERROR:', err);
        res.status(500).json({ error: err.message || 'Failed to list backups' });
    }
};

// ─── POST /v1/seed/backups — Create a new backup ─────────────────────────────
export const createSeedBackup = async (req: Request, res: Response) => {
    try {
        const actor = (req as any).user;
        if (actor?.role !== 'SUPERADMIN') {
            return res.status(403).json({ error: 'Forbidden. Superadmin access required.' });
        }

        const actorName = actor.username ?? actor.email ?? 'SuperAdmin';
        const backup = await createBackup(actor.id, actorName);

        await logAction({
            userId: actor.id,
            action: 'SEED_BACKUP_CREATED',
            entityType: 'SYSTEM',
            entityId: backup.filename,
            changes: { filename: backup.filename, totalRecords: backup.totalRecords, sizeDisplay: backup.sizeDisplay },
            status: 'SUCCESS',
        });

        res.json({ message: 'Seed backup created successfully', backup });
    } catch (err: any) {
        console.error('CREATE_BACKUP_ERROR:', err);
        res.status(500).json({ error: err.message || 'Failed to create seed backup' });
    }
};

// ─── POST /v1/seed/factory-reset — Execute factory reset ─────────────────────
export const runFactoryReset = async (req: Request, res: Response) => {
    try {
        const actor = (req as any).user;
        if (actor?.role !== 'SUPERADMIN') {
            return res.status(403).json({ error: 'Forbidden. Superadmin access required.' });
        }

        const { confirmation } = req.body as { confirmation: string };

        if (confirmation !== 'RESET') {
            return res.status(400).json({ error: 'Invalid confirmation. You must type RESET exactly.' });
        }

        const result = await factoryReset(actor.id);

        // Try to audit log (may fail if DB was wiped — that's OK)
        try {
            await logAction({
                userId: actor.id,
                action: 'FACTORY_RESET',
                entityType: 'SYSTEM',
                entityId: 'full-wipe',
                changes: { steps: result.steps, success: result.success },
                status: result.success ? 'SUCCESS' : 'FAILURE',
            });
        } catch (logErr) {
            console.log('[seed-management] Audit log skipped after factory reset (normal — DB was wiped).');
        }

        if (result.success) {
            res.json({ message: 'Factory reset completed. System is now empty.', result });
        } else {
            res.status(500).json({ error: result.error || 'Factory reset failed', result });
        }
    } catch (err: any) {
        console.error('FACTORY_RESET_ERROR:', err);
        res.status(500).json({ error: err.message || 'Factory reset failed' });
    }
};

// ─── POST /v1/seed/restore — Restore data from backup + sync Firebase ─────────
export const restoreAndSync = async (req: Request, res: Response) => {
    try {
        const actor = (req as any).user;
        if (actor?.role !== 'SUPERADMIN') {
            return res.status(403).json({ error: 'Forbidden. Superadmin access required.' });
        }

        const { filename, confirmation } = req.body as { filename: string; confirmation: string };

        if (confirmation !== 'RESTORE') {
            return res.status(400).json({ error: 'Invalid confirmation. You must type RESTORE exactly.' });
        }
        if (!filename) {
            return res.status(400).json({ error: 'No backup file selected.' });
        }

        const result = await restoreFromBackup(filename, actor.id);

        await logAction({
            userId: actor.id,
            action: 'SEED_RESTORE',
            entityType: 'SYSTEM',
            entityId: filename,
            changes: { steps: result.steps, success: result.success },
            status: result.success ? 'SUCCESS' : 'FAILURE',
        });

        if (result.success) {
            res.json({ message: 'Database restored and Firebase synced successfully', result });
        } else {
            res.status(500).json({ error: result.error || 'Restore failed', result });
        }
    } catch (err: any) {
        console.error('RESTORE_AND_SYNC_ERROR:', err);
        res.status(500).json({ error: err.message || 'Restore and sync failed' });
    }
};

// ─── GET /v1/seed/backups/:filename/download — Download a backup file ─────────
export const downloadBackup = (req: Request, res: Response) => {
    try {
        const actor = (req as any).user;
        if (actor?.role !== 'SUPERADMIN') {
            return res.status(403).json({ error: 'Forbidden. Superadmin access required.' });
        }

        const { filename } = req.params;
        // Sanitize filename to prevent path traversal. Param typed as string explicitly.
        const safeName = path.basename(String(filename));
        const filePath = path.join(BACKUP_DIR, safeName);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Backup file not found.' });
        }

        res.download(filePath, safeName);
    } catch (err: any) {
        console.error('DOWNLOAD_BACKUP_ERROR:', err);
        res.status(500).json({ error: err.message || 'Failed to download backup' });
    }
};
