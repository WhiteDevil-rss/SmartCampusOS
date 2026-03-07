import prisma from '../lib/prisma';
import { firebaseAdmin } from '../lib/firebase-admin';
import { socketService } from './socket.service';

export class NotificationService {
    /**
     * Send a notification to a specific user
     */
    static async sendNotification(params: {
        userId: string;
        title: string;
        message: string;
        category: 'ACADEMIC' | 'ATTENDANCE' | 'FEES' | 'SYSTEM';
        link?: string;
        data?: Record<string, string>;
    }) {
        try {
            const { userId, title, message, category, link, data } = params;

            // 1. Save to Database
            const notification = await prisma.notification.create({
                data: {
                    userId,
                    title,
                    message,
                    category,
                    link
                }
            });

            // 2. Send Real-time via Socket.io
            // We'll use the existing socket rooms if the user is connected
            socketService.emitToUser(userId, 'notification:received', notification);

            // 3. Send Push Notification via FCM
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { fcmToken: true }
            });

            if (user?.fcmToken) {
                try {
                    await firebaseAdmin.messaging().send({
                        token: user.fcmToken,
                        notification: {
                            title,
                            body: message
                        },
                        data: {
                            ...data,
                            category,
                            link: link || ''
                        }
                    });
                } catch (fcmError) {
                    console.error('[NotificationService] FCM Error:', fcmError);
                    // Silently fail FCM if token is invalid or expired
                }
            }

            return notification;
        } catch (error) {
            console.error('[NotificationService] Send Error:', error);
            throw error;
        }
    }

    /**
     * Broadcast notification to all students in a batch
     */
    static async broadcastToBatch(params: {
        batchId: string;
        title: string;
        message: string;
        category: 'ACADEMIC' | 'ATTENDANCE' | 'FEES' | 'SYSTEM';
        link?: string;
    }) {
        try {
            const students = await prisma.student.findMany({
                where: { batchId: params.batchId },
                select: { email: true }
            });

            const emails = students.map(s => s.email);
            const users = await prisma.user.findMany({
                where: { email: { in: emails } },
                select: { id: true }
            });

            const notifications = await Promise.all(
                users.map(user => this.sendNotification({
                    ...params,
                    userId: user.id
                }))
            );

            return notifications;
        } catch (error) {
            console.error('[NotificationService] Broadcast Error:', error);
            throw error;
        }
    }
}
