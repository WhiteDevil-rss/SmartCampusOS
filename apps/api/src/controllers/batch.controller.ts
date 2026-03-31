import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getBatches = async (req: AuthRequest, res: Response) => {
    try {
        const { universityId, departmentId } = req.query as { universityId?: string, departmentId?: string };

        if (req.user!.role === 'UNI_ADMIN' && req.user!.universityId !== universityId && universityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (req.user!.role === 'DEPT_ADMIN' && req.user!.entityId !== departmentId && departmentId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const filters: any = {};
        if (universityId) filters.universityId = universityId;
        if (departmentId) filters.departmentId = departmentId;

        if (req.user!.role === 'UNI_ADMIN' && !universityId) {
            if (req.user!.universityId) {
                filters.universityId = req.user!.universityId;
            } else {
                // If a UNI_ADMIN has no universityId assigned, they shouldn't see any batches
                return res.json([]);
            }
        }

        if (req.user!.role === 'DEPT_ADMIN' && !departmentId) {
            if (req.user!.entityId) {
                filters.departmentId = req.user!.entityId;
            } else {
                // If a DEPT_ADMIN has no entityId (departmentId) assigned, they shouldn't see any batches
                return res.json([]);
            }
        }

        const batches = await prisma.batch.findMany({ 
            where: filters, 
            orderBy: { name: 'asc' },
            include: {
                divisions: {
                    select: {
                        id: true,
                        name: true,
                        capacity: true,
                        _count: { select: { studentAssignments: true } }
                    }
                }
            }
        });
        res.json(batches);
    } catch (error: any) {
        console.error('Fetch batches error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch batches', 
            details: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
};

export const getBatchById = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const batch = await prisma.batch.findUnique({ 
            where: { id },
            include: {
                divisions: {
                    include: {
                        classTeacher: { select: { id: true, name: true } },
                        primaryRoom: { select: { id: true, name: true } },
                        _count: { select: { studentAssignments: true } }
                    }
                }
            }
        });
        if (!batch) return res.status(404).json({ error: 'Not found' });

        if (req.user!.role === 'UNI_ADMIN' && req.user!.universityId !== batch.universityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (req.user!.role === 'DEPT_ADMIN' && req.user!.entityId !== batch.departmentId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        res.json(batch);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch batch' });
    }
};

export const createBatch = async (req: AuthRequest, res: Response) => {
    try {
        const { universityId, departmentId, name, program, semester, year } = req.body;

        if (req.user!.role === 'UNI_ADMIN' && req.user!.universityId !== universityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (req.user!.role === 'DEPT_ADMIN' && req.user!.entityId !== departmentId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const batch = await prisma.batch.create({
            data: { universityId, departmentId, name, program, semester, year }
        });

        res.status(201).json(batch);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create batch' });
    }
};

export const updateBatch = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name, program, semester, year } = req.body;

        const targetBatch = await prisma.batch.findUnique({ where: { id } });
        if (!targetBatch) return res.status(404).json({ error: 'Not found' });

        if (req.user!.role === 'UNI_ADMIN' && req.user!.universityId !== targetBatch.universityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (req.user!.role === 'DEPT_ADMIN' && req.user!.entityId !== targetBatch.departmentId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const batch = await prisma.batch.update({
            where: { id },
            data: { name, program, semester, year }
        });

        res.json(batch);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update batch' });
    }
};

export const deleteBatch = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const targetBatch = await prisma.batch.findUnique({ where: { id } });
        if (!targetBatch) return res.status(404).json({ error: 'Not found' });

        if (req.user!.role === 'UNI_ADMIN' && req.user!.universityId !== targetBatch.universityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (req.user!.role === 'DEPT_ADMIN' && req.user!.entityId !== targetBatch.departmentId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Cleanup: remove all divisions and classes first
        await prisma.$transaction([
            prisma.studentDivisionAssignment.deleteMany({ where: { division: { batchId: id } } }),
            prisma.timetableSlot.deleteMany({ where: { division: { batchId: id } } }),
            prisma.class.deleteMany({ where: { division: { batchId: id } } }),
            prisma.division.deleteMany({ where: { batchId: id } }),
            prisma.batch.delete({ where: { id } })
        ]);

        res.status(204).send();
    } catch (error: any) {
        console.error('Delete batch error:', error);
        res.status(500).json({ error: 'Failed to delete batch', detail: error?.message });
    }
};
