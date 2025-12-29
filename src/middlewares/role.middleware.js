import AppError from "../utils/AppError.js";

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return AppError("Forbidden: You do not have permission to perform this action", 403);
        }
        next();
    }
}