import { Request, Response } from 'express';
import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

export const getPublicJobs = async (req: Request, res: Response) => {
    try {
        const jobs = await prisma.jobPosting.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        
        return res.json({ success: true, data: jobs });
    } catch (error: any) {
        console.error('Fetch Jobs Error:', error);
        return res.status(500).json({ error: error.message || 'Failed to fetch job postings' });
    }
};

export const applyJob = async (req: Request, res: Response) => {
    try {
        const jobId = req.params.jobId as string;
        const { applicantName, email, mobile, resumeUrl, coverLetter } = req.body;

        if (!applicantName || !email || !mobile) {
            return res.status(400).json({ error: 'Applicant Name, Email, and Mobile are required fields.' });
        }

        const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
        if (!job || !job.isActive) {
            return res.status(404).json({ error: 'Job posting not found or inactive.' });
        }

        const application = await prisma.jobApplication.create({
            data: {
                jobId: job.id,
                applicantName: applicantName.trim(),
                email: email.trim().toLowerCase(),
                mobile: mobile.trim(),
                resumeUrl: resumeUrl || null,
                coverLetter: coverLetter || null,
                status: 'PENDING'
            }
        });

        return res.status(201).json({ success: true, data: application, message: 'Application submitted successfully.' });
    } catch (error: any) {
        console.error('Job Apply Error:', error);
        return res.status(500).json({ error: error.message || 'Failed to submit application.' });
    }
};
