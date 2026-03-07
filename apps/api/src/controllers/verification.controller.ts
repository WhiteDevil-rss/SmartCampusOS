import { Response, Request } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import crypto from 'crypto';

export const publishResultToChain = async (req: AuthRequest, res: Response) => {
    try {
        const resultId = req.params.resultId as string;

        const result = await prisma.result.findUnique({
            where: { id: resultId },
            include: {
                student: true,
                program: true
            }
        });

        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }

        if (result.blockchainTxHash) {
            return res.status(400).json({ error: 'Result is already published to the blockchain' });
        }

        // Generate canonical JSON representation of the result
        const canonicalData = JSON.stringify({
            studentId: result.studentId,
            enrollmentNo: (result as any).student.enrollmentNo,
            programId: result.programId,
            semester: result.semester,
            academicYear: result.academicYear,
            sgpa: result.sgpa,
            cgpa: result.cgpa,
            status: result.status
        });

        // Compute SHA-256 hash
        const resultHash = crypto.createHash('sha256').update(canonicalData).digest('hex');

        // Simulate Blockchain Transaction
        const simulatedTxHash = `0x${crypto.randomBytes(32).toString('hex')}`;

        const updatedResult = await prisma.result.update({
            where: { id: resultId },
            data: {
                resultHash,
                blockchainTxHash: simulatedTxHash,
                blockchainConfirmedAt: new Date(),
                publishedAt: new Date()
            }
        });

        res.json({
            message: 'Result successfully published to blockchain',
            result: updatedResult
        });
    } catch (error: any) {
        console.error('Publish Result to Chain Error:', error);
        res.status(500).json({ error: 'Failed to publish result to blockchain' });
    }
};

export const verifyPublicResult = async (req: Request, res: Response) => {
    try {
        const { enrollmentNo, semester } = req.query;

        // Log Verification Request (Simulated IP for now)
        const requesterIp = (req.ip || req.connection.remoteAddress || 'unknown') as string;

        if (!enrollmentNo || !semester) {
            return res.status(400).json({ error: 'Enrollment Number and Semester are required' });
        }

        const student = await prisma.student.findUnique({
            where: { enrollmentNo: enrollmentNo as string }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const result = await prisma.result.findFirst({
            where: {
                studentId: student.id,
                semester: parseInt(semester as string, 10),
                blockchainTxHash: { not: null } // Only verify published results
            },
            include: {
                student: { include: { university: true } },
                program: true
            }
        });

        if (!result) {
            await prisma.verificationRequest.create({
                data: {
                    universityId: student.universityId,
                    enrollmentNo: enrollmentNo as string,
                    requesterIp,
                    requestType: 'RESULT',
                    blockchainMatch: false
                }
            });
            return res.status(404).json({ error: 'Blockchain-verified result not found for this semester' });
        }

        // Recompute hash
        const canonicalData = JSON.stringify({
            studentId: result.studentId,
            enrollmentNo: result.student.enrollmentNo,
            programId: result.programId,
            semester: result.semester,
            academicYear: result.academicYear,
            sgpa: result.sgpa,
            cgpa: result.cgpa,
            status: result.status
        });

        const computedHash = crypto.createHash('sha256').update(canonicalData).digest('hex');
        const match = computedHash === result.resultHash;

        await prisma.verificationRequest.create({
            data: {
                universityId: result.student.universityId,
                enrollmentNo: enrollmentNo as string,
                requesterIp,
                requestType: 'RESULT',
                blockchainMatch: match,
                resultSnapshot: JSON.parse(canonicalData)
            }
        });

        if (match) {
            res.json({
                verified: true,
                message: 'Result is cryptographically verified and tampering-free.',
                data: {
                    studentName: result.student.name,
                    enrollmentNo: result.student.enrollmentNo,
                    program: result.program.name,
                    semester: result.semester,
                    sgpa: result.sgpa,
                    cgpa: result.cgpa,
                    status: result.status,
                    verificationDetails: {
                        txHash: result.blockchainTxHash,
                        timestamp: result.blockchainConfirmedAt,
                        ledger: 'Polygon L2 (Simulated)'
                    }
                }
            });
        } else {
            res.status(400).json({
                verified: false,
                error: 'Cryptographic mismatch. The result may have been tampered with.'
            });
        }

    } catch (error: any) {
        console.error('Verify Public Result Error:', error);
        res.status(500).json({ error: 'Internal server error during verification' });
    }
};
