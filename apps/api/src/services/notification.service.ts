import prisma from '../lib/prisma';
import { firebaseAdmin } from '../lib/firebase-admin';
import { socketService } from './socket.service';

export type NotificationCategory = 'ACADEMIC' | 'SOCIAL' | 'MAINTENANCE' | 'SYSTEM' | 'EXAM';

export interface NotificationPayload {
    userId: string;
    title: string;
    message: string;
    category: NotificationCategory;
    link?: string;
    metadata?: Record<string, any>;
}

export interface BroadcastBatchPayload {
    batchId: string;
    title: string;
    message: string;
    category: NotificationCategory;
    link?: string;
    metadata?: Record<string, any>;
}

export class NotificationService {
    /**
     * Master Dispatcher: Sends notification through preferred channels
     */
    static async send(payload: NotificationPayload) {
        const { userId, category } = payload;

        // 1. Fetch User Preferences
        let preferences = await prisma.notificationPreference.findUnique({
            where: { userId_category: { userId, category } }
        });

        // Default preferences if none set (everything ON)
        const activeChannels = preferences 
            ? (preferences.channels as any) 
            : { inApp: true, email: true, push: true };

        const results = {
            inApp: false,
            email: false,
            push: false
        };

        // 2. Dispatch to In-App Channel (Database + Socket)
        if (activeChannels.inApp) {
            results.inApp = await this.dispatchInApp(payload);
        }

        // 3. Dispatch to Push Channel (FCM)
        if (activeChannels.push) {
            results.push = await this.dispatchPush(payload);
        }

        // 4. Dispatch to Email Channel (SMTP Mock)
        if (activeChannels.email) {
            results.email = await this.dispatchEmail(payload);
        }

        return results;
    }

    private static async dispatchInApp(payload: NotificationPayload) {
        const notification = await prisma.notification.create({
            data: {
                userId: payload.userId,
                title: payload.title,
                message: payload.message,
                category: payload.category as any,
                link: payload.link
            }
        });

        socketService.emitToUser(payload.userId, 'notification:received', notification);
        
        await this.logDelivery(payload.userId, 'IN_APP', payload.category, { notificationId: notification.id });
        return true;
    }

    private static async dispatchPush(payload: NotificationPayload) {
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { fcmToken: true }
        });

        if (!user?.fcmToken) return false;

        try {
            await firebaseAdmin.messaging().send({
                token: user.fcmToken,
                notification: {
                    title: payload.title,
                    body: payload.message
                },
                data: {
                    category: payload.category,
                    link: payload.link || ''
                }
            });
            await this.logDelivery(payload.userId, 'PUSH', payload.category, { token: user.fcmToken });
            return true;
        } catch (error) {
            console.error('[NotificationService] Push Failed:', error);
            await this.logDelivery(payload.userId, 'PUSH', payload.category, { error: 'FCM_PROVIDER_ERROR' }, 'FAILED');
            return false;
        }
    }

    private static async dispatchEmail(payload: NotificationPayload) {
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { email: true }
        });

        if (!user?.email) return false;

        // SIMulated Email Dispatch
        console.log(`[NotificationService] Sending Email to ${user.email}: [${payload.category}] ${payload.title}`);
        
        await this.logDelivery(payload.userId, 'EMAIL', payload.category, { 
            to: user.email,
            subject: payload.title,
            body: payload.message 
        });
        
        return true;
    }

    private static async logDelivery(
        userId: string, 
        channel: string, 
        category: string, 
        payload: any, 
        status: string = 'SENT'
    ) {
        return prisma.notificationLog.create({
            data: {
                userId,
                channel,
                category,
                status,
                payload
            }
        });
    }

    /**
     * Update user preferences
     */
    static async updatePreferences(userId: string, category: NotificationCategory, channels: { email: boolean; push: boolean; inApp: boolean }) {
        return prisma.notificationPreference.upsert({
            where: { userId_category: { userId, category } },
            update: { channels },
            create: { userId, category, channels }
        });
    }

    /**
     * Get user preferences
     */
    static async getPreferences(userId: string) {
        return prisma.notificationPreference.findMany({
            where: { userId }
        });
    }

    /**
     * Broadcast to Batch: Sends notification to all students in a specific batch
     */
    static async broadcastToBatch(payload: BroadcastBatchPayload) {
        const { batchId, ...rest } = payload;

        // 1. Fetch all userIds for students in this batch
        const students = await prisma.student.findMany({
            where: { batchId },
            select: { userId: true }
        });

        const activeUserIds = students
            .map(s => s.userId)
            .filter((id): id is string => id !== null);

        if (activeUserIds.length === 0) return { deliveredCount: 0 };

        // 2. Dispatch notifications individually
        // Note: Using Promise.allSettled to ensure failure for one user doesn't block the rest
        const dispatchResults = await Promise.allSettled(
            activeUserIds.map(userId => this.send({ ...rest, userId }))
        );

        const deliveredCount = dispatchResults.filter(r => r.status === 'fulfilled').length;
        
        return { deliveredCount };
    }
}
