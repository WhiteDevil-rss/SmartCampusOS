import { firebaseAdmin } from '../lib/firebase-admin';
import prisma from '../lib/prisma';
import { logAction } from '../lib/logger';
import type { UserRecord } from 'firebase-admin/auth';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SyncOptions {
    /** Scope of the sync operation */
    scope: 'all' | 'by_role' | 'by_university' | 'by_department' | 'single_user';
    /** Role filter — used when scope is 'by_role' */
    role?: string;
    /** University ID filter — used when scope is 'by_university' */
    universityId?: string;
    /** Department ID filter — used when scope is 'by_department' */
    departmentId?: string;
    /** Single User ID — used when scope is 'single_user' */
    userId?: string;
    /** Dry-run mode: preview changes without writing to Firebase or DB */
    dryRun?: boolean;
    /** Remove Firebase accounts that have no matching DB user (default: false) */
    removeOrphans?: boolean;
}

export interface SyncUserResult {
    userId: string;
    email: string;
    action: 'skipped' | 'created' | 'updated' | 'failed';
    reason?: string;
    error?: string;
}

export interface SyncReport {
    dryRun: boolean;
    scope: string;
    scanned: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
    orphansFound: number;
    orphansRemoved: number;
    details: SyncUserResult[];
    errors: { userId: string; error: string }[];
    startedAt: string;
    finishedAt: string;
    durationMs: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

class FirebaseSyncService {

    /** Build Prisma `where` clause from SyncOptions */
    private buildWhere(opts: SyncOptions) {
        switch (opts.scope) {
            case 'by_role':
                return { role: opts.role };
            case 'by_university':
                return { universityId: opts.universityId };
            case 'by_department':
                return { entityId: opts.departmentId };
            case 'single_user':
                return { id: opts.userId };
            case 'all':
            default:
                return {};
        }
    }

    /**
     * Fetch all Firebase Auth users as a Map<email, UserRecord> for fast lookup.
     * Handles pagination via nextPageToken.
     */
    private async getFirebaseUserMap(): Promise<Map<string, UserRecord>> {
        const map = new Map<string, UserRecord>();
        let pageToken: string | undefined;

        do {
            const result = await firebaseAdmin.auth().listUsers(1000, pageToken);
            for (const user of result.users) {
                if (user.email) map.set(user.email.toLowerCase(), user);
                if (user.uid) map.set(`uid:${user.uid}`, user);
            }
            pageToken = result.pageToken;
        } while (pageToken);

        return map;
    }

    /**
     * Sync a single DB user against Firebase.
     * Returns a SyncUserResult describing the action taken.
     */
    private async syncUser(
        dbUser: { id: string; email: string; username: string; firebaseUid: string | null; isActive: boolean },
        firebaseMap: Map<string, UserRecord>,
        dryRun: boolean
    ): Promise<SyncUserResult> {
        const result: SyncUserResult = {
            userId: dbUser.id,
            email: dbUser.email,
            action: 'skipped',
        };

        try {
            // Look up existing Firebase record by uid or email
            const byUid = dbUser.firebaseUid ? firebaseMap.get(`uid:${dbUser.firebaseUid}`) : undefined;
            const byEmail = firebaseMap.get(dbUser.email.toLowerCase());
            const fbUser = byUid ?? byEmail;

            if (fbUser) {
                // ── Case 1: Firebase record exists → check if update needed ──────
                const needsEmailUpdate = fbUser.email?.toLowerCase() !== dbUser.email.toLowerCase();
                const needsDisplayUpdate = fbUser.displayName !== dbUser.username;
                const needsDisabledUpdate = fbUser.disabled !== !dbUser.isActive;
                const needsUidUpdate = dbUser.firebaseUid !== fbUser.uid;

                if (!needsEmailUpdate && !needsDisplayUpdate && !needsDisabledUpdate && !needsUidUpdate) {
                    result.action = 'skipped';
                    result.reason = 'Already in sync';
                    return result;
                }

                result.action = 'updated';
                result.reason = [
                    needsEmailUpdate && 'email',
                    needsDisplayUpdate && 'displayName',
                    needsDisabledUpdate && 'disabled',
                    needsUidUpdate && 'firebaseUid (DB)',
                ].filter(Boolean).join(', ');

                if (!dryRun) {
                    const update: Record<string, any> = {};
                    if (needsEmailUpdate) update.email = dbUser.email;
                    if (needsDisplayUpdate) update.displayName = dbUser.username;
                    if (needsDisabledUpdate) update.disabled = !dbUser.isActive;

                    if (Object.keys(update).length > 0) {
                        await firebaseAdmin.auth().updateUser(fbUser.uid, update);
                    }

                    // Sync uid back to DB if mismatched
                    if (needsUidUpdate) {
                        await prisma.user.update({
                            where: { id: dbUser.id },
                            data: { firebaseUid: fbUser.uid },
                        });
                    }
                }
            } else {
                // ── Case 2: No Firebase record → create ───────────────────────────
                result.action = 'created';
                result.reason = dbUser.firebaseUid
                    ? `Firebase UID ${dbUser.firebaseUid} not found in Firebase — re-creating`
                    : 'No Firebase account exists — creating';

                if (!dryRun) {
                    const newFbUser = await firebaseAdmin.auth().createUser({
                        email: dbUser.email,
                        displayName: dbUser.username,
                        disabled: !dbUser.isActive,
                        // Default password matching the app's fallback default (Welcome@123)
                        password: 'Welcome@123',
                    });

                    await prisma.user.update({
                        where: { id: dbUser.id },
                        data: { firebaseUid: newFbUser.uid },
                    });
                }
            }
        } catch (err: any) {
            result.action = 'failed';
            result.error = err.message ?? String(err);
        }

        return result;
    }

