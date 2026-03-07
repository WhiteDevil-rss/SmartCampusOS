export interface University {
    id: string;
    name: string;
    shortName: string;
    location?: string;
    email?: string;
}

export interface FacultySubject {
    courseId: string;
}

export interface Faculty {
    id: string;
    name: string;
    email: string;
    designation?: string;
    departmentId: string;
    universityId: string;
    subjects: FacultySubject[];
}

export interface TimetableSlot {
    id: string;
    dayOfWeek: number;
    slotNumber: number;
    startTime: string;
    endTime: string;
    courseName?: string;
    courseCode?: string;
    facultyName?: string;
    roomName?: string;
    batchName?: string;
    slotType: 'THEORY' | 'LAB' | 'BREAK';
    isBreak: boolean;
}

export interface TimeSlot {
    slotNumber: number;
    startTime: string;
    endTime: string;
    isBreak: boolean;
}

export interface ScheduleConfig {
    startTime: string;
    endTime: string;
    lectureDuration: number;
    breakDuration: number;
    breakAfterLecture: number;
    daysPerWeek: number;
    semesterStartDate?: string;
    semesterEndDate?: string;
}

export interface GenerateRequest {
    departmentId: string;
    batchIds: string[];
    config: ScheduleConfig;
    excludedFacultyIds?: string[];
    excludedRoomIds?: string[];
    excludedDayIds?: number[];
}
export enum UserRole {
    SUPER_ADMIN = 'SUPERADMIN',
    UNIVERSITY_ADMIN = 'UNI_ADMIN',
    COLLEGE_ADMIN = 'COLLEGE_ADMIN',
    DEPARTMENT_ADMIN = 'DEPT_ADMIN',
    FACULTY = 'FACULTY',
    STUDENT = 'STUDENT',
    PARENT = 'PARENT',
    LIBRARIAN = 'LIBRARIAN',
    PLACEMENT_OFFICER = 'PLACEMENT_OFFICER',
    PUBLIC = 'PUBLIC'
}

export const RoleHierarchy: Record<string, number> = {
    'SUPERADMIN': 100,
    'UNI_ADMIN': 90,
    'COLLEGE_ADMIN': 80,
    'DEPT_ADMIN': 70,
    'FACULTY': 60,
    'LIBRARIAN': 50,
    'PLACEMENT_OFFICER': 50,
    'STUDENT': 40,
    'PARENT': 30,
    'PUBLIC': 10
};
