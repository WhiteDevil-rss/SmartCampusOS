import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Phase 25: Seeding Industry Readiness Metrics ---');

    // 1. Find Demo Students
    const aarav = await prisma.student.findFirst({ where: { email: 'aarav.patel@student.vnsgu.ac.in' } });
    const diya = await prisma.student.findFirst({ where: { email: 'diya.sharma@student.vnsgu.ac.in' } });

    if (aarav) {
        await prisma.industryReadiness.upsert({
            where: { studentId: aarav.id },
            update: {},
            create: {
                studentId: aarav.id,
                technicalScore: 92,
                softSkillsScore: 85,
                experienceScore: 78,
                collaborationScore: 90,
                innovationScore: 82,
                overallReadiness: 86.5,
                gapAnalysis: "Highly ready for Tier-1 placements. Focus on advanced System Design and Distributed Systems."
            }
        });
        console.log('✅ Seeded readiness for Aarav Patel');
    }

    if (diya) {
        await prisma.industryReadiness.upsert({
            where: { studentId: diya.id },
            update: {},
            create: {
                studentId: diya.id,
                technicalScore: 78,
                softSkillsScore: 92,
                experienceScore: 65,
                collaborationScore: 95,
                innovationScore: 70,
                overallReadiness: 81.2,
                gapAnalysis: "Strong leadership potential. Need more hands-on internship experience in core domain."
            }
        });
        console.log('✅ Seeded readiness for Diya Sharma');
    }

    console.log('--- Phase 25 Seed Complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