    /**
     * Main entry point. Runs the full sync based on `SyncOptions` and
     * returns a detailed `SyncReport`.
     */
    async runSync(opts: SyncOptions, actorId: string): Promise<SyncReport> {
        const startedAt = new Date();
        const report: SyncReport = {
            dryRun: opts.dryRun ?? false,
            scope: opts.scope + (opts.role ? `:${opts.role}` : '') + (opts.universityId ? `:${opts.universityId}` : '') + (opts.userId ? `:${opts.userId}` : ''),
            scanned: 0,
            created: 0,
            updated: 0,
            skipped: 0,
            failed: 0,
            orphansFound: 0,
            orphansRemoved: 0,
            details: [],
            errors: [],
            startedAt: startedAt.toISOString(),
            finishedAt: '',
            durationMs: 0,
        };

        // Fetch DB users scoped to the request
        const rawUsers = await prisma.user.findMany({
            where: this.buildWhere(opts),
            select: { id: true, email: true, username: true, firebaseUid: true, isActive: true },
        });

        // Filter out users with no email — they cannot be synced to Firebase Auth
        const dbUsers = rawUsers.filter((u): u is typeof u & { email: string } => u.email !== null);

        report.scanned = dbUsers.length;

        // Build a Firebase lookup map once (paginated, efficient)
        const firebaseMap = await this.getFirebaseUserMap();

        // Sync each DB user
        for (const dbUser of dbUsers) {
            const result = await this.syncUser(dbUser, firebaseMap, opts.dryRun ?? false);
            report.details.push(result);

            switch (result.action) {
                case 'created': report.created++; break;
                case 'updated': report.updated++; break;
                case 'skipped': report.skipped++; break;
                case 'failed':
                    report.failed++;
                    report.errors.push({ userId: result.userId, error: result.error ?? 'Unknown error' });
                    break;
            }
        }

        // ── Optional: Orphan removal ──────────────────────────────────────────
        // Only runs on full 'all' scope to avoid accidentally deleting valid accounts
        if (opts.removeOrphans && opts.scope === 'all') {
            const dbEmailSet = new Set(dbUsers.map(u => u.email.toLowerCase()));
            const dbUidSet = new Set(rawUsers.map(u => u.firebaseUid).filter(Boolean));

            let orphanPageToken: string | undefined;
            do {
                const page = await firebaseAdmin.auth().listUsers(1000, orphanPageToken);
                for (const fbUser of page.users) {
                    const emailMatch = fbUser.email && dbEmailSet.has(fbUser.email.toLowerCase());
                    const uidMatch = dbUidSet.has(fbUser.uid);

                    if (!emailMatch && !uidMatch) {
                        report.orphansFound++;
                        if (!opts.dryRun) {
                            await firebaseAdmin.auth().deleteUser(fbUser.uid).catch(err => {
                                report.errors.push({ userId: fbUser.uid, error: `Orphan delete failed: ${err.message}` });
                            });
                            report.orphansRemoved++;
                        }
                    }
                }
                orphanPageToken = page.pageToken;
            } while (orphanPageToken);
        }

        const finishedAt = new Date();
        report.finishedAt = finishedAt.toISOString();
        report.durationMs = finishedAt.getTime() - startedAt.getTime();

        // Audit log
        if (!opts.dryRun) {
            try {
                await logAction({
                    userId: actorId,
                    action: 'FIREBASE_SYNC',
                    entityType: 'SYSTEM',
                    entityId: 'firebase-auth',
                    changes: {
                        scope: report.scope,
                        scanned: report.scanned,
                        created: report.created,
                        updated: report.updated,
                        failed: report.failed,
                        orphansRemoved: report.orphansRemoved,
                    },
                    status: report.failed === 0 ? 'SUCCESS' : 'FAILURE',
                });
            } catch (logErr) {
                console.error('[firebase-sync] audit log failed:', logErr);
            }
        }

        return report;
    }
}

export const firebaseSyncService = new FirebaseSyncService();
