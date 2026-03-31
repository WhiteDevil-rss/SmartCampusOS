import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { predictResourceUsage } from '../services/ai.service';
import * as sentinelService from '../services/academic-sentinel.service';
import * as facultyIntelligence from '../services/faculty-intelligence.service';

/**
 * Get aggregated analytics for a department.
 * Uses entityId from the authenticated user to resolve the department.
 */
export const getDepartmentAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const departmentId = req.user?.entityId;
        if (!departmentId) {
            return res.status(403).json({ error: 'Unauthorized: Department context missing' });
        }

        // 1. Enrollment Trends (simulated historical + real current count)
        const currentStudentCount = await prisma.student.count({
            where: { departmentId }
        });

        const currentYear = new Date().getFullYear();
        const enrollmentTrends = Array.from({ length: 5 }).map((_, i) => ({
            year: (currentYear - 4 + i).toString(),
            students: Math.floor(currentStudentCount * (0.6 + i * 0.1) + Math.random() * 50)
        }));
        // Ensure the current year reflects ground truth
        enrollmentTrends[4].students = currentStudentCount;

        // 2. Average SGPA by Batch (using Result records)
        const batches = await prisma.batch.findMany({
            where: { departmentId },
            select: {
                id: true,
                name: true
            }
        });

        const cgpaDistribution = await Promise.all(
            batches.map(async (batch) => {
                const results = await prisma.result.findMany({
                    where: {
                        student: { batchId: batch.id }
                    },
                    select: { sgpa: true }
                });

                const avgSgpa = results.length > 0
                    ? Number((results.reduce((acc: number, r: { sgpa: number }) => acc + r.sgpa, 0) / results.length).toFixed(2))
                    : 0;

                return {
                    batch: batch.name,
                    avgCgpa: avgSgpa
                };
            })
        );

        // 3. Faculty Course Load (count of FacultySubject entries per faculty in this dept)
        const facultyDepts = await prisma.facultyDepartment.findMany({
            where: { departmentId },
            select: {
                faculty: {
                    select: {
                        name: true,
                        _count: {
                            select: { subjects: true }
                        }
                    }
                }
            }
        });

        const facultyCourseLoad = facultyDepts.map(fd => ({
            name: fd.faculty.name.split(' ')[0], // First name for chart compactness
            courses: fd.faculty._count.subjects
        }));

        res.json({
            enrollmentTrends,
            cgpaDistribution,
            facultyCourseLoad,
            summary: {
                totalStudents: currentStudentCount,
                totalFaculty: facultyDepts.length,
                totalBatches: batches.length
            }
        });

    } catch (error) {
        console.error('Failed to get department analytics:', error);
        res.status(500).json({ error: 'Failed to generate analytics' });
    }
};

export const getStudentAtRisk = async (req: AuthRequest, res: Response) => {
    try {
        const departmentId = req.params.departmentId as string;

        // Fetch students in the department
        const students = await prisma.student.findMany({
            where: { departmentId },
            select: { id: true }
        });

        // Trigger Sentinel for each student (This could be a background job later)
        const riskData = await Promise.all(
            students.map(async (s) => {
                const refreshed = await sentinelService.refreshStudentSentinel(s.id);
                const student = await prisma.student.findUnique({
                    where: { id: s.id },
                    include: { program: true, batch: true, academicRisk: true }
                });
                
                return {
                    id: student?.id,
                    name: student?.name,
                    enrollmentNo: student?.enrollmentNo,
                    program: student?.program.name,
                    semester: student?.batch.semester,
                    riskScore: student?.academicRisk?.score || 0,
                    riskCategory: student?.academicRisk?.riskLevel || 'SAFE',
                    lastAnalyzed: student?.academicRisk?.lastAnalyzed
                };
            })
        );

        res.json(riskData);
    } catch (error) {
        console.error('Failed to get student risk analytics:', error);
        res.status(500).json({ error: 'Failed to generate risk analytics' });
    }
};

/**
 * Get sentinel state for a specific student (Dashboard)
 */
export const getStudentSentinel = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.entityId;
        if (!studentId) return res.status(403).json({ error: 'Student context required' });

        // Auto-refresh on access to ensure latest AI insights
        await sentinelService.refreshStudentSentinel(studentId);
        const state = await sentinelService.getStudentSentinelState(studentId);
        
        res.json(state);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update intervention status (e.g. acknowledge or complete)
 */
