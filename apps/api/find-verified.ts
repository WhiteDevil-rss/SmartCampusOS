
import { PrismaClient } from './src/generated/client';
import crypto from 'crypto';
const prisma = new PrismaClient();

async function findVerifiedStudents() {
    try {
        const admissionApps = await prisma.admissionApplication.findMany({
            select: { applicantName: true, id: true }
        });

        console.log('--- STUDENTS WITH ADMISSION RECORDS ---');
        for (const app of admissionApps) {
            const student = await prisma.student.findUnique({
                where: { id: app.id }
            });
            if (student) {
                const applicationHashString = `${student.enrollmentNo}:${student.email}:${student.id}:ADMIT_SECURE`;
                const admitHash = crypto.createHash('sha256').update(applicationHashString).digest('hex');
                
                const result = await prisma.result.findFirst({
                    where: { studentId: student.id }
                });
                
                console.log(`| ${student.name} | \`${student.enrollmentNo}\` | \`${admitHash}\` | \`${result ? result.resultHash : 'N/A'}\` |`);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

findVerifiedStudents();
