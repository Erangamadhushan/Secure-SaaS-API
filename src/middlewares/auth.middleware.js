import jwt from 'jsonwebtoken';
import User from '../modules/user/user.model.js';
import AppError from "../utils/AppError.js";
import asyncHandler from "../middlewares/asyncHandler.js";

import { auditLogger } from '../utils/logger.js';

export const protect = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        auditLogger.warn('Unauthorized access attempt', {
            ip: req.ip,
            path: req.originalUrl,
            attemptedAt: new Date().toISOString()
        });
        return next(new AppError("Not authorized, token missing", 401));
    }

    try {
        const decoded = await jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    }
    catch (error) {
        auditLogger.warn('Invalid token access attempt', {
            ip: req.ip,
            path: req.originalUrl,
            attemptedAt: new Date().toISOString()
        });
        return next(new AppError("Not authorized, token missing", 401));
    }

});

