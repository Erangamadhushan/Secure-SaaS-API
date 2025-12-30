import AppError from "../utils/AppError.js";
import { auditLogger } from "../utils/logger.js";

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            auditLogger.warn('Forbidden access attempt', {
                userId: req.user._id,
                role: req.user.role,
                path: req.originalUrl,
                attemptedAt: new Date().toISOString()
            });
            return next(new AppError("Forbidden: You do not have permission to perform this action", 403));
        }
        next();
    }
}