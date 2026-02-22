import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';

const hashPassword = async (password: string) => bcrypt.hash(password, 12);

export const getAllUniversities = async (req: Request, res: Response) => {
    try {
        const universities = await prisma.university.findMany({
            include: {
                _count: {
                    select: { departments: true, faculty: true, courses: true }
                }
            }
        });
        res.json(universities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch universities' });
    }
};

export const getUniversityById = async (req: Request, res: Response) => {
    try {
        const university = await prisma.university.findUnique({
            where: { id: req.params.id },
            include: { departments: true }
        });
        if (!university) return res.status(404).json({ error: 'Not found' });
        res.json(university);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch university' });
    }
};

export const createUniversity = async (req: Request, res: Response) => {
    try {
        const { name, shortName, location, email, adminUsername, adminPassword } = req.body;

        // Perform transaction to create University and its Admin User
        const university = await prisma.$transaction(async (tx: any) => {
            const uni = await tx.university.create({
                data: { name, shortName, location, email }
            });

            const pwdHash = await hashPassword(adminPassword);

            const admin = await tx.user.create({
                data: {
                    username: adminUsername,
                    passwordHash: pwdHash,
                    role: 'UNI_ADMIN',
                    universityId: uni.id,
                    entityId: uni.id
                }
            });

            await tx.university.update({
                where: { id: uni.id },
                data: { adminUserId: admin.id }
            });

            return tx.university.findUnique({ where: { id: uni.id } });
        });

        res.status(201).json(university);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create university' });
    }
};

export const updateUniversity = async (req: Request, res: Response) => {
    try {
        const { name, shortName, location, email } = req.body;
        const university = await prisma.university.update({
            where: { id: req.params.id },
            data: { name, shortName, location, email }
        });
        res.json(university);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update university' });
    }
};

export const deleteUniversity = async (req: Request, res: Response) => {
    try {
        await prisma.university.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete university' });
    }
};
