
import { PrismaClient } from './generated/client';
import axios from 'axios';

const prisma = new PrismaClient();
const AI_ENGINE_URL = 'http://localhost:5000';

async function verifyFix(departmentId: string) {
    console.log(`--- Verifying Fix for Department: ${departmentId} ---`);

    try {
        const [batches, faculty, targetDept, electiveBaskets, timeBlocks, sessionTypes] = await Promise.all([
            prisma.batch.findMany({ where: { departmentId } }),
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
                            subgroups: true
                        }
                    }
                }
            }),
            prisma.timeBlock.findMany({ where: { departmentId }, orderBy: { slotNumber: 'asc' } }),
            prisma.sessionType.findMany({ where: { departmentId } })
        ]);

        const batchIds = batches.map(b => b.id);
        const programSemesterPairs = batches.map((b: any) => ({ program: b.program, semester: b.semester }));

        const courses = await prisma.course.findMany({
            where: {
                departmentId,
                AND: [
                    {
                        OR: [
                            ...programSemesterPairs.map((p: any) => ({
                                AND: [
                                    { OR: [{ program: p.program }, { program: null }] },
                                    { OR: [{ semester: p.semester }, { semester: null }] }
                                ]
                            })),
                            { program: null, semester: null }
                        ]
                    }
                ]
            }
        });

        const resources = await prisma.resource.findMany({ where: { universityId: targetDept!.universityId } });

        const payload = {
            faculty: faculty.map(f => ({
                id: f.id,
                name: f.name,
                subjects: f.subjects.map(s => ({ courseId: s.courseId })),
                availability: [] // Fully available for testing
            })),
            courses: courses.map(c => ({
                id: c.id,
                code: c.code,
                name: c.name,
                type: c.type,
                weeklyHrs: c.weeklyHrs,
                program: c.program,
                semester: c.semester,
                isElective: c.isElective,
                labDuration: c.labDuration,
                requiredRoomType: c.requiredRoomType,
                sessionTypeId: c.sessionTypeId
            })),
            batches: batches.map(b => ({
                id: b.id,
                name: b.name,
                strength: b.strength,
                program: b.program,
                semester: b.semester
            })),
            resources: resources.map(r => ({
                id: r.id,
                name: r.name,
                capacity: r.capacity || 1000,
                type: r.type
            })),
            config: {
                startTime: "10:30",
                endTime: "19:00",
                lectureDuration: 120,
                breakDuration: 30,
                numberOfBreaks: 1,
                daysPerWeek: 6,
                useCustomBlocks: false, // Use generated blocks for now
                timeBlocks: []
            },
            electiveBaskets: electiveBaskets.map(bk => ({
                basketId: bk.id,
                subjectCode: bk.subjectCode,
                name: bk.name,
                semester: bk.semester,
                program: bk.program,
                weeklyHrs: bk.weeklyHrs,
                divisionIds: batchIds, // Link all divisions
                options: bk.options.map(opt => ({
                    optionId: opt.id,
                    courseId: opt.courseId,
                    enrollmentCount: opt.enrollmentCount,
                    facultyId: opt.facultyId,
                    subgroups: opt.subgroups.map(sg => ({
                        subgroupId: sg.id,
                        name: sg.subgroupId,
                        enrollmentCount: sg.enrollmentCount
                    }))
                })),
                facultyPairs: bk.facultyPairs.map(fp => ({
                    faculty1Id: fp.faculty1Id,
                    faculty2Id: fp.faculty2Id,
                    dayOfWeek: fp.dayOfWeek
                }))
            }))
        };

        console.log("\nCalling AI Engine...");
        const response = await axios.post(`${AI_ENGINE_URL}/solve`, payload);

        console.log("\n--- AI Engine Response ---");
        console.log("Status:", response.data.status);
        console.log("Message:", response.data.message);
        console.log("Solve Time (ms):", response.data.solveTimeMs);
        const slots = response.data.slots || [];
        console.log("Slots Scheduled:", slots.length);

        if (slots.length > 0) {
            console.log("\nFirst 5 slots of the generated timetable:");
            slots.slice(0, 5).forEach((s: any) => {
                console.log(`- Day ${s.dayOfWeek}, Slot ${s.slotNumber} (${s.startTime}-${s.endTime}): Course ${s.courseId} in Room ${s.roomId} for Batch ${s.batchId}`);
            });
        }

        if (response.data.status === 'INFEASIBLE') {
            console.log("\nSTILL INFEASIBLE. Reviewing Engine Logs...");
        } else {
            console.log("\nSUCCESS! Timetable found.");
        }

    } catch (e: any) {
        console.error("Verification failed:", e.message);
        if (e.response) {
            console.error("AI Engine Error Details:", JSON.stringify(e.response.data, null, 2));
        }
    } finally {
        await prisma.$disconnect();
    }
}

verifyFix('5323988e-1afd-4ed7-b8ee-6aea99077592');
