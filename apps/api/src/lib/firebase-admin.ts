import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;

if (serviceAccountPath) {
    if (!admin.apps.length) {
        try {
            const certData = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
            admin.initializeApp({
                credential: admin.credential.cert(certData),
            });
            console.log(`Firebase Admin: Initialized for project: ${certData.project_id}`);
        } catch (error: any) {
            console.error('Firebase Admin: Initialization failed:', error.message);
        }
    }
} else {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    }
}

export const firebaseAdmin = admin;
