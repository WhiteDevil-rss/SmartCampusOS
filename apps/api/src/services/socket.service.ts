import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

class SocketService {
    private io: Server | null = null;

    initialize(server: HttpServer) {
        this.io = new Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });

        const timetablesNs = this.io.of('/timetables');

        // Middleware for authentication
        timetablesNs.use((socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            try {
                const decoded = jwt.verify(token, JWT_SECRET) as any;
                (socket as any).user = decoded;
                next();
            } catch (err) {
                return next(new Error('Authentication error'));
            }
        });

        timetablesNs.on('connection', (socket: Socket) => {
            const user = (socket as any).user;

            // Join specific rooms based on role
            if (user.role === 'SUPERADMIN') {
                socket.join('superadmin');
            } else if (user.role === 'UNI_ADMIN' && user.universityId) {
                socket.join(`uni-${user.universityId}`);
            } else if (user.role === 'DEPT_ADMIN' && user.entityId) {
                socket.join(`dept-${user.entityId}`);
            } else if (user.role === 'FACULTY' && user.entityId) {
                socket.join(`faculty-${user.entityId}`);
            }

            console.log(`[Socket.io] User ${user.username} connected. Role: ${user.role}`);

            socket.on('disconnect', () => {
                console.log(`[Socket.io] User ${user.username} disconnected.`);
            });
        });

        console.log('[Socket.io] Service initialized.');
    }

    // Broadcast a new timetable generation to a specific department room
    // and broadcast to all faculty members within that department.
    broadcastTimetableGenerated(departmentId: string, generationDetails: any) {
        if (!this.io) return;

        // Notify the department administrators
        this.io.of('/timetables').to(`dept-${departmentId}`).emit('timetable:generated', generationDetails);

        // Ideally we'd map faculty explicitly, but for simplicity, we trigger a global 'schedule:updated'
        // signal mapped back to the department origin allowing clients to react appropriately.
        // A more complex setup would loop through affected Faculty IDs and emit `to(faculty-${id})`.
        this.io.of('/timetables').emit('schedule:updated', { departmentId, ...generationDetails });
    }
}

export const socketService = new SocketService();
