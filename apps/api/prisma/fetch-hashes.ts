import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
    const enrollments = ['EN20250000', 'EN20250001', 'EN20250002', 'EN20250003', 'EN20250004'];
    
    console.log('| Profile | Enrollment | Admission Verify Hash (SHA-256) | Result SHA-256 Hash |');
    console.log('|---|---|---|---|');
    
    for (const enroll of enrollments) {
        const student = await prisma.student.findUnique({
            where: { enrollmentNo: enroll },
            include: {
                results: {
                    orderBy: { academicYear: 'desc' },
                    take: 1
                }
            }
        });
        
        if (student && student.results.length > 0) {
            const result = student.results[0];
            
            // Re-calculate Admission Hash based on current seed logic to be 100% sure
            // `${student.enrollmentNo}:${student.email}:${student.id}:ADMIT_SECURE`
            const crypto = require('crypto');
            const admitStr = `${student.enrollmentNo}:${student.email}:${student.id}:ADMIT_SECURE`;
            const admitHash = crypto.createHash('sha256').update(admitStr).digest('hex');
            
            console.log(`| **${student.name}** | \`${student.enrollmentNo}\` | \`${admitHash}\` | \`${result.resultHash}\` |`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
