import jwt from 'jsonwebtoken';
import RefreshToken from './refreshToken.model.js';
import asyncHandler from '../../middlewares/asyncHandler.js';
import AppError from '../../utils/AppError.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/token.js';

import { appLogger } from '../../utils/logger.js';

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        console.log("No refresh token provided");
        return next(new AppError("Refresh token is required", 401));
    }
    //console.log("Incoming Refresh Token:", refreshToken);

    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken) {
        return next(new AppError("Invalid refresh token", 401));
    }

    let payload;

    try {
        payload = await jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        return next(new AppError("Invalid refresh token", 403));
    }

    // Rotate refresh token (for enhanced security)
    await storedToken.deleteOne();

    const newRefreshToken = await generateRefreshToken({ id: payload.id });
    await RefreshToken.create({
        user: payload.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7*24*60*60*1000)
    });

    appLogger.info('Refresh token rotated', {
        userId: payload.id,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    const newAccessToken = await generateAccessToken({ id: payload.id });

    res
    .cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    .status(200)
    .json({
        success: true,
        message: "Access token refreshed",
        data: {
            accessToken: newAccessToken
        }
    });

});