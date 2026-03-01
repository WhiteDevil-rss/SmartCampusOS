import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Initializing Global Settings...');
    const settings = await prisma.globalSettings.upsert({
        where: { id: 'system-config' },
        update: {},
        create: {
            id: 'system-config',
            platformName: 'Zembaa.AI Scheduler',
            supportEmail: 'support@zembaa.ai',
            maintenanceMode: false,
            sessionTimeout: 600,
            mfaEnabled: false,
            logRetention: '30',
            autoBackups: false,
        },
    });
    console.log('Global Settings Seeded:', settings);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
