import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import authRoutes from './routes/auth.routes';
import universityRoutes from './routes/university.routes';
import departmentRoutes from './routes/department.routes';
import facultyRoutes from './routes/faculty.routes';
import courseRoutes from './routes/course.routes';
import resourceRoutes from './routes/resource.routes';
import batchRoutes from './routes/batch.routes';
import timetableRoutes from './routes/timetable.routes';
import electiveRoutes from './routes/elective.routes';
import userRoutes from './routes/user.routes';
import programRoutes from './routes/program.routes';
import { createServer } from 'http';
import { socketService } from './services/socket.service';
import { checkAiHealth } from './services/ai.service';
import { monitoringService } from './services/monitoring.service';

import { auditLogger } from './middlewares/audit-logger.middleware';
import {
    csrfProtection,
    ensureSettingsRow,
    sanitizeRequest,
} from './middlewares/security.middleware';
import { enforceApiAuthentication, requireRole } from './middlewares/auth.middleware';

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: process.env.NODE_ENV === 'production' ? undefined : false,
    contentSecurityPolicy: false,
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'no-referrer' },
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(ensureSettingsRow);
app.use(sanitizeRequest);
app.use(enforceApiAuthentication);
app.use(csrfProtection);
app.use(auditLogger);

// Throughput Monitoring Middleware
app.use((req, res, next) => {
    monitoringService.incrementRequestCount();
    next();
});

app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', service: 'nepscheduler-api' });
});

app.get('/v1/ai-health', async (req: express.Request, res: express.Response) => {
    const health = await checkAiHealth();
    res.json(health);
});

app.get('/v2/monitoring/metrics', requireRole(['SUPERADMIN']), async (req, res) => {
    try {
        const metrics = await monitoringService.getCurrentMetrics();
        res.status(200).json(metrics);
    } catch (error) {
        res.status(500).json({ message: 'Failed to collect monitoring metrics' });
    }
});

import auditLogRoutes from './routes/audit-log.routes';
import settingsRoutes from './routes/settings.routes';
import firebaseSyncRoutes from './routes/firebase-sync.routes';
import seedManagementRoutes from './routes/seed-management.routes';
import inquiryRoutes from './routes/inquiry.routes';
import subscriberRoutes from './routes/subscriber.routes';
import analyticsRoutes from './routes/analytics.routes';
import studentRoutes from './routes/student.routes';
import admissionRoutes from './routes/admission.routes';
import verificationRoutes from './routes/verification.routes';
import accreditationRoutes from './routes/accreditation.routes';
import feesRoutes from './routes/fees.routes';
import payrollRoutes from './routes/payroll.routes';
import attendanceRoutes from './routes/attendance.routes';
import resultRoutes from './routes/result.routes';
import complaintRoutes from './routes/complaint.routes';
import serviceRequestRoutes from './routes/service-request.routes';
import publicPortalRoutes from './routes/public_portal.routes';
import assignmentRoutes from './routes/assignment.routes';
import materialRoutes from './routes/material.routes';
import notificationRoutes from './routes/notification.routes';
import storageRoutes from './routes/storage.routes';
import chatbotRoutes from './routes/chatbot.routes';
import careerPlannerRoutes from './routes/career-planner.routes';
import iotRoutes from './routes/iot.routes';
import libraryRoutes from './routes/library.routes';
import placementRoutes from './routes/placement.routes';
import studentTimetableRoutes from './routes/student-timetable.routes';
import studentAttendanceRoutes from './routes/student-attendance.routes';
import studentAttendanceFlagRoutes from './routes/student-attendance-flag.routes';
import studentResultsRoutes from './routes/student-results.routes';
import studentFeesRoutes from './routes/student-fees.routes';
import studentAssetsRoutes from './routes/student-assets.routes';
import studentRequestsRoutes from './routes/student-requests.routes';
import messagesRoutes from './routes/messages.routes';
import facultyMessagesRoutes from './routes/faculty-messages.routes';
import studentDocsRoutes from './routes/student-docs.routes';
import permissionRoutes from './routes/permission.routes';
import historyRoutes from './routes/history.routes';
import jobRoutes from './routes/job.routes';
import marksRoutes from './routes/marks.routes';
import blockchainExtendedRoutes from './routes/blockchain-extended.routes';
import admissionInquiryRoutes from './routes/admission-inquiry.routes';
import divisionRoutes from './routes/division.routes';
import classRoutes from './routes/class.routes';
import studentTransferRoutes from './routes/student-transfer.routes';
import collaborationRoutes from './routes/collaboration.routes';
import researchRoutes from './routes/research.routes';
import synergyRoutes from './routes/synergy.routes';
import institutionalRoutes from './routes/institutional.routes';
import governanceRoutes from './routes/governance.routes';
import careerRoutes from './routes/career.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import notificationPreferenceRoutes from './routes/notification-preference.routes';
import alumniRoutes from './routes/alumni.routes';
import inventoryRoutes from './routes/inventory.routes';
import securityRoutes from './routes/security.routes';


