
import { PrismaClient } from './generated/client';

const prisma = new PrismaClient();

async function fixElectiveFlags() {
    console.log("--- Fixing Elective Flags for Courses ---");

    try {
        // Find all courses that are part of an elective option
        const electiveOptions = await prisma.electiveOption.findMany({
            include: { course: true }
        });

        console.log(`Found ${electiveOptions.length} elective options.`);

        const courseIdsToFix = electiveOptions
            .filter(opt => !opt.course.isElective)
            .map(opt => opt.courseId);

        const uniqueIds = [...new Set(courseIdsToFix)];

        if (uniqueIds.length === 0) {
            console.log("No courses need fixing. All elective options are already linked to courses marked as isElective: true.");
            return;
        }

        console.log(`Fixing ${uniqueIds.length} unique courses...`);

        const result = await prisma.course.updateMany({
            where: { id: { in: uniqueIds } },
            data: { isElective: true }
        });

        console.log(`Successfully updated ${result.count} courses.`);

    } catch (e) {
        console.error("Failed to fix elective flags:", e);
    } finally {
        await prisma.$disconnect();
    }
}

fixElectiveFlags();
