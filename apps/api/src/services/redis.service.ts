import { createClient } from 'redis';
import { winstonLogger as logger } from '../lib/logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const client = createClient({ url: redisUrl });

client.on('error', (err) => logger.error('Redis Client Error', err));

let isConnected = false;
let connectionPromise: Promise<void> | null = null;

const connect = async () => {
    if (isConnected && client.isOpen) return;
    if (connectionPromise) return connectionPromise;

    connectionPromise = (async () => {
        try {
            if (!client.isOpen) {
                await client.connect();
            }
            isConnected = true;
            logger.info('Connected to Redis');
        } catch (err) {
            isConnected = false;
            logger.error('Failed to connect to Redis', err);
            throw err;
        } finally {
            connectionPromise = null;
        }
    })();

    return connectionPromise;
};

export const cacheService = {
    get: async (key: string) => {
        try {
            await connect();
            const value = await client.get(key);
            return value ? JSON.parse(value) : null;
        } catch {
            return null;
        }
    },
    set: async (key: string, value: any, ttl = 3600) => {
        try {
            await connect();
            await client.set(key, JSON.stringify(value), { EX: ttl });
        } catch (err) {
            logger.error('Redis Set Error', err);
        }
    },
    del: async (key: string) => {
        try {
            await connect();
            await client.del(key);
        } catch (err) {
            logger.error('Redis Del Error', err);
        }
    },
    delByPattern: async (pattern: string) => {
        try {
            await connect();
            let cursor: string = '0';
            let totalDeleted = 0;

            do {
                // Use scan to avoid blocking the event loop on large datasets
                // In node-redis v4+, cursor is a string, and scan returns { cursor: string, keys: string[] }
                const reply = await (client as any).scan(cursor, {
                    MATCH: pattern,
                    COUNT: 100 // Process in chunks of 100
                });

                cursor = reply.cursor;
                const keys = reply.keys;

                if (keys.length > 0) {
                    await client.del(keys);
                    totalDeleted += keys.length;
                }
            } while (cursor !== '0');

            if (totalDeleted > 0) {
                logger.info(`[Redis] Invalidated ${totalDeleted} keys for pattern: ${pattern}`);
            }
        } catch (err) {
            logger.error('Redis delByPattern Error', err);
        }
    },
    disconnect: async () => {
        if (client.isOpen) {
            await client.quit();
            isConnected = false;
            logger.info('Disconnected from Redis');
        }
    },
    getStatus: () => isConnected && client.isOpen ? 'online' : 'offline'
};
