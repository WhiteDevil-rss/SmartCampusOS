import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const submitFlagRequest = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { startDate, endDate, flagType, reason, documentUrl } = req.body;

        if (!startDate || !endDate || !flagType) {
            return res.status(400).json({ error: 'startDate, endDate, and flagType are required' });
        }

        const student = await prisma.student.findFirst({
            where: {
                OR: [
                    { id: userId },
                    { email: req.user?.email }
                ]
            }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student profile not found' });
        }

        const newFlag = await prisma.attendanceFlag.create({
            data: {
                studentId: student.id,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                flagType,
                reason,
                documentUrl,
                status: 'PENDING'
            }
        });

        res.status(201).json(newFlag);
    } catch (error: any) {
        console.error('Submit Flag Error:', error);
        res.status(500).json({ error: 'Failed to submit attendance flag request' });
    }
};

export const getMyFlags = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const student = await prisma.student.findFirst({
            where: {
                OR: [
                    { id: userId },
                    { email: req.user?.email }
                ]
            }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student profile not found' });
        }

        const flags = await prisma.attendanceFlag.findMany({
            where: {
                studentId: student.id
            },
            orderBy: {
                appliedAt: 'desc'
            }
        });

        res.json(flags);
    } catch (error: any) {
        console.error('Get My Flags Error:', error);
        res.status(500).json({ error: 'Failed to fetch attendance flags' });
    }
};
export const getAllFlagsForAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const universityId = req.query.universityId as string;
        const departmentId = req.query.departmentId as string;

        const flags = await prisma.attendanceFlag.findMany({
            where: {
                student: {
                    universityId: universityId as string,
                    departmentId: departmentId as string
                }
            },
            include: {
                student: {
                    select: {
                        name: true,
                        enrollmentNo: true,
                        batch: { select: { name: true } }
                    }
                }
            },
            orderBy: {
                appliedAt: 'desc'
            }
        });

        res.json(flags);
    } catch (error: any) {
        console.error('Get All Flags Error:', error);
        res.status(500).json({ error: 'Failed to fetch attendance flags' });
    }
};

export const updateFlagStatus = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status, remarks } = req.body;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const flag = await prisma.attendanceFlag.findUnique({
            where: { id },
            include: { student: true }
        });

        if (!flag) return res.status(404).json({ error: 'Flag not found' });

        const updatedFlag = await prisma.attendanceFlag.update({
            where: { id },
            data: {
                status,
                reason: remarks ? `${flag.reason}\n\nRemarks: ${remarks}` : flag.reason,
                approvedBy: req.user?.id,
                approvedAt: new Date()
            }
        });

        // If approved, automatically mark linked attendance records as EXCUSED
        if (status === 'APPROVED') {
            // Find all attendance records for this student within the date range that are currently ABSENT
            const records = await prisma.attendanceRecord.findMany({
                where: {
                    studentId: flag.studentId,
                    markedAt: {
                        gte: flag.startDate,
                        lte: flag.endDate
                    },
                    status: 'ABSENT'
                }
            });

            if (records.length > 0) {
                await prisma.attendanceRecord.updateMany({
                    where: {
                        id: { in: records.map(r => r.id) }
                    },
                    data: {
                        status: 'EXCUSED',
                        flagId: flag.id
                    }
                });
            }
        }

        res.json(updatedFlag);
    } catch (error: any) {
        console.error('Update Flag Error:', error);
        res.status(500).json({ error: 'Failed to update flag status' });
    }
};
