import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS), // 15 minutes at default
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS), // limit each IP to 500 requests per windowMs
    message: {
        success: false,
        message: "Too many requests from this IP, please try again later.",
        data: null
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export default rateLimiter;