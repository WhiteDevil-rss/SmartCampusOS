import axios from 'axios';
import prisma from '../lib/prisma';

/**
 * Career Intelligence Service — v2.0.0
 * Orchestrates AI-driven career pathing by delegating to the centralized Python AI Engine.
 */

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:5000';

export interface CareerAIContext {
    studentId: string;
    studentName: string;
    program: string;
    semester: number;
    currentSgpa: number;
    attendanceRate: number;
    completedCourses: string[];
    academicYear: string;
}

export const generateCareerIntelligence = async (context: CareerAIContext) => {
    try {
        const auditData = {
            studentName: context.studentName,
            program: context.program,
            semester: context.semester,
            currentSgpa: context.currentSgpa,
            attendanceRate: context.attendanceRate,
            completedCourses: context.completedCourses
        };

        const response = await axios.post(`${AI_ENGINE_URL}/career/audit`, auditData);
        const aiResult = response.data;

        // Persist the result in the database
        const savedAudit = await prisma.careerPathAudit.create({
            data: {
                studentId: context.studentId,
                careerTrack: aiResult.careerTrack,
                optimalityScore: aiResult.optimalityScore,
                skillGap: aiResult.skillGap,
                nextMilestone: aiResult.nextMilestone,
                growthOrbit: aiResult.growthOrbit,
                academicYear: context.academicYear
            }
        });

        return { ...aiResult, auditId: savedAudit.id };

    } catch (error: any) {
        console.error('AI Engine Career Audit Failed:', error.message);
        
        // Fallback for reliability
        const fallbackResult = {
            careerTrack: "Analysis Pending (Engine Busy)",
            optimalityScore: 0,
            skillGap: ["System connectivity check required"],
            nextMilestone: {
                "title": "Retrying AI Pathing Synchronization",
                "difficulty": "Low"
            },
            growthOrbit: []
        };

        const savedFallback = await prisma.careerPathAudit.create({
            data: {
                studentId: context.studentId,
                careerTrack: fallbackResult.careerTrack,
                optimalityScore: fallbackResult.optimalityScore,
                skillGap: fallbackResult.skillGap,
                nextMilestone: fallbackResult.nextMilestone,
                growthOrbit: fallbackResult.growthOrbit,
                academicYear: context.academicYear
            }
        });

        return { ...fallbackResult, auditId: savedFallback.id };
    }
};
