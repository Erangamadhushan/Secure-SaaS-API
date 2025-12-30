import AppError from "../utils/AppError.js";
import { errorLogger } from "../utils/logger.js";

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            errorLogger.error('Forbidden access attempt', {
                userId: req.user._id,
                role: req.user.role,
                path: req.originalUrl,
            });
            return next(new AppError("Forbidden: You do not have permission to perform this action", 403));
        }
        next();
    }
}