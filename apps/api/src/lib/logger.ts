import winston from 'winston';
import 'winston-daily-rotate-file';
import prisma from './prisma';
import path from 'path';

// ── Winston File Logger Setup ────────────────────────────────────────────────
const fileTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
});

const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    ),
});

export const winstonLogger = winston.createLogger({
    level: 'info',
    transports: [fileTransport, consoleTransport],
});

// ── Enterprise Log Interface ──────────────────────────────────────────────────
export interface LogParams {
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    changes?: any;
    status: 'SUCCESS' | 'FAILURE';
    endpoint?: string;
    method?: string;
    durationMs?: number;
    ipAddress?: string;
    userAgent?: string;
    errorMessage?: string;
    transactionHash?: string;
    blockNumber?: number;
    isVerified?: boolean;
}

/**
 * Enterprise Logger: Writes to both winston (files) and Prisma (database).
 * Executes asynchronously to prevent blocking the main API response thread.
 */
export function logAction(params: LogParams) {
    // Fire-and-forget execution to ensure zero performance hit on HTTP responses
    setImmediate(async () => {
        try {
            // 1. Log to File
            const logLevel = params.status === 'SUCCESS' ? 'info' : 'error';
            winstonLogger.log(logLevel, params.action, {
                ...params,
                timestamp: new Date().toISOString()
            });

            // Auto-Verify Critical Actions on "Blockchain" (Simulated)
            const isCritical = 
                params.method !== 'GET' && 
                (params.action.includes('UNIVERSITY') || 
                 params.action.includes('PERMISSION') || 
                 params.action.includes('USER') || 
                 params.status === 'FAILURE');

            let blockchainData = {
                transactionHash: params.transactionHash,
                blockNumber: params.blockNumber,
                isVerified: params.isVerified ?? false
            };

            if (isCritical && !blockchainData.transactionHash && params.status === 'SUCCESS') {
                // Generate a deterministic hash for simulation
                const payload = JSON.stringify({ action: params.action, actor: params.userId, time: Date.now() });
                blockchainData.transactionHash = '0x' + Buffer.from(payload).toString('hex').slice(0, 64);
                blockchainData.blockNumber = Math.floor(18000000 + Math.random() * 100000);
                blockchainData.isVerified = true;
            }

            // 2. Log to Database
            await (prisma.auditLog.create as any)({
                data: {
                    userId: params.userId,
                    action: params.action,
                    entityType: params.entityType,
                    entityId: params.entityId,
                    changes: params.changes || {},
                    status: params.status,
                    endpoint: params.endpoint,
                    method: params.method,
                    durationMs: params.durationMs,
                    ipAddress: params.ipAddress,
                    userAgent: params.userAgent,
                    transactionHash: blockchainData.transactionHash,
                    blockNumber: blockchainData.blockNumber,
                    isVerified: blockchainData.isVerified,
                }
            });

        } catch (error) {
            // Fallback if DB logging fails
            console.error('CRITICAL: Audit logging to database failed!', error);
            winstonLogger.error('Audit logging failed', { error, originalParams: params });
        }
    });
}

/**
 * Backward-compatible adapter for legacy modules using `logActivity`.
 * Automatically maps to the enterprise `logAction` function.
 */
export const logActivity = (
    userId: string | undefined,
    role: string,
    action: string,
    details?: any
) => {
    logAction({
        userId,
        action,
        changes: { role, ...details },
        status: action.includes('FAILED') || action.includes('ERROR') ? 'FAILURE' : 'SUCCESS',
    });
};
