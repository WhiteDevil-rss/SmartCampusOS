import prisma from '../lib/prisma';
import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

export const getClassAnalytics = async (facultyId: string, courseId: string) => {
    // 1. Fetch batches that have this course and faculty in their timetable
    const slots = await prisma.timetableSlot.findMany({
        where: { facultyId, courseId },
        select: { batchId: true }
    });

    const batchIds = [...new Set(slots.map(s => s.batchId).filter((id): id is string => id !== null))];

    const students = await prisma.student.findMany({
        where: { batchId: { in: batchIds } },
        include: {
            academicRisk: true,
            results: {
                include: {
                    subjectResults: {
                        where: { courseId }
                    }
                }
            }
        }
    });

    const totalStudents = students.length;
    const atRiskCount = students.filter(s => (s as any).academicRisk?.riskLevel === 'HIGH' || (s as any).academicRisk?.riskLevel === 'CRITICAL').length;

    let totalMarks = 0;
    let markCount = 0;

    students.forEach(s => {
        (s as any).results.forEach((r: any) => {
            r.subjectResults.forEach((sr: any) => {
                totalMarks += sr.totalMarks;
                markCount++;
            });
        });
    });

    const averageScore = markCount > 0 ? totalMarks / markCount : 0;

    const riskDistribution = {
        CRITICAL: students.filter(s => (s as any).academicRisk?.riskLevel === 'CRITICAL').length,
        HIGH: students.filter(s => (s as any).academicRisk?.riskLevel === 'HIGH').length,
        MEDIUM: students.filter(s => (s as any).academicRisk?.riskLevel === 'MEDIUM').length,
        SAFE: students.filter(s => (s as any).academicRisk?.riskLevel === 'SAFE').length
    };

    const riskSegments = {
        CRITICAL: students.filter(s => (s as any).academicRisk?.riskLevel === 'CRITICAL').map(s => s.id),
        HIGH: students.filter(s => (s as any).academicRisk?.riskLevel === 'HIGH').map(s => s.id),
        MEDIUM: students.filter(s => (s as any).academicRisk?.riskLevel === 'MEDIUM').map(s => s.id),
        SAFE: students.filter(s => (s as any).academicRisk?.riskLevel === 'SAFE').map(s => s.id)
    };

    return {
        totalStudents,
        atRiskCount,
        averageScore,
        riskDistribution,
        riskSegments,
        batchIds
    };
};

export const getPedagogicalInsights = async (facultyId: string, courseId: string) => {
    const analytics = await getClassAnalytics(facultyId, courseId);
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    const prompt = `
        As an AI Academic Pedagogy Consultant, analyze this class performance data for the course "${course?.name}":
        - Total Students: ${analytics.totalStudents}
        - Students At High/Critical Risk: ${analytics.atRiskCount}
        - Average Internal Marks: ${analytics.averageScore.toFixed(1)}/100
        - Risk Distribution: ${JSON.stringify(analytics.riskDistribution)}

        Provide 3 specific, actionable teaching strategies to improve class performance. 
        Focus on:
        1. Addressing the high-risk segment.
        2. Improving overall engagement.
        3. Topic-specific intervention types (e.g., peer-led review, gamified quiz, hands-on lab).

        Return the response in a structured JSON format:
        {
            "summary": "Brief overview of class health",
            "strategies": [
                { "title": "Strategy Title", "description": "Detailed actionable steps", "impact": "Expected outcome" }
            ],
            "urgency": "LOW/MEDIUM/HIGH"
        }
    `;

    try {
        const response = await axios.post(OLLAMA_URL, {
            model: OLLAMA_MODEL,
            prompt,
            stream: false,
            format: 'json'
        });

        return JSON.parse(response.data.response);
    } catch (error) {
        console.error('Ollama Pedagogy error:', error);
        return {
            summary: "Unable to generate AI insights at this moment.",
            strategies: [],
            urgency: "MEDIUM"
        };
    }
};

export const getDepartmentRiskOverview = async (departmentId: string) => {
    const batches = await prisma.batch.findMany({
        where: { departmentId },
        include: {
            students: {
                include: { academicRisk: true }
            }
        }
    });

    return batches.map(batch => {
        const students = batch.students;
        const total = students.length;
        const critical = students.filter(s => s.academicRisk?.riskLevel === 'CRITICAL').length;
        const high = students.filter(s => s.academicRisk?.riskLevel === 'HIGH').length;

    });
};

export const getDepartmentRiskMap = async (departmentId: string) => {
    const students = await prisma.student.findMany({
        where: { departmentId },
        include: { academicRisk: true }
    });

    if (students.length === 0) {
        return {
            departmentId,
            normalizedScore: 0,
            level: 'LOW',
            factors: [],
            impacts: []
        };
    }

    const totalStudents = students.length;
    const criticalCount = students.filter(s => s.academicRisk?.riskLevel === 'CRITICAL').length;
    const highCount = students.filter(s => s.academicRisk?.riskLevel === 'HIGH').length;
    const mediumCount = students.filter(s => s.academicRisk?.riskLevel === 'MEDIUM').length;

    const normalizedScore = Math.min(100, Math.round(((criticalCount * 1.0 + highCount * 0.6 + mediumCount * 0.2) / totalStudents) * 100));

    let level: 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
    if (normalizedScore > 75) level = 'EXTREME';
    else if (normalizedScore > 50) level = 'HIGH';
    else if (normalizedScore > 25) level = 'MODERATE';

    // Simulated impact vectors based on department data
    const impacts = [
        { category: 'Attendance Velocity', score: Math.round(normalizedScore * 0.8 + Math.random() * 10) },
        { category: 'Academic Parity', score: Math.round(normalizedScore * 0.6 + Math.random() * 10) },
        { category: 'Engagement Depth', score: Math.round((100 - normalizedScore) * 0.4 + Math.random() * 10) },
        { category: 'Resource Stress', score: Math.round(normalizedScore * 0.4 + Math.random() * 20) }
    ];

    const factors = [
        { id: 'f1', name: 'Low Attendance', weight: criticalCount },
        { id: 'f2', name: 'Internal Marks Delta', weight: highCount },
        { id: 'f3', name: 'Fee Arrears', weight: mediumCount }
    ];

    return {
        departmentId,
        normalizedScore,
        level,
        factors,
        impacts
    };
};
