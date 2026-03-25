
import { PrismaClient } from './src/generated/client';
import crypto from 'crypto';
const prisma = new PrismaClient();

async function getHashes() {
    try {
        const students = await prisma.student.findMany({
            orderBy: {
                enrollmentNo: 'asc'
            },
            take: 5,
            include: {
                results: true
            }
        });

        console.log('| Student | Enrollment No. | Admission Hash | Result Hash |');
        console.log('|---|---|---|---|');

        for (const student of students) {
            const applicationHashString = `${student.enrollmentNo}:${student.email}:${student.id}:ADMIT_SECURE`;
            const admitHash = crypto.createHash('sha256').update(applicationHashString).digest('hex');
            
            const latestResult = student.results[0];
            const resultHash = latestResult ? latestResult.resultHash : 'N/A';

            console.log(`| ${student.name} | \`${student.enrollmentNo}\` | \`${admitHash}\` | \`${resultHash}\` |`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

getHashes();
