import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding a verified audit log...');
  
  await (prisma as any).auditLog.create({
    data: {
      action: 'CREATE_UNIVERSITY',
      entityType: 'UNIVERSITY',
      entityId: 'test-uni-123',
      changes: { name: 'Blockchain Verified University', location: 'On-Chain' },
      status: 'SUCCESS',
      method: 'POST',
      endpoint: '/v1/universities',
      ipAddress: '127.0.0.1',
      userAgent: 'Audit Seeder',
      transactionHash: '0x7e5f4552091a69125d5dfcb7b8c2659029395bdf3a8d148784d15610e2f5b6a7',
      blockNumber: 18234567,
      isVerified: true,
      createdAt: new Date(),
    }
  });

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
