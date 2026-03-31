import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getDivisions = async (req: AuthRequest, res: Response) => {
    try {
        const { batchId } = req.query;
        const filters: any = {};
        if (batchId) filters.batchId = String(batchId);

        // RBAC Check
        if (req.user!.role === 'DEPT_ADMIN') {
            if (!req.user!.entityId || req.user!.entityId === 'undefined' || req.user!.entityId === 'null') {
                return res.json([]);
            }
            filters.batch = { departmentId: req.user!.entityId };
        }

        const divisions = await prisma.division.findMany({
            where: filters,
            include: {
                batch: { select: { name: true, program: true, semester: true } },
                classTeacher: { select: { id: true, name: true } },
                studentAssignments: {
                    where: { status: 'ACTIVE' },
                    include: {
                        student: { select: { id: true, name: true, enrollmentNo: true } }
                    }
                },
                _count: { select: { studentAssignments: true } }
            },
            orderBy: { name: 'asc' }
        });

        const formattedDivisions = divisions.map(div => ({
            ...div,
            students: div.studentAssignments.map(assignment => ({
                studentId: assignment.studentId,
                student: {
                    name: assignment.student.name,
                    rollNumber: assignment.student.enrollmentNo
                }
            }))
        }));

        res.json(formattedDivisions);
    } catch (error: any) {
        console.error(`[DivisionController] getDivisions Error:`, error);
        res.status(500).json({ 
            error: 'Failed to fetch divisions',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const createDivision = async (req: AuthRequest, res: Response) => {
    try {
        const { batchId, name, capacity, classTeacherId, primaryRoomId } = req.body;

        // Verify batch exists and belongs to dept
        const batch = await prisma.batch.findUnique({ where: { id: batchId } });
        if (!batch) return res.status(404).json({ error: 'Batch not found' });

        if (req.user!.role === 'DEPT_ADMIN' && batch.departmentId !== req.user!.entityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const division = await prisma.division.create({
            data: { batchId, name, capacity: capacity || 30, classTeacherId, primaryRoomId }
        });

        res.status(201).json(division);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create division' });
    }
};

export const updateDivision = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name, capacity, classTeacherId, primaryRoomId } = req.body;

        const division = await prisma.division.findUnique({ 
            where: { id },
            include: { batch: true }
        }) as any; // Cast avoid relation type issues in this environment
        if (!division) return res.status(404).json({ error: 'Not found' });

        if (req.user!.role === 'DEPT_ADMIN' && division.batch.departmentId !== req.user!.entityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const updated = await prisma.division.update({
            where: { id },
            data: { name, capacity, classTeacherId, primaryRoomId }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update division' });
    }
};

export const enrollStudentsToDivision = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { studentIds, academicYear } = req.body; // array of IDs

        const division = await prisma.division.findUnique({ where: { id } });
        if (!division) return res.status(404).json({ error: 'Division not found' });

        const year = academicYear || new Date().getFullYear().toString();

        await prisma.$transaction(async (tx) => {
            // 1. Deactivate any existing active assignments for these students in this academic year
            await tx.studentDivisionAssignment.updateMany({
                where: {
                    studentId: { in: studentIds },
                    academicYear: year,
                    status: 'ACTIVE'
                },
                data: { status: 'TRANSFERRED' }
            });

            // 2. Create new assignments
            for (const studentId of studentIds) {
                await tx.studentDivisionAssignment.upsert({
                    where: {
                        studentId_divisionId_academicYear: {
                            studentId,
                            divisionId: id,
                            academicYear: year
                        }
                    },
                    update: { status: 'ACTIVE' },
                    create: {
                        studentId,
                        divisionId: id,
                        academicYear: year,
                        status: 'ACTIVE'
                    }
                });
            }
        });

        res.json({ message: `${studentIds.length} students enrolled successfully` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to enroll students' });
    }
};

export const deleteDivision = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const division = await prisma.division.findUnique({ 
            where: { id },
            include: { batch: true }
        }) as any;
        if (!division) return res.status(404).json({ error: 'Not found' });

        if (req.user!.role === 'DEPT_ADMIN' && division.batch.departmentId !== req.user!.entityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await prisma.$transaction([
            prisma.studentDivisionAssignment.deleteMany({ where: { divisionId: id as string } }),
            prisma.timetableSlot.deleteMany({ where: { divisionId: id as string } }),
            prisma.class.deleteMany({ where: { divisionId: id as string } }),
            prisma.division.delete({ where: { id: id as string } })
        ]);

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete division' });
    }
};
