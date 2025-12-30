import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword } from '../../services/auth.service.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';
import User from '../modules/user/user.model.js';
import AppError from "../utils/AppError.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import refreshTokenModel from '../modules/auth/refreshToken.model.js';


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

        const refreshToken = await generateRefreshToken({ id: user._id });

        await refreshTokenModel.create({
            user: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7*24*60*60*1000) // 7 days
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                refreshToken
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