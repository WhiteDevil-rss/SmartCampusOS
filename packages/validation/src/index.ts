import { z } from 'zod';

export const scheduleConfigSchema = z.object({
    startTime: z.string(),
    endTime: z.string(),
    lectureDuration: z.number(),
    breakDuration: z.number(),
    breakAfterLecture: z.number(),
    daysPerWeek: z.number(),
    semesterStartDate: z.string().optional(),
    semesterEndDate: z.string().optional()
});

export const generateRequestSchema = z.object({
    departmentId: z.string(),
    batchIds: z.array(z.string()),
    config: scheduleConfigSchema,
});

export type ScheduleConfigInput = z.infer<typeof scheduleConfigSchema>;
export type GenerateRequestInput = z.infer<typeof generateRequestSchema>;
