import { PrismaClient } from '../src/generated/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { firebaseAdmin } from '../src/lib/firebase-admin';

const prisma = new PrismaClient();

async function syncFirebaseUser(email: string, password: string, displayName: string): Promise<string> {
    try {
        const user = await firebaseAdmin.auth().createUser({
            email,
            password,
            displayName,
        });
        return user.uid;
    } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
            const user = await firebaseAdmin.auth().getUserByEmail(email);
            // Ensure password is reset to 'password123' for ease of use in demo environments
            await firebaseAdmin.auth().updateUser(user.uid, { password, displayName });
            return user.uid;
        }
        throw error;
    }
}

async function main() {
    console.log('Seeding from seed-data.json... Syncing with Firebase!');

    const dataPath = path.join(__dirname, 'seed-data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);

    // Hash standard password for seed users
    const standardPassword = 'password123';
    const passwordHash = await bcrypt.hash(standardPassword, 12);

    // 1. Global Settings (Not in JSON, keeping from previous seed)
    console.log('Initializing Global Settings...');
    await prisma.globalSettings.upsert({
        where: { id: 'system-config' },
        update: {},
        create: {
            id: 'system-config',
            platformName: 'SmartCampus OS',
            supportEmail: 'support@smartcampus-os.tech',
            maintenanceMode: false,
            sessionTimeout: 600,
            mfaEnabled: false,
            logRetention: '30',
            autoBackups: false,
        },
    });

    // 2. Universities
    console.log(`Seeding ${data.universities.length} Universities...`);
    for (const uni of data.universities) {
        await prisma.university.upsert({
            where: { id: uni.id },
            update: {
                name: uni.name,
                shortName: uni.shortName,
                location: uni.location,
                email: uni.email,
                estYear: uni.estYear,
                website: uni.website,
            },
            create: {
                id: uni.id,
                name: uni.name,
                shortName: uni.shortName,
                location: uni.location,
                email: uni.email,
                estYear: uni.estYear,
                website: uni.website,
            },
        });
    }

    // 3. Users
    console.log(`Seeding ${data.users.length} Users...`);
    for (const user of data.users) {
        // Sync with Firebase
        const fUid = await syncFirebaseUser(user.email, standardPassword, user.username);

        await prisma.user.upsert({
            where: { id: user.id },
            update: {
                username: user.username,
                email: user.email,
                passwordHash: user.passwordHash || passwordHash,
                firebaseUid: fUid,
                role: user.role,
                universityId: user.universityId,
                entityId: user.entityId,
                isActive: user.isActive,
            },
            create: {
                id: user.id,
                username: user.username,
                email: user.email,
                passwordHash: user.passwordHash || passwordHash,
                firebaseUid: fUid,
                role: user.role,
                universityId: user.universityId,
                entityId: user.entityId,
                isActive: user.isActive,
            },
        });
    }

    // Update University adminUserId
    for (const uni of data.universities) {
        if (uni.adminUserId) {
            await prisma.university.update({
                where: { id: uni.id },
                data: { adminUserId: uni.adminUserId },
            });
        }
    }

    // 4. Departments
    console.log(`Seeding ${data.departments.length} Departments...`);
    for (const dept of data.departments) {
        await prisma.department.upsert({
            where: { id: dept.id },
            update: {
                name: dept.name,
                shortName: dept.shortName,
                hod: dept.hod,
                email: dept.email,
                universityId: dept.universityId,
                adminUserId: dept.adminUserId,
            },
            create: {
                id: dept.id,
                name: dept.name,
                shortName: dept.shortName,
                hod: dept.hod,
                email: dept.email,
                universityId: dept.universityId,
                adminUserId: dept.adminUserId,
            },
        });
    }

    // 5. Resources
    console.log(`Seeding ${data.resources.length} Resources...`);
    for (const res of data.resources) {
        await prisma.resource.upsert({
            where: { id: res.id },
            update: {
                name: res.name,
                type: res.type,
                capacity: res.capacity,
                floor: res.floor,
                building: res.building,
                universityId: res.universityId,
            },
            create: {
                id: res.id,
                name: res.name,
                type: res.type,
                capacity: res.capacity,
                floor: res.floor,
                building: res.building,
                universityId: res.universityId,
            },
        });
    }

    // 6. Batches
    console.log(`Seeding ${data.batches.length} Batches...`);
    for (const batch of data.batches) {
        await prisma.batch.upsert({
            where: { id: batch.id },
            update: {
                name: batch.name,
                program: batch.program,
                semester: batch.semester,
                division: batch.division,
                year: batch.year,
                strength: batch.strength,
                totalStudents: batch.totalStudents,
                universityId: batch.universityId,
                departmentId: batch.departmentId,
            },
            create: {
                id: batch.id,
                name: batch.name,
                program: batch.program,
                semester: batch.semester,
                division: batch.division,
                year: batch.year,
                strength: batch.strength,
                totalStudents: batch.totalStudents,
                universityId: batch.universityId,
                departmentId: batch.departmentId,
            },
        });
    }

    // 7. Courses
    console.log(`Seeding ${data.courses.length} Courses...`);
    for (const course of data.courses) {
        await prisma.course.upsert({
            where: { id: course.id },
            update: {
                name: course.name,
                code: course.code,
                program: course.program,
                credits: course.credits,
                weeklyHrs: course.weeklyHrs,
                semester: course.semester,
                type: course.type,
                labDuration: course.labDuration,
                isElective: course.isElective,
                universityId: course.universityId,
                departmentId: course.departmentId,
            },
            create: {
                id: course.id,
                name: course.name,
                code: course.code,
                program: course.program,
                credits: course.credits,
                weeklyHrs: course.weeklyHrs,
                semester: course.semester,
                type: course.type,
                labDuration: course.labDuration,
                isElective: course.isElective,
                universityId: course.universityId,
                departmentId: course.departmentId,
            },
        });
    }

    // 8. Faculty
    console.log(`Seeding ${data.faculty.length} Faculty Members...`);
    for (const fac of data.faculty) {
        await prisma.faculty.upsert({
            where: { id: fac.id },
            update: {
                name: fac.name,
                email: fac.email,
                phone: fac.phone,
                designation: fac.designation,
                qualifications: fac.qualifications,
                experience: fac.experience,
                userId: fac.userId,
                universityId: fac.universityId,
            },
            create: {
                id: fac.id,
                name: fac.name,
                email: fac.email,
                phone: fac.phone,
                designation: fac.designation,
                qualifications: fac.qualifications,
                experience: fac.experience,
                userId: fac.userId,
                universityId: fac.universityId,
            },
        });
    }

    // 9. Faculty-Department Mapping
    console.log(`Seeding ${data.facultyDepartments.length} Faculty-Department Mappings...`);
    for (const fd of data.facultyDepartments) {
        await prisma.facultyDepartment.upsert({
            where: {
                facultyId_departmentId: {
                    facultyId: fd.facultyId,
                    departmentId: fd.departmentId,
                },
            },
            update: {},
            create: {
                facultyId: fd.facultyId,
                departmentId: fd.departmentId,
            },
        });
    }

    // 10. Faculty-Subject Mapping
    console.log(`Seeding ${data.facultySubjects.length} Faculty-Subject Mappings...`);
    for (const fs of data.facultySubjects) {
        await prisma.facultySubject.upsert({
            where: { id: fs.id },
            update: {
                facultyId: fs.facultyId,
                courseId: fs.courseId,
                isPrimary: fs.isPrimary,
                proficiencyLevel: fs.proficiencyLevel,
            },
            create: {
                id: fs.id,
                facultyId: fs.facultyId,
                courseId: fs.courseId,
                isPrimary: fs.isPrimary,
                proficiencyLevel: fs.proficiencyLevel,
            },
        });
    }

    // 11. Programs
    if (data.programs) {
        console.log(`Seeding ${data.programs.length} Programs...`);
        for (const prog of data.programs) {
            await prisma.program.upsert({
                where: { id: prog.id },
                update: { name: prog.name, shortName: prog.shortName, type: prog.type, duration: prog.duration, totalSems: prog.totalSems, universityId: prog.universityId, departmentId: prog.departmentId },
                create: { id: prog.id, name: prog.name, shortName: prog.shortName, type: prog.type, duration: prog.duration, totalSems: prog.totalSems, universityId: prog.universityId, departmentId: prog.departmentId },
            });
        }
    }

    // 12. Session Types
    if (data.sessionTypes) {
        console.log(`Seeding ${data.sessionTypes.length} Session Types...`);
        for (const st of data.sessionTypes) {
            await prisma.sessionType.upsert({
                where: { id: st.id },
                update: { name: st.name, durationRule: st.durationRule, roomTypeRequired: st.roomTypeRequired, departmentId: st.departmentId },
                create: { id: st.id, name: st.name, durationRule: st.durationRule, roomTypeRequired: st.roomTypeRequired, departmentId: st.departmentId },
            });
        }
    }

    // 13. Time Blocks
    if (data.timeBlocks) {
        console.log(`Seeding ${data.timeBlocks.length} Time Blocks...`);
        for (const tb of data.timeBlocks) {
            await prisma.timeBlock.upsert({
                where: { id: tb.id },
                update: { name: tb.name, startTime: tb.startTime, endTime: tb.endTime, duration: tb.duration, isBreak: tb.isBreak, slotNumber: tb.slotNumber, departmentId: tb.departmentId },
                create: { id: tb.id, name: tb.name, startTime: tb.startTime, endTime: tb.endTime, duration: tb.duration, isBreak: tb.isBreak, slotNumber: tb.slotNumber, departmentId: tb.departmentId },
            });
        }
    }

    // 14. Students
    if (data.students) {
        console.log(`Seeding ${data.students.length} Students...`);
        for (const st of data.students) {
            await prisma.student.upsert({
                where: { id: st.id },
                update: { enrollmentNo: st.enrollmentNo, name: st.name, email: st.email, phone: st.phone, batchId: st.batchId, programId: st.programId, admissionYear: st.admissionYear, universityId: st.universityId, departmentId: st.departmentId },
                create: { id: st.id, enrollmentNo: st.enrollmentNo, name: st.name, email: st.email, phone: st.phone, batchId: st.batchId, programId: st.programId, admissionYear: st.admissionYear, universityId: st.universityId, departmentId: st.departmentId },
            });
        }
    }

    // 15. Assignments
    if (data.assignments) {
        console.log(`Seeding ${data.assignments.length} Assignments...`);
        for (const asm of data.assignments) {
            await prisma.assignment.upsert({
                where: { id: asm.id },
                update: { title: asm.title, description: asm.description, dueDate: asm.dueDate, maxMarks: asm.maxMarks, facultyId: asm.facultyId, courseId: asm.courseId, batchId: asm.batchId },
                create: { id: asm.id, title: asm.title, description: asm.description, dueDate: asm.dueDate, maxMarks: asm.maxMarks, facultyId: asm.facultyId, courseId: asm.courseId, batchId: asm.batchId },
            });
        }
    }

    // 16. Fee Structures
    if (data.feeStructures) {
        console.log(`Seeding ${data.feeStructures.length} Fee Structures...`);
        for (const fs of data.feeStructures) {
            await prisma.feeStructure.upsert({
                where: { id: fs.id },
                update: { semester: fs.semester, academicYear: fs.academicYear, components: fs.components, totalAmount: fs.totalAmount, universityId: fs.universityId, programId: fs.programId },
                create: { id: fs.id, semester: fs.semester, academicYear: fs.academicYear, components: fs.components, totalAmount: fs.totalAmount, universityId: fs.universityId, programId: fs.programId },
            });
        }
    }

    // 17. Books
    if (data.books) {
        console.log(`Seeding ${data.books.length} Books...`);
        for (const book of data.books) {
            await prisma.book.upsert({
                where: { id: book.id },
                update: { isbn: book.isbn, title: book.title, author: book.author, category: book.category, totalCopies: book.totalCopies, availableCopies: book.availableCopies, universityId: book.universityId, departmentId: book.departmentId || null },
                create: { id: book.id, isbn: book.isbn, title: book.title, author: book.author, category: book.category, totalCopies: book.totalCopies, availableCopies: book.availableCopies, universityId: book.universityId, departmentId: book.departmentId || null },
            });
        }
    }

    // 18. Book Loans
    if (data.bookLoans) {
        console.log(`Seeding ${data.bookLoans.length} Book Loans...`);
        for (const loan of data.bookLoans) {
            await prisma.bookLoan.upsert({
                where: { id: loan.id },
                update: { studentId: loan.studentId, bookId: loan.bookId, issuedAt: new Date(loan.issuedAt), dueDate: new Date(loan.dueDate), returnedAt: loan.returnedAt ? new Date(loan.returnedAt) : null, fineAmount: loan.fineAmount },
                create: { id: loan.id, studentId: loan.studentId, bookId: loan.bookId, issuedAt: new Date(loan.issuedAt), dueDate: new Date(loan.dueDate), returnedAt: loan.returnedAt ? new Date(loan.returnedAt) : null, fineAmount: loan.fineAmount },
            });
        }
    }

    // 19. Companies
    if (data.companies) {
        console.log(`Seeding ${data.companies.length} Companies...`);
        for (const company of data.companies) {
            await prisma.company.upsert({
                where: { id: company.id },
                update: { name: company.name, type: company.type, website: company.website, hrContact: company.hrContact, universityId: company.universityId },
                create: { id: company.id, name: company.name, type: company.type, website: company.website, hrContact: company.hrContact, universityId: company.universityId },
            });
        }
    }

    // 20. Placement Records
    if (data.placementRecords) {
        console.log(`Seeding ${data.placementRecords.length} Placement Records...`);
        for (const pr of data.placementRecords) {
            await prisma.placementRecord.upsert({
                where: { id: pr.id },
                update: { studentId: pr.studentId, companyId: pr.companyId, placedAt: new Date(pr.placedAt), ctc: pr.ctc, role: pr.role },
                create: { id: pr.id, studentId: pr.studentId, companyId: pr.companyId, placedAt: new Date(pr.placedAt), ctc: pr.ctc, role: pr.role },
            });
        }
    }

    // 20.5 Seed Demo Results & Admissions for SaaS Verify Page Testing
    console.log(`Seeding Results & Verification Hashes...`);
    const demoStudents = data.students ? data.students.slice(0, 5) : [];
    
    for (const student of demoStudents) {
        // --- 1. Mock Admission Application ---
        const applicationHashString = `${student.enrollmentNo}:${student.email}:${student.id}:ADMIT_SECURE`;
        const admitHash = crypto.createHash('sha256').update(applicationHashString).digest('hex');
        
        await prisma.admissionApplication.upsert({
            where: { id: student.id },
            update: {
                universityId: student.universityId,
                departmentId: student.departmentId,
                programId: student.programId,
                applicantName: student.name,
                email: student.email,
                phone: student.phone || '9999999999',
                documents: {},
                status: 'APPROVED',
                remarks: 'Verified by SmartCampus OS Seed',
            },
            create: {
                id: student.id,
                universityId: student.universityId,
                departmentId: student.departmentId,
                programId: student.programId,
                applicantName: student.name,
                email: student.email,
                phone: student.phone || '9999999999',
                documents: {},
                status: 'APPROVED',
                remarks: 'Verified by SmartCampus OS Seed',
            }
        });

        console.log(`\n🔑 Demo Admission Verify Hash for ${student.name} (${student.enrollmentNo}):\n   ${admitHash}`);

        // --- 2. Mock Semester Result ---
        const semester = 2; // Fixed to semester 2 for demo
        const sgpa = parseFloat((Math.random() * (10 - 6) + 6).toFixed(2));
        const cgpa = parseFloat((Math.random() * (10 - 6) + 6).toFixed(2));
        const resultString = `${student.enrollmentNo}:${sgpa}:${cgpa}`;
        const resultHash = crypto.createHash('sha256').update(resultString).digest('hex');
        const txHash = `0x${crypto.randomBytes(32).toString('hex')}`; // Mock blockchain TX

        const resultRecord = await prisma.result.upsert({
            where: { id: student.id + '-res' },
            update: {
                studentId: student.id,
                programId: student.programId,
                semester: semester,
                academicYear: '2025-26',
                sgpa: sgpa,
                cgpa: cgpa,
                status: 'PASS',
                resultHash: resultHash,
                blockchainTxHash: txHash,
                publishedAt: new Date()
            },
            create: {
                id: student.id + '-res',
                studentId: student.id,
                programId: student.programId,
                semester: semester,
                academicYear: '2025-26',
                sgpa: sgpa,
                cgpa: cgpa,
                status: 'PASS',
                resultHash: resultHash,
                blockchainTxHash: txHash,
                publishedAt: new Date()
            }
        });

        // Get 5 courses for this program to seed SubjectResults
        const programCourses = data.courses.slice(0, 5);
        
        for (const course of programCourses) {
            const external = Math.floor(Math.random() * (70 - 40) + 40);
            const internal = Math.floor(Math.random() * (30 - 20) + 20);
            const total = external + internal;
            let grade = 'A';
            if (total > 90) grade = 'O';
            else if (total > 80) grade = 'A+';
            else if (total > 70) grade = 'A';
            else if (total > 60) grade = 'B+';
            else grade = 'B';

            await prisma.subjectResult.upsert({
                where: { resultId_courseId: { resultId: resultRecord.id, courseId: course.id } },
                update: {
                    internalMarks: internal,
                    externalMarks: external,
                    totalMarks: total,
                    grade: grade,
                    creditsEarned: course.credits
                },
                create: {
                    resultId: resultRecord.id,
                    courseId: course.id,
                    internalMarks: internal,
                    externalMarks: external,
                    totalMarks: total,
                    grade: grade,
                    creditsEarned: course.credits
                }
            });
        }
        console.log(`🎓 Demo Result Hash for ${student.name} (${student.enrollmentNo}):\n   ${resultHash}`);
        console.log(`   Blockchain TX: ${txHash}\n`);
    }

    // 21. Permissions (SuperAdmin)
    const superAdminId = '9be572c4-1fc9-48c3-9b30-631316853799';
    const modules = ['USERS', 'UNIVERSITIES', 'DEPARTMENTS', 'COURSES', 'STUDENTS', 'FACULTY', 'INQUIRIES', 'SUBSCRIBERS', 'NOTIFICATIONS', 'SETTINGS'];

    console.log('Seeding SuperAdmin Permissions...');
    for (const module of modules) {
        await prisma.permission.upsert({
            where: {
                // Since we don't have a unique constraint on (userId, module, action) yet in schema
                // we'll use a find-then-create approach or just use a stable ID for seeding
                id: `perm-superadmin-${module.toLowerCase()}-all`,
            },
            update: {
                allowed: true,
                action: 'ALL',
            },
            create: {
                id: `perm-superadmin-${module.toLowerCase()}-all`,
                userId: superAdminId,
                roleId: 'SUPERADMIN',
                module: module,
                action: 'ALL',
                allowed: true,
            },
        });
    }

    console.log('Seeding UNI_ADMIN Permissions...');
    await prisma.permission.upsert({
        where: { id: 'perm-uniadmin-notifications-write' },
        update: { allowed: true, action: 'WRITE' },
        create: {
            id: 'perm-uniadmin-notifications-write',
            roleId: 'UNI_ADMIN',
            module: 'NOTIFICATIONS',
            action: 'WRITE',
            allowed: true,
        },
    });

    console.log('Seeding DEPT_ADMIN Permissions...');
    await prisma.permission.upsert({
        where: { id: 'perm-deptadmin-notifications-write' },
        update: { allowed: true, action: 'WRITE' },
        create: {
            id: 'perm-deptadmin-notifications-write',
            roleId: 'DEPT_ADMIN',
            module: 'NOTIFICATIONS',
            action: 'WRITE',
            allowed: true,
        },
    });

    // 22. Job Postings — Hiring System Seed Data
    console.log('Seeding Job Postings & Demo Applications...');
    
    const demoJobs = [
        // SUPERADMIN jobs
        { id: 'job-sa-001', title: 'System Operations Manager',   description: 'Manage day-to-day operations of the SmartCampus OS platform. Responsible for reliability, performance monitoring, and cross-institutional support coordination.', type: 'FULL_TIME',  location: 'Remote (India)',    panelType: 'SUPERADMIN', panelId: null, departmentName: null,            universityName: null },
        { id: 'job-sa-002', title: 'Customer Support Executive',  description: 'Provide first-line support to universities and departments using SmartCampus OS. Handle tickets, resolve queries, and escalate critical issues.',                 type: 'FULL_TIME',  location: 'Surat, Gujarat',   panelType: 'SUPERADMIN', panelId: null, departmentName: null,            universityName: null },
        { id: 'job-sa-003', title: 'DevOps Engineer',             description: 'Maintain and automate CI/CD pipelines, manage cloud infrastructure, and ensure 99.9% uptime for the SmartCampus OS deployment.',                                     type: 'CONTRACT',   location: 'Remote (Worldwide)', panelType: 'SUPERADMIN', panelId: null, departmentName: null,            universityName: null },
        // UNIVERSITY jobs
        { id: 'job-uni-001', title: 'Professor – Computer Science', description: 'Lead teaching and research in core CS subjects including Data Structures, Algorithms, and Machine Learning. PhD required.',                                       type: 'FULL_TIME',  location: 'Surat, Gujarat',   panelType: 'UNIVERSITY',  panelId: null, departmentName: 'Computer Science', universityName: 'Veer Narmad South Gujarat University' },
        { id: 'job-uni-002', title: 'Lab Assistant – Electronics',  description: 'Support faculty in running electronics and embedded systems lab sessions. Maintain lab equipment and assist students.',                                              type: 'PART_TIME',  location: 'Surat, Gujarat',   panelType: 'UNIVERSITY',  panelId: null, departmentName: 'Electronics',      universityName: 'Veer Narmad South Gujarat University' },
        { id: 'job-uni-003', title: 'Academic Counsellor',          description: 'Guide students in academic planning, credit management, and career decision-making through one-on-one and group sessions.',                                          type: 'FULL_TIME',  location: 'Surat, Gujarat',   panelType: 'UNIVERSITY',  panelId: null, departmentName: null,            universityName: 'Veer Narmad South Gujarat University' },
        // DEPARTMENT jobs
        { id: 'job-dept-001', title: 'Lecturer – Data Science',  description: 'Deliver lectures on Data Science, Big Data, and AI. Minimum 2 years of industry or teaching experience required.',              type: 'FULL_TIME',  location: 'Surat, Gujarat',  panelType: 'DEPARTMENT', panelId: null, departmentName: 'Computer Science', universityName: 'Veer Narmad South Gujarat University' },
        { id: 'job-dept-002', title: 'Program Coordinator',       description: 'Coordinate department-level academic activities, exam planning, and student performance tracking.',                              type: 'FULL_TIME',  location: 'Surat, Gujarat',  panelType: 'DEPARTMENT', panelId: null, departmentName: 'Computer Science', universityName: 'Veer Narmad South Gujarat University' },
        { id: 'job-dept-003', title: 'Research Intern – AI/ML',   description: 'Collaborate with faculty on applied AI/ML research projects in academic resource management and intelligent scheduling systems.', type: 'INTERNSHIP', location: 'Remote / Hybrid', panelType: 'DEPARTMENT', panelId: null, departmentName: 'Computer Science', universityName: 'Veer Narmad South Gujarat University' },
    ];

    for (const job of demoJobs) {
        await prisma.jobPosting.upsert({
            where: { id: job.id },
            update: {
                title: job.title,
                description: job.description,
                type: job.type,
                location: job.location,
                panelType: job.panelType,
                departmentName: job.departmentName,
                universityName: job.universityName,
                isActive: true,
            },
            create: {
                id: job.id,
                title: job.title,
                description: job.description,
                type: job.type,
                location: job.location,
                panelType: job.panelType,
                panelId: job.panelId,
                departmentName: job.departmentName,
                universityName: job.universityName,
                isActive: true,
            },
        });
    }

    // Demo Applications for the first 3 jobs
    const demoApplicants = [
        { name: 'Arjun Mehta',    email: 'arjun.mehta@example.com',  mobile: '9876543210', jobId: 'job-sa-001' },
        { name: 'Priya Sharma',   email: 'priya.sharma@example.com', mobile: '9123456789', jobId: 'job-uni-001' },
        { name: 'Rahul Desai',    email: 'rahul.desai@example.com',  mobile: '9988776655', jobId: 'job-dept-001' },
    ];

    for (const applicant of demoApplicants) {
        await prisma.jobApplication.upsert({
            where: { id: `app-${applicant.jobId}` },
            update: {
                applicantName: applicant.name,
                email: applicant.email,
                mobile: applicant.mobile,
                status: 'PENDING',
            },
            create: {
                id: `app-${applicant.jobId}`,
                jobId: applicant.jobId,
                applicantName: applicant.name,
                email: applicant.email,
                mobile: applicant.mobile,
                coverLetter: 'I am excited to apply for this position at SmartCampus OS. I believe my skills and experience make me a strong candidate.',
                status: 'PENDING',
            }
        });
    }

    console.log(`✅ Seeded ${demoJobs.length} jobs and ${demoApplicants.length} demo applications.`);
    
    console.log('Seeding Complete! 🎉');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
