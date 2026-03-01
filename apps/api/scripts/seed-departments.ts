import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding ONLY departments from seed-data.json...');

    // Read the seed data file
    const dataPath = path.join(__dirname, '../prisma/seed-data.json');
    if (!fs.existsSync(dataPath)) {
        console.error(`Seed data file not found at: ${dataPath}`);
        process.exit(1);
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const seedData = JSON.parse(rawData);

    if (!seedData.departments || seedData.departments.length === 0) {
        console.log('No departments found in seed-data.json.');
        return;
    }

    for (const dept of seedData.departments) {
        // We use upsert so it doesn't fail if the department already exists
        await prisma.department.upsert({
            where: { id: dept.id },
            update: {
                name: dept.name,
                shortName: dept.shortName,
                hod: dept.hod,
                email: dept.email,
                adminUserId: dept.adminUserId,
                universityId: dept.universityId
            },
            create: {
                id: dept.id,
                name: dept.name,
                shortName: dept.shortName,
                hod: dept.hod,
                email: dept.email,
                adminUserId: dept.adminUserId,
                universityId: dept.universityId,
                createdAt: dept.createdAt
            }
        });
        console.log(`✅ Seeded Department: ${dept.name} (${dept.shortName})`);
    }

    console.log(`\n🎉 Successfully seeded ${seedData.departments.length} departments!`);
}

main()
    .catch((e) => {
        console.error('Failed to seed departments:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
