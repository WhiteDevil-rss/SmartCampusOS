import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { generateCareerIntelligence, CareerAIContext } from '../services/career-intelligence.service';

/**
 * Generates an AI-driven Career Growth Orbit for the authenticated student.
 */
export const generateStudyPlan = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.entityId;
        if (!studentId) return res.status(403).json({ error: 'Unauthorized: Student context required' });

        // 1. Fetch Deep Student Context
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                program: true,
                batch: true,
                results: {
                    include: {
                        subjectResults: {
                            include: { course: true }
                        }
                    },
                    orderBy: { semester: 'desc' },
                },
                attendance: {
                    take: 100 // Get recent engagement
                }
            }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }

        // 2. Compute Context Metrics
        const lastResult = student.results[0];
        const currentSgpa = lastResult?.sgpa ? Number(lastResult.sgpa) : 7.0;
        
        const totalAttendance = student.attendance.length;
        const presentCount = student.attendance.filter(r => r.status === 'PRESENT').length;
        const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 85;

        // Extract unique completed courses across all semesters
        const completedCourses = Array.from(new Set(
            student.results.flatMap(r => r.subjectResults.map(sr => sr.course.name))
        ));

        const aiContext: CareerAIContext = {
            studentName: student.name.split(' ')[0], // First name for personalization
            program: student.program.name,
            semester: student.batch.semester ?? (lastResult?.semester ?? 1) + 1,
            currentSgpa,
            attendanceRate,
            completedCourses: completedCourses.slice(0, 10) // Limit to top 10 for prompt efficiency
        };

        // 3. Generate Intelligence
        const plan = await generateCareerIntelligence(aiContext);

        res.json({
            ...plan,
            timestamp: new Date().toISOString(),
            context: {
                sgpa: currentSgpa,
                attendance: attendanceRate.toFixed(1) + '%'
            }
        });

    } catch (error) {
        console.error('Failed to generate career intelligence:', error);
        res.status(500).json({ error: 'AI Orchestration failed. Please try again later.' });
    }
};
