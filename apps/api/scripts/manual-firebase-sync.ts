import { PrismaClient } from '@prisma/client';
import { firebaseSyncService } from '../src/services/firebase-sync.service';
import dotenv from 'dotenv';
import path from 'path';

// Ensure environment is loaded so Firebase Admin configures correctly
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Manual Firebase Sync ---');

    try {
        // Run sync in LIVE mode for ALL users
        const report = await firebaseSyncService.runSync({
            scope: 'all',
            dryRun: false,
            removeOrphans: true, // You can configure this as needed
        }, 'SYSTEM_CLI');

        console.log('\n--- Sync Report ---');
        console.log(`Duration: ${report.durationMs}ms`);
        console.log(`Scanned Database Users: ${report.scanned}`);
        console.log(`Created in Firebase: ${report.created}`);
        console.log(`Updated in Firebase: ${report.updated}`);
        console.log(`Skipped (Already Synced): ${report.skipped}`);
        console.log(`Failed Syncs: ${report.failed}`);
        console.log(`Orphaned Firebase Users Removed: ${report.orphansFound}`);

        if (report.errors.length > 0) {
            console.log('\n--- Errors ---');
            report.errors.forEach(e => {
                console.error(`- User ${e.userId}: ${e.error}`);
            });
        }

        console.log('\n--- Manual Sync Complete ---');
    } catch (e: any) {
        console.error('CRITICAL ERROR:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