export const updateIntervention = async (req: AuthRequest, res: Response) => {
    try {
        const { interventionId } = req.params;
        const { status } = req.body;
        
        if (typeof interventionId !== 'string') {
           return res.status(400).json({ error: 'Invalid intervention ID' });
        }
        
        const updated = await sentinelService.updateInterventionStatus(interventionId, status as string);
        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Get longitudinal performance trends for results across batches.
 */
export const getResultTrends = async (req: AuthRequest, res: Response) => {
    try {
        const departmentId = (req.params.departmentId as string) || (req.user?.entityId as string);

        // Fetch results for students in this department over multiple semesters
        const students = await prisma.student.findMany({
            where: { departmentId },
            include: {
                results: {
                    orderBy: { semester: 'asc' }
                },
                program: true,
                batch: true
            }
        });

        // Aggregating by Batch and Semester
        const trendsMap: Record<string, Record<number, { totalSgpa: number, count: number }>> = {};

        students.forEach((student: any) => {
            const batchName = student.batch.name;
            if (!trendsMap[batchName]) trendsMap[batchName] = {};

            student.results.forEach((res: any) => {
                const sem = res.semester;
                if (!trendsMap[batchName][sem]) {
                    trendsMap[batchName][sem] = { totalSgpa: 0, count: 0 };
                }
                trendsMap[batchName][sem].totalSgpa += res.sgpa;
                trendsMap[batchName][sem].count += 1;
            });
        });

        // Formatting for Recharts
        const chartData: any[] = [];
        // Unique semesters across all batches
        const allSemesters = Array.from(new Set(students.flatMap(s => s.results.map(r => r.semester)))).sort((a, b) => a - b);

        allSemesters.forEach(sem => {
            const dataPoint: any = { semester: `Sem ${sem}` };
            Object.keys(trendsMap).forEach(batchName => {
                if (trendsMap[batchName][sem]) {
                    dataPoint[batchName] = Number((trendsMap[batchName][sem].totalSgpa / trendsMap[batchName][sem].count).toFixed(2));
                }
            });
            chartData.push(dataPoint);
        });

        // Course difficulty analysis (failure rate per course)
        const subjectResults = await prisma.subjectResult.findMany({
            where: {
                result: {
                    student: { departmentId }
                }
            },
            include: { course: true }
        });

        const subjectStats: Record<string, { total: number, fails: number }> = {};
        subjectResults.forEach((sr: any) => {
            const name = sr.course.name;
            if (!subjectStats[name]) subjectStats[name] = { total: 0, fails: 0 };
            subjectStats[name].total += 1;
            if (sr.grade === 'F') subjectStats[name].fails += 1;
        });

        const difficultyIndex = Object.keys(subjectStats).map(name => ({
            subject: name,
            failRate: Number(((subjectStats[name].fails / subjectStats[name].total) * 100).toFixed(1)),
            avgMarks: 0 // Could calc this too if needed
        })).sort((a, b) => b.failRate - a.failRate).slice(0, 10);

        res.json({
            longitudinal: chartData,
            difficultyHeatmap: difficultyIndex
        });

    } catch (error) {
        console.error('Failed to get result trends:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * AI-Driven Predictive Resource Management
 * Analyzes historical attendance vs current schedule to forecast overcrowding.
 */
export const getResourceForecast = async (req: AuthRequest, res: Response) => {
    try {
        const departmentId = typeof req.params.departmentId === 'string' ? req.params.departmentId : (req.params.departmentId as any)[0];
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // 1. Fetch Active Timetable & Slots
        const timetable = await prisma.timetable.findFirst({
            where: { departmentId, status: 'ACTIVE' },
            include: { slots: { where: { isBreak: false } } }
        });

        if (!timetable) {
            return res.status(404).json({ error: 'No active timetable found for forecasting.' });
        }

        // 2. Aggregate Historical Attendance (Last 30 Days)
        // Grouped by (Course, Day, Slot)
        const attendanceData = await prisma.attendanceRecord.findMany({
            where: {
                session: {
                    date: { gte: thirtyDaysAgo },
                    timetableSlot: {
                        timetable: { departmentId }
                    }
                }
            },
            include: {
                session: {
                    include: {
                        timetableSlot: true
                    }
                }
            }
        });

        const historyMap: Record<string, { total: number, present: number }> = {};
        attendanceData.forEach(rec => {
            const slot = rec.session.timetableSlot;
            const key = `${slot.courseId}_${slot.dayOfWeek}_${slot.slotNumber}`;
            if (!historyMap[key]) historyMap[key] = { total: 0, present: 0 };
            historyMap[key].total++;
            if (rec.status === 'PRESENT' || rec.status === 'EXCUSED') {
                historyMap[key].present++;
            }
        });

        const history = Object.keys(historyMap).map(key => {
            const [courseId, day, slot] = key.split('_');
            const data = historyMap[key];
            return {
                courseId: courseId === 'null' ? null : courseId,
                dayOfWeek: parseInt(day),
                slotNumber: parseInt(slot),
                attendancePercentage: data.total > 0 ? (data.present / data.total) : 0.85
            };
        });

        // 3. Resource Snapshots
        const resources = await prisma.resource.findMany({
            where: { universityId: timetable.universityId }
        });

        // 4. Construct Payload
        const payload = {
            departmentId,
            slots: timetable.slots.map(s => ({
                dayOfWeek: s.dayOfWeek,
                slotNumber: s.slotNumber,
                courseId: s.courseId,
                roomId: s.roomId,
                batchId: s.divisionId,
                isBreak: s.isBreak
            })),
            history,
            resources: resources.map(r => ({
                resourceId: r.id,
                capacity: r.capacity || 50,
                currentAllocation: 0 // Will be derived by AI
            }))
        };

        // 5. Call AI Engine
        const forecast = await predictResourceUsage(payload);

        res.json(forecast);
    } catch (error) {
        console.error('Resource Forecast Failed:', error);
        res.status(500).json({ error: 'Failed to generate resource forecast' });
    }
};

/**
 * Phase 16: Faculty Intelligence - Get class-level risk analytics and AI pedagogy
 */
export const getClassInsights = async (req: AuthRequest, res: Response) => {
    try {
        const courseId = req.params.courseId as string;
        const facultyId = req.user?.entityId as string;

        if (!facultyId || !courseId) {
            return res.status(400).json({ error: 'Faculty ID or Course ID missing' });
        }

        const [analytics, aiInsights] = await Promise.all([
            facultyIntelligence.getClassAnalytics(facultyId, courseId),
            facultyIntelligence.getPedagogicalInsights(facultyId, courseId)
        ]);

        res.json({
            analytics,
            aiInsights
        });
    } catch (error) {
        console.error('Class Insights Failed:', error);
        res.status(500).json({ error: 'Failed to generate class insights' });
    }
};

/**
 * Phase 16: Admin Command Center - Get department-wide risk map
 */
export const getDepartmentRiskMap = async (req: AuthRequest, res: Response) => {
    try {
        const departmentId = (req.params.departmentId as string) || (req.user?.entityId as string);
        if (!departmentId) {
            return res.status(400).json({ error: 'Department ID missing' });
        }

        const riskMap = await facultyIntelligence.getDepartmentRiskMap(departmentId);
        res.json(riskMap);
    } catch (error) {
        console.error('Department Risk Map Failed:', error);
        res.status(500).json({ error: 'Failed to generate department risk map' });
    }
};

/**
 * Phase 16: Faculty Intelligence - Trigger mass interventions for a segment
 */
export const triggerBulkIntervention = async (req: AuthRequest, res: Response) => {
    try {
        const { studentIds, title, description, type } = req.body;

        if (!studentIds || !Array.isArray(studentIds) || !studentIds.length) {
            return res.status(400).json({ error: 'Student IDs must be a non-empty array' });
        }

        if (!title || !description || !type) {
            return res.status(400).json({ error: 'Intervention template data missing' });
        }

        const result = await sentinelService.bulkCreateInterventions(studentIds, { 
            title, 
            description, 
            type 
        });

        res.json({ 
            success: true, 
            count: result.count,
            message: `Successfully dispatched ${result.count} interventions.`
        });
    } catch (error: any) {
        console.error('Bulk Intervention Trigger Failed:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Phase 17: AI Policy Simulator - Simulate impact of policy changes on risk distribution
 */
export const simulatePolicy = async (req: AuthRequest, res: Response) => {
    try {
        const { classId, attendanceThreshold, engagementThreshold } = req.body;

        if (!classId) {
            return res.status(400).json({ error: 'Class ID missing' });
        }

        const simulation = await sentinelService.simulatePolicyImpact(classId, {
            attendanceThreshold: attendanceThreshold || 75,
            engagementThreshold: engagementThreshold || 70
        });

        res.json(simulation);
    } catch (error: any) {
        console.error('Simulation Matrix Failed:', error);
        res.status(500).json({ error: error.message });
    }
};
