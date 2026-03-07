import { firebaseAdmin } from '../src/lib/firebase-admin';

async function clearFirebase() {
    console.log('Fetching all Firebase users...');
    try {
        let nextPageToken;
        let count = 0;

        do {
            const listUsersResult = await firebaseAdmin.auth().listUsers(1000, nextPageToken);
            const users = listUsersResult.users;

            if (users.length > 0) {
                const uids = users.map(user => user.uid);
                await firebaseAdmin.auth().deleteUsers(uids);
                count += uids.length;
                console.log(`Deleted ${uids.length} users in this batch...`);
            }

            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);

        console.log(`Successfully cleared ${count} users from Firebase Auth.`);
        process.exit(0);
    } catch (error) {
        console.error('Error clearing Firebase users:', error);
        process.exit(1);
    }
}

clearFirebase();
