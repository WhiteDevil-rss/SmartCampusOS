import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getLibraryAssets = async (req: AuthRequest, res: Response) => {
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

        if (!student) return res.status(404).json({ error: 'Student not found' });

        const bookLoans = await prisma.bookLoan.findMany({
            where: { studentId: student.id },
            include: { book: true },
            orderBy: { issuedAt: 'desc' }
        });

        res.json({ bookLoans });
    } catch (error: any) {
        console.error('Library Error:', error);
        res.status(500).json({ error: 'Failed to fetch library assets' });
    }
};

export const getPlacementDetails = async (req: AuthRequest, res: Response) => {
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

        if (!student) return res.status(404).json({ error: 'Student not found' });

        const placementRecord = await prisma.placementRecord.findUnique({
            where: { studentId: student.id },
            include: { company: true }
        });

        const visitingCompanies = await prisma.company.findMany({
            where: { universityId: student.universityId },
            orderBy: { name: 'asc' },
            take: 10
        });

        res.json({
            placementRecord,
            visitingCompanies
        });
    } catch (error: any) {
        console.error('Placement Error:', error);
        res.status(500).json({ error: 'Failed to fetch placement details' });
    }
};
