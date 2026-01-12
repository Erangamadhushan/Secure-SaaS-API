import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword, isAccountLocked } from '../../services/auth.service.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';
import User from '../modules/user/user.model.js';
import AppError from "../utils/AppError.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import refreshTokenModel from '../modules/auth/refreshToken.model.js';

import { auditLogger, errorLogger } from '../utils/logger.js';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 5 * 60 * 1000; // 5 minutes

export const login = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password').lean();

        if (!user) {
            return next(new AppError("Invalid credentials", 401));
        }

        if (isAccountLocked(user)) {
            return next(
                new AppError(`Account is locked due to multiple failed login attempts. Please try again later.`, 423)
            )
        }

        const isValidPassword = await comparePassword(password, user.password);

        if (!isValidPassword) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;

            if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                user.isLocked = true;
                user.lockUntil = Date.now() + LOCK_TIME;
                await User.updateOne({ _id: user._id }, { isLocked: user.isLocked, lockUntil: user.lockUntil, loginAttempts: user.loginAttempts });
                return next(
                    new AppError(`Account is locked due to multiple failed login attempts. Please try again later.`, 423)
                );
            }

            await User.updateOne({ _id: user._id }, { loginAttempts: user.loginAttempts });
            return next(new AppError("Invalid credentials", 401));
        }

        const accessToken = await generateAccessToken({ id: user._id, role: user.role });

        const refreshToken = await generateRefreshToken({ id: user._id });

        await refreshTokenModel.create({
            user: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7*24*60*60*1000) // 7 days
        });

        auditLogger.info('User logged in successfully', {
            userId: user._id,
            email: user.email,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        });


        // Reset login attempts on successful login
        user.loginAttempts = 0;
        user.isLocked = false;
        user.lockUntil = null;
        await User.updateOne({ _id: user._id }, { loginAttempts: 0, isLocked: false, lockUntil: null });
        
        res
        .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })
        .status(200)
        .json({
            success: true,
            message: "Login successful",
            data: {
                accessToken
            }
        });

        return ;
        
    }
    catch (error) {
        auditLogger.warn('Login failed', {
            error: error.message,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });

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

        if (!user) {
            return next(new AppError("User registration failed", 400));
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user
        });

    } catch (error) {
        return next(new AppError("Server error", 500));
    }
});

export const logout = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return next(new AppError("Refresh token is required", 400));
    }

    await refreshTokenModel.findOneAndDelete({ token: refreshToken });

    auditLogger.info('User logged out successfully', {
        token: refreshToken,
        refreshTokenUsed: true,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    res
    .clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    })
    .status(200)
    .json({
        success: true,
        message: "Logged out successfully"
    });
});

export const logoutAllSessions = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    await refreshTokenModel.deleteMany({ user: userId });

    auditLogger.info('User logged out from all sessions', {
        userId: userId,
        allSessions: true,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    return res.status(200).json({
        success: true,
        message: "Logged out from all sessions successfully"
    });
});
