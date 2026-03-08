import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.json(notifications);
    } catch (error) {
        console.error('Get Notifications Error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { notificationIds } = req.body; // Array of IDs or null for "all"

        if (notificationIds && Array.isArray(notificationIds)) {
            await prisma.notification.updateMany({
                where: {
                    id: { in: notificationIds },
                    userId
                },
                data: { isRead: true }
            });
        } else {
            await prisma.notification.updateMany({
                where: { userId },
                data: { isRead: true }
            });
        }

        res.json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ error: 'Failed to update notifications' });
    }
};

export const updateFcmToken = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { token } = req.body;

        await prisma.user.update({
            where: { id: userId },
            data: { fcmToken: token }
        });

        res.json({ message: 'FCM token updated successfully' });
    } catch (error) {
        console.error('Update FCM Token Error:', error);
        res.status(500).json({ error: 'Failed to update FCM token' });
    }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const id = req.params.id as string;

        await prisma.notification.delete({
            where: { id: id as string, userId }
        });

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete Notification Error:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
};

export const broadcastNotification = async (req: AuthRequest, res: Response) => {
    try {
        const { title, message, category, targetType, targetRoleId, targetUserId, link } = req.body;

        // Input validation
        if (!title || !message || !category || !targetType) {
            return res.status(400).json({ error: 'Missing required broadcast fields' });
        }

        const sender = req.user!;
        let where: any = {
            isActive: true,
            id: { not: sender.id }
        };

        // 1. Scoping by Sender's Role
        if (sender.role === 'UNI_ADMIN') {
            where.universityId = sender.universityId;
        } else if (sender.role === 'DEPT_ADMIN') {
            where.universityId = sender.universityId;
            // Scoping students and faculty specifically to this department
            const deptId = sender.entityId;
            if (!deptId) return res.status(400).json({ error: 'Department ID not found in sender profile' });

            if (targetType === 'ALL' || targetRoleId === 'STUDENT' || targetRoleId === 'FACULTY') {
                // Determine valid entity IDs in this department
                const [students, facultyDepts] = await Promise.all([
                    prisma.student.findMany({ where: { departmentId: deptId }, select: { id: true } }),
                    prisma.facultyDepartment.findMany({ where: { departmentId: deptId }, select: { facultyId: true } })
                ]);

                const studentEntityIds = students.map(s => s.id);
                const facultyEntityIds = facultyDepts.map(fd => fd.facultyId);

                if (targetType === 'ALL') {
                    where.OR = [
                        { role: 'STUDENT', entityId: { in: studentEntityIds } },
                        { role: 'FACULTY', entityId: { in: facultyEntityIds } }
                    ];
                } else if (targetRoleId === 'STUDENT') {
                    where.role = 'STUDENT';
                    where.entityId = { in: studentEntityIds };
                } else if (targetRoleId === 'FACULTY') {
                    where.role = 'FACULTY';
                    where.entityId = { in: facultyEntityIds };
                }
            } else if (targetType === 'ROLE') {
                // If targeting other roles (like DEPT_ADMIN or UNI_ADMIN), 
                // Dept Admins generally shouldn't broadcast to them, or should only see same-uni users.
                // For now, restrict to Stud/Faculty unless Super/Uni admin.
                return res.status(403).json({ error: 'Department Admins can only broadcast to Students and Faculty' });
            }
        }

        // 2. Applying Original Target Filters (Refined)
        if (targetType === 'USER') {
            if (!targetUserId) return res.status(400).json({ error: 'targetUserId is required for USER broadcast' });
            where.id = targetUserId;
        } else if (targetType === 'ROLE') {
            if (!targetRoleId) return res.status(400).json({ error: 'targetRoleId is required for ROLE broadcast' });
            where.role = targetRoleId;
        }

        const users = await prisma.user.findMany({
            where,
            select: { id: true, fcmToken: true }
        });

        if (users.length === 0) {
            return res.status(404).json({ error: 'No users found matching the broadcast criteria' });
        }

        // Create the notifications in bulk
        const notificationData = users.map(user => ({
            userId: user.id,
            title,
            message,
            category,
            link: link || null,
            isRead: false
        }));

        await prisma.notification.createMany({
            data: notificationData
        });

        // Log this broadcast in the SENDER'S history as well
        try {
            await prisma.messageHistory.create({
                data: {
                    userId: req.user!.id,
                    title: `[BROADCAST] ${title}`,
                    content: message,
                    type: 'BROADCAST',
                    link: link || null,
                    source: 'manual-broadcast',
                    createdAt: new Date()
                }
            });
        } catch (historyError) {
            console.warn('Failed to log broadcast to sender history:', historyError);
        }

        // Here we ideally invoke socketService to push the notification or FCM explicitly
        // Since socket instance handles fetching, they'll see it actively or on next fetch.

        res.json({ message: 'Broadcast successful', recipientsCount: users.length });
    } catch (error) {
        console.error('Broadcast Notification Error:', error);
        res.status(500).json({ error: 'Failed to broadcast notification' });
    }
};
