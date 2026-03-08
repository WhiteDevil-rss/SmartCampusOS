import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Granting NOTIFICATIONS:WRITE permission to UNI_ADMIN role...');

    await prisma.permission.upsert({
        where: {
            id: 'perm-uniadmin-notifications-write',
        },
        update: {
            allowed: true,
            action: 'WRITE',
        },
        create: {
            id: 'perm-uniadmin-notifications-write',
            roleId: 'UNI_ADMIN',
            module: 'NOTIFICATIONS',
            action: 'WRITE',
            allowed: true,
        },
    });

    console.log('Permission granted successfully! 🎉');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
