const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- VNSGU SCHEDULER DIAGNOSTICS ---");
    
    // Find the department
    const dept = await prisma.department.findFirst({
        where: { shortName: 'DCS' }
    });
    
    if (!dept) {
        console.log("No department found!");
        return;
    }
    
    const courses = await prisma.course.findMany({ where: { departmentId: dept.id } });
    const faculty = await prisma.faculty.findMany({ 
        where: { departmentId: dept.id },
        include: { subjects: true }
    });
    const batches = await prisma.batch.findMany({ where: { departmentId: dept.id } });
    const resources = await prisma.resource.findMany({ where: { universityId: dept.universityId } });
    
    console.log(`DEPT: ${dept.name}`);
    console.log(`COURSES: ${courses.length} (Total Weekly Hrs: ${courses.reduce((acc, c) => acc + c.weeklyHrs, 0)})`);
    console.log(`FACULTY: ${faculty.length}`);
    faculty.forEach(f => console.log(`  - ${f.name} (Max: ${f.maxHrsPerWeek} hrs/wk, Subjects: ${f.subjects.length})`));
    console.log(`BATCHES: ${batches.length}`);
    batches.forEach(b => console.log(`  - ${b.name} (Strength: ${b.strength})`));
    console.log(`RESOURCES (Rooms): ${resources.length}`);
    resources.forEach(r => console.log(`  - ${r.name} (Capacity: ${r.capacity})`));
    
    // Check if any batch exceeds max room capacity
    const maxRoomCapacity = resources.length > 0 ? Math.max(...resources.map(r => r.capacity)) : 0;
    batches.forEach(b => {
        if (b.strength > maxRoomCapacity) {
            console.log(`[WARNING] Batch '${b.name}' has strength ${b.strength} but max room capacity is ${maxRoomCapacity}!`);
        }
    });

}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
