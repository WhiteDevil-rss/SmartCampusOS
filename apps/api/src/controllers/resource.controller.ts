import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as resourceService from '../services/resource.service';
import prisma from '../lib/prisma';

// --- NEW Phase 22 Booking & Availability Functions ---

export const getResources = async (req: AuthRequest, res: Response) => {
  try {
    const universityId = req.user?.universityId;
    if (!universityId) return res.status(400).json({ error: 'University ID missing from user profile' });

    const resources = await resourceService.getAllResources(universityId);
    res.json(resources);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch resources' });
  }
};

export const checkAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { resourceId, startTime, endTime } = req.body;
    if (!resourceId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const availability = await resourceService.checkAvailability(
      resourceId,
      new Date(startTime),
      new Date(endTime)
    );

    res.json(availability);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error checking availability' });
  }
};

export const bookResource = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { resourceId, startTime, endTime, purpose, grantId } = req.body;
    
    const booking = await resourceService.createBooking(userId, {
      resourceId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      purpose,
      grantId
    });

    res.status(201).json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create booking' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const bookings = await resourceService.getMyBookings(userId);
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch bookings' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const cancelled = await resourceService.cancelBooking(id as string, userId);
    res.json(cancelled);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to cancel booking' });
  }
};

// --- RESTORED Legacy Resource CRUD Functions ---

export const getResourceById = async (req: AuthRequest, res: Response) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: req.params.id as string }
    });
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
};

export const createResource = async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, capacity, floor, building, universityId, isResearchOnly, requiresApproval } = req.body;
    const resource = await prisma.resource.create({
      data: {
        name,
        type,
        capacity,
        floor,
        building,
        universityId: (universityId || req.user?.universityId) as string,
        isResearchOnly: !!isResearchOnly,
        requiresApproval: !!requiresApproval
      }
    });
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create resource' });
  }
};

export const updateResource = async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, capacity, floor, building, status, isResearchOnly, requiresApproval, specifications } = req.body;
    const resource = await prisma.resource.update({
      where: { id: req.params.id as string },
      data: {
        name,
        type,
        capacity,
        floor,
        building,
        status,
        isResearchOnly,
        requiresApproval,
        specifications
      }
    });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update resource' });
  }
};

export const deleteResource = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.resource.delete({
      where: { id: req.params.id as string }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
};
