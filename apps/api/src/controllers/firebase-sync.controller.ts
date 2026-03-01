import { Request, Response } from 'express';
import { firebaseSyncService, SyncOptions } from '../services/firebase-sync.service';

const VALID_SCOPES = ['all', 'by_role', 'by_university', 'by_department', 'single_user'] as const;

function validateOptions(body: any): { valid: boolean; error?: string; opts?: SyncOptions } {
    const scope = body.scope;
    if (!scope || !VALID_SCOPES.includes(scope)) {
        return { valid: false, error: `Invalid scope. Must be one of: ${VALID_SCOPES.join(', ')}` };
    }
    if (scope === 'by_role' && !body.role) return { valid: false, error: 'role is required for scope=by_role' };
    if (scope === 'by_university' && !body.universityId) return { valid: false, error: 'universityId is required for scope=by_university' };
    if (scope === 'by_department' && !body.departmentId) return { valid: false, error: 'departmentId is required for scope=by_department' };
    if (scope === 'single_user' && !body.userId) return { valid: false, error: 'userId is required for scope=single_user' };

    return {
        valid: true,
        opts: {
            scope,
            role: body.role,
            universityId: body.universityId,
            departmentId: body.departmentId,
            userId: body.userId,
            dryRun: Boolean(body.dryRun),
            removeOrphans: Boolean(body.removeOrphans),
        },
    };
}

/** POST /v1/firebase-sync/run */
export async function runSync(req: Request, res: Response) {
    const { valid, error, opts } = validateOptions(req.body);
    if (!valid || !opts) return res.status(400).json({ error });

    try {
        const actorId = (req as any).user?.id ?? 'system';
        const report = await firebaseSyncService.runSync(opts, actorId);
        return res.json({ success: true, report });
    } catch (err: any) {
        console.error('[firebase-sync] runSync error:', err);
        return res.status(500).json({ error: 'Firebase sync failed', detail: err.message });
    }
}

/** POST /v1/firebase-sync/dry-run  (always forces dryRun: true) */
export async function dryRunSync(req: Request, res: Response) {
    const { valid, error, opts } = validateOptions({ scope: 'all', ...req.body, dryRun: true });
    if (!valid || !opts) return res.status(400).json({ error });

    try {
        const actorId = (req as any).user?.id ?? 'system';
        const report = await firebaseSyncService.runSync(opts, actorId);
        return res.json({ success: true, report });
    } catch (err: any) {
        console.error('[firebase-sync] dryRunSync error:', err);
        return res.status(500).json({ error: 'Firebase dry-run sync failed', detail: err.message });
    }
}
