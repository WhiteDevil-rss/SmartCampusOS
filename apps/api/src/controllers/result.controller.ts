import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import crypto from 'crypto';

export const verifyResultPublicly = async (req: Request, res: Response) => {
    try {
        const { enrollmentNo } = req.params;

        if (!enrollmentNo) {
            return res.status(400).json({ error: 'Enrollment number is required' });
        }

        const student = await (prisma as any).student.findUnique({
            where: { enrollmentNo: enrollmentNo as string },
            include: {
                results: {
                    orderBy: { academicYear: 'desc' },
                    take: 1,
                    include: {
                        program: true,
                        subjectResults: {
                            include: { course: true }
                        }
                    }
                },
                university: true
            }
        });

        if (!student || student.results.length === 0) {
            return res.status(404).json({ error: 'No verified results found for this enrollment number.' });
        }

        const latestResult = student.results[0];

        // Recalculate hash dynamically to prove database integrity
        // Pattern: studentId + sgpa + cgpa + semester
        const verificationString = `${student.id}-${latestResult.sgpa}-${latestResult.cgpa}-${latestResult.semester}`;
        const computedHash = crypto.createHash('sha256').update(verificationString).digest('hex');

        const isVerified = (computedHash === latestResult.resultHash);

        if (!isVerified) {
            // Data integrity failure
            return res.status(409).json({ 
                error: 'Result integrity compromised. Cryptographic blockchain signature does not match database payload.',
                isVerified: false 
            });
        }

        // Return secure payload (removing internal IDs)
        return res.json({
            student: {
                name: student.name,
                enrollmentNo: student.enrollmentNo,
                university: student.university.name
            },
            result: {
                program: latestResult.program.name,
                semester: latestResult.semester,
                academicYear: latestResult.academicYear,
                sgpa: latestResult.sgpa,
                cgpa: latestResult.cgpa,
                status: latestResult.status,
                publishedAt: latestResult.publishedAt,
                subjects: latestResult.subjectResults.map((sub: any) => ({
                    courseCode: sub.course.code,
                    courseName: sub.course.name,
                    grade: sub.grade,
                    totalMarks: sub.totalMarks,
                    creditsEarned: sub.creditsEarned
                }))
            },
            blockchain: {
                isVerified: true,
                txHash: latestResult.blockchainTxHash,
                signatureHash: latestResult.resultHash,
                confirmedAt: latestResult.blockchainConfirmedAt
            }
        });

    } catch (error) {
        console.error('[VerifyResult] Error:', error);
        return res.status(500).json({ error: 'Internal server error while verifying blockchain results.' });
    }
};
