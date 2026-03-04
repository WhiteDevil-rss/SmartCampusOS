
import { PrismaClient } from './generated/client';

const prisma = new PrismaClient();

async function diagnoseDepartment(departmentId: string) {
    console.log(`--- Diagnostics for Department: ${departmentId} ---`);

    try {
        const [batches, faculty, courses, resources, electiveBaskets, timeBlocks] = await Promise.all([
            prisma.batch.findMany({ where: { departmentId } }),
            prisma.faculty.findMany({
                where: { departments: { some: { departmentId } } },
                include: { subjects: { include: { course: true } } }
            }),
            prisma.course.findMany({ where: { departmentId } }),
            prisma.resource.findMany({ where: { universityId: 'b76a8c7f-698a-489c-9e8e-a4c86b4bbe83' } }), // Hardcoded university ID from log
            prisma.electiveBasket.findMany({
                where: { departmentId },
                include: { facultyPairs: true, options: { include: { course: true } } }
            }),
            prisma.timeBlock.findMany({ where: { departmentId } })
        ]);

        console.log(`\n--- BATCHES (${batches.length}) ---`);
        batches.forEach(b => console.log(`- ${b.name} (${b.program}, Sem ${b.semester})`));

        console.log(`\n--- COURSES (${courses.length}) ---`);
        courses.forEach(c => console.log(`- ${c.code}: ${c.name} (${c.weeklyHrs} hrs, ${c.type}, ${c.program}, Sem ${c.semester}, Elective: ${c.isElective}, LabDur: ${c.labDuration})`));

        console.log(`\n--- FACULTY (${faculty.length}) ---`);
        faculty.forEach(f => {
            console.log(`- ${f.name} (Availability: ${JSON.stringify(f.availability)})`);
            f.subjects.forEach(s => console.log(`  * ${s.course.code}: ${s.course.name} (Primary: ${s.isPrimary})`));
        });

        console.log(`\n--- RESOURCES (${resources.length}) ---`);
        resources.forEach(r => console.log(`- ${r.name} (${r.type}, Cap: ${r.capacity})`));

        console.log(`\n--- ELECTIVE BASKETS (${electiveBaskets.length}) ---`);
        electiveBaskets.forEach(bk => {
            console.log(`- ${bk.name} (${bk.weeklyHrs} hrs, ${bk.program}, Sem ${bk.semester})`);
            bk.options.forEach(opt => console.log(`  * Option: ${opt.course.name} (Enrolled: ${opt.enrollmentCount})`));
            bk.facultyPairs.forEach(fp => console.log(`  * Faculty Pair: ${fp.faculty1Id} & ${fp.faculty2Id} on Day ${fp.dayOfWeek}`));
        });

        console.log(`\n--- TIME BLOCKS (${timeBlocks.length}) ---`);
        timeBlocks.forEach(tb => console.log(`- ${tb.startTime} - ${tb.endTime} (Break: ${tb.isBreak}, Slot: ${tb.slotNumber})`));

        // Basic Constraint Check
        console.log(`\n--- BASIC CAPACITY CHECK ---`);
        for (const batch of batches) {
            const batchCourses = courses.filter(c =>
                (c.program === batch.program || !c.program) &&
                (c.semester === batch.semester || c.semester === 0) &&
                !c.isElective
            );
            const batchElectives = electiveBaskets.filter(bk =>
                (bk.program === batch.program || !bk.program) &&
                (bk.semester === batch.semester || bk.semester === 0)
            );

            const totalReqHrs = batchCourses.reduce((sum, c) => sum + c.weeklyHrs, 0) +
                batchElectives.reduce((sum, bk) => sum + bk.weeklyHrs, 0);

            // Assume 6 days, 3 slots per day = 18 slots. 
            // Each slot is 2 hours.
            const availableSlots = timeBlocks.filter(tb => !tb.isBreak).length * 6; // Crude estimate
            console.log(`Batch ${batch.name}: Required Weekly Hrs: ${totalReqHrs}. Available Slots Estimate: ${availableSlots * 2} hrs (assuming 2hr slots)`);

            if (totalReqHrs > availableSlots * 2) {
                console.log(`[WARNING] Batch ${batch.name} might be overloaded!`);
            }
        }

    } catch (e) {
        console.error("Diagnostics failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

diagnoseDepartment('5323988e-1afd-4ed7-b8ee-6aea99077592');
