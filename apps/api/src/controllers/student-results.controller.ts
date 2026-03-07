import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAcademicResults = async (req: AuthRequest, res: Response) => {
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

        const results = await prisma.result.findMany({
            where: {
                studentId: student.id,
                status: {
                    not: 'WITHHELD' // Don't show withheld results to students
                }
            },
            include: {
                program: true,
                subjectResults: {
                    include: {
                        course: true
                    }
                }
            },
            orderBy: {
                semester: 'asc'
            }
        });

        res.json(results);
    } catch (error: any) {
        console.error('Get Academic Results Error:', error);
        res.status(500).json({ error: 'Failed to fetch academic results' });
    }
};
