import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const transferStudent = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId, toDivisionId, reason, academicYear } = req.body;

        const student = await prisma.student.findUnique({ 
            where: { id: studentId },
            include: { divisionAssignments: { where: { status: 'ACTIVE' } } }
        });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const toDivision = await prisma.division.findUnique({ 
            where: { id: toDivisionId },
            include: { batch: true }
        });
        if (!toDivision) return res.status(404).json({ error: 'Target division not found' });

        // RBAC: Verify if admin has access to the department
        if (req.user!.role === 'DEPT_ADMIN' && toDivision.batch.departmentId !== req.user!.entityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const currentAssignment = student.divisionAssignments[0];
        const fromDivisionId = currentAssignment?.divisionId || null;

        if (fromDivisionId === toDivisionId) {
            return res.status(400).json({ error: 'Student already in target division' });
        }

        // Transaction for transfer and logging
        await prisma.$transaction(async (tx) => {
            // Update previous assignment to TRANSFERRED
            if (currentAssignment) {
                await tx.studentDivisionAssignment.update({
                    where: { id: currentAssignment.id },
                    data: { status: 'TRANSFERRED' }
                });
            }

            // Create new assignment
            await tx.studentDivisionAssignment.create({
                data: {
                    studentId,
                    divisionId: toDivisionId,
                    academicYear: academicYear || new Date().getFullYear().toString(),
                    status: 'ACTIVE'
                }
            });

            // Log the transfer
            await tx.studentTransferLog.create({
                data: {
                    studentId,
                    fromDivisionId,
                    toDivisionId,
                    reason,
                    actionById: req.user!.id
                }
            });
        });

        res.json({ message: 'Student transferred successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to transfer student' });
    }
};

export const bulkTransferStudents = async (req: AuthRequest, res: Response) => {
    try {
        const { studentIds, toDivisionId, reason, academicYear } = req.body;

        const toDivision = await prisma.division.findUnique({
            where: { id: toDivisionId },
            include: { batch: true }
        });
        if (!toDivision) return res.status(404).json({ error: 'Target division not found' });

        if (req.user!.role === 'DEPT_ADMIN' && toDivision.batch.departmentId !== req.user!.entityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const year = academicYear || new Date().getFullYear().toString();

        // 1. Fetch current active assignments for all students to capture fromDivisionId
        const currentAssignments = await prisma.studentDivisionAssignment.findMany({
            where: {
                studentId: { in: studentIds },
                status: 'ACTIVE'
            }
        });

        const assignmentMap = new Map(currentAssignments.map(a => [a.studentId, a.divisionId]));

        await prisma.$transaction(async (tx) => {
            // 2. Bulk update previous assignments for these students
            await tx.studentDivisionAssignment.updateMany({
                where: {
                    studentId: { in: studentIds },
                    status: 'ACTIVE'
                },
                data: { status: 'TRANSFERRED' }
            });

            // 3. Bulk create new assignments
            const newAssignments = studentIds.map((sid: string) => ({
                studentId: sid,
                divisionId: toDivisionId,
                academicYear: year,
                status: 'ACTIVE'
            }));
            await tx.studentDivisionAssignment.createMany({ data: newAssignments });

            // 4. Create correct logs
            for (const sid of studentIds) {
                await tx.studentTransferLog.create({
                    data: {
                        studentId: sid,
                        fromDivisionId: assignmentMap.get(sid) || null,
                        toDivisionId,
                        reason: reason || 'Bulk Transfer',
                        actionById: req.user!.id
                    }
                });
            }
        });

        res.json({ message: `Successfully transferred ${studentIds.length} students` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to bulk transfer students' });
    }
};

export const getTransferHistory = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId, divisionId } = req.query;
        const filters: any = {};
        if (studentId) filters.studentId = String(studentId);
        if (divisionId) {
            filters.OR = [
                { fromDivisionId: String(divisionId) },
                { toDivisionId: String(divisionId) }
            ];
        }

        if (req.user!.role === 'DEPT_ADMIN') {
            const deptId = req.user!.entityId;
            if (!deptId || deptId === 'undefined' || deptId === 'null') {
                return res.json([]);
            }
            // Ensure scoping: Transfer involved THEIR department as source OR destination
            filters.AND = filters.AND || [];
            filters.AND.push({
                OR: [
                    { fromDivision: { batch: { departmentId: deptId } } },
                    { toDivision: { batch: { departmentId: deptId } } }
                ]
            });
        }

        const history = await prisma.studentTransferLog.findMany({
            where: filters,
            include: {
                student: { select: { name: true, enrollmentNo: true } },
                fromDivision: { select: { name: true, batch: { select: { name: true } } } },
                toDivision: { select: { name: true, batch: { select: { name: true } } } },
                actionBy: { select: { username: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedLogs = history.map((log: any) => {
            let actionName = 'System Admin';
            if (log.actionBy && log.actionBy.username) {
                actionName = log.actionBy.username;
            }

            return {
                id: log.id,
                createdAt: log.createdAt.toISOString(),
                reason: log.reason || '',
                student: {
                    name: log.student?.name || 'Unknown Student',
                    rollNumber: log.student?.enrollmentNo || null
                },
                fromDivision: log.fromDivision ? {
                    name: log.fromDivision.name,
                    batch: { name: log.fromDivision.batch?.name || '' }
                } : null,
                toDivision: log.toDivision ? {
                    name: log.toDivision.name,
                    batch: { name: log.toDivision.batch?.name || '' }
                } : null,
                actionBy: { name: actionName }
            };
        });

        res.json(formattedLogs);
    } catch (error: any) {
        console.error(`[StudentTransferController] getTransferHistory Error:`, error);
        res.status(500).json({ 
            error: 'Failed to fetch transfer history',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
