import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getStudentAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.params.studentId as string;
        const email = (req.user?.email || '') as string;

        const student = await prisma.student.findFirst({
            where: studentId === 'me' ? { email } : { id: studentId },
            include: {
                attendance: {
                    include: {
                        session: {
                            include: {
                                timetableSlot: {
                                    include: {
                                        course: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { markedAt: 'desc' }
                }
            }
        });

        if (!student || !('attendance' in student)) {
            return res.status(404).json({ error: 'Student or attendance records not found' });
        }

        const attendanceRecords = (student as any).attendance;

        // Group by subject for summary
        const summary: Record<string, { present: number, total: number, name: string }> = {};

        attendanceRecords.forEach((record: any) => {
            const course = record.session?.timetableSlot?.course;
            if (!course) return;

            if (!summary[course.id]) {
                summary[course.id] = { present: 0, total: 0, name: course.name };
            }
            summary[course.id].total++;
            if (record.status === 'PRESENT') {
                summary[course.id].present++;
            }
        });

        res.json({
            history: attendanceRecords,
            summary: Object.values(summary).map(s => ({
                ...s,
                percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
            }))
        });
    } catch (error: any) {
        console.error('Get Attendance Error:', error);
        res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
};

export const createAttendanceSession = async (req: AuthRequest, res: Response) => {
    try {
        const { timetableSlotId, date, method, openedAt } = req.body;

        const session = await prisma.attendanceSession.create({
            data: {
                timetableSlotId,
                date: new Date(date),
                method,
                openedAt: new Date(openedAt)
            }
        });

        res.status(201).json(session);
    } catch (error: any) {
        console.error('Create Session Error:', error);
        res.status(500).json({ error: 'Failed to create attendance session' });
    }
};

export const markAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const { sessionId, studentId, status, method, markedAt } = req.body;

        const record = await prisma.attendanceRecord.create({
            data: {
                sessionId,
                studentId,
                status,
                method,
                markedAt: new Date(markedAt)
            }
        });

        res.status(201).json(record);
    } catch (error: any) {
        console.error('Mark Attendance Error:', error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
};

export const bulkMarkAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const { sessionId, records } = req.body; // records: { studentId: string, status: string, method: string }[]

        const createdRecords = await prisma.attendanceRecord.createMany({
            data: records.map((r: any) => ({
                sessionId,
                studentId: r.studentId,
                status: r.status,
                method: r.method || 'MANUAL',
                markedAt: new Date()
            }))
        });

        res.status(201).json({ count: createdRecords.count });
    } catch (error: any) {
        console.error('Bulk Mark Attendance Error:', error);
        res.status(500).json({ error: 'Failed to bulk mark attendance' });
    }
};

export const getStudentsForSlot = async (req: AuthRequest, res: Response) => {
    try {
        const slotId = req.params.slotId as string;

        const slot = await prisma.timetableSlot.findUnique({
            where: { id: slotId },
            select: { batchId: true }
        });

        if (!slot) return res.status(404).json({ error: 'Timetable slot not found' });

        const students = await prisma.student.findMany({
            where: { batchId: slot.batchId },
            orderBy: { name: 'asc' }
        });

        res.json(students);
    } catch (error: any) {
        console.error('Get Students For Slot Error:', error);
        res.status(500).json({ error: 'Failed to fetch students for the slot' });
    }
};
