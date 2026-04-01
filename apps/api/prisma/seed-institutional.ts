import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
    const universityId = 'b76a8c7f-698a-489c-9e8e-a4c86b4bbe83';
    const deptId = '5323988e-1afd-4ed7-b8ee-6aea99077592'; // Computer Science

    console.log('Seeding Institutional Finance & Resources...');

    // 1. Create Department Budget
    await prisma.departmentBudget.upsert({
        where: { departmentId_fiscalYear: { departmentId: deptId, fiscalYear: '2025-2026' } },
        update: {},
        create: {
            departmentId: deptId,
            fiscalYear: '2025-2026',
            totalAllocation: 5000000, // 5M
            currentSpending: 1250000, // 1.25M
            reserveAmount: 500000,
            status: 'ACTIVE'
        }
    });

    // 2. Ensure a Resource exists for booking
    const resource = await prisma.resource.findFirst({
        where: { universityId, type: 'LAB' }
    });

    const resourceId = resource?.id || (await prisma.resource.create({
        data: {
            universityId,
            name: 'Advanced AI Research Lab',
            type: 'LAB',
            capacity: 20,
            building: 'Tech Hub',
            floor: '4th',
            status: 'AVAILABLE'
        }
    })).id;

    // 3. Create a Faculty if not exists (checked from seed-data.json "dharmen")
    const facultyUser = await prisma.user.findFirst({ where: { username: 'dharmen' } });
    const faculty = await prisma.faculty.findFirst({ where: { userId: facultyUser?.id } });

    if (faculty) {
        // 4. Create Research Grant
        const grant = await prisma.researchGrant.create({
            data: {
                facultyId: faculty.id,
                title: 'Quantum Computing Optimization',
                agency: 'National Science Foundation',
                amount: 850000,
                status: 'ACTIVE',
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 86400000)
            }
        });

        // 5. Create Resource Bookings (Bottleneck Simulation)
        const now = new Date();
        for (let i = 1; i <= 6; i++) {
            await prisma.resourceBooking.create({
                data: {
                    resourceId,
                    userId: facultyUser!.id,
                    grantId: grant.id,
                    startTime: new Date(now.getTime() + i * 24 * 3600000), // Next few days
                    endTime: new Date(now.getTime() + i * 24 * 3600000 + 4 * 3600000), // 4 hour blocks
                    purpose: 'Large scale model training',
                    status: 'APPROVED'
                }
            });
        }
    }

    console.log('Institutional Seed Completed.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
