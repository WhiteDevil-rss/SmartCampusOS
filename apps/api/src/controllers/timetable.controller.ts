import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { callAiEngine } from '../services/ai.service';
import { createClient } from 'redis';
import { socketService } from '../services/socket.service';
import { logActivity } from '../lib/logger';

const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.connect().catch(console.error);

export const generateTimetable = async (req: AuthRequest, res: Response) => {
    try {
        const {
            departmentId,
            excludedFacultyIds = [],
            excludedRoomIds = [],
            excludedDayIds = [],
            semesterFilter = 'all',
            selectedBatchIds = [],
            selectedDivisionIds = [],
            continuousMode = 'balanced',
            generationType = 'NORMAL',
            lockedSlots = []
        } = req.body;
        const { config } = req.body;

        if (req.user!.role === 'DEPT_ADMIN' && req.user!.entityId !== departmentId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const lockKey = `lock:generate:${departmentId}`;
        let acquired: any = 'OK';

        if (redisClient.isOpen) {
            try {
                acquired = await redisClient.set(lockKey, 'LOCKED', { NX: true, EX: 60 });
            } catch (e) {
                console.error('Redis Lock Error:', e);
            }
        }

        if (!acquired) {
            return res.status(409).json({ error: 'A timetable generation is already in progress.' });
        }

        try {
            const buildSemesterCondition = () => {
                if (semesterFilter === 'odd') return { in: [1, 3, 5, 7, 9] };
                if (semesterFilter === 'even') return { in: [2, 4, 6, 8, 10] };
                return undefined;
            };

            const semesterCondition = buildSemesterCondition();

            // Parallel Data Fetching with Division Logic
            const [divisions, faculty, targetDept, electiveBaskets, timeBlocks, sessionTypes] = await Promise.all([
                prisma.division.findMany({
                    where: {
                        batch: {
                            departmentId,
                            ...(selectedBatchIds.length > 0 ? { id: { in: selectedBatchIds } } : (semesterCondition ? { semester: semesterCondition } : {}))
                        },
                        ...(selectedDivisionIds.length > 0 ? { id: { in: selectedDivisionIds } } : {})
                    },
                    include: { batch: true, classes: { include: { subject: true } } }
                }),
                prisma.faculty.findMany({
                    where: { departments: { some: { departmentId } } },
                    include: { subjects: { include: { course: true } } }
                }),
                prisma.department.findUnique({ where: { id: departmentId } }),
                prisma.electiveBasket.findMany({
                    where: { departmentId },
                    include: {
                        facultyPairs: true,
                        options: {
                            include: {
                                course: true,
                                subgroups: true,
                            },
                        },
                    },
                }),
                prisma.timeBlock.findMany({ where: { departmentId }, orderBy: { slotNumber: 'asc' } }),
                prisma.sessionType.findMany({ where: { departmentId } }),
            ]);

            if (divisions.length === 0) {
                return res.status(400).json({ error: 'No divisions found for selection.' });
            }

            const universityId = targetDept!.universityId;
            const resources = await prisma.resource.findMany({ where: { universityId } });

            // Identify special requirement courses
            const electiveCourseIds = new Set<string>();
            electiveBaskets.forEach((bk: any) => {
                bk.options?.forEach((opt: any) => {
                    if (opt.course?.id) electiveCourseIds.add(opt.course.id);
                });
            });

            // STRUCTURE PAYLOAD FOR AI ENGINE (Mapping Division -> Batch for backward matching if needed)
            const payload = {
                departmentId,
                generationType,
                config: { ...(config || {}), continuousMode, timeBlocks, useCustomBlocks: timeBlocks.length > 0 },
                faculty: faculty.map((f: any) => ({
                    id: f.id,
                    availability: f.availability || [],
                    subjects: f.subjects.map((s: any) => ({ courseId: s.courseId, isPrimary: s.isPrimary }))
                })),
                courses: divisions.flatMap(d => d.classes.map(c => ({
                    id: c.subject.id,
                    name: c.subject.name,
                    code: c.subject.code,
                    weeklyHrs: c.subject.weeklyHrs,
                    type: c.subject.type,
                    isElective: c.subject.isElective || electiveCourseIds.has(c.subject.id),
                    labDuration: c.subject.labDuration
                }))),
                // Important: Maps Divisions as "Batches" to the AI engine for slotting
                batches: divisions.map(d => ({
                    id: d.id, // Using Division ID as the scheduling unit
                    name: `${d.batch.name} - ${d.name}`,
                    strength: d.capacity,
                    program: d.batch.program,
                    semester: d.batch.semester
                })),
                resources: resources.map(r => ({ id: r.id, name: r.name, type: r.type, capacity: r.capacity })),
                excludedFacultyIds,
                excludedRoomIds,
                excludedDayIds,
                lockedSlots,
                electiveBaskets: electiveBaskets.map(bk => ({
                    basketId: bk.id,
                    divisionIds: divisions.filter(d => 
                        (!bk.program || d.batch.program === bk.program) && 
                        (!bk.semester || d.batch.semester === bk.semester)
                    ).map(d => d.id),
                    options: bk.options.map((opt: any) => ({
                        optionId: opt.id,
                        courseId: opt.course.id,
                        enrollmentCount: opt.enrollmentCount
                    }))
                }))
            };

            const startTime = Date.now();
            const aiResponse = await callAiEngine(payload);
            const generationMs = Date.now() - startTime;

            if (aiResponse.status === 'INFEASIBLE') {
                return res.status(422).json({ error: aiResponse.message });
            }

            // Save Timetable
            const savedTimetable = await prisma.$transaction(async (tx) => {
                const newTt = await tx.timetable.create({
                    data: {
                        universityId,
                        departmentId,
                        configJson: { ...(config || {}), metrics: aiResponse.metrics },
                        generationMs,
                        conflictCount: aiResponse.conflictCount || 0,
                        status: 'ACTIVE'
                    }
                });

                const slotsData: any[] = [];
                aiResponse.slots.forEach((s: any) => {
                    const blockId = s.blockId || (s.isBreak && timeBlocks.find(tb => tb.slotNumber === s.slotNumber)?.id) || null;

                    if (s.isBreak && !s.batchId) { // Global break
                        divisions.forEach(d => {
                            slotsData.push({
                                timetableId: newTt.id,
                                dayOfWeek: s.dayOfWeek,
                                slotNumber: s.slotNumber,
                                startTime: s.startTime,
                                endTime: s.endTime,
                                divisionId: d.id,
                                batchId: d.batchId,
                                isBreak: true,
                                slotType: "BREAK",
                                blockId
                            });
                        });
                    } else {
                        // Find Class ID for this subject-division pair
                        const div = divisions.find(d => d.id === s.batchId);
                        const cls = div?.classes.find(c => c.subjectId === s.courseId);

                        slotsData.push({
                            timetableId: newTt.id,
                            dayOfWeek: s.dayOfWeek,
                            slotNumber: s.slotNumber,
                            startTime: s.startTime,
                            endTime: s.endTime,
                            courseId: s.courseId || null,
                            facultyId: s.facultyId || null,
                            faculty2Id: s.faculty2Id || null,
                            roomId: s.roomId || null,
                            divisionId: s.batchId, // batchId in AI response maps to our DivisionId
                            batchId: div?.batchId || null,
                            classId: cls?.id || null,
                            isBreak: s.isBreak || false,
                            slotType: s.slotType || "THEORY",
                            isElective: s.isElective || false,
                            basketId: s.basketId || null,
                            optionId: s.optionId || null,
                            blockId
                        });
                    }
                });

                await tx.timetableSlot.createMany({ data: slotsData });

                socketService.broadcastTimetableGenerated(departmentId, {
                    timetableId: newTt.id,
                    generationMs
                });

                return newTt;
            });

            if (redisClient.isOpen) await redisClient.del(`latest_timetable:${departmentId}`);

            res.status(200).json({ message: "Timetable Generated", timetable: savedTimetable });

            logActivity(req.user!.id, req.user!.role, 'TIMETABLE_GENERATE', { timetableId: savedTimetable.id, departmentId });

        } finally {
            if (redisClient.isOpen) await redisClient.del(lockKey);
        }

    } catch (error: any) {
        console.error("Generate Error:", error);
        res.status(500).json({ error: error.message || 'Failed to generate timetable' });
    }
};

export const getLatestTimetable = async (req: AuthRequest, res: Response) => {
    try {
        const departmentId = String(req.params.departmentId);
        const { divisionId, facultyId, classId } = req.query;

        const timetable = await prisma.timetable.findFirst({
            where: { departmentId, status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            include: {
                slots: {
                    where: {
                        ...(divisionId ? { divisionId: String(divisionId) } : {}),
                        ...(facultyId ? { facultyId: String(facultyId) } : {}),
                        ...(classId ? { classId: String(classId) } : {})
                    },
                    include: {
                        faculty: { select: { name: true } },
                        faculty2: { select: { name: true } },
                        room: { select: { name: true } },
                        division: { select: { name: true, batch: { select: { name: true } } } },
                        class: { include: { subject: true, faculty: { select: { name: true } }, division: { include: { batch: true } } } },
                        block: true
                    },
                    orderBy: [{ dayOfWeek: 'asc' }, { slotNumber: 'asc' }]
                }
            }
        });

        if (timetable && 'slots' in timetable) {
            // Map 'class' to 'classRecord' for frontend
            (timetable as any).slots = (timetable as any).slots.map((s: any) => ({
                ...s,
                classRecord: s.class
            }));
        }

        res.status(200).json(timetable);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch timetable' });
    }
};

export const listTimetables = async (req: AuthRequest, res: Response) => {
    try {
        const timetables = await prisma.timetable.findMany({
            where: { departmentId: String(req.params.departmentId) },
            orderBy: { createdAt: 'desc' },
            select: { id: true, status: true, createdAt: true, conflictCount: true }
        });
        res.json(timetables);
    } catch (error) {
        res.status(500).json({ error: 'Failed to list timetables' });
    }
};

export const getTimetableById = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const departmentId = req.params.departmentId as string;
        const { divisionId, facultyId } = req.query;

        const timetable = await prisma.timetable.findUnique({
            where: { id },
            include: {
                slots: {
                    where: {
                        ...(divisionId ? { divisionId: String(divisionId) } : {}),
                        ...(facultyId ? { facultyId: String(facultyId) } : {})
                    },
                    include: {
                        division: { select: { name: true, batch: { select: { name: true } } } },
                        class: { include: { subject: true, faculty: { select: { name: true } }, division: { include: { batch: true } } } },
                        block: true
                    },
                    orderBy: [{ dayOfWeek: 'asc' }, { slotNumber: 'asc' }]
                }
            }
        });

        if (!timetable || (departmentId !== 'all' && timetable.departmentId !== departmentId)) {
            return res.status(404).json({ error: 'Not found' });
        }

        if (timetable && 'slots' in timetable) {
            // Map 'class' to 'classRecord' for frontend
            (timetable as any).slots = (timetable as any).slots.map((s: any) => ({
                ...s,
                classRecord: s.class
            }));
        }

        res.json(timetable);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};
