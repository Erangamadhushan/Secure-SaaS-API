import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // limit each IP to 5 login requests per windowMs
    message: {
        success: false,
        message: "Too many login attempts from this IP, please try again later.",
        data: null
    }
});