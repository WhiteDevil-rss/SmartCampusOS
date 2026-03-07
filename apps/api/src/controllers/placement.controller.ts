import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Get all recruiting companies for the university.
 */
export const getCompanies = async (req: AuthRequest, res: Response) => {
    try {
        const universityId = req.user?.universityId;
        if (!universityId) return res.status(403).json({ error: 'Unauthorized: University context missing' });

        const companies = await prisma.company.findMany({
            where: { universityId },
            include: {
                _count: {
                    select: { placements: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        res.json(companies);
    } catch (error) {
        console.error('Failed to get companies:', error);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
};

/**
 * Add a new recruiting company.
 */
export const addCompany = async (req: AuthRequest, res: Response) => {
    try {
        const universityId = req.user?.universityId;
        if (!universityId) return res.status(403).json({ error: 'Unauthorized' });

        const { name, type, website, hrContact } = req.body;

        const newCompany = await prisma.company.create({
            data: {
                universityId,
                name,
                type,
                website,
                hrContact
            }
        });

        res.status(201).json(newCompany);
    } catch (error) {
        console.error('Failed to add company:', error);
        res.status(500).json({ error: 'Failed to register company' });
    }
};

/**
 * Get recent placement records.
 */
export const getPlacementRecords = async (req: AuthRequest, res: Response) => {
    try {
        const universityId = req.user?.universityId;
        if (!universityId) return res.status(403).json({ error: 'Unauthorized' });

        const records = await prisma.placementRecord.findMany({
            where: {
                student: { universityId }
            },
            include: {
                student: { select: { name: true, enrollmentNo: true, programId: true } },
                company: true
            },
            orderBy: { placedAt: 'desc' },
            take: 100
        });

        res.json(records);
    } catch (error) {
        console.error('Failed to get placement records:', error);
        res.status(500).json({ error: 'Failed to fetch placement records' });
    }
};

/**
 * Record a student placement.
 */
export const recordPlacement = async (req: AuthRequest, res: Response) => {
    try {
        const { companyId, studentEnrollmentNo, jobRole, package: ctc, date } = req.body;
        const universityId = req.user?.universityId;

        const student = await prisma.student.findUnique({
            where: { enrollmentNo: studentEnrollmentNo }
        });

        if (!student || student.universityId !== universityId) {
            return res.status(404).json({ error: 'Student not found in this university' });
        }

        const placement = await prisma.placementRecord.create({
            data: {
                studentId: student.id,
                companyId: companyId,
                role: jobRole,
                ctc: Number(ctc),
                placedAt: new Date(date || Date.now())
            },
            include: {
                student: { select: { name: true, enrollmentNo: true } },
                company: { select: { name: true } }
            }
        });

        res.status(201).json(placement);
    } catch (error) {
        console.error('Failed to record placement:', error);
        res.status(500).json({ error: 'Failed to record placement' });
    }
};
