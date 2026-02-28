import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up legacy faculty-subject mappings...');

    const deletedCount = await prisma.facultySubject.deleteMany({});

    console.log(`Successfully removed ${deletedCount.count} subject assignments.`);
    console.log('Finalizing database integrity...');
}

main()
    .catch((e) => {
        console.error('Cleanup failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
