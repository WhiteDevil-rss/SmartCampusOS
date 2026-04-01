import prisma from '../lib/prisma';
import { format, getDay } from 'date-fns';

/**
 * Get all available resources/assets across the university
 */
export const getAllResources = async (universityId: string) => {
  return prisma.resource.findMany({
    where: { universityId },
    include: {
      bookings: {
        where: {
          endTime: { gte: new Date() },
          status: 'APPROVED'
        },
        take: 5
      }
    }
  });
};

/**
 * Check if a resource is available for a given time range
 * Cross-references with:
 * 1. TimetableSlot (Static classes)
 * 2. ResourceBooking (Dynamic research reservations)
 */
export const checkAvailability = async (
  resourceId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
) => {
  // 1. Check for overlapping dynamic bookings
  const overlappingBookings = await prisma.resourceBooking.findMany({
    where: {
      resourceId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      status: { in: ['PENDING', 'APPROVED'] },
      OR: [
        {
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      ],
    },
  });

  if (overlappingBookings.length > 0) {
    return {
      available: false,
      reason: 'Conflict with an existing research reservation.',
      conflicts: overlappingBookings,
    };
  }

  // 2. Check for overlapping timetable slots (Classes)
  const dayOfWeek = getDay(startTime); // 0 (Sun) - 6 (Sat)
  const requestedStartStr = format(startTime, 'HH:mm');
  const requestedEndStr = format(endTime, 'HH:mm');

  const timetableSlots = await prisma.timetableSlot.findMany({
    where: {
      roomId: resourceId,
      dayOfWeek: dayOfWeek,
    },
  });

  const timetableConflict = timetableSlots.find((slot) => {
    // Basic string comparison works for HH:mm format
    return slot.startTime < requestedEndStr && slot.endTime > requestedStartStr;
  });

  if (timetableConflict) {
    return {
      available: false,
      reason: 'Conflict with a scheduled academic class.',
      conflicts: [timetableConflict],
    };
  }

  return { available: true };
};

/**
 * Create a new resource booking
 */
export const createBooking = async (userId: string, data: {
  resourceId: string;
  grantId?: string;
  startTime: Date;
  endTime: Date;
  purpose: string;
}) => {
  const availability = await checkAvailability(data.resourceId, data.startTime, data.endTime);
  
  if (!availability.available) {
    throw new Error(availability.reason);
  }

  // Check if resource requires approval
  const resource = await prisma.resource.findUnique({
    where: { id: data.resourceId }
  });

  if (!resource) throw new Error('Resource not found');

  return prisma.resourceBooking.create({
    data: {
      resourceId: data.resourceId,
      userId,
      grantId: data.grantId,
      startTime: data.startTime,
      endTime: data.endTime,
      purpose: data.purpose,
      status: resource.requiresApproval ? 'PENDING' : 'APPROVED',
    },
    include: {
      resource: true
    }
  });
};

/**
 * Get bookings for a specific user
 */
export const getMyBookings = async (userId: string) => {
  return prisma.resourceBooking.findMany({
    where: { userId },
    include: {
      resource: {
        select: {
          name: true,
          type: true,
          building: true,
          floor: true
        }
      },
      grant: {
        select: {
          title: true
        }
      }
    },
    orderBy: { startTime: 'desc' }
  });
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (bookingId: string, userId: string) => {
  const booking = await prisma.resourceBooking.findUnique({
    where: { id: bookingId }
  });

  if (!booking || booking.userId !== userId) {
    throw new Error('Booking not found or unauthorized');
  }

  return prisma.resourceBooking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' }
  });
};
