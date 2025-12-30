import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword } from '../../services/auth.service.js';
import { generateAccessToken } from '../utils/token.js';
import User from '../modules/user/user.model.js';
import AppError from "../utils/AppError.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(new AppError("Not authorized, token missing", 401));
    }

    try {
        const decoded = await jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: 'Not authorized, token invalid'
        })
    }
});

