import prisma from './lib/prisma';

async function main() {
  const departmentId = '5323988e-1afd-4ed7-b8ee-6aea99077592';
  
  const batches = await prisma.batch.findMany({
    where: { departmentId },
    select: { name: true, program: true, semester: true }
  });

  console.log("All Batches:");
  console.log(JSON.stringify(batches, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