app.use('/v1/auth', authRoutes);
app.use('/v1/universities/:universityId/departments', departmentRoutes);
app.use('/v1/universities', universityRoutes);
app.use('/v1/departments/:departmentId/timetables', timetableRoutes);
app.use('/v1/departments/:departmentId/electives', electiveRoutes);
app.use('/v1/departments', departmentRoutes);
app.use('/v1/faculty', facultyRoutes);
app.use('/v1/courses', courseRoutes);
app.use('/v1/resources', resourceRoutes);
app.use('/v1/batches', batchRoutes);
app.use('/v1/users', userRoutes);
app.use('/v1/programs', programRoutes);
app.use('/v1/logs', auditLogRoutes);
app.use('/v1/settings', settingsRoutes);
app.use('/v1/firebase-sync', firebaseSyncRoutes);
app.use('/v1/seed', seedManagementRoutes);
app.use('/v1/inquiries', inquiryRoutes);
app.use('/v1/subscribers', subscriberRoutes);
app.use('/v1/assignments', assignmentRoutes);
app.use('/v1/materials', materialRoutes);
app.use('/v2/complaints', complaintRoutes);
app.use('/v2/service-requests', serviceRequestRoutes);
app.use('/v2/fees', feesRoutes);
app.use('/v2/payroll', payrollRoutes);
app.use('/v2/attendance', attendanceRoutes);
app.use('/v2/results', resultRoutes);
app.use('/v2/accreditation', accreditationRoutes);
app.use('/v2/storage', storageRoutes);
app.use('/v2/career-planner', careerPlannerRoutes);
app.use('/v2/iot', iotRoutes);
app.use('/v2/library', libraryRoutes);
app.use('/v2/placements', placementRoutes);
app.use('/v2/faculty/messages', facultyMessagesRoutes);

// Specific Student Sub-routes FIRST to prevent shadowing by general /v2/student
app.use('/v2/student/timetable', studentTimetableRoutes);
app.use('/v2/student/attendance', studentAttendanceRoutes);
app.use('/v2/student/attendance/flags', studentAttendanceFlagRoutes);
app.use('/v2/student/results', studentResultsRoutes);
app.use('/v2/student/fees', studentFeesRoutes);
app.use('/v2/student/assets', studentAssetsRoutes);
app.use('/v2/student/requests', studentRequestsRoutes);
app.use('/v2/student/messages', messagesRoutes);
app.use('/v2/student/docs', studentDocsRoutes);
app.use('/v2/notifications', notificationRoutes);

app.use('/v2/chatbot', chatbotRoutes);
app.use('/v2/analytics', analyticsRoutes);
app.use('/v1/public', publicPortalRoutes);

app.use('/v2/student', studentRoutes);
app.use('/v2/admissions', admissionRoutes);
app.use('/v2/verification', verificationRoutes);
app.use('/v2/permissions', permissionRoutes);
app.use('/v2/history', historyRoutes);
app.use('/v2/jobs', jobRoutes);
app.use('/v2/marks', marksRoutes);
app.use('/v2/blockchain', blockchainExtendedRoutes);
app.use('/v2/admission-inquiries', admissionInquiryRoutes);
app.use('/v2/divisions', divisionRoutes);
app.use('/v2/classes', classRoutes);
app.use('/v2/student-transfers', studentTransferRoutes);
app.use('/v2/collaboration', collaborationRoutes);
app.use('/v2/research', researchRoutes);
app.use('/v2/synergy', synergyRoutes);
app.use('/v2/institutional', institutionalRoutes);
app.use('/v2/governance', governanceRoutes);
app.use('/v2/career-intelligence', careerRoutes);
app.use('/v2/maintenance', maintenanceRoutes);
app.use('/v2/notifications', notificationPreferenceRoutes);
app.use('/v2/alumni', alumniRoutes);
app.use('/v2/inventory', inventoryRoutes);
app.use('/v2/security', securityRoutes);


// Health Check
import { cacheService } from './services/redis.service';
import prisma from './lib/prisma';

app.get('/v2/health', async (req, res) => {
    try {
        const dbStatus = await prisma.$queryRaw`SELECT 1`.then(() => 'online').catch(() => 'offline');
        const aiStatus = await checkAiHealth();
        const redisStatus = cacheService.getStatus();

        const isHealthy = dbStatus === 'online' && aiStatus.reachable;
        const statusCode = isHealthy ? 200 : 503;

        res.status(statusCode).json({
            status: isHealthy ? 'healthy' : 'degraded',
            services: {
                database: dbStatus,
                aiEngine: aiStatus.status,
                redis: redisStatus,
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error: 'Diagnostic failed' });
    }
});

// Global Error Handler
import { errorMiddleware } from './middlewares/error.middleware';
app.use(errorMiddleware);

const server = createServer(app);
socketService.initialize(server);

server.listen(port, () => {
    console.log(`API Server running on port ${port}`);
    monitoringService.start();
});

// --- GRACEFUL SHUTDOWN HANDLERS ---
const gracefulShutdown = async (signal: string) => {
    console.log(`\n[${signal}] Shutdown signal received. Closing SmartCampusOS API...`);
    
    // Stop accepting new connections
    server.close(async () => {
        console.log('[HTTP] Server stopped.');
        
        try {
            // Orchestrated Draining
            console.log('[Drain] Disconnecting Socket.io...');
            await socketService.close();
            
            console.log('[Drain] Closing Redis pool...');
            await cacheService.disconnect();
            
            console.log('[Drain] Disconnecting Prisma...');
            await prisma.$disconnect();
            
            console.log(`[Success] Clean exit. System time: ${new Date().toISOString()}`);
            process.exit(0);
        } catch (err) {
            console.error('[Error] Problem during graceful shutdown:', err);
            process.exit(1);
        }
    });

    // Forced Timeout Protection (10s)
    setTimeout(() => {
        console.error('[Timeout] Forced shutdown after 10s.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
