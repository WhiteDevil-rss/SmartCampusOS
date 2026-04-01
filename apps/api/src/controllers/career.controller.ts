import { Request, Response } from 'express';
import { generateCareerIntelligence, CareerAIContext } from '../services/career-intelligence.service';
import { calculateIndustryReadiness } from '../services/readiness.service';
import prisma from '../lib/prisma';

/**
 * Career Pathing & Industry Readiness Controller
 * Orchestrates AI generation triggers and intelligence retrieval.
 */

export const triggerCareerAudit = async (req: Request, res: Response) => {
    try {
        const studentId = req.body.studentId as string;

        if (!studentId) {
            return res.status(400).json({ error: 'Student ID is required' });
        }

        // 1. Fetch Student Context
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                batch: true,
                results: {
                    orderBy: { publishedAt: 'desc' },
                    take: 1
                },
                electiveMappings: {
                    include: { 
                        option: {
                            include: { course: true }
                        }
                    }
                }
            }
        }) as any;

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // 2. Prepare Context for AI
        const context: CareerAIContext = {
            studentId: student.id,
            studentName: student.name,
            program: student.programId,
            semester: student.batch?.semester || 1,
            currentSgpa: student.results?.[0]?.sgpa || 7.5,
            attendanceRate: 85, // Mock baseline
            completedCourses: student.electiveMappings?.map((m: any) => m.option?.course?.name).filter(Boolean) || [],
            academicYear: student.batch?.year || '2025-26'
        };

        // 3. Generate Intelligence
        const result = await generateCareerIntelligence(context);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error('[TRIGGER_CAREER_AUDIT_ERROR]:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};

export const getReadinessIndex = async (req: Request, res: Response) => {
    try {
        const studentId = req.params.studentId as string;

        if (!studentId) {
            return res.status(400).json({ error: 'Student ID is required' });
        }

        const readiness = await calculateIndustryReadiness(studentId);

        res.status(200).json({
            success: true,
            data: readiness
        });

    } catch (error: any) {
        console.error('[GET_READINESS_INDEX_ERROR]:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};

export const getAuditHistory = async (req: Request, res: Response) => {
    try {
        const studentId = req.params.studentId as string;

        const audits = await prisma.careerPathAudit.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        res.status(200).json({
            success: true,
            data: audits
        });

    } catch (error: any) {
        console.error('[GET_AUDIT_HISTORY_ERROR]:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};
export const getReadinessBreakdown = async (req: Request, res: Response) => {
    try {
        const studentId = req.params.studentId as string;

        if (!studentId) {
            return res.status(400).json({ error: 'Student ID is required' });
        }

        // 1. Get Current Readiness (triggers calculation/refresh)
        const current = await calculateIndustryReadiness(studentId);

        // 2. Prepare Radar Data for Frontend
        const radarData = [
            { subject: 'Technical', A: current.technical, fullMark: 100 },
            { subject: 'Behavioral', A: current.behavioral, fullMark: 100 },
            { subject: 'Experience', A: current.experience, fullMark: 100 },
            { subject: 'Collaboration', A: current.collaboration, fullMark: 100 },
            { subject: 'Innovation', A: current.innovation, fullMark: 100 },
        ];

        // 3. Mock History for Trends (if real history not available)
        const history = [
            { month: 'Jan', score: current.overall - 5 },
            { month: 'Feb', score: current.overall - 2 },
            { month: 'Mar', score: current.overall },
        ];

        res.status(200).json({
            success: true,
            data: {
                current,
                radarData,
                history
            }
        });

    } catch (error: any) {
        console.error('[GET_READINESS_BREAKDOWN_ERROR]:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};
