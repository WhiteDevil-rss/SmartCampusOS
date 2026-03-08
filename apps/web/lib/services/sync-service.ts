import { api } from '../api';
import { offlineStore, OfflineMessage } from './offline-store';

class MessageSyncService {
    private isSyncing = false;
    private syncInterval: NodeJS.Timeout | null = null;
    private retryAttempts = 3;

    constructor() {
        if (typeof window !== 'undefined') {
            this.setupNetworkListeners();
        }
    }

    private setupNetworkListeners() {
        window.addEventListener('online', () => {
            console.log('🟢 Network: Online — Starting sync...');
            this.sync();
        });
        window.addEventListener('offline', () => {
            console.log('🔴 Network: Offline — Messages will be saved locally');
        });
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && navigator.onLine) {
                this.sync();
            }
        });
    }

    startSync(intervalMs = 300000) { // 5 minutes per spec
        if (this.syncInterval) return;
        this.syncInterval = setInterval(() => this.sync(), intervalMs);
        this.sync();
    }

    stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    async sync() {
        if (this.isSyncing || !offlineStore || !navigator.onLine) return;
        this.isSyncing = true;

        try {
            // Upload pending
            const pending = await offlineStore.getPendingSyncMessages();
            for (const msg of pending) {
                try {
                    const response = await api.post('/v2/history/sync/upload', {
                        message_data: msg,
                        offline_log_id: msg.message_id
                    });
                    if (response.data.success) {
                        await offlineStore.markAsSynced(msg.message_id);
                    }
                } catch (err) {
                    console.error(`Failed to upload message ${msg.message_id}`, err);
                }
            }

            // Download new
            const all = await offlineStore.getAllMessages();
            const lastSyncAt = all.length > 0 ? all[0].sent_at : new Date(0).toISOString();

            const remoteResponse = await api.get(`/v2/history/sync/download?since=${lastSyncAt}`);
            const remoteMessages = remoteResponse.data.messages;

            if (remoteMessages && remoteMessages.length > 0) {
                for (const msg of remoteMessages) {
                    await offlineStore.saveMessage({
                        message_id: msg.id,
                        subject: msg.title,
                        body: msg.content,
                        type: msg.type || 'NOTIFICATION',
                        category: msg.category || 'SYSTEM',
                        sender_name: 'University',
                        sent_at: msg.createdAt,
                        synced_to_server: true,
                        pending_upload: false,
                        status: 'RECEIVED'
                    });
                }
            }

            // Cleanup
            await offlineStore.cleanupExpired();

        } catch (error) {
            console.error('Message Sync Error:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    async logLocalMessage(message: Partial<OfflineMessage>) {
        if (!offlineStore) return;
        await offlineStore.saveMessage({
            ...message,
            sent_at: new Date().toISOString()
        });
        this.sync();
    }
}

export const syncService = new MessageSyncService();
