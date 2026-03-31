import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getClasses = async (req: AuthRequest, res: Response) => {
    try {
        const { divisionId, facultyId, subjectId } = req.query;
        const filters: any = {};
        if (divisionId) filters.divisionId = String(divisionId);
        if (facultyId) filters.facultyId = String(facultyId);
        if (subjectId) filters.subjectId = String(subjectId);

        // RBAC Check for Department Admin
        if (req.user!.role === 'DEPT_ADMIN') {
            filters.division = { batch: { departmentId: req.user!.entityId } };
        } else if (req.user!.role === 'FACULTY') {
            filters.facultyId = req.user!.entityId;
        } else if (req.user!.role === 'STUDENT') {
            // Find division student belongs to
            const studentId = req.user!.entityId!;
            const assignment = await prisma.studentDivisionAssignment.findFirst({
                where: { studentId, status: 'ACTIVE' },
                orderBy: { assignedAt: 'desc' }
            });
            if (assignment) {
                filters.divisionId = assignment.divisionId;
            } else {
                return res.status(200).json([]);
            }
        }

        const classes = await prisma.class.findMany({
            where: filters,
            include: {
                subject: { select: { name: true, code: true, type: true } },
                faculty: { select: { id: true, name: true, designation: true } },
                division: { 
                    include: { 
                        batch: { select: { name: true, semester: true } } 
                    } 
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(classes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch classes' });
    }
};

export const createClass = async (req: AuthRequest, res: Response) => {
    try {
        const { subjectId, facultyId, divisionId, academicYear, semester } = req.body;

        // Verify division exists and admin has access
        const division = await prisma.division.findUnique({ 
            where: { id: divisionId },
            include: { batch: true }
        });
        if (!division) return res.status(404).json({ error: 'Division not found' });

        if (req.user!.role === 'DEPT_ADMIN' && division.batch.departmentId !== req.user!.entityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const newClass = await prisma.class.create({
            data: { 
                subjectId, 
                facultyId, 
                divisionId, 
                academicYear, 
                semester: semester || division.batch.semester || 1
            }
        });

        res.status(201).json(newClass);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create class' });
    }
};

export const updateClass = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { facultyId, status } = req.body;

        const targetClass = await prisma.class.findUnique({ 
            where: { id },
            include: { division: { include: { batch: true } } }
        }) as any;
        if (!targetClass) return res.status(404).json({ error: 'Not found' });

        if (req.user!.role === 'DEPT_ADMIN' && targetClass.division.batch.departmentId !== req.user!.entityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const updated = await prisma.class.update({
            where: { id },
            data: { facultyId, status }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update class' });
    }
};

export const deleteClass = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const targetClass = await prisma.class.findUnique({ 
            where: { id },
            include: { division: { include: { batch: true } } }
        }) as any;
        if (!targetClass) return res.status(404).json({ error: 'Not found' });

        if (req.user!.role === 'DEPT_ADMIN' && targetClass.division.batch.departmentId !== req.user!.entityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Clean up timetable slots referencing this class
        await prisma.timetableSlot.deleteMany({ where: { classId: id as string } });
        await prisma.class.delete({ where: { id: id as string } });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete class' });
    }
};
