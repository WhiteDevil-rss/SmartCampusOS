import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { ScheduleConfig } from '@smartcampus-os/types';
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

import { auditLogger } from './middleware/audit-logger.middleware';

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(express.json());
app.use(auditLogger);

app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', service: 'nepscheduler-api' });
});

app.get('/v1/ai-health', async (req: express.Request, res: express.Response) => {
    const health = await checkAiHealth();
    res.json(health);
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
app.use('/v2/student', studentRoutes);
app.use('/v2/admissions', admissionRoutes);
app.use('/v2/verification', verificationRoutes);
app.use('/v2/fees', feesRoutes);
app.use('/v2/payroll', payrollRoutes);
app.use('/v2/attendance', attendanceRoutes);
app.use('/v2/results', resultRoutes);
app.use('/v2/assignments', assignmentRoutes);
app.use('/v2/materials', materialRoutes);
app.use('/v2/notifications', notificationRoutes);
app.use('/v2/storage', storageRoutes);
app.use('/v2/complaints', complaintRoutes);
app.use('/v2/service-requests', serviceRequestRoutes);
app.use('/public/v2', publicPortalRoutes);
app.use('/v2/accreditation', accreditationRoutes);
app.use('/v2/chatbot', chatbotRoutes);
app.use('/v2/career-planner', careerPlannerRoutes);
app.use('/v2/iot', iotRoutes);
app.use('/v2/library', libraryRoutes);
app.use('/v2/placements', placementRoutes);
app.use('/v2/analytics', analyticsRoutes);
app.use('/v2/student/timetable', studentTimetableRoutes);
app.use('/v2/student/attendance', studentAttendanceRoutes);
app.use('/v2/student/attendance/flags', studentAttendanceFlagRoutes);
app.use('/v2/student/results', studentResultsRoutes);
app.use('/v2/student/fees', studentFeesRoutes);
app.use('/v2/student/assets', studentAssetsRoutes);
app.use('/v2/student/requests', studentRequestsRoutes);
app.use('/v2/student/messages', messagesRoutes);
app.use('/v2/faculty/messages', facultyMessagesRoutes);
app.use('/v2/student/docs', studentDocsRoutes);
app.use('/v2/permissions', permissionRoutes);
app.use('/v2/history', historyRoutes);
app.use('/v2/jobs', jobRoutes);

const server = createServer(app);
socketService.initialize(server);

server.listen(port, () => {
    console.log(`API Server running on port ${port}`);
});
