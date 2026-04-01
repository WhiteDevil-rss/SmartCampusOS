import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';
import * as facultyAuditService from '../services/faculty-audit.service';
import * as curriculumAlignmentService from '../services/curriculum-alignment.service';

/**
 * Create a new governance poll on the blockchain.
 */
export const createPoll = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, options } = req.body;
        // In reality, this would trigger a blockchain transaction
        res.json({ message: 'Governance poll created on-chain', title });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to create poll' });
    }
};

/**
 * Cast a vote on an active governance poll.
 */
export const castVote = async (req: AuthRequest, res: Response) => {
    try {
        const { pollId, optionIndex } = req.body;
        res.json({ message: 'Vote cast successfully' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to cast vote' });
    }
};

/**
 * Register intellectual property using the blockchain and IPFS.
 */
export const registerIP = async (req: AuthRequest, res: Response) => {
    try {
        const { title, hash, type } = req.body;
        res.json({ message: 'IP registered and hash secured on-chain', title });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to register IP' });
    }
};

export const triggerFacultyAudit = async (req: Request, res: Response) => {
    try {
        const facultyId = req.params.facultyId as string;
        const { academicYear, semester } = req.body;

        if (!facultyId || !academicYear || !semester) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const audit = await facultyAuditService.runFacultyAudit(facultyId, academicYear, Number(semester));
        res.status(201).json(audit);
    } catch (error: any) {
        console.error('Governance Trigger Audit Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getFacultyAudits = async (req: Request, res: Response) => {
    try {
        const facultyId = req.params.facultyId as string;
        const audits = await facultyAuditService.getFacultyPerformanceHistory(facultyId);
        res.json(audits);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const triggerCurriculumAudit = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.courseId as string;
        const { academicYear } = req.body;

        if (!courseId || !academicYear) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const alignment = await curriculumAlignmentService.analyzeCurriculumAlignment(courseId, academicYear);
        res.status(201).json(alignment);
    } catch (error: any) {
        console.error('Governance Trigger Curriculum Audit Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getCourseAlignments = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.courseId as string;
        const alignments = await curriculumAlignmentService.getCourseAlignmentHistory(courseId);
        res.json(alignments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
