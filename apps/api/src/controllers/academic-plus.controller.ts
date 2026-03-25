import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { blockchainService } from '../services/blockchain.service';
import prisma from '../lib/prisma';

/**
 * Register an exam paper with a release time.
 */
export const registerExamPaper = async (req: AuthRequest, res: Response) => {
    try {
        const { examId, paperHash, releaseTime } = req.body;
        await blockchainService.registerExamPaper(examId, paperHash, releaseTime);
        res.status(201).json({ message: 'Exam paper secured on-chain', examId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register exam paper' });
    }
};

/**
 * Create a scholarship fund.
 */
export const createScholarship = async (req: AuthRequest, res: Response) => {
    try {
        const { scholarshipId, amountPerStudent, totalAmount } = req.body;
        await blockchainService.createScholarship(scholarshipId, amountPerStudent, totalAmount);
        res.status(201).json({ message: 'Scholarship fund created on-chain', scholarshipId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create scholarship' });
    }
};

/**
 * Distribute scholarship to a student.
 */
export const distributeScholarship = async (req: AuthRequest, res: Response) => {
    try {
        const { scholarshipId, studentAddress } = req.body;
        await blockchainService.distributeScholarship(scholarshipId, studentAddress);
        res.json({ message: 'Scholarship distributed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to distribute scholarship' });
    }
};
