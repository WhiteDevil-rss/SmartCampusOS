import { PrismaClient } from '../src/generated/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing existing demo results...');
    await prisma.subjectResult.deleteMany({});
    await prisma.result.deleteMany({});

    console.log('Fetching active mock students and courses...');
    const students = await prisma.student.findMany({
        take: 3
    });

    if (students.length === 0) {
        console.error('No students found to seed results for. Please run the main seed script first.');
        return;
    }

    // Assign generic software engineering courses from the db
    const courses = await prisma.course.findMany({
        take: 6
    });

    if (courses.length < 6) {
        console.warn('Warning: Database does not have 6 courses. Result UI will look sparse.');
    }

    console.log(`Seeding complex SaaS Results for ${students.length} students...`);

    for (const student of students) {
        let totalMarks = 0;
        let maxMarksTotal = 0;
        let earnedCredits = 0;
        let totalCredits = 0;

        const mappedSubjects = courses.map((course) => {
            const externalScore = Math.floor(Math.random() * 40) + 30; // 30-70 marks
            const internalScore = Math.floor(Math.random() * 15) + 15; // 15-30 marks
            const sumScore = externalScore + internalScore;
            
            const max = 100;
            const percent = sumScore / max;
            
            let grade = 'F';
            let points = 0;
            
            if (percent >= 0.9) { grade = 'O'; points = 10; }
            else if (percent >= 0.8) { grade = 'A+'; points = 9; }
            else if (percent >= 0.7) { grade = 'A'; points = 8; }
            else if (percent >= 0.6) { grade = 'B+'; points = 7; }
            else if (percent >= 0.5) { grade = 'B'; points = 6; }
            else if (percent >= 0.45) { grade = 'C'; points = 5; }
            else if (percent >= 0.4) { grade = 'P'; points = 4; }

            totalMarks += sumScore;
            maxMarksTotal += max;
            
            const credits = course.credits || 4;
            totalCredits += credits;
            earnedCredits += points * credits;

            return {
                courseId: course.id,
                internalMarks: internalScore,
                externalMarks: externalScore,
                totalMarks: sumScore,
                grade: grade,
                creditsEarned: points > 0 ? credits : 0,
            };
        });

        // Calculate SGPA mathematically
        const calculatedSgpa = totalCredits > 0 ? Number((earnedCredits / totalCredits).toFixed(2)) : 0;
        const cgpa = calculatedSgpa; 
        
        // Compute cryptographically secure hashes modeling SmartCampus validation
        const verificationString = `${student.enrollmentNo}:${calculatedSgpa}:${cgpa}`;
        const computedSignatureHash = crypto.createHash('sha256').update(verificationString).digest('hex');
        
        const dummyTxHash = `0x${crypto.randomBytes(32).toString('hex')}`;

        // Mount payload in registry
        const result = await prisma.result.create({
            data: {
                studentId: student.id,
                programId: student.programId,
                semester: 1,
                academicYear: '2025-2026',
                sgpa: calculatedSgpa,
                cgpa: cgpa,
                status: calculatedSgpa > 4 ? 'PASS' : 'FAIL',
                resultHash: computedSignatureHash,
                blockchainTxHash: dummyTxHash,
                blockchainConfirmedAt: new Date(),
                publishedAt: new Date(),

                subjectResults: {
                    create: mappedSubjects
                }
            }
        });

        console.log(`-------------------------------------------------`);
        console.log(`✅ Seeded Result for Enrollment: ${student.enrollmentNo}`);
        console.log(`   Name            : ${student.name}`);
        console.log(`   SGPA            : ${calculatedSgpa} (Total Marks: ${totalMarks}/${maxMarksTotal})`);
        console.log(`   ----------------------------------------------`);
        console.log(`   Blockchain Tx   : ${dummyTxHash}`);
        console.log(`   Secure Token Hash: ${computedSignatureHash}`);
        console.log(`   => USE THIS SECURE HASH FOR PUBLIC VERIFICATION IN THE UI`);
    }

    console.log('-------------------------------------------------');
    console.log('Result Seeding Complete! Immutable Ledger Synced.');
}

main()
    .catch((e) => {
        console.error('Seeding completely failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
