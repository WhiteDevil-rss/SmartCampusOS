import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import prisma from '../lib/prisma';
import { firebaseAdmin } from '../lib/firebase-admin';
import { firebaseSyncService } from './firebase-sync.service';

const execPromise = util.promisify(exec);

// ─── Constants ───────────────────────────────────────────────────────────────
const BACKUP_DIR = path.resolve(__dirname, '../../../seed-backups');
const API_DIR = path.resolve(__dirname, '../../');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface BackupMeta {
    filename: string;
    displayName: string;
    sizeBytes: number;
    sizeDisplay: string;
    createdAt: string;
    version: string;
    createdById: string;
    createdByName: string;
    tableCount: number;
    totalRecords: number;
}

export interface FactoryResetResult {
    success: boolean;
    steps: {
        label: string;
        status: 'done' | 'failed';
        detail?: string;
    }[];
    error?: string;
}

export type RestoreResult = FactoryResetResult;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function wipeFirebaseUsers(): Promise<number> {
    let deleted = 0;
    let pageToken: string | undefined;
    do {
        const page = await firebaseAdmin.auth().listUsers(1000, pageToken);
        if (page.users.length > 0) {
            const uids = page.users.map(u => u.uid);
            await firebaseAdmin.auth().deleteUsers(uids);
            deleted += uids.length;
        }
        pageToken = page.pageToken;
    } while (pageToken);
    return deleted;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Dumps the entire current database state into a timestamped JSON file.
 */
export async function createBackup(actorId: string, actorName: string): Promise<BackupMeta> {
    // Collect all data
    const [
        users,
        universities,
        departments,
        faculty,
        facultyDepartments,
        facultySubjects,
        courses,
        batches,
        resources,
        programs,
        settings,
        timetables,
        timetableSlots,
    ] = await Promise.all([
        prisma.user.findMany(),
        prisma.university.findMany(),
        prisma.department.findMany(),
        prisma.faculty.findMany(),
        prisma.facultyDepartment.findMany(),
        prisma.facultySubject.findMany(),
        prisma.course.findMany(),
        prisma.batch.findMany(),
        prisma.resource.findMany(),
        prisma.program.findMany(),
        prisma.globalSettings.findMany(),
        prisma.timetable.findMany(),
        prisma.timetableSlot.findMany(),
    ]);

    const totalRecords =
        users.length + universities.length + departments.length + faculty.length +
        facultyDepartments.length + facultySubjects.length + courses.length +
        batches.length + resources.length + programs.length + settings.length +
        timetables.length + timetableSlots.length;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const version = `v${timestamp}`;
    const filename = `seed-backup-${timestamp}.json`;
    const filePath = path.join(BACKUP_DIR, filename);

    const backupData = {
        meta: {
            version,
            filename,
            createdAt: new Date().toISOString(),
            createdById: actorId,
            createdByName: actorName,
            totalRecords,
            tableCount: 13,
            applicationVersion: '1.0.0',
        },
        data: {
            users,
            universities,
            departments,
            faculty,
            facultyDepartments,
            facultySubjects,
            courses,
            batches,
            resources,
            programs,
            settings,
            timetables,
            timetableSlots,
        },
    };

    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf-8');
    const stats = fs.statSync(filePath);

    return {
        filename,
        displayName: `Backup — ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} by ${actorName}`,
        sizeBytes: stats.size,
        sizeDisplay: formatBytes(stats.size),
        createdAt: new Date().toISOString(),
        version,
        createdById: actorId,
        createdByName: actorName,
        tableCount: 13,
        totalRecords,
    };
}

/**
 * Returns metadata for all available backup files, sorted newest first.
 */
export function listBackups(): BackupMeta[] {
    if (!fs.existsSync(BACKUP_DIR)) return [];

    return fs
        .readdirSync(BACKUP_DIR)
        .filter(f => f.endsWith('.json'))
        .map(filename => {
            const filePath = path.join(BACKUP_DIR, filename);
            const stats = fs.statSync(filePath);
            try {
                const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                const meta = raw.meta ?? {};
                return {
                    filename,
                    displayName: `${meta.createdAt ? new Date(meta.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : filename} — by ${meta.createdByName ?? 'Unknown'}`,
                    sizeBytes: stats.size,
                    sizeDisplay: formatBytes(stats.size),
                    createdAt: meta.createdAt ?? stats.birthtime.toISOString(),
                    version: meta.version ?? 'unknown',
                    createdById: meta.createdById ?? '',
                    createdByName: meta.createdByName ?? 'Unknown',
                    tableCount: meta.tableCount ?? 0,
                    totalRecords: meta.totalRecords ?? 0,
                } as BackupMeta;
            } catch {
                return {
                    filename,
                    displayName: filename,
                    sizeBytes: stats.size,
                    sizeDisplay: formatBytes(stats.size),
                    createdAt: stats.birthtime.toISOString(),
                    version: 'unknown',
                    createdById: '',
                    createdByName: 'Unknown',
                    tableCount: 0,
                    totalRecords: 0,
                } as BackupMeta;
            }
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Factory Reset: Complete destructive wipe of ALL database data and ALL Firebase Auth users.
 * Step 1 — Clear ALL database tables in reverse FK order (atomic transaction).
 * Step 2 — Delete ALL Firebase Authentication accounts.
 * Leaves system completely empty. Use 'Restore & Seed Data' to repopulate afterwards.
 */
export async function factoryReset(actorId: string): Promise<FactoryResetResult> {
    const result: FactoryResetResult = { success: false, steps: [] };

    // ─── Step 1: Clear all database data (reverse FK order) ───────────────────
    try {
        await prisma.$transaction([
            prisma.timetableSlot.deleteMany(),
            prisma.timetable.deleteMany(),
            prisma.facultySubject.deleteMany(),
            prisma.facultyDepartment.deleteMany(),
            prisma.faculty.deleteMany(),
            prisma.course.deleteMany(),
            prisma.batch.deleteMany(),
            prisma.resource.deleteMany(),
            prisma.department.deleteMany(),
            prisma.university.deleteMany(),
            prisma.auditLog.deleteMany(),
            prisma.user.deleteMany(),
            prisma.globalSettings.deleteMany(),
        ]);
        result.steps.push({
            label: 'Clear All Database Data',
            status: 'done',
            detail: 'All tables wiped in dependency-safe order',
        });
    } catch (err: any) {
        result.steps.push({ label: 'Clear All Database Data', status: 'failed', detail: err.message });
        result.error = 'Failed to clear database — system may be in a partial state';
        return result;
    }

    // ─── Step 2: Wipe all Firebase Auth users ─────────────────────────────────
    try {
        const deleted = await wipeFirebaseUsers();
        result.steps.push({
            label: 'Delete All Firebase Auth Users',
            status: 'done',
            detail: `Deleted ${deleted} Firebase account${deleted !== 1 ? 's' : ''}`,
        });
    } catch (err: any) {
        result.steps.push({ label: 'Delete All Firebase Auth Users', status: 'failed', detail: err.message });
        result.error = 'Database cleared but Firebase Auth wipe failed — manually delete users in Firebase Console';
    }

    result.success = result.steps.every(s => s.status === 'done');
    return result;
}

export async function restoreFromBackup(filename: string, actorId: string): Promise<RestoreResult> {
    const filePath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(filePath)) {
        return { success: false, steps: [], error: `Backup file not found: ${filename}` };
    }

    const result: RestoreResult = { success: false, steps: [] };

    // ─── Step 1: Validate backup ──────────────────────────────────────────────
    let backupData: any;
    try {
        backupData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (!backupData.data || typeof backupData.data !== 'object') {
            throw new Error('Backup file is missing or has invalid "data" section');
        }
        const d = backupData.data;
        if (!d.users && !d.universities) {
            throw new Error('Backup appears empty or corrupt (no users/universities)');
        }
        result.steps.push({
            label: 'Validate Backup File',
            status: 'done',
            detail: `${filename} — ${backupData.meta?.totalRecords ?? '?'} records, by ${backupData.meta?.createdByName ?? 'unknown'}`,
        });
    } catch (err: any) {
        result.steps.push({ label: 'Validate Backup File', status: 'failed', detail: err.message });
        result.error = 'Backup file invalid or missing';
        return result;
    }

    // ─── Step 2: Clear current data (reverse FK order) ────────────────────────
    try {
        await prisma.$transaction([
            prisma.timetableSlot.deleteMany(),
            prisma.timetable.deleteMany(),
            prisma.facultySubject.deleteMany(),
            prisma.facultyDepartment.deleteMany(),
            prisma.faculty.deleteMany(),
            prisma.course.deleteMany(),
            prisma.batch.deleteMany(),
            prisma.resource.deleteMany(),
            prisma.department.deleteMany(),
            prisma.university.deleteMany(),
            prisma.auditLog.deleteMany(),
            prisma.user.deleteMany(),
            prisma.globalSettings.deleteMany(),
        ]);
        result.steps.push({ label: 'Clear Existing Data', status: 'done', detail: 'All tables cleared in safe order' });
    } catch (err: any) {
        result.steps.push({ label: 'Clear Existing Data', status: 'failed', detail: err.message });
        result.error = 'Failed to clear existing data';
        return result;
    }

    // ─── Step 3: Restore data (FK order) ──────────────────────────────────────
    try {
        const d = backupData.data;
        if (d.users?.length) await prisma.user.createMany({ data: d.users.map((u: any) => ({ ...u, lastLogin: u.lastLogin ? new Date(u.lastLogin) : null, createdAt: u.createdAt ? new Date(u.createdAt) : new Date() })), skipDuplicates: true });
        if (d.universities?.length) await prisma.university.createMany({ data: d.universities.map((u: any) => ({ ...u, createdAt: new Date(u.createdAt), updatedAt: new Date(u.updatedAt) })), skipDuplicates: true });
        if (d.departments?.length) await prisma.department.createMany({ data: d.departments.map((u: any) => ({ ...u, createdAt: new Date(u.createdAt) })), skipDuplicates: true });
        if (d.resources?.length) await prisma.resource.createMany({ data: d.resources.map((r: any) => ({ ...r, createdAt: new Date(r.createdAt) })), skipDuplicates: true });
        if (d.batches?.length) await prisma.batch.createMany({ data: d.batches.map((b: any) => ({ ...b, createdAt: new Date(b.createdAt) })), skipDuplicates: true });
        if (d.courses?.length) await prisma.course.createMany({ data: d.courses.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt) })), skipDuplicates: true });
        if (d.faculty?.length) await prisma.faculty.createMany({ data: d.faculty.map((f: any) => ({ ...f, createdAt: new Date(f.createdAt) })), skipDuplicates: true });
        if (d.facultyDepartments?.length) await prisma.facultyDepartment.createMany({ data: d.facultyDepartments, skipDuplicates: true });
        if (d.facultySubjects?.length) await prisma.facultySubject.createMany({ data: d.facultySubjects, skipDuplicates: true });
        if (d.programs?.length) await prisma.program.createMany({ data: d.programs, skipDuplicates: true });
        if (d.settings?.length) { for (const s of d.settings) await prisma.globalSettings.upsert({ where: { id: s.id }, update: s, create: s }); }
        if (d.timetables?.length) await prisma.timetable.createMany({ data: d.timetables.map((t: any) => ({ ...t, createdAt: new Date(t.createdAt) })), skipDuplicates: true });
        if (d.timetableSlots?.length) await prisma.timetableSlot.createMany({ data: d.timetableSlots, skipDuplicates: true });

        const count = (d.users?.length ?? 0) + (d.universities?.length ?? 0) + (d.departments?.length ?? 0) +
            (d.resources?.length ?? 0) + (d.batches?.length ?? 0) + (d.courses?.length ?? 0) +
            (d.faculty?.length ?? 0) + (d.facultyDepartments?.length ?? 0);
        result.steps.push({ label: 'Restore Data from Backup', status: 'done', detail: `${count} records restored across all tables` });
    } catch (err: any) {
        result.steps.push({ label: 'Restore Data from Backup', status: 'failed', detail: err.message });
        result.error = 'Failed to restore data — system may be in inconsistent state';
        return result;
    }

    // ─── Step 4: Sync Firebase Auth ───────────────────────────────────────────
    try {
        const syncReport = await firebaseSyncService.runSync({ scope: 'all', dryRun: false }, actorId);
        result.steps.push({
            label: 'Sync Users to Firebase Auth',
            status: 'done',
            detail: `Created: ${syncReport.created}, Updated: ${syncReport.updated}, Skipped: ${syncReport.skipped}, Failed: ${syncReport.failed}`,
        });
    } catch (err: any) {
        result.steps.push({ label: 'Sync Users to Firebase Auth', status: 'failed', detail: err.message });
        result.error = 'Data restored but Firebase sync failed — run manual sync from settings to fix login';
    }

    result.success = result.steps.every(s => s.status === 'done');
    return result;
}
