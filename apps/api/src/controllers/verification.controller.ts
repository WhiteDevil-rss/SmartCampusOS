import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import crypto from 'crypto';

export const verifyStudentRegistration = async (req: Request, res: Response) => {
    try {
        const { appId, contact, hash } = req.query;

        if (!appId || !contact || !hash) {
            return res.status(400).json({ error: 'Missing required validation fields' });
        }

        const student = await prisma.student.findFirst({
            where: {
                enrollmentNo: String(appId),
                OR: [
                    { email: String(contact) },
                    { phone: String(contact) }
                ]
            },
            include: {
                university: true
            }
        });

        if (!student) {
            return res.status(404).json({ error: 'Applicant record not found in registries.' });
        }

        const validationString = `${student.enrollmentNo}:${student.email}:${student.id}:ADMIT_SECURE`;
        const computedHash = crypto.createHash('sha256').update(validationString).digest('hex');

        if (computedHash !== hash) {
            return res.status(409).json({ error: 'Cryptographic identity mismatch. Potential tampering caught.' });
        }

        const securePayload = {
            student: {
                name: student.name,
                email: student.email,
                phone: student.phone
            },
            applicationId: student.enrollmentNo, // Overloading field for MVP
            university: {
                name: student.university?.name || 'Central Admitting University',
                id: student.university.id
            },
            status: 'APPROVED',
            verifyHash: computedHash
        };

        return res.status(200).json(securePayload);
    } catch (error) {
        console.error('Error verifying admission status: ', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const verifyResultIntegrity = async (req: Request, res: Response) => {
    try {
        const { enrollNo, hash } = req.query;

        if (!enrollNo || !hash) {
            return res.status(400).json({ error: 'Missing enrollment query or secure hash.' });
        }

        const student = await prisma.student.findUnique({
            where: { enrollmentNo: String(enrollNo) },
            include: {
                university: true,
                results: {
                    include: {
                        subjectResults: {
                            include: { course: true }
                        }
                    }
                }
            }
        });

        if (!student || student.results.length === 0) {
            return res.status(404).json({ error: 'No published results found.' });
        }

        const latestResult = student.results[0];

        if (latestResult.resultHash !== hash && latestResult.blockchainTxHash !== hash) {
            const verifyString = `${student.enrollmentNo}:${latestResult.sgpa.toFixed(2)}:${latestResult.cgpa.toFixed(2)}`;
            const recomputedHas = crypto.createHash('sha256').update(verifyString).digest('hex');
            
            if (recomputedHas !== hash) {
                return res.status(409).json({ error: 'Blockchain cryptographic signature failed.' });
            }
        }

        let totalMarks = 0;
        let maxMarks = 0;
        
        // Map subjectResults visually for the Frontend UI structure
        const mappedSubjects = latestResult.subjectResults.map((sr) => {
            totalMarks += sr.totalMarks;
            maxMarks += 100; // Assuming max 100 per course
            
            return {
                courseCode: sr.course.code,
                courseName: sr.course.name,
                marksObtained: sr.totalMarks,
                maxMarks: 100,
                grade: sr.grade
            };
        });
        
        const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(2) : 0;
        const status = Number(percentage) >= 40 ? 'PASS' : 'FAIL';

        const securePayload = {
            student: {
                name: student.name,
                enrollmentNo: student.enrollmentNo,
                university: student.university.name
            },
            result: {
                program: "Software Engineering Core",
                semester: latestResult.semester,
                sgpa: latestResult.sgpa,
                cgpa: latestResult.cgpa,
                totalMarks: `${totalMarks}`,
                percentage: percentage,
                status: status,
                subjects: mappedSubjects
            },
            blockchain: {
                txHash: latestResult.blockchainTxHash || "0xUNREGISTERED_STAGING_BLOCK",
                signatureHash: latestResult.resultHash || hash
            }
        };

        return res.status(200).json(securePayload);
    } catch (error) {
        console.error('Error verifying result record: ', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
