import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
  const logs = await (prisma as any).auditLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  console.log('--- Latest Audit Logs ---');
  console.log(JSON.stringify(logs, null, 2));
  
  const verifiedCount = await (prisma as any).auditLog.count({
    where: { isVerified: true },
  });
  console.log(`\nTotal Verified Logs: ${verifiedCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
