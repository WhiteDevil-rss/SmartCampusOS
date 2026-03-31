import { createClient } from 'redis';
import { winstonLogger as logger } from '../lib/logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const client = createClient({ url: redisUrl });

client.on('error', (err) => logger.error('Redis Client Error', err));

let isConnected = false;

const connect = async () => {
    if (isConnected) return;
    try {
        await client.connect();
        isConnected = true;
        logger.info('Connected to Redis');
    } catch (err) {
        logger.error('Failed to connect to Redis', err);
    }
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
    }
};
