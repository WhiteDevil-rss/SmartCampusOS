import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserRole } from '@smartcampus-os/types';
import { blockchainService } from '../services/blockchain.service';
import crypto from 'crypto';

/**
 * Workflow Statuses:
 * DRAFT -> SUBMITTED_TO_DEPT -> APPROVED_BY_DEPT -> APPROVED_BY_APPROVAL -> PUBLISHED
 */

/**
 * Faculty/Dept: Upload/Update Internal Marks
 */
export const uploadInternalMarks = async (req: AuthRequest, res: Response) => {
    try {
        const { marks } = req.body; // Array of { subjectResultId, internalMarks, midTermMarks }
        
        const updates = await Promise.all(marks.map((m: any) => 
            prisma.subjectResult.update({
                where: { id: m.subjectResultId },
                data: {
                    internalMarks: m.internalMarks,
                    midTermMarks: m.midTermMarks,
                    status: 'DRAFT'
                }
            })
        ));

        res.json({ message: 'Internal marks saved as draft', count: updates.length });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload internal marks' });
    }
};

/**
 * Get Subjects for Faculty
 */
export const getFacultySubjects = async (req: AuthRequest, res: Response) => {
    try {
        const facultyId = req.user?.entityId;
        if (!facultyId) return res.status(403).json({ error: 'Faculty ID not found' });

        const subjects = await prisma.facultySubject.findMany({
            where: { facultyId },
            include: { course: true }
        });

        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
};

/**
 * Get Students and their Marks for a Course
 */
export const getSubjectStudentsMarks = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        const universityId = req.user?.universityId;

        const marks = await prisma.subjectResult.findMany({
            where: { 
                courseId: courseId as string,
                result: { student: { universityId: universityId as string } }
            },
            include: {
                result: { include: { student: true } }
            }
        });

        res.json(marks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch student marks' });
    }
};

/**
 * Dept: Get Marks Pending Review
 */
export const getPendingDeptReview = async (req: AuthRequest, res: Response) => {
    try {
        const departmentId = req.user?.entityId; // Assuming DEPT_ADMIN has entityId = departmentId

        const pending = await prisma.subjectResult.findMany({
            where: {
                status: 'SUBMITTED_TO_DEPT',
                course: { departmentId: departmentId as string }
            },
            include: {
                course: true,
                result: { include: { student: true } }
            }
        });

        res.json(pending);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending reviews' });
    }
};

/**
 * Approval Dept: Get Marks Pending Final Approval
 */
export const getPendingApprovalReview = async (req: AuthRequest, res: Response) => {
    try {
        const universityId = req.user?.universityId;

        const pending = await prisma.subjectResult.findMany({
            where: {
                status: 'APPROVED_BY_DEPT',
                course: { universityId: universityId as string }
            },
            include: {
                course: true,
                result: { include: { student: true } }
            }
        });

        res.json(pending);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending approvals' });
    }
};

/**
 * Faculty: Submit Marks to Department
 */
