import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getVerifiedDocs = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const student = await prisma.student.findFirst({
            where: {
                OR: [
                    ...(req.user?.entityId ? [{ id: req.user.entityId }] : []),
                    ...(req.user?.email ? [{ email: req.user.email }] : [])
                ]
            }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student profile not found' });
        }

        // Fetch verified results
        const results = await prisma.result.findMany({
            where: {
                studentId: student.id,
                blockchainTxHash: { not: null }
            },
            include: {
                subjectResults: {
                    include: { course: true }
                },
                program: true
            },
            orderBy: { semester: 'desc' }
        });

        // Fetch verified attendance flags (e.g. medical certificates)
        const flags = await prisma.attendanceFlag.findMany({
            where: {
                studentId: student.id,
                status: 'APPROVED',
                documentUrl: { not: null }
            },
            orderBy: { appliedAt: 'desc' }
        });

        res.json({
            results,
            flags,
            identity: {
                enrollmentNo: student.enrollmentNo,
                name: student.name,
                blockchainId: `did:zembaa:uos:${student.id}`
            }
        });
    } catch (error) {
        console.error('Get Verified Docs Error:', error);
        res.status(500).json({ error: 'Failed to fetch verified documents' });
    }
};

export const verifyDocument = async (req: Request, res: Response) => {
    try {
        const hash = req.params.hash as string;

        const result = await prisma.result.findFirst({
            where: { resultHash: hash },
            include: {
                student: { select: { name: true, enrollmentNo: true } },
                program: { select: { name: true } }
            }
        }) as any;

        if (!result) {
            return res.status(404).json({
                verified: false,
                error: 'Document not found or tampered with.'
            });
        }

        res.json({
            verified: true,
            document: {
                type: 'SEMESTER_RESULT',
                studentName: result.student.name,
                enrollmentNo: result.student.enrollmentNo,
                program: result.program.name,
                semester: result.semester,
                sgpa: result.sgpa,
                cgpa: result.cgpa,
                publishedAt: result.publishedAt,
                blockchainTxHash: result.blockchainTxHash,
                blockchainConfirmedAt: result.blockchainConfirmedAt
            }
        });
    } catch (error) {
        console.error('Verify Document Error:', error);
        res.status(500).json({ error: 'Verification service error' });
    }
};
