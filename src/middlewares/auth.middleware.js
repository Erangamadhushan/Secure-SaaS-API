import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword } from '../../services/auth.service.js';
import { generateAccessToken } from '../utils/token.js';
import User from '../models/user/user.model.js';
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

export const login = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(new AppError("Invalid credentials", 401));
        }

        const isValidPassword = await comparePassword(password, user.password);

        if (!isValidPassword) {
            return next(new AppError("Invalid credentials", 401));
        }

        const token = await generateAccessToken({ id: user._id, role: user.role });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token
            }
        });
    }
    catch (error) {
        return next(new AppError("Server error", 500));
            
    }
});

export const register = asyncHandler(async (req,res) => {
    try {
        const { email, password, role } = req.body;

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            email,
            password: hashedPassword,
            role
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user
        });

    } catch (error) {
        return next(new AppError("Server error", 500));
    }
});