export const submitToDept = async (req: AuthRequest, res: Response) => {
    try {
        const { subjectResultIds } = req.body;

        await prisma.subjectResult.updateMany({
            where: { id: { in: subjectResultIds } },
            data: { status: 'SUBMITTED_TO_DEPT' }
        });

        res.json({ message: 'Marks submitted to department for review' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit marks' });
    }
};

/**
 * Department: Approve and Forward to Approval Department
 */
export const approveByDept = async (req: AuthRequest, res: Response) => {
    try {
        const { subjectResultIds } = req.body;

        await prisma.subjectResult.updateMany({
            where: { id: { in: subjectResultIds } },
            data: { status: 'APPROVED_BY_DEPT' }
        });

        res.json({ message: 'Marks approved by department and forwarded to Approval Department' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve marks' });
    }
};

/**
 * Approval Department: Final Verification and approve for university submission
 */
export const approveByApprovalDept = async (req: AuthRequest, res: Response) => {
    try {
        const { subjectResultIds } = req.body;

        await prisma.subjectResult.updateMany({
            where: { id: { in: subjectResultIds } },
            data: { status: 'APPROVED_BY_APPROVAL' }
        });

        res.json({ message: 'Marks finalized and approved for university submission' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to finalize marks' });
    }
};

/**
 * University: Upload External Marks (Triggered by central authority)
 */
export const uploadExternalMarks = async (req: AuthRequest, res: Response) => {
    try {
        const { marks } = req.body; // Array of { subjectResultId, externalMarks }

        const updates = await Promise.all(marks.map((m: any) => 
            prisma.subjectResult.update({
                where: { id: m.subjectResultId },
                data: {
                    externalMarks: m.externalMarks
                }
            })
        ));

        res.json({ message: 'External marks uploaded', count: updates.length });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload external marks' });
    }
};

/**
 * University: Publish Results (Calculate totals, grades, SGPA/CGPA and lock)
 */
export const publishResults = async (req: AuthRequest, res: Response) => {
    try {
        const { resultIds } = req.body;

        for (const resultId of resultIds) {
            const subjectResults = await prisma.subjectResult.findMany({
                where: { resultId },
                include: { course: true }
            });

            let totalCredits = 0;
            let earnedPoints = 0;

            for (const sr of subjectResults) {
                const internal = sr.internalMarks || 0;
                const external = sr.externalMarks || 0;
                const total = internal + external;
                
                // Standardized 10-point absolute grading scale
                let grade = 'F';
                let points = 0;
                if (total >= 90) { grade = 'O'; points = 10; }
                else if (total >= 80) { grade = 'A+'; points = 9; }
                else if (total >= 70) { grade = 'A'; points = 8; }
                else if (total >= 60) { grade = 'B+'; points = 7; }
                else if (total >= 50) { grade = 'B'; points = 6; }
                else if (total >= 45) { grade = 'C'; points = 5; }
                else if (total >= 40) { grade = 'P'; points = 4; }

                totalCredits += sr.course.credits;
                earnedPoints += (points * sr.course.credits);

                await prisma.subjectResult.update({
                    where: { id: sr.id },
                    data: {
                        totalMarks: total,
                        grade,
                        status: 'PUBLISHED'
                    }
                });
            }

            const sgpa = totalCredits > 0 ? earnedPoints / totalCredits : 0;

            // Update parent Result with SGPA and published status
            const result = await prisma.result.findUnique({
                where: { id: resultId },
                include: { student: true }
            });

            if (result) {
                // Calculate CGPA (Average of all published SGPA for the student)
                const previousResults = await prisma.result.findMany({
                    where: { 
                        studentId: result.studentId, 
                        status: 'PUBLISHED',
                        NOT: { id: resultId } 
                    }
                });

                const allSgpas = [...previousResults.map(r => r.sgpa), sgpa];
                const cgpa = allSgpas.reduce((acc, val) => acc + val, 0) / allSgpas.length;

                // Standardized Verification Hash: enrollmentNo:SGPA:CGPA (toFixed(2) for both)
                const verificationString = `${result.student.enrollmentNo}:${sgpa.toFixed(2)}:${cgpa.toFixed(2)}`;
                const resultHash = crypto.createHash('sha256').update(verificationString).digest('hex');

                await prisma.result.update({
                    where: { id: resultId },
                    data: {
                        sgpa,
                        cgpa,
                        status: 'PUBLISHED',
                        publishedAt: new Date(),
                        resultHash
                    }
                });
            }
        }

        res.json({ message: 'Results published successfully' });
    } catch (error) {
        console.error('Publish results error:', error);
        res.status(500).json({ error: 'Failed to publish results' });
    }
};

/**
 * Student: Raise Complaint
 */
export const raiseComplaint = async (req: AuthRequest, res: Response) => {
    try {
        const { subjectResultId, description } = req.body;
        const userId = req.user?.id;

        const student = await prisma.student.findFirst({
            where: {
                OR: [{ id: userId }, { email: req.user?.email }]
            }
        });

        if (!student) return res.status(404).json({ error: 'Student not found' });

        const complaint = await prisma.marksComplaint.create({
            data: {
                studentId: student.id,
                subjectResultId,
                description,
                status: 'PENDING'
            }
        });

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ error: 'Failed to raise complaint' });
    }
};

/**
 * University: Resolve Complaint
 */
export const resolveComplaint = async (req: AuthRequest, res: Response) => {
    try {
        const { complaintId, resolution, status } = req.body;

        const complaint = await prisma.marksComplaint.update({
            where: { id: complaintId },
            data: { resolution, status, updatedAt: new Date() }
        });

        // Record on Blockchain
        try {
            if (status === 'RESOLVED') {
                await blockchainService.resolveComplaintOnChain(complaintId);
            }
        } catch (bcError) {
            console.error('Blockchain Complaint Sync Failed:', bcError);
        }

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ error: 'Failed to resolve complaint' });
    }
};

/**
 * Student: Apply for Reassessment
 */
export const applyForReassessment = async (req: AuthRequest, res: Response) => {
    try {
        const { subjectResultId, reason } = req.body;
        const userId = req.user?.id;

        const student = await prisma.student.findFirst({
            where: {
                OR: [{ id: userId }, { email: req.user?.email }]
            }
        });

        if (!student) return res.status(404).json({ error: 'Student not found' });

        const request = await prisma.reassessmentRequest.create({
            data: {
                studentId: student.id,
                subjectResultId,
                reason,
                status: 'PENDING'
            }
        });

        // Record on Blockchain
        try {
            // Simulated re-evaluation fee of 0.01 ETH
            await blockchainService.applyForReevaluation(request.id, "0.01");
        } catch (bcError) {
            console.error('Blockchain Reassessment Sync Failed:', bcError);
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ error: 'Failed to apply for reassessment' });
    }
};
