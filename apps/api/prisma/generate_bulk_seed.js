const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

const dataPath = path.join(__dirname, 'seed-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const universityId = data.universities[0].id;
const departmentId = data.departments[0].id;
const batchId = data.batches[0].id; // MCA Sem 2 A
const batchIdB = data.batches[1].id; // MCA Sem 2 B

// 1. Programs
const mcaProgramId = uuidv4();
const bcaProgramId = uuidv4();
data.programs = [
    {
        id: mcaProgramId,
        universityId,
        departmentId,
        name: "Master of Computer Applications",
        shortName: "MCA",
        type: "PG",
        duration: 2,
        totalSems: 4
    },
    {
        id: bcaProgramId,
        universityId,
        departmentId,
        name: "Bachelor of Computer Applications",
        shortName: "BCA",
        type: "UG",
        duration: 3,
        totalSems: 6
    }
];

// Map program ids to batches
data.batches.forEach(b => {
    b.programId = mcaProgramId; // Though schema just has program (string), but student requires programId.
});

// 2. Session Types
const theorySessionId = uuidv4();
const labSessionId = uuidv4();
data.sessionTypes = [
    { id: theorySessionId, departmentId, name: "Theory", durationRule: 60, roomTypeRequired: "Classroom" },
    { id: labSessionId, departmentId, name: "Lab", durationRule: 120, roomTypeRequired: "Lab" }
];

// 3. Time Blocks
data.timeBlocks = [
    { id: uuidv4(), departmentId, name: "Block 1", startTime: "09:00", endTime: "10:00", duration: 60, isBreak: false, slotNumber: 1 },
    { id: uuidv4(), departmentId, name: "Block 2", startTime: "10:00", endTime: "11:00", duration: 60, isBreak: false, slotNumber: 2 },
    { id: uuidv4(), departmentId, name: "Short Break", startTime: "11:00", endTime: "11:15", duration: 15, isBreak: true, slotNumber: 3 },
    { id: uuidv4(), departmentId, name: "Block 3", startTime: "11:15", endTime: "12:15", duration: 60, isBreak: false, slotNumber: 4 },
    { id: uuidv4(), departmentId, name: "Lunch Break", startTime: "12:15", endTime: "13:00", duration: 45, isBreak: true, slotNumber: 5 },
    { id: uuidv4(), departmentId, name: "Block 4", startTime: "13:00", endTime: "15:00", duration: 120, isBreak: false, slotNumber: 6 }
];

// 4. Students
const studentNames = [
    "Aarav Patel", "Diya Sharma", "Rahul Verma", "Sneha Iyer", "Rohan Mehta",
    "Priya Desai", "Amit Singh", "Neha Gupta", "Vikram Rathore", "Pooja Reddy"
];

data.students = [];
// Need users as well
let currentEnrollment = 20250000;
studentNames.forEach((name, i) => {
    const studentId = uuidv4();
    const userId = uuidv4();
    const email = name.toLowerCase().replace(" ", ".") + "@student.vnsgu.ac.in";
    const username = name.toLowerCase().replace(" ", "") + Math.floor(Math.random() * 100);

    data.students.push({
        id: studentId,
        universityId,
        departmentId,
        enrollmentNo: `EN${currentEnrollment++}`,
        name,
        email,
        phone: `98765${10000 + i}`,
        batchId: i < 5 ? batchId : batchIdB,
        programId: mcaProgramId,
        admissionYear: 2025
    });

    data.users.push({
        id: userId,
        username,
        email,
        passwordHash: null, // Let seed.ts fill it
        firebaseUid: null,  // Let seed.ts generate it
        role: "STUDENT",
        entityId: studentId,
        universityId,
        isActive: true
    });
});

// 5. Assignments (Map to a course and faculty)
const courseId = data.courses[0].id; // AI
const facultyId = data.faculty[0].id; // Dharmen Shah
data.assignments = [
    {
        id: uuidv4(),
        title: "AI Mid-Term Project",
        description: "Implement A* search algorithm for pathfinding.",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        maxMarks: 100,
        facultyId,
        courseId,
        batchId
    },
    {
        id: uuidv4(),
        title: "Linear Regression Analysis",
        description: "Perform linear regression on the provided dataset.",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        maxMarks: 50,
        facultyId,
        courseId,
        batchId
    }
];

// 6. Fee Structures
const feeStructureId = uuidv4();
data.feeStructures = [
    {
        id: feeStructureId,
        universityId,
        programId: mcaProgramId,
        semester: 2,
        academicYear: "2025-2026",
        components: [
            { name: "Tuition Fee", amount: 45000, optional: false },
            { name: "Library Fee", amount: 2000, optional: false },
            { name: "Sports Fee", amount: 1500, optional: false }
        ],
        totalAmount: 48500
    }
];

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Successfully augmented seed-data.json with missing hierarchies.');
