import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getMaterials = async (req: AuthRequest, res: Response) => {
    try {
        const { role, entityId, email } = req.user!;
        let materials;

        if (role === 'FACULTY') {
            if (!entityId) return res.status(400).json({ error: 'Faculty ID not found' });
            materials = await prisma.studyMaterial.findMany({
                where: { facultyId: entityId },
                include: { course: true, batch: true }
            });
        } else if (role === 'STUDENT') {
            const student = await prisma.student.findFirst({
                where: { email },
                select: { batchId: true, departmentId: true }
            });
            if (!student) return res.status(404).json({ error: 'Student not found' });

            materials = await prisma.studyMaterial.findMany({
                where: {
                    OR: [
                        { batchId: student.batchId },
                        { batchId: null, course: { departmentId: student.departmentId } }
                    ]
                },
                include: { course: true, faculty: true }
            });
        } else {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(materials);
    } catch (error) {
        console.error('Get Materials Error:', error);
        res.status(500).json({ error: 'Failed to fetch materials' });
    }
};

export const createMaterial = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, fileUrl, fileType, courseId, batchId } = req.body;
        const facultyId = req.user?.entityId;

        if (req.user?.role !== 'FACULTY' || !facultyId) return res.status(403).json({ error: 'Only faculty can upload materials' });

        const material = await prisma.studyMaterial.create({
            data: {
                title,
                description,
                fileUrl,
                fileType,
                facultyId,
                courseId,
                batchId
            }
        });

        res.status(201).json(material);
    } catch (error) {
        console.error('Create Material Error:', error);
        res.status(500).json({ error: 'Failed to upload material' });
    }
};

export const deleteMaterial = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const facultyId = req.user?.entityId;

        const material = await prisma.studyMaterial.findUnique({ where: { id } });
        if (!material) return res.status(404).json({ error: 'Material not found' });

        if (material.facultyId !== facultyId && req.user?.role !== 'SUPERADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await prisma.studyMaterial.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error('Delete Material Error:', error);
        res.status(500).json({ error: 'Failed to delete material' });
    }
};
