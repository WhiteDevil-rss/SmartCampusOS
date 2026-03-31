import prisma from '../lib/prisma';
import * as predictiveAnalytic from './predictive-analytic.service';

export const refreshStudentSentinel = async (studentId: string) => {
    // 1. Fetch comprehensive history
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            attendance: { orderBy: { markedAt: 'desc' }, take: 100 },
            results: { orderBy: { semester: 'desc' } },
            quizAttempts: { orderBy: { startedAt: 'desc' }, take: 10 },
            submissions: { orderBy: { submittedAt: 'desc' }, take: 10 }
        }
    });

    if (!student) throw new Error('Student non-existent in core registry');

    // 2. Derive simple metrics
    const attendanceRecords = student.attendance;
    const totalSessions = attendanceRecords.length;
    const attendedCount = attendanceRecords.filter(r => r.status === 'PRESENT' || r.status === 'EXCUSED').length;
    const attendanceRate = totalSessions > 0 ? (attendedCount / totalSessions) * 100 : 90;

    // Attendance trend detection (comparing first 10 vs last 10 records)
    const recentAttendance = attendanceRecords.slice(0, 10);
    const olderAttendance = attendanceRecords.slice(10, 20);
    const recentRate = recentAttendance.filter(r => r.status === 'PRESENT').length / (recentAttendance.length || 1);
    const olderRate = olderAttendance.filter(r => r.status === 'PRESENT').length / (olderAttendance.length || 1);
    const attendanceTrend = recentRate < olderRate ? 'DECREASING' : recentRate > olderRate ? 'INCREASING' : 'STABLE';

    const sgpaHistory = student.results.map(r => r.sgpa);
    const quizAvg = student.quizAttempts.length > 0
        ? student.quizAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / student.quizAttempts.length
        : 75;
    
    const submissionRate = student.submissions.length > 0
        ? (student.submissions.filter(s => s.status === 'SUBMITTED' || s.status === 'GRADED').length / student.submissions.length) * 100
        : 100;

    // 3. AI Orbit: Analysis & Prescriptions
    const aiResult = await predictiveAnalytic.analyzeStudentRisk({
        attendanceRate,
        attendanceTrend: attendanceTrend as any,
        sgpaHistory,
        quizPerformance: quizAvg,
        assignmentEngagement: submissionRate
    });

    // 4. Persistence Matrix
    const riskControl = await prisma.academicRisk.upsert({
        where: { studentId },
        update: {
            riskLevel: aiResult.riskLevel,
            score: aiResult.score,
            factors: aiResult.factors as any,
            lastAnalyzed: new Date()
        },
        create: {
            studentId,
            riskLevel: aiResult.riskLevel,
            score: aiResult.score,
            factors: aiResult.factors as any
        }
    });

    // 5. Intelligent Interventions (AI suggested)
    // We only inject new interventions if they don't already exist in PENDING for this student
    for (const rec of aiResult.recommendations) {
        const existing = await prisma.academicIntervention.findFirst({
            where: {
                studentId,
                title: rec.title,
                status: 'PENDING'
            }
        });

        if (!existing) {
            await prisma.academicIntervention.create({
                data: {
                    studentId,
                    title: rec.title,
                    description: rec.description,
                    type: rec.type,
                    status: 'PENDING'
                }
            });
        }
    }

    return { riskControl, interventions: aiResult.recommendations };
};

export const getStudentSentinelState = async (studentId: string) => {
    const risk = await prisma.academicRisk.findUnique({
        where: { studentId }
    });

    const interventions = await prisma.academicIntervention.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' }
    });

    return { risk, interventions };
};

export const updateInterventionStatus = async (interventionId: string, status: string) => {
    return prisma.academicIntervention.update({
        where: { id: interventionId },
        data: { 
            status,
            completedAt: status === 'COMPLETED' ? new Date() : null
        }
    });
};

export const bulkCreateInterventions = async (studentIds: string[], data: { title: string, description: string, type: string }) => {
    const interventions = studentIds.map(studentId => ({
        studentId,
        title: data.title,
        description: data.description,
        type: data.type,
        status: 'PENDING'
    }));

    return prisma.academicIntervention.createMany({
        data: interventions,
        skipDuplicates: true
    });
};

export const simulatePolicyImpact = async (classId: string, parameters: { attendanceThreshold: number, engagementThreshold: number }) => {
    const targetClass = await prisma.class.findUnique({
        where: { id: classId },
        include: {
            division: {
                include: {
                    studentAssignments: {
                        include: {
                            student: {
                                include: {
                                    academicRisk: true,
                                    attendance: { take: 20 },
                                    submissions: { take: 10 }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!targetClass) throw new Error('Class not found');

    const students = targetClass.division.studentAssignments.map(sa => sa.student).filter(s => s.academicRisk);
    
    const beforeStats = { SAFE: 0, AT_RISK: 0, CRITICAL: 0 };
    const afterStats = { SAFE: 0, AT_RISK: 0, CRITICAL: 0 };

    students.forEach(student => {
        const currentLevel = student.academicRisk?.riskLevel || 'SAFE';
        beforeStats[currentLevel as keyof typeof beforeStats]++;

        let simulatedScore = student.academicRisk?.score || 0;

        // 1. Attendance Logic
        const attRecords = student.attendance;
        const attRate = attRecords.length > 0 
            ? (attRecords.filter(r => r.status === 'PRESENT' || r.status === 'EXCUSED').length / attRecords.length) * 100 
            : 90;
        
        if (attRate < parameters.attendanceThreshold) {
            simulatedScore += (parameters.attendanceThreshold - attRate) * 1.5;
        }

        // 2. Engagement Logic
        const subRecords = student.submissions;
        const subRate = subRecords.length > 0
            ? (subRecords.filter(s => s.status === 'SUBMITTED' || s.status === 'GRADED').length / subRecords.length) * 100
            : 100;

        if (subRate < parameters.engagementThreshold) {
            simulatedScore += (parameters.engagementThreshold - subRate) * 1.2;
        }

        const simulatedLevel = simulatedScore > 75 ? 'CRITICAL' : simulatedScore > 40 ? 'AT_RISK' : 'SAFE';
        afterStats[simulatedLevel as keyof typeof afterStats]++;
    });

    return {
        before: beforeStats,
        after: afterStats,
        insights: {
            riskSurge: ((afterStats.CRITICAL + afterStats.AT_RISK) - (beforeStats.CRITICAL + beforeStats.AT_RISK)),
            affectedStudents: students.length
        }
    };
};
