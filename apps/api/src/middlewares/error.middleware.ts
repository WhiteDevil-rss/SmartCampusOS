import { Request, Response, NextFunction } from 'express';
import { Prisma } from '../generated/client';
import { winstonLogger as logger } from '../lib/logger';

export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    // Log the error
    logger.error({
        message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        status
    });

    // Prisma specific errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                error: 'Conflict',
                message: 'A record with this value already exists.',
                field: err.meta?.target
            });
        }
        if (err.code === 'P2025') {
            // "An operation failed because it depends on one or more records that were not found."
            // Follow the 200/null rule for missing resources if it's a structural lookup
            return res.status(200).json(null);
        }
    }

    // Default error response
    res.status(status).json({
        error: err.name || 'Error',
        message: process.env.NODE_ENV === 'production' ? 'Uncaught server exception' : message
    });
};

export class AppError extends Error {
    constructor(public message: string, public status: number = 500) {
        super(message);
        this.name = 'AppError';
    }
}
