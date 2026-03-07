import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { socketService } from '../services/socket.service';

export const getThreads = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const threads = await prisma.chatThread.findMany({
            where: {
                participants: {
                    some: { id: userId }
                }
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        username: true,
                        role: true,
                        faculty: { select: { name: true } },
                        university: { select: { name: true } }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.json(threads);
    } catch (error) {
        console.error('Get Threads Error:', error);
        res.status(500).json({ error: 'Failed to fetch threads' });
    }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const threadId = req.params.threadId as string;
        const userId = req.user?.id;

        const thread = await prisma.chatThread.findUnique({
            where: { id: threadId },
            include: { participants: true }
        });

        if (!thread || !thread.participants.find(p => p.id === userId)) {
            return res.status(403).json({ error: 'Unauthorized viewing of thread' });
        }

        const messages = await prisma.message.findMany({
            where: { threadId },
            include: {
                sender: {
                    select: { id: true, username: true, role: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(messages);
    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const threadId = req.body.threadId as string;
        const { content, type = 'TEXT', fileUrl } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const thread = await prisma.chatThread.findUnique({
            where: { id: threadId },
            include: { participants: true }
        }) as any;

        if (!thread || !thread.participants.find((p: any) => p.id === userId)) {
            return res.status(403).json({ error: 'Unauthorized thread participant' });
        }

        const message = await prisma.message.create({
            data: {
                threadId,
                senderId: userId,
                content,
                type,
                fileUrl
            },
            include: {
                sender: {
                    select: { id: true, username: true, role: true }
                }
            }
        });

        // Update thread's updatedAt field
        await prisma.chatThread.update({
            where: { id: threadId },
            data: { updatedAt: new Date() }
        });

        // Emit real-time notification to other participants
        thread.participants.forEach((participant: any) => {
            if (participant.id !== userId) {
                socketService.emitToUser(participant.id, 'new_message', {
                    threadId,
                    message
                });
            }
        });

        res.json(message);
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

export const createThread = async (req: AuthRequest, res: Response) => {
    try {
        const { participantIds, title, type = 'DIRECT' } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Ensure all participants exist
        const participants = await prisma.user.findMany({
            where: { id: { in: [...participantIds, userId] } }
        });

        if (participants.length < 2) {
            return res.status(400).json({ error: 'At least two valid participants required' });
        }

        const thread = await prisma.chatThread.create({
            data: {
                title,
                type,
                participants: {
                    connect: participants.map(p => ({ id: p.id }))
                }
            },
            include: {
                participants: {
                    select: { id: true, username: true, role: true }
                }
            }
        });

        res.json(thread);
    } catch (error) {
        console.error('Create Thread Error:', error);
        res.status(500).json({ error: 'Failed to create thread' });
    }
};
