'use client';

import { openDB, IDBPDatabase } from 'idb';

export interface OfflineMessage {
    id?: number;
    message_id: string;
    subject: string;
    body: string;
    type: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    sender_id: string;
    sender_name: string;
    recipient_id: string;
    sent_at: string;
    stored_at: string;
    accessed_at: string;
    expires_at: string;
    synced_to_server: boolean;
    pending_upload: boolean;
    status: string;
}

const DB_NAME = 'MessageHistoryDB';
const STORE_NAME = 'messages';
const VERSION = 1;

class OfflineMessageStore {
    private db: Promise<IDBPDatabase>;

    constructor() {
        this.db = openDB(DB_NAME, VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, {
                        keyPath: 'message_id'
                    });
                    store.createIndex('sent_at', 'sent_at');
                    store.createIndex('sender_id', 'sender_id');
                    store.createIndex('recipient_id', 'recipient_id');
                    store.createIndex('synced', 'synced_to_server');
                    store.createIndex('stored_at', 'stored_at');
                }
            },
        });
    }

    async saveMessage(message: Partial<OfflineMessage>) {
        const db = await this.db;
        const offlineMessage: OfflineMessage = {
            ...message as any,
            message_id: message.message_id || (message as any).id || crypto.randomUUID(),
            stored_at: new Date().toISOString(),
            accessed_at: new Date().toISOString(),
            synced_to_server: message.synced_to_server ?? navigator.onLine,
            pending_upload: message.pending_upload ?? !navigator.onLine,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
        return db.put(STORE_NAME, offlineMessage);
    }

    async getMessage(messageId: string): Promise<OfflineMessage | undefined> {
        const db = await this.db;
        return db.get(STORE_NAME, messageId);
    }

    async getPendingSyncMessages(): Promise<OfflineMessage[]> {
        const db = await this.db;
        return db.getAllFromIndex(STORE_NAME, 'synced', 0); // Boolean false mapped to 0
    }

    async markAsSynced(messageId: string) {
        const db = await this.db;
        const msg = await db.get(STORE_NAME, messageId);
        if (msg) {
            msg.synced_to_server = true;
            msg.pending_upload = false;
            await db.put(STORE_NAME, msg);
        }
    }

    async getAllMessages(options: { page?: number; limit?: number } = {}): Promise<OfflineMessage[]> {
        const db = await this.db;
        let results = await db.getAll(STORE_NAME);

        results.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());

        if (options.page && options.limit) {
            const start = (options.page - 1) * options.limit;
            results = results.slice(start, start + options.limit);
        }
        return results;
    }

    async deleteMessage(messageId: string) {
        const db = await this.db;
        return db.delete(STORE_NAME, messageId);
    }

    async cleanupExpired() {
        const db = await this.db;
        const all = await this.getAllMessages();
        const now = new Date();
        let count = 0;
        for (const msg of all) {
            if (new Date(msg.expires_at) < now && msg.synced_to_server) {
                await db.delete(STORE_NAME, msg.message_id);
                count++;
            }
        }
        return count;
    }

    async getStats() {
        const all = await this.getAllMessages();
        const pending = all.filter(m => !m.synced_to_server);
        return {
            total: all.length,
            pending_sync: pending.length,
            synced: all.length - pending.length,
            storage_used: new Blob([JSON.stringify(all)]).size
        };
    }
}

export const offlineStore = typeof window !== 'undefined' ? new OfflineMessageStore() : null;
