import jwt from 'jsonwebtoken';
import RefreshToken from './refreshToken.model.js';
import asyncHandler from '../../middlewares/asyncHandler.js';
import AppError from '../../utils/AppError.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/token.js';

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const { refreshToken: incomingRefreshToken } = req.body;

    if (!incomingRefreshToken) {
        return next(new AppError("Refresh token is required", 401));
    }

    const storedToken = await RefreshToken.findOne({ token: incomingRefreshToken });

    if (!storedToken) {
        return next(new AppError("Invalid refresh token", 401));
    }

    let payload;

    try {
        payload = await jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        return next(new AppError("Invalid refresh token", 403));
    }

    // Rotate refresh token (for enhanced security)
    await storedToken.deleteOne();

    const newRefreshToken = await generateRefreshToken({ id: payload.id });
    await RefreshToken.create({
        user: payload.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7*24*60*60**1000)
    });

    const newAccessToken = await generateAccessToken({ id: payload.id });

    return res.status(200).json({
        success: true,
        data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }
    })

});