import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { firebaseAdmin } from '../lib/firebase-admin';
import prisma from '../lib/prisma';

class SocketService {
    private io: Server | null = null;
    private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds[]

    initialize(server: HttpServer) {
        this.io = new Server(server, {
            cors: {
                origin: (origin, callback) => callback(null, true), // Development permissive
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        const notificationsNs = this.io.of('/notifications');

        // Middleware for authentication
        notificationsNs.use(async (socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication error'));

            try {
                const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
                const { uid, email } = decodedToken;

                const user = await prisma.user.findFirst({
                    where: { OR: [{ firebaseUid: uid }, { email: email }] }
                });

                if (!user) return next(new Error('User not found'));

                (socket as any).user = user;
                next();
            } catch (err) {
                return next(new Error('Invalid token'));
            }
        });

        notificationsNs.on('connection', (socket: Socket) => {
            const user = (socket as any).user;
            const userId = user.id;

            // Track user sockets
            const currentSockets = this.userSockets.get(userId) || [];
            this.userSockets.set(userId, [...currentSockets, socket.id]);

            // Join personal room
            socket.join(`user-${userId}`);

            // Join role-based rooms
            if (user.role === 'FACULTY') socket.join(`role-faculty`);
            if (user.role === 'STUDENT') socket.join(`role-student`);

            console.log(`[Socket.io] User ${userId} connected to notifications`);

            socket.on('disconnect', () => {
                const updatedSockets = (this.userSockets.get(userId) || []).filter(id => id !== socket.id);
                if (updatedSockets.length > 0) {
                    this.userSockets.set(userId, updatedSockets);
                } else {
                    this.userSockets.delete(userId);
                }
            });
        });

        // Initialize existing namespace for backward compatibility
        this.initializeTimetablesNamespace();

        console.log('[Socket.io] Service initialized.');
    }

    private initializeTimetablesNamespace() {
        if (!this.io) return;
        const timetablesNs = this.io.of('/timetables');
        
        timetablesNs.on('connection', (socket) => {
            console.log(`[Socket.io] Client connected to /timetables namespace (${socket.id})`);
            
            socket.on('disconnect', () => {
                console.log(`[Socket.io] Client disconnected from /timetables (${socket.id})`);
            });
        });
    }

    emitToUser(userId: string, event: string, data: any) {
        if (!this.io) return;
        this.io.of('/notifications').to(`user-${userId}`).emit(event, data);
    }

    broadcastToRole(role: string, event: string, data: any) {
        if (!this.io) return;
        this.io.of('/notifications').to(`role-${role.toLowerCase()}`).emit(event, data);
    }

    // Existing method preserved for compatibility
    broadcastTimetableGenerated(departmentId: string, generationDetails: any) {
        if (!this.io) return;
        this.io.of('/timetables')?.emit('schedule:updated', { departmentId, ...generationDetails });
    }
}

export const socketService = new SocketService();
