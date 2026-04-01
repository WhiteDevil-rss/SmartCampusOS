const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'admin@smartcampus.os' } });
  console.log(user);
}
main().finally(() => prisma.$disconnect());